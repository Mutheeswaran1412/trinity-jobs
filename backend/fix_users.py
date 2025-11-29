from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv('MONGODB_URI')

try:
    client = MongoClient(MONGO_URI)
    db = client.jobportal
    
    # Find users without userType
    users_without_type = list(db.users.find({"userType": {"$exists": False}}))
    print(f"Found {len(users_without_type)} users without userType")
    
    # Update users without userType to have default userType
    result = db.users.update_many(
        {"userType": {"$exists": False}},
        {"$set": {"userType": "jobseeker"}}
    )
    print(f"Updated {result.modified_count} users with default userType")
    
    # Show current user count and types
    total_users = db.users.count_documents({})
    jobseekers = db.users.count_documents({"userType": "jobseeker"})
    employers = db.users.count_documents({"userType": "employer"})
    
    print(f"Total users: {total_users}")
    print(f"Jobseekers: {jobseekers}")
    print(f"Employers: {employers}")
    
except Exception as e:
    print(f"Error: {e}")
finally:
    try:
        client.close()
    except:
        pass