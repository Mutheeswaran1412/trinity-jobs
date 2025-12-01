import React, { useState, useEffect } from 'react';
import { ChevronRight, Briefcase, MapPin, DollarSign, Bookmark } from 'lucide-react';

interface MyJobsPageProps {
  onNavigate: (page: string) => void;
  user?: any;
  onLogout?: () => void;
}

const MyJobsPage: React.FC<MyJobsPageProps> = ({ onNavigate, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState(user?.type === 'employer' ? 'Posted' : 'Saved');
  const [showExpiredJobs, setShowExpiredJobs] = useState(false);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.type === 'candidate') {
      // Load candidate's saved jobs
      const userKey = `savedJobDetails_${user.name || 'user'}`;
      const savedJobDetails = localStorage.getItem(userKey);
      if (savedJobDetails) {
        setSavedJobs(JSON.parse(savedJobDetails));
      }
    } else if (user?.type === 'employer') {
      // Load employer's posted jobs
      fetchEmployerJobs();
    }
    setLoading(false);
  }, [user]);

  const fetchEmployerJobs = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const jobsResponse = await fetch('http://localhost:5000/api/jobs');
      if (jobsResponse.ok) {
        const allJobs = await jobsResponse.json();
        
        console.log('MyJobs - All jobs:', allJobs.length);
        console.log('MyJobs - User data:', userData);
        console.log('MyJobs - Sample job:', allJobs[0]);
        
        const employerJobs = allJobs.filter((job: any) => {
          const matchesId = job.employerId === userData.id || job.employer_id === userData.id;
          const matchesEmail = job.employerEmail === userData.email || job.employer_email === userData.email;
          const matchesCompany = job.company?.toLowerCase() === userData.companyName?.toLowerCase();
          const matchesSpecial = userData.email === 'muthees@trinitetech.com' && 
            (job.company?.toLowerCase().includes('muthees') || job.company?.toLowerCase().includes('trinity'));
          
          const matches = matchesId || matchesEmail || matchesCompany || matchesSpecial;
          
          if (matches) {
            console.log('MyJobs - Job matches:', job.title || job.jobTitle, {
              matchesId, matchesEmail, matchesCompany, matchesSpecial,
              jobCompany: job.company,
              jobEmployerEmail: job.employerEmail
            });
          }
          
          return matches;
        });
        
        console.log('MyJobs - Filtered jobs:', employerJobs.length);
        setPostedJobs(employerJobs);
      }
    } catch (error) {
      console.error('Error fetching employer jobs:', error);
    }
  };

  const handleRemoveSavedJob = (jobId: string) => {
    const updatedJobs = savedJobs.filter(job => (job._id || job.id) !== jobId);
    setSavedJobs(updatedJobs);
    
    // Use user-specific keys
    const userKey = `savedJobDetails_${user?.name || 'user'}`;
    const userJobIdsKey = `savedJobs_${user?.name || 'user'}`;
    
    localStorage.setItem(userKey, JSON.stringify(updatedJobs));
    
    const savedJobIds = JSON.parse(localStorage.getItem(userJobIdsKey) || '[]');
    const updatedJobIds = savedJobIds.filter((id: string) => id !== jobId);
    localStorage.setItem(userJobIdsKey, JSON.stringify(updatedJobIds));
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="bg-gray-900 text-white px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">My Jobs</h1>
          <p className="text-gray-300 text-lg">
            {user?.type === 'employer' 
              ? 'Manage your job postings and track applications.' 
              : 'Manage the status of your jobs, all in one place.'}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-900 px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {user?.type === 'employer' ? (
                <>
                  <button
                    onClick={() => setActiveTab('Posted')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${
                      activeTab === 'Posted'
                        ? 'bg-white text-gray-900'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Posted Jobs
                  </button>
                  <button
                    onClick={() => setActiveTab('Applications')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${
                      activeTab === 'Applications'
                        ? 'bg-white text-gray-900'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Applications
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('Saved')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${
                      activeTab === 'Saved'
                        ? 'bg-white text-gray-900'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Saved
                  </button>
                  <button
                    onClick={() => setActiveTab('Applied')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${
                      activeTab === 'Applied'
                        ? 'bg-white text-gray-900'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Applied
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => user?.type === 'employer' ? onNavigate('job-posting') : onNavigate('job-listings')}
              className="text-white hover:text-gray-300 flex items-center space-x-1 font-medium"
            >
              <span>{user?.type === 'employer' ? 'Post New Job' : 'View Recommended Jobs'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Tab Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                {activeTab} jobs
              </h2>
              
              {activeTab === 'Saved' && (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Show expired jobs</span>
                  <button
                    onClick={() => setShowExpiredJobs(!showExpiredJobs)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showExpiredJobs ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showExpiredJobs ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Job List or Empty State */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Candidate Saved Jobs */}
                {user?.type === 'candidate' && activeTab === 'Saved' && savedJobs.length > 0 ? (
                  <div className="space-y-4">
                    {savedJobs.map((job) => (
                      <div key={job._id || job.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                            <p className="text-lg text-blue-600 font-medium mb-2">{job.company}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4" />
                                <span>{typeof job.salary === 'object' && job.salary ? `$${job.salary.min} - $${job.salary.max} ${job.salary.period}` : job.salary || 'Competitive'}</span>
                              </div>
                            </div>
                            <p className="text-gray-600">{job.description}</p>
                          </div>
                          <div className="ml-6 flex flex-col space-y-2">
                            <button 
                              onClick={() => handleRemoveSavedJob(job._id || job.id)}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                              Remove
                            </button>
                            <button 
                              onClick={() => {
                                localStorage.setItem('selectedJob', JSON.stringify(job));
                                onNavigate('job-application');
                              }}
                              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                            >
                              Apply Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                
                {/* Employer Posted Jobs */}
                {user?.type === 'employer' && activeTab === 'Posted' && postedJobs.length > 0 ? (
                  <div className="space-y-4">
                    {postedJobs.map((job) => (
                      <div key={job._id || job.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title || job.jobTitle}</h3>
                            <p className="text-lg text-blue-600 font-medium mb-2">{job.company}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4" />
                                <span>{typeof job.salary === 'object' && job.salary ? `$${job.salary.min} - $${job.salary.max} ${job.salary.period}` : job.salary || 'Competitive'}</span>
                              </div>
                            </div>
                            <p className="text-gray-600">{job.description}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              Posted: {new Date(job.created_at || job.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="ml-6 flex flex-col space-y-2">
                            <button 
                              onClick={() => onNavigate('job-management')}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                              Manage
                            </button>
                            <button 
                              onClick={() => onNavigate('job-detail', { jobTitle: job.title, jobId: job._id || job.id, companyName: job.company })}
                              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                
                {/* Empty State */}
                {((user?.type === 'candidate' && activeTab === 'Saved' && savedJobs.length === 0) ||
                  (user?.type === 'employer' && activeTab === 'Posted' && postedJobs.length === 0) ||
                  (activeTab === 'Applied' || activeTab === 'Applications')) ? (
            <div className="text-center py-16">
              <div className="mb-8">
                <div className="relative inline-block">
                  <Briefcase className="w-24 h-24 text-gray-300 mx-auto" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">?</span>
                  </div>
                  {/* Decorative stars */}
                  <div className="absolute -top-4 -left-4 text-red-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-2 -right-8 text-blue-400">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="absolute -top-6 right-4 text-yellow-400">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-4 left-2 text-green-400">
                    <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-gray-600 text-lg mb-2">
                  {user?.type === 'employer' ? (
                    activeTab === 'Posted' ? (
                      <>You haven't posted any jobs yet. Start by creating your first job posting.</>  
                    ) : (
                      <>No applications received yet. Post more jobs to attract candidates.</>
                    )
                  ) : (
                    <>It looks like you haven't {activeTab.toLowerCase()} any jobs lately. Find opportunities through{' '}
                    <button
                      onClick={() => onNavigate('job-listings')}
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      Recommended Jobs
                    </button>
                    {' '}or{' '}
                    <button
                      onClick={() => onNavigate('job-listings')}
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      Job Search
                    </button>
                    .</>
                  )}
                </p>
              </div>

              <button
                onClick={() => user?.type === 'employer' ? onNavigate('job-posting') : onNavigate('job-listings')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto transition-colors"
              >
                <span>{user?.type === 'employer' ? 'Post Your First Job' : 'Go to Job Search'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyJobsPage;