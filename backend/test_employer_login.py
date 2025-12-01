#!/usr/bin/env python3
"""
Quick test script to verify employer login functionality
"""
import os
import requests
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

def test_backend_server():
    """Test if Flask server is running"""
    try:
        response = requests.get('http://localhost:5000/api/health', timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running")
            return True
        else:
            print(f"❌ Backend server error: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend server is not running")
        print("   Start it with: python run.py")
        return False
    except Exception as e:
        print(f"❌ Backend server test failed: {e}")
        return False

def test_mongodb_connection():
    """Test MongoDB Atlas connection"""
    try:
        MONGO_URI = os.getenv('MONGODB_URI')
        if not MONGO_URI:
            print("❌ MONGODB_URI not found in .env")
            return False
            
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("✅ MongoDB Atlas connection successful")
        
        # Test database access
        db = client.jobportal
        user_count = db.users.count_documents({})
        employer_count = db.users.count_documents({"userType": "employer"})
        
        print(f"   Total users: {user_count}")
        print(f"   Employers: {employer_count}")
        
        return True, db
        
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False, None

def test_employer_login_api():
    """Test employer login API endpoint"""
    try:
        # Test with a sample employer login
        login_data = {
            "email": "test@company.com",
            "password": "testpass"
        }
        
        response = requests.post(
            'http://localhost:5000/api/login',
            json=login_data,
            timeout=10
        )
        
        print(f"Login API response status: {response.status_code}")
        
        if response.status_code == 401:
            print("✅ Login API is working (user not found - expected)")
            return True
        elif response.status_code == 200:
            result = response.json()
            print(f"✅ Login successful: {result}")
            return True
        else:
            print(f"❌ Login API error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Login API test failed: {e}")
        return False

def create_test_employer(db):
    """Create a test employer account"""
    try:
        import hashlib
        
        test_employer = {
            "email": "employer@test.com",
            "password": hashlib.sha256("password123".encode()).hexdigest(),
            "userType": "employer",
            "fullName": "Test Employer",
            "companyName": "Test Company",
            "companySize": "1-50",
            "industry": "Technology",
            "created_at": "2024-01-01T00:00:00Z",
            "profile_completed": True
        }
        
        # Check if employer already exists
        existing = db.users.find_one({"email": "employer@test.com"})
        if existing:
            print("✅ Test employer already exists")
            return True
            
        # Create test employer
        result = db.users.insert_one(test_employer)
        print(f"✅ Test employer created with ID: {result.inserted_id}")
        print("   Email: employer@test.com")
        print("   Password: password123")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to create test employer: {e}")
        return False

def test_employer_login_with_test_account():
    """Test login with the test employer account"""
    try:
        login_data = {
            "email": "employer@test.com",
            "password": "password123"
        }
        
        response = requests.post(
            'http://localhost:5000/api/login',
            json=login_data,
            timeout=10
        )
        
        print(f"Test employer login status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            user_type = result.get('user', {}).get('userType')
            print(f"✅ Test employer login successful!")
            print(f"   User type: {user_type}")
            print(f"   Company: {result.get('user', {}).get('companyName')}")
            return True
        else:
            print(f"❌ Test employer login failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test employer login error: {e}")
        return False

if __name__ == '__main__':
    print("Testing Employer Login Functionality")
    print("=" * 50)
    
    # Test 1: Backend server
    server_ok = test_backend_server()
    
    # Test 2: MongoDB connection
    if server_ok:
        db_ok, db = test_mongodb_connection()
        
        # Test 3: Login API
        if db_ok:
            api_ok = test_employer_login_api()
            
            # Test 4: Create test employer
            if api_ok:
                test_employer_created = create_test_employer(db)
                
                # Test 5: Login with test employer
                if test_employer_created:
                    test_employer_login_with_test_account()
    
    print("\n" + "=" * 50)
    print("To fix employer login issues:")
    print("1. Start backend: python run.py")
    print("2. Check MongoDB connection in .env")
    print("3. Use test account: employer@test.com / password123")