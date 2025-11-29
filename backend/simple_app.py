from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import os
from datetime import datetime
from dotenv import load_dotenv
import hashlib
import re

load_dotenv()

app = Flask(__name__)
CORS(app, origins="*", allow_headers=["Content-Type"], methods=["GET", "POST", "OPTIONS"])

# MongoDB connection
MONGO_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGO_URI)
db = client.jobportal

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"status": "success", "message": "Connected to MongoDB Atlas"})

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    # Check if user exists
    if db.users.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 409
    
    # Create user
    user_data = {
        "email": email,
        "password": hash_password(password),
        "fullName": data.get('fullName', ''),
        "userType": data.get('userType', 'jobseeker'),
        "created_at": datetime.utcnow()
    }
    
    result = db.users.insert_one(user_data)
    return jsonify({"id": str(result.inserted_id), "message": "User registered successfully"})

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = db.users.find_one({"email": email})
    if not user or user['password'] != hash_password(password):
        return jsonify({"error": "Invalid credentials"}), 401
    
    return jsonify({
        "message": "Login successful",
        "user": {
            "id": str(user['_id']),
            "email": user['email'],
            "fullName": user.get('fullName', ''),
            "userType": user.get('userType', 'jobseeker')
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)