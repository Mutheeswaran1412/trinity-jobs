import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { Upload, User, Briefcase, GraduationCap, Target, Save, Sparkles } from 'lucide-react';
import Notification from '../components/Notification';
import BackButton from '../components/BackButton';
import { aiSuggestions } from '../utils/aiSuggestions';

interface CandidateProfilePageProps {
  onNavigate?: (page: string) => void;
}

const CandidateProfilePage: React.FC<CandidateProfilePageProps> = ({ onNavigate }) => {
  
  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        
        // Try to load latest profile from backend
        try {
          const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/${parsedUser.id || parsedUser._id || parsedUser.email}`);
          if (response.ok) {
            const profileData = await response.json();
            // Merge backend profile data with localStorage data
            setFormData({
              fullName: profileData.name || parsedUser.name || parsedUser.fullName || '',
              email: profileData.email || parsedUser.email || '',
              phone: profileData.phone || parsedUser.phone || '',
              location: profileData.location || parsedUser.location || '',
              skills: profileData.skills || parsedUser.skills || [],
              experience: profileData.experience || parsedUser.experience || '',
              jobTitle: profileData.title || parsedUser.title || parsedUser.jobTitle || '',
              salary: profileData.salary || parsedUser.salary || '',
              jobType: profileData.jobType || parsedUser.jobType || '',
              education: profileData.education || parsedUser.education || '',
              certifications: profileData.certifications || parsedUser.certifications || '',
              resume: null,
              yearsExperience: profileData.yearsExperience || parsedUser.yearsExperience || '',
              workAuthorization: profileData.workAuthorization || parsedUser.workAuthorization || '',
              securityClearance: profileData.securityClearance || parsedUser.securityClearance || '',
              companyName: profileData.companyName || parsedUser.companyName || '',
              roleTitle: profileData.roleTitle || parsedUser.roleTitle || ''
            });
          } else {
            // Fallback to localStorage data if backend fails
            setFormData({
              fullName: parsedUser.name || parsedUser.fullName || '',
              email: parsedUser.email || '',
              phone: parsedUser.phone || '',
              location: parsedUser.location || '',
              skills: parsedUser.skills || [],
              experience: parsedUser.experience || '',
              jobTitle: parsedUser.title || parsedUser.jobTitle || '',
              salary: parsedUser.salary || '',
              jobType: parsedUser.jobType || '',
              education: parsedUser.education || '',
              certifications: parsedUser.certifications || '',
              resume: null,
              yearsExperience: parsedUser.yearsExperience || '',
              workAuthorization: parsedUser.workAuthorization || '',
              securityClearance: parsedUser.securityClearance || '',
              companyName: parsedUser.companyName || '',
              roleTitle: parsedUser.roleTitle || ''
            });
          }
        } catch (error) {
          console.log('Profile load error:', error);
          // Fallback to localStorage data
          setFormData({
            fullName: parsedUser.name || parsedUser.fullName || '',
            email: parsedUser.email || '',
            phone: parsedUser.phone || '',
            location: parsedUser.location || '',
            skills: parsedUser.skills || [],
            experience: parsedUser.experience || '',
            jobTitle: parsedUser.title || parsedUser.jobTitle || '',
            salary: parsedUser.salary || '',
            jobType: parsedUser.jobType || '',
            education: parsedUser.education || '',
            certifications: parsedUser.certifications || '',
            resume: null,
            yearsExperience: parsedUser.yearsExperience || '',
            workAuthorization: parsedUser.workAuthorization || '',
            securityClearance: parsedUser.securityClearance || '',
            companyName: parsedUser.companyName || '',
            roleTitle: parsedUser.roleTitle || ''
          });
        }
      }
    };
    
    loadProfile();
  }, []);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    isVisible: boolean;
  }>({ type: 'success', message: '', isVisible: false });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    skills: [] as string[],
    experience: '',
    jobTitle: '',
    salary: '',
    jobType: '',
    education: '',
    certifications: '',
    resume: null as File | null,
    yearsExperience: '',
    workAuthorization: '',
    securityClearance: '',
    companyName: '',
    roleTitle: '',
    // New comprehensive fields
    profileSummary: '',
    internships: '',
    projects: '',
    awards: '',
    clubsCommittees: '',
    competitiveExams: '',
    employment: '',
    academicAchievements: '',
    languages: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [jobSuggestions, setJobSuggestions] = useState<string[]>([]);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setNotification({
          type: 'error',
          message: 'File size must be less than 10MB',
          isVisible: true
        });
        return;
      }
      
      // Validate file type - Updated to match Naukri formats
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/rtf'];
      if (!allowedTypes.includes(file.type)) {
        setNotification({
          type: 'error',
          message: 'Only PDF, DOC, DOCX, RTF files are allowed',
          isVisible: true
        });
        return;
      }
      
      // Store file locally without backend upload
      setFormData({
        ...formData,
        resume: {
          name: file.name,
          size: file.size,
          type: file.type,
          uploadDate: new Date().toLocaleDateString()
        } as any
      });
      
      setNotification({
        type: 'success',
        message: 'Resume uploaded successfully!',
        isVisible: true
      });
    }
  };

  const getSkillSuggestions = async (input: string): Promise<string[]> => {
    return await aiSuggestions.getSkillSuggestions(input);
  };

  const getLocationSuggestions = (input: string): string[] => {
    const locations = [
      'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
      'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
      'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
      'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Washington, DC',
      'Boston, MA', 'El Paso, TX', 'Nashville, TN', 'Detroit, MI', 'Oklahoma City, OK',
      'Portland, OR', 'Las Vegas, NV', 'Memphis, TN', 'Louisville, KY', 'Baltimore, MD',
      'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ', 'Fresno, CA', 'Sacramento, CA',
      'Atlanta, GA', 'Kansas City, MO', 'Colorado Springs, CO', 'Miami, FL', 'Raleigh, NC',
      'Omaha, NE', 'Long Beach, CA', 'Virginia Beach, VA', 'Oakland, CA', 'Minneapolis, MN',
      'Tampa, FL', 'Tulsa, OK', 'Arlington, TX', 'New Orleans, LA', 'Wichita, KS'
    ];
    return locations.filter(location => 
      location.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 10);
  };

  const getJobTitleSuggestions = (input: string): string[] => {
    const jobTitles = [
      'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
      'Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'DevOps Engineer',
      'Product Manager', 'Project Manager', 'Business Analyst', 'UX Designer', 'UI Designer',
      'Cybersecurity Analyst', 'Cloud Architect', 'Database Administrator', 'QA Engineer',
      'Mobile Developer', 'iOS Developer', 'Android Developer', 'React Developer',
      'Python Developer', 'Java Developer', 'JavaScript Developer', 'Node.js Developer',
      'AWS Solutions Architect', 'Azure Cloud Engineer', 'Salesforce Developer',
      'Marketing Manager', 'Sales Representative', 'Customer Success Manager',
      'HR Manager', 'Financial Analyst', 'Accountant', 'Operations Manager',
      'Content Writer', 'Digital Marketing Specialist', 'SEO Specialist',
      'Graphic Designer', 'Video Editor', 'Social Media Manager'
    ];
    return jobTitles.filter(job => 
      job.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 10);
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

  const handleLocationSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, location: value });
    
    if (value.length >= 2) {
      const suggestions = getLocationSuggestions(value);
      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
    }
  };

  const handleJobTitleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, jobTitle: value });
    
    if (value.length >= 2) {
      const suggestions = getJobTitleSuggestions(value);
      setJobSuggestions(suggestions);
      setShowJobSuggestions(true);
    } else {
      setShowJobSuggestions(false);
    }
  };

  const selectLocation = (location: string) => {
    setFormData({ ...formData, location });
    setShowLocationSuggestions(false);
  };

  const selectJobTitle = (jobTitle: string) => {
    setFormData({ ...formData, jobTitle });
    setShowJobSuggestions(false);
  };

  const generateExperienceWithAI = async () => {
    if (!formData.companyName || !formData.roleTitle) {
      setNotification({
        type: 'info',
        message: 'Please add company name and role title first to generate relevant experience.',
        isVisible: true
      });
      return;
    }

    try {
      // Use fallback experience generation directly
      const skillsText = formData.skills.length > 0 ? formData.skills.slice(0, 3).join(', ') : 'modern technologies';
      const company = formData.companyName;
      const role = formData.roleTitle;
      
      const experienceTemplate = `• Worked as ${role} at ${company}, developing and maintaining scalable applications using ${skillsText}
• Collaborated with cross-functional teams to deliver high-quality software solutions on time and within budget
• Implemented best practices for code quality, testing, and deployment, improving overall system reliability by 30%
• Participated in code reviews and mentored junior developers, contributing to team knowledge sharing and growth
• Optimized application performance and user experience, resulting in improved customer satisfaction and engagement`;
      
      setFormData({ ...formData, experience: experienceTemplate });
      setNotification({
        type: 'success',
        message: 'Experience generated successfully! Feel free to customize it.',
        isVisible: true
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to generate experience. Please try again.',
        isVisible: true
      });
    }
  };

  const improveExperienceWithAI = async () => {
    if (!formData.experience.trim()) return;

    try {
      const improvedExperience = await aiSuggestions.improveExperience(formData.experience);
      setFormData({ ...formData, experience: improvedExperience });
      setNotification({
        type: 'success',
        message: 'Experience improved with AI suggestions!',
        isVisible: true
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to improve experience. Please try again.',
        isVisible: true
      });
    }
  };

  const suggestSkillsWithAI = async () => {
    if (!formData.jobTitle) {
      setNotification({
        type: 'info',
        message: 'Please add a job title first to get relevant skill suggestions.',
        isVisible: true
      });
      return;
    }

    try {
      const suggestedSkills = await aiSuggestions.suggestSkillsForRole(formData.jobTitle);
      const newSkills = suggestedSkills.filter(skill => !formData.skills.includes(skill));
      
      if (newSkills.length > 0) {
        setFormData({ 
          ...formData, 
          skills: [...formData.skills, ...newSkills.slice(0, 5)] 
        });
        setNotification({
          type: 'success',
          message: `Added ${newSkills.slice(0, 5).length} AI-suggested skills for ${formData.jobTitle}!`,
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
        message: 'Failed to get skill suggestions. Please try again.',
        isVisible: true
      });
    }
  };

  const optimizeSkillsWithAI = async () => {
    if (formData.skills.length === 0) return;

    try {
      const optimizedSkills = await aiSuggestions.optimizeSkills(formData.skills, formData.jobTitle);
      setFormData({ ...formData, skills: optimizedSkills });
      setNotification({
        type: 'success',
        message: 'Skills optimized for better job matching!',
        isVisible: true
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to optimize skills. Please try again.',
        isVisible: true
      });
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

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Removed cover upload functionality
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      const profileData = {
        userId: existingUser.id || existingUser._id,
        email: formData.email || existingUser.email,
        name: formData.fullName,
        phone: formData.phone,
        location: formData.location,
        title: formData.jobTitle,
        yearsExperience: formData.yearsExperience,
        skills: formData.skills,
        experience: formData.experience,
        education: formData.education,
        certifications: formData.certifications,
        workAuthorization: formData.workAuthorization,
        securityClearance: formData.securityClearance,
        salary: formData.salary,
        jobType: formData.jobType,
        resume: formData.resume,
        companyName: formData.companyName,
        roleTitle: formData.roleTitle
      };
      
      // Update localStorage
      const updatedUser = {
        ...existingUser,
        ...profileData,
        fullName: formData.fullName,
        companyName: formData.companyName,
        roleTitle: formData.roleTitle,
        // Add all comprehensive profile fields
        profileSummary: formData.profileSummary,
        employment: formData.employment,
        projects: formData.projects,
        internships: formData.internships,
        languages: formData.languages,
        awards: formData.awards,
        clubsCommittees: formData.clubsCommittees,
        competitiveExams: formData.competitiveExams,
        academicAchievements: formData.academicAchievements,
        profile: {
          ...existingUser.profile,
          skills: formData.skills,
          experience: formData.yearsExperience,
          bio: formData.experience,
          companyName: formData.companyName,
          roleTitle: formData.roleTitle,
          profileSummary: formData.profileSummary,
          employment: formData.employment,
          projects: formData.projects,
          internships: formData.internships,
          languages: formData.languages,
          awards: formData.awards,
          clubsCommittees: formData.clubsCommittees,
          competitiveExams: formData.competitiveExams,
          academicAchievements: formData.academicAchievements
        }
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Save to backend
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
      
      setNotification({
        type: 'success',
        message: 'Profile saved successfully!',
        isVisible: true
      });
      
      setTimeout(() => {
        onNavigate && onNavigate('dashboard');
      }, 2000);
    } catch (error) {
      console.error('Profile save error:', error);
      setNotification({
        type: 'error',
        message: 'Error saving profile!',
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
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <BackButton 
              onClick={() => onNavigate && onNavigate('dashboard')}
              text="Back"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors mb-4"
            />
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{formData.fullName || 'mutheeswaran'}</h1>
                  <p className="text-lg text-gray-600">{formData.jobTitle || 'Software Developer'}</p>
                  <p className="text-sm text-gray-500">{formData.location || 'chennai'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Banner */}
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Complete Your Profile</h3>
              <p className="text-yellow-700 mb-3">Fill in your details to appear in employer searches and get matched with the best job opportunities</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Required for visibility:</strong> Full Name, Skills, Location, and Job Title are required to appear in candidate searches.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Profile Summary</h2>
                  </div>
                  <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Add</button>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-3">Your Profile Summary should mention the highlights of your career and education, what your professional interests are, and what kind of a career you are looking for. Write a meaningful summary of more than 50 characters.</p>
                  <textarea
                    name="profileSummary"
                    placeholder="Write a compelling profile summary that highlights your key achievements, skills, and career aspirations..."
                    value={formData.profileSummary}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Personal Information Card */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="mutheeswaran"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="mutheeswaran128@gmail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="09500366784"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                    <input
                      type="text"
                      name="jobTitle"
                      placeholder="Software Developer"
                      value={formData.jobTitle}
                      onChange={handleJobTitleSearch}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {showJobSuggestions && jobSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {jobSuggestions.map((job, index) => (
                          <button
                            key={index}
                            type="button"
                            onMouseDown={() => selectJobTitle(job)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b last:border-b-0"
                          >
                            {job}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="chennai"
                      value={formData.location}
                      onChange={handleLocationSearch}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {showLocationSuggestions && locationSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {locationSuggestions.map((location, index) => (
                          <button
                            key={index}
                            type="button"
                            onMouseDown={() => selectLocation(location)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b last:border-b-0"
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                    <select
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Years of experience"
                    >
                      <option value="">Select experience</option>
                      <option value="0-1">0-1 years</option>
                      <option value="2-3">2-3 years</option>
                      <option value="4-5">4-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Work Authorization</label>
                    <select
                      name="workAuthorization"
                      value={formData.workAuthorization}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Work authorization status"
                    >
                      <option value="">Select status</option>
                      <option value="us-citizen">US Citizen</option>
                      <option value="green-card">Green Card Holder</option>
                      <option value="h1b">H1B Visa</option>
                      <option value="opt">OPT</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Security Clearance (Optional)</label>
                    <select
                      name="securityClearance"
                      value={formData.securityClearance}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Security clearance level"
                    >
                      <option value="">Select clearance</option>
                      <option value="none">No Clearance</option>
                      <option value="confidential">Confidential</option>
                      <option value="secret">Secret</option>
                      <option value="top-secret">Top Secret</option>
                      <option value="ts-sci">TS/SCI</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Upload Card */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Upload className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Resume</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="resume-upload" className="block text-sm font-medium text-gray-700 mb-2">Upload Resume</label>
                    <p className="text-sm text-gray-600 mb-3">Your resume is the first impression you make on potential employers. Craft it carefully to secure your desired job or internship.</p>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,.rtf"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-sm text-gray-500 mt-2">{formData.resume ? (formData.resume as any).name : 'No file chosen'}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Supported formats: doc, docx, rtf, pdf, up to 2MB</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800 font-medium mb-2">Our AI checks for:</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Spam or inappropriate content</li>
                      <li>• File format and size validation</li>
                      <li>• Duplicate or fake resumes</li>
                      <li>• Profile information matching</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Experience Card */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Skills & Experience</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Skills *</label>
                    <div className="relative">
                      <div className="border border-gray-300 rounded-lg p-4 min-h-[100px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {formData.skills.map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-blue-100 text-blue-800 border">
                              {skill}
                              <button type="button" onClick={() => removeSkill(skill)} className="ml-2 text-blue-600 hover:text-blue-800">
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
                          placeholder="Type skills (e.g., React, Python, AWS)..."
                          className="w-full border-none outline-none text-sm bg-transparent"
                          aria-label="Add skills to your profile"
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
                    <div className="flex flex-wrap gap-3 mt-3">
                      <button
                        type="button"
                        onClick={suggestSkillsWithAI}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>AI Skill Suggestions</span>
                      </button>
                      <button
                        type="button"
                        onClick={optimizeSkillsWithAI}
                        disabled={formData.skills.length === 0}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 disabled:text-gray-400 rounded-lg transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Optimize Skills</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Work Experience</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <input
                          type="text"
                          name="companyName"
                          placeholder="Company Name (e.g., Google, Microsoft)"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          name="roleTitle"
                          placeholder="Role Title (e.g., Senior Software Engineer)"
                          value={formData.roleTitle}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="relative">
                      <textarea
                        name="experience"
                        placeholder="Describe your previous roles, achievements, and responsibilities..."
                        value={formData.experience}
                        onChange={handleInputChange}
                        rows={5}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex flex-wrap gap-3 mt-3">
                        <button
                          type="button"
                          onClick={generateExperienceWithAI}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Generate with AI</span>
                        </button>
                        <button
                          type="button"
                          onClick={improveExperienceWithAI}
                          disabled={!formData.experience.trim()}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 disabled:text-gray-400 rounded-lg transition-colors"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Improve with AI</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Preferences Card */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                    <Target className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Job Preferences</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Desired Job Title</label>
                    <input
                      type="text"
                      name="jobTitle"
                      placeholder="Software Developer"
                      value={formData.jobTitle}
                      onChange={handleJobTitleSearch}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {showJobSuggestions && jobSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {jobSuggestions.map((job, index) => (
                          <button
                            key={index}
                            type="button"
                            onMouseDown={() => selectJobTitle(job)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b last:border-b-0"
                          >
                            {job}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary</label>
                    <input
                      type="text"
                      name="salary"
                      placeholder="$30,000 - $60,000"
                      value={formData.salary}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Job type preference"
                    >
                      <option value="">Select job type</option>
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Education & Certifications Card */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Education</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                    <textarea
                      name="education"
                      placeholder="Education (degree, university, graduation year)"
                      value={formData.education}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Comprehensive Profile Sections */}
            {/* Languages Card */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <GraduationCap className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Languages</h2>
                  </div>
                  <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Add</button>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-3">Talk about the languages that you can speak, read or write</p>
                  <textarea
                    name="languages"
                    placeholder="English (Fluent), Tamil (Native), Hindi (Conversational)..."
                    value={formData.languages}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Employment Card */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Employment</h2>
                  </div>
                  <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Add</button>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-3">Talk about the company you worked at, your designation and describe what all you did there</p>
                  <textarea
                    name="employment"
                    placeholder="Company Name, Designation, Duration, Key Responsibilities and Achievements..."
                    value={formData.employment}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Projects Card */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
                  </div>
                  <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Add</button>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-3">Talk about your projects that made you proud and contributed to your learnings</p>
                  <textarea
                    name="projects"
                    placeholder="Project Name, Technologies Used, Duration, Description, and Key Learnings..."
                    value={formData.projects}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Internships Card */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <Briefcase className="w-5 h-5 text-orange-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Internships</h2>
                  </div>
                  <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Add</button>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-3">Talk about the company you interned at, what projects you undertook and what special skills you learned</p>
                  <textarea
                    name="internships"
                    placeholder="Company Name, Duration, Projects, Skills Learned, and Key Contributions..."
                    value={formData.internships}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Accomplishments Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <GraduationCap className="w-5 h-5 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Accomplishments</h2>
                </div>
                
                {/* Certifications */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-800">Certifications</h3>
                    <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Add</button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Talk about any certified courses that you completed</p>
                  <textarea
                    name="certifications"
                    placeholder="Certification Name, Issuing Organization, Date, Validity..."
                    value={formData.certifications}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Awards */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-800">Awards</h3>
                    <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Add</button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Talk about any special recognitions that you received that makes you proud</p>
                  <textarea
                    name="awards"
                    placeholder="Award Name, Issuing Organization, Date, Description..."
                    value={formData.awards}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Club & Committees */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-800">Club & committees</h3>
                    <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Add</button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Add details of position of responsibilities that you have held</p>
                  <textarea
                    name="clubsCommittees"
                    placeholder="Organization Name, Position, Duration, Responsibilities..."
                    value={formData.clubsCommittees}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Competitive Exams */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-800">Competitive exams</h3>
                    <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Add</button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Talk about any competitive exam that you appeared for and the rank received</p>
                  <textarea
                    name="competitiveExams"
                    placeholder="Exam Name, Year, Rank/Score, Percentile..."
                    value={formData.competitiveExams}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Academic Achievements */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-800">Academic achievements</h3>
                    <button type="button" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Add</button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Talk about any academic achievement whether in college or school that deserves a mention</p>
                  <textarea
                    name="academicAchievements"
                    placeholder="Achievement, Institution, Year, Description..."
                    value={formData.academicAchievements}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('home')}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 font-medium transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CandidateProfilePage;