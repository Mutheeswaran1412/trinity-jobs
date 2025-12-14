# Enhanced PDF Resume Parser

## Overview
This enhanced PDF parser provides robust resume parsing with multiple extraction strategies and AI integration for improved accuracy.

## Features

### 🔧 Multiple Extraction Methods
- **pdfplumber**: Primary extraction method (most accurate)
- **PyPDF2**: Fallback extraction method
- **AI-powered parsing**: Uses OpenRouter/Mistral for intelligent extraction

### 📊 Advanced Pattern Matching
- **Email extraction**: Robust regex patterns
- **Phone extraction**: International phone number support
- **Skills extraction**: Context-aware skill detection
- **Experience parsing**: Years of experience and company extraction
- **Education parsing**: Degree and field extraction

### 🤖 AI Integration
- Uses OpenRouter API with Mistral model
- Fallback to rule-based parsing if AI unavailable
- Structured JSON output with confidence scores

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
python setup_enhanced_parser.py
```

### 2. Configure Environment Variables
Add to your `.env` file:
```env
# OpenRouter AI Configuration (for enhanced parsing)
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_MODEL=mistralai/mistral-7b-instruct
```

### 3. Test the Parser
```bash
python test_enhanced_parser.py
```

## API Endpoints

### Parse PDF Resume
```http
POST /api/resume/parse-enhanced
Content-Type: multipart/form-data

file: [PDF file]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john.doe@email.com",
    "phone": "(555) 123-4567",
    "skills": ["JavaScript", "Python", "React"],
    "experience_years": 5,
    "job_title": "Senior Software Engineer",
    "education": [{"degree": "Master", "field": "Computer Science"}],
    "summary": "Experienced software engineer...",
    "parsing_method": "ai_enhanced",
    "confidence": 0.9
  }
}
```

### Parse Text Resume
```http
POST /api/resume/parse-text
Content-Type: application/json

{
  "text": "Resume text content..."
}
```

### Validate Parsed Data
```http
POST /api/resume/validate
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@email.com",
  "skills": ["JavaScript", "Python"]
}
```

## Integration with Existing Code

### JavaScript Integration
```javascript
// In your existing resume parsing service
import PDFParserService from './services/pdfParserService.js';

const parser = new PDFParserService();

// Use enhanced parsing
const result = await parser.parseResumeEnhanced(pdfPath);
console.log('Parsing method:', result.parsingMethod);
console.log('Confidence:', result.confidence);
```

### Python Integration
```python
from services.enhancedPdfParser import EnhancedPDFParser

parser = EnhancedPDFParser()
result = await parser.parse_resume('resume.pdf')
```

## Parsing Strategies

### 1. Rule-Based Parsing
- Regex patterns for contact information
- Keyword matching for skills
- Section header detection
- Date and experience extraction

### 2. AI-Enhanced Parsing
- Natural language understanding
- Context-aware extraction
- Structured output generation
- Higher accuracy for complex resumes

### 3. Hybrid Approach
- Combines rule-based and AI methods
- Falls back gracefully if AI unavailable
- Validates and merges results

## Supported Skills Categories

- **Programming Languages**: JavaScript, Python, Java, C++, etc.
- **Frameworks**: React, Angular, Django, Spring, etc.
- **Databases**: MySQL, MongoDB, PostgreSQL, etc.
- **Cloud Platforms**: AWS, Azure, GCP, etc.
- **Tools**: Docker, Kubernetes, Git, Jenkins, etc.

## Error Handling

The parser includes comprehensive error handling:
- File format validation
- Graceful fallbacks
- Detailed error messages
- Confidence scoring

## Performance Considerations

- **File Size Limit**: 10MB per PDF
- **Processing Time**: 2-5 seconds per resume
- **Memory Usage**: Optimized for batch processing
- **Rate Limiting**: Respects API limits

## Troubleshooting

### Common Issues

1. **PDF extraction fails**
   - Check file is not password protected
   - Ensure file is not corrupted
   - Try different extraction method

2. **AI parsing unavailable**
   - Verify API key configuration
   - Check network connectivity
   - Falls back to rule-based parsing

3. **Low accuracy**
   - Resume format may be non-standard
   - Consider preprocessing text
   - Use AI parsing for better results

### Debug Mode
Enable debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Future Enhancements

- [ ] OCR support for scanned PDFs
- [ ] Multi-language support
- [ ] Custom skill taxonomy
- [ ] Batch processing API
- [ ] Resume scoring and ranking
- [ ] Integration with ATS systems

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request

## License

This enhanced parser is part of the Trinity Jobs project.