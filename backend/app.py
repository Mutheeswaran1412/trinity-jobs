from flask import Flask, request, jsonify
try:
    from flask_cors import CORS
except ImportError:
    CORS = None
from pymongo import MongoClient
from bson import ObjectId
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import hashlib
import re
import requests
import json
import google.generativeai as genai
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import jwt
# from routes.ai import ai_bp  # Commented out to fix import error

load_dotenv()

# Configure Gemini AI (optional)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
model = None  # Using custom AI logic instead
print("[INFO] Using custom AI chatbot logic")

app = Flask(__name__)
if CORS:
    CORS(app, origins=['http://localhost:5173', 'http://localhost:3000'])

# Register blueprints
# app.register_blueprint(ai_bp, url_prefix='/api')  # Commented out to fix import error

@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,X-Requested-With'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS,PATCH'
    response.headers['Access-Control-Max-Age'] = '86400'
    return response

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization,X-Requested-With")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS,PATCH")
        response.headers.add('Access-Control-Max-Age', '86400')
        return response, 200

# MongoDB Atlas connection with better error handling
MONGO_URI = os.getenv('MONGODB_URI')
print(f"Connecting to MongoDB: {MONGO_URI}")

try:
    client = MongoClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
        socketTimeoutMS=5000,
        maxPoolSize=50,
        retryWrites=True
    )
    db = client.jobportal
    # Test connection
    client.admin.command('ping')
    print("[SUCCESS] Connected to MongoDB Atlas")
except Exception as e:
    print(f"[ERROR] MongoDB connection failed: {e}")
    print("[INFO] Continuing without database connection for testing...")
    client = None
    db = None

# Helper function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Helper function to validate email
def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

# JWT token functions
def generate_access_token(user_id, user_type):
    payload = {
        'user_id': user_id,
        'user_type': user_type,
        'token_type': 'access',
        'exp': datetime.utcnow() + timedelta(minutes=15),  # 15 minute expiry
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, os.getenv('JWT_SECRET', 'your-secret-key'), algorithm='HS256')

def generate_refresh_token(user_id, user_type):
    token_id = str(uuid.uuid4())  # Unique token ID for tracking
    payload = {
        'user_id': user_id,
        'user_type': user_type,
        'token_type': 'refresh',
        'token_id': token_id,
        'exp': datetime.utcnow() + timedelta(days=7),  # 7 days expiry
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, os.getenv('JWT_SECRET', 'your-secret-key'), algorithm='HS256'), token_id

# Store refresh token in database
def store_refresh_token(user_id, token_id, expires_at):
    if db is not None:
        db.refresh_tokens.insert_one({
            'user_id': user_id,
            'token_id': token_id,
            'expires_at': expires_at,
            'created_at': datetime.utcnow(),
            'is_active': True
        })

# Verify refresh token from database
def verify_refresh_token_db(token_id, user_id):
    if db is None:
        return True  # Skip DB check if no connection
    
    token_doc = db.refresh_tokens.find_one({
        'token_id': token_id,
        'user_id': user_id,
        'is_active': True,
        'expires_at': {'$gt': datetime.utcnow()}
    })
    return token_doc is not None

# Block/delete old refresh token
def revoke_refresh_token(token_id):
    if db is not None:
        db.refresh_tokens.update_one(
            {'token_id': token_id},
            {'$set': {'is_active': False, 'revoked_at': datetime.utcnow()}}
        )

# Delete all user refresh tokens (logout)
def revoke_all_user_tokens(user_id):
    if db is not None:
        db.refresh_tokens.update_many(
            {'user_id': user_id, 'is_active': True},
            {'$set': {'is_active': False, 'revoked_at': datetime.utcnow()}}
        )

def verify_token(token, token_type=None):
    try:
        payload = jwt.decode(token, os.getenv('JWT_SECRET', 'your-secret-key'), algorithms=['HS256'])
        if token_type and payload.get('token_type') != token_type:
            return None
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# Auth middleware decorator
def token_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        request.current_user = payload
        return f(*args, **kwargs)
    return decorated

# Database connection check helper
def check_db_connection():
    if client is None or db is None:
        return False, "Database not connected"
    try:
        client.admin.command('ping')
        return True, "Database connected"
    except Exception as e:
        return False, str(e)

# Load JSON datasets
import json

try:
    with open('data/job_titles.json', 'r') as f:
        job_titles_data = json.load(f)
    with open('data/skills.json', 'r') as f:
        skills_data = json.load(f)
    with open('data/locations.json', 'r') as f:
        locations_data = json.load(f)
    print("[SUCCESS] JSON datasets loaded")
except Exception as e:
    print(f"[ERROR] Failed to load datasets: {e}")
    job_titles_data = {"job_titles": []}
    skills_data = {"skills": []}
    locations_data = {"locations": []}

# Suggest API endpoint
@app.route('/api/suggest', methods=['GET'])
def suggest():
    try:
        q = request.args.get('q', '').lower()
        type_param = request.args.get('type', 'job')
        
        if not q or len(q) < 1:
            return jsonify({"suggestions": []})
        
        # Select dataset
        if type_param == 'skill':
            dataset = skills_data.get('skills', [])
        elif type_param == 'location':
            dataset = locations_data.get('locations', [])
        else:
            dataset = job_titles_data.get('job_titles', [])
        
        # Filter suggestions
        suggestions = [item for item in dataset if q in item.lower()][:10]
        
        print(f"[SUGGEST] Query: '{q}', Type: '{type_param}', Found: {len(suggestions)}")
        return jsonify({"suggestions": suggestions})
        
    except Exception as e:
        print(f"[ERROR] Suggest API error: {e}")
        return jsonify({"error": str(e)}), 500

# Test connection
@app.route('/api/test', methods=['GET'])
def test_connection():
    print("[TEST] Connection test endpoint called")
    connected, message = check_db_connection()
    
    return jsonify({
        "status": "All services running",
        "job_portal": "Ready",
        "chatbot": "Ready", 
        "resume_builder": "Ready"
    }), 200

