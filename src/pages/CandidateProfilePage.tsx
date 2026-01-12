import React, { useState, useEffect } from 'react';
import { Upload, User, Briefcase, GraduationCap, Target, Save, Sparkles, Camera, Edit2 } from 'lucide-react';
import Notification from '../components/Notification';
import ResumeUploadWithModeration from '../components/ResumeUploadWithModeration';
import ProfilePhotoEditor from '../components/ProfilePhotoEditor';
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
          const response = await fetch(`http://localhost:5000/api/profile/${parsedUser.id || parsedUser._id || parsedUser.email}`);
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
              securityClearance: profileData.securityClearance || parsedUser.securityClearance || ''
            });
            setProfilePhoto(profileData.profilePhoto || parsedUser.profilePhoto || '');
            setProfileFrame(profileData.profileFrame || parsedUser.profileFrame || 'none');
            setCoverPhoto(profileData.coverPhoto || parsedUser.coverPhoto || '');
            
            // Update localStorage with latest data
            const updatedUser = { ...parsedUser, ...profileData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
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
              securityClearance: parsedUser.securityClearance || ''
            });
            setProfilePhoto(parsedUser.profilePhoto || '');
            setProfileFrame(parsedUser.profileFrame || 'none');
            setCoverPhoto(parsedUser.coverPhoto || '');
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
            securityClearance: parsedUser.securityClearance || ''
          });
          setProfilePhoto(parsedUser.profilePhoto || '');
          setProfileFrame(parsedUser.profileFrame || 'none');
          setCoverPhoto(parsedUser.coverPhoto || '');
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
    securityClearance: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [jobSuggestions, setJobSuggestions] = useState<string[]>([]);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [profileFrame, setProfileFrame] = useState('none');
  const [coverPhoto, setCoverPhoto] = useState('');
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        resume: e.target.files[0]
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
    if (!formData.jobTitle) {
      setNotification({
        type: 'info',
        message: 'Please add a job title first to generate relevant experience.',
        isVisible: true
      });
      return;
    }

    try {
      const aiExperience = await aiSuggestions.generateExperience(formData.jobTitle, formData.skills);
      setFormData({ ...formData, experience: aiExperience });
      setNotification({
        type: 'success',
        message: 'AI-generated experience added! Feel free to customize it.',
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
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const coverPhotoData = reader.result as string;
        setCoverPhoto(coverPhotoData);
        
        // Immediately save to localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        userData.coverPhoto = coverPhotoData;
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Immediately save to backend
        try {
          await fetch('http://localhost:5000/api/profile/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userData.id || userData._id,
              email: userData.email,
              coverPhoto: coverPhotoData
            })
          });
        } catch (err) {
          console.log('Cover photo save to backend failed:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      const profileData = {
        ...formData,
        name: formData.fullName,
        skills: formData.skills,
        title: formData.jobTitle,
        userType: 'jobseeker',
        profilePhoto,
        profileFrame,
        coverPhoto,
        userId: existingUser.id || existingUser._id,
        email: formData.email || existingUser.email,
        profile_completed: !!(formData.fullName && formData.skills && formData.location && formData.jobTitle),
        profile: {
          ...existingUser.profile,
          resume: existingUser.profile?.resume || existingUser.resume,
          skills: formData.skills,
          experience: formData.yearsExperience,
          bio: formData.experience
        },
        resume: existingUser.resume || existingUser.profile?.resume
      };
      
      localStorage.setItem('user', JSON.stringify(profileData));
      
      // Save to backend
      try {
        await fetch('http://localhost:5000/api/profile/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData)
        });
      } catch (err) {
        console.log('Backend save failed:', err);
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
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Cover Photo Section */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-700">
            {coverPhoto && (
              <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            )}
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-4 right-4 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 flex items-center space-x-2 shadow-lg"
            >
              <Camera className="w-4 h-4" />
              <span>Edit Cover</span>
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
          </div>

          {/* Profile Photo Section */}
          <div className="relative px-8 pb-6">
            <div className="flex items-end space-x-6 -mt-16">
              <div className="relative">
                <div 
                  className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden shadow-lg"
                  style={{ 
                    borderColor: profileFrame === 'blue' ? '#0A66C2' : 
                                profileFrame === 'green' ? '#057642' : 
                                profileFrame === 'purple' ? '#7C3AED' : 
                                profileFrame === 'gold' ? '#F59E0B' : 'white',
                    borderWidth: profileFrame !== 'none' ? '4px' : '4px'
                  }}
                >
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPhotoEditor(true)}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">{formData.fullName || 'Your Name'}</h1>
                <p className="text-gray-600">{formData.jobTitle || 'Job Title'}</p>
                <p className="text-sm text-gray-500">{formData.location || 'Location'}</p>
              </div>
            </div>
          </div>

          <div className="px-8 pb-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Profile</h2>
            <p className="text-gray-600">Fill in your details to appear in employer searches and get matched with the best job opportunities</p>
            <div className="mt-4 space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Required for visibility:</strong> Full Name, Skills, Location, and Job Title are required to appear in candidate searches.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="border-b pb-6">
              <div className="flex items-center mb-4">
                <User className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    placeholder="Location (City, State)"
                    value={formData.location}
                    onChange={handleLocationSearch}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                <select
                  name="yearsExperience"
                  value={formData.yearsExperience}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Years of Experience</option>
                  <option value="0-1">0-1 years</option>
                  <option value="2-3">2-3 years</option>
                  <option value="4-5">4-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
                <select
                  name="workAuthorization"
                  value={formData.workAuthorization}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Work Authorization Status</option>
                  <option value="us-citizen">US Citizen</option>
                  <option value="green-card">Green Card Holder</option>
                  <option value="h1b">H1B Visa</option>
                  <option value="opt">OPT</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mt-4">
                <select
                  name="securityClearance"
                  value={formData.securityClearance}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Security Clearance (Optional)</option>
                  <option value="none">No Clearance</option>
                  <option value="confidential">Confidential</option>
                  <option value="secret">Secret</option>
                  <option value="top-secret">Top Secret</option>
                  <option value="ts-sci">TS/SCI</option>
                </select>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="border-b pb-6">
              <div className="flex items-center mb-4">
                <Upload className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Resume</h2>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Upload your resume with AI extraction</p>
                <p className="text-sm text-gray-500 mb-4">PDF, DOC, DOCX (Max 10MB) - Details will auto-fill your profile</p>
                <button
                  type="button"
                  onClick={() => setShowResumeModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center mx-auto transition-colors"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload & Extract Details
                </button>
              </div>
            </div>

            {/* Skills & Experience */}
            <div className="border-b pb-6">
              <div className="flex items-center mb-4">
                <Briefcase className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Skills & Experience</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Skills</label>
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
                        placeholder="Type skills (e.g., React, Python, AWS)..."
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
                    <div className="flex justify-between items-center mt-2">
                      <button
                        type="button"
                        onClick={suggestSkillsWithAI}
                        className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>AI Skill Suggestions</span>
                      </button>
                      <button
                        type="button"
                        onClick={optimizeSkillsWithAI}
                        disabled={formData.skills.length === 0}
                        className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700 disabled:text-gray-400 transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Optimize Skills</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    name="experience"
                    placeholder="Work Experience (describe your previous roles and achievements)"
                    value={formData.experience}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <button
                      type="button"
                      onClick={generateExperienceWithAI}
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generate with AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={improveExperienceWithAI}
                      disabled={!formData.experience.trim()}
                      className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-700 disabled:text-gray-400 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Improve with AI</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Preferences */}
            <div className="border-b pb-6">
              <div className="flex items-center mb-4">
                <Target className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Job Preferences</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    name="jobTitle"
                    placeholder="Desired Job Title"
                    value={formData.jobTitle}
                    onChange={handleJobTitleSearch}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                <input
                  type="text"
                  name="salary"
                  placeholder="Expected Salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Job Type</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
            </div>

            {/* Education & Certifications */}
            <div className="border-b pb-6">
              <div className="flex items-center mb-4">
                <GraduationCap className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Education & Certifications</h2>
              </div>
              <div className="space-y-4">
                <textarea
                  name="education"
                  placeholder="Education (degree, university, graduation year)"
                  value={formData.education}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  name="certifications"
                  placeholder="Certifications (AWS, Google Cloud, Microsoft, etc.)"
                  value={formData.certifications}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('home')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <ResumeUploadWithModeration
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        onSuccess={(resumeData) => {
          setFormData({ ...formData, resume: resumeData });
          
          // Save resume to user profile in localStorage
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          userData.profile = userData.profile || {};
          userData.profile.resume = resumeData.url || resumeData;
          userData.resume = resumeData; // Also save at root level for compatibility
          localStorage.setItem('user', JSON.stringify(userData));
          
          setNotification({
            type: 'success',
            message: 'Resume uploaded successfully!',
            isVisible: true
          });
        }}
        onProfileUpdate={(profileData) => {
          setFormData({
            ...formData,
            fullName: profileData.name || formData.fullName,
            email: profileData.email || formData.email,
            phone: profileData.phone || formData.phone,
            location: profileData.location || formData.location,
            jobTitle: profileData.title || formData.jobTitle,
            yearsExperience: profileData.experience > 0 ? profileData.experience.toString() : formData.yearsExperience,
            skills: profileData.skills.length > 0 ? profileData.skills : formData.skills,
            education: profileData.education || formData.education,
            experience: profileData.workExperience || formData.experience,
            certifications: profileData.certifications.length > 0 ? profileData.certifications.join(', ') : formData.certifications
          });
          
          setNotification({
            type: 'success',
            message: 'Profile auto-filled from resume!',
            isVisible: true
          });
        }}
        userProfile={formData}
      />

      <ProfilePhotoEditor
        isOpen={showPhotoEditor}
        onClose={() => setShowPhotoEditor(false)}
        onSave={async (photo, frame) => {
          setProfilePhoto(photo);
          setProfileFrame(frame || 'none');
          
          // Immediately save to localStorage
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          userData.profilePhoto = photo;
          userData.profileFrame = frame || 'none';
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Immediately save to backend
          try {
            await fetch('http://localhost:5000/api/profile/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: userData.id || userData._id,
                email: userData.email,
                profilePhoto: photo,
                profileFrame: frame || 'none'
              })
            });
          } catch (err) {
            console.log('Profile photo save to backend failed:', err);
          }
        }}
        currentPhoto={profilePhoto}
        currentFrame={profileFrame}
      />
    </div>
    </div>
    </>
  );
};

export default CandidateProfilePage;