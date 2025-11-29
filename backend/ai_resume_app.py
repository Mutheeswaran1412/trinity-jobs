from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('models/gemini-2.0-flash')

@app.route('/api/generate-summary', methods=['POST'])
def generate_summary():
    try:
        data = request.json
        personal_info = data.get('personalInfo', {})
        experience = data.get('experience', [])
        skills = data.get('skills', [])
        education = data.get('education', [])
        
        # Create context for AI
        context = f"""
        Personal Info: {personal_info.get('name', 'Professional')}
        Skills: {', '.join(skills) if skills else 'Various professional skills'}
        Experience: {len(experience)} positions
        Education: {len(education)} degrees
        """
        
        prompt = f"""
        Write a professional resume summary (2-3 sentences) for this candidate:
        {context}
        
        Make it compelling, specific, and highlight key strengths. Avoid using "I" or personal pronouns.
        """
        
        response = model.generate_content(
            f"You are a professional resume writer. {prompt}",
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=150
            )
        )
        
        summary = response.text.strip()
        
        return jsonify({
            'success': True,
            'summary': summary
        })
        
    except Exception as e:
        print(f"Error generating summary: {e}")
        # Fallback summary
        skills_text = ', '.join(skills[:3]) if skills else 'various professional skills'
        fallback_summary = f"Experienced professional with expertise in {skills_text}. Proven track record of delivering high-quality results and driving team success through innovative solutions and strong collaboration skills."
        
        return jsonify({
            'success': True,
            'summary': fallback_summary
        })

@app.route('/api/enhance-experience', methods=['POST'])
def enhance_experience():
    try:
        data = request.json
        position = data.get('position', '')
        company = data.get('company', '')
        description = data.get('description', '')
        
        prompt = f"""
        Enhance this work experience bullet point for a resume:
        Position: {position}
        Company: {company}
        Current description: {description}
        
        Make it more impactful with action verbs and quantifiable achievements. Return 3 improved bullet points.
        """
        
        response = model.generate_content(
            f"You are a professional resume writer specializing in impactful bullet points. {prompt}",
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=200
            )
        )
        
        enhanced_points = response.text.strip().split('\n')
        
        return jsonify({
            'success': True,
            'enhanced_points': [point.strip('• -') for point in enhanced_points if point.strip()]
        })
        
    except Exception as e:
        print(f"Error enhancing experience: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to enhance experience'
        })

@app.route('/api/suggest-skills', methods=['POST'])
def suggest_skills():
    try:
        data = request.json
        job_title = data.get('jobTitle', '')
        industry = data.get('industry', '')
        
        prompt = f"""
        Suggest 10 relevant skills for a {job_title} in the {industry} industry.
        Return only the skill names, one per line, no explanations.
        """
        
        response = model.generate_content(
            f"You are a career advisor specializing in skill recommendations. {prompt}",
            generation_config=genai.types.GenerationConfig(
                temperature=0.5,
                max_output_tokens=150
            )
        )
        
        skills = [skill.strip('• -') for skill in response.text.strip().split('\n') if skill.strip()]
        
        return jsonify({
            'success': True,
            'suggested_skills': skills[:10]
        })
        
    except Exception as e:
        print(f"Error suggesting skills: {e}")
        # Fallback skills based on common job titles
        fallback_skills = {
            'software engineer': ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker'],
            'data analyst': ['Python', 'SQL', 'Excel', 'Tableau', 'Power BI', 'Statistics', 'R', 'Machine Learning'],
            'marketing manager': ['Digital Marketing', 'SEO', 'Google Analytics', 'Social Media', 'Content Strategy', 'PPC', 'Email Marketing', 'Brand Management']
        }
        
        skills = fallback_skills.get(job_title.lower(), ['Communication', 'Leadership', 'Problem Solving', 'Team Work', 'Project Management'])
        
        return jsonify({
            'success': True,
            'suggested_skills': skills
        })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'AI Resume Builder API is running'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)