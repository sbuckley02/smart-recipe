import json
from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import create_access_token,get_jwt,get_jwt_identity, \
                               unset_jwt_cookies, jwt_required, JWTManager
from flask_cors import CORS
import hashlib
import requests
from queue import PriorityQueue


from dotenv import load_dotenv
import os
load_dotenv()

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "secret"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

def db_connect():
    cred = credentials.Certificate("../smart-recipe-db/smart-recipe-fc34a-683187902a40.json")
    app =firebase_admin.initialize_app(cred)
    db = firestore.client()
    return db

db = db_connect()

# API endpoint to verify user's login
@app.route('/api/login', methods=['POST'])
def login():
    email = request.json.get('email', None)
    password = request.json.get('password', None)

    if not email or not password:
        return jsonify({'loginSuccessful': False, 'message': 'Please specify email and password as body parameters'})

    pass_hash = hashlib.sha256()
    pass_hash.update(password.encode('UTF-8'))
    password_hash = pass_hash.hexdigest()

    doc_ref = db.collection('users').document(email)
    doc = doc_ref.get()
    if doc.exists:
        stored_password_hash = doc.to_dict()['password-hash']
        if (password_hash == stored_password_hash):
            # TODO finish
            access_token = create_access_token(identity=email)
            response = {'loginSuccessful': True, "access_token":access_token}
        else:
            return jsonify({'loginSuccessful': False, 'message': 'Password invalid'})
    else:
        return jsonify({'loginSuccessful': False, 'message': 'User does not exist'})


    return response

#API endpoint to log out
@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response

@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token 
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response

# API endpoint to create new user
@app.route('/api/create-user', methods=['POST'])
def create_user():
    email = request.json.get('email', None)
    password = request.json.get('password', None)
    first_name = request.json.get('firstName', None)
    last_name = request.json.get('lastName', None)

    if not email or not password or not first_name or not last_name:
        return jsonify({'creationSuccessful': False, 'message': 'Please specify email, password, and name body parameters at minimum'})
    
    pass_hash = hashlib.sha256()
    pass_hash.update(password.encode('UTF-8'))
    password_hash = pass_hash.hexdigest()
    
    data = {
        'first-name': first_name,
        'last-name': last_name,
        'email': email,
        'password-hash': password_hash
    }
    db.collection('users').document(email).set(data)

    access_token = create_access_token(identity=email)
    response = {'creationSuccessful': True, "accessToken":access_token}
	
    return jsonify(response)

@app.route('/api/get-user', methods=['GET'])
def get_user():
    email = request.args.get('email', None)
    if not email:
         return jsonify({'success': False, 'message': 'Please specify email'})
    user_doc = db.collection('users').document(email).get()

    if user_doc.exists:
        user_data = user_doc.to_dict()
        del user_data['password-hash']
        return jsonify({'success': True, 'data': user_data})
    else:
        return jsonify({'success': False, 'message': 'User does not exist'})

# Ignore this for now
@app.route('/api/update-user-name', methods=['PUT'])
def update_user_name():
    email = request.args.get('email', None)
    new_first_name = request.args.get('first_name', None)
    new_last_name = request.args.get('last_name', None)
    if not email or not new_first_name or not new_last_name:
        return jsonify({'success': False, 'message': 'Please specify email, first name, and last name'})
    
    user_doc = db.collection('users').document(email)
    user_doc.update({'first-name': new_first_name, 'last-name': new_last_name})
    return jsonify({'success': True})

# Ignore this for now
@app.route('/api/update-dem-info', methods=['PUT'])
def update_user_dem_info():
    email = request.args.get('email', None)
    height = request.args.get('height', None)
    weight = request.args.get('weight', None)
    age = request.args.get('age', None)
    gender = request.args.get('gender', None)
    if not email or not height or not weight or not age or not gender:
        return jsonify({'success': False, 'message': 'Please specify email, height, weight, age, and gender'})
    
    height = int(height)
    weight = int(weight)
    age = int(age)

    user_doc = db.collection('users').document(email)
    user_doc.update({
        'height': height, 'weight': weight,
        'age': age, 'gender': gender
    })
    return jsonify({'success': True})



