import React, { useState, useEffect } from 'react';
import { getSafeCompanyLogo } from '../utils/logoUtils';

interface LatestJobsProps {
  onNavigate?: (page: string, data?: any) => void;
}

const LatestJobs: React.FC<LatestJobsProps> = ({ onNavigate }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestJobs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/jobs?limit=6');
        if (response.ok) {
          const data = await response.json();
          setJobs(Array.isArray(data) ? data.slice(0, 6) : []);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestJobs();
  }, []);

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h6 className="text-blue-600 font-semibold text-lg mb-2">Latest Job</h6>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">New Job Offer</h2>
            <p className="text-gray-600">More Than +500 Job Offer Everyday</p>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('job-posting')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Post a Job
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">No jobs available yet. Be the first to post!</p>
            </div>
          ) : (
            jobs.map((job, index) => (
            <div key={job._id || index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4 border border-gray-200">
                  {(() => {
                    const logoUrl = getSafeCompanyLogo(job.company, job.companyLogo);
                    return logoUrl ? (
                      <img 
                        src={logoUrl} 
                        alt={`${job.company} logo`}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : null;
                  })()} 
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">{job.company}, {job.location}</h5>
                  <span className="text-gray-600 text-sm">{job.title || job.jobTitle}</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      localStorage.setItem('selectedJob', JSON.stringify({
                        _id: job._id,
                        title: job.title || job.jobTitle,
                        company: job.company,
                        location: job.location,
                        description: job.description,
                        salary: job.salary,
                        type: job.type
                      }));
                      onNavigate && onNavigate('job-application');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Apply Now
                  </button>
                  <button
                    onClick={() => onNavigate && onNavigate('job-detail', { 
                      jobTitle: job.title || job.jobTitle, 
                      jobId: job._id,
                      companyName: job.company 
                    })}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900 text-sm">
                    {typeof job.salary === 'object' && job.salary ? `$${job.salary.min}-${job.salary.max}` : job.salary || 'Competitive'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently'}</span>
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">{job.type}</span>
              </div>
            </div>
          )))}
        </div>
        
        <div className="text-center">
          <button
            onClick={() => onNavigate && onNavigate('job-listings')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Load More
          </button>
        </div>
      </div>
    </div>
  );
};

export default LatestJobs;