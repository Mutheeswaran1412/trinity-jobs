import requests
import os
from dotenv import load_dotenv

load_dotenv()

class JobPortalChatbot:
    def __init__(self):
        self.api_key = "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"
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"
    
    def get_response(self, user_message):
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": "mistralai/mistral-7b-instruct",
                "messages": [
                    {"role": "system", "content": "You are ZyncJobs AI assistant. Help with job searching, career advice, resume writing, interview preparation, and job portal features."},
                    {"role": "user", "content": user_message}
                ],
                "max_tokens": 200,
                "temperature": 0.7
            }
            
            response = requests.post(self.api_url, headers=headers, json=data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content'].strip()
            else:
                return self._get_fallback_response(user_message)
                
        except Exception as e:
            return self._get_fallback_response(user_message)
    
    def _get_fallback_response(self, user_message):
        message_lower = user_message.lower()
        
        if any(word in message_lower for word in ["hello", "hi", "hey"]):
            return "Hello! I'm ZyncJobs AI Assistant. How can I help you with your career today?"
        elif any(word in message_lower for word in ["job", "jobs", "work"]):
            return "ZyncJobs has thousands of opportunities! I can help you search for jobs, improve your resume, or prepare for interviews. What would you like to know?"
        elif any(word in message_lower for word in ["resume", "cv"]):
            return "I can help you create a great resume! Use our AI Resume Builder or let me give you tips on formatting, keywords, and content."
        elif any(word in message_lower for word in ["interview"]):
            return "Interview preparation is key! I can help with common questions, tips for success, and what employers look for."
        else:
            return "I'm here to help with jobs, careers, resumes, and interviews. What specific question do you have?"