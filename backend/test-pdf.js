import PDFService from './services/pdfService.js';

// Test PDF generation
const testResumeData = {
  template: 'london',
  personalInfo: {
    firstName: 'Rajesh',
    lastName: 'Gupta',
    city: 'Chennai',
    phone: '+91 9876543210',
    email: 'rajeshgupta@rediffmail.com'
  },
  experience: [
    {
      id: 1,
      company: 'Tech Solutions Pvt Ltd',
      position: 'Software Developer',
      location: 'Chennai, India',
      startDate: 'Jan 2022',
      endDate: 'Present',
      current: true,
      description: 'Developed and maintained web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software solutions.'
    }
  ],
  skills: [
    { id: 1, name: 'JavaScript', level: 'PROFESSIONAL' },
    { id: 2, name: 'React', level: 'PROFESSIONAL' },
    { id: 3, name: 'Node.js', level: 'INTERMEDIATE' }
  ],
  about: 'Passionate software developer with 2+ years of experience in full-stack development.'
};

async function testPDF() {
  try {
    console.log('Testing PDF generation...');
    const pdfBuffer = await PDFService.generateResumePDF(testResumeData);
    console.log('PDF generated successfully! Buffer size:', pdfBuffer.length);
    
    // Save to file for testing
    import('fs').then(fs => {
      fs.writeFileSync('test-resume.pdf', pdfBuffer);
      console.log('Test PDF saved as test-resume.pdf');
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
  }
}

testPDF();