# Required Dependencies for Resume Moderation

Add these to your backend package.json dependencies:

```json
{
  "dependencies": {
    "multer": "^1.4.5-lts.1",
    "pdf-parse": "^1.1.1", 
    "mammoth": "^1.6.0"
  }
}
```

Install with:
```bash
npm install multer pdf-parse mammoth
```

These packages provide:
- **multer**: File upload handling
- **pdf-parse**: PDF text extraction
- **mammoth**: DOC/DOCX text extraction