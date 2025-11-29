from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"status": "success", "message": "Server is running!"})

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"})
    
    data = request.get_json()
    print(f"Received registration data: {data}")
    
    return jsonify({
        "id": "test123",
        "message": "Registration successful",
        "userType": "jobseeker"
    })

if __name__ == '__main__':
    print("Starting simple Flask server on http://localhost:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)