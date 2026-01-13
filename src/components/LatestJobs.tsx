import React, { useMemo } from 'react';

interface LatestJobsProps {
  onNavigate?: (page: string, data?: any) => void;
}

const LatestJobs: React.FC<LatestJobsProps> = ({ onNavigate }) => {
  // Memoized jobs data to prevent recreation on every render
  const jobs = useMemo(() => [
    {
      _id: '1',
      company: 'Google',
      location: 'Mountain View, CA',
      title: 'Senior Software Engineer',
      description: 'Join Google to build products that help create opportunities for everyone.',
      salary: '$120,000 - $180,000',
      type: 'Full-time',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg'
    },
    {
      _id: '2', 
      company: 'Microsoft',
      location: 'Redmond, WA',
      title: 'Product Manager',
      description: 'Drive product strategy and execution for Microsoft Azure services.',
      salary: '$110,000 - $160,000',
      type: 'Full-time',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg'
    },
    {
      _id: '3',
      company: 'Amazon',
      location: 'Seattle, WA', 
      title: 'Data Scientist',
      description: 'Use machine learning to solve complex business problems at scale.',
      salary: '$130,000 - $190,000',
      type: 'Full-time',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg'
    },
    {
      _id: '4',
      company: 'Meta',
      location: 'Menlo Park, CA',
      title: 'Frontend Developer',
      description: 'Build the next generation of social technology at Meta.',
      salary: '$115,000 - $170,000', 
      type: 'Full-time',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg'
    },
    {
      _id: '5',
      company: 'Apple',
      location: 'Cupertino, CA',
      title: 'iOS Developer',
      description: 'Create amazing experiences for millions of Apple users worldwide.',
      salary: '$125,000 - $185,000',
      type: 'Full-time', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'
    },
    {
      _id: '6',
      company: 'Netflix',
      location: 'Los Gatos, CA',
      title: 'DevOps Engineer', 
      description: 'Scale Netflix streaming platform to serve millions globally.',
      salary: '$140,000 - $200,000',
      type: 'Full-time',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg'
    }
  ], []);

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
          {jobs.map((job, index) => (
            <div key={job._id || index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4 border border-gray-200">
                  <img 
                    src={job.logo} 
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
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">{job.company}, {job.location}</h5>
                  <span className="text-gray-600 text-sm">{job.title}</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      localStorage.setItem('selectedJob', JSON.stringify({
                        _id: job._id,
                        title: job.title,
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
                      jobTitle: job.title, 
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
                    {job.salary}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Recently</span>
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded">{job.type}</span>
              </div>
            </div>
          ))}
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