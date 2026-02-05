import React, { useState, useEffect } from 'react';
import { Camera, ChevronDown, Info, TrendingUp, Star, Edit, FileText, Search, Bell, MessageSquare } from 'lucide-react';
import Notification from '../components/Notification';
import BackButton from '../components/BackButton';
import ProfilePhotoEditor from '../components/ProfilePhotoEditor';
import JobAlertsManager from '../components/JobAlertsManager';
import MistralJobRecommendations from '../components/MistralJobRecommendations';
import { API_ENDPOINTS } from '../config/env';

interface CandidateDashboardPageProps {
  onNavigate: (page: string) => void;
}

const CandidateDashboardPage: React.FC<CandidateDashboardPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Profile');
  const [completionPercentage, setCompletionPercentage] = useState(40);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    isVisible: boolean;
  }>({ type: 'success', message: '', isVisible: false });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);

  const fetchActivityInsights = async (userId: string) => {
    setLoadingActivity(true);
    try {
      // Get real applications data
      const applicationsRes = await fetch(`${API_ENDPOINTS.BASE_URL}/api/applications/candidate/${encodeURIComponent(user?.email || userId)}`);
      
      let realData = {
        profileViews: 0,
        searchAppearances: 0,
        applicationsSent: 0,
        recruiterActions: 0,
        recentActivity: [] as Array<{
          type: string;
          company: string;
          message: string;
          time: string;
          icon: string;
        }>
      };

      // Get applications count from database
      if (applicationsRes.ok) {
        const applications = await applicationsRes.json();
        realData.applicationsSent = Array.isArray(applications) ? applications.length : 0;
        
        // Create recent activity from applications
        if (Array.isArray(applications) && applications.length > 0) {
          realData.recentActivity = applications.slice(0, 3).map((app: any) => ({
            type: 'application',
            company: app.jobId?.company || 'Company',
            message: `You applied for ${app.jobId?.jobTitle || 'a position'}`,
            time: new Date(app.createdAt).toLocaleDateString(),
            icon: '📝'
          }));
        }
      }

      // Estimate other metrics based on applications
      realData.searchAppearances = realData.applicationsSent * 3 + 5;
      realData.profileViews = realData.applicationsSent * 2 + 3;
      realData.recruiterActions = Math.floor(realData.applicationsSent * 0.5);

      // Add default activity if no applications
      if (realData.recentActivity.length === 0) {
        realData.recentActivity = [
          {
            type: 'profile_setup',
            company: 'ZyncJobs',
            message: 'Profile created successfully',
            time: 'Recently',
            icon: '👤'
          }
        ];
      }

      setActivityData(realData);
      
    } catch (error) {
      console.error('Error fetching activity insights:', error);
      // Fallback data
      setActivityData({
        profileViews: 5,
        searchAppearances: 12,
        applicationsSent: 0,
        recruiterActions: 2,
        recentActivity: [
          {
            type: 'info',
            company: 'ZyncJobs',
            message: 'Complete your profile to start tracking activity',
            time: 'Now',
            icon: '📊'
          }
        ]
      });
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          
          // Fetch fresh data from database
          try {
            const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/${parsedUser.email}`);
            if (response.ok) {
              const profileData = await response.json();
              // Merge database data with localStorage data
              const updatedUser = { ...parsedUser, ...profileData };
              setUser(updatedUser);
              // Update localStorage with fresh data
              localStorage.setItem('user', JSON.stringify(updatedUser));
              calculateProfileCompletion(updatedUser);
            } else {
              setUser(parsedUser);
              calculateProfileCompletion(parsedUser);
            }
          } catch (error) {
            console.error('Error fetching profile from database:', error);
            setUser(parsedUser);
            calculateProfileCompletion(parsedUser);
          }
          
          fetchNotifications(parsedUser.email);
          // Fetch activity insights when Activity tab is active
          if (activeTab === 'Activity') {
            fetchActivityInsights(parsedUser.email);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    loadUserProfile();
    
    // Listen for storage changes to update profile when returning from edit page
    const handleStorageChange = () => {
      loadUserProfile();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for focus events to reload data when returning to tab
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const fetchNotifications = async (userId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/notifications/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        // Fetch real jobs from database for notifications
        const jobsResponse = await fetch(`${API_ENDPOINTS.JOBS}?limit=5`);
        if (jobsResponse.ok) {
          const jobs = await jobsResponse.json();
          const jobNotifications = jobs.map((job: any, index: number) => ({
            id: job._id || index,
            type: 'job',
            company: job.company || 'Company',
            title: `New job: ${job.jobTitle || job.title}`,
            message: `${job.company} is hiring for ${job.jobTitle || job.title} in ${job.location}`,
            actionText: 'View Job',
            time: new Date(job.createdAt).toLocaleDateString() === new Date().toLocaleDateString() ? 
                  `${Math.floor(Math.random() * 12) + 1}h ago` : 
                  `${Math.floor(Math.random() * 7) + 1}d ago`,
            jobId: job._id
          }));
          setNotifications(jobNotifications);
        } else {
          // Fallback mock notifications
          setNotifications([
            {
              id: 1,
              type: 'job',
              company: 'Wipro',
              title: '2 roles where you could become a top applicant',
              message: 'Jobs based on your profile',
              actionText: 'View Jobs',
              time: '1h ago'
            },
            {
              id: 2,
              type: 'job',
              company: 'Swiggy',
              title: '15 new job recommendations based on your profile',
              message: 'Jobs based on your profile',
              actionText: 'View Jobs',
              time: '1d ago'
            },
            {
              id: 3,
              type: 'application',
              company: 'Zoho',
              title: '2 roles where you could become a top applicant',
              message: 'Jobs based on your profile',
              actionText: 'View Jobs',
              time: '3d ago'
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback mock notifications
      setNotifications([
        {
          id: 1,
          type: 'job',
          company: 'Wipro',
          title: '2 roles where you could become a top applicant',
          message: 'Jobs based on your profile',
          actionText: 'View Jobs',
          time: '1h ago'
        },
        {
          id: 2,
          type: 'job',
          company: 'Swiggy',
          title: '15 new job recommendations based on your profile',
          message: 'Jobs based on your profile',
          actionText: 'View Jobs',
          time: '1d ago'
        }
      ]);
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

  return (
    <>
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />
      <div className="min-h-screen bg-gray-50 font-['IBM_Plex_Sans']">
        {/* Tab Navigation */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8">
              <BackButton 
                onClick={() => onNavigate && onNavigate('home')}
                text="Back to Home"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors py-4 font-['IBM_Plex_Sans']"
              />
              <button 
                onClick={() => setActiveTab('Profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm font-['IBM_Plex_Sans'] ${
                  activeTab === 'Profile' 
                    ? 'border-black text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                View & Edit
              </button>
              <button 
                onClick={() => {
                  setActiveTab('Activity');
                  if (user && !activityData) {
                    fetchActivityInsights(user.email);
                  }
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm font-['IBM_Plex_Sans'] ${
                  activeTab === 'Activity' 
                    ? 'border-black text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Activity insights
              </button>
            </div>
          </div>
        </div>

        {/* Notification Bell - Fixed Position */}
        <div className="fixed top-20 right-4 z-50">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 bg-white rounded-full shadow-lg border text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="View notifications"
            title="View notifications"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-xs">
                {notifications.length}
              </span>
            )}
          </button>
          
          {/* Simple Alert Popup */}
          {notifications.length > 0 && !showNotifications && (
            <div className="absolute top-12 right-0 w-64 bg-white rounded-lg shadow-lg border p-3 animate-pulse">
              <p className="text-sm text-gray-700">
                You have {notifications.length} new job notifications
              </p>
              <p className="text-xs text-gray-500 mt-1">Click bell to view details</p>
            </div>
          )}
        </div>

        {/* Notifications Sidebar */}
        {showNotifications && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowNotifications(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close notifications"
                  title="Close notifications"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="h-full overflow-y-auto pb-20">
                {notifications.length > 0 ? (
                  <>
                    <div className="p-3 text-sm text-gray-500 border-b bg-gray-50">Today</div>
                    {notifications.map((notification, index) => (
                      <div key={index} className="p-4 border-b hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                            notification.company === 'Wipro' ? 'bg-orange-500' : 
                            notification.company === 'Swiggy' ? 'bg-red-500' : 
                            notification.company === 'Zoho' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}>
                            {notification.company?.charAt(0) || 'N'}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{notification.title}</h4>
                            <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                            {notification.actionText && (
                              <button 
                                onClick={() => {
                                  if (notification.actionText === 'View Jobs' || notification.actionText === 'View Job') {
                                    setShowNotifications(false);
                                    onNavigate('job-listings');
                                  } else if (notification.jobId) {
                                    setShowNotifications(false);
                                    onNavigate('job-detail', { jobId: notification.jobId });
                                  }
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 border border-blue-600 rounded-lg"
                              >
                                {notification.actionText}
                              </button>
                            )}
                          </div>
                          <span className="text-xs text-gray-400">{notification.time}</span>
                        </div>
                      </div>
                    ))}
                    
                    {notifications.length > 3 && (
                      <>
                        <div className="p-3 text-sm text-gray-500 border-b bg-gray-50">Earlier</div>
                        <div className="p-4 border-b hover:bg-gray-50 cursor-pointer">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold bg-green-500">
                              T
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">Profile viewed by Trinity Tech</h4>
                              <p className="text-sm text-gray-600 mb-3">Your profile was viewed by a recruiter</p>
                            </div>
                            <span className="text-xs text-gray-400">2d ago</span>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">No notifications yet</p>
                    <p className="text-sm">We'll notify you when there's something new</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'Profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar - Quick Actions */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => onNavigate('job-listings')}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Search className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">Browse All Jobs</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                      <Star className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">Company Reviews</span>
                    </button>
                    <button 
                      onClick={() => onNavigate('skill-assessment')}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">Take Skill Assessment</span>
                    </button>
                    <button 
                      onClick={() => onNavigate('my-applications')}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">My Applications</span>
                    </button>
                    <button 
                      onClick={() => onNavigate('candidate-profile')}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">Update Profile</span>
                    </button>
                    <button 
                      onClick={() => onNavigate('settings')}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-700">Settings</span>
                    </button>
                  </div>
                </div>

                {/* Skill Assessments Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4">Skill Assessments</h3>
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-8 h-8 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">Take New Assessment</h4>
                      <p className="text-sm text-gray-600 mb-4">Test your skills and showcase your expertise</p>
                      <button 
                        onClick={() => onNavigate('skill-assessment')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Start Assessment
                      </button>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">My Assessments</h4>
                      <p className="text-sm text-gray-500">No assessments completed yet</p>
                    </div>
                  </div>
                </div>

                {/* AI Job Recommendations */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">🤖</span>
                    <h3 className="text-lg font-semibold text-gray-900">AI Job Suggestions</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">Senior React Developer</h4>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">95% Match</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">Perfect match for your React and JavaScript skills</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">React</span>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">JavaScript</span>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Node.js</span>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">Full Stack Developer</h4>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">88% Match</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">Your frontend and backend skills make you ideal</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">React</span>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Node.js</span>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">Frontend Engineer</h4>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">85% Match</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">Strong foundation in modern frontend technologies</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">React</span>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">JavaScript</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">💼</span>
                      <span className="text-sm">Live Job Postings</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-medium text-gray-900 text-sm">Software Engineer</h5>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">60% Match</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">Zoho • Remote - India</p>
                        <p className="text-xs text-green-600 font-medium mb-2">₹50,000 - ₹80,000</p>
                        <div className="flex gap-1 mb-2">
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">JavaScript</span>
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Python</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Apply</button>
                          <button className="text-xs text-blue-600 hover:text-blue-800">View Details</button>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-medium text-gray-900 text-sm">Full Stack Developer</h5>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">60% Match</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">Trinity Technology • Chennai</p>
                        <p className="text-xs text-green-600 font-medium mb-2">₹50,000 - ₹80,000</p>
                        <div className="flex gap-1 mb-2">
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Communication</span>
                          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Problem Solving</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Apply</button>
                          <button className="text-xs text-blue-600 hover:text-blue-800">View Details</button>
                        </div>
                      </div>
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
                              className="w-full h-full bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-gray-500 transition-colors text-xs"
                              onClick={() => setShowPhotoEditor(true)}
                            >
                              Add photo
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
                          <div className="flex items-center space-x-2 mb-1">
                            <h1 className="text-2xl font-semibold text-gray-900">
                              {user?.name || 'mutheeswaran'}
                            </h1>
                            <Edit className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600" />
                          </div>
                          <p className="text-gray-600 mb-2">
                            Bachelor of Technology / Bachelor of Engineering (B.Tech/B.E.)
                          </p>
                          <p className="text-gray-500 text-sm mb-3">
                            Loyola - Icam College Of Engineering And Technology, Chennai
                          </p>
                          
                          {/* Contact Info */}
                          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>Chennai</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span>9500366784</span>
                              <span className="text-green-500">✓</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span>mutheeswaran124@...</span>
                              <span className="text-green-500">✓</span>
                            </div>
                          </div>
                          
                          {/* Action Links */}
                          <div className="flex items-center space-x-4 text-sm">
                            <button 
                              onClick={() => onNavigate('candidate-profile')}
                              className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>{user?.gender || 'Add Gender'}</span>
                            </button>
                            <button 
                              onClick={() => onNavigate('candidate-profile')}
                              className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 6v6m-4-6h8" />
                              </svg>
                              <span>{user?.birthday || 'Add birthday'}</span>
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

                {/* Your career preferences */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Your career preferences</h2>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Add</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Preferred job type</p>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Add desired job type</button>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Availability to work</p>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Add work availability</button>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">Preferred location</p>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Add preferred work location</button>
                    </div>
                  </div>
                </div>

                {/* Education Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Education</h2>
                    <button 
                      onClick={() => onNavigate('candidate-profile')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="border-b border-gray-100 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">Bachelor of Technology / Bachelor of Engineering (B.Tech/B.E.) from Loyola - Icam College Of Engineering...</h3>
                          <p className="text-gray-500 text-sm">Graduated in 2025, Full Time</p>
                        </div>
                        <Edit className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium block">Add Class XII Details</button>
                      <p className="text-gray-500 text-xs">Scored Percentage, Passed out in Passing Year</p>
                    </div>
                    <div className="space-y-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium block">Add Class X Details</button>
                      <p className="text-gray-500 text-xs">Scored Percentage, Passed out in Passing Year</p>
                    </div>
                  </div>
                </div>

                {/* Key Skills Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                      <span>Key skills</span>
                      <Edit className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-600" />
                    </h2>
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
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">Python</span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">Python Software Developer</span>
                    </div>
                  )}
                </div>

                {/* Languages Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Languages</h2>
                    <button 
                      onClick={() => onNavigate('candidate-profile')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {user?.languages && user.languages.length > 0 ? 'Edit' : 'Add'}
                    </button>
                  </div>
                  {user?.languages && user.languages.length > 0 ? (
                    <p className="text-gray-700">{Array.isArray(user.languages) ? user.languages.join(', ') : user.languages}</p>
                  ) : (
                    <p className="text-gray-500">Talk about the languages that you can speak, read or write</p>
                  )}
                </div>

                {/* Profile Summary Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Profile Summary</h2>
                    <button 
                      onClick={() => onNavigate('candidate-profile')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {user?.profileSummary && user.profileSummary.trim() ? 'Edit' : 'Add'}
                    </button>
                  </div>
                  {user?.profileSummary && user.profileSummary.trim() ? (
                    <p className="text-gray-700">{user.profileSummary}</p>
                  ) : (
                    <p className="text-gray-500">Your Profile Summary should mention the highlights of your career and education, what your professional interests are, and what kind of a career you are looking for. Write a meaningful summary of more than 50 characters.</p>
                  )}
                </div>

                {/* Employment Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Employment</h2>
                    <button 
                      onClick={() => onNavigate('candidate-profile')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {user?.employment || user?.experience ? 'Edit' : 'Add'}
                    </button>
                  </div>
                  {user?.employment || user?.experience ? (
                    <div className="space-y-2">
                      {user?.companyName && (
                        <p className="font-medium text-gray-900">{user.companyName} - {user.roleTitle}</p>
                      )}
                      <p className="text-gray-700 whitespace-pre-line">{user.employment || user.experience}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Talk about the company you worked at, your designation and describe what all you did there</p>
                  )}
                </div>

                {/* Projects Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
                    <button 
                      onClick={() => onNavigate('candidate-profile')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {user?.projects ? 'Edit' : 'Add'}
                    </button>
                  </div>
                  {user?.projects ? (
                    <p className="text-gray-700 whitespace-pre-line">{user.projects}</p>
                  ) : (
                    <p className="text-gray-500">Talk about your projects that made you proud and contributed to your learnings</p>
                  )}
                </div>

                {/* Internships Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Internships</h2>
                    <button 
                      onClick={() => onNavigate('candidate-profile')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {user?.internships ? 'Edit' : 'Add'}
                    </button>
                  </div>
                  {user?.internships ? (
                    <p className="text-gray-700 whitespace-pre-line">{user.internships}</p>
                  ) : (
                    <p className="text-gray-500">Talk about the company you interned at, what projects you undertook and what special skills you learned</p>
                  )}
                </div>

                {/* Accomplishments Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Accomplishments</h2>
                  </div>
                  <div className="space-y-4">
                    {/* Certifications */}
                    <div className="border-b border-gray-100 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">Certifications</h3>
                        <button 
                          onClick={() => onNavigate('candidate-profile')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {user?.certifications && user.certifications.trim() ? 'Edit' : 'Add'}
                        </button>
                      </div>
                      {user?.certifications && user.certifications.trim() ? (
                        <p className="text-gray-700 whitespace-pre-line">{user.certifications}</p>
                      ) : (
                        <p className="text-gray-500 text-sm">Talk about any certified courses that you completed</p>
                      )}
                    </div>

                    {/* Awards */}
                    <div className="border-b border-gray-100 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">Awards</h3>
                        <button 
                          onClick={() => onNavigate('candidate-profile')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {user?.awards && user.awards.trim() ? 'Edit' : 'Add'}
                        </button>
                      </div>
                      {user?.awards && user.awards.trim() ? (
                        <p className="text-gray-700 whitespace-pre-line">{user.awards}</p>
                      ) : (
                        <p className="text-gray-500 text-sm">Talk about any special recognitions that you received that makes you proud</p>
                      )}
                    </div>

                    {/* Club & committees */}
                    <div className="border-b border-gray-100 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">Club & committees</h3>
                        <button 
                          onClick={() => onNavigate('candidate-profile')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {user?.clubsCommittees && user.clubsCommittees.trim() ? 'Edit' : 'Add'}
                        </button>
                      </div>
                      {user?.clubsCommittees && user.clubsCommittees.trim() ? (
                        <p className="text-gray-700 whitespace-pre-line">{user.clubsCommittees}</p>
                      ) : (
                        <p className="text-gray-500 text-sm">Add details of position of responsibilities that you have held</p>
                      )}
                    </div>

                    {/* Competitive exams */}
                    <div className="border-b border-gray-100 pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">Competitive exams</h3>
                        <button 
                          onClick={() => onNavigate('candidate-profile')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {user?.competitiveExams && user.competitiveExams.trim() ? 'Edit' : 'Add'}
                        </button>
                      </div>
                      {user?.competitiveExams && user.competitiveExams.trim() ? (
                        <p className="text-gray-700 whitespace-pre-line">{user.competitiveExams}</p>
                      ) : (
                        <p className="text-gray-500 text-sm">Talk about any competitive exam that you appeared for and the rank received</p>
                      )}
                    </div>

                    {/* Academic achievements */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">Academic achievements</h3>
                        <button 
                          onClick={() => onNavigate('candidate-profile')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {user?.academicAchievements && user.academicAchievements.trim() ? 'Edit' : 'Add'}
                        </button>
                      </div>
                      {user?.academicAchievements && user.academicAchievements.trim() ? (
                        <p className="text-gray-700 whitespace-pre-line">{user.academicAchievements}</p>
                      ) : (
                        <p className="text-gray-500 text-sm">Talk about any academic achievement whether in college or school that deserves a mention</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resume Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Resume</h2>
                  </div>
                  <p className="text-gray-500 mb-4">Your resume is the first impression you make on potential employers. Craft it carefully to secure your desired job or internship.</p>
                  {user?.resume ? (
                    <div className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{user.resume.name || 'Resume.pdf'}</p>
                          <p className="text-sm text-gray-500">Uploaded on {user.resume.uploadDate || 'Recently'}</p>
                        </div>
                        <button 
                          onClick={() => onNavigate('candidate-profile')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <button 
                        onClick={() => onNavigate('candidate-profile')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Upload resume
                      </button>
                      <p className="text-gray-500 text-sm mt-2">Supported formats: doc, docx, rtf, pdf, up to 2MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Activity' && (
            <div className="space-y-6">
              {loadingActivity ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading activity insights...</span>
                  </div>
                </div>
              ) : activityData ? (
                <>
                  {/* Activity Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">👁️</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Profile Views</p>
                          <p className="text-2xl font-bold text-gray-900">{activityData.profileViews}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🔍</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Search Appearances</p>
                          <p className="text-2xl font-bold text-gray-900">{activityData.searchAppearances}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">📝</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Applications Sent</p>
                          <p className="text-2xl font-bold text-gray-900">{activityData.applicationsSent}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">💼</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Recruiter Actions</p>
                          <p className="text-2xl font-bold text-gray-900">{activityData.recruiterActions}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                      {activityData.recentActivity.map((activity: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <span className="text-2xl">{activity.icon}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.company} • {activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity Chart Placeholder */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Trends</h2>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl mb-4 block">📈</span>
                        <p className="text-gray-600">Activity chart will be implemented here</p>
                        <p className="text-sm text-gray-500 mt-2">Track your profile performance over time</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">📈</span>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Activity Data</h2>
                    <p className="text-gray-500">Start applying to jobs to see your activity insights</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <ProfilePhotoEditor
        isOpen={showPhotoEditor}
        onClose={() => setShowPhotoEditor(false)}
        onSave={async (photo, frame) => {
          const updatedUser = { ...user, profilePhoto: photo, profileFrame: frame || 'none' };
          setUser(updatedUser);
          
          // Save to localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Save to database
          try {
            const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/profile/save`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user?.id || user?._id || user?.email,
                email: user?.email,
                profilePhoto: photo,
                profileFrame: frame || 'none'
              })
            });
            
            if (response.ok) {
              console.log('Profile photo saved to database successfully');
            } else {
              console.warn('Failed to save profile photo to database');
            }
          } catch (error) {
            console.error('Error saving profile photo to database:', error);
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
    </>
  );
};

export default CandidateDashboardPage;