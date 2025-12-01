import requests

# Test specifically for "react" query
response = requests.post(
    'http://localhost:5000/api/suggest-job-titles',
    json={"query": "react"},
    timeout=15
)

print(f"Status: {response.status_code}")
if response.status_code == 200:
    result = response.json()
    suggestions = result.get('suggestions', [])
    print(f"Suggestions for 'react':")
    for i, suggestion in enumerate(suggestions, 1):
        print(f"  {i}. {suggestion}")
else:
    print(f"Error: {response.text}")