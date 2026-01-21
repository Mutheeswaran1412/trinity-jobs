import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/constants';
import { getCompanyLogo } from '../utils/logoUtils';

interface LatestJobsProps {
  onNavigate?: (page: string, data?: any) => void;
  user?: any;
}

interface Job {
  _id: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  location: string;
  jobType: string;
  description: string;
  postedBy?: string;
  salary: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  createdAt: string;
}

const LatestJobs: React.FC<LatestJobsProps> = ({ onNavigate, user }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_ENDPOINTS.JOBS}/${jobId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setJobs(prev => prev.filter(job => job._id !== jobId));
        alert('Job deleted successfully!');
      } else {
        alert('Failed to delete job. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job. Please try again.');
    }
  };

  useEffect(() => {
    fetchLatestJobs();
    
    // Listen for job posting events to refresh the list
    const handleJobPosted = () => {
      console.log('New job posted, refreshing latest jobs...');
      fetchLatestJobs();
    };
    
    window.addEventListener('jobPosted', handleJobPosted);
    
    return () => {
      window.removeEventListener('jobPosted', handleJobPosted);
    };
  }, []);

  const fetchLatestJobs = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.JOBS}?limit=6&sort=newest`);
      if (response.ok) {
        const data = await response.json();
        // Ensure jobs are sorted by creation date (newest first)
        const sortedJobs = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setJobs(sortedJobs);
      } else {
        throw new Error('API response not ok');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Fallback to sample jobs when API fails
      const sampleJobs = getSampleJobs();
      setJobs(sampleJobs);
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
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return 'Recently';
  };

  const getSampleJobs = (): Job[] => {
    return [
      {
        _id: 'sample-1',
        jobTitle: 'Senior Frontend Developer',
        company: 'Google',
        location: 'Bangalore, India',
        jobType: 'Full-time',
        description: 'Join our team to build next-generation web applications using React and TypeScript.',
        salary: { min: 1200000, max: 2000000, currency: 'INR', period: 'per year' },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        postedBy: 'hr@google.com'
      },
      {
        _id: 'sample-2',
        jobTitle: 'Full Stack Developer',
        company: 'Microsoft',
        location: 'Hyderabad, India',
        jobType: 'Full-time',
        description: 'Work on cloud-native applications using .NET, React, and Azure services.',
        salary: { min: 1000000, max: 1800000, currency: 'INR', period: 'per year' },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        postedBy: 'careers@microsoft.com'
      },
      {
        _id: 'sample-3',
        jobTitle: 'DevOps Engineer',
        company: 'Amazon',
        location: 'Chennai, India',
        jobType: 'Full-time',
        description: 'Manage AWS infrastructure and implement CI/CD pipelines for scalable applications.',
        salary: { min: 1100000, max: 1900000, currency: 'INR', period: 'per year' },
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        postedBy: 'jobs@amazon.com'
      },
      {
        _id: 'sample-4',
        jobTitle: 'Data Scientist',
        company: 'Flipkart',
        location: 'Bangalore, India',
        jobType: 'Full-time',
        description: 'Analyze large datasets and build ML models to improve customer experience.',
        salary: { min: 900000, max: 1600000, currency: 'INR', period: 'per year' },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        postedBy: 'talent@flipkart.com'
      },
      {
        _id: 'sample-5',
        jobTitle: 'Mobile App Developer',
        company: 'Paytm',
        location: 'Noida, India',
        jobType: 'Full-time',
        description: 'Develop and maintain mobile applications for Android and iOS platforms.',
        salary: { min: 800000, max: 1400000, currency: 'INR', period: 'per year' },
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        postedBy: 'hr@paytm.com'
      },
      {
        _id: 'sample-6',
        jobTitle: 'Product Manager',
        company: 'Zomato',
        location: 'Gurgaon, India',
        jobType: 'Full-time',
        description: 'Lead product strategy and work with engineering teams to deliver innovative features.',
        salary: { min: 1500000, max: 2500000, currency: 'INR', period: 'per year' },
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        postedBy: 'careers@zomato.com'
      }
    ];
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
                return (
                  <div key={job._id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center p-2 mr-4">
                        <img 
                          src={getCompanyLogo(job.company)} 
                          alt={`${job.company} logo`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/zync-logo.svg';
                          }}
                        />
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
                        {user?.email === job.postedBy && (
                          <button
                            onClick={() => deleteJob(job._id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        )}
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