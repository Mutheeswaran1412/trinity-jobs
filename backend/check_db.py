from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGO_URI)
db = client.jobportal

print("=== CHECKING MONGODB ATLAS ===")
print(f"Database: {db.name}")

# Get all users
users = list(db.users.find({}, {"password": 0}))
print(f"\nTotal users: {len(users)}")

print("\n=== ALL USERS ===")
for i, user in enumerate(users, 1):
    print(f"{i}. Email: {user.get('email')}")
    print(f"   Name: {user.get('fullName', 'N/A')}")
    print(f"   Type: {user.get('userType', 'N/A')}")
    print(f"   Created: {user.get('created_at', 'N/A')}")
    print("---")

# Get recent users (last 5)
recent_users = list(db.users.find({}, {"password": 0}).sort("created_at", -1).limit(5))
print(f"\n=== RECENT 5 USERS ===")
for user in recent_users:
    print(f"Email: {user.get('email')} | Type: {user.get('userType')} | Created: {user.get('created_at')}")

client.close()