import pdfParserService from './services/pdfParserService.js';
import fs from 'fs';

async function testPDFParser() {
  console.log('Testing PDF Parser...');
  
  // Create a test text to simulate PDF content
  const testText = `
John Doe
Software Engineer
john.doe@email.com
(555) 123-4567
San Francisco, CA

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years in web development

TECHNICAL SKILLS
• JavaScript, TypeScript, Python
• React, Node.js, Express
• MongoDB, PostgreSQL
• AWS, Docker, Git
• Agile, Scrum methodologies

WORK EXPERIENCE
Senior Developer at Tech Corp (2020-2023)
- Developed React applications
- Built REST APIs with Node.js
- Managed MongoDB databases
- Implemented CI/CD pipelines

EDUCATION
Bachelor of Computer Science
University of Technology (2018)
`;

  try {
    console.log('Extracting email...');
    const email = pdfParserService.extractEmail(testText);
    console.log('Email:', email);
    
    console.log('Extracting phone...');
    const phone = pdfParserService.extractPhone(testText);
    console.log('Phone:', phone);
    
    console.log('Extracting name...');
    const name = pdfParserService.extractName(testText);
    console.log('Name:', name);
    
    console.log('Extracting skills...');
    const skills = pdfParserService.extractSkillsFromText(testText);
    console.log('Skills:', skills);
    
    console.log('✅ PDF Parser test completed successfully!');
  } catch (error) {
    console.error('❌ PDF Parser test failed:', error);
  }
}

testPDFParser();