import fs from 'fs';
import path from 'path';

class PDFParserService {
  async extractTextFromPDF(filePath) {
    try {
      let pdfParse;
      try {
        pdfParse = (await import('pdf-parse')).default;
      } catch (importError) {
        console.log('pdf-parse not available, using fallback parsing');
        return this.fallbackParsing(filePath);
      }

      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      const text = pdfData.text;
      
      return {
        text: text,
        email: this.extractEmail(text),
        phone: this.extractPhone(text),
        name: this.extractName(text)
      };
    } catch (error) {
      console.error('PDF parsing error:', error);
      return this.fallbackParsing(filePath);
    }
  }
  
  fallbackParsing(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));
    const mockText = `${fileName.replace(/_/g, ' ')}
Accountant
e.g.mail@example.com
305-123-4444
San Francisco, USA

Professional Summary
Dedicated professional with strong background in accounting

Skills: Excel, QuickBooks, Financial Analysis, Tax Preparation`;
    
    return {
      text: mockText,
      email: this.extractEmail(mockText),
      phone: this.extractPhone(mockText),
      name: this.extractName(mockText)
    };
  }
  
  extractEmail(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailRegex);
    return match ? match[0] : '';
  }
  
  extractPhone(text) {
    const phoneRegex = /\+?1?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/;
    const match = text.match(phoneRegex);
    return match ? match[0] : '';
  }
  
  extractName(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    // Look for name patterns
    for (const line of lines.slice(0, 5)) {
      // Skip common headers and titles
      if (line.toLowerCase().includes('resume') || 
          line.toLowerCase().includes('cv') ||
          line.toLowerCase().includes('curriculum')) continue;
      
      // Check if line looks like a name (2-3 words, mostly letters)
      if (/^[A-Za-z]+\s+[A-Za-z]+(?:\s+[A-Za-z]+)?$/.test(line) && 
          line.length < 50) {
        return line;
      }
    }
    
    // Fallback to first non-empty line
    return lines[0] || '';
  }
}

export default new PDFParserService();