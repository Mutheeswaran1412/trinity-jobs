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
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
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
                // Update localStorage with merged data
                localStorage.setItem('user', JSON.stringify(mergedUser));
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
              // Update localStorage immediately
              localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
              console.log('Backend save failed, saving to localStorage only');
              const updatedUser = { ...user, profilePhoto: imageUrl };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
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
              {/* Left Sidebar - Quick Links */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick links</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-700">Preference</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Add</button>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-700">Education</span>
                      <button 
                        onClick={() => {
                          setEditingEducation(null);
                          setShowEducationModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-700">Key skills</span>
                      <button 
                        onClick={() => onNavigate('candidate-profile')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-700">Languages</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Add</button>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-700">Projects</span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Add</button>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-700">Profile summary</span>
                      <button 
                        onClick={() => onNavigate('candidate-profile')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-700">Employment</span>
                      <button 
                        onClick={() => onNavigate('candidate-profile')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="lg:col-span-3">
                {/* Profile Header Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-start space-x-6">
                    {/* Profile Picture with Progress Ring */}
                    <div className="relative">
                      <div className="relative w-24 h-24">
                        {/* Progress Ring */}
                        <svg className="w-24 h-24 transform -rotate-90 absolute" viewBox="0 0 36 36">
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
                        {/* Profile Photo */}
                        <div className="absolute inset-2">
                          {user?.profilePhoto ? (
                            <img 
                              src={user.profilePhoto} 
                              alt="Profile" 
                              className="w-full h-full rounded-full object-cover cursor-pointer"
                              onClick={() => setShowPhotoEditor(true)}
                            />
                          ) : (
                            <div 
                              className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-gray-400 transition-colors"
                              onClick={() => setShowPhotoEditor(true)}
                            >
                              <Camera className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        {/* Percentage */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <span className="text-xs font-semibold text-red-600 bg-white px-1 rounded">{completionPercentage}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                            {user?.name || 'Add your name'}
                          </h1>
                          <p className="text-gray-600 mb-2">
                            {user?.title || user?.jobTitle || 'Add your professional title'}
                          </p>
                          <p className="text-gray-500 text-sm mb-3">
                            {user?.education || 'Add your education details'}
                          </p>
                          
                          {/* Contact Info */}
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{user?.location || 'Chennai'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span>{user?.phone || '9500366784'}</span>
                              {user?.phone && <span className="text-green-500">✓</span>}
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span>{user?.email || 'Add email'}</span>
                              {user?.email && <span className="text-green-500">✓</span>}
                            </div>
                          </div>
                          
                          {/* Action Links */}
                          <div className="flex items-center space-x-4 mt-3 text-sm">
                            <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>Add Gender</span>
                            </button>
                            <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8" />
                              </svg>
                              <span>Add birthday</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Profile Completion Card */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-sm">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span className="text-gray-700">Add details</span>
                              </div>
                              <span className="text-green-600 text-xs">↑ 8%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span className="text-gray-700">Add details</span>
                              </div>
                              <span className="text-green-600 text-xs">↑ 7%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                <span className="text-gray-700">Add competitive exam</span>
                              </div>
                              <span className="text-green-600 text-xs">↑ 6%</span>
                            </div>
                            <button 
                              onClick={() => onNavigate('candidate-profile')}
                              className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Add 13 missing details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                                  const updatedUser = { ...user, bannerPhoto: imageUrl };
                                  setUser(updatedUser);
                                  // Update localStorage immediately
                                  localStorage.setItem('user', JSON.stringify(updatedUser));
                                } else {
                                  console.log('Backend save failed, saving to localStorage only');
                                  const updatedUser = { ...user, bannerPhoto: imageUrl };
                                  setUser(updatedUser);
                                  localStorage.setItem('user', JSON.stringify(updatedUser));
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
                {/* Education Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Education</h2>
                    <button 
                      onClick={() => {
                        setEditingEducation(null);
                        setShowEducationModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                  {user?.educationList && user.educationList.length > 0 ? (
                    <div className="space-y-4">
                      {user.educationList.map((edu: any, index: number) => (
                        <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                          <h3 className="font-semibold text-gray-900">{edu.degree} from {edu.school}</h3>
                          <p className="text-gray-500 text-sm">Graduated in {edu.endYear || 'Present'}, {edu.fieldOfStudy || 'Full Time'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Add your education details</p>
                  )}
                </div>

                {/* Key Skills Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Key skills</h2>
                    <button 
                      onClick={() => onNavigate('candidate-profile')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                  {user?.skills && user.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Add your key skills</p>
                  )}
                </div>

                {/* Languages Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Languages</h2>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Add</button>
                  </div>
                  <p className="text-gray-500">Talk about the languages that you can speak, read or write</p>
                </div>

                {/* AI Job Recommendations */}
                {user?.skills && user.skills.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
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
                  title="Close modal"
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