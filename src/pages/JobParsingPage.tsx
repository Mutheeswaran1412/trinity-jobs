import React, { useState } from 'react';
import BackButton from '../components/BackButton';
import Notification from '../components/Notification';
import mistralAIService from '../services/mistralAIService';

interface JobParsingPageProps {
  onNavigate: (page: string, data?: any) => void;
  user?: any;
}

const JobParsingPage: React.FC<JobParsingPageProps> = ({ onNavigate, user }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    isVisible: boolean;
  }>({ type: 'success', message: '', isVisible: false });

  const handleStartParsing = async () => {
    if (!jobDescription.trim()) {
      setNotification({
        type: 'error',
        message: 'Please paste a job description first',
        isVisible: true
      });
      return;
    }

    setIsParsing(true);
    try {
      // Parse job description using AI
      const parsedData = await parseJobDescription(jobDescription);
      
      setNotification({
        type: 'success',
        message: 'Job description parsed successfully! 🎉',
        isVisible: true
      });

      // Navigate to job posting page with parsed data
      setTimeout(() => {
        onNavigate('job-posting', { 
          mode: 'parse', 
          parsedData: parsedData 
        });
      }, 1500);

    } catch (error) {
      console.error('Parsing failed:', error);
      setNotification({
        type: 'error',
        message: 'Failed to parse job description. Please try again.',
        isVisible: true
      });
    } finally {
      setIsParsing(false);
    }
  };

  const parseJobDescription = async (description: string) => {
    // Use AI to extract job details from the description
    try {
      const prompt = `
        Parse the following job description and extract the key information in JSON format:
        
        Job Description:
        ${description}
        
        Please extract and return a JSON object with the following fields:
        {
          "jobTitle": "extracted job title",
          "companyName": "extracted company name",
          "jobLocation": "extracted location",
          "jobType": ["Full-time", "Part-time", etc.],
          "experienceRange": "extracted experience requirement",
          "skills": ["skill1", "skill2", "skill3"],
          "minSalary": "extracted minimum salary",
          "maxSalary": "extracted maximum salary",
          "currency": "USD/INR/EUR etc.",
          "payRate": "per year/per month/per hour",
          "benefits": ["benefit1", "benefit2"],
          "educationLevel": "extracted education requirement",
          "jobDescription": "cleaned and formatted job description"
        }
        
        If any field cannot be extracted, use reasonable defaults or empty values.
      `;

      // For now, we'll use a simple parsing logic
      // In production, you'd use the Mistral AI service
      const parsedData = {
        jobTitle: extractJobTitle(description),
        companyName: extractCompanyName(description),
        jobLocation: extractLocation(description),
        jobType: extractJobType(description),
        experienceRange: extractExperience(description),
        skills: extractSkills(description),
        minSalary: extractSalary(description).min,
        maxSalary: extractSalary(description).max,
        currency: extractSalary(description).currency,
        payRate: extractSalary(description).payRate,
        benefits: extractBenefits(description),
        educationLevel: extractEducation(description),
        jobDescription: description.trim(),
        jobCategory: extractJobCategory(description),
        priority: extractPriority(description),
        clientName: extractClientName(description),
        reportingManager: extractReportingManager(description),
        workAuth: extractWorkAuth(description)
      };

      return parsedData;
    } catch (error) {
      throw new Error('Failed to parse job description');
    }
  };

  // Helper functions to extract information
  const extractJobTitle = (text: string): string => {
    const titlePatterns = [
      /^([^\n\r]+?)\s*[-–—]\s*(?:URGENT|HIGH|PRIORITY|HIRING)/i,
      /job title[:\s-]+([^\n\r]+)/i,
      /position[:\s-]+([^\n\r]+)/i,
      /role[:\s-]+([^\n\r]+)/i,
      /we are looking for[:\sa-z]*[:\s-]*([^\n\r]+)/i,
      /hiring[:\sa-z]*[:\s-]*([^\n\r]+)/i,
      /join us as[:\sa-z]*[:\s-]*([^\n\r]+)/i,
      /seeking[:\sa-z]*[:\s-]*([^\n\r]+)/i,
      /opening for[:\sa-z]*[:\s-]*([^\n\r]+)/i,
      /vacancy for[:\sa-z]*[:\s-]*([^\n\r]+)/i
    ];

    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        let title = match[1].trim().replace(/[\-\|\–\—]/g, '').trim();
        if (title.length > 3 && title.length < 80) {
          return title;
        }
      }
    }

    // Try to extract from first line
    const firstLine = text.split('\n')[0].trim();
    if (firstLine.length > 5 && firstLine.length < 80 && 
        !firstLine.includes('http') && !firstLine.includes('@')) {
      return firstLine.replace(/\s*[-–—].*$/g, '').trim();
    }

    return 'Software Developer';
  };

  const extractCompanyName = (text: string): string => {
    const companyPatterns = [
      /company[:\s-]+([^\n\r]+)/i,
      /organization[:\s-]+([^\n\r]+)/i,
      /employer[:\s-]+([^\n\r]+)/i,
      /at\s+([A-Z][a-zA-Z\s&\.\-]+)(?:\s|,|\.|!|$)/,
      /join\s+([A-Z][a-zA-Z\s&\.\-]+)(?:\s|,|\.|!|$)/i,
      /work\s+(?:at|for|with)\s+([A-Z][a-zA-Z\s&\.\-]+)(?:\s|,|\.|!|$)/i,
      /([A-Z][a-zA-Z\s&\.\-]+)\s+is\s+(?:looking|seeking|hiring)/i,
      /about\s+([A-Z][a-zA-Z\s&\.\-]+)[:\n]/i
    ];

    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        let company = match[1].trim().replace(/[\-\|\–\—].*/g, '').trim();
        // Filter out common non-company words
        if (company.length > 2 && company.length < 50 && 
            !['the team', 'our team', 'us', 'we', 'this role', 'this position'].includes(company.toLowerCase())) {
          return company;
        }
      }
    }

    return 'ZyncJobs';
  };

  const extractLocation = (text: string): string => {
    const locationPatterns = [
      /location[:\s-]+([^\n\r\(]+)/i,
      /based in[:\s-]+([^\n\r\(]+)/i,
      /office[:\s-]+([^\n\r\(]+)/i,
      /work from[:\s-]+([^\n\r\(]+)/i,
      /workplace[:\s-]+([^\n\r\(]+)/i,
      /address[:\s-]+([^\n\r\(]+)/i,
      /(Seattle,\s*WA|New York,\s*NY|San Francisco,\s*CA|Austin,\s*TX|Chicago,\s*IL|Boston,\s*MA|Los Angeles,\s*CA|Denver,\s*CO|Atlanta,\s*GA|Dallas,\s*TX)/i,
      /(remote|hybrid|on-site|work from home|wfh)/i,
      /([A-Z][a-z]+,\s*[A-Z][A-Z])/,  // City, State
      /([A-Z][a-z]+,\s*[A-Z][a-z]+)/  // City, Country
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        let location = match[1].trim().replace(/[\-\|\–\—].*/g, '').trim();
        if (location.length > 2 && location.length < 50) {
          return location;
        }
      }
    }

    // Check for remote work indicators
    if (/remote|work from home|wfh|distributed|anywhere/i.test(text)) {
      return 'Remote';
    }
    if (/hybrid/i.test(text)) {
      return 'Hybrid';
    }

    return 'Remote';
  };

  const extractJobType = (text: string): string[] => {
    const types = [];
    const jobTypePatterns = [
      { pattern: /full.?time|permanent|regular/i, type: 'Full-time' },
      { pattern: /part.?time/i, type: 'Part-time' },
      { pattern: /contract|contractor|freelance|consulting/i, type: 'Contract' },
      { pattern: /intern|internship|trainee/i, type: 'Internship' },
      { pattern: /temporary|temp|seasonal/i, type: 'Temporary' },
      { pattern: /volunteer/i, type: 'Volunteer' }
    ];

    for (const { pattern, type } of jobTypePatterns) {
      if (pattern.test(text)) {
        types.push(type);
      }
    }

    return types.length > 0 ? types : ['Full-time'];
  };

  const extractExperience = (text: string): string => {
    const expPatterns = [
      /experience\s+required[:\s-]+(\d+[\s-]\d+|\d+\+?)\s*years?/i,
      /(\d+)[\s-]+(\d+)\s*years?\s*(?:of\s*)?(?:experience|exp)/i,
      /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/i,
      /(?:experience|exp)[:\s-]+(\d+[\s-]\d+|\d+\+?)\s*years?/i,
      /minimum\s+(\d+)\s*years?/i,
      /at least\s+(\d+)\s*years?/i,
      /(\d+)\s*to\s*(\d+)\s*years?/i,
      /(entry.level|junior|senior|lead|principal)/i,
      /(fresher|fresh graduate|new grad)/i
    ];

    for (const pattern of expPatterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[1] && match[2] && !isNaN(parseInt(match[1])) && !isNaN(parseInt(match[2]))) {
          return `${match[1]}-${match[2]} years`;
        } else if (match[1] && !isNaN(parseInt(match[1]))) {
          const years = parseInt(match[1]);
          if (years >= 10) return '10+ years';
          if (years >= 7) return '7-10 years';
          if (years >= 5) return '5-7 years';
          if (years >= 3) return '3-5 years';
          if (years >= 2) return '2-3 years';
          if (years >= 1) return '1-2 years';
          return '0-1 years';
        } else if (match[1]) {
          const level = match[1].toLowerCase();
          if (level.includes('entry') || level.includes('junior') || level.includes('fresher') || level.includes('fresh')) {
            return '0-2 years';
          } else if (level.includes('senior')) {
            return '5-8 years';
          } else if (level.includes('lead') || level.includes('principal')) {
            return '8+ years';
          }
        }
      }
    }

    return '2-5 years';
  };

  const extractSkills = (text: string): string[] => {
    const commonSkills = [
      // Programming Languages
      'JavaScript', 'Python', 'Java', 'TypeScript', 'PHP', 'C#', 'C++', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Objective-C',
      // Frontend
      'React', 'Angular', 'Vue.js', 'HTML', 'CSS', 'SCSS', 'SASS', 'Bootstrap', 'Tailwind CSS', 'jQuery', 'Webpack', 'Vite',
      // Backend
      'Node.js', 'Express.js', 'Django', 'Flask', 'Spring', 'Laravel', 'Rails', 'ASP.NET', 'FastAPI', 'NestJS',
      // Mobile
      'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin', 'Ionic',
      // Databases
      'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB', 'Oracle', 'SQLite',
      // Cloud & DevOps
      'AWS', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Terraform', 'Ansible', 'Chef', 'Puppet',
      // Tools & Others
      'Git', 'GitHub', 'GitLab', 'Jira', 'Confluence', 'Slack', 'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'TDD', 'BDD',
      // Data & Analytics
      'Machine Learning', 'AI', 'Data Science', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Tableau', 'Power BI',
      // Business Skills
      'Project Management', 'Leadership', 'Communication', 'Problem Solving', 'Team Management', 'Analytical Thinking'
    ];

    const foundSkills = [];
    const lowerText = text.toLowerCase();

    // First pass - exact matches
    for (const skill of commonSkills) {
      const skillLower = skill.toLowerCase();
      if (lowerText.includes(skillLower)) {
        // Check if it's a whole word match or part of a compound word
        const regex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (regex.test(text) || skillLower.includes('.') || skillLower.includes('#')) {
          foundSkills.push(skill);
        }
      }
    }

    // Second pass - look for skills in requirements/qualifications sections
    const skillSections = text.match(/(?:requirements?|qualifications?|skills?|technologies?|tools?)[:\s]*([\s\S]*?)(?:\n\n|$)/gi);
    if (skillSections) {
      for (const section of skillSections) {
        for (const skill of commonSkills) {
          if (!foundSkills.includes(skill) && section.toLowerCase().includes(skill.toLowerCase())) {
            foundSkills.push(skill);
          }
        }
      }
    }

    // Remove duplicates and limit to 10 skills
    const uniqueSkills = [...new Set(foundSkills)];
    return uniqueSkills.length > 0 ? uniqueSkills.slice(0, 10) : ['JavaScript', 'React', 'Node.js'];
  };

  const extractSalary = (text: string) => {
    const salaryPatterns = [
      // Range patterns
      /\$([\d,]+)\s*[-–—to]\s*\$?([\d,]+)\s*(per\s+year|annually|yearly|per\s+month|monthly|per\s+hour|hourly)?/gi,
      /([\d,]+)\s*[-–—to]\s*([\d,]+)\s*(?:USD|INR|EUR|GBP|CAD)\s*(per\s+year|annually|yearly|per\s+month|monthly|per\s+hour|hourly)?/gi,
      /salary[:\s]*\$?([\d,]+)\s*[-–—to]\s*\$?([\d,]+)/gi,
      /compensation[:\s]*\$?([\d,]+)\s*[-–—to]\s*\$?([\d,]+)/gi,
      // Single amount patterns
      /\$([\d,]+)\s*(per\s+year|annually|yearly|per\s+month|monthly|per\s+hour|hourly)/gi,
      /([\d,]+)\s*(?:USD|INR|EUR|GBP|CAD)\s*(per\s+year|annually|yearly|per\s+month|monthly|per\s+hour|hourly)/gi,
      // LPA patterns (Lakhs Per Annum)
      /([\d.]+)\s*[-–—to]\s*([\d.]+)\s*LPA/gi,
      /([\d.]+)\s*LPA/gi
    ];

    let minSalary = '';
    let maxSalary = '';
    let currency = 'USD';
    let payRate = 'per year';

    for (const pattern of salaryPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        if (match[1] && match[2]) {
          // Range found
          minSalary = match[1].replace(/,/g, '');
          maxSalary = match[2].replace(/,/g, '');
          
          // Check for LPA
          if (text.toLowerCase().includes('lpa')) {
            currency = 'INR';
            minSalary = (parseFloat(minSalary) * 100000).toString();
            maxSalary = (parseFloat(maxSalary) * 100000).toString();
          }
          
          if (match[3]) {
            const rate = match[3].toLowerCase();
            if (rate.includes('month')) payRate = 'per month';
            else if (rate.includes('hour')) payRate = 'per hour';
            else payRate = 'per year';
          }
          break;
        } else if (match[1]) {
          // Single amount
          const amount = match[1].replace(/,/g, '');
          if (text.toLowerCase().includes('lpa')) {
            currency = 'INR';
            minSalary = (parseFloat(amount) * 100000 * 0.8).toString();
            maxSalary = (parseFloat(amount) * 100000 * 1.2).toString();
          } else {
            minSalary = (parseFloat(amount) * 0.9).toString();
            maxSalary = (parseFloat(amount) * 1.1).toString();
          }
          
          if (match[2]) {
            const rate = match[2].toLowerCase();
            if (rate.includes('month')) payRate = 'per month';
            else if (rate.includes('hour')) payRate = 'per hour';
            else payRate = 'per year';
          }
          break;
        }
      }
      if (minSalary && maxSalary) break;
    }

    // Detect currency from text
    if (text.includes('₹') || text.toLowerCase().includes('inr') || text.toLowerCase().includes('rupee')) {
      currency = 'INR';
    } else if (text.includes('€') || text.toLowerCase().includes('eur') || text.toLowerCase().includes('euro')) {
      currency = 'EUR';
    } else if (text.includes('£') || text.toLowerCase().includes('gbp') || text.toLowerCase().includes('pound')) {
      currency = 'GBP';
    }

    return {
      min: minSalary || '50000',
      max: maxSalary || '80000',
      currency,
      payRate
    };
  };

  const extractBenefits = (text: string): string[] => {
    const benefits = [];
    const benefitPatterns = [
      { pattern: /health\s*insurance|medical\s*insurance|healthcare/i, benefit: 'Health insurance' },
      { pattern: /dental\s*insurance|dental\s*care/i, benefit: 'Dental insurance' },
      { pattern: /vision\s*insurance|eye\s*care/i, benefit: 'Vision insurance' },
      { pattern: /401k|retirement\s*plan|pension/i, benefit: '401(k)' },
      { pattern: /paid\s*time\s*off|pto|vacation\s*days?|annual\s*leave/i, benefit: 'Paid time off' },
      { pattern: /flexible\s*hours|flexible\s*schedule|flex\s*time/i, benefit: 'Flexible hours' },
      { pattern: /remote\s*work|work\s*from\s*home|wfh/i, benefit: 'Remote work' },
      { pattern: /stock\s*options|equity|shares/i, benefit: 'Stock options' },
      { pattern: /bonus|performance\s*bonus|annual\s*bonus/i, benefit: 'Performance bonus' },
      { pattern: /training|learning|education|courses/i, benefit: 'Professional development' },
      { pattern: /gym|fitness|wellness/i, benefit: 'Wellness programs' },
      { pattern: /maternity|paternity|parental\s*leave/i, benefit: 'Parental leave' },
      { pattern: /life\s*insurance/i, benefit: 'Life insurance' },
      { pattern: /disability\s*insurance/i, benefit: 'Disability insurance' },
      { pattern: /commuter|transport|travel\s*allowance/i, benefit: 'Commuter benefits' },
      { pattern: /lunch|meal|food\s*allowance/i, benefit: 'Meal benefits' }
    ];

    for (const { pattern, benefit } of benefitPatterns) {
      if (pattern.test(text)) {
        benefits.push(benefit);
      }
    }

    return benefits;
  };

  const extractEducation = (text: string): string => {
    if (/bachelor|bs|ba/i.test(text)) return "Bachelor's degree";
    if (/master|ms|ma/i.test(text)) return "Master's degree";
    if (/phd|doctorate/i.test(text)) return "PhD/Doctorate";
    if (/associate/i.test(text)) return "Associate's degree";
    if (/high\s*school/i.test(text)) return "High School Diploma";

    return "Bachelor's degree";
  };

  const extractJobCategory = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    if (/software|developer|engineer|programming|coding|frontend|backend|fullstack/i.test(text)) {
      return 'Software Development';
    }
    if (/data\s*scientist|data\s*analyst|machine\s*learning|ai|analytics/i.test(text)) {
      return 'Data Science & Analytics';
    }
    if (/sales|marketing|business\s*development|account\s*manager/i.test(text)) {
      return 'Sales & Marketing';
    }
    if (/finance|accounting|financial|accountant/i.test(text)) {
      return 'Finance & Accounting';
    }
    if (/hr|human\s*resources|recruiter|talent/i.test(text)) {
      return 'Human Resources';
    }
    if (/healthcare|medical|nurse|doctor|clinical/i.test(text)) {
      return 'Healthcare';
    }
    if (/customer\s*service|support|help\s*desk/i.test(text)) {
      return 'Customer Service';
    }
    if (/operations|logistics|supply\s*chain/i.test(text)) {
      return 'Operations';
    }
    if (/legal|lawyer|attorney|compliance/i.test(text)) {
      return 'Legal';
    }
    if (/education|teacher|instructor|training/i.test(text)) {
      return 'Education';
    }
    
    return 'Information Technology';
  };

  const extractPriority = (text: string): string => {
    if (/urgent|asap|immediately|critical|emergency/i.test(text)) {
      return 'Urgent';
    }
    if (/high\s*priority|important|fast\s*track/i.test(text)) {
      return 'High';
    }
    if (/low\s*priority|flexible|when\s*possible/i.test(text)) {
      return 'Low';
    }
    return 'Medium';
  };

  const extractClientName = (text: string): string => {
    const clientPatterns = [
      /client[:\s-]+([^\n\r]+)/i,
      /for\s+([A-Z][a-zA-Z\s&\.\-]+)(?:\s+division|\s+team|\s+department)/i,
      /on\s+behalf\s+of\s+([A-Z][a-zA-Z\s&\.\-]+)/i
    ];

    for (const pattern of clientPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const client = match[1].trim();
        if (client.length > 2 && client.length < 50) {
          return client;
        }
      }
    }
    return '';
  };

  const extractReportingManager = (text: string): string => {
    const managerPatterns = [
      /reporting\s+manager[:\s-]+([^\n\r]+)/i,
      /report(?:ing)?\s+to[:\s-]+([^\n\r]+)/i,
      /manager[:\s-]+([^\n\r,]+(?:,\s*[^\n\r]+)?)/i,
      /supervisor[:\s-]+([^\n\r]+)/i,
      /reports\s+to[:\s-]+([^\n\r]+)/i
    ];

    for (const pattern of managerPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const manager = match[1].trim();
        if (manager.length > 2 && manager.length < 100) {
          return manager;
        }
      }
    }
    return '';
  };

  const extractWorkAuth = (text: string): string[] => {
    const workAuth = [];
    
    if (/us\s*citizen|citizenship\s*required/i.test(text)) {
      workAuth.push('US Citizen');
    }
    if (/green\s*card|permanent\s*resident/i.test(text)) {
      workAuth.push('Green Card Holder');
    }
    if (/h1b|h-1b/i.test(text)) {
      workAuth.push('H1B Visa');
    }
    if (/l1|l-1/i.test(text)) {
      workAuth.push('L1 Visa');
    }
    if (/opt|cpt|f1/i.test(text)) {
      workAuth.push('OPT/CPT');
    }
    if (/tn\s*visa/i.test(text)) {
      workAuth.push('TN Visa');
    }
    if (/no\s*sponsorship|sponsorship\s*not\s*available/i.test(text)) {
      workAuth.push('No Sponsorship Required');
    }
    if (/will\s*sponsor|sponsorship\s*available|visa\s*sponsorship/i.test(text)) {
      workAuth.push('Will Sponsor');
    }
    
    return workAuth.length > 0 ? workAuth : ['No Sponsorship Required'];
  };

  return (
    <>
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <BackButton 
              onClick={() => onNavigate('job-posting-selection')}
              text="Back"
            />
            <h1 className="text-3xl font-bold text-gray-800">New Job</h1>
            <button 
              onClick={() => onNavigate('dashboard')} 
              className="text-gray-500 text-2xl hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Paste Job Details</h2>
              <p className="text-gray-600">Copy and paste a job description from any source. Our AI will automatically extract and organize the details.</p>
            </div>

            <div className="p-6">
              {/* Rich Text Editor Toolbar */}
              <div className="border border-gray-300 rounded-lg">
                <div className="border-b border-gray-200 p-3 bg-gray-50 flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-200 rounded text-sm font-bold">B</button>
                  <button className="p-2 hover:bg-gray-200 rounded text-sm italic">I</button>
                  <button className="p-2 hover:bg-gray-200 rounded text-sm underline">U</button>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  <button className="p-2 hover:bg-gray-200 rounded text-sm">•</button>
                  <button className="p-2 hover:bg-gray-200 rounded text-sm">1.</button>
                  <div className="w-px h-6 bg-gray-300 mx-2"></div>
                  
                  {/* Styles Dropdown */}
                  <select className="px-3 py-1 border border-gray-300 rounded text-sm bg-white">
                    <option>Styles</option>
                    <option>Normal</option>
                    <option>Heading 1</option>
                    <option>Heading 2</option>
                  </select>
                  
                  {/* Format Dropdown */}
                  <select className="px-3 py-1 border border-gray-300 rounded text-sm bg-white">
                    <option>Format</option>
                    <option>Paragraph</option>
                    <option>Heading</option>
                  </select>
                  
                  {/* Font Dropdown */}
                  <select className="px-3 py-1 border border-gray-300 rounded text-sm bg-white">
                    <option>Font</option>
                    <option>Arial</option>
                    <option>Times New Roman</option>
                    <option>Helvetica</option>
                  </select>
                  
                  {/* Size Dropdown */}
                  <select className="px-3 py-1 border border-gray-300 rounded text-sm bg-white">
                    <option>Size</option>
                    <option>12px</option>
                    <option>14px</option>
                    <option>16px</option>
                    <option>18px</option>
                  </select>
                </div>

                {/* Text Area */}
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste your job description here...

Example:
Software Engineer - Full Stack Developer

We are looking for a talented Full Stack Developer to join our growing team at TechCorp. 

Requirements:
- 3-5 years of experience in web development
- Proficiency in JavaScript, React, Node.js
- Experience with databases (MongoDB, PostgreSQL)
- Bachelor's degree in Computer Science

Benefits:
- Competitive salary $70,000 - $90,000
- Health insurance
- Remote work options
- Flexible hours"
                  className="w-full p-4 min-h-[400px] resize-none border-none outline-none focus:ring-0 text-gray-800"
                  style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px', lineHeight: '1.5' }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() => onNavigate('job-posting-selection')}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartParsing}
                  disabled={!jobDescription.trim() || isParsing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isParsing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Parsing...</span>
                    </>
                  ) : (
                    <>
                      <span>🤖</span>
                      <span>Start Parsing</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div className="flex items-start space-x-2">
                <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <p className="font-medium">Paste Job Description</p>
                  <p>Copy any job posting from LinkedIn, company websites, or job boards</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <p className="font-medium">AI Parsing</p>
                  <p>Our AI extracts job title, requirements, skills, salary, and more</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  <p className="font-medium">Review & Post</p>
                  <p>Review the extracted details and publish your job posting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobParsingPage;