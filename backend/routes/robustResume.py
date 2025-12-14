from flask import Blueprint, request, jsonify
import os
import tempfile
from werkzeug.utils import secure_filename
from services.robustPdfParser import RobustPDFParser
import asyncio

robust_resume_bp = Blueprint('robust_resume', __name__)
parser = RobustPDFParser()

@robust_resume_bp.route('/api/resume/parse-robust', methods=['POST'])
def parse_resume_robust():
    """Robust resume parsing with OCR and advanced field mapping"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Only PDF files allowed'}), 400
        
        # Save temporarily
        filename = secure_filename(file.filename)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name
        
        try:
            # Parse with robust method
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(parser.parse_resume_robust(temp_path))
            loop.close()
            
            return jsonify({
                'success': True,
                'data': result,
                'filename': filename
            })
        
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@robust_resume_bp.route('/api/resume/diagnose', methods=['POST'])
def diagnose_parsing_issues():
    """Diagnose common parsing issues"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        filename = secure_filename(file.filename)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name
        
        try:
            diagnosis = {
                'filename': filename,
                'issues': [],
                'recommendations': []
            }
            
            # Test different extraction methods
            text_pdfplumber = ""
            text_pypdf2 = ""
            text_ocr = ""
            
            try:
                import pdfplumber
                with pdfplumber.open(temp_path) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text_pdfplumber += page_text
                if not text_pdfplumber.strip():
                    diagnosis['issues'].append('pdfplumber extraction failed')
            except Exception as e:
                diagnosis['issues'].append(f'pdfplumber error: {str(e)}')
            
            try:
                import PyPDF2
                with open(temp_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    for page in reader.pages:
                        text_pypdf2 += page.extract_text()
                if not text_pypdf2.strip():
                    diagnosis['issues'].append('PyPDF2 extraction failed')
            except Exception as e:
                diagnosis['issues'].append(f'PyPDF2 error: {str(e)}')
            
            # Check if OCR needed
            if not text_pdfplumber.strip() and not text_pypdf2.strip():
                diagnosis['issues'].append('Text extraction failed - likely scanned PDF')
                diagnosis['recommendations'].append('Use OCR extraction')
                
                try:
                    text_ocr = parser.extract_text_with_ocr(temp_path)
                    if text_ocr.strip():
                        diagnosis['recommendations'].append('OCR extraction successful')
                    else:
                        diagnosis['issues'].append('OCR extraction also failed')
                except Exception as e:
                    diagnosis['issues'].append(f'OCR error: {str(e)}')
            
            # Analyze best text
            best_text = text_pdfplumber or text_pypdf2 or text_ocr
            
            if best_text:
                # Check for common issues
                if len(best_text) < 100:
                    diagnosis['issues'].append('Very little text extracted')
                
                if not parser.extract_contact_advanced(best_text).get('email'):
                    diagnosis['issues'].append('No email found')
                
                sections = parser.extract_sections(best_text)
                if not sections:
                    diagnosis['issues'].append('No sections detected')
                    diagnosis['recommendations'].append('Check section headers format')
                
                skills = parser.extract_skills_smart(best_text)
                if len(skills) < 3:
                    diagnosis['issues'].append('Few skills detected')
                    diagnosis['recommendations'].append('Improve skills section formatting')
            
            return jsonify({
                'success': True,
                'diagnosis': diagnosis,
                'text_length': len(best_text),
                'extraction_methods': {
                    'pdfplumber': len(text_pdfplumber),
                    'pypdf2': len(text_pypdf2),
                    'ocr': len(text_ocr)
                }
            })
        
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500