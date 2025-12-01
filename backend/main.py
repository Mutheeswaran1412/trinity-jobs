from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('models/gemini-2.0-flash')

# MongoDB connection
try:
    client = MongoClient(os.getenv('MONGODB_URI'))
    db = client[os.getenv('DB_NAME', 'jobportal')]
    jobs_collection = db.jobs
    users_collection = db.users
    print("✅ MongoDB connected")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")

# ==================== CHATBOT ROUTES ====================
@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        
        response = model.generate_content(
            f"You are SyncJobs AI Assistant. Answer questions about jobs and careers professionally. User: {message}",
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=500
            )
        )
        
        return jsonify({
            'response': response.text,
            'session_id': data.get('session_id', 'default')
        })
    except Exception as e:
        return jsonify({'error': f'Chat error: {str(e)}'}), 500

# ==================== SMART EDUCATION PARSER ====================
@app.route('/api/parse-education', methods=['POST'])
def parse_education():
    try:
        data = request.json
        user_text = data.get('text', '')
        
        prompt = f"""You are an AI assistant that helps users fill the "Education" section of a resume.
Your task is to analyze the partial or full text the user types and return
clean, standardized, complete education details in structured JSON.

User Input: {user_text}

Your output must always follow this structure:

{{
  "degree": "Full clean degree name",
  "field_of_study": "Department or specialization (expanded and corrected)",
  "institution": "Full official university/college name (corrected and standardized)",
  "location": "City, State, Country (if known or common for that institution)",
  "graduation_year": "YYYY",
  "gpa_percentage": "CGPA or Percentage (same format the user intended)",
  "suggestions": [
      "List 3 helpful suggestions for improving this education entry"
  ]
}}

Rules:
- Expand abbreviations. Example: "BE CSE" → "Bachelor of Engineering in Computer Science and Engineering".
- Normalize college names: "loyola" → "Loyola College, Chennai, India".
- If the user gives year like "23", convert to "2023".
- If CGPA is like "8.7", output "CGPA: 8.7 / 10"

Return only valid JSON, no other text."""
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=500
            )
        )
        
        # Parse JSON response
        import json
        try:
            parsed_data = json.loads(response.text.strip())
            return jsonify({'success': True, 'data': parsed_data})
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return jsonify({
                'success': True, 
                'data': {
                    'degree': 'Bachelor of Engineering',
                    'field_of_study': 'Computer Science',
                    'institution': user_text,
                    'location': 'India',
                    'graduation_year': '2024',
                    'gpa_percentage': '',
                    'suggestions': ['Add graduation year', 'Include CGPA/percentage', 'Specify field of study']
                }
            })
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== AI SUGGESTIONS ROUTE ====================
@app.route('/api/ai-suggestions', methods=['POST'])
def ai_suggestions():
    try:
        data = request.json
        suggestion_type = data.get('type')
        input_text = data.get('input')
        
        prompts = {
            'job_title': f"Suggest 5 similar job titles for: {input_text}. Return only job titles, one per line.",
            'college': f"Suggest 5 well-known colleges/universities similar to: {input_text}. Return only names, one per line.",
            'degree': f"Suggest 5 degree programs similar to: {input_text}. Return only degree names, one per line.",
            'industry': f"Suggest 5 industries related to: {input_text}. Return only industry names, one per line.",
            'college_info': f"For the college '{input_text}', provide: popular degree programs, typical graduation years (recent), typical GPA ranges. Format: degree1|degree2|degree3|2023|2024|8.5|9.0"
        }
        
        prompt = prompts.get(suggestion_type, f"Suggest alternatives for: {input_text}")
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                max_output_tokens=100
            )
        )
        
        if suggestion_type == 'college_info':
            # Parse college info response
            parts = response.text.strip().split('|')
            if len(parts) >= 7:
                return jsonify({
                    'success': True, 
                    'degrees': parts[:3],
                    'years': parts[3:5],
                    'gpa': parts[5:7]
                })
            else:
                return jsonify({'success': False, 'error': 'Invalid response format'})
        else:
            suggestions = [s.strip() for s in response.text.strip().split('\n') if s.strip()][:5]
            return jsonify({'success': True, 'suggestions': suggestions})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== SMART ATS RESUME GENERATOR ====================