# Refresh Token endpoint
@app.route('/api/refresh-token', methods=['POST'])
def refresh_token():
    try:
        # Get refresh token from HTTP-only cookie
        refresh_token = request.cookies.get('refresh_token')
        
        if not refresh_token:
            return jsonify({"error": "Refresh token is required"}), 401
        
        # Verify refresh token
        payload = verify_token(refresh_token, 'refresh')
        if not payload:
            return jsonify({"error": "Invalid or expired refresh token"}), 401
        
        # Verify token exists in database and is active
        if not verify_refresh_token_db(payload.get('token_id'), payload['user_id']):
            return jsonify({"error": "Refresh token has been revoked"}), 401
        
        # Revoke old refresh token
        revoke_refresh_token(payload.get('token_id'))
        
        # Generate new access token and refresh token (rotation)
        new_access_token = generate_access_token(payload['user_id'], payload['user_type'])
        new_refresh_token, new_token_id = generate_refresh_token(payload['user_id'], payload['user_type'])
        
        # Store new refresh token in database
        store_refresh_token(payload['user_id'], new_token_id, datetime.utcnow() + timedelta(days=7))
        
        response = jsonify({
            "access_token": new_access_token,
            "message": "Token refreshed successfully"
        })
        
        # Set new refresh token as HTTP-only cookie
        response.set_cookie(
            'refresh_token',
            new_refresh_token,
            max_age=7*24*60*60,  # 7 days
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite='Lax'
        )
        
        return response
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Logout endpoint
@app.route('/api/logout', methods=['POST'])
@token_required
def logout():
    try:
        user_id = request.current_user['user_id']
        
        # Revoke all refresh tokens for this user
        revoke_all_user_tokens(user_id)
        
        response = jsonify({"message": "Logged out successfully"})
        
        # Clear refresh token cookie
        response.set_cookie(
            'refresh_token',
            '',
            expires=0,
            httponly=True,
            secure=False,
            samesite='Lax'
        )
        
        return response
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Server is running"}), 200

# Test Mistral AI endpoint
@app.route('/api/test-ai', methods=['POST'])
def test_ai():
    try:
        data = request.json
        test_message = data.get('message', 'Hello, how are you?')
        
        response = get_chatbot_response(test_message)
        
        return jsonify({
            "input": test_message,
            "output": response,
            "status": "success"
        })
    except Exception as e:
        return jsonify({
            "error": str(e),
            "status": "failed"
        }), 500

