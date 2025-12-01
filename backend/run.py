import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == '__main__':
    print("Starting Trinity Jobs Flask Server on http://localhost:5000")
    # Direct execution of app.py with UTF-8 encoding
    with open('app.py', 'r', encoding='utf-8') as f:
        exec(f.read())