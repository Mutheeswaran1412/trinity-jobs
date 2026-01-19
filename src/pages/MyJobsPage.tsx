import React, { useState, useEffect } from 'react';
import { ChevronRight, Briefcase, MapPin, DollarSign, Bookmark, Clock, Search, Filter } from 'lucide-react';
import { decodeHtmlEntities, formatDate, formatSalary } from '../utils/textUtils';

interface MyJobsPageProps {
  onNavigate: (page: string, data?: any) => void;
  user?: any;
  onLogout?: () => void;
}

const MyJobsPage: React.FC<MyJobsPageProps> = ({ onNavigate, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState(user?.type === 'employer' ? 'Posted Jobs' : 'Saved');
  const [showExpiredJobs, setShowExpiredJobs] = useState(false);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [postedJobs, setPostedJobs] = useState<any[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [employerApplications, setEmployerApplications] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyLogos, setCompanyLogos] = useState<{ [key: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);

  useEffect(() => {
    if (user?.type === 'candidate') {
      const userKey = `savedJobDetails_${user.name || 'user'}`;
      const savedJobDetails = localStorage.getItem(userKey);
      if (savedJobDetails) {
        setSavedJobs(JSON.parse(savedJobDetails));
      }
      fetchAppliedJobs();
    } else if (user?.type === 'employer') {
      fetchPostedJobs();
      fetchAllJobs();
      fetchEmployerApplications();
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (activeTab === 'Applied' && user?.type === 'candidate') {
      fetchAppliedJobs();
    }
  }, [activeTab]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'Applied' && user?.type === 'candidate') {
      interval = setInterval(() => {
        fetchAppliedJobs();
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, user]);

  const fetchPostedJobs = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('http://localhost:5000/api/jobs');
      if (response.ok) {
        const allJobs = await response.json();
        const employerJobs = allJobs.filter((job: any) => 
          job.employerId === userData.id || 
          job.employerEmail === userData.email ||
          job.company?.toLowerCase() === userData.companyName?.toLowerCase()
        );
        setPostedJobs(employerJobs);
      }
    } catch (error) {
      console.error('Error fetching posted jobs:', error);
    }
  };

  const fetchAllJobs = async () => {
    try {
      const jobsResponse = await fetch('http://localhost:5000/api/jobs');
      if (jobsResponse.ok) {
        const jobs = await jobsResponse.json();
        setAllJobs(jobs);
        setFilteredJobs(jobs.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchAppliedJobs = async () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user?.email || userData?.email;
    
    if (!userEmail) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/applications/candidate/${encodeURIComponent(userEmail)}`);
      if (response.ok) {
        const applications = await response.json();
        setAppliedJobs(applications);
      }
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
    }
  };

  const fetchEmployerApplications = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Fetching applications for employer:', userData.id, userData.email);
      
      const response = await fetch('http://localhost:5000/api/applications');
      if (response.ok) {
        const responseData = await response.json();
        console.log('Applications response:', responseData);
        
        const allApplications = Array.isArray(responseData) ? responseData : (responseData.applications || []);
        console.log('All applications:', allApplications.length);
        
        const employerApps = allApplications.filter((app: any) => {
          const match = app.employerId === userData.id || 
                       app.employerEmail === userData.email ||
                       app.jobId?.company?.toLowerCase() === userData.companyName?.toLowerCase();
          console.log('Application match:', match, app.employerId, app.employerEmail, app.jobId?.company);
          return match;
        });
        
        console.log('Filtered employer applications:', employerApps.length);
        setEmployerApplications(employerApps);
      } else {
        console.error('Failed to fetch applications:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching employer applications:', error);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        setEmployerApplications(prev => 
          prev.map(app => 
            app._id === applicationId ? { ...app, status: newStatus } : app
          )
        );
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleRemoveSavedJob = (jobId: string) => {
    const updatedJobs = savedJobs.filter(job => (job._id || job.id) !== jobId);
    setSavedJobs(updatedJobs);
    
    const userKey = `savedJobDetails_${user?.name || 'user'}`;
    const userJobIdsKey = `savedJobs_${user?.name || 'user'}`;
    
    localStorage.setItem(userKey, JSON.stringify(updatedJobs));
    
    const savedJobIds = JSON.parse(localStorage.getItem(userJobIdsKey) || '[]');
    const updatedJobIds = savedJobIds.filter((id: string) => id !== jobId);
    localStorage.setItem(userJobIdsKey, JSON.stringify(updatedJobIds));
  };

  const handleSearch = () => {
    let filtered = allJobs;
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (locationQuery.trim()) {
      filtered = filtered.filter(job => 
        job.location?.toLowerCase().includes(locationQuery.toLowerCase())
      );
    }
    
    setFilteredJobs(filtered);
  };

  const getCompanyLogo = (job: any) => {
    if (job.companyLogo && job.companyLogo.trim() !== '' && 
        !job.companyLogo.includes('clearbit.com') && 
        !job.companyLogo.includes('gstatic.com') &&
        !job.companyLogo.includes('trinitetech.com')) {
      return job.companyLogo;
    }
    
    if (user?.companyLogo && user.companyLogo.trim() !== '' && 
        !user.companyLogo.includes('clearbit.com') &&
        !user.companyLogo.includes('gstatic.com') &&
        (job.company?.toLowerCase() === user.companyName?.toLowerCase() || 
         job.employerEmail === user.email)) {
      return user.companyLogo;
    }
    
    return '';
  };

  const handleLogoError = (e: any, company: string) => {
    const img = e.target as HTMLImageElement;
    img.style.display = 'none';
  };

  const handleSaveJob = (job: any) => {
    console.log('Save job:', job);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex space-x-1">
              {user?.type === 'employer' ? (
                <>
                  <button
                    onClick={() => setActiveTab('Posted Jobs')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${
                      activeTab === 'Posted Jobs'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Posted Jobs
                  </button>
                  <button
                    onClick={() => setActiveTab('Search Jobs')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${
                      activeTab === 'Search Jobs'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Search Jobs
                  </button>
                  <button
                    onClick={() => setActiveTab('Applications')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${
                      activeTab === 'Applications'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Applications ({employerApplications.length})
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('Saved')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${
                      activeTab === 'Saved'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Saved
                  </button>
                  <button
                    onClick={() => setActiveTab('Applied')}
                    className={`px-6 py-2 rounded-full font-medium transition-colors ${
                      activeTab === 'Applied'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Applied
                  </button>
                </>
              )}
            </div>
            
            {user?.type === 'candidate' && (
              <button
                onClick={() => onNavigate('job-listings')}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1 font-medium"
              >
                <span>View Recommended Jobs</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {user?.type === 'employer' && (activeTab === 'Search Jobs') && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Job title, skill, company, keyword"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Location (ex. Denver, remote)"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                  title="Search jobs"
                  aria-label="Search jobs"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <Filter className="w-4 h-4" />
                  <span>All filters</span>
                </button>
                <p className="text-gray-600 text-sm">
                  {filteredJobs.length} results (0 new)
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              {activeTab} {activeTab === 'Applications' ? '' : ''}
            </h2>
              
            {activeTab === 'Applied' && (
              <button
                onClick={() => fetchAppliedJobs()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                Refresh
              </button>
            )}
            
            {activeTab === 'Saved' && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Show expired jobs</span>
                <button
                  onClick={() => setShowExpiredJobs(!showExpiredJobs)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showExpiredJobs ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle show expired jobs"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showExpiredJobs ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  ></span>
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {user?.type === 'employer' && activeTab === 'Posted Jobs' && postedJobs.length > 0 ? (
                <div className="space-y-4">
                  {postedJobs.map((job) => (
                    <div key={job._id || job.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start mb-4">
                            <div className="flex-shrink-0 w-12 h-12 mr-4">
                              <div className="w-12 h-12 rounded border border-gray-200 flex items-center justify-center bg-white">
                                <img 
                                  src={getCompanyLogo(job)}
                                  alt={`${job.company} logo`}
                                  className="w-10 h-10 object-contain"
                                  onError={(e) => handleLogoError(e, job.company)}
                                />
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                                  {job.jobTitle || job.title}
                                </h3>
                                <span className="text-sm text-gray-500 ml-4">
                                  {formatDate(job.createdAt)}
                                </span>
                              </div>
                              <p className="text-lg text-blue-600 font-medium mb-2">{job.company}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{formatSalary(job.salary)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Briefcase className="w-4 h-4" />
                              <span>{job.type}</span>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4">
                            {job.description && job.description.length > 150 
                              ? `${job.description.substring(0, 150)}...` 
                              : job.description || ''}
                          </p>
                        </div>

                        <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3">
                          <button 
                            onClick={() => onNavigate('job-detail', { jobId: job._id || job.id })}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors min-w-[120px]"
                          >
                            View Job
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {user?.type === 'employer' && activeTab === 'Search Jobs' && filteredJobs.length > 0 ? (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <div key={job._id || job.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start mb-4">
                            <div className="flex-shrink-0 w-12 h-12 mr-4">
                              <div className="w-12 h-12 rounded border border-gray-200 flex items-center justify-center bg-white">
                                <img 
                                  src={getCompanyLogo(job)}
                                  alt={`${job.company} logo`}
                                  className="w-10 h-10 object-contain"
                                  onError={(e) => handleLogoError(e, job.company)}
                                />
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                                  {job.jobTitle || job.title}
                                </h3>
                                <span className="text-sm text-gray-500 ml-4">
                                  {formatDate(job.createdAt)}
                                </span>
                              </div>
                              <p className="text-lg text-blue-600 font-medium mb-2">{job.company}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{formatSalary(job.salary)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Briefcase className="w-4 h-4" />
                              <span>{job.type}</span>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4">
                            {job.description && job.description.length > 150 
                              ? `${job.description.substring(0, 150)}...` 
                              : job.description || ''}
                          </p>
                        </div>

                        <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3">
                          <button 
                            onClick={() => onNavigate('job-detail', { jobId: job._id || job.id })}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors min-w-[120px]"
                          >
                            View Job
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {user?.type === 'candidate' && activeTab === 'Saved' && savedJobs.length > 0 ? (
                <div className="space-y-4">
                  {savedJobs.map((job) => (
                    <div key={job._id || job.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start mb-4">
                            <div className="flex-shrink-0 w-12 h-12 mr-4">
                              <div className="w-12 h-12 rounded border border-gray-200 flex items-center justify-center bg-white">
                                <img 
                                  src={getCompanyLogo(job)}
                                  alt={`${job.company} logo`}
                                  className="w-10 h-10 object-contain"
                                  onError={(e) => handleLogoError(e, job.company)}
                                />
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                                  {decodeHtmlEntities(job.title)}
                                </h3>
                                <span className="text-sm text-gray-500 ml-4">
                                  {formatDate(job.createdAt)}
                                </span>
                              </div>
                              <p className="text-lg text-blue-600 font-medium mb-2">{job.company}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{formatSalary(job.salary)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Briefcase className="w-4 h-4" />
                              <span>{job.type}</span>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4">
                            {job.description && job.description.length > 150 
                              ? `${decodeHtmlEntities(job.description).substring(0, 150)}...` 
                              : decodeHtmlEntities(job.description || '')}
                          </p>
                        </div>

                        <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3">
                          <button 
                            onClick={() => handleRemoveSavedJob(job._id || job.id)}
                            className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors min-w-[100px]"
                          >
                            <span>Remove</span>
                          </button>
                          <button 
                            onClick={() => {
                              localStorage.setItem('selectedJob', JSON.stringify(job));
                              onNavigate('job-application');
                            }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors min-w-[120px]"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {user?.type === 'employer' && activeTab === 'Applications' && employerApplications.length > 0 ? (
                <div className="space-y-4">
                  {employerApplications.map((application) => (
                    <div key={application._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start mb-4">
                            <div className="flex-shrink-0 w-12 h-12 mr-4">
                              <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center bg-blue-100">
                                <span className="text-blue-600 font-semibold text-lg">
                                  {(application.candidateName || application.name || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {application.candidateName || application.name || 'Candidate'}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                  application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {application.status || 'pending'}
                                </span>
                              </div>
                              <p className="text-lg text-blue-600 font-medium mb-2">
                                Applied for: {application.jobId?.jobTitle || application.jobId?.title || 'Job Position'}
                              </p>
                              <p className="text-sm text-gray-600 mb-2">
                                Email: {application.candidateEmail || application.email || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Applied on: {formatDate(application.createdAt || application.appliedAt)}
                              </p>
                            </div>
                          </div>
                          
                          {application.coverLetter && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2">Cover Letter:</h4>
                              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                                {application.coverLetter.length > 200 
                                  ? `${application.coverLetter.substring(0, 200)}...` 
                                  : application.coverLetter}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2 min-w-[150px]">
                          {application.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => updateApplicationStatus(application._id, 'accepted')}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => updateApplicationStatus(application._id, 'rejected')}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {application.resumeUrl && (
                            <button 
                              onClick={() => window.open(application.resumeUrl, '_blank')}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                            >
                              View Resume
                            </button>
                          )}
                          <button 
                            onClick={() => onNavigate('job-detail', { jobId: application.jobId?._id || application.jobId })}
                            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                          >
                            View Job
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {user?.type === 'candidate' && activeTab === 'Applied' && appliedJobs.length > 0 ? (
                <div className="space-y-4">
                  {appliedJobs.map((application) => (
                    <div key={application._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start mb-4">
                            <div className="flex-shrink-0 w-12 h-12 mr-4">
                              <div className="w-12 h-12 rounded border border-gray-200 flex items-center justify-center bg-white">
                                <img 
                                  src={getCompanyLogo(application.jobId || {})}
                                  alt={`${application.jobId?.company || 'Company'} logo`}
                                  className="w-10 h-10 object-contain"
                                  onError={(e) => handleLogoError(e, application.jobId?.company || 'Company')}
                                />
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                                  {application.jobId?.jobTitle || application.jobId?.title || 'Job Position'}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                  application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {application.status || 'pending'}
                                </span>
                              </div>
                              <p className="text-lg text-blue-600 font-medium mb-2">{application.jobId?.company}</p>
                              <p className="text-sm text-gray-500">
                                Applied on: {formatDate(application.createdAt || application.appliedAt)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{application.jobId?.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4" />
                              <span>{formatSalary(application.jobId?.salary)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Briefcase className="w-4 h-4" />
                              <span>{application.jobId?.type}</span>
                            </div>
                          </div>

                          {application.coverLetter && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2">Your Cover Letter:</h4>
                              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded">
                                {application.coverLetter.length > 150 
                                  ? `${application.coverLetter.substring(0, 150)}...` 
                                  : application.coverLetter}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3">
                          <button 
                            onClick={() => onNavigate('job-detail', { jobId: application.jobId?._id || application.jobId })}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors min-w-[120px]"
                          >
                            View Job
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {((user?.type === 'candidate' && activeTab === 'Saved' && savedJobs.length === 0) ||
                (user?.type === 'candidate' && activeTab === 'Applied' && appliedJobs.length === 0) ||
                (user?.type === 'employer' && activeTab === 'Posted Jobs' && postedJobs.length === 0) ||
                (user?.type === 'employer' && activeTab === 'Search Jobs' && filteredJobs.length === 0) ||
                (user?.type === 'employer' && activeTab === 'Applications' && employerApplications.length === 0)) && (
                <div className="text-center py-16">
                  <Briefcase className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab.toLowerCase()}</h3>
                  <p className="text-gray-500 mb-6">
                    {user?.type === 'employer' ? 
                      'Try adjusting your search criteria.' : 
                      'Start browsing jobs to build your collection.'
                    }
                  </p>
                  <button
                    onClick={() => onNavigate('job-posting')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto transition-colors"
                  >
                    <span>Post a Job</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyJobsPage;