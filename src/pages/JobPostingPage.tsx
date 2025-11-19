import React, { useState } from 'react';
import { ArrowLeft, Building, MapPin, DollarSign, Clock, Users, Sparkles } from 'lucide-react';
import Notification from '../components/Notification';
import { aiSuggestions } from '../utils/aiSuggestions';

interface JobPostingPageProps {
  onNavigate: (page: string) => void;
}

const JobPostingPage: React.FC<JobPostingPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    location: '',
    jobType: '',
    salary: '',
    description: '',
    requirements: '',
    skills: [] as string[]
  });

  // Auto-fill company name from logged-in user
  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setFormData(prev => ({
        ...prev,
        company: user.companyName || user.fullName || ''
      }));
    }
  }, []);

  const [isGenerating, setIsGenerating] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [jobTitleSuggestions, setJobTitleSuggestions] = useState<string[]>([]);
  const [showJobTitleSuggestions, setShowJobTitleSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [salarySuggestions, setSalarySuggestions] = useState<string[]>([]);
  const [showSalarySuggestions, setShowSalarySuggestions] = useState(false);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    isVisible: boolean;
  }>({ type: 'success', message: '', isVisible: false });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const generateJobDescription = async () => {
    if (!formData.jobTitle) {
      setNotification({
        type: 'error',
        message: 'Please enter a job title first',
        isVisible: true
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-job-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle: formData.jobTitle,
          company: formData.company,
          jobType: formData.jobType,
          location: formData.location
        })
      });

      if (response.ok) {
        const result = await response.json();
        setFormData({
          ...formData,
          description: result.description,
          requirements: result.requirements
        });
        setNotification({
          type: 'success',
          message: 'Job description generated successfully! ✨',
          isVisible: true
        });
      } else {
        const error = await response.json();
        setNotification({
          type: 'error',
          message: 'Failed to generate job description: ' + (error.error || 'Unknown error'),
          isVisible: true
        });
      }
    } catch (error) {
      console.error('Error generating job description:', error);
      setNotification({
        type: 'error',
        message: 'Error generating job description. Please check if the backend server is running.',
        isVisible: true
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getSkillSuggestions = async (input: string): Promise<string[]> => {
    return await aiSuggestions.getSkillSuggestions(input);
  };

  const handleSkillInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkillInput(value);
    
    if (value.length >= 2) {
      const suggestions = await getSkillSuggestions(value);
      setSkillSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill]
      });
    }
    setSkillInput('');
    setShowSuggestions(false);
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleJobTitleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, jobTitle: value });
    
    if (value.length >= 2) {
      try {
        const response = await fetch('http://localhost:5000/api/suggest-job-titles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: value })
        });
        
        if (response.ok) {
          const result = await response.json();
          setJobTitleSuggestions(result.suggestions || []);
          setShowJobTitleSuggestions(true);
        }
      } catch (error) {
        console.error('Job title suggestions failed:', error);
        setShowJobTitleSuggestions(false);
      }
    } else {
      setShowJobTitleSuggestions(false);
    }
  };

  const handleLocationSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, location: value });
    
    if (value.length >= 2) {
      try {
        const response = await fetch('http://localhost:5000/api/suggest-locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: value })
        });
        
        if (response.ok) {
          const result = await response.json();
          setLocationSuggestions(result.suggestions || []);
          setShowLocationSuggestions(true);
        }
      } catch (error) {
        console.error('Location suggestions failed:', error);
        setShowLocationSuggestions(false);
      }
    } else {
      setShowLocationSuggestions(false);
    }
  };

  const selectJobTitle = (title: string) => {
    setFormData({ ...formData, jobTitle: title });
    setShowJobTitleSuggestions(false);
  };

  const handleJobTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && jobTitleSuggestions.length > 0 && showJobTitleSuggestions) {
      e.preventDefault();
      selectJobTitle(jobTitleSuggestions[0]);
    }
  };

  const selectLocation = (location: string) => {
    setFormData({ ...formData, location: location });
    setShowLocationSuggestions(false);
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && locationSuggestions.length > 0 && showLocationSuggestions) {
      e.preventDefault();
      selectLocation(locationSuggestions[0]);
    }
  };

  const getJobTitleSuggestions = async (input: string): Promise<string[]> => {
    return await aiSuggestions.getJobSuggestions(input);
  };

  const getLocationSuggestions = async (input: string): Promise<string[]> => {
    return await aiSuggestions.getLocationSuggestions(input);
  };

  const generateJobTitleWithAI = async () => {
    if (!formData.company) {
      setNotification({
        type: 'info',
        message: 'Add company name first for better job title suggestions',
        isVisible: true
      });
      return;
    }

    try {
      const suggestions = await aiSuggestions.generateJobTitlesForCompany(formData.company);
      setJobTitleSuggestions(suggestions);
      setShowJobTitleSuggestions(true);
      setNotification({
        type: 'success',
        message: 'AI job title suggestions generated!',
        isVisible: true
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to generate job titles',
        isVisible: true
      });
    }
  };

  const suggestLocationsWithAI = async () => {
    try {
      const suggestions = await aiSuggestions.getPopularJobLocations();
      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(true);
      setNotification({
        type: 'success',
        message: 'Popular job locations suggested!',
        isVisible: true
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to get location suggestions',
        isVisible: true
      });
    }
  };

  const handleSalarySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, salary: value });
    
    if (value.length >= 1) {
      const suggestions = generateSalaryRanges(value);
      setSalarySuggestions(suggestions);
      setShowSalarySuggestions(true);
    } else {
      setShowSalarySuggestions(false);
    }
  };

  const generateSalaryRanges = (input: string): string[] => {
    const baseRanges = [
      '$50,000 - $70,000',
      '$70,000 - $90,000', 
      '$90,000 - $120,000',
      '$120,000 - $150,000',
      '$150,000 - $180,000',
      '$180,000 - $220,000'
    ];
    
    // If user typed numbers, generate ranges around that number
    const numbers = input.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      const baseNum = parseInt(numbers[0]) * (input.includes('k') || input.includes('K') ? 1000 : 1);
      const suggestions = [];
      
      for (let i = 0; i < 6; i++) {
        const min = Math.max(30000, baseNum - 20000 + (i * 15000));
        const max = min + 30000;
        suggestions.push(`$${min.toLocaleString()} - $${max.toLocaleString()}`);
      }
      
      return suggestions;
    }
    
    return baseRanges;
  };

  const selectSalary = (salary: string) => {
    setFormData({ ...formData, salary: salary });
    setShowSalarySuggestions(false);
  };



  const suggestSalaryWithAI = async () => {
    if (!formData.jobTitle) {
      setNotification({
        type: 'info',
        message: 'Add job title first for accurate salary suggestions',
        isVisible: true
      });
      return;
    }

    try {
      const suggestions = await aiSuggestions.getSalaryRangeForRole(formData.jobTitle, formData.location);
      setSalarySuggestions(suggestions);
      setShowSalarySuggestions(true);
      setNotification({
        type: 'success',
        message: 'AI salary ranges suggested based on role and location!',
        isVisible: true
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to get salary suggestions',
        isVisible: true
      });
    }
  };

  const suggestSkillsWithAI = async () => {
    if (!formData.jobTitle) {
      setNotification({
        type: 'info',
        message: 'Add job title first for relevant skill suggestions',
        isVisible: true
      });
      return;
    }

    try {
      const suggestions = await aiSuggestions.suggestSkillsForRole(formData.jobTitle);
      const newSkills = suggestions.filter(skill => !formData.skills.includes(skill));
      
      if (newSkills.length > 0) {
        setFormData({ 
          ...formData, 
          skills: [...formData.skills, ...newSkills.slice(0, 5)] 
        });
        setNotification({
          type: 'success',
          message: `Added ${newSkills.slice(0, 5).length} AI-suggested skills!`,
          isVisible: true
        });
      } else {
        setNotification({
          type: 'info',
          message: 'No new skills to suggest. Your skills look comprehensive!',
          isVisible: true
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to get skill suggestions',
        isVisible: true
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get current user data
    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;
    
    const jobData = {
      title: formData.jobTitle,
      company: formData.company,
      location: formData.location,
      type: formData.jobType,
      salary: formData.salary,
      description: formData.description,
      requirements: formData.requirements,
      skills: formData.skills,
      employer_id: user?.id,
      employer_email: user?.email
    };
    
    try {
      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobData)
      });
      
      if (response.ok) {
        const result = await response.json();
        setNotification({
          type: 'success',
          message: 'Job posted successfully! 🎉',
          isVisible: true
        });
        console.log('Job Posted:', result);
        // Navigate back to company dashboard after 2 seconds
        setTimeout(() => {
          onNavigate('employer-dashboard');
        }, 2000);
      } else {
        const error = await response.json();
        setNotification({
          type: 'error',
          message: 'Failed to post job: ' + (error.error || 'Unknown error'),
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
      <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={() => onNavigate('employer-dashboard')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Post a Job</h1>
          <p className="text-gray-600 mt-2">Find the perfect candidate for your team</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleJobTitleSearch}
                  onKeyDown={handleJobTitleKeyDown}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Senior React Developer"
                />
                {showJobTitleSuggestions && jobTitleSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {jobTitleSuggestions.map((title, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectJobTitle(title)}
                        onMouseDown={(e) => e.preventDefault()}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b last:border-b-0"
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={generateJobTitleWithAI}
                  className="absolute right-2 top-9 text-blue-600 hover:text-blue-700 transition-colors"
                  title="Generate job title suggestions with AI"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  placeholder="Your company name"
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleLocationSearch}
                  onKeyDown={handleLocationKeyDown}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. San Francisco, CA or Remote"
                />
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {locationSuggestions.map((location, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectLocation(location)}
                        onMouseDown={(e) => e.preventDefault()}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b last:border-b-0"
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={suggestLocationsWithAI}
                  className="absolute right-2 top-9 text-blue-600 hover:text-blue-700 transition-colors"
                  title="Suggest popular job locations with AI"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  required
                  title="Select job type"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select job type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleSalarySearch}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. $120,000 - $160,000"
              />
              {showSalarySuggestions && salarySuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {salarySuggestions.map((salary, index) => (
                    <button
                      key={index}
                      type="button"
                      onMouseDown={() => selectSalary(salary)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b last:border-b-0"
                    >
                      {salary}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={suggestSalaryWithAI}
                className="absolute right-2 top-9 text-blue-600 hover:text-blue-700 transition-colors"
                title="Get AI salary suggestions based on role and location"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Job Description *</label>
                <button
                  type="button"
                  onClick={generateJobDescription}
                  disabled={isGenerating || !formData.jobTitle}
                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {isGenerating ? 'Generating...' : 'AI Generate'}
                </button>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Key Skills *</label>
                <button
                  type="button"
                  onClick={suggestSkillsWithAI}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI Suggest</span>
                </button>
              </div>
              <div className="relative">
                <div className="border border-gray-300 rounded-lg p-3 min-h-[80px] focus-within:ring-2 focus-within:ring-blue-500">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.skills.map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="ml-2 text-blue-600">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
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
                    placeholder="Type skills (e.g., Python, React)..."
                    className="w-full border-none outline-none text-sm"
                  />
                </div>
                {showSuggestions && skillSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg">
                    {skillSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onMouseDown={() => addSkill(suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Requirements *</label>
                <span className="text-xs text-gray-500">Auto-filled with job description</span>
              </div>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="List the required skills, experience, and qualifications..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => onNavigate('employer-dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Post Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default JobPostingPage;