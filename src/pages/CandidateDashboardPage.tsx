import React, { useState, useEffect } from 'react';
import { Camera, ChevronDown, Info, TrendingUp, Star } from 'lucide-react';
import Notification from '../components/Notification';
import BackButton from '../components/BackButton';
import ResumeUploadModal from '../components/ResumeUploadModal';
import ResumeParserModal from '../components/ResumeParserModal';
import ProfilePhotoEditor from '../components/ProfilePhotoEditor';
import JobAlertsManager from '../components/JobAlertsManager';
import LinksPortfolio from '../components/LinksPortfolio';
import ProfileHeadline from '../components/ProfileHeadline';
import MistralJobRecommendations from '../components/MistralJobRecommendations';
import { API_ENDPOINTS } from '../config/env';

interface CandidateDashboardPageProps {
  onNavigate: (page: string) => void;
}

const CandidateDashboardPage: React.FC<CandidateDashboardPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Profile');
  const [profileVisibility, setProfileVisibility] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    isVisible: boolean;
  }>({ type: 'success', message: '', isVisible: false });
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showParserModal, setShowParserModal] = useState(false);
  const [showWelcomeParser, setShowWelcomeParser] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState<any>(null);

  // Handle tab parameter from navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['Profile', 'Alerts'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  useEffect(() => {
    const loadUserProfile = async () => {
      const userData = sessionStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('Loading user data:', parsedUser);
          
          // Always fetch latest profile data from backend
          if (parsedUser.id || parsedUser._id || parsedUser.email) {
            const identifier = parsedUser.email || parsedUser.id || parsedUser._id;
            
            try {
              const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/${identifier}`);
              if (response.ok) {
                const profileData = await response.json();
                console.log('Profile data loaded from backend:', profileData);
                const mergedUser = { ...parsedUser, ...profileData };
                setUser(mergedUser);
                calculateProfileCompletion(mergedUser);
                fetchApplications(mergedUser.email);
                fetchRecommendations(mergedUser.id || mergedUser._id);
              } else {
                setUser(parsedUser);
                calculateProfileCompletion(parsedUser);
                fetchApplications(parsedUser.email);
                fetchRecommendations(parsedUser.id || parsedUser._id);
              }
            } catch (err) {
              console.log('Backend fetch failed, using session data:', err);
              setUser(parsedUser);
              calculateProfileCompletion(parsedUser);
              fetchApplications(parsedUser.email);
              fetchRecommendations(parsedUser.id || parsedUser._id);
            }
          } else {
            setUser(parsedUser);
            calculateProfileCompletion(parsedUser);
            fetchApplications(parsedUser.email);
          }
          
          const hasSeenParser = sessionStorage.getItem('hasSeenResumeParser');
          const isNewUser = !parsedUser.name && !parsedUser.location && !parsedUser.skills;
          if (isNewUser && !hasSeenParser) {
            setTimeout(() => setShowWelcomeParser(true), 2000);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          sessionStorage.removeItem('user');
          setUser(null);
        }
      } else {
        setUser(null);
        const hasSeenParser = sessionStorage.getItem('hasSeenResumeParser');
        if (!hasSeenParser) {
          setTimeout(() => setShowWelcomeParser(true), 2000);
        }
      }
      setLoading(false);
    };
    
    loadUserProfile();
    fetchTrending();
  }, []);

  const fetchApplications = async (email: string) => {
    if (!email) {
      console.log('No email provided for fetching applications');
      return;
    }
    try {
      console.log('Dashboard: Fetching applications for email:', email);
      const response = await fetch(`${API_ENDPOINTS.APPLICATIONS}/candidate/${email}`);
      console.log('Dashboard: Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard: Fetched applications:', data);
        setApplications(data);
      } else {
        console.log('Dashboard: Response not ok:', await response.text());
      }
    } catch (error) {
      console.error('Dashboard: Error fetching applications:', error);
    }
  };

  const fetchRecommendations = async (userId: string) => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/search/recommendations/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.slice(0, 5));
      } else {
        // Fallback: fetch recent jobs as recommendations
        const jobsResponse = await fetch(`${API_ENDPOINTS.JOBS}?limit=5`);
        if (jobsResponse.ok) {
          const jobs = await jobsResponse.json();
          setRecommendations(jobs.slice(0, 3));
        }
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback: fetch recent jobs as recommendations
      try {
        const jobsResponse = await fetch(`${API_ENDPOINTS.JOBS}?limit=5`);
        if (jobsResponse.ok) {
          const jobs = await jobsResponse.json();
          setRecommendations(jobs.slice(0, 3));
        }
      } catch (fallbackError) {
        console.error('Fallback recommendations failed:', fallbackError);
      }
    }
  };

  const fetchTrending = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/search/trending?limit=5`);
      if (response.ok) {
        const data = await response.json();
        setTrending(data);
      }
    } catch (error) {
      console.error('Error fetching trending jobs:', error);
    }
  };

  const calculateProfileCompletion = (userData: any) => {
    let completed = 0;
    const fields = ['name', 'email', 'location', 'resume', 'skills', 'workAuthorization', 'employmentType'];
    
    fields.forEach(field => {
      if (userData[field] && userData[field].length > 0) {
        completed += 1;
      }
    });
    
    const percentage = Math.round((completed / fields.length) * 100);
    setCompletionPercentage(percentage);
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'MG';
  };

  const handleProfilePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          type: 'error',
          message: 'File size must be less than 5MB',
          isVisible: true
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        setNotification({
          type: 'error',
          message: 'Please select a valid image file',
          isVisible: true
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageUrl = event.target?.result as string;
        
        // Save directly to backend
        if (user?.email) {
          try {
            const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/save`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: user.email, 
                userId: user.id || user._id,
                profilePhoto: imageUrl 
              })
            });
            if (response.ok) {
              console.log('Profile photo saved to backend');
              const updatedUser = { ...user, profilePhoto: imageUrl };
              setUser(updatedUser);
            }
          } catch (err) {
            console.log('Backend save failed:', err);
          }
        }
        
        setNotification({
          type: 'success',
          message: 'Profile photo updated successfully!',
          isVisible: true
        });
      };
      reader.readAsDataURL(file);
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
        {/* Tab Navigation */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8">
              <BackButton 
                onClick={() => onNavigate && onNavigate('home')}
                text="Back to Home"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors py-4"
              />
              <button 
                onClick={() => setActiveTab('Profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'Profile' 
                    ? 'border-red-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Profile
              </button>
              <button 
                onClick={() => onNavigate('my-applications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'Applications' 
                    ? 'border-red-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Applications
              </button>
              <button 
                onClick={() => setActiveTab('Alerts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'Alerts' 
                    ? 'border-red-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Alerts
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Job Alerts Tab */}
          {activeTab === 'Alerts' && (
            <div className="max-w-4xl">
              <JobAlertsManager user={user} />
            </div>
          )}
          
          {activeTab === 'Profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Profile Content */}
              <div className="lg:col-span-3">
                {/* Basic Recommendations Section */}
                {recommendations.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="p-6 border-b">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Star className="h-5 w-5 text-blue-500" />
                        Latest Job Opportunities
                      </h2>
                    </div>
                    <div className="divide-y">
                      {recommendations.map((job: any) => (
                        <div key={job._id} className="p-6 hover:bg-gray-50 cursor-pointer" onClick={() => onNavigate(`job-detail/${job._id}`)}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800">
                                {job.jobTitle || job.title}
                              </h3>
                              <p className="text-gray-600">{job.company}</p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span>{job.location}</span>
                                <span>{job.jobType || job.type}</span>
                                <span>{job.locationType}</span>
                              </div>
                              <p className="mt-2 text-gray-700 line-clamp-2">{job.description}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {job.skills?.slice(0, 3).map((skill: string) => (
                                  <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              {job.salary && (
                                <p className="text-green-600 font-semibold">
                                  {typeof job.salary === 'object' && job.salary.min 
                                    ? `${job.salary.currency === 'INR' ? '₹' : '$'}${job.salary.min?.toLocaleString()} - ${job.salary.currency === 'INR' ? '₹' : '$'}${job.salary.max?.toLocaleString()}`
                                    : job.salary
                                  }
                                </p>
                              )}
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(job.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t bg-gray-50">
                      <button 
                        onClick={() => onNavigate('job-listings')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View All Jobs →
                      </button>
                    </div>
                  </div>
                )}

                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
                  {/* Banner Section */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      aria-label="Upload banner image"
                      onChange={(e) => {
                        console.log('Banner file input triggered');
                        const file = e.target.files?.[0];
                        if (file) {
                          console.log('Banner file selected:', file.name, file.size);
                          if (file.size > 5 * 1024 * 1024) {
                            setNotification({
                              type: 'error',
                              message: 'Banner image must be less than 5MB',
                              isVisible: true
                            });
                            return;
                          }
                          if (!file.type.startsWith('image/')) {
                            setNotification({
                              type: 'error',
                              message: 'Please select a valid image file',
                              isVisible: true
                            });
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            console.log('Banner file read successfully');
                            const imageUrl = event.target?.result as string;
                            
                            // Save directly to backend
                            if (user?.email) {
                              try {
                                const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/save`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ 
                                    email: user.email, 
                                    userId: user.id || user._id,
                                    bannerPhoto: imageUrl 
                                  })
                                });
                                if (response.ok) {
                                  console.log('Banner saved to backend');
                                  // Update user state from database
                                  const updatedUser = { ...user, bannerPhoto: imageUrl };
                                  setUser(updatedUser);
                                }
                              } catch (err) {
                                console.log('Backend save failed:', err);
                              }
                            }
                            
                            setNotification({
                              type: 'success',
                              message: 'Banner updated successfully!',
                              isVisible: true
                            });
                          };
                          reader.readAsDataURL(file);
                        } else {
                          console.log('No banner file selected');
                        }
                      }}
                      className="hidden"
                      id="banner-photo-upload"
                    />
                    {user?.bannerPhoto ? (
                      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                        <img 
                          src={user.bannerPhoto} 
                          alt="Profile Banner" 
                          className="w-full h-48 object-cover"
                        />
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Banner change button clicked');
                            const fileInput = document.getElementById('banner-photo-upload') as HTMLInputElement;
                            if (fileInput) {
                              fileInput.click();
                            } else {
                              console.error('Banner file input not found');
                            }
                          }}
                          className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                          title="Change banner"
                        >
                          <Camera className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-300 relative">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Banner add button clicked');
                            const fileInput = document.getElementById('banner-photo-upload') as HTMLInputElement;
                            if (fileInput) {
                              fileInput.click();
                            } else {
                              console.error('Banner file input not found');
                            }
                          }}
                          className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                          title="Add banner image"
                        >
                          <Camera className="w-4 h-4 text-gray-600" />
                        </button>
                        <div 
                          className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-black/10 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Banner center area clicked');
                            const fileInput = document.getElementById('banner-photo-upload') as HTMLInputElement;
                            if (fileInput) {
                              fileInput.click();
                            } else {
                              console.error('Banner file input not found');
                            }
                          }}
                        >
                          <div className="text-center text-white bg-black/20 rounded-lg p-4">
                            <Camera className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">Click to add banner image</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Profile Content */}
                  <div className="relative px-6 pb-6">
                    <div className="flex items-start space-x-6 -mt-16">
                      {/* Profile Picture */}
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          aria-label="Upload profile photo"
                          onChange={handleProfilePhotoChange}
                          className="hidden"
                          id="profile-photo-upload"
                        />
                        <div className="cursor-pointer" onClick={() => setShowPhotoEditor(true)}>
                          {user?.profilePhoto ? (
                            <div 
                              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                              style={{ 
                                borderColor: user.profileFrame === 'blue' ? '#0A66C2' : 
                                            user.profileFrame === 'green' ? '#057642' : 
                                            user.profileFrame === 'purple' ? '#7C3AED' : 
                                            user.profileFrame === 'gold' ? '#F59E0B' : 'white',
                                borderWidth: user.profileFrame !== 'none' ? '4px' : '4px'
                              }}
                            >
                              <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-3xl font-semibold text-gray-600 border-4 border-white shadow-lg hover:shadow-xl transition-shadow">
                              {getInitials(user?.name || '')}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => setShowPhotoEditor(true)}
                          className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-md transition-colors"
                          title="Change profile photo"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Profile Info */}
                      <div className="flex-1 mt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                              {user?.name || 'New User'}
                            </h1>
                            {user?.title || user?.jobTitle ? (
                              <ProfileHeadline 
                                userId={user?.id || user?._id || 'demo'} 
                                fallbackHeadline={user.title || user.jobTitle}
                              />
                            ) : (
                              <button 
                                onClick={() => onNavigate('candidate-profile')}
                                className="text-blue-600 hover:text-blue-800 hover:underline text-sm mb-2 transition-colors cursor-pointer"
                              >
                                Add Desired Job Title
                              </button>
                            )}
                            <p className="text-sm text-gray-600 mb-4">
                              Profile Last Updated: Today
                            </p>
                          </div>
                        </div>
                      
                        {/* Profile Completion Alert */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">You may be missing out on job opportunities.</span> A complete profile will allow you to go visible and receive better job recommendations. Update the following items so you can be visible to employers: Location, Resume, Skills (at least 5), Work Authorization, Employment Type.
                          </p>
                        </div>
                        
                        {/* Profile Visibility Toggle */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-700">Profile Visibility</span>
                            <div className="flex items-center">
                              <button 
                                onClick={() => {
                                  if (!profileVisibility && completionPercentage < 100) {
                                    setShowVisibilityModal(true);
                                  } else {
                                    setProfileVisibility(!profileVisibility);
                                  }
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  profileVisibility ? 'bg-blue-600' : 'bg-gray-300'
                                }`}
                                title={`Turn profile visibility ${profileVisibility ? 'off' : 'on'}`}
                              >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  profileVisibility ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                              </button>
                              <span className="ml-2 text-sm text-gray-600">
                                {profileVisibility ? 'ON' : 'OFF'}
                              </span>
                            </div>
                            <Info className="w-4 h-4 text-gray-400" />
                          </div>
                          
                          {/* Completion Status */}
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-12 h-12 relative">
                                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                                  <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#e5e7eb"
                                    strokeWidth="2"
                                  />
                                  <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="2"
                                    strokeDasharray={`${completionPercentage}, 100`}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs font-semibold text-red-600">{completionPercentage}%</span>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-gray-700">Complete</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => onNavigate('candidate-profile')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1"
                              >
                                <span>Improve Your Profile</span>
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* About Me Section */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-6">About Me</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        {user?.name ? (
                          <p className="text-gray-900">{user.name}</p>
                        ) : (
                          <button 
                            onClick={() => onNavigate('candidate-profile')}
                            className="text-blue-600 hover:text-blue-800 hover:underline italic transition-colors cursor-pointer"
                          >
                            Add your name
                          </button>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Years Experience</label>
                        {user?.yearsExperience ? (
                          <p className="text-gray-900">{user.yearsExperience}</p>
                        ) : (
                          <button 
                            onClick={() => onNavigate('candidate-profile')}
                            className="text-blue-600 hover:text-blue-800 hover:underline italic transition-colors cursor-pointer"
                          >
                            How many years of experience do you have?
                          </button>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        {user?.email ? (
                          <p className="text-gray-900">{user.email}</p>
                        ) : (
                          <button 
                            onClick={() => onNavigate('candidate-profile')}
                            className="text-blue-600 hover:text-blue-800 hover:underline italic transition-colors cursor-pointer"
                          >
                            Add your email address
                          </button>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        {user?.phone ? (
                          <p className="text-gray-900">{user.phone}</p>
                        ) : (
                          <button 
                            onClick={() => onNavigate('candidate-profile')}
                            className="text-blue-600 hover:text-blue-800 hover:underline italic flex items-center transition-colors cursor-pointer"
                          >
                            Do you want to add a phone number?
                            <Info className="w-4 h-4 ml-1 text-gray-400" />
                          </button>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        {user?.location ? (
                          <p className="text-gray-900">{user.location}</p>
                        ) : (
                          <button 
                            onClick={() => onNavigate('candidate-profile')}
                            className="text-blue-600 hover:text-blue-800 hover:underline italic transition-colors cursor-pointer"
                          >
                            Where are you currently located?
                          </button>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Work Authorization</label>
                        {user?.workAuthorization ? (
                          <p className="text-gray-900">{user.workAuthorization.replace('-', ' ').toUpperCase()}</p>
                        ) : (
                          <button 
                            onClick={() => onNavigate('candidate-profile')}
                            className="text-blue-600 hover:text-blue-800 hover:underline italic transition-colors cursor-pointer"
                          >
                            What is your work authorization status?
                          </button>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Security Clearance</label>
                        {user?.securityClearance && user.securityClearance !== 'none' ? (
                          <p className="text-gray-900">{user.securityClearance.replace('-', '/').toUpperCase()}</p>
                        ) : (
                          <button 
                            onClick={() => onNavigate('candidate-profile')}
                            className="text-blue-600 hover:text-blue-800 hover:underline italic transition-colors cursor-pointer"
                          >
                            Do you have any security clearances?
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Work Experience Section */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-6">Work Experience</h2>
                    {user?.experience || user?.workExperience ? (
                      <div className="p-4">
                        <div className="text-gray-900 whitespace-pre-line">
                          {user?.experience || user?.workExperience}
                        </div>
                        <button 
                          onClick={() => onNavigate('candidate-profile')}
                          className="mt-4 text-blue-600 hover:text-blue-800 hover:underline text-sm transition-colors cursor-pointer"
                        >
                          Edit work experience
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-600 font-medium mb-2">Add relevant work experience</p>
                        <p className="text-sm text-gray-500 mb-6">
                          Give employers a glimpse of your work history.
                        </p>
                        <button 
                          onClick={() => onNavigate('candidate-profile')}
                          className="border border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 px-6 py-2 rounded-full font-medium flex items-center mx-auto transition-all cursor-pointer"
                        >
                          <span className="text-xl mr-2">+</span>
                          Add work experience
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resume Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-700 mb-6">Resume</h2>
                  {user?.resume ? (
                    <div className="p-4">
                      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.resume.name || 'Resume.pdf'}</p>
                            <p className="text-sm text-gray-500">Uploaded {user.resume.uploadDate || 'recently'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              console.log('Resume data:', user.resume);
                              console.log('Resume keys:', Object.keys(user.resume || {}));
                              
                              if (!user.resume) {
                                setNotification({
                                  type: 'error',
                                  message: 'No resume found. Please upload a resume first.',
                                  isVisible: true
                                });
                                return;
                              }
                              
                              // Handle different resume data formats
                              let resumeUrl = '';
                              
                              if (user.resume.filename) {
                                // New format with filename from upload API
                                resumeUrl = `${API_ENDPOINTS.BASE_URL}/uploads/${user.resume.filename}`;
                              } else if (user.resume.url) {
                                // Direct URL format
                                resumeUrl = user.resume.url.startsWith('http') 
                                  ? user.resume.url 
                                  : `${API_ENDPOINTS.BASE_URL}${user.resume.url}`;
                              } else if (user.resume.path) {
                                // Path format
                                resumeUrl = user.resume.path.startsWith('http') 
                                  ? user.resume.path 
                                  : `${API_ENDPOINTS.BASE_URL}${user.resume.path}`;
                              } else if (typeof user.resume === 'string') {
                                // String format (legacy)
                                resumeUrl = user.resume.startsWith('http') 
                                  ? user.resume 
                                  : `${API_ENDPOINTS.BASE_URL}/uploads/${user.resume}`;
                              } else {
                                // Test with existing file
                                resumeUrl = `${API_ENDPOINTS.BASE_URL}/uploads/resume-1768241848606-544295216.pdf`;
                              }
                              
                              console.log('Opening resume URL:', resumeUrl);
                              
                              if (resumeUrl) {
                                // Open in new tab
                                window.open(resumeUrl, '_blank', 'noopener,noreferrer');
                              } else {
                                setNotification({
                                  type: 'error',
                                  message: 'Resume file not found. Please re-upload your resume.',
                                  isVisible: true
                                });
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </button>
                          <button 
                            onClick={async () => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = '.pdf,.doc,.docx';
                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  try {
                                    // Upload new resume
                                    const uploadFormData = new FormData();
                                    uploadFormData.append('resume', file);
                                    
                                    const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/upload/resume`, {
                                      method: 'POST',
                                      body: uploadFormData
                                    });
                                    
                                    if (!response.ok) {
                                      throw new Error('Upload failed');
                                    }
                                    
                                    const uploadResult = await response.json();
                                    
                                    const updatedUser = { 
                                      ...user, 
                                      resume: { 
                                        name: file.name,
                                        filename: uploadResult.filename,
                                        url: uploadResult.fileUrl,
                                        uploadDate: new Date().toLocaleDateString() 
                                      } 
                                    };
                                    setUser(updatedUser);
                                    
                                    // Save to backend profile
                                    if (user?.email) {
                                      try {
                                        await fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/save`, {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ 
                                            email: user.email, 
                                            userId: user.id || user._id,
                                            resume: updatedUser.resume
                                          })
                                        });
                                      } catch (err) {
                                        console.log('Backend save failed:', err);
                                      }
                                    }
                                    
                                    setNotification({
                                      type: 'success',
                                      message: 'Resume updated successfully!',
                                      isVisible: true
                                    });
                                  } catch (error) {
                                    console.error('Upload error:', error);
                                    setNotification({
                                      type: 'error',
                                      message: 'Failed to upload resume. Please try again.',
                                      isVisible: true
                                    });
                                  }
                                }
                              };
                              input.click();
                            }}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          >
                            Replace
                          </button>
                          <button 
                            onClick={() => {
                              const updatedUser = { ...user };
                              delete updatedUser.resume;
                              setUser(updatedUser);
                              
                              // Remove from backend
                              if (user?.email) {
                                fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/save`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ 
                                    email: user.email, 
                                    userId: user.id || user._id,
                                    resume: null
                                  })
                                });
                              }
                              
                              calculateProfileCompletion(updatedUser);
                              setNotification({
                                type: 'success',
                                message: 'Resume removed successfully!',
                                isVisible: true
                              });
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium mb-2">Upload your resume</p>
                      <p className="text-sm text-gray-500 mb-6">
                        Upload your resume to help employers find you and apply to jobs faster.
                      </p>
                      <button 
                        onClick={() => setShowResumeModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center mx-auto transition-colors cursor-pointer"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Resume (AI Moderated)
                      </button>
                      <p className="text-xs text-gray-400 mt-2">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
                      <div className="mt-4">
                        <button 
                          onClick={() => onNavigate('resume-parser')}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium flex items-center mx-auto transition-colors cursor-pointer"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Resume Parser Tool
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Education and Skills Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  {/* Education Section */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-700">Education</h2>
                      <button 
                        onClick={() => {
                          setEditingEducation(null);
                          setShowEducationModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                        <span className="text-lg mr-1">+</span>
                        Add Education
                      </button>
                    </div>
                    {user?.educationList && user.educationList.length > 0 ? (
                      <div className="space-y-4">
                        {user.educationList.map((edu: any, index: number) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{edu.school}</h3>
                                <p className="text-gray-600">{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}</p>
                                <p className="text-sm text-gray-500">{edu.startYear} - {edu.endYear || 'Present'}</p>
                                {edu.description && (
                                  <p className="text-sm text-gray-600 mt-2">{edu.description}</p>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <button 
                                  onClick={() => {
                                    setEditingEducation({ ...edu, index });
                                    setShowEducationModal(true);
                                  }}
                                  className="text-gray-400 hover:text-blue-600 p-1"
                                  title="Edit education"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => {
                                    const updatedEducationList = user.educationList.filter((_: any, i: number) => i !== index);
                                    const updatedUser = { ...user, educationList: updatedEducationList };
                                    setUser(updatedUser);
                                    
                                    // Save to backend
                                    if (user?.email) {
                                      fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/save`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ 
                                          email: user.email, 
                                          userId: user.id || user._id,
                                          educationList: updatedEducationList
                                        })
                                      });
                                    }
                                    
                                    setNotification({
                                      type: 'success',
                                      message: 'Education removed successfully!',
                                      isVisible: true
                                    });
                                  }}
                                  className="text-gray-400 hover:text-red-600 p-1"
                                  title="Delete education"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <p className="text-gray-600 font-medium mb-2">Add your education</p>
                        <p className="text-sm text-gray-500 mb-6">
                          Add any formal education or professional qualifications to help employers understand your background.
                        </p>
                        <button 
                          onClick={() => {
                            setEditingEducation(null);
                            setShowEducationModal(true);
                          }}
                          className="border border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 px-6 py-2 rounded-full font-medium flex items-center mx-auto transition-all cursor-pointer"
                        >
                          <span className="text-xl mr-2">+</span>
                          Add Education
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Skills Section */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-6">Skills</h2>
                    {user?.skills && user.skills.length > 0 ? (
                      <div className="p-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {user.skills.map((skill: string, index: number) => (
                            <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <button 
                          onClick={() => onNavigate('candidate-profile')}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm transition-colors cursor-pointer"
                        >
                          Edit skills
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <p className="text-gray-600 font-medium mb-2">Showcase your skills</p>
                        <p className="text-sm text-gray-500 mb-4">
                          List at least five skills to help us match you with the right roles.
                        </p>
                        <button 
                          onClick={() => onNavigate('candidate-profile')}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors cursor-pointer"
                        >
                          Add Skills
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Portfolio Links Section */}
                <LinksPortfolio 
                  user={user} 
                  onUpdateUser={(updatedUser) => {
                    setUser(updatedUser);
                    // Save to backend immediately
                    if (user?.email) {
                      fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/save`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          email: user.email, 
                          userId: user.id || user._id,
                          ...updatedUser
                        })
                      });
                    }
                  }} 
                />
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                {/* AI Job Recommendations */}
                {user?.skills && user.skills.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      AI Job Recommendations
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Personalized matches based on your profile</p>
                    <MistralJobRecommendations
                      resumeSkills={user.skills.map((skill: string) => ({ skill }))}
                      location={user.location || 'Remote'}
                      experience={user.yearsExperience || '2-3 years'}
                      onNavigate={onNavigate}
                    />
                  </div>
                )}
                
                {/* Trending Jobs */}
                {trending.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                      Trending Jobs
                    </h3>
                    <div className="space-y-3">
                      {trending.map((job: any) => (
                        <div key={job._id} className="border-l-2 border-orange-500 pl-3 cursor-pointer hover:bg-gray-50 p-2 rounded" onClick={() => onNavigate(`job-detail/${job._id}`)}>
                          <h4 className="font-medium text-sm">{job.jobTitle}</h4>
                          <p className="text-xs text-gray-600">{job.company}</p>
                          <p className="text-xs text-gray-500">{job.views} views</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <button 
                        onClick={() => onNavigate('job-listings')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View All Trending →
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => onNavigate('job-listings')}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                    >
                      Browse All Jobs
                    </button>
                    <button
                      onClick={() => onNavigate('company-reviews')}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                    >
                      Company Reviews
                    </button>
                    <button
                      onClick={() => onNavigate('skill-assessments')}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                    >
                      Take Skill Assessment
                    </button>
                    <button
                      onClick={() => onNavigate('my-applications')}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                    >
                      My Applications
                    </button>
                    <button
                      onClick={() => onNavigate('candidate-profile')}
                      className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm"
                    >
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ResumeUploadModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        onSuccess={(resumeData) => {
          const updatedUser = { ...user, resume: resumeData };
          setUser(updatedUser);
          calculateProfileCompletion(updatedUser);
          setNotification({
            type: 'success',
            message: 'Resume uploaded and analyzed successfully!',
            isVisible: true
          });
        }}
        userProfile={user}
      />
      
      <ResumeParserModal
        isOpen={showParserModal || showWelcomeParser}
        onClose={() => {
          setShowParserModal(false);
          setShowWelcomeParser(false);
          sessionStorage.setItem('hasSeenResumeParser', 'true');
        }}
        onProfileUpdate={(profileData) => {
          const updatedUser = {
            ...user,
            // Only update fields that have actual data
            ...(profileData.name && { name: profileData.name }),
            ...(profileData.email && { email: profileData.email }),
            ...(profileData.phone && { phone: profileData.phone }),
            ...(profileData.location && { location: profileData.location }),
            ...(profileData.title && { title: profileData.title }),
            ...(profileData.experience > 0 && { yearsExperience: profileData.experience }),
            ...(profileData.skills.length > 0 && { skills: profileData.skills }),
            ...(profileData.education && { education: profileData.education }),
            ...(profileData.workExperience && { experience: profileData.workExperience }),
            ...(profileData.certifications.length > 0 && { certifications: profileData.certifications.join(', ') })
          };
          
          setUser(updatedUser);
          
          // Save to backend immediately
          if (user?.email) {
            fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/save`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: user.email, 
                userId: user.id || user._id,
                ...updatedUser
              })
            });
          }
          
          calculateProfileCompletion(updatedUser);
          
          setNotification({
            type: 'success',
            message: 'Profile updated successfully from resume!',
            isVisible: true
          });
        }}
      />
      
      {/* Profile Visibility Modal */}
      {showVisibilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">You may be missing out on job opportunities.</h2>
              <button 
                type="button"
                onClick={() => setShowVisibilityModal(false)}
                className="text-gray-400 hover:text-gray-600"
                title="Close modal"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-700 mb-4">
              A complete profile will allow you to go visible and receive better job recommendations. Update the following items so you can be visible to employers:
            </p>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-blue-600">
                <span className="mr-2">•</span>
                <button 
                  type="button"
                  onClick={() => { setShowVisibilityModal(false); onNavigate('candidate-profile'); }} 
                  className="hover:underline"
                  title="Update location"
                >
                  Location
                </button>
              </li>
              <li className="flex items-center text-blue-600">
                <span className="mr-2">•</span>
                <button 
                  type="button"
                  onClick={() => { setShowVisibilityModal(false); setShowResumeModal(true); }} 
                  className="hover:underline"
                  title="Upload resume"
                >
                  Resume
                </button>
              </li>
              <li className="flex items-center text-blue-600">
                <span className="mr-2">•</span>
                <button 
                  type="button"
                  onClick={() => { setShowVisibilityModal(false); onNavigate('candidate-profile'); }} 
                  className="hover:underline"
                  title="Add skills"
                >
                  Skills (at least 5)
                </button>
              </li>
              <li className="flex items-center text-blue-600">
                <span className="mr-2">•</span>
                <button 
                  type="button"
                  onClick={() => { setShowVisibilityModal(false); onNavigate('candidate-profile'); }} 
                  className="hover:underline"
                  title="Update work authorization"
                >
                  Work Authorization
                </button>
              </li>
              <li className="flex items-center text-blue-600">
                <span className="mr-2">•</span>
                <button 
                  type="button"
                  onClick={() => { setShowVisibilityModal(false); onNavigate('candidate-profile'); }} 
                  className="hover:underline"
                  title="Update employment type"
                >
                  Employment Type
                </button>
              </li>
            </ul>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowVisibilityModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close modal"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowVisibilityModal(false);
                  onNavigate('candidate-profile');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title="Complete profile"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ProfilePhotoEditor
        isOpen={showPhotoEditor}
        onClose={() => setShowPhotoEditor(false)}
        onSave={async (photo, frame) => {
          const updatedUser = { ...user, profilePhoto: photo, profileFrame: frame || 'none' };
          setUser(updatedUser);
          
          // Save to backend immediately
          if (user?.email) {
            try {
              await fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  email: user.email, 
                  userId: user.id || user._id,
                  profilePhoto: photo, 
                  profileFrame: frame || 'none'
                })
              });
              console.log('Profile photo saved to backend');
            } catch (err) {
              console.log('Backend save failed:', err);
            }
          }
          
          setNotification({
            type: 'success',
            message: 'Profile photo updated successfully!',
            isVisible: true
          });
        }}
        currentPhoto={user?.profilePhoto}
        currentFrame={user?.profileFrame || 'none'}
      />
      
      {/* Education Modal */}
      {showEducationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingEducation ? 'Edit Education' : 'Add Education'}
                </h2>
                <button 
                  onClick={() => {
                    setShowEducationModal(false);
                    setEditingEducation(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const educationData = {
                  school: formData.get('school') as string,
                  degree: formData.get('degree') as string,
                  fieldOfStudy: formData.get('fieldOfStudy') as string,
                  startYear: formData.get('startYear') as string,
                  endYear: formData.get('endYear') as string,
                  description: formData.get('description') as string
                };
                
                if (!educationData.school || !educationData.degree || !educationData.startYear) {
                  setNotification({
                    type: 'error',
                    message: 'Please fill in all required fields (School, Degree, Start Year)',
                    isVisible: true
                  });
                  return;
                }
                
                let updatedEducationList = user?.educationList || [];
                
                if (editingEducation && editingEducation.index !== undefined) {
                  // Edit existing education
                  updatedEducationList[editingEducation.index] = educationData;
                } else {
                  // Add new education
                  updatedEducationList = [...updatedEducationList, educationData];
                }
                
                const updatedUser = { ...user, educationList: updatedEducationList };
                setUser(updatedUser);
                
                // Save to backend
                if (user?.email) {
                  fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      email: user.email, 
                      userId: user.id || user._id,
                      educationList: updatedEducationList
                    })
                  });
                }
                
                setNotification({
                  type: 'success',
                  message: editingEducation ? 'Education updated successfully!' : 'Education added successfully!',
                  isVisible: true
                });
                
                setShowEducationModal(false);
                setEditingEducation(null);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
                  <input
                    type="text"
                    name="school"
                    defaultValue={editingEducation?.school || ''}
                    placeholder="e.g., Loyola-ICAM College of Engineering and Technology"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                  <input
                    type="text"
                    name="degree"
                    defaultValue={editingEducation?.degree || ''}
                    placeholder="e.g., Bachelor's degree, Master's degree, PhD"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                  <input
                    type="text"
                    name="fieldOfStudy"
                    defaultValue={editingEducation?.fieldOfStudy || ''}
                    placeholder="e.g., Computer Science, Engineering, Business"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Year *</label>
                    <input
                      type="number"
                      name="startYear"
                      defaultValue={editingEducation?.startYear || ''}
                      placeholder="2018"
                      min="1950"
                      max={new Date().getFullYear()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Year</label>
                    <input
                      type="number"
                      name="endYear"
                      defaultValue={editingEducation?.endYear || ''}
                      placeholder="2022 (leave empty if ongoing)"
                      min="1950"
                      max={new Date().getFullYear() + 10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingEducation?.description || ''}
                    placeholder="Describe your achievements, relevant coursework, or activities..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEducationModal(false);
                      setEditingEducation(null);
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingEducation ? 'Update' : 'Add'} Education
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CandidateDashboardPage;