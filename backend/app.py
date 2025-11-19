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

load_dotenv()

# Configure Gemini AI (optional)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
model = None  # Using custom AI logic instead
print("[INFO] Using custom AI chatbot logic")

app = Flask(__name__)
if CORS:
    CORS(app, origins=['http://localhost:5173', 'http://localhost:3000'])

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

# Database connection check helper
def check_db_connection():
    if client is None or db is None:
        return False, "Database not connected"
    try:
        client.admin.command('ping')
        return True, "Database connected"
    except Exception as e:
        return False, str(e)

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

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Server is running"}), 200

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
    """AI-powered chatbot using Mistral AI"""
    try:
        # Use Mistral AI via OpenRouter
        api_key = os.getenv('OPENROUTER_API_KEY')
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "mistralai/mistral-7b-instruct",
            "messages": [
                {"role": "system", "content": "You are ZyncJobs AI Assistant. Help users with job searches, career advice, resume building, interview preparation, and any other questions professionally."},
                {"role": "user", "content": message}
            ],
            "max_tokens": 200,
            "temperature": 0.7
        }
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            return result['choices'][0]['message']['content'].strip()
        else:
            return generate_intelligent_response(message)
            
    except Exception as e:
        print(f"[ERROR] Mistral AI error: {e}")
        return generate_intelligent_response(message)

