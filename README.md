# smart-recipe

## Overview
*smart-recipe* is a web application aimed to help users make small, but powerful improvements to their diet. First, users input their typical diet. Then, *smart-recipe* recommends new recipes and associated changes to users' diets.

## About Us
This website was created by Stephen Buckley and Dylan Yost, students at Georgia Tech who created this application for our enterprise computing class. We can be contacted at sbuckley@gatech.edu and dyost6@gatech.edu respectively.

## Installation Instructions
Please use the following instructions to run *smart-recipe* locally.

### Cloning This Repository
You'll first want to clone this repository by running `https://github.gatech.edu/sbuckley31/smart-recipe.git` in your terminal window

### Software to Install
You'll need Node.js installed, which should come with npm (https://nodejs.org/en/download). You'll also need Python3 installed. For Python, you'll need to install the following packages with pip: `Flask`, `firebase_admin`, `flask_jwt_extended`, `datetime`, `flask_cors`, `requests`, `hashlib`, and `python-dotenv`.

### Running Front-End Locally
In a terminal window, go to the `smart-recipe-client` directory. To install npm packages the first time you run it, run `npm install`. Then, you can run `npm start` to run the React application locally

### Setting Up Cloud Firestore Database
To connect to our Cloud Firestore database, you'll need access to put the `smart-recipe-fc34a-683187902a40.json` file inside of the `smart-recipe-db` directory. We cannot put this file on the GitHub for obvious reasons, so reach out to us if you need access to it. Alternatively, you can set up your own Cloud Firestore database. You can follow the instructions here to do so: https://firebase.google.com/docs/firestore/quickstart. You'll want to generate a JSON authentication file and name it `smart-recipe-fc34a-683187902a40.json` for it to work. You'll also want to make sure you have a `users` and `recipes` collections in your database.

### Env File
You will need to add a `.env` file to the `smart-recipe-server` directory in order to gain access to the APIs we use. The file is structured like:
```
EDAMAM_APP_ID="SECRET"
EDAMAM_APP_KEY="SECRET"
SPOON_APP_ID="SECRET"
SPOON_APP_KEY="SECRET"
```

Reach out to us if you want access to this file. Or, you can sign up for the API yourself at https://www.edamam.com. The `EDAMAM_APP_ID` and `EDAMAM_APP_KEY` refer to the Nutrition Analysis API, while the other two refer to the Recipe Search API.

### Running Back-End Locally
In a different terminal window from the one the client is running in, go to the `smart-recipe-server` directory. Make sure all necessary Python packages are installed (as listed above). Then, you can run `flask run` to start the server