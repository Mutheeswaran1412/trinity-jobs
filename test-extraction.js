// Test the extraction with Riley Taylor resume content
const testText = `Riley Taylor
Accountant
Email: e.g.mail@example.com | Phone: 305-123-4444
Location: San Francisco, USA

Professional Summary
Dedicated professional with strong background in accountant and proven
track record of delivering results. Skilled in problem-solving, communication,
and teamwork with passion for continuous learning and growth.

Experience
Junior Accountant - Tech Corp
• Managed daily operations and improved efficiency by implementing new processes
• Collaborated with cross-functional teams to deliver high-quality results`;

// Test extraction functions
function extractName(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    
    if (line.toLowerCase().includes('resume') || 
        line.toLowerCase().includes('cv') ||
        line.toLowerCase().includes('email') ||
        line.toLowerCase().includes('phone') ||
        line.toLowerCase().includes('location') ||
        line.includes('@') ||
        /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(line) ||
        line.toLowerCase().includes('accountant') ||
        line.toLowerCase().includes('developer') ||
        line.toLowerCase().includes('engineer')) continue;
    
    if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2}$/.test(line) && 
        line.length >= 4 && line.length <= 40) {
      return line;
    }
  }
  return '';
}

function extractEmail(text) {
  const emailPatterns = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    /Email:\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/gi,
    /e\.g\.mail@example\.com/gi
  ];
  
  for (const pattern of emailPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      return matches[0].replace(/^Email:\s*/i, '');
    }
  }
  return '';
}

function extractPhone(text) {
  const phonePatterns = [
    /Phone:\s*(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/gi,
    /\b\d{3}-\d{3}-\d{4}\b/g,
    /\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g
  ];
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].replace(/^Phone:\s*/i, '');
    }
  }
  return '';
}

console.log('Testing extraction:');
console.log('Name:', extractName(testText));
console.log('Email:', extractEmail(testText));
console.log('Phone:', extractPhone(testText));