# From a searched term, get a list of foods/ingredients
# Via the Edamam Food Database API (https://developer.edamam.com/food-database-api-docs)
# Input (query parameter):
#   search_term - the term to search
# Output: a list of foods (with names, IDs, and anything else important)
@app.route('/api/get-foods', methods=['GET'])
def get_foods():
    search_term = request.args.get('search_term', None)
    if not search_term:
        return jsonify({'success': False, 'message': 'Please specify search term'})
    
    EDAMAM_APP_ID = os.environ.get("EDAMAM_APP_ID")
    EDAMAM_APP_KEY = os.environ.get("EDAMAM_APP_KEY")
    base_url = 'https://api.edamam.com/api/food-database/v2'
    parser_url = f'{base_url}/parser?app_id={EDAMAM_APP_ID}&app_key={EDAMAM_APP_KEY}&ingr={search_term}'

    api_resp = requests.get(parser_url)
    resp_data = api_resp.json()['hints']

    return jsonify({'success': True, 'data': resp_data})

# TODO (for later) - get detailed nutritional info for a food
# The basic request gives carbs, fat, protein, and fiber
@app.route('/api/get-nutrition-data', methods=['GET'])
def get_nutrition_data():
    food_id = request.args.get('food_id', None)
    measure_uri = request.args.get('measure_uri', None)
    quantity = request.args.get('quantity', None)

    if not food_id or not measure_uri or not quantity:
        return jsonify({'success': False, 'message': 'Please specify ID of food/ingredient, quantity, and measure URI'})
    
    quantity = int(quantity)

    EDAMAM_APP_ID = os.environ.get("EDAMAM_APP_ID")
    EDAMAM_APP_KEY = os.environ.get("EDAMAM_APP_KEY")

    req_body = {'ingredients': [{
        'foodId': food_id,
        'measureURI': measure_uri,
        "quantity": 2
    }]}
    req_headers = {'Content-type': 'application/json', 'Accept': 'text/plain'}
    
    base_url = 'https://api.edamam.com/api/food-database/v2'
    parser_url = f'{base_url}/nutrients?app_id={EDAMAM_APP_ID}&app_key={EDAMAM_APP_KEY}'

    api_resp = requests.post(parser_url, data=json.dumps(req_body), headers=req_headers)
    resp_data = api_resp.json()

    return jsonify({'success': True, 'data': resp_data})


# TODO - Store a user's diet information in the database as well as overage/deficiency calculations
# Input:
#   email - a user's email/ID
#   food_list - a list of food IDs within a user's diet
@app.route('/api/set-user-diet', methods=['POST'])
def set_diet():
    email = request.json.get('email', None)
    meal_list = request.json.get('mealList', None)
    db.collection('users').document(email).set({
        "recipes":meal_list
    }, merge=True)
    return {
        'success': True
    }

@app.route('/api/get-user-diet', methods=['GET'])
def get_diet():
    email = request.args.get('email')
    user_doc = db.collection('users').document(email).get()
    if user_doc.exists:
        data = user_doc.to_dict()
        recipe_data = data['recipes']
        meals = separate_meals(email)
        meal_vals = [meal[1] for meal in meals]
        nut_vals = get_weekly_nutrients(meal_vals)
        return jsonify({'success': True, 'data': recipe_data, 'nutrition': nut_vals})
    else:
        print(f'no doc exists with username {email}')
        return jsonify({'success': False, 'message': 'Invalid email'})

