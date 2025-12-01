import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

def debug_jobs():
    try:
        # Connect to MongoDB
        MONGO_URI = os.getenv('MONGODB_URI')
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        db = client.jobportal
        
        print("=== JOB DEBUG ===")
        
        # Check all jobs
        all_jobs = list(db.jobs.find())
        print(f"Total jobs in database: {len(all_jobs)}")
        
        if all_jobs:
            print("\nAll jobs:")
            for i, job in enumerate(all_jobs, 1):
                print(f"{i}. Title: {job.get('title')}")
                print(f"   Company: {job.get('company')}")
                print(f"   Employer ID: {job.get('employer_id')}")
                print(f"   Employer Email: {job.get('employer_email')}")
                print(f"   Created: {job.get('created_at')}")
                print()
        
        # Check employers
        employers = list(db.users.find({"userType": "employer"}))
        print(f"Total employers: {len(employers)}")
        
        if employers:
            print("\nEmployers:")
            for i, emp in enumerate(employers, 1):
                print(f"{i}. Email: {emp.get('email')}")
                print(f"   Company: {emp.get('companyName')}")
                print(f"   Full Name: {emp.get('fullName')}")
                print(f"   ID: {emp.get('_id')}")
                print()
        
        # Test job filtering for each employer
        print("=== JOB FILTERING TEST ===")
        for emp in employers:
            matching_jobs = []
            for job in all_jobs:
                if (job.get('employer_id') == str(emp.get('_id')) or 
                    job.get('employer_email') == emp.get('email') or
                    job.get('company', '').lower() == emp.get('companyName', '').lower()):
                    matching_jobs.append(job)
            
            print(f"Employer: {emp.get('email')}")
            print(f"Matching jobs: {len(matching_jobs)}")
            for job in matching_jobs:
                print(f"  - {job.get('title')} ({job.get('company')})")
            print()
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    debug_jobs()