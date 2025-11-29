#!/usr/bin/env python3
"""
Fix common employer login issues
"""
import os
import hashlib
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime

load_dotenv()

def fix_employer_login():
    """Fix employer login issues"""
    try:
        # Connect to MongoDB
        MONGO_URI = os.getenv('MONGODB_URI')
        if not MONGO_URI:
            print("❌ MONGODB_URI not found in .env file")
            return False
            
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client.jobportal
        
        # Test connection
        client.admin.command('ping')
        print("✅ Connected to MongoDB Atlas")
        
        # Check existing users
        total_users = db.users.count_documents({})
        employers = db.users.count_documents({"userType": "employer"})
        
        print(f"Database Status:")
        print(f"   Total users: {total_users}")
        print(f"   Employers: {employers}")
        
        # Create a test employer if none exist
        if employers == 0:
            print("\nCreating test employer account...")
            
            test_employer = {
                "email": "admin@trinity.com",
                "password": hashlib.sha256("admin123".encode()).hexdigest(),
                "userType": "employer",
                "fullName": "Trinity Admin",
                "companyName": "Trinity Technology Solutions",
                "companySize": "50-200",
                "industry": "Technology",
                "phone": "+1-555-0123",
                "created_at": datetime.utcnow(),
                "last_login": None,
                "profile_completed": True
            }
            
            result = db.users.insert_one(test_employer)
            print(f"Test employer created!")
            print(f"   Email: admin@trinity.com")
            print(f"   Password: admin123")
            print(f"   ID: {result.inserted_id}")
        
        # Fix any existing employers with wrong userType
        print("\nFixing userType inconsistencies...")
        
        # Find users with companyName but wrong userType
        wrong_type_users = db.users.find({
            "companyName": {"$exists": True, "$ne": ""},
            "userType": {"$ne": "employer"}
        })
        
        fixed_count = 0
        for user in wrong_type_users:
            db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"userType": "employer"}}
            )
            fixed_count += 1
            print(f"   Fixed user: {user.get('email')} -> userType: employer")
        
        if fixed_count > 0:
            print(f"Fixed {fixed_count} user(s) with wrong userType")
        else:
            print("No userType issues found")
        
        # Verify the fix
        employers_after = db.users.count_documents({"userType": "employer"})
        print(f"\nAfter fixes:")
        print(f"   Employers: {employers_after}")
        
        # List all employer accounts
        print(f"\nEmployer Accounts:")
        employer_list = db.users.find({"userType": "employer"}, {"email": 1, "companyName": 1, "fullName": 1})
        for emp in employer_list:
            print(f"   {emp.get('email')} - {emp.get('companyName', emp.get('fullName'))}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error fixing employer login: {e}")
        return False

if __name__ == '__main__':
    print("Fixing Employer Login Issues")
    print("=" * 40)
    
    success = fix_employer_login()
    
    if success:
        print("\nEmployer login fixes completed!")
        print("\nNext steps:")
        print("1. Start backend server: python run.py")
        print("2. Try logging in with: admin@trinity.com / admin123")
        print("3. Or create a new employer account through the UI")
    else:
        print("\nFailed to fix employer login issues")
        print("Check your MongoDB connection and .env file")