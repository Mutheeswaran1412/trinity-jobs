from flask import Flask, request, jsonify
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import hashlib
from datetime import datetime

load_dotenv()

app = Flask(__name__)

# CORS headers
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
        return response

# MongoDB connection
MONGO_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGO_URI)
db = client.jobportal

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('fullName')
        user_type = data.get('userType', 'jobseeker')
        
        # Check if user exists
        if db.users.find_one({"email": email}):
            return jsonify({"error": "User already exists"}), 409
        
        # Create user
        user_data = {
            "email": email,
            "password": hash_password(password),
            "fullName": full_name,
            "userType": user_type,
            "created_at": datetime.utcnow()
        }
        
        result = db.users.insert_one(user_data)
        return jsonify({
            "id": str(result.inserted_id),
            "message": "User registered successfully",
            "userType": user_type
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"status": "success", "message": "Server running"})

if __name__ == '__main__':
    print("Server starting on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)