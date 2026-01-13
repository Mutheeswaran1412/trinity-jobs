import React, { useState, useEffect } from 'react';
import { ChevronRight, Briefcase, MapPin, DollarSign, Bookmark, Clock, Search, Filter } from 'lucide-react';
import { decodeHtmlEntities, formatDate, formatSalary } from '../utils/textUtils';

interface MyJobsPageProps {
  onNavigate: (page: string) => void;
  user?: any;
  onLogout?: () => void;
}

const MyJobsPage: React.FC<MyJobsPageProps> = ({ onNavigate, user, onLogout }) => {
  const [activeTab, setActiveTab] = useState(user?.type === 'employer' ? 'Search Jobs' : 'Saved');
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
      // Load candidate's saved jobs
      const userKey = `savedJobDetails_${user.name || 'user'}`;
      const savedJobDetails = localStorage.getItem(userKey);
      if (savedJobDetails) {
        setSavedJobs(JSON.parse(savedJobDetails));
      }
      // Load applied jobs
      fetchAppliedJobs();
    } else if (user?.type === 'employer') {
      // Load all jobs for search functionality
      fetchAllJobs();
      fetchEmployerApplications();
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (activeTab === 'Applied' && user?.type === 'candidate') {
      console.log('MyJobs: Applied tab activated, fetching jobs...');
      fetchAppliedJobs();
    }
  }, [activeTab]);

  // Auto-refresh every 30 seconds when on Applied tab
  useEffect(() => {
    let interval;
    if (activeTab === 'Applied' && user?.type === 'candidate') {
      interval = setInterval(() => {
        console.log('MyJobs: Auto-refreshing applied jobs...');
        fetchAppliedJobs();
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, user]);

  const fetchAllJobs = async () => {
    try {
      const jobsResponse = await fetch('http://localhost:5000/api/jobs');
      if (jobsResponse.ok) {
        const jobs = await jobsResponse.json();
        setAllJobs(jobs);
        setFilteredJobs(jobs.slice(0, 10)); // Show first 10 jobs initially
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchAppliedJobs = async () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user?.email || userData?.email;
    
    if (!userEmail) {
      console.log('MyJobs: No user email found. User:', user, 'UserData:', userData);
      return;
    }
    
    try {
      console.log('MyJobs: Fetching applications for email:', userEmail);
      const response = await fetch(`http://localhost:5000/api/applications/candidate/${encodeURIComponent(userEmail)}`);
      console.log('MyJobs: Response status:', response.status);
      if (response.ok) {
        const applications = await response.json();
        console.log('MyJobs: Fetched applications:', applications);
        setAppliedJobs(applications);
      } else {
        const errorText = await response.text();
        console.log('MyJobs: Response not ok:', response.status, errorText);
      }
    } catch (error) {
      console.error('MyJobs: Error fetching applied jobs:', error);
    }
  };

  const fetchEmployerApplications = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('http://localhost:5000/api/applications');
      if (response.ok) {
        const responseData = await response.json();
        const allApplications = Array.isArray(responseData) ? responseData : (responseData.applications || []);
        // Filter applications for employer's jobs
        const employerApps = allApplications.filter((app: any) => {
          return app.jobId?.employerId === userData.id || 
                 app.jobId?.employerEmail === userData.email ||
                 app.jobId?.company?.toLowerCase() === userData.companyName?.toLowerCase();
        });
        setEmployerApplications(employerApps);
      }
    } catch (error) {
      console.error('Error fetching employer applications:', error);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (response.ok) {
        // Update local state
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
    
    // Use user-specific keys
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

  const handleSaveJob = (job: any) => {
    // Implementation for saving job
    console.log('Save job:', job);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {user?.type === 'employer' ? (
        // Employer Job Search Interface
        <>
          {/* Header with Search */}
          <div className="bg-gray-900 text-white px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Navigation Tabs */}
              <div className="flex items-center space-x-1 mb-8">
                <button
                  onClick={() => setActiveTab('Search Jobs')}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    activeTab === 'Search Jobs'
                      ? 'bg-white text-gray-900'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Search Jobs
                </button>
                <button
                  onClick={() => setActiveTab('Recommended Jobs')}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    activeTab === 'Recommended Jobs'
                      ? 'bg-white text-gray-900'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Recommended Jobs
                </button>
                <button
                  onClick={() => setActiveTab('Applications')}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    activeTab === 'Applications'
                      ? 'bg-white text-gray-900'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Applications ({employerApplications.length})
                </button>
              </div>

              {/* Search Form - Only show for Search/Recommended tabs */}
              {(activeTab === 'Search Jobs' || activeTab === 'Recommended Jobs') && (
                <>
                  <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Job title, skill, company, keyword"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Location (ex. Denver, remote)"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 text-gray-300 hover:text-white">
                      <Filter className="w-4 h-4" />
                      <span>All filters</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Results Count - Only show for Search/Recommended tabs */}
          {(activeTab === 'Search Jobs' || activeTab === 'Recommended Jobs') && (
            <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-4">
              <div className="max-w-7xl mx-auto">
                <p className="text-gray-600">
                  {filteredJobs.length} results (0 new)
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        // Original Candidate Interface
        <>
          {/* Header Section */}
          <div className="bg-gray-900 text-white px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-4xl font-bold mb-4">My Jobs</h1>
              <p className="text-gray-300 text-lg">
                Manage the status of your jobs, all in one place.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-gray-900 px-4 sm:px-6 lg:px-8 pb-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
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
                </div>
                
                <button
                  onClick={() => onNavigate('job-listings')}
                  className="text-white hover:text-gray-300 flex items-center space-x-1 font-medium"
                >
                  <span>View Recommended Jobs</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="bg-gray-50 min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Tab Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                {activeTab} {activeTab === 'Applications' ? '' : 'jobs'}
              </h2>
              
              {activeTab === 'Applied' && (
                <button
                  onClick={() => {
                    console.log('MyJobs: Manual refresh clicked');
                    fetchAppliedJobs();
                  }}
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

            {/* Debug Info */}
            {activeTab === 'Applied' && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
                <p><strong>Debug Info:</strong></p>
                <p>User Email: {user?.email || JSON.parse(localStorage.getItem('user') || '{}')?.email || 'Not found'}</p>
                <p>Applied Jobs Count: {appliedJobs.length}</p>
                <p>Loading: {loading ? 'Yes' : 'No'}</p>
              </div>
            )}

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
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex-1">
                            <div className="flex items-start mb-4">
                              {/* Company Logo */}
                              <div className="flex-shrink-0 w-12 h-12 mr-4">
                                <div className="w-12 h-12 rounded border border-gray-200 flex items-center justify-center bg-white">
                                  <img 
                                    src={job.companyLogo || `https://logo.clearbit.com/${job.company.toLowerCase().replace(/\s+/g, '')}.com`}
                                    alt={`${job.company} logo`}
                                    className="w-10 h-10 object-contain"
                                    onError={(e) => {
                                      const img = e.target as HTMLImageElement;
                                      const logoSources = [
                                        `https://logo.clearbit.com/${job.company.toLowerCase().replace(/\s+/g, '')}.com`,
                                        `https://img.logo.dev/${job.company.toLowerCase().replace(/\s+/g, '')}.com?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200`,
                                        `https://www.google.com/s2/favicons?domain=${job.company.toLowerCase().replace(/\s+/g, '')}.com&sz=64`
                                      ];
                                      
                                      const currentIndex = logoSources.indexOf(img.src);
                                      if (currentIndex < logoSources.length - 1) {
                                        img.src = logoSources[currentIndex + 1];
                                      } else {
                                        const container = img.parentElement;
                                        if (container) {
                                          container.innerHTML = `<div class="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white text-sm font-bold">${job.company.charAt(0)}</div>`;
                                        }
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              
                              {/* Job Info */}
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

                            {job.requirements && (
                              <div className="text-sm text-gray-600 mb-4">
                                <strong>Requirements:</strong> {job.requirements.length > 100 
                                  ? `${decodeHtmlEntities(job.requirements).substring(0, 100)}...` 
                                  : decodeHtmlEntities(job.requirements)}
                              </div>
                            )}
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
                
                {/* Employer Job Search Results */}
                {user?.type === 'employer' && (activeTab === 'Search Jobs' || activeTab === 'Recommended Jobs') && filteredJobs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredJobs.map((job) => {
                      return (
                        <div key={job._id || job.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              {/* Company Logo */}
                              <div className="flex-shrink-0 w-12 h-12">
                                <div className="w-12 h-12 rounded border border-gray-200 flex items-center justify-center bg-white">
                                  <img 
                                    src={job.companyLogo || `https://logo.clearbit.com/${job.company.toLowerCase().replace(/\s+/g, '')}.com`}
                                    alt={`${job.company} logo`}
                                    className="w-10 h-10 object-contain"
                                    onError={(e) => {
                                      const img = e.target as HTMLImageElement;
                                      const logoSources = [
                                        `https://logo.clearbit.com/${job.company.toLowerCase().replace(/\s+/g, '')}.com`,
                                        `https://img.logo.dev/${job.company.toLowerCase().replace(/\s+/g, '')}.com?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200`,
                                        `https://www.google.com/s2/favicons?domain=${job.company.toLowerCase().replace(/\s+/g, '')}.com&sz=64`
                                      ];
                                      
                                      const currentIndex = logoSources.indexOf(img.src);
                                      if (currentIndex < logoSources.length - 1) {
                                        img.src = logoSources[currentIndex + 1];
                                      } else {
                                        const container = img.parentElement;
                                        if (container) {
                                          container.innerHTML = `<div class="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white text-sm font-bold">${job.company.charAt(0)}</div>`;
                                        }
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              
                              {/* Job Details */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="text-xl font-semibold text-gray-900">{decodeHtmlEntities(job.title || job.jobTitle)}</h3>
                                  <span className="text-sm text-gray-500 ml-4">
                                    {formatDate(job.created_at || job.createdAt)}
                                  </span>
                                </div>
                                <p className="text-lg text-blue-600 font-medium mb-2">{job.company}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
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
                                {job.requirements && (
                                  <div className="text-sm text-gray-600">
                                    <strong>Requirements:</strong> {job.requirements.length > 100 
                                      ? `${decodeHtmlEntities(job.requirements).substring(0, 100)}...` 
                                      : decodeHtmlEntities(job.requirements)}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="ml-6 flex items-center space-x-3">
                              <button 
                                onClick={() => handleSaveJob(job)}
                                className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Bookmark className="w-4 h-4" />
                                <span>Saved</span>
                              </button>
                              <button 
                                onClick={() => {
                                  localStorage.setItem('selectedJob', JSON.stringify(job));
                                  onNavigate('job-application');
                                }}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                              >
                                Apply Now
                              </button>
                              <button 
                                onClick={() => onNavigate('job-detail', { jobTitle: job.title, jobId: job._id || job.id, companyName: job.company })}
                                className="text-gray-600 hover:text-gray-800 font-medium"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                
                {/* Employer Applications */}
                {user?.type === 'employer' && activeTab === 'Applications' && employerApplications.length > 0 ? (
                  <div className="space-y-4">
                    {employerApplications.map((application) => (
                      <div key={application._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Candidate Profile Picture */}
                            <div className="flex-shrink-0 w-12 h-12">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {application.candidateName?.charAt(0).toUpperCase() || 'C'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Application Details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="text-xl font-semibold text-gray-900">
                                    {application.candidateName || application.candidateEmail}
                                  </h3>
                                  <p className="text-lg text-blue-600 font-medium">
                                    Applied for: {application.jobId?.jobTitle || application.jobId?.title}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  application.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                  application.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                                  application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  application.status === 'hired' ? 'bg-purple-100 text-purple-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <span>📧 {application.candidateEmail}</span>
                                <span>📅 Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                              </div>

                              {application.coverLetter && application.coverLetter !== 'No cover letter' && (
                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-3">
                                  <strong>Cover Letter:</strong> {application.coverLetter.length > 150 ? 
                                    `${application.coverLetter.substring(0, 150)}...` : 
                                    application.coverLetter
                                  }
                                </div>
                              )}

                              {application.resumeUrl && (
                                <div className="mb-3">
                                  <a 
                                    href={application.resumeUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    📄 View Resume
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="ml-6 flex flex-col space-y-2">
                            <select
                              value={application.status}
                              onChange={(e) => updateApplicationStatus(application._id, e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="rejected">Rejected</option>
                              <option value="hired">Hired</option>
                            </select>
                            <button 
                              onClick={() => onNavigate('candidate-profile', { candidateId: application.candidateId })}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
                
                {/* Candidate Applied Jobs */}
                {user?.type === 'candidate' && activeTab === 'Applied' && appliedJobs.length > 0 ? (
                  <div className="space-y-4">
                    {appliedJobs.map((application) => (
                      <div key={application._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex-1">
                            <div className="flex items-start mb-4">
                              {/* Company Logo */}
                              <div className="flex-shrink-0 w-12 h-12 mr-4">
                                <div className="w-12 h-12 rounded border border-gray-200 flex items-center justify-center bg-white">
                                  <img 
                                    src={application.jobId?.companyLogo || `https://logo.clearbit.com/${application.jobId?.company.toLowerCase().replace(/\s+/g, '')}.com`}
                                    alt={`${application.jobId?.company} logo`}
                                    className="w-10 h-10 object-contain"
                                    onError={(e) => {
                                      const img = e.target as HTMLImageElement;
                                      const logoSources = [
                                        `https://logo.clearbit.com/${application.jobId?.company.toLowerCase().replace(/\s+/g, '')}.com`,
                                        `https://img.logo.dev/${application.jobId?.company.toLowerCase().replace(/\s+/g, '')}.com?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200`,
                                        `https://www.google.com/s2/favicons?domain=${application.jobId?.company.toLowerCase().replace(/\s+/g, '')}.com&sz=64`
                                      ];
                                      
                                      const currentIndex = logoSources.indexOf(img.src);
                                      if (currentIndex < logoSources.length - 1) {
                                        img.src = logoSources[currentIndex + 1];
                                      } else {
                                        const container = img.parentElement;
                                        if (container) {
                                          container.innerHTML = `<div class="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white text-sm font-bold">${application.jobId?.company.charAt(0)}</div>`;
                                        }
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              
                              {/* Job Info */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="text-xl font-semibold text-gray-900">{application.jobId?.jobTitle || application.jobId?.title}</h3>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    application.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                    application.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                                    application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    application.status === 'hired' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                  </span>
                                </div>
                                
                                <p className="text-lg text-blue-600 font-medium mb-2">{application.jobId?.company}</p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{application.jobId?.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {application.coverLetter && application.coverLetter !== 'No cover letter' && (
                              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-3">
                                <strong>Cover Letter:</strong> {application.coverLetter.length > 100 ? 
                                  `${application.coverLetter.substring(0, 100)}...` : 
                                  application.coverLetter
                                }
                              </div>
                            )}
                          </div>

                          <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3">
                            <button 
                              onClick={() => onNavigate('job-detail', { 
                                jobTitle: application.jobId?.jobTitle || application.jobId?.title, 
                                jobId: application.jobId?._id,
                                companyName: application.jobId?.company
                              })}
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
                
                {/* Empty State */}
                {((user?.type === 'candidate' && activeTab === 'Saved' && savedJobs.length === 0) ||
                  (user?.type === 'candidate' && activeTab === 'Applied' && appliedJobs.length === 0) ||
                  (user?.type === 'employer' && (activeTab === 'Search Jobs' || activeTab === 'Recommended Jobs') && filteredJobs.length === 0) ||
                  (user?.type === 'employer' && activeTab === 'Applications' && employerApplications.length === 0)) ? (
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
                    activeTab === 'Applications' ? (
                      <>No applications received yet. Post more jobs to attract candidates.</>
                    ) : (
                      <>No jobs found matching your search criteria. Try adjusting your search terms or location.</>
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
                onClick={() => {
                  if (user?.type === 'employer') {
                    if (activeTab === 'Applications') {
                      onNavigate('job-posting');
                    } else {
                      setSearchQuery(''); 
                      setLocationQuery(''); 
                      handleSearch();
                    }
                  } else {
                    onNavigate('job-listings');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto transition-colors"
              >
                <span>
                  {user?.type === 'employer' ? 
                    (activeTab === 'Applications' ? 'Post New Job' : 'Clear Search') : 
                    'Go to Job Search'
                  }
                </span>
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