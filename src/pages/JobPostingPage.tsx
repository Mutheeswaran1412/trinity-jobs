import React, { useState, useEffect } from 'react';
import Notification from '../components/Notification';
import mistralAIService from '../services/mistralAIService';
import CompanyAutoSuggest from '../components/CompanyAutoSuggest';

interface JobPostingPageProps {
  onNavigate: (page: string) => void;
}

interface JobData {
  // Step 1: Job Basics
  jobTitle: string;
  locationType: string;
  jobLocation: string;
  expandCandidateSearch: boolean;
  
  // Step 2: Hiring Goals
  hiringTimeline: string;
  numberOfPeople: number;
  
  // Step 3: Job Details
  jobType: string[];
  
  // Step 4: Pay and Benefits
  payType: string;
  minSalary: string;
  maxSalary: string;
  payRate: string;
  benefits: string[];
  
  // Step 5: Job Description
  jobDescription: string;
  
  // Step 6: Qualifications
  skills: string[];
  educationLevel: string;
  certifications: string[];
  
  // Company Information
  companyName: string;
  companyLogo: string;
  companyId: string;
}

const JobPostingPage: React.FC<JobPostingPageProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [jobData, setJobData] = useState<JobData>({
    jobTitle: '',
    locationType: 'In person',
    jobLocation: '',
    expandCandidateSearch: false,
    hiringTimeline: '',
    numberOfPeople: 0,
    jobType: [],
    payType: 'Range',
    minSalary: '108,967.94',
    maxSalary: '131,230.20',
    payRate: 'per year',
    benefits: [],
    jobDescription: '',
    skills: [],
    educationLevel: "Bachelor's degree",
    certifications: [],
    companyName: '',
    companyLogo: '',
    companyId: ''
  });

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    isVisible: boolean;
  }>({ type: 'success', message: '', isVisible: false });

  // AI Suggestions state
  const [jobTitleSuggestions, setJobTitleSuggestions] = useState<string[]>([]);
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showJobTitleSuggestions, setShowJobTitleSuggestions] = useState(false);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isLoadingJobTitles, setIsLoadingJobTitles] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const updateJobData = (field: keyof JobData, value: any) => {
    setJobData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate job description when job title is selected
    if (field === 'jobTitle' && value.length > 2) {
      setTimeout(() => generateJobDescription(value), 500);
    }
  };

  // AI-powered job title suggestions
  const handleJobTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateJobData('jobTitle', value);
    
    if (value.length >= 1) {
      setIsLoadingJobTitles(true);
      
      try {
        const response = await fetch(`http://localhost:5000/api/suggest?q=${encodeURIComponent(value)}&type=job`);
        const data = await response.json();
        console.log('Job title API response:', data);
        
        if (data.suggestions && data.suggestions.length > 0) {
          setJobTitleSuggestions(data.suggestions);
          setShowJobTitleSuggestions(true);
        } else {
          setShowJobTitleSuggestions(false);
        }
      } catch (error) {
        console.error('Job title suggestions failed:', error);
        setShowJobTitleSuggestions(false);
      } finally {
        setIsLoadingJobTitles(false);
      }
    } else {
      setShowJobTitleSuggestions(false);
      setJobTitleSuggestions([]);
    }
  };

  const getFallbackJobTitles = (input: string) => {
    const key = input.toLowerCase();
    const fallbacks: { [key: string]: string[] } = {
      'account': ['Accountant', 'Account Manager', 'Accounting Specialist', 'Account Executive', 'Senior Accountant', 'Accounting Clerk', 'Account Coordinator', 'Accounting Manager'],
      'software': ['Software Developer', 'Software Engineer', 'Software Tester', 'Software Architect', 'Senior Software Engineer', 'Software Quality Engineer', 'Software Consultant', 'Software Product Manager'],
      'data': ['Data Scientist', 'Data Analyst', 'Data Engineer', 'Data Architect', 'Senior Data Scientist', 'Data Product Manager', 'Data Visualization Specialist', 'Big Data Engineer'],
      'marketing': ['Marketing Manager', 'Digital Marketing Specialist', 'Content Marketing Manager', 'Marketing Coordinator', 'Social Media Manager', 'Marketing Analyst', 'Brand Manager', 'Growth Marketing Manager'],
      'sales': ['Sales Representative', 'Sales Manager', 'Account Executive', 'Sales Coordinator', 'Business Development Manager', 'Sales Analyst', 'Inside Sales Representative', 'Sales Director']
    };
    
    for (const [prefix, suggestions] of Object.entries(fallbacks)) {
      if (key.includes(prefix) || prefix.includes(key)) {
        return suggestions;
      }
    }
    return ['Software Developer', 'Marketing Manager', 'Sales Representative', 'Data Analyst', 'Product Manager', 'Business Analyst', 'Project Manager', 'Operations Manager'];
  };

  // AI-powered location suggestions
  const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateJobData('jobLocation', value);
    
    if (value.length >= 1) {
      setIsLoadingLocations(true);
      
      try {
        const response = await fetch(`http://localhost:5000/api/suggest?q=${encodeURIComponent(value)}&type=location`);
        const data = await response.json();
        console.log('Location API response:', data);
        
        if (data.suggestions && data.suggestions.length > 0) {
          setLocationSuggestions(data.suggestions);
          setShowLocationSuggestions(true);
        } else {
          setShowLocationSuggestions(false);
        }
      } catch (error) {
        console.error('Location suggestions failed:', error);
        setShowLocationSuggestions(false);
      } finally {
        setIsLoadingLocations(false);
      }
    } else {
      setShowLocationSuggestions(false);
      setLocationSuggestions([]);
    }
  };

  const getFallbackLocations = (input: string) => {
    const key = input.toLowerCase();
    const fallbacks: { [key: string]: string[] } = {
      'ch': ['Chennai', 'Chicago', 'Charlotte', 'Chandigarh', 'Charleston', 'Chester', 'Christchurch', 'Chengdu'],
      'ban': ['Bangalore', 'Bangkok', 'Bengaluru', 'Barcelona', 'Baton Rouge', 'Bandung', 'Bangor', 'Banjul'],
      'new': ['New York', 'New Delhi', 'Newark', 'Newcastle', 'New Orleans', 'Newport', 'Newton', 'New Haven'],
      'mum': ['Mumbai', 'Munich', 'Montreal', 'Melbourne', 'Murfreesboro', 'Muscat', 'Multan', 'Mysore'],
      'remote': ['Remote', 'Work from Home', 'Hybrid', 'Telecommute', 'Virtual', 'Distributed', 'Online', 'Anywhere']
    };
    
    for (const [prefix, suggestions] of Object.entries(fallbacks)) {
      if (key.startsWith(prefix) || prefix.startsWith(key)) {
        return suggestions;
      }
    }
    return ['Remote', 'New York', 'London', 'Bangalore', 'Chennai', 'Mumbai', 'Singapore', 'Dubai'];
  };

  // AI-powered skill suggestions
  const handleSkillInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkillInput(value);
    
    if (value.length >= 1) {
      setIsLoadingSkills(true);
      
      try {
        const response = await fetch(`http://localhost:5000/api/suggest?q=${encodeURIComponent(value)}&type=skill`);
        const data = await response.json();
        console.log('Skills API response:', data);
        
        if (data.suggestions && data.suggestions.length > 0) {
          setSkillSuggestions(data.suggestions);
          setShowSkillSuggestions(true);
        } else {
          setShowSkillSuggestions(false);
        }
      } catch (error) {
        console.error('Skill suggestions failed:', error);
        setShowSkillSuggestions(false);
      } finally {
        setIsLoadingSkills(false);
      }
    } else {
      setShowSkillSuggestions(false);
      setSkillSuggestions([]);
    }
  };

  const getFallbackSkills = (input: string) => {
    const key = input.toLowerCase();
    const fallbacks: { [key: string]: string[] } = {
      'py': ['Python', 'PyTorch', 'PySpark', 'Pytest', 'Pandas', 'NumPy', 'PyQt', 'Pyramid'],
      'java': ['JavaScript', 'Java', 'jQuery', 'JSON', 'JavaFX', 'Jakarta EE', 'Jackson', 'JUnit'],
      'react': ['React', 'React Native', 'Redux', 'React Router', 'React Hooks', 'React Testing Library', 'Next.js', 'Gatsby'],
      'node': ['Node.js', 'Express.js', 'npm', 'Nodemon', 'NestJS', 'Socket.io', 'Mongoose', 'Passport.js'],
      'aws': ['AWS', 'AWS Lambda', 'AWS S3', 'AWS EC2', 'AWS RDS', 'AWS CloudFormation', 'AWS ECS', 'AWS API Gateway']
    };
    
    for (const [prefix, suggestions] of Object.entries(fallbacks)) {
      if (key.startsWith(prefix) || prefix.startsWith(key)) {
        return suggestions;
      }
    }
    return ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker'];
  };

  // Auto-generate job description and populate skills/education
  const generateJobDescription = async (jobTitle: string) => {
    if (!jobTitle || jobTitle.length < 3) return;
    
    setIsGeneratingDescription(true);
    try {
      const description = await mistralAIService.generateJobDescription(
        jobTitle,
        jobData.companyName || 'ZyncJobs',
        jobData.jobLocation || 'Remote',
        {
          jobType: jobData.jobType.join(', '),
          skills: jobData.skills,
          salary: `$${jobData.minSalary} - $${jobData.maxSalary} ${jobData.payRate}`,
          benefits: jobData.benefits,
          educationLevel: jobData.educationLevel
        }
      );
      updateJobData('jobDescription', description);
      
      // Auto-populate skills and education based on job title
      const { skills, education } = getJobTitleDefaults(jobTitle);
      if (jobData.skills.length === 0 || jobData.skills.every(skill => ['AWS', 'Azure', 'GitHub', 'IT', 'Java', 'Linux', 'Python', 'SQL', 'Version control'].includes(skill))) {
        updateJobData('skills', skills);
      }
      if (jobData.educationLevel === "Bachelor's degree") {
        updateJobData('educationLevel', education);
      }
      
      setNotification({
        type: 'success',
        message: 'Job details generated successfully with AI! 🤖',
        isVisible: true
      });
    } catch (error) {
      console.error('Job description generation failed:', error);
      setNotification({
        type: 'error',
        message: 'Failed to generate job description. Please try again.',
        isVisible: true
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Get default skills and education based on job title
  const getJobTitleDefaults = (jobTitle: string) => {
    const title = jobTitle.toLowerCase();
    
    if (title.includes('accountant') || title.includes('accounting')) {
      return {
        skills: ['QuickBooks', 'Excel', 'Financial Reporting', 'GAAP', 'Tax Preparation', 'Accounts Payable', 'Accounts Receivable', 'SAP'],
        education: "Bachelor's degree in Accounting or Finance"
      };
    }
    
    if (title.includes('marketing')) {
      return {
        skills: ['Digital Marketing', 'Social Media', 'Google Analytics', 'SEO', 'Content Marketing', 'Email Marketing', 'Adobe Creative Suite', 'Campaign Management'],
        education: "Bachelor's degree in Marketing or Communications"
      };
    }
    
    if (title.includes('sales')) {
      return {
        skills: ['CRM Software', 'Lead Generation', 'Negotiation', 'Customer Relationship Management', 'Sales Forecasting', 'Presentation Skills', 'Cold Calling', 'Salesforce'],
        education: "Bachelor's degree in Business or Sales"
      };
    }
    
    if (title.includes('hr') || title.includes('human resources')) {
      return {
        skills: ['HRIS', 'Recruitment', 'Employee Relations', 'Performance Management', 'Benefits Administration', 'Training & Development', 'Employment Law', 'Payroll'],
        education: "Bachelor's degree in Human Resources or related field"
      };
    }
    
    if (title.includes('developer') || title.includes('engineer') || title.includes('programmer')) {
      return {
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker'],
        education: "Bachelor's degree in Computer Science or Engineering"
      };
    }
    
    return {
      skills: ['Communication', 'Problem Solving', 'Team Collaboration', 'Time Management', 'Analytical Thinking', 'Microsoft Office', 'Project Management'],
      education: "Bachelor's degree or equivalent experience"
    };
  };

  // Select suggestions
  const selectJobTitle = (title: string) => {
    updateJobData('jobTitle', title);
    setShowJobTitleSuggestions(false);
    setJobTitleSuggestions([]);
  };

  const selectLocation = (location: string) => {
    updateJobData('jobLocation', location);
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

  const addSkill = (skill: string) => {
    if (!jobData.skills.includes(skill)) {
      updateJobData('skills', [...jobData.skills, skill]);
    }
    setSkillInput('');
    setShowSkillSuggestions(false);
  };

  const removeSkill = (skillToRemove: string) => {
    updateJobData('skills', jobData.skills.filter(skill => skill !== skillToRemove));
  };

  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };


  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-right mb-8">
        <button onClick={() => onNavigate('employer-dashboard')} className="text-gray-500 text-2xl hover:text-gray-700">×</button>
      </div>
      
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Add job basics</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 mb-2">Job post will be in <strong>English</strong> in <strong>United States</strong></p>
        <button className="text-blue-600 text-sm hover:text-blue-700">✏️</button>
      </div>
      
      <div className="space-y-8">
        <div className="relative">
          <label className="block text-gray-700 font-medium mb-3">Job title *</label>
          <div className="relative">
            <input
              type="text"
              value={jobData.jobTitle}
              onChange={handleJobTitleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Software Engineer"
            />
            {isLoadingJobTitles && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          {showJobTitleSuggestions && jobTitleSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {jobTitleSuggestions.map((title, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectJobTitle(title)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm border-b last:border-b-0 transition-colors flex items-center justify-between group"
                >
                  <span>{title}</span>
                  <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">✨ AI</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-3">Job location type *</label>
          <select
            value={jobData.locationType}
            onChange={(e) => updateJobData('locationType', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="In person">In person</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-3">Company *</label>
          <CompanyAutoSuggest
            placeholder="Search for your company..."
            value={jobData.companyName}
            onSelect={(company) => {
              updateJobData('companyName', company.name);
              updateJobData('companyLogo', company.logo);
              updateJobData('companyId', company.id);
            }}
          />
        </div>
        
        <div className="relative">
          <label className="block text-gray-700 font-medium mb-2">What is the job location? *</label>
          <p className="text-gray-500 text-sm mb-3">Enter a street address or ZIP code</p>
          <div className="relative">
            <input
              type="text"
              value={jobData.jobLocation}
              onChange={handleLocationChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Chennai, Remote"
            />
            {isLoadingLocations && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {locationSuggestions.map((location, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectLocation(location)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm border-b last:border-b-0 transition-colors flex items-center justify-between group"
                >
                  <span>{location}</span>
                  <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">📍 AI</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-gray-700 font-medium mb-2">Expand your candidate search</h3>
          <p className="text-gray-500 text-sm mb-4">Over 10 million active job seekers are open to relocating.</p>
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={jobData.expandCandidateSearch}
              onChange={(e) => updateJobData('expandCandidateSearch', e.target.checked)}
              className="mt-1"
            />
            <div>
              <span className="text-gray-700">I'm interested in attracting candidates open to relocation</span>
              <button className="text-blue-600 ml-2 text-sm underline hover:text-blue-700">How it works</button>
              <p className="text-gray-500 text-sm mt-1">Marking your interest helps improve our recommendations.</p>
            </div>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end mt-16">
        <button
          onClick={nextStep}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-blue-700"
        >
          <span>Continue</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-right mb-8">
        <button className="text-gray-400 text-xl">→</button>
      </div>
      
      <h1 className="text-4xl font-bold text-gray-800 mb-12">Hiring goals</h1>
      
      <div className="space-y-8">
        <div>
          <label className="block text-gray-700 font-medium mb-3">Hiring timeline for this job *</label>
          <select
            value={jobData.hiringTimeline}
            onChange={(e) => updateJobData('hiringTimeline', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select an option</option>
            <option value="1 to 3 days">1 to 3 days</option>
            <option value="3 to 7 days">3 to 7 days</option>
            <option value="1 to 2 weeks">1 to 2 weeks</option>
            <option value="2 to 4 weeks">2 to 4 weeks</option>
            <option value="More than 4 weeks">More than 4 weeks</option>
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-3">Number of people to hire in the next 30 days *</label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => updateJobData('numberOfPeople', Math.max(0, jobData.numberOfPeople - 1))}
              className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center text-xl hover:bg-gray-50"
            >
              −
            </button>
            <input
              type="number"
              value={jobData.numberOfPeople}
              onChange={(e) => updateJobData('numberOfPeople', parseInt(e.target.value) || 0)}
              className="w-20 text-center border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => updateJobData('numberOfPeople', jobData.numberOfPeople + 1)}
              className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center text-xl hover:bg-gray-50"
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-16">
        <button
          onClick={prevStep}
          className="flex items-center space-x-2 text-blue-600 font-medium hover:text-blue-700"
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <button
          onClick={nextStep}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-blue-700"
        >
          <span>Continue</span>
          <span>→</span>
        </button>
      </div>
      
      <div className="text-center mt-8">
        <p className="text-gray-500">Have feedback? <button className="text-blue-600 underline hover:text-blue-700">Tell us more.</button></p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-right mb-8">
        <button className="text-gray-400 text-xl">→</button>
      </div>
      
      <h1 className="text-4xl font-bold text-gray-800 mb-12">Add job details</h1>
      
      <div className="space-y-8">
        <div>
          <label className="block text-gray-700 font-medium mb-6">Job type *</label>
          <div className="flex flex-wrap gap-4">
            {['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  const newTypes = jobData.jobType.includes(type)
                    ? jobData.jobType.filter(t => t !== type)
                    : [...jobData.jobType, type];
                  updateJobData('jobType', newTypes);
                }}
                className={`px-6 py-3 border rounded-lg font-medium transition-colors ${
                  jobData.jobType.includes(type)
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                + {type}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-16">
        <button
          onClick={prevStep}
          className="flex items-center space-x-2 text-blue-600 font-medium hover:text-blue-700"
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <button
          onClick={nextStep}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-blue-700"
        >
          <span>Continue</span>
          <span>→</span>
        </button>
      </div>
      
      <div className="text-center mt-8">
        <p className="text-gray-500">Have feedback? <button className="text-blue-600 underline hover:text-blue-700">Tell us more.</button></p>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-right mb-8">
        <button className="text-gray-400 text-xl">→</button>
      </div>
      
      <h1 className="text-4xl font-bold text-gray-800 mb-12">Add pay and benefits</h1>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-gray-700 font-medium mb-2">Pay</h3>
          <p className="text-gray-500 text-sm mb-6">Review the pay we estimated for your job and adjust as needed. Check your local minimum wage. <span className="inline-block w-4 h-4 bg-gray-400 rounded-full text-white text-xs text-center leading-4">i</span></p>
          
          <div className="grid grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-gray-600 text-sm mb-2">Show pay by</label>
              <select
                value={jobData.payType}
                onChange={(e) => updateJobData('payType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Range">Range</option>
                <option value="Starting amount">Starting amount</option>
                <option value="Maximum amount">Maximum amount</option>
                <option value="Exact amount">Exact amount</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-600 text-sm mb-2">Minimum</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="text"
                  value={jobData.minSalary}
                  onChange={(e) => updateJobData('minSalary', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="text-center">
              <span className="text-gray-500">to</span>
            </div>
            
            <div>
              <label className="block text-gray-600 text-sm mb-2">Maximum</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="text"
                  value={jobData.maxSalary}
                  onChange={(e) => updateJobData('maxSalary', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-600 text-sm mb-2">Rate</label>
              <select
                value={jobData.payRate}
                onChange={(e) => updateJobData('payRate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="per year">per year</option>
                <option value="per month">per month</option>
                <option value="per hour">per hour</option>
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-gray-700 font-medium mb-4">Benefits</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              'Visa sponsorship', 'Green card sponsorship', 'Dental insurance',
              'Health insurance', 'Vision insurance', 'AD&D insurance', 'Life insurance'
            ].map((benefit) => (
              <button
                key={benefit}
                type="button"
                onClick={() => {
                  const newBenefits = jobData.benefits.includes(benefit)
                    ? jobData.benefits.filter(b => b !== benefit)
                    : [...jobData.benefits, benefit];
                  updateJobData('benefits', newBenefits);
                }}
                className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                  jobData.benefits.includes(benefit)
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                + {benefit}
              </button>
            ))}
          </div>
          <button className="text-blue-600 text-sm mt-4 hover:text-blue-700">Show 60 more ⌄</button>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-16">
        <button
          onClick={prevStep}
          className="flex items-center space-x-2 text-blue-600 font-medium hover:text-blue-700"
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <button
          onClick={nextStep}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-blue-700"
        >
          <span>Continue</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-right mb-8">
        <button className="text-gray-400 text-xl">→</button>
      </div>
      
      <h1 className="text-4xl font-bold text-gray-800 mb-12">Describe the job</h1>
      
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-gray-700 font-medium">Job description *</label>
            {isGeneratingDescription && (
              <span className="text-blue-600 text-sm flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                Generating with AI...
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mb-4">This is an AI-powered job description. You can edit or replace it. <span className="inline-block w-4 h-4 bg-gray-400 rounded-full text-white text-xs text-center leading-4">i</span></p>
          
          <div className="border border-gray-300 rounded-lg">
            <div className="border-b border-gray-200 p-3 bg-gray-50 flex items-center space-x-2">
              <button className="p-1 hover:bg-gray-200 rounded"><strong>B</strong></button>
              <button className="p-1 hover:bg-gray-200 rounded"><em>I</em></button>
              <button className="p-1 hover:bg-gray-200 rounded">•</button>
              <button className="p-1 hover:bg-gray-200 rounded text-sm">?</button>
            </div>
            <textarea
              value={jobData.jobDescription}
              onChange={(e) => updateJobData('jobDescription', e.target.value)}
              className="w-full p-4 min-h-[300px] resize-none border-none outline-none focus:ring-0"
            />
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <p className="text-gray-600 text-sm">Did you find the AI generated job description useful?</p>
              <button className="text-gray-400 hover:text-gray-600">👍</button>
              <button className="text-gray-400 hover:text-gray-600">👎</button>
            </div>
            <button
              onClick={() => generateJobDescription(jobData.jobTitle)}
              disabled={!jobData.jobTitle || isGeneratingDescription}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors"
            >
              {isGeneratingDescription ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>🤖</span>
                  <span>Generate with AI</span>
                </>
              )}
            </button>
          </div>
          
          <p className="text-gray-500 text-xs mt-2">
            *This is an OpenAI-powered job description. It uses the job title and your location. By using the content, you adopt it as your own and are responsible for its accuracy.
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-16">
        <button
          onClick={prevStep}
          className="flex items-center space-x-2 text-blue-600 font-medium hover:text-blue-700"
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <button
          onClick={nextStep}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-blue-700"
        >
          <span>Continue</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-right mb-8">
        <button className="text-gray-400 text-xl">→</button>
      </div>
      
      <h1 className="text-4xl font-bold text-gray-800 mb-12">Qualifications</h1>
      
      <div className="space-y-8">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <label className="text-gray-700 font-medium">Qualifications</label>
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">10 of 10 selected</span>
          </div>
          <p className="text-gray-500 text-sm mb-4">Please include any key qualifications needed for your job.</p>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="🔍"
          />
          <p className="text-red-500 text-sm mt-2">⚠ Maximum of 10 required qualifications selected.</p>
        </div>
        
        <div>
          <h3 className="text-gray-700 font-medium mb-4">What skills should candidates have?</h3>
          
          {/* Selected Skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {jobData.skills.map((skill, index) => (
              <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {skill}
                <button 
                  type="button" 
                  onClick={() => removeSkill(skill)} 
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          
          {/* Skill Input with AI Suggestions */}
          <div className="relative">
            <input
              type="text"
              value={skillInput}
              onChange={handleSkillInputChange}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && skillInput.trim()) {
                  e.preventDefault();
                  addSkill(skillInput.trim());
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type skills (e.g. Python, React, AWS)..."
            />
            {isLoadingSkills && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            )}
            {showSkillSuggestions && skillSuggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {skillSuggestions.map((skill, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm border-b last:border-b-0 transition-colors flex items-center justify-between group"
                  >
                    <span>{skill}</span>
                    <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">🚀 AI</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Predefined Skills */}
          <div className="flex flex-wrap gap-3 mt-4">
            {[
              'AWS', 'Azure', 'GitHub', 'IT', 'Java', 'Linux',
              'Python', 'SQL', 'Version control', 'React', 'Node.js'
            ].map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => {
                  const newSkills = jobData.skills.includes(skill)
                    ? jobData.skills.filter(s => s !== skill)
                    : [...jobData.skills, skill];
                  updateJobData('skills', newSkills);
                }}
                className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
                  jobData.skills.includes(skill)
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {jobData.skills.includes(skill) ? '✓' : '+'} {skill}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-gray-700 font-medium mb-4">What education level should candidates have?</h3>
          <button
            type="button"
            onClick={() => updateJobData('educationLevel', "Bachelor's degree")}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              jobData.educationLevel === "Bachelor's degree"
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            ✓ Bachelor's degree
          </button>
        </div>
        
        <div>
          <h3 className="text-gray-700 font-medium mb-4">What licenses and certifications should candidates have?</h3>
          <p className="text-gray-500 text-sm">You have not set any preferred licenses or certifications. Search a term to add.</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-16">
        <button
          onClick={prevStep}
          className="flex items-center space-x-2 text-blue-600 font-medium hover:text-blue-700"
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <button
          onClick={nextStep}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 hover:bg-blue-700"
        >
          <span>Continue</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-800 mb-12">Review</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Job details</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Job title</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-800">{jobData.jobTitle || 'Senior Software Engineer'}</span>
                <button className="text-blue-600 hover:text-blue-700">✏️</button>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Company for this job</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-800">ZyncJobs</span>
                <button className="text-blue-600 hover:text-blue-700">✏️</button>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Number of openings</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-800">{jobData.numberOfPeople}</span>
                <button className="text-blue-600 hover:text-blue-700">✏️</button>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Country and language</span>
              <div className="flex items-center space-x-2">
                <div>
                  <div className="text-gray-800">United States</div>
                  <div className="text-gray-800">English</div>
                </div>
                <button className="text-blue-600 hover:text-blue-700">✏️</button>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Location</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-800">{jobData.jobLocation || 'Remote'}</span>
                <button className="text-blue-600 hover:text-blue-700">✏️</button>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Job type</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-800">{jobData.jobType.join(', ') || 'Full-time'}</span>
                <button className="text-blue-600 hover:text-blue-700">✏️</button>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Pay</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-800">${jobData.minSalary} - ${jobData.maxSalary} {jobData.payRate}</span>
                <button className="text-blue-600 hover:text-blue-700">✏️</button>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="text-gray-600">Benefits</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-800">{jobData.benefits.join(', ') || 'Visa sponsorship'}</span>
                <button className="text-blue-600 hover:text-blue-700">✏️</button>
              </div>
            </div>
            
            <div className="flex justify-between items-start py-3">
              <span className="text-gray-600">Job description</span>
              <div className="flex items-start space-x-2 max-w-md">
                <div>
                  <div className="font-medium text-gray-800 mb-2">Overview</div>
                  <p className="text-gray-600 text-sm">
                    We are seeking a highly skilled Senior Software Engineer to join our dynamic development team. This role offers an exciting opportunity to lead innovative
                  </p>
                </div>
                <button className="text-blue-600 mt-1 hover:text-blue-700">✏️</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-16">
        <button
          onClick={prevStep}
          className="flex items-center space-x-2 text-blue-600 font-medium hover:text-blue-700"
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          Post Job
        </button>
      </div>
    </div>
  );

  const handleSubmit = async () => {
    // Get current user data
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    
    const companyName = user?.company || user?.companyName || jobData.companyName || 'ZyncJobs';
    const COMPANY_DOMAIN_MAP: { [key: string]: string } = {
      'google': 'google.com', 'amazon': 'amazon.com', 'microsoft': 'microsoft.com',
      'apple': 'apple.com', 'meta': 'meta.com', 'zoho': 'zoho.com',
      'infosys': 'infosys.com', 'tcs': 'tcs.com', 'wipro': 'wipro.com'
    };
    const lowerName = companyName.toLowerCase().trim();
    const domain = COMPANY_DOMAIN_MAP[lowerName] || `${lowerName}.com`;
    const companyLogo = `https://img.logo.dev/${domain}?token=pk_X-1ZO13CRYuFHfXgt5hQ`;
    
    const jobPostData = {
      jobTitle: jobData.jobTitle,
      company: companyName,
      companyLogo: companyLogo,
      location: jobData.jobLocation,
      jobType: jobData.jobType[0] || 'Full-time',
      description: jobData.jobDescription,
      requirements: jobData.skills,
      skills: jobData.skills,
      salary: {
        min: parseFloat(jobData.minSalary.replace(/,/g, '')) || 0,
        max: parseFloat(jobData.maxSalary.replace(/,/g, '')) || 0,
        currency: 'USD',
        period: jobData.payRate === 'per year' ? 'yearly' : jobData.payRate === 'per month' ? 'monthly' : 'hourly'
      },
      employerEmail: user?.email || 'employer@test.com'
    };
    
    try {
      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobPostData)
      });
      
      if (response.ok) {
        const result = await response.json();
        setNotification({
          type: 'success',
          message: 'Job posted successfully! 🎉',
          isVisible: true
        });
        console.log('Job Posted:', result);
        // Navigate back to employer dashboard after 2 seconds
        setTimeout(() => {
          onNavigate('employer-dashboard');
        }, 2000);
      } else {
        const error = await response.json();
        console.error('Job posting failed:', error);
        setNotification({
          type: 'error',
          message: 'Failed to post job: ' + (error.error || JSON.stringify(error)),
          isVisible: true
        });
      }
    } catch (error) {
      console.error('Error posting job:', error);
      setNotification({
        type: 'error',
        message: 'Error posting job. Please check if the backend server is running.',
        isVisible: true
      });
    }
  };



  return (
    <>
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />
      <div className="min-h-screen bg-white">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}
        {currentStep === 7 && renderStep7()}
      </div>
    </>
  );
};

export default JobPostingPage;