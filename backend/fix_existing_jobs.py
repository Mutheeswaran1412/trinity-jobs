import os
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId

load_dotenv()

def fix_existing_jobs():
    try:
        # Connect to MongoDB
        MONGO_URI = os.getenv('MONGODB_URI')
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client.jobportal
        
        print("Fixing existing jobs...")
        
        # Get the employer who posted jobs with company "trinity"
        employer = db.users.find_one({"email": "muthees@trinitetech.com"})
        
        if employer:
            print(f"Found employer: {employer['email']}")
            
            # Update all jobs with company "trinity" to link to this employer
            result = db.jobs.update_many(
                {"company": {"$regex": "trinity", "$options": "i"}},
                {"$set": {
                    "employer_id": str(employer['_id']),
                    "employer_email": employer['email'],
                    "company": employer.get('companyName', 'Trinity Technology Solutions')
                }}
            )
            
            print(f"Updated {result.modified_count} jobs")
            
            # Verify the fix
            updated_jobs = list(db.jobs.find({"employer_id": str(employer['_id'])}))
            print(f"Jobs now linked to employer: {len(updated_jobs)}")
            
            for job in updated_jobs:
                print(f"  - {job['title']} ({job['company']})")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    fix_existing_jobs()