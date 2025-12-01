from flask import Blueprint, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/generate-content', methods=['POST'])
def generate_content():
    try:
        data = request.get_json()
        content_type = data.get('type')
        job_title = data.get('jobTitle', 'Professional')
        company = data.get('company', '')
        degree = data.get('degree', '')
        school = data.get('school', '')
        
        # Build prompt based on content type
        if content_type == 'experience':
            prompt = f"Generate 3-4 professional bullet points for a {job_title} position at {company or 'a company'}. Focus on achievements, responsibilities, and impact. Format as bullet points starting with action verbs. Keep each point concise and quantify results where possible."
        elif content_type == 'education':
            prompt = f"Generate a professional education description for someone who completed {degree or 'their degree'} at {school or 'university'}. Include relevant coursework, academic achievements, honors, projects, or skills gained. Make it specific to {job_title} role. Format: 'Graduated with [degree] from [school]. [2-3 sentences about relevant coursework, achievements, or skills gained that relate to the job role].'"
        elif content_type == 'summary':
            prompt = f"Generate a professional summary (2-3 sentences) for a {job_title} position. Highlight key skills, experience level, and career objectives. Make it compelling and tailored to the role."
        else:
            prompt = "Generate professional content for a resume."
        
        # Use OpenRouter API
        api_key = os.getenv('OPENROUTER_API_KEY')
        model = os.getenv('OPENROUTER_MODEL', 'mistralai/mistral-7b-instruct')
        
        if not api_key:
            return jsonify({'error': 'API key not configured'}), 500
        
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': model,
                'messages': [
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ],
                'max_tokens': 300,
                'temperature': 0.7
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            return jsonify({'content': content})
        else:
            # Fallback content
            fallback_content = get_fallback_content(content_type, job_title, degree, school)
            return jsonify({'content': fallback_content})
            
    except Exception as e:
        print(f"AI Generation Error: {e}")
        fallback_content = get_fallback_content(
            data.get('type', 'summary'), 
            data.get('jobTitle', 'Professional'),
            data.get('degree'),
            data.get('school')
        )
        return jsonify({'content': fallback_content})

def get_fallback_content(content_type, job_title, degree=None, school=None):
    if content_type == 'experience':
        return "• Managed daily operations and improved efficiency by implementing new processes\n• Collaborated with cross-functional teams to deliver high-quality results\n• Analyzed data and provided insights to support strategic decision-making\n• Maintained accurate records and ensured compliance with company standards"
    elif content_type == 'education':
        degree_text = degree or 'Bachelor\'s degree in Computer Science'
        school_text = school or 'University'
        if 'honors' in degree_text.lower() or 'honour' in degree_text.lower():
            return f"Graduated with {degree_text} from {school_text} with distinction. Completed comprehensive coursework in Data Structures, Algorithms, Software Engineering, Database Management, and Computer Networks. Achieved academic excellence through consistent performance and demonstrated strong analytical and problem-solving capabilities through various projects and assignments."
        else:
            return f"Graduated with {degree_text} from {school_text}. Completed coursework in core computer science fundamentals including programming, data structures, algorithms, and software development. Developed strong technical and analytical skills through hands-on projects and collaborative learning experiences."
    elif content_type == 'summary':
        return f"Dedicated professional with strong background in {job_title.lower()} and proven track record of delivering results. Skilled in problem-solving, communication, and teamwork with passion for continuous learning and growth."
    else:
        return "Professional content generated for resume."