import requests

def test_endpoints():
    base_url = "http://localhost:5000"
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/api/health")
        print(f"Health: {response.status_code}")
    except:
        print("Health: ERROR")
    
    # Test job title suggestions
    try:
        response = requests.post(f"{base_url}/api/suggest-job-titles", 
                               json={"query": "react"})
        print(f"Job titles: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Job titles: ERROR - {e}")
    
    # Test location suggestions  
    try:
        response = requests.post(f"{base_url}/api/suggest-locations",
                               json={"query": "ban"})
        print(f"Locations: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Locations: ERROR - {e}")

if __name__ == '__main__':
    test_endpoints()