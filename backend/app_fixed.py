from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import os
from datetime import datetime
from dotenv import load_dotenv
import hashlib
import re

load_dotenv()

app = Flask(__name__)

@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

# MongoDB connection
MONGO_URI = os.getenv('MONGODB_URI', "mongodb+srv://jobportal_user:jovinithin_123@jobportal.pnp4szn.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Jobportal")

try:
    client = MongoClient(MONGO_URI)
    db = client.jobportal
    client.admin.command('ping')
    print("[SUCCESS] Connected to MongoDB Atlas")
except Exception as e:
    print(f"[ERROR] MongoDB connection failed: {e}")
    client = None
    db = None

def check_db_connection():
    if not client or not db:
        return False, "Database not connected"
    try:
        client.admin.command('ping')
        return True, "Database connected"
    except Exception as e:
        return False, str(e)

@app.route('/api/test')
def test_connection():
    connected, message = check_db_connection()
    return jsonify({"status": "success" if connected else "error", "message": message})

if __name__ == '__main__':
    app.run(debug=True, port=5000)