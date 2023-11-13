
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

cred = credentials.Certificate("smart-recipe-fc34a-683187902a40.json")
app =firebase_admin.initialize_app(cred)
db = firestore.client()

users_ref = db.collection(u'recipes')
docs = users_ref.stream()

for doc in docs:
    print(f'{doc.id} => {doc.to_dict()}')