# TODO - Get a list recommendations of new recipes, strictly based on improving diet
# Input:
#   email - a user's email/ID
# Output: a list of recipe recommendations (names, ingredients, URLs, etc.)
@app.route('/api/new-recipe-rec', methods=['GET'])
def new_recipe_rec():
    email = request.args.get('email', None)
    meals = separate_meals(email)
    meal_vals = [meal[1] for meal in meals]
    values = get_weekly_nutrients(meal_vals)
    total_vals = values
    lowest_val_meal = meals[0]
    lowest_val_meal_key = ''
    lowest_val = -1
    for m_key,m in meals:
        curr_val = calc_recipe_score(m, values)
        if curr_val > lowest_val:
            lowest_val = curr_val
            lowest_val_meal = m
            lowest_val_meal_key = m_key
    for flist in lowest_val_meal:
            values[2] = 1 + flist['nutrients']['PROCNT']['quantity']
            values[1] = 1 + flist['nutrients']['FAT']['quantity']
            values[0] = 1 + flist['nutrients']['CHOCDF']['quantity']
    

    recipe = find_recipe(values, lowest_val_meal, total_vals)
    return jsonify({'success': True, 'data': recipe, 'replace-meal': lowest_val_meal_key})

@app.route('/api/new-recipe-rec-ingredient', methods=['GET'])
def new_recipe_rec_ingredient():
    email = request.args.get('email', None)
    meals = separate_meals(email)
    # print(f'meals: {meals}')
    meal_vals = [meal[1] for meal in meals]
    values = get_weekly_nutrients(meal_vals)
    lowest_val_meal = meals[0]
    lowest_val = -1
    lowest_val_meal_key = ''
    for m_key,m in meals:
        curr_val = calc_recipe_score(m, values)
        # print(f'val: {curr_val}')
        if curr_val > lowest_val and len(m) > 0:
            lowest_val = curr_val
            lowest_val_meal = m
            lowest_val_meal_key = m_key
    ingredients = []
    # print(f'low meal: {lowest_val_meal}')
    for flist in lowest_val_meal:
        foodName = flist["label"]
        foodName = foodName.lower()
        foodName = ''.join(e for e in foodName if e.isalnum())
        ingredients.append(foodName)
        # ingredients.append(flist['foodId'])
        values[2] = 1 + flist['nutrients']['PROCNT']['quantity']
        values[1] = 1 + flist['nutrients']['FAT']['quantity']
        values[0] = 1 + flist['nutrients']['CHOCDF']['quantity']
    recipe = find_ingred_recipe(values, ingredients)
    return jsonify({'success': True, 'data': recipe, 'replace-meal': lowest_val_meal_key})

#calculates the score of a meal
def calc_recipe_score(meal, values, total=False):
    protein_score,carb_score,fat_score = 0,0,0
    protein_weight,carb_weight,fat_weight = .4,.3,.3
    protein, carbs, fat = 0,0,0
    weekly_fat = 78*7
    weekly_protein = 50*7
    weekly_carbs = 275*7
    for flist in meal:
        if total:
            protein += flist['totalNutrients']['PROCNT']['quantity']
            fat += flist['totalNutrients']['FAT']['quantity']
            carbs += flist['totalNutrients']['CHOCDF']['quantity']
        else:
            protein += flist['nutrients']['PROCNT']['quantity']
            fat += flist['nutrients']['FAT']['quantity']
            carbs += flist['nutrients']['CHOCDF']['quantity']
    carb_score = max(values[0]/weekly_carbs, 1) - max((values[0] - carbs)/weekly_carbs, 1)
    fat_score = max(values[1]/weekly_fat, 1) - max((values[1] - fat)/weekly_fat, 1)
    protein_score = min(values[2]/weekly_protein, 1) - min((values[2] - protein)/weekly_protein, 1)
    protein_score = 1 - protein_score
    return protein_score*protein_weight+carb_score*carb_weight+fat_score*fat_weight
#Parses the JSON containing each meals data into meals
def separate_meals(email):
    meals = []
    doc_ref = db.collection('users').document(email)
    doc = doc_ref.get()
    if doc.exists:
        recipes = doc.to_dict()['recipes']
        # print(f'recipes: {recipes}')
        # days = json.loads(recipies)
        days = recipes
        if isinstance(days, dict):
            days = days.values()
        for d in days:
            daily_meals = d['meals']
            # for m in daily_meals.values():
            for m_key in daily_meals.keys():
                m = daily_meals[m_key]
                meals.append((m_key,m))
    return meals
