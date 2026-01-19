import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/constants';
import { getSafeCompanyLogo } from '../utils/logoUtils';

interface LatestJobsProps {
  onNavigate?: (page: string, data?: any) => void;
}

interface Job {
  _id: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  location: string;
  jobType: string;
  description: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  createdAt: string;
}

const LatestJobs: React.FC<LatestJobsProps> = ({ onNavigate }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestJobs();
  }, []);

  const fetchLatestJobs = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.JOBS}?limit=6`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (salary: Job['salary']) => {
    if (salary?.min && salary?.max) {
      return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}`;
    }
    return 'Salary not specified';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return 'Recently';
  };

  if (loading) {
    return (
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading latest jobs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div>
            <h6 className="text-blue-600 font-semibold text-lg mb-2">Latest Job</h6>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">New Job Offer</h2>
            <p className="text-gray-600">Latest jobs posted through our platform</p>
          </div>
        </div>
        
        {jobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No jobs posted yet. Be the first to post a job!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {jobs.map((job) => {
                const logoUrl = getSafeCompanyLogo(job.company, job.companyLogo);
                
                return (
                  <div key={job._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4 border border-gray-200">
                        {logoUrl ? (
                          <img 
                            src={logoUrl} 
                            alt={`${job.company} logo`}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const container = target.parentElement;
                              if (container) {
                                container.innerHTML = `<div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">${job.company.charAt(0)}</div>`;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                            {job.company.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">{job.company}, {job.location}</h5>
                        <span className="text-gray-600 text-sm">{job.jobTitle}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onNavigate && onNavigate('job-detail', { 
                            jobTitle: job.jobTitle, 
                            jobId: job._id,
                            companyName: job.company,
                            jobData: job
                          })}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900 text-sm">
                          {formatSalary(job.salary)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{getTimeAgo(job.createdAt)}</span>
                      <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">{job.jobType}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center">
              <button
                onClick={() => onNavigate && onNavigate('job-listings')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Load More
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LatestJobs;