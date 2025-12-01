import requests
import json

def test_save_operations():
    print("Testing actual data saving...")
    
    # Test company profile save
    print("\n1. Testing Company Profile Save:")
    company_data = {
        "companyName": "Debug Test Company",
        "industry": "Software Development",
        "location": "Test City",
        "website": "https://test.com",
        "companySize": "11-50",
        "description": "Test company description"
    }
    
    try:
        response = requests.post(
            "http://localhost:5000/api/company-profile",
            json=company_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test job save
    print("\n2. Testing Job Save:")
    job_data = {
        "title": "Debug Test Job",
        "company": "Debug Company",
        "location": "Remote",
        "type": "full-time",
        "salary": "$100k-120k",
        "description": "Test job description"
    }
    
    try:
        response = requests.post(
            "http://localhost:5000/api/jobs",
            json=job_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Check if data exists in database
    print("\n3. Checking saved data:")
    try:
        # Get all jobs
        response = requests.get("http://localhost:5000/api/jobs")
        jobs = response.json()
        print(f"Jobs in database: {len(jobs) if isinstance(jobs, list) else 'Error'}")
        if isinstance(jobs, list) and len(jobs) > 0:
            print(f"Latest job: {jobs[-1].get('title', 'No title')}")
    except Exception as e:
        print(f"Error getting jobs: {e}")

if __name__ == "__main__":
    test_save_operations()