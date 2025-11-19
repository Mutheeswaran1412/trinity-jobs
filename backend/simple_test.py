import os
import requests
from dotenv import load_dotenv
from pymongo import MongoClient
import hashlib

load_dotenv()

def test_employer_login():
    print("Testing Employer Login")
    print("=" * 30)
    
    # Test 1: Backend server
    try:
        response = requests.get('http://localhost:5000/api/health', timeout=5)
        if response.status_code == 200:
            print("Backend server: OK")
        else:
            print("Backend server: ERROR")
            return
    except:
        print("Backend server: NOT RUNNING")
        print("Start with: python run.py")
        return
    
    # Test 2: MongoDB
    try:
        MONGO_URI = os.getenv('MONGODB_URI')
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        db = client.jobportal
        print("MongoDB: OK")
        
        employers = db.users.count_documents({"userType": "employer"})
        print(f"Employers in DB: {employers}")
        
        # Create test employer if none exist
        if employers == 0:
            test_employer = {
                "email": "admin@trinity.com",
                "password": hashlib.sha256("admin123".encode()).hexdigest(),
                "userType": "employer",
                "fullName": "Trinity Admin",
                "companyName": "Trinity Technology",
                "created_at": "2024-01-01",
                "profile_completed": True
            }
            
            result = db.users.insert_one(test_employer)
            print("Test employer created")
            print("Email: admin@trinity.com")
            print("Password: admin123")
        
    except Exception as e:
        print(f"MongoDB: ERROR - {e}")
        return
    
    # Test 3: Login API
    try:
        login_data = {
            "email": "admin@trinity.com",
            "password": "admin123"
        }
        
        response = requests.post(
            'http://localhost:5000/api/login',
            json=login_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            user_type = result.get('user', {}).get('userType')
            print(f"Login test: SUCCESS")
            print(f"User type: {user_type}")
        else:
            print(f"Login test: FAILED - {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"Login test: ERROR - {e}")

if __name__ == '__main__':
    test_employer_login()