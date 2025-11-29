import requests
import json

def test_ai_suggestions():
    """Test AI job title and location suggestions"""
    
    print("Testing AI Suggestions")
    print("=" * 30)
    
    # Test job title suggestions
    job_queries = ["react", "python", "data", "full stack", "devops"]
    
    print("\n1. Job Title Suggestions:")
    print("-" * 25)
    
    for query in job_queries:
        try:
            response = requests.post(
                'http://localhost:5000/api/suggest-job-titles',
                json={"query": query},
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                suggestions = result.get('suggestions', [])
                print(f"\nQuery: '{query}'")
                for i, suggestion in enumerate(suggestions[:5], 1):
                    print(f"  {i}. {suggestion}")
            else:
                print(f"Error for '{query}': {response.status_code}")
                
        except Exception as e:
            print(f"Error for '{query}': {e}")
    
    # Test location suggestions
    location_queries = ["ban", "chen", "hyd", "remote", "mum"]
    
    print("\n\n2. Location Suggestions:")
    print("-" * 22)
    
    for query in location_queries:
        try:
            response = requests.post(
                'http://localhost:5000/api/suggest-locations',
                json={"query": query},
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                suggestions = result.get('suggestions', [])
                print(f"\nQuery: '{query}'")
                for i, suggestion in enumerate(suggestions[:5], 1):
                    print(f"  {i}. {suggestion}")
            else:
                print(f"Error for '{query}': {response.status_code}")
                
        except Exception as e:
            print(f"Error for '{query}': {e}")

if __name__ == '__main__':
    test_ai_suggestions()