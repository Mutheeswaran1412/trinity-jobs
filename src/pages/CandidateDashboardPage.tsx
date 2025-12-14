import React, { useState, useEffect } from 'react';
import { Camera, ChevronDown, Info, Linkedin } from 'lucide-react';
import Notification from '../components/Notification';
import ResumeUploadModal from '../components/ResumeUploadModal';
import ResumeParserModal from '../components/ResumeParserModal';
import LinkedInImportModal from '../components/LinkedInImportModal';

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
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    isVisible: boolean;
  }>({ type: 'success', message: '', isVisible: false });
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showParserModal, setShowParserModal] = useState(false);
  const [showWelcomeParser, setShowWelcomeParser] = useState(false);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Loading user data:', parsedUser);
        setUser(parsedUser);
        calculateProfileCompletion(parsedUser);
        fetchApplications(parsedUser.email);
        
        // Show parser popup for new users without complete profile
        const profileComplete = parsedUser.name && parsedUser.location && parsedUser.skills?.length > 0;
        const hasSeenParser = localStorage.getItem('hasSeenResumeParser');
        const isNewUser = !parsedUser.name && !parsedUser.location && !parsedUser.skills;
        
        if (isNewUser && !hasSeenParser) {
          setTimeout(() => {
            setShowWelcomeParser(true);
          }, 2000);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        setUser(null);
      }
    } else {
      setUser(null);
      // Show popup for users with no data (completely new)
      const hasSeenParser = localStorage.getItem('hasSeenResumeParser');
      if (!hasSeenParser) {
        setTimeout(() => {
          setShowWelcomeParser(true);
        }, 2000);
      }
    }
    setLoading(false);
  }, []);

  const fetchApplications = async (email: string) => {
    if (!email) {
      console.log('No email provided for fetching applications');
      return;
    }
    try {
      console.log('Dashboard: Fetching applications for email:', email);
      const response = await fetch(`http://localhost:5000/api/applications/candidate/${email}`);
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

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          type: 'error',
          message: 'File size must be less than 5MB',
          isVisible: true
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setNotification({
          type: 'error',
          message: 'Please select a valid image file',
          isVisible: true
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        const updatedUser = { ...user, profilePhoto: imageUrl };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
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
          <div className="flex space-x-8">
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
              onClick={() => setActiveTab('Applications')}
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
        {/* Applications Tab Content */}
        {activeTab === 'Applications' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">📊 My Applications</h2>
              <button
                onClick={() => fetchApplications(user?.email)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Refresh
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{applications.length}</p>
                  <p className="text-sm text-gray-600">Total Applied</p>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{applications.filter(app => app.status === 'pending').length}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{applications.filter(app => app.status === 'shortlisted').length}</p>
                  <p className="text-sm text-gray-600">Shortlisted</p>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{applications.filter(app => app.status === 'hired').length}</p>
                  <p className="text-sm text-gray-600">Hired</p>
                </div>
              </div>
            </div>
            
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600 mb-4">Start applying to jobs to track your applications here</p>
                <button
                  onClick={() => onNavigate('job-listings')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
                {applications.slice(0, 5).map((app: any) => (
                  <div key={app._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{app.jobId?.jobTitle || 'Job Position'}</h4>
                        <p className="text-sm text-gray-600">{app.jobId?.company || 'Company'}</p>
                        <p className="text-xs text-gray-500 mt-1">Applied {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                        app.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
                {applications.length > 5 && (
                  <button
                    onClick={() => onNavigate('my-applications')}
                    className="w-full text-center text-blue-600 hover:text-blue-700 font-medium py-2"
                  >
                    View All {applications.length} Applications →
                  </button>
                )}
              </div>
            )}
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => onNavigate('job-listings')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium">Apply to More Jobs</h4>
                      <p className="text-sm text-gray-600">Browse and apply to new opportunities</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => onNavigate('candidate-profile')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <div>
                      <h4 className="font-medium">Improve Profile</h4>
                      <p className="text-sm text-gray-600">Complete your profile to get better matches</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'Profile' && (
        <>
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
          {/* Banner Section */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    setNotification({
                      type: 'error',
                      message: 'Banner image must be less than 5MB',
                      isVisible: true
                    });
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const imageUrl = event.target?.result as string;
                    const updatedUser = { ...user, bannerPhoto: imageUrl };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setNotification({
                      type: 'success',
                      message: 'Banner updated successfully!',
                      isVisible: true
                    });
                  };
                  reader.readAsDataURL(file);
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
                  onClick={() => document.getElementById('banner-photo-upload')?.click()}
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                  title="Change banner"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ) : (
              <div className="h-48 bg-gray-300 relative">
                <button 
                  onClick={() => document.getElementById('banner-photo-upload')?.click()}
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-colors"
                  title="Add banner image"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Add banner image</p>
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
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                  id="profile-photo-upload"
                />
                <label htmlFor="profile-photo-upload" className="cursor-pointer">
                  {user?.profilePhoto ? (
                    <img 
                      src={user.profilePhoto} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg hover:shadow-xl transition-shadow"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-3xl font-semibold text-gray-600 border-4 border-white shadow-lg hover:shadow-xl transition-shadow">
                      {getInitials(user?.name || '')}
                    </div>
                  )}
                </label>
                <button 
                  onClick={() => document.getElementById('profile-photo-upload')?.click()}
                  className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-md transition-colors"
                  title="Change profile photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1 mt-4">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {user?.name || 'New User'}
              </h1>
              {user?.title || user?.jobTitle ? (
                <p className="text-lg text-gray-700 mb-2">{user.title || user.jobTitle}</p>
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
                      onClick={() => setProfileVisibility(!profileVisibility)}
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
                      onClick={() => setShowLinkedInModal(true)}
                      className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>Import from LinkedIn</span>
                    </button>
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
            {user?.experience ? (
              <div className="p-4">
                <p className="text-gray-900 whitespace-pre-line">{user.experience}</p>
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
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View
                  </button>
                  <button 
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.pdf,.doc,.docx';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const updatedUser = { 
                            ...user, 
                            resume: { 
                              name: file.name, 
                              uploadDate: new Date().toLocaleDateString() 
                            } 
                          };
                          setUser(updatedUser);
                          localStorage.setItem('user', JSON.stringify(updatedUser));
                          setNotification({
                            type: 'success',
                            message: 'Resume updated successfully!',
                            isVisible: true
                          });
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
                      localStorage.setItem('user', JSON.stringify(updatedUser));
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
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Education</h2>
            {user?.education ? (
              <div className="p-4">
                <p className="text-gray-900 whitespace-pre-line">{user.education}</p>
                {user?.certifications && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Certifications:</h4>
                    <p className="text-gray-900 whitespace-pre-line">{user.certifications}</p>
                  </div>
                )}
                <button 
                  onClick={() => onNavigate('candidate-profile')}
                  className="mt-4 text-blue-600 hover:text-blue-800 hover:underline text-sm transition-colors cursor-pointer"
                >
                  Edit education
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 font-medium mb-2">Add any formal education or professional qualifications</p>
                <p className="text-sm text-gray-500 mb-6">
                  These could help you get hired for the roles you want.
                </p>
                <button 
                  onClick={() => onNavigate('candidate-profile')}
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
        </>
        )}
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
            ...(profileData.education && { education: profileData.education })
          };
          
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          calculateProfileCompletion(updatedUser);
          
          setNotification({
            type: 'success',
            message: 'Profile auto-filled from resume!',
            isVisible: true
          });
        }}
        userProfile={user}
      />
      
      <LinkedInImportModal
        isOpen={showLinkedInModal}
        onClose={() => setShowLinkedInModal(false)}
        onImport={(data) => {
          const updatedUser = {
            ...user,
            ...(data.name && { name: data.name }),
            ...(data.email && { email: data.email }),
            ...(data.phone && { phone: data.phone }),
            ...(data.location && { location: data.location }),
            ...(data.headline && { title: data.headline }),
            ...(data.summary && { summary: data.summary }),
            ...(data.skills?.length > 0 && { skills: data.skills }),
            ...(data.experience?.length > 0 && { 
              experience: data.experience.map((exp: any) => 
                `${exp.title} at ${exp.company}\n${exp.duration}\n${exp.description}`
              ).join('\n\n')
            }),
            ...(data.education?.length > 0 && { 
              education: data.education.map((edu: any) => 
                `${edu.degree} - ${edu.school}\n${edu.field} (${edu.year})`
              ).join('\n\n')
            }),
            ...(data.certifications?.length > 0 && { certifications: data.certifications.join(', ') }),
            ...(data.languages?.length > 0 && { languages: data.languages })
          };
          
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          calculateProfileCompletion(updatedUser);
          setShowLinkedInModal(false);
          
          setNotification({
            type: 'success',
            message: 'Profile imported from LinkedIn successfully!',
            isVisible: true
          });
        }}
      />
      
      <ResumeParserModal
        isOpen={showParserModal || showWelcomeParser}
        onClose={() => {
          setShowParserModal(false);
          setShowWelcomeParser(false);
          localStorage.setItem('hasSeenResumeParser', 'true');
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
          localStorage.setItem('user', JSON.stringify(updatedUser));
          calculateProfileCompletion(updatedUser);
          
          setNotification({
            type: 'success',
            message: 'Profile updated successfully from resume!',
            isVisible: true
          });
        }}
      />
      </div>
    </>
  );
};

export default CandidateDashboardPage;