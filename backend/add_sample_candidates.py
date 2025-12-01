import os
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv
import hashlib

load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv('MONGODB_URI', "mongodb+srv://jobportal_user:jovinithin_123@jobportal.pnp4szn.mongodb.net/jobportal?retryWrites=true&w=majority&appName=Jobportal")

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

try:
    client = MongoClient(MONGO_URI)
    db = client.jobportal
    
    # Sample candidates data
    candidates = [
        {
            "email": "john.smith@email.com",
            "password": hash_password("password123"),
            "userType": "jobseeker",
            "fullName": "John Smith",
            "title": "Senior React Developer",
            "location": "San Francisco, CA",
            "experience": "5+ years",
            "skills": ["React", "TypeScript", "Node.js", "AWS"],
            "salary": "$140k - $160k",
            "availability": "Available",
            "rating": 4.9,
            "phone": "+1-555-0101",
            "created_at": datetime.utcnow()
        },
        {
            "email": "sarah.anderson@email.com",
            "password": hash_password("password123"),
            "userType": "jobseeker",
            "fullName": "Sarah Anderson",
            "title": "AI Engineer",
            "location": "New York, NY",
            "experience": "7+ years",
            "skills": ["Python", "TensorFlow", "Machine Learning", "Docker"],
            "salary": "$160k - $180k",
            "availability": "Available",
            "rating": 4.8,
            "phone": "+1-555-0102",
            "created_at": datetime.utcnow()
        },
        {
            "email": "mike.chen@email.com",
            "password": hash_password("password123"),
            "userType": "jobseeker",
            "fullName": "Mike Chen",
            "title": "DevOps Engineer",
            "location": "Seattle, WA",
            "experience": "6+ years",
            "skills": ["Kubernetes", "AWS", "Terraform", "Jenkins"],
            "salary": "$130k - $150k",
            "availability": "Available in 2 weeks",
            "rating": 4.7,
            "phone": "+1-555-0103",
            "created_at": datetime.utcnow()
        },
        {
            "email": "emily.rodriguez@email.com",
            "password": hash_password("password123"),
            "userType": "jobseeker",
            "fullName": "Emily Rodriguez",
            "title": "Full Stack Developer",
            "location": "Austin, TX",
            "experience": "4+ years",
            "skills": ["Vue.js", "Python", "PostgreSQL", "Redis"],
            "salary": "$120k - $140k",
            "availability": "Available",
            "rating": 4.9,
            "phone": "+1-555-0104",
            "created_at": datetime.utcnow()
        }
    ]
    
    # Check if candidates already exist
    existing_count = db.users.count_documents({"userType": "jobseeker"})
    
    if existing_count > 0:
        print(f"Found {existing_count} existing candidates. Skipping insertion.")
    else:
        # Insert candidates
        result = db.users.insert_many(candidates)
        print(f"Successfully added {len(result.inserted_ids)} sample candidates to database!")
        
        # Verify insertion
        total_candidates = db.users.count_documents({"userType": "jobseeker"})
        print(f"Total candidates in database: {total_candidates}")
    
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'client' in locals():
        client.close()