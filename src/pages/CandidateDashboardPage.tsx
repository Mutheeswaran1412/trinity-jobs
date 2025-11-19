import React, { useState, useEffect } from 'react';
import { Camera, ChevronDown, Info } from 'lucide-react';
import Notification from '../components/Notification';

interface CandidateDashboardPageProps {
  onNavigate: (page: string) => void;
}

const CandidateDashboardPage: React.FC<CandidateDashboardPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Profile');
  const [profileVisibility, setProfileVisibility] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    isVisible: boolean;
  }>({ type: 'success', message: '', isVisible: false });

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      calculateProfileCompletion(parsedUser);
    }
    setLoading(false);
  }, []);

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
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start space-x-6">
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
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 hover:border-blue-400 transition-colors"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-semibold text-gray-600 hover:bg-gray-400 transition-colors">
                    {getInitials(user?.name || 'mutheeswaran ganesan')}
                  </div>
                )}
              </label>
              <button 
                onClick={() => document.getElementById('profile-photo-upload')?.click()}
                className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border hover:bg-gray-50 transition-colors"
                title="Change profile photo"
              >
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {user?.name || 'mutheeswaran ganesan'}
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

        {/* Profile Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* About Me Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">About Me</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{user?.name || 'mutheeswaran ganesan'}</p>
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
                <p className="text-gray-900">{user?.email || 'mutheeswaran124@gmail.com'}</p>
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
      </div>
    </div>
    </>
  );
};

export default CandidateDashboardPage;