from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import re

load_dotenv()

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173'])

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def send_email(to_email, subject, body):
    try:
        smtp_server = os.getenv('SMTP_SERVER')
        smtp_port = int(os.getenv('SMTP_PORT', 587))
        smtp_email = os.getenv('SMTP_EMAIL')
        smtp_password = os.getenv('SMTP_PASSWORD')
        
        msg = MIMEMultipart()
        msg['From'] = smtp_email
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_email, smtp_password)
        server.send_message(msg)
        server.quit()
        
        print(f"✅ Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Email error: {e}")
        return False

@app.route('/api/forgot-password', methods=['POST', 'OPTIONS'])
def forgot_password():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        email = data.get('email')
        
        if not email or not is_valid_email(email):
            return jsonify({"error": "Valid email is required"}), 400
        
        reset_token = str(uuid.uuid4())
        reset_link = f"http://localhost:5173/reset-password/{reset_token}"
        
        subject = "Password Reset Request - Trinity Jobs"
        body = f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
            <h1>Trinity Jobs</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password for your Trinity Jobs account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="{reset_link}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p><a href="{reset_link}">{reset_link}</a></p>
            <p><strong>This link will expire in 15 minutes.</strong></p>
            <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>© 2025 Trinity Jobs. All rights reserved.</p>
        </div>
    </div>
</body>
</html>"""
        
        email_sent = send_email(email, subject, body)
        
        if email_sent:
            print(f"🔗 Reset link: {reset_link}")
        
        return jsonify({"message": "If an account with that email exists, a password reset link has been sent."}), 200
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"message": "If an account with that email exists, a password reset link has been sent."}), 200

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"status": "Server running"}), 200

if __name__ == '__main__':
    print("Starting Trinity Jobs Server...")
    print("Server: http://localhost:5000")
    app.run(debug=True, host='127.0.0.1', port=5000, use_reloader=False)