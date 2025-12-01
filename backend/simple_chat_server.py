from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        # Mistral AI via OpenRouter
        api_key = "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"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "mistralai/mistral-7b-instruct",
            "messages": [
                {"role": "system", "content": "You are ZyncJobs AI Assistant. Help users with job searches, career advice, and any questions professionally."},
                {"role": "user", "content": user_message}
            ],
            "max_tokens": 200,
            "temperature": 0.7
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result['choices'][0]['message']['content'].strip()
        else:
            # Fallback response
            if "job" in user_message.lower():
                ai_response = "ZyncJobs has thousands of job opportunities! I can help you search for jobs, improve your resume, or prepare for interviews. What would you like to know?"
            elif "hello" in user_message.lower() or "hi" in user_message.lower():
                ai_response = "Hello! I'm ZyncJobs AI Assistant. How can I help you with your career today?"
            else:
                ai_response = "I'm here to help with jobs and careers. What would you like to know about ZyncJobs?"
        
        return jsonify({
            "response": ai_response,
            "sources": ["ZyncJobs Knowledge Base"]
        })
        
    except Exception as e:
        return jsonify({
            "response": "I'm here to help with jobs and careers. What would you like to know about ZyncJobs?",
            "sources": ["ZyncJobs Knowledge Base"]
        })

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"status": "success", "message": "ZyncJobs Chat API is working!"})

if __name__ == '__main__':
    print("Starting ZyncJobs Chat Server...")
    print("Chat API: http://localhost:5000/api/chat")
    app.run(host='127.0.0.1', port=5000, debug=True)