# Chat endpoint
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        # AI-powered chatbot responses
        response = get_chatbot_response(user_message)
        
        return jsonify({
            "response": response,
            "sources": ["ZyncJobs Knowledge Base"]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_chatbot_response(message):
    """AI-powered chatbot using Mistral AI with improved prompt structure"""
    try:
        # Use Mistral AI via OpenRouter
        api_key = os.getenv('OPENROUTER_API_KEY')
        
        if not api_key:
            print("[ERROR] OPENROUTER_API_KEY not found in environment")
            return generate_intelligent_response(message)
        
        print(f"[AI] Processing message: {message[:50]}...")
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        # Enhanced structured prompt for better responses
        system_prompt = """You are ZyncJobs AI Assistant, an expert career counselor specializing in the Indian tech job market.

CONTEXT:
- ZyncJobs is India's leading tech job portal
- Focus on software engineering, data science, and tech roles
- Primary locations: Bangalore, Chennai, Hyderabad, Pune, Mumbai

YOUR EXPERTISE:
- Career guidance and job search strategies
- Interview preparation and resume optimization
- Salary benchmarking and market trends
- Skill development roadmaps
- Company insights and culture fit

RESPONSE RULES:
- Be conversational and helpful
- Provide specific, actionable advice
- Include salary ranges in INR (₹) when relevant
- Use bullet points for clarity
- Keep responses under 200 words
- Always end with a follow-up question

SALARY BENCHMARKS (India):
- Software Engineer: ₹8-15 LPA
- Senior Software Engineer: ₹15-25 LPA
- Data Scientist: ₹12-20 LPA
- DevOps Engineer: ₹10-18 LPA
- Product Manager: ₹18-30 LPA

Be encouraging and provide practical next steps."""
        
        data = {
            "model": "mistralai/mistral-7b-instruct",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "max_tokens": 300,
            "temperature": 0.7
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result['choices'][0]['message']['content'].strip()
            print(f"[AI SUCCESS] Mistral AI response: {ai_response[:100]}...")
            return ai_response
        else:
            print(f"[AI ERROR] Status code: {response.status_code}, Response: {response.text}")
            return generate_intelligent_response(message)
            
    except Exception as e:
        print(f"[ERROR] Mistral AI error: {e}")
        return generate_intelligent_response(message)

def generate_ai_job_description(job_title, company, job_type, location):
    """Generate job description using Mistral AI with structured prompt"""
    try:
        api_key = os.getenv('OPENROUTER_API_KEY')
        
        # Structured prompt with clear sections
        system_prompt = """You are an expert HR professional specializing in writing compelling job descriptions for the Indian tech industry.

TASK: Create a professional job description that attracts qualified candidates.

STRUCTURE YOUR RESPONSE EXACTLY AS:

**About the Role:**
[2-3 sentences about the position and its impact]

**Key Responsibilities:**
• [Responsibility 1]
• [Responsibility 2]
• [Responsibility 3]
• [Responsibility 4]
• [Responsibility 5]

**Required Qualifications:**
• [Education requirement]
• [Years of experience]
• [Technical skills]
• [Essential competencies]

**Preferred Skills:**
• [Nice-to-have skills]
• [Additional certifications]
• [Bonus qualifications]

**What We Offer:**
• Competitive salary
• Growth opportunities
• Modern work environment

GUIDELINES:
- Use action verbs (develop, implement, lead, optimize)
- Include specific technologies relevant to the role
- Mention collaboration and teamwork
- Keep each bullet point concise (1-2 lines)
- Focus on impact and outcomes"""
        
        user_prompt = f"""CREATE JOB DESCRIPTION FOR:

Position: {job_title}
Company: {company or 'our innovative tech company'}
Type: {job_type or 'Full-time'}
Location: {location or 'Bangalore, India'}

Generate a compelling job description following the exact structure provided."""
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "mistralai/mistral-7b-instruct",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": 600,
            "temperature": 0.5
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content'].strip()
        else:
            print(f"[ERROR] Mistral AI API error: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"[ERROR] AI job description generation failed: {e}")
        return None

def generate_ai_job_requirements(job_title):
    """Generate job requirements using Mistral AI with structured prompt"""
    try:
        api_key = os.getenv('OPENROUTER_API_KEY')
        
        system_prompt = """You are a senior HR professional with 10+ years of experience in tech recruitment in India.

TASK: Generate realistic, industry-standard job requirements.

FORMAT YOUR RESPONSE EXACTLY AS:

**Education:**
• [Degree requirement]
• [Field of study]

**Experience:**
• [Years of experience]
• [Relevant industry experience]

**Technical Skills:**
• [Core technology 1]
• [Core technology 2]
• [Core technology 3]
• [Additional tools/frameworks]

**Soft Skills:**
• [Communication skills]
• [Problem-solving abilities]
• [Team collaboration]

**Preferred:**
• [Certifications]
• [Additional qualifications]

GUIDELINES:
- Base requirements on current Indian job market standards
- Include specific years of experience
- Mention relevant technologies and tools
- Keep requirements realistic and achievable
- Focus on skills that directly impact job performance"""
        
        user_prompt = f"""Generate comprehensive job requirements for: {job_title}

Consider current market standards in India's tech industry. Make requirements specific and relevant to this role."""
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "mistralai/mistral-7b-instruct",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": 350,
            "temperature": 0.4
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content'].strip()
        else:
            print(f"[ERROR] Mistral AI API error: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"[ERROR] AI requirements generation failed: {e}")
        return None

# AI Suggestions for Job Posting
@app.route('/api/suggest-job-titles', methods=['POST'])
def suggest_job_titles():
    try:
        data = request.json
        query = data.get('query', '').strip()
        
        if len(query) < 2:
            return jsonify({"suggestions": []})
        
        # Get AI suggestions
        ai_suggestions = get_ai_job_title_suggestions(query)
        
        # Fallback to database suggestions
        db_suggestions = get_db_job_titles(query) if db else []
        
        # Combine and deduplicate
        all_suggestions = list(dict.fromkeys(ai_suggestions + db_suggestions))
        
        return jsonify({"suggestions": all_suggestions[:10]})
        
    except Exception as e:
        print(f"[ERROR] Job title suggestions failed: {e}")
        return jsonify({"suggestions": []})

@app.route('/api/suggest-locations', methods=['POST'])
def suggest_locations():
    try:
        data = request.json
        query = data.get('query', '').strip()
        
        if len(query) < 2:
            return jsonify({"suggestions": []})
        
        # Get AI suggestions
        ai_suggestions = get_ai_location_suggestions(query)
        
        # Fallback to database suggestions
        db_suggestions = get_db_locations(query) if db else []
        
        # Combine and deduplicate
        all_suggestions = list(dict.fromkeys(ai_suggestions + db_suggestions))
        
        return jsonify({"suggestions": all_suggestions[:10]})
        
    except Exception as e:
        print(f"[ERROR] Location suggestions failed: {e}")
        return jsonify({"suggestions": []})

def get_ai_job_title_suggestions(query):
    """Get job title suggestions using Mistral AI with improved prompts"""
    try:
        api_key = os.getenv('OPENROUTER_API_KEY')
        if not api_key:
            return []
        
        system_prompt = """You are a job market expert specializing in Indian tech industry job titles.

TASK: Suggest relevant job titles based on user input.

RULES:
- Return EXACTLY 8 job titles
- One title per line
- No numbering or bullet points
- Use standard industry terminology
- Focus on current market roles
- Include both junior and senior level positions

EXAMPLE OUTPUT:
Software Engineer
Senior Software Engineer
Frontend Developer
Backend Developer
Full Stack Developer
Software Architect
Tech Lead
Principal Engineer"""
        
        user_prompt = f"""Based on the search term "{query}", suggest 8 relevant job titles that are commonly used in the Indian tech job market.

Search term: {query}"""
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "mistralai/mistral-7b-instruct",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": 150,
            "temperature": 0.2
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            suggestions_text = result['choices'][0]['message']['content'].strip()
            suggestions = [s.strip() for s in suggestions_text.split('\n') if s.strip()]
            return suggestions[:8]
        
    except Exception as e:
        print(f"[ERROR] AI job title suggestions failed: {e}")
    
    return []

def get_ai_location_suggestions(query):
    """Get location suggestions using Mistral AI with structured prompts"""
    try:
        api_key = os.getenv('OPENROUTER_API_KEY')
        if not api_key:
            return []
        
        system_prompt = """You are a location expert for the Indian job market.

TASK: Suggest relevant job locations based on user input.

RULES:
- Return EXACTLY 8 locations
- One location per line
- No numbering or bullet points
- Include major Indian tech cities
- Add remote/hybrid options when relevant
- Use standard city names with "India" suffix

PRIORITY CITIES:
- Bangalore, India (Silicon Valley of India)
- Chennai, India (Detroit of India)
- Hyderabad, India (Cyberabad)
- Pune, India (IT hub)
- Mumbai, India (Financial capital)
- Delhi NCR, India (National capital region)
- Kolkata, India
- Remote

EXAMPLE OUTPUT:
Bangalore, India
Chennai, India
Hyderabad, India
Pune, India
Mumbai, India
Delhi NCR, India
Remote
Hybrid"""
        
        user_prompt = f"""Based on the search term "{query}", suggest 8 relevant job locations focusing on Indian tech cities and remote options.

Search term: {query}"""
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "mistralai/mistral-7b-instruct",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": 120,
            "temperature": 0.1
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            suggestions_text = result['choices'][0]['message']['content'].strip()
            suggestions = [s.strip() for s in suggestions_text.split('\n') if s.strip()]
            return suggestions[:8]
        
    except Exception as e:
        print(f"[ERROR] AI location suggestions failed: {e}")
    
    return []

def get_db_job_titles(query):
    """Get job title suggestions from database"""
    try:
        jobs = db.jobs.find(
            {"title": {"$regex": query, "$options": "i"}},
            {"title": 1}
        ).limit(5)
        return [job['title'] for job in jobs]
    except:
        return []

def get_db_locations(query):
    """Get location suggestions from database"""
    try:
        jobs = db.jobs.find(
            {"location": {"$regex": query, "$options": "i"}},
            {"location": 1}
        ).limit(5)
        return [job['location'] for job in jobs]
    except:
        return []

def generate_intelligent_response(message):
    """Fallback response when Mistral AI fails"""
    message_lower = message.lower()
    
    # Quick responses for common questions
    if any(word in message_lower for word in ['hello', 'hi', 'hey']):
        return "Hello! I'm ZyncJobs AI Assistant. I can help you with job searches, career advice, interview preparation, and more. What would you like to know?"
    
    elif any(word in message_lower for word in ['job', 'career', 'work']):
        return "I can help you with job opportunities! ZyncJobs has roles in Software Engineering (₹8-15 LPA), Data Science (₹12-20 LPA), and DevOps (₹10-18 LPA) across Bangalore, Chennai, and Hyderabad. What specific role interests you?"
    
    elif any(word in message_lower for word in ['salary', 'pay', 'package']):
        return "Current salary ranges in Indian tech market:\n• Software Engineer: ₹8-15 LPA\n• Data Scientist: ₹12-20 LPA\n• DevOps Engineer: ₹10-18 LPA\n• Full Stack Developer: ₹10-16 LPA\n\nSalaries vary by experience, location, and company size. Which role are you interested in?"
    
    else:
        return "I'm here to help with career guidance, job searches, and tech industry insights. Could you please be more specific about what you'd like to know? For example, ask about specific job roles, salary expectations, or interview preparation."

# Jobs endpoints
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        if db is None:
            return jsonify({"error": "Database not connected"}), 500
            
        jobs = list(db.jobs.find())
        for job in jobs:
            job['_id'] = str(job['_id'])
        return jsonify(jobs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jobs', methods=['POST'])
def create_job():
    try:
        if db is None:
            return jsonify({"error": "Database not connected"}), 500
            
        job_data = request.json
        job_data['created_at'] = datetime.utcnow()
        job_data['status'] = 'active'
        job_data['applications_count'] = 0
        
        # Validate required fields - simplified for profile job posting
        if not job_data.get('title'):
            return jsonify({"error": "Job title is required"}), 400
        
        result = db.jobs.insert_one(job_data)
        return jsonify({"id": str(result.inserted_id), "message": "Job posted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jobs/<job_id>', methods=['GET'])
def get_job(job_id):
    try:
        job = db.jobs.find_one({"_id": ObjectId(job_id)})
        if job:
            job['_id'] = str(job['_id'])
            return jsonify(job)
        return jsonify({"error": "Job not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/jobs/<job_id>', methods=['DELETE'])
def delete_job(job_id):
    try:
        if db is None:
            return jsonify({"error": "Database not connected"}), 500
            
        result = db.jobs.delete_one({"_id": ObjectId(job_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Job not found"}), 404
            
        # Also delete related applications
        db.applications.delete_many({"job_id": job_id})
        
        return jsonify({"message": "Job deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# AI Job Description Generation
@app.route('/api/generate-job-description', methods=['POST'])
def generate_job_description():
    try:
        data = request.json
        job_title = data.get('jobTitle', '')
        company = data.get('company', '')
        job_type = data.get('jobType', '')
        location = data.get('location', '')
        
        if not job_title:
            return jsonify({"error": "Job title is required"}), 400
        
        print(f"[AI] Generating job description for: {job_title}")
        
        # Try AI generation first
        ai_description = generate_ai_job_description(job_title, company, job_type, location)
        ai_requirements = generate_ai_job_requirements(job_title)
        
        # Fallback to templates if AI fails
        if not ai_description:
            print(f"[AI] Falling back to template for description")
            ai_description = generate_jd_template(job_title, company, job_type, location)
            
        if not ai_requirements:
            print(f"[AI] Falling back to template for requirements")
            ai_requirements = generate_requirements_template(job_title)
        
        return jsonify({
            "description": ai_description,
            "requirements": ai_requirements,
            "generated_by": "AI" if (ai_description and ai_requirements) else "Template"
        })
    except Exception as e:
        print(f"[ERROR] Job description generation failed: {e}")
        return jsonify({"error": str(e)}), 500

def generate_jd_template(job_title, company, job_type, location):
    """Generate job description using template"""
    company_name = company if company else "our company"
    
    templates = {
        "react developer": f"""We are seeking a skilled React Developer to join {company_name}. You will be responsible for developing user interface components and implementing them following well-known React.js workflows. You will ensure that these components and the overall application are robust and easy to maintain.

Key Responsibilities:
• Develop new user-facing features using React.js
• Build reusable components and front-end libraries for future use
• Translate designs and wireframes into high-quality code
• Optimize components for maximum performance across devices and browsers
• Collaborate with team members and stakeholders
• Stay up-to-date with latest React.js developments""",
        
        "python developer": f"""Join {company_name} as a Python Developer and contribute to building scalable applications. You will work on backend development, API integration, and data processing solutions.

Key Responsibilities:
• Develop and maintain Python applications
• Design and implement RESTful APIs
• Work with databases and data processing
• Write clean, maintainable, and efficient code
• Collaborate with cross-functional teams
• Participate in code reviews and testing""",
        
        "full stack developer": f"""We are looking for a Full Stack Developer to join {company_name}. You will work on both front-end and back-end development, creating complete web applications from concept to deployment.

Key Responsibilities:
• Develop front-end website architecture and user interactions
• Design and develop back-end applications and APIs
• Create servers and databases for functionality
• Ensure cross-platform optimization and responsiveness
• Work with development teams and product managers
• Test software to ensure functionality and efficiency"""
    }
    
    # Find matching template or use generic one
    job_key = job_title.lower()
    for key in templates:
        if key in job_key:
            return templates[key]
    
    # Generic template
    return f"""Join {company_name} as a {job_title} and be part of our dynamic team. We are looking for a motivated professional to contribute to our growing organization.

Key Responsibilities:
• Execute core responsibilities related to {job_title.lower()} role
• Collaborate with team members on various projects
• Contribute to company goals and objectives
• Maintain high standards of work quality
• Participate in team meetings and planning sessions
• Stay updated with industry trends and best practices"""

def generate_requirements_template(job_title):
    """Generate requirements using template"""
    templates = {
        "react developer": """• 3+ years of experience with React.js and its core principles
• Strong proficiency in JavaScript, including DOM manipulation and JavaScript object model
• Experience with React.js workflows (Redux, Flux)
• Familiarity with RESTful APIs
• Knowledge of modern authorization mechanisms (JSON Web Token)
• Experience with common front-end development tools (Babel, Webpack, NPM)
• Ability to understand business requirements and translate them into technical requirements
• Bachelor's degree in Computer Science or related field""",
        
        "python developer": """• 3+ years of experience in Python development
• Strong knowledge of Python frameworks (Django, Flask, FastAPI)
• Experience with databases (PostgreSQL, MySQL, MongoDB)
• Familiarity with RESTful API development
• Knowledge of version control systems (Git)
• Experience with cloud platforms (AWS, Azure, GCP)
• Understanding of software development best practices
• Bachelor's degree in Computer Science or related field""",
        
        "full stack developer": """• 4+ years of experience in full-stack development
• Proficiency in front-end technologies (HTML, CSS, JavaScript, React/Angular/Vue)
• Strong backend development skills (Node.js, Python, Java, or similar)
• Experience with databases (SQL and NoSQL)
• Knowledge of cloud services and deployment
• Familiarity with version control and CI/CD
• Strong problem-solving and communication skills
• Bachelor's degree in Computer Science or related field"""
    }
    
    # Find matching template or use generic one
    job_key = job_title.lower()
    for key in templates:
        if key in job_key:
            return templates[key]
    
    # Generic template
    return f"""• 2+ years of relevant experience in {job_title.lower()} role
• Strong technical skills related to the position
• Excellent communication and teamwork abilities
• Problem-solving and analytical thinking skills
• Ability to work in a fast-paced environment
• Bachelor's degree in relevant field or equivalent experience
• Proficiency in relevant tools and technologies
• Strong attention to detail and quality"""

# User Registration
@app.route('/api/register', methods=['POST'])
def register_user():
    try:
        print(f"Received registration request: {request.method}")
        print(f"Request data: {request.get_json()}")
        data = request.json
        email = data.get('email')
        password = data.get('password')
        user_type = data.get('userType', 'jobseeker')  # 'jobseeker' or 'employer'
        
        # Validation
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        if not is_valid_email(email):
            return jsonify({"error": "Invalid email format"}), 400
            
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        
        # Check if user already exists
        existing_user = db.users.find_one({"email": email})
        if existing_user:
            return jsonify({"error": "User already exists with this email"}), 409
        
        # Create user document with all required fields
        user_data = {
            "email": email,
            "password": hash_password(password),
            "userType": user_type,
            "fullName": data.get('fullName', ''),
            "phone": data.get('phone', ''),
            "created_at": datetime.utcnow(),
            "last_login": None,
            "profile_completed": False
        }
        
        # Add type-specific fields
        if user_type == 'employer':
            user_data.update({
                "companyName": data.get('companyName', ''),
                "companySize": data.get('companySize', ''),
                "industry": data.get('industry', '')
            })
        else:
            user_data.update({
                "skills": data.get('skills', []),
                "experience": data.get('experience', ''),
                "location": data.get('location', '')
            })
        
        print(f"Inserting user data: {user_data}")
        result = db.users.insert_one(user_data)
        print(f"[SUCCESS] User registered with ID: {result.inserted_id}")
        
        # Verify insertion with detailed logging
        inserted_user = db.users.find_one({"_id": result.inserted_id})
        print(f"Verified user in DB - Email: {inserted_user['email']}, UserType: {inserted_user.get('userType')}")
        
        # Generate access and refresh tokens for new user
        access_token = generate_access_token(str(result.inserted_id), user_type)
        refresh_token, token_id = generate_refresh_token(str(result.inserted_id), user_type)
        
        # Store refresh token in database
        store_refresh_token(str(result.inserted_id), token_id, datetime.utcnow() + timedelta(days=7))
        
        response = jsonify({
            "id": str(result.inserted_id), 
            "message": "User registered successfully",
            "userType": user_type,
            "user": {
                "id": str(result.inserted_id),
                "email": email,
                "fullName": user_data.get('fullName', ''),
                "userType": user_type
            },
            "access_token": access_token
        })
        
        # Set refresh token as HTTP-only cookie
        response.set_cookie(
            'refresh_token',
            refresh_token,
            max_age=7*24*60*60,  # 7 days
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite='Lax'
        )
        return response
    except Exception as e:
        print(f"[ERROR] Registration failed: {e}")
        return jsonify({"error": str(e)}), 500

# User Login
@app.route('/api/login', methods=['POST'])
def login_user():
    try:
        print(f"[LOGIN] Received login request: {request.method}")
        print(f"[LOGIN] Request data: {request.get_json()}")
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            print(f"[LOGIN] Missing email or password")
            return jsonify({"error": "Email and password are required"}), 400
        
        # Find user
        user = db.users.find_one({"email": email})
        print(f"[LOGIN] Login attempt for: {email}")
        print(f"[LOGIN] User found: {user is not None}")
        
        # Check hardcoded test users first
        test_users = {
            'test@candidate.com': {'id': '1', 'fullName': 'Test Candidate', 'userType': 'jobseeker'},
            'test@employer.com': {'id': '2', 'fullName': 'Test Employer', 'userType': 'employer'},
            'mutheeswaran1424@gmail.com': {'id': '3', 'fullName': 'Mutheeswaran', 'userType': 'jobseeker'},
            'employer@test.com': {'id': '4', 'fullName': 'Employer Test', 'userType': 'employer'},
            'hr@company.com': {'id': '5', 'fullName': 'HR Manager', 'userType': 'employer'}
        }
        
        if email in test_users and password == '123456':
            test_user = test_users[email]
            access_token = generate_access_token(test_user['id'], test_user['userType'])
            refresh_token, token_id = generate_refresh_token(test_user['id'], test_user['userType'])
            
            # Store refresh token in database
            store_refresh_token(test_user['id'], token_id, datetime.utcnow() + timedelta(days=7))
            
            response = jsonify({
                "message": "Login successful",
                "user": {
                    "id": test_user['id'],
                    "email": email,
                    "fullName": test_user['fullName'],
                    "userType": test_user['userType']
                },
                "access_token": access_token
            })
            
            # Set refresh token as HTTP-only cookie
            response.set_cookie(
                'refresh_token',
                refresh_token,
                max_age=7*24*60*60,  # 7 days
                httponly=True,
                secure=False,  # Set to True in production with HTTPS
                samesite='Lax'
            )
            return response
        
        if not user:
            print(f"[LOGIN] User not found for email: {email}")
            return jsonify({"error": "Invalid email or password"}), 401
        
        print(f"[LOGIN] User data: {user.get('email')}, UserType: {user.get('userType')}")
        
        # Verify password
        hashed_input = hash_password(password)
        stored_password = user.get('password')
        print(f"[LOGIN] Password verification - Match: {stored_password == hashed_input}")
        
        if stored_password != hashed_input:
            print(f"[LOGIN] Password mismatch for user: {email}")
            return jsonify({"error": "Invalid email or password"}), 401
        
        # Update last login
        update_result = db.users.update_one(
            {"_id": user['_id']},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        print(f"[LOGIN] Last login updated: {update_result.modified_count} documents")
        
        # Return user data (without password)
        user_response = {
            "id": str(user['_id']),
            "email": user['email'],
            "userType": user.get('userType', 'jobseeker'),
            "fullName": user.get('fullName', ''),
            "phone": user.get('phone', ''),
            "profile_completed": user.get('profile_completed', False)
        }
        
        if user.get('userType') == 'employer':
            user_response.update({
                "companyName": user.get('companyName', ''),
                "companySize": user.get('companySize', ''),
                "industry": user.get('industry', '')
            })
        else:
            user_response.update({
                "skills": user.get('skills', []),
                "experience": user.get('experience', ''),
                "location": user.get('location', '')
            })
        
        # Generate access and refresh tokens
        access_token = generate_access_token(str(user['_id']), user.get('userType', 'jobseeker'))
        refresh_token, token_id = generate_refresh_token(str(user['_id']), user.get('userType', 'jobseeker'))
        
        # Store refresh token in database
        store_refresh_token(str(user['_id']), token_id, datetime.utcnow() + timedelta(days=7))
        
        print(f"[LOGIN] Successful login for: {email}, UserType: {user_response['userType']}")
        
        response = jsonify({
            "message": "Login successful",
            "user": user_response,
            "access_token": access_token
        })
        
        # Set refresh token as HTTP-only cookie
        response.set_cookie(
            'refresh_token',
            refresh_token,
            max_age=7*24*60*60,  # 7 days
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite='Lax'
        )
        return response
    except Exception as e:
        print(f"[LOGIN] Error: {e}")
        return jsonify({"error": str(e)}), 500

# Get User Profile (Protected)
@app.route('/api/users/<user_id>', methods=['GET'])
@token_required
def get_user(user_id):
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Remove password from response
        user.pop('password', None)
        user['_id'] = str(user['_id'])
        return jsonify(user)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Protected endpoint example
@app.route('/api/profile', methods=['GET'])
@token_required
def get_current_user_profile():
    try:
        user_id = request.current_user['user_id']
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        user.pop('password', None)
        user['_id'] = str(user['_id'])
        return jsonify(user)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Update User Profile
@app.route('/api/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        data = request.json
        
        # Remove sensitive fields that shouldn't be updated via this endpoint
        data.pop('password', None)
        data.pop('email', None)
        data.pop('created_at', None)
        
        data['updated_at'] = datetime.utcnow()
        
        result = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({"message": "Profile updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get All Users (Admin endpoint)
@app.route('/api/users', methods=['GET'])
def get_all_users():
    try:
        users = list(db.users.find({}, {"password": 0}))  # Exclude passwords
        for user in users:
            user['_id'] = str(user['_id'])
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Search endpoint
@app.route('/api/search', methods=['GET'])
def search_jobs():
    try:
        query = request.args.get('q', '')
        location = request.args.get('location', '')
        
        search_filter = {}
        if query:
            search_filter['$or'] = [
                {"title": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}},
                {"company": {"$regex": query, "$options": "i"}}
            ]
        if location:
            search_filter['location'] = {"$regex": location, "$options": "i"}
            
        jobs = list(db.jobs.find(search_filter))
        for job in jobs:
            job['_id'] = str(job['_id'])
        return jsonify(jobs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Job Applications (Protected)
@app.route('/api/applications', methods=['POST'])
@token_required
def apply_for_job():
    try:
        data = request.json
        job_id = data.get('job_id')
        user_id = request.current_user['user_id']  # Get from token
        
        if not job_id:
            return jsonify({"error": "Job ID is required"}), 400
        
        # Check if already applied
        existing_application = db.applications.find_one({
            "job_id": job_id,
            "user_id": user_id
        })
        
        if existing_application:
            return jsonify({"error": "Already applied for this job"}), 409
        
        application_data = {
            "job_id": job_id,
            "user_id": user_id,
            "cover_letter": data.get('cover_letter', ''),
            "resume_url": data.get('resume_url', ''),
            "status": "pending",
            "applied_at": datetime.utcnow()
        }
        
        result = db.applications.insert_one(application_data)
        
        # Update job applications count
        db.jobs.update_one(
            {"_id": ObjectId(job_id)},
            {"$inc": {"applications_count": 1}}
        )
        
        return jsonify({
            "id": str(result.inserted_id),
            "message": "Application submitted successfully"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get Applications for a Job (Employer view)
@app.route('/api/jobs/<job_id>/applications', methods=['GET'])
def get_job_applications(job_id):
    try:
        applications = list(db.applications.find({"job_id": job_id}))
        
        # Get user details for each application
        for app in applications:
            app['_id'] = str(app['_id'])
            user = db.users.find_one({"_id": ObjectId(app['user_id'])}, {"password": 0})
            if user:
                user['_id'] = str(user['_id'])
                app['user_details'] = user
        
        return jsonify(applications)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get User's Applications (Job seeker view)
@app.route('/api/users/<user_id>/applications', methods=['GET'])
def get_user_applications(user_id):
    try:
        applications = list(db.applications.find({"user_id": user_id}))
        
        # Get job details for each application
        for app in applications:
            app['_id'] = str(app['_id'])
            job = db.jobs.find_one({"_id": ObjectId(app['job_id'])})
            if job:
                job['_id'] = str(job['_id'])
                app['job_details'] = job
        
        return jsonify(applications)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Update Application Status (Employer action)
@app.route('/api/applications/<application_id>', methods=['PUT'])
def update_application_status(application_id):
    try:
        data = request.json
        status = data.get('status')
        
        if status not in ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']:
            return jsonify({"error": "Invalid status"}), 400
        
        result = db.applications.update_one(
            {"_id": ObjectId(application_id)},
            {"$set": {
                "status": status,
                "updated_at": datetime.utcnow(),
                "employer_notes": data.get('notes', '')
            }}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Application not found"}), 404
        
        return jsonify({"message": "Application status updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get Jobs by Employer
@app.route('/api/employers/<employer_id>/jobs', methods=['GET'])
def get_employer_jobs(employer_id):
    try:
        jobs = list(db.jobs.find({"employer_id": employer_id}))
        for job in jobs:
            job['_id'] = str(job['_id'])
        return jsonify(jobs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get Jobs by Company Name
@app.route('/api/jobs/company/<company_name>', methods=['GET'])
def get_jobs_by_company(company_name):
    try:
        jobs = list(db.jobs.find({"company": {"$regex": company_name, "$options": "i"}}))
        for job in jobs:
            job['_id'] = str(job['_id'])
        return jsonify(jobs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Saved Jobs endpoints
@app.route('/api/users/<user_id>/saved-jobs', methods=['POST'])
def save_job(user_id):
    try:
        data = request.json
        job_id = data.get('job_id')
        
        if not job_id:
            return jsonify({"error": "Job ID is required"}), 400
        
        # Check if already saved
        existing = db.saved_jobs.find_one({"user_id": user_id, "job_id": job_id})
        if existing:
            return jsonify({"error": "Job already saved"}), 409
        
        saved_job = {
            "user_id": user_id,
            "job_id": job_id,
            "saved_at": datetime.utcnow()
        }
        
        result = db.saved_jobs.insert_one(saved_job)
        return jsonify({"id": str(result.inserted_id), "message": "Job saved successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<user_id>/saved-jobs', methods=['GET'])
def get_saved_jobs(user_id):
    try:
        saved_jobs = list(db.saved_jobs.find({"user_id": user_id}))
        
        # Get job details for each saved job
        for saved_job in saved_jobs:
            saved_job['_id'] = str(saved_job['_id'])
            job = db.jobs.find_one({"_id": ObjectId(saved_job['job_id'])})
            if job:
                job['_id'] = str(job['_id'])
                saved_job['job_details'] = job
        
        return jsonify(saved_jobs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<user_id>/saved-jobs/<job_id>', methods=['DELETE'])
def unsave_job(user_id, job_id):
    try:
        result = db.saved_jobs.delete_one({"user_id": user_id, "job_id": job_id})
        if result.deleted_count == 0:
            return jsonify({"error": "Saved job not found"}), 404
        return jsonify({"message": "Job unsaved successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Candidates endpoints
@app.route('/api/candidates', methods=['GET'])
def get_candidates():
    try:
        if db is None:
            return jsonify({"error": "Database not connected"}), 500
            
        # Get query parameters for search/filter
        search = request.args.get('search', '')
        skill = request.args.get('skill', '')
        location = request.args.get('location', '')
        
        # Build search filter - only show complete profiles
        search_filter = {
            "userType": "jobseeker",
            "profile_completed": True,
            "skills": {"$exists": True, "$ne": []},
            "location": {"$exists": True, "$ne": ""}
        }
        
        if search:
            search_filter['$or'] = [
                {"fullName": {"$regex": search, "$options": "i"}},
                {"title": {"$regex": search, "$options": "i"}}
            ]
        
        if skill:
            search_filter['skills'] = {"$regex": skill, "$options": "i"}
            
        if location:
            search_filter['location'] = {"$regex": location, "$options": "i"}
        
        candidates = list(db.users.find(search_filter, {"password": 0}))
        for candidate in candidates:
            candidate['_id'] = str(candidate['_id'])
            # Add default values if missing
            candidate['title'] = candidate.get('title', 'Software Developer')
            candidate['experience'] = candidate.get('experience', '2+ years')
            candidate['skills'] = candidate.get('skills', [])
            candidate['salary'] = candidate.get('salary', '$80k - $120k')
            candidate['availability'] = candidate.get('availability', 'Available')
            candidate['rating'] = candidate.get('rating', 4.5)
            
        return jsonify(candidates)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/candidates', methods=['POST'])
def create_candidate():
    try:
        if db is None:
            return jsonify({"error": "Database not connected"}), 500
            
        candidate_data = request.json
        candidate_data['userType'] = 'jobseeker'
        candidate_data['created_at'] = datetime.utcnow()
        candidate_data['rating'] = 4.5
        candidate_data['availability'] = 'Available'
        
        result = db.users.insert_one(candidate_data)
        return jsonify({"id": str(result.inserted_id), "message": "Candidate profile created successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Companies endpoint
@app.route('/api/companies', methods=['GET'])
def get_companies():
    try:
        if db is None:
            return jsonify({"error": "Database not connected"}), 500
            
        # Get query parameters for search
        search = request.args.get('search', '')
        
        # Build search filter for employers
        search_filter = {"userType": "employer"}
        
        if search:
            search_filter['$or'] = [
                {"companyName": {"$regex": search, "$options": "i"}},
                {"fullName": {"$regex": search, "$options": "i"}},
                {"industry": {"$regex": search, "$options": "i"}}
            ]
        
        companies = list(db.users.find(search_filter, {"password": 0}))
        
        # Process company data and add job counts
        for company in companies:
            company['_id'] = str(company['_id'])
            
            # Count jobs posted by this company
            job_count = db.jobs.count_documents({"company": company.get('companyName', '')})
            company['openJobs'] = job_count
            
            # Add default values if missing
            company['name'] = company.get('companyName', 'Company Name')
            company['industry'] = company.get('industry', 'Technology')
            company['location'] = company.get('location', 'Location not specified')
            company['employees'] = company.get('companySize', '1-50')
            company['rating'] = 4.5  # Default rating
            company['description'] = f"Join {company.get('companyName', 'our company')} and be part of our growing team."
            company['website'] = f"{company.get('companyName', 'company').lower().replace(' ', '')}.com"
            
        return jsonify(companies)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Company Profile
@app.route('/api/company-profile', methods=['POST'])
def save_company_profile():
    try:
        if db is None:
            return jsonify({"error": "Database not connected"}), 500
            
        profile_data = request.json
        profile_data['created_at'] = datetime.utcnow()
        profile_data['updated_at'] = datetime.utcnow()
        
        # Validate required fields
        if not profile_data.get('companyName'):
            return jsonify({"error": "Company name is required"}), 400
        
        result = db.company_profiles.insert_one(profile_data)
        return jsonify({
            "id": str(result.inserted_id),
            "message": "Company profile saved successfully"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Candidate Profile
@app.route('/api/candidate-profile', methods=['POST'])
def save_candidate_profile():
    try:
        if db is None:
            return jsonify({"error": "Database not connected"}), 500
            
        profile_data = request.json
        email = profile_data.get('email')
        
        # Validate required fields
        if not profile_data.get('fullName'):
            return jsonify({"error": "Full name is required"}), 400
        if not email:
            return jsonify({"error": "Email is required"}), 400
            
        # Check if user exists
        existing_user = db.users.find_one({"email": email})
        
        if existing_user:
            # Update existing user
            update_data = {
                "fullName": profile_data.get('fullName'),
                "phone": profile_data.get('phone', ''),
                "location": profile_data.get('location', ''),
                "skills": profile_data.get('skills', []),
                "experience": profile_data.get('experience', ''),
                "title": profile_data.get('title', ''),
                "salary": profile_data.get('salary', ''),
                "jobType": profile_data.get('jobType', ''),
                "education": profile_data.get('education', ''),
                "certifications": profile_data.get('certifications', ''),
                "updated_at": datetime.utcnow(),
                "profile_completed": True,
                "rating": 4.5,
                "availability": "Available"
            }
            
            result = db.users.update_one(
                {"email": email},
                {"$set": update_data}
            )
            
            if result.modified_count > 0:
                return jsonify({"message": "Profile updated successfully"})
            else:
                return jsonify({"message": "No changes made to profile"})
        else:
            # Create new user if doesn't exist
            profile_data['userType'] = 'jobseeker'
            profile_data['created_at'] = datetime.utcnow()
            profile_data['updated_at'] = datetime.utcnow()
            profile_data['rating'] = 4.5
            profile_data['availability'] = 'Available'
            profile_data['profile_completed'] = True
            
            result = db.users.insert_one(profile_data)
            return jsonify({
                "id": str(result.inserted_id),
                "message": "Candidate profile created successfully"
            })
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# AI Resume Builder endpoints
@app.route('/api/generate-summary', methods=['POST'])
def generate_summary():
    try:
        data = request.json
        job_title = data.get('job_title', '')
        skills = data.get('skills', [])
        
        # Generate professional summary
        summary = f"Results-driven {job_title} with expertise in {', '.join(skills[:3])}. Proven ability to deliver high-impact solutions and drive business growth through technical excellence and strategic thinking."
        
        return jsonify({"summary": summary})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/improve-section', methods=['POST'])
def improve_section():
    try:
        data = request.json
        section = data.get('section', '')
        
        # Simple text improvement
        improved = section.replace('worked on', 'developed').replace('helped with', 'contributed to')
        return jsonify({"improved_text": improved})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/save-resume', methods=['POST'])
def save_resume():
    try:
        if db is None:
            return jsonify({"error": "Database not connected"}), 500
            
        data = request.json
        user_id = data.get('user_id')
        resume_data = data.get('resume_data')
        
        resume_doc = {
            "userId": user_id,
            "resumeData": resume_data,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        result = db.resumes.insert_one(resume_doc)
        return jsonify({"id": str(result.inserted_id), "message": "Resume saved successfully"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Email configuration
def send_email(to_email, subject, body):
    """Send email using SMTP"""
    try:
        # Get email config from environment
        smtp_server = os.getenv('SMTP_SERVER')
        smtp_port = int(os.getenv('SMTP_PORT', 587))
        smtp_email = os.getenv('SMTP_EMAIL')
        smtp_password = os.getenv('SMTP_PASSWORD')
        
        print(f"[EMAIL] Attempting to send email to: {to_email}")
        print(f"[EMAIL] SMTP Server: {smtp_server}")
        print(f"[EMAIL] SMTP Email: {smtp_email}")
        print(f"[EMAIL] SMTP Password configured: {'Yes' if smtp_password else 'No'}")
        
        # Check if email config is available
        if not all([smtp_server, smtp_email, smtp_password]):
            print(f"[EMAIL] Missing SMTP configuration, using demo mode")
            # Fallback to console logging for demo
            print(f"\n=== EMAIL SENT (DEMO MODE) ===")
            print(f"To: {to_email}")
            print(f"Subject: {subject}")
            print(f"Body: {body}")
            print(f"================================\n")
            
            # Extract reset link for easy access
            if "reset-password" in body:
                lines = body.split('\n')
                for line in lines:
                    if "http://localhost:5173/reset-password/" in line:
                        print(f"\n🔗 RESET LINK: {line.strip()}")
                        print(f"Copy this link to test password reset\n")
            return True
        
        # Send actual email
        print(f"[EMAIL] Creating email message...")
        msg = MIMEMultipart()
        msg['From'] = smtp_email
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))
        
        print(f"[EMAIL] Connecting to SMTP server...")
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        print(f"[EMAIL] Logging in to SMTP server...")
        server.login(smtp_email, smtp_password)
        print(f"[EMAIL] Sending email...")
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Email sending failed: {e}")
        print(f"[EMAIL] Error details: {type(e).__name__}: {str(e)}")
        # Fallback to console logging
        print(f"\n=== EMAIL FALLBACK (DEMO MODE) ===")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        if "reset-password" in body:
            lines = body.split('\n')
            for line in lines:
                if "http://localhost:5173/reset-password/" in line:
                    print(f"\n🔗 RESET LINK: {line.strip()}")
        return True

# Forgot Password - Request Reset
@app.route('/api/forgot-password', methods=['POST', 'OPTIONS'])
def forgot_password():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        email = data.get('email')
        
        if not email or not is_valid_email(email):
            return jsonify({"error": "Valid email is required"}), 400
        
        print(f"[FORGOT_PASSWORD] Processing request for email: {email}")
        
        # Generate reset token
        reset_token = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(minutes=15)
        
        # Store reset token in database
        if db is not None:
            # Remove any existing tokens for this email
            db.password_reset_tokens.delete_many({"email": email})
            
            # Insert new token
            db.password_reset_tokens.insert_one({
                "email": email,
                "token": reset_token,
                "expires_at": expires_at,
                "created_at": datetime.utcnow(),
                "used": False
            })
            print(f"[FORGOT_PASSWORD] Token stored in database")
        
        # Create reset link
        reset_link = f"http://localhost:5173/reset-password/{reset_token}"
        
        # Create email content
        subject = "Password Reset Request - Trinity Jobs"
        body = f"""<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #4f46e5; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ padding: 20px; text-align: center; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Trinity Jobs</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password for your Trinity Jobs account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="{reset_link}" class="button">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p><a href="{reset_link}">{reset_link}</a></p>
            <p><strong>This link will expire in 15 minutes.</strong></p>
            <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>© 2025 Trinity Jobs. All rights reserved.</p>
        </div>
    </div>
</body>
</html>"""
        
        # Send email
        email_sent = send_email(email, subject, body)
        
        if email_sent:
            print(f"[FORGOT_PASSWORD] Email sent successfully to {email}")
            print(f"[FORGOT_PASSWORD] Reset link: {reset_link}")
        else:
            print(f"[FORGOT_PASSWORD] Email sending failed for {email}")
        
        # Always return success message (security best practice)
        return jsonify({"message": "If an account with that email exists, a password reset link has been sent."}), 200
        
    except Exception as e:
        print(f"[ERROR] Forgot password error: {e}")
        import traceback
        traceback.print_exc()
        # Still return success for security (don't reveal if email exists)
        return jsonify({"message": "If an account with that email exists, a password reset link has been sent."}), 200

# Verify Reset Token
@app.route('/api/verify-reset-token/<token>', methods=['GET', 'OPTIONS'])
def verify_reset_token(token):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        print(f"[VERIFY_TOKEN] Verifying token: {token}")
        
        if db is None:
            print(f"[VERIFY_TOKEN] Database not connected, accepting token for demo")
            return jsonify({"message": "Token is valid", "email": "demo@example.com"})
        
        # Find token in database
        token_doc = db.password_reset_tokens.find_one({
            "token": token,
            "used": False,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if not token_doc:
            print(f"[VERIFY_TOKEN] Token not found or expired: {token}")
            return jsonify({"error": "Invalid or expired token"}), 400
        
        print(f"[VERIFY_TOKEN] Token is valid for email: {token_doc['email']}")
        return jsonify({"message": "Token is valid", "email": token_doc['email']})
        
    except Exception as e:
        print(f"[ERROR] Token verification error: {e}")
        return jsonify({"error": str(e)}), 500

# Reset Password
@app.route('/api/reset-password', methods=['POST', 'OPTIONS'])
def reset_password():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        token = data.get('token')
        new_password = data.get('newPassword') or data.get('new_password')
        
        if not token:
            return jsonify({"error": "Token is required"}), 400
            
        if not new_password:
            return jsonify({"error": "New password is required"}), 400
        
        if len(new_password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400
        
        print(f"[RESET_PASSWORD] Processing password reset for token: {token}")
        
        if db is None:
            print(f"[RESET_PASSWORD] Database not connected, demo mode")
            return jsonify({"message": "Password reset successfully"}), 200
        
        # Find and validate token
        token_doc = db.password_reset_tokens.find_one({
            "token": token,
            "used": False,
            "expires_at": {"$gt": datetime.utcnow()}
        })
        
        if not token_doc:
            print(f"[RESET_PASSWORD] Invalid or expired token: {token}")
            return jsonify({"error": "Invalid or expired token"}), 400
        
        email = token_doc['email']
        print(f"[RESET_PASSWORD] Resetting password for email: {email}")
        
        # Update user password
        hashed_password = hash_password(new_password)
        result = db.users.update_one(
            {"email": email},
            {"$set": {
                "password": hashed_password,
                "updated_at": datetime.utcnow()
            }}
        )
        
        if result.matched_count == 0:
            print(f"[RESET_PASSWORD] User not found for email: {email}")
            return jsonify({"error": "User not found"}), 404
        
        # Mark token as used
        db.password_reset_tokens.update_one(
            {"token": token},
            {"$set": {"used": True, "used_at": datetime.utcnow()}}
        )
        
        # Clean up expired tokens
        db.password_reset_tokens.delete_many({
            "expires_at": {"$lt": datetime.utcnow()}
        })
        
        print(f"[RESET_PASSWORD] Password reset successful for email: {email}")
        return jsonify({"message": "Password reset successfully"}), 200
        
    except Exception as e:
        print(f"[ERROR] Password reset error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting ZyncJobs Flask Server...")
    print("Backend: http://localhost:5000")
    print("Chat API: http://localhost:5000/api/chat")
    try:
        app.run(debug=True, host='127.0.0.1', port=5000, threaded=True, use_reloader=False)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Server error: {e}")
        print("Restarting server...")
        app.run(debug=False, host='127.0.0.1', port=5000, threaded=False, use_reloader=False)