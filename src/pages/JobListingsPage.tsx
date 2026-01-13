import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Filter, Briefcase, Clock, DollarSign, X, Bookmark, BookmarkCheck } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { aiSuggestions } from '../utils/aiSuggestions';
import { JobCardSkeleton, SearchLoading } from '../components/LoadingStates';
import { sanitizeLogo, getCompanyLogo } from '../utils/logoUtils';
import { decodeHtmlEntities, formatDate, formatSalary } from '../utils/textUtils';

const JobListingsPage = ({ onNavigate, user, onLogout, searchParams }: { 
  onNavigate?: (page: string) => void;
  user?: {name: string, type: 'candidate' | 'employer'} | null;
  onLogout?: () => void;
  searchParams?: { searchTerm?: string; location?: string };
}) => {
  const [searchTerm, setSearchTerm] = useState(searchParams?.searchTerm || '');
  const [location, setLocation] = useState(searchParams?.location || '');
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    jobType: '',
    salaryRange: '',
    experience: ''
  });
  const [jobSuggestions, setJobSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  // Load saved jobs from localStorage
  useEffect(() => {
    if (user?.name) {
      const userKey = `savedJobs_${user.name}`;
      const saved = localStorage.getItem(userKey);
      if (saved) {
        setSavedJobs(JSON.parse(saved));
      }
    }
  }, [user]);

  // Fetch jobs from MongoDB
  const fetchJobs = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/jobs';
      
      // If search parameters exist, use search endpoint
      if (searchTerm || location) {
        const params = new URLSearchParams();
        if (searchTerm) params.append('q', searchTerm);
        if (location) params.append('location', location);
        url = `http://localhost:5000/api/search?${params}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const jobsData = await response.json();
        const jobsArray = Array.isArray(jobsData) ? jobsData : [];
        setJobs(jobsArray);
        setFilteredJobs(jobsArray);
      } else {
        console.error('Failed to fetch jobs');
        setJobs([]);
        setFilteredJobs([]);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
      setFilteredJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Search and filter function
  const performSearch = useCallback(() => {
    let filtered = [...jobs];
    
    // Search by term
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by location
    if (location) {
      filtered = filtered.filter(job => 
        job.location?.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Apply filters
    if (filters.jobType) {
      filtered = filtered.filter(job => job.type === filters.jobType);
    }
    
    setFilteredJobs(filtered);
  }, [searchTerm, location, jobs, filters]);

  useEffect(() => {
    fetchJobs();
  }, []);
  
  useEffect(() => {
    if (searchParams?.searchTerm || searchParams?.location) {
      fetchJobs();
    }
  }, [searchParams]);
  
  useEffect(() => {
    if (jobs.length > 0) {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [performSearch, jobs]);
  
  const handleApplyNow = (job: any) => {
    if (onNavigate) {
      // Store only essential job data to avoid quota issues
      const essentialJobData = {
        _id: job._id,
        title: job.title || job.jobTitle,
        company: job.company,
        location: job.location,
        description: job.description?.substring(0, 300) || '',
        salary: job.salary,
        type: job.type
      };
      
      try {
        localStorage.setItem('selectedJob', JSON.stringify(essentialJobData));
        onNavigate('job-application');
      } catch (error) {
        console.error('Storage quota exceeded:', error);
        // Clear old data and try again
        localStorage.removeItem('savedJobDetails_user');
        localStorage.removeItem('userApplications');
        try {
          localStorage.setItem('selectedJob', JSON.stringify(essentialJobData));
          onNavigate('job-application');
        } catch (retryError) {
          alert('Storage full. Please clear browser data.');
        }
      }
    }
  };
  
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const getJobSuggestions = async (input: string): Promise<string[]> => {
    return await aiSuggestions.getJobSuggestions(input);
  };

  const getLocationSuggestions = async (input: string): Promise<string[]> => {
    return await aiSuggestions.getLocationSuggestions(input);
  };

  const handleJobInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 1) {
      const suggestions = await getJobSuggestions(value);
      setJobSuggestions(suggestions);
      setShowJobSuggestions(true);
    } else {
      setShowJobSuggestions(false);
    }
  };

  const handleLocationInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    
    if (value.length >= 1) {
      const suggestions = await getLocationSuggestions(value);
      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
    }
  };

  const selectJobSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowJobSuggestions(false);
  };

  const selectLocationSuggestion = (suggestion: string) => {
    setLocation(suggestion);
    setShowLocationSuggestions(false);
  };

  const handleSaveJob = (job: any) => {
    if (!user?.name) return; // Only allow saving if user is logged in
    
    const jobId = job._id || job.id;
    const isAlreadySaved = savedJobs.includes(jobId);
    
    // Use user-specific keys
    const userKey = `savedJobs_${user.name}`;
    const userDetailsKey = `savedJobDetails_${user.name}`;
    
    let updatedSavedJobs;
    if (isAlreadySaved) {
      // Remove from saved jobs
      updatedSavedJobs = savedJobs.filter(id => id !== jobId);
      // Also remove from job details
      const existingSavedJobDetails = JSON.parse(localStorage.getItem(userDetailsKey) || '[]');
      const updatedJobDetails = existingSavedJobDetails.filter((j: any) => (j._id || j.id) !== jobId);
      localStorage.setItem(userDetailsKey, JSON.stringify(updatedJobDetails));
    } else {
      // Add to saved jobs
      updatedSavedJobs = [...savedJobs, jobId];
      // Also save the job details
      const existingSavedJobDetails = JSON.parse(localStorage.getItem(userDetailsKey) || '[]');
      const updatedJobDetails = [...existingSavedJobDetails.filter((j: any) => (j._id || j.id) !== jobId), job];
      localStorage.setItem(userDetailsKey, JSON.stringify(updatedJobDetails));
    }
    
    setSavedJobs(updatedSavedJobs);
    localStorage.setItem(userKey, JSON.stringify(updatedSavedJobs));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} user={user} onLogout={onLogout} />
      
      {/* Search Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8">
            <button className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Search Jobs</span>
            </button>
            <button className="text-gray-300 hover:text-white px-6 py-2 rounded-full font-medium">
              Recommended Jobs
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Job title, skill, company, keyword"
                value={searchTerm}
                onChange={handleJobInputChange}
                onFocus={() => searchTerm.length >= 1 && setShowJobSuggestions(true)}
                onBlur={() => setTimeout(() => setShowJobSuggestions(false), 200)}
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {showJobSuggestions && jobSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {jobSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onMouseDown={() => selectJobSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0 flex items-center text-gray-900"
                    >
                      <Search className="w-4 h-4 text-gray-400 mr-3" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Location (ex. Denver, remote)"
                value={location}
                onChange={handleLocationInputChange}
                onFocus={() => location.length >= 1 && setShowLocationSuggestions(true)}
                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onMouseDown={() => selectLocationSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0 flex items-center text-gray-900"
                    >
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* All Filters Button */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-white hover:text-gray-300 font-medium"
          >
            <Filter className="w-4 h-4" />
            <span>All filters</span>
          </button>
        </div>
      </div>

      {/* Job Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Searching...' : (
              `${filteredJobs.length} results` +
              (filteredJobs.length > 0 ? ` (${Math.floor(filteredJobs.length * 0.6)} new)` : '')
            )}
          </p>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <select 
                  value={filters.jobType}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <select 
                  value={filters.experience}
                  onChange={(e) => handleFilterChange('experience', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Levels</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                <select 
                  value={filters.salaryRange}
                  onChange={(e) => handleFilterChange('salaryRange', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">All Ranges</option>
                  <option value="50k-100k">$50k - $100k</option>
                  <option value="100k-150k">$100k - $150k</option>
                  <option value="150k+">$150k+</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, index) => (
              <JobCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500">Try adjusting your search terms or browse all jobs.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.isArray(filteredJobs) && filteredJobs.map((job) => (
            <div key={job._id || job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
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
                          onLoad={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.style.display = 'block';
                          }}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            // Try multiple logo sources
                            const logoSources = [
                              `https://logo.clearbit.com/${job.company.toLowerCase().replace(/\s+/g, '')}.com`,
                              `https://img.logo.dev/${job.company.toLowerCase().replace(/\s+/g, '')}.com?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200`,
                              `https://www.google.com/s2/favicons?domain=${job.company.toLowerCase().replace(/\s+/g, '')}.com&sz=64`
                            ];
                            
                            const currentIndex = logoSources.indexOf(img.src);
                            if (currentIndex < logoSources.length - 1) {
                              img.src = logoSources[currentIndex + 1];
                            } else {
                              // All sources failed, show company initial
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
                        <h3 
                          className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                          onClick={() => onNavigate && onNavigate('job-detail', { jobTitle: job.title || job.jobTitle, jobId: job._id || job.id, companyName: job.company })}
                        >
                          {decodeHtmlEntities(job.title || job.jobTitle)}
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
                  {user?.type === 'candidate' && (
                    <button 
                      onClick={() => handleSaveJob(job)}
                      className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border transition-colors min-w-[100px] ${
                        savedJobs.includes(job._id || job.id)
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {savedJobs.includes(job._id || job.id) ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                      <span>{savedJobs.includes(job._id || job.id) ? 'Saved' : 'Save'}</span>
                    </button>
                  )}
                  <button 
                    onClick={() => handleApplyNow(job)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors min-w-[120px]"
                  >
                    Apply Now
                  </button>
                  <button 
                    onClick={() => onNavigate && onNavigate('job-detail', { jobTitle: job.title, jobId: job._id || job.id, companyName: job.company })}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default JobListingsPage;