def get_weekly_nutrients(meals):
    total_protein = 0
    total_fat = 0
    total_carbs = 0
    for meal in meals:

        for flist in meal:
            total_protein += flist['nutrients']['PROCNT']['quantity']
            total_fat += flist['nutrients']['FAT']['quantity']
            total_carbs += flist['nutrients']['CHOCDF']['quantity']
    return [total_carbs, total_fat, total_protein]
#Gets 5 recipes that have the at least as many macros as the lowest scoring + 1
def find_recipe(values, replaced_meal, total_vals):
    # url = 'https://api.spoonacular.com/recipes/complexSearch?query=minCarbs='+ str(round(values[0])) + '&minFat=' + str(round(values[1])) + '&minProtein='+str(round(values[2])) + '&number=5'
    # api_key = os.environ.get("SPOON_API_KEY")
    # url += f'&apiKey={api_key}'

    #  base_url = 'https://api.edamam.com/api/food-database/v2'
    # parser_url = f'{base_url}/parser?app_id={EDAMAM_APP_ID}&app_key={EDAMAM_APP_KEY}&ingr={search_term}'

    carb_val,fat_val,protein_val = values
    app_id = os.environ.get("SPOON_APP_ID")
    app_key = os.environ.get("SPOON_APP_KEY")
    url = f'https://api.edamam.com/api/recipes/v2?app_id={app_id}&app_key={app_key}&type=public'
    url += f'&nutrients%5BFAT%5D={fat_val}&nutrients%5BCHOCDF%5D={carb_val}&nutrients%5BPROCNT%5D={protein_val}%2B'


    r = requests.get(url)
    data = r.json()

    recipes = data["hits"]
    sorted_recipes = PriorityQueue()
    for r in recipes:
        # r = r['recipe']['totalNutrients']
        # r_vals = [r['PROCNT']['quantity'], r['FAT']['quantity'], r['CHOCDF']['quantity']]
        # print(f'r vals: {r_vals}')
        new_r = [r['recipe']]
        recipe_score = calc_recipe_score(new_r, values, total=True)
        sorted_recipes.put((recipe_score, id(r), r))
    
    recipe_list = []
    while (sorted_recipes.qsize() > 0):
        recipe_list.append(sorted_recipes.get()[2])
    data["hits"] = recipe_list

    return data

def find_ingred_recipe(values, ingredients):
    # url = 'https://api.spoonacular.com/recipes/complexSearch?query=minCarbs='+ str(round(values[0])) + '&minFat=' + str(round(values[1])) + '&minProtein='+str(round(values[2])) + '&number=5'
    # api_key = os.environ.get("SPOON_API_KEY")
    # url += f'&apiKey={api_key}'
    #  base_url = 'https://api.edamam.com/api/food-database/v2'
    # parser_url = f'{base_url}/parser?app_id={EDAMAM_APP_ID}&app_key={EDAMAM_APP_KEY}&ingr={search_term}'
    carb_val,fat_val,protein_val = values
    carb_val = max(carb_val, 275)
    fat_val = max(fat_val, 78)
    protein_val /= 7
    app_id = os.environ.get("SPOON_APP_ID")
    app_key = os.environ.get("SPOON_APP_KEY")
    url = f'https://api.edamam.com/api/recipes/v2?app_id={app_id}&app_key={app_key}&type=public'
    url += f'&nutrients%5BFAT%5D={fat_val}&nutrients%5BCHOCDF%5D={carb_val}&nutrients%5BPROCNT%5D={protein_val}%2B'
    r = requests.get(url)
    data = r.json()
    recipes = data["hits"]
    sorted_recipes = PriorityQueue()
    for r in recipes:
        count = 0
        ing = r['recipe']["ingredients"]
        for i in ing:
            foodName = i["food"]
            foodName = foodName.lower()
            foodName = ''.join(e for e in foodName if e.isalnum())
            # print(foodName)
            if foodName in ingredients:
            # if i["foodId"] in ingredients:
                count+=1
        ing_score = 1 - ((count/len(ing)))
        total_score = ing_score
        sorted_recipes.put((total_score, id(r), r))
    recipe_list = []
    while (sorted_recipes.qsize() > 0):
        recipe_list.append(sorted_recipes.get()[2])
    data["hits"] = recipe_list
    return data