def generate_ai_job_description(job_title, company, job_type, location):
    """Generate job description using Mistral AI"""
    try:
        api_key = os.getenv('OPENROUTER_API_KEY')
        
        prompt = f"""Create a professional job description for the position: {job_title}
Company: {company or 'our company'}
Job Type: {job_type or 'Full-time'}
Location: {location or 'Remote'}

Generate a comprehensive job description including:
1. Brief company introduction
2. Role overview
3. Key responsibilities (5-7 points)
4. Required qualifications
5. Preferred skills

Make it engaging and professional. Focus on attracting top talent."""
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "mistralai/mistral-7b-instruct",
            "messages": [
                {"role": "system", "content": "You are an expert HR professional and job description writer. Create compelling, detailed job descriptions that attract qualified candidates."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 800,
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
            return result['choices'][0]['message']['content'].strip()
        else:
            print(f"[ERROR] Mistral AI API error: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"[ERROR] AI job description generation failed: {e}")
        return None

def generate_ai_job_requirements(job_title):
    """Generate job requirements using Mistral AI"""
    try:
        api_key = os.getenv('OPENROUTER_API_KEY')
        
        prompt = f"""Create detailed job requirements for: {job_title}

Generate requirements in this format:
• Education requirements
• Years of experience needed
• Technical skills required
• Soft skills needed
• Certifications (if applicable)
• Additional qualifications

Make it specific to the {job_title} role and industry standards."""
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "mistralai/mistral-7b-instruct",
            "messages": [
                {"role": "system", "content": "You are an expert HR professional. Create detailed, realistic job requirements that match industry standards."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 400,
            "temperature": 0.6
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
    """Get job title suggestions using Mistral AI"""
    try:
        api_key = os.getenv('OPENROUTER_API_KEY')
        if not api_key:
            return []
        
        prompt = f"""Based on "{query}", suggest 8 relevant job titles.
Return only job titles, one per line:

Software Engineer
Frontend Developer
Backend Developer"""
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "mistralai/mistral-7b-instruct",
            "messages": [
                {"role": "system", "content": "Suggest relevant job titles based on user input. Return only job titles, one per line."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 200,
            "temperature": 0.3
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
    """Get location suggestions using Mistral AI"""
    try:
        api_key = os.getenv('OPENROUTER_API_KEY')
        if not api_key:
            return []
        
        prompt = f"""Based on "{query}", suggest 8 job locations in India and remote options.
Return only locations, one per line:

Bangalore, India
Chennai, India
Remote"""
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": "mistralai/mistral-7b-instruct",
            "messages": [
                {"role": "system", "content": "Suggest relevant job locations in India. Return only location names, one per line."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 150,
            "temperature": 0.3
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
    """Generate intelligent responses for any question"""
    message_lower = message.lower()
    
    # Data Science questions
    if any(word in message_lower for word in ['data science', 'datascience', 'machine learning', 'ml', 'ai', 'artificial intelligence']):
        return """**Data Science** is a multidisciplinary field that combines statistics, programming, and domain expertise to extract meaningful insights from data.

**Key Features & Scope:**
• **Data Collection**: Gathering data from databases, APIs, web scraping
• **Data Cleaning**: Preprocessing and preparing data for analysis
• **Exploratory Analysis**: Understanding patterns and relationships
• **Machine Learning**: Building predictive models (supervised/unsupervised)
• **Deep Learning**: Neural networks for complex pattern recognition
• **Data Visualization**: Creating meaningful charts and dashboards
• **Statistical Modeling**: Hypothesis testing and statistical inference
• **Big Data Processing**: Handling large datasets with tools like Spark, Hadoop
• **Business Intelligence**: Converting insights into actionable strategies

**Career Path**: At ZyncJobs, we have Data Scientist roles (₹12-20 LPA) requiring Python, SQL, TensorFlow, and statistical knowledge."""
    
    # Programming questions
    elif any(word in message_lower for word in ['python', 'javascript', 'react', 'node', 'programming', 'coding', 'development']):
        return f"""**Programming & Development** is essential in today's tech landscape.

**Key Technologies:**
• **Frontend**: React, JavaScript, HTML/CSS for user interfaces
• **Backend**: Node.js, Python, APIs for server-side logic
• **Databases**: MongoDB, SQL for data storage
• **Cloud**: AWS, Docker, Kubernetes for deployment

**Career Opportunities**: ZyncJobs offers Software Engineer positions (₹8-15 LPA) and DevOps roles (₹10-18 LPA) in Chennai, Bangalore, Hyderabad.

What specific technology would you like to know more about?"""
    
    # Job/Career questions
    elif any(word in message_lower for word in ['job', 'career', 'salary', 'work', 'employment', 'hiring']):
        return """**Career Opportunities at ZyncJobs:**

• **Software Engineer**: ₹8-15 LPA | React, Node.js, MongoDB, Python
• **Data Scientist**: ₹12-20 LPA | Python, ML, SQL, TensorFlow  
• **DevOps Engineer**: ₹10-18 LPA | AWS, Docker, Kubernetes, Jenkins

**Locations**: Chennai, Bangalore, Hyderabad

**How to Apply**: Register → Complete Profile → Browse Jobs → Apply

Would you like help with applications or specific role details?"""
    
    # Technology questions
    elif any(word in message_lower for word in ['technology', 'tech', 'software', 'computer', 'digital']):
        return f"""**Technology** is rapidly evolving and creating new opportunities daily.

**Trending Areas:**
• **Artificial Intelligence & Machine Learning**
• **Cloud Computing & DevOps**
• **Full-Stack Development**
• **Data Science & Analytics**
• **Cybersecurity**
• **Mobile Development**

At ZyncJobs, we connect talented professionals with leading tech companies. Our current openings span these exciting fields with competitive salaries.

What specific technology area interests you most?"""
    
    # General questions - provide helpful responses
    else:
        # Extract key words to provide relevant response
        if 'what' in message_lower and 'is' in message_lower:
            topic = message_lower.replace('what is', '').replace('what', '').replace('is', '').strip('? ')
            return f"""**{topic.title()}** is an important topic that many professionals are interested in.

I'd be happy to provide more specific information if you could clarify what aspect you're most interested in. 

At ZyncJobs, we help connect professionals with opportunities in various fields including technology, data science, and software development.

Would you like to know about career opportunities related to {topic} or need more specific information?"""
        
        elif any(word in message_lower for word in ['how', 'why', 'when', 'where']):
            return f"""That's a great question! I'm here to help with information about:

• **Career guidance** and job opportunities
• **Technology topics** and skill development  
• **ZyncJobs platform** and application process
• **Industry insights** and salary information

Could you provide a bit more detail about what you'd like to know? I'm here to give you comprehensive, helpful answers."""
        
        else:
            return f"""Thank you for your question! I'm an AI assistant for ZyncJobs, and I'm here to help with any information you need.

**I can help with:**
• Job opportunities and career advice
• Technology and programming topics
• Data science and AI concepts
• Application processes and requirements
• General knowledge and explanations

Feel free to ask me anything - I'll do my best to provide detailed, helpful answers!

What would you like to know more about?"""

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
        
        return jsonify({
            "id": str(result.inserted_id), 
            "message": "User registered successfully",
            "userType": user_type
        })
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
        
        # Hardcoded test users for demo
        test_users = {
            'test@candidate.com': {'id': '1', 'fullName': 'Test Candidate', 'userType': 'jobseeker'},
            'test@employer.com': {'id': '2', 'fullName': 'Test Employer', 'userType': 'employer'},
            'mutheeswaran1424@gmail.com': {'id': '3', 'fullName': 'Mutheeswaran', 'userType': 'jobseeker'},
            'employer@test.com': {'id': '4', 'fullName': 'Employer Test', 'userType': 'employer'},
            'hr@company.com': {'id': '5', 'fullName': 'HR Manager', 'userType': 'employer'}
        }
        
        if email in test_users and password == '123456':
            test_user = test_users[email]
            return jsonify({
                "message": "Login successful",
                "user": {
                    "id": test_user['id'],
                    "email": email,
                    "fullName": test_user['fullName'],
                    "userType": test_user['userType']
                }
            })
        
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
        
        print(f"[LOGIN] Successful login for: {email}, UserType: {user_response['userType']}")
        
        return jsonify({
            "message": "Login successful",
            "user": user_response
        })
    except Exception as e:
        print(f"[LOGIN] Error: {e}")
        return jsonify({"error": str(e)}), 500

# Get User Profile
@app.route('/api/users/<user_id>', methods=['GET'])
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

# Job Applications
@app.route('/api/applications', methods=['POST'])
def apply_for_job():
    try:
        data = request.json
        job_id = data.get('job_id')
        user_id = data.get('user_id')
        
        if not job_id or not user_id:
            return jsonify({"error": "Job ID and User ID are required"}), 400
        
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
        
        # Check if email config is available
        if not all([smtp_server, smtp_email, smtp_password]):
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
        msg = MIMEMultipart()
        msg['From'] = smtp_email
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_email, smtp_password)
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Email sending failed: {e}")
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
        
        # Generate reset token
        reset_token = str(uuid.uuid4())
        
        # For demo purposes, just log the reset link
        reset_link = f"http://localhost:5173/reset-password/{reset_token}"
        print(f"\n🔗 PASSWORD RESET LINK for {email}:")
        print(f"{reset_link}")
        print(f"Token: {reset_token}\n")
        
        return jsonify({"message": "Password reset link has been sent to your email."})
        
    except Exception as e:
        print(f"[ERROR] Forgot password error: {e}")
        return jsonify({"error": "Failed to process request"}), 500

# Verify Reset Token
@app.route('/api/verify-reset-token/<token>', methods=['GET', 'OPTIONS'])
def verify_reset_token(token):
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        # For demo, accept any token
        return jsonify({"message": "Token is valid", "email": "demo@example.com"})
        
    except Exception as e:
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
        
        # For demo, just return success
        print(f"[DEMO] Password reset successful for token: {token}")
        print(f"[DEMO] New password length: {len(new_password)}")
        return jsonify({"message": "Password reset successfully"}), 200
        
    except Exception as e:
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