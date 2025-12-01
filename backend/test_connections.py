#!/usr/bin/env python3
import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient
import requests

# Load environment variables
load_dotenv()

def test_mongodb():
    """Test MongoDB Atlas connection"""
    print('=== Testing MongoDB Connection ===')
    try:
        MONGO_URI = os.getenv('MONGODB_URI')
        if not MONGO_URI:
            print('❌ MONGODB_URI not found in .env file')
            return False
            
        print(f'MongoDB URI: {MONGO_URI[:50]}...')
        
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print('✅ MongoDB Atlas connection successful!')
        
        # Test database access
        db = client.jobportal
        collections = db.list_collection_names()
        print(f'Available collections: {collections}')
        
        # Test basic operations
        test_doc = {"test": "connection", "timestamp": "2024"}
        result = db.test_collection.insert_one(test_doc)
        print(f'Test document inserted with ID: {result.inserted_id}')
        
        # Clean up test document
        db.test_collection.delete_one({"_id": result.inserted_id})
        print('Test document cleaned up')
        
        return True
        
    except Exception as e:
        print(f'❌ MongoDB connection failed: {e}')
        return False

def test_mistral_ai():
    """Test Mistral AI API connection"""
    print('\n=== Testing Mistral AI API ===')
    try:
        api_key = os.getenv('OPENROUTER_API_KEY')
        if not api_key:
            print('❌ OPENROUTER_API_KEY not found in .env file')
            return False
            
        print(f'API Key present: {bool(api_key)}')
        print(f'API Key starts with: {api_key[:20]}...')
        
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': 'mistralai/mistral-7b-instruct',
            'messages': [
                {'role': 'user', 'content': 'Hello, this is a test message for ZyncJobs chatbot'}
            ],
            'max_tokens': 50,
            'temperature': 0.7
        }
        
        print('Sending request to OpenRouter API...')
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers=headers,
            json=data,
            timeout=15
        )
        
        print(f'Response Status: {response.status_code}')
        
        if response.status_code == 200:
            result = response.json()
            print('✅ Mistral AI API is working!')
            print(f'Response: {result["choices"][0]["message"]["content"]}')
            return True
        else:
            print(f'❌ API Error: {response.status_code}')
            print(f'Error details: {response.text}')
            return False
            
    except Exception as e:
        print(f'❌ Mistral AI API test failed: {e}')
        return False

def test_flask_endpoints():
    """Test Flask server endpoints"""
    print('\n=== Testing Flask Server ===')
    try:
        # Test if server is running
        response = requests.get('http://localhost:5000/api/health', timeout=5)
        if response.status_code == 200:
            print('✅ Flask server is running!')
            
            # Test MongoDB connection endpoint
            response = requests.get('http://localhost:5000/api/test', timeout=5)
            if response.status_code == 200:
                print('✅ Database connection endpoint working!')
            else:
                print(f'❌ Database endpoint error: {response.status_code}')
                
            # Test chat endpoint
            chat_data = {"message": "Hello, test message"}
            response = requests.post('http://localhost:5000/api/chat', json=chat_data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                print('✅ Chat endpoint working!')
                print(f'Chat response: {result.get("response", "No response")}')
            else:
                print(f'❌ Chat endpoint error: {response.status_code}')
                
        else:
            print(f'❌ Flask server not responding: {response.status_code}')
            
    except requests.exceptions.ConnectionError:
        print('❌ Flask server is not running. Start it with: python run.py')
    except Exception as e:
        print(f'❌ Flask server test failed: {e}')

if __name__ == '__main__':
    print('ZyncJobs Backend Connection Test')
    print('=' * 40)
    
    # Test MongoDB
    mongodb_ok = test_mongodb()
    
    # Test Mistral AI
    mistral_ok = test_mistral_ai()
    
    # Test Flask endpoints (if server is running)
    test_flask_endpoints()
    
    print('\n' + '=' * 40)
    print('SUMMARY:')
    print(f'MongoDB Atlas: {"✅ Working" if mongodb_ok else "❌ Failed"}')
    print(f'Mistral AI API: {"✅ Working" if mistral_ok else "❌ Failed"}')
    print('\nTo start the backend server: python run.py')