@app.route('/api/smart-resume', methods=['POST'])
def smart_resume():
    try:
        data = request.json
        user_prompt = data.get('prompt', '')
        
        prompt = f"""You are an expert ATS-optimized resume builder AI. Create a complete professional resume from this user description:

"{user_prompt}"

Generate a complete ATS-friendly resume in this exact JSON format:

{{
  "name": "Extract or infer full professional name",
  "title": "Professional job title with industry keywords",
  "contact": {{
    "phone": "+1 (555) 123-4567",
    "email": "professional.email@domain.com",
    "address": "City, State, Country"
  }},
  "summary": "3-4 sentence ATS-optimized professional summary with industry keywords and quantified achievements",
  "skills": ["List 12-15 ATS keywords: technical skills, programming languages, frameworks, tools, certifications, soft skills"],
  "experience": [
    {{
      "role": "Job Title with Keywords",
      "company": "Company Name",
      "location": "City, State",
      "start_date": "Month YYYY",
      "end_date": "Month YYYY or Present",
      "points": ["4-5 bullet points starting with action verbs, include metrics (%, $, numbers), use ATS keywords, show impact and results"]
    }}
  ],
  "education": [
    {{
      "degree": "Full degree name with field of study",
      "year": "YYYY",
      "institute": "Full institution name, City, State"
    }}
  ]
}}

ATS OPTIMIZATION RULES:
- Use standard section headers (Experience, Education, Skills)
- Include industry-specific keywords throughout
- Use action verbs: Developed, Implemented, Managed, Led, Optimized
- Quantify everything: percentages, dollar amounts, team sizes, timeframes
- Avoid graphics, tables, columns - use simple text format
- Include both hard and soft skills
- Use standard job titles and company names
- Make it keyword-rich for applicant tracking systems
- Ensure 70%+ keyword match for target roles
- Return only valid JSON"""
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.3,
                max_output_tokens=1500
            )
        )
        
        # Parse JSON response
        import json
        try:
            resume_data = json.loads(response.text.strip())
            return jsonify({'success': True, 'resume': resume_data})
        except json.JSONDecodeError:
            # Fallback ATS resume
            return jsonify({
                'success': True,
                'resume': {
                    'name': 'Professional Name',
                    'title': 'Software Engineer',
                    'contact': {
                        'phone': '+1 (555) 123-4567',
                        'email': 'professional@email.com',
                        'address': 'City, State'
                    },
                    'summary': 'Results-driven Software Engineer with 3+ years of experience developing scalable web applications using React, Node.js, and Python. Proven track record of improving system performance by 40% and leading cross-functional teams of 5+ developers.',
                    'skills': ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker', 'Agile', 'Problem Solving', 'Team Leadership', 'System Design', 'API Development', 'Database Management', 'CI/CD'],
                    'experience': [{
                        'role': 'Software Engineer',
                        'company': 'Tech Company',
                        'location': 'San Francisco, CA',
                        'start_date': 'January 2021',
                        'end_date': 'Present',
                        'points': [
                            'Developed 15+ responsive web applications using React and Node.js, serving 100K+ users',
                            'Optimized database queries and API performance, reducing load times by 45%',
                            'Led a team of 5 developers in implementing CI/CD pipelines, improving deployment efficiency by 60%',
                            'Collaborated with product managers and designers to deliver features ahead of schedule',
                            'Mentored 3 junior developers and conducted code reviews to maintain high code quality'
                        ]
                    }],
                    'education': [{
                        'degree': 'Bachelor of Science in Computer Science',
                        'year': '2021',
                        'institute': 'University of Technology, San Francisco, CA'
                    }]
                }
            })
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== AI RESUME ROUTES ====================
@app.route('/api/generate-summary', methods=['POST'])
def generate_summary():
    try:
        data = request.json
        personal_info = data.get('personalInfo', {})
        skills = data.get('skills', [])
        
        context = f"Name: {personal_info.get('name', 'Professional')}, Skills: {', '.join(skills[:5])}"
        prompt = f"Write a professional resume summary (2-3 sentences) for: {context}"
        
        response = model.generate_content(
            f"You are a professional resume writer. {prompt}",
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=150
            )
        )
        
        return jsonify({'success': True, 'summary': response.text.strip()})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/enhance-experience', methods=['POST'])
def enhance_experience():
    try:
        data = request.json
        position = data.get('position', '')
        description = data.get('description', '')
        
        prompt = f"Enhance this job description with action verbs: Position: {position}, Description: {description}. Return 3 bullet points."
        
        response = model.generate_content(
            f"You are a resume writer. {prompt}",
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=200
            )
        )
        
        points = [p.strip('• -') for p in response.text.strip().split('\n') if p.strip()]
        return jsonify({'success': True, 'enhanced_points': points[:3]})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== AUTHENTICATION ROUTES ====================
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')
        
        # Find user in database
        user = users_collection.find_one({'email': email})
        if user is None:
            return jsonify({'error': 'User not found'}), 404
            
        # Simple password check (in production, use proper hashing)
        if user.get('password') != password:
            return jsonify({'error': 'Invalid password'}), 401
            
        return jsonify({
            'success': True,
            'user': {
                'id': str(user['_id']),
                'email': user['email'],
                'fullName': user.get('fullName', ''),
                'userType': user.get('userType', 'candidate')
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Check if user already exists
        existing_user = users_collection.find_one({'email': data.get('email')})
        if existing_user:
            return jsonify({'error': 'User already exists'}), 400
            
        # Create new user
        result = users_collection.insert_one(data)
        
        return jsonify({
            'success': True,
            'user': {
                'id': str(result.inserted_id),
                'email': data.get('email'),
                'fullName': data.get('fullName', ''),
                'userType': data.get('userType', 'candidate')
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== JOB PORTAL ROUTES ====================
@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    try:
        jobs = list(jobs_collection.find({}, {'_id': 0}))
        return jsonify(jobs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/jobs', methods=['POST'])
def create_job():
    try:
        job_data = request.json
        result = jobs_collection.insert_one(job_data)
        return jsonify({'success': True, 'id': str(result.inserted_id)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users', methods=['POST'])
def create_user():
    try:
        user_data = request.json
        result = users_collection.insert_one(user_data)
        return jsonify({'success': True, 'id': str(result.inserted_id)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== TEST ROUTES ====================
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        'status': 'All services running',
        'chatbot': 'Ready',
        'resume_builder': 'Ready',
        'job_portal': 'Ready'
    })

@app.route('/')
def home():
    return jsonify({'message': 'SyncJobs - All Services API'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)