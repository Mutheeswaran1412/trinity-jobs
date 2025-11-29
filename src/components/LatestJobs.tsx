import React from 'react';

interface LatestJobsProps {
  onNavigate?: (page: string, data?: any) => void;
}

const LatestJobs: React.FC<LatestJobsProps> = ({ onNavigate }) => {
  const jobs = [
    {
      company: "Google",
      location: "New York",
      position: "Sr. Product Designer",
      description: "It is a long established fact that a reader of a page when looking at its layout.",
      salary: "$560",
      period: "Hour",
      posted: "2 Day ago",
      type: "Full Time",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
    },
    {
      company: "Microsoft",
      location: "California",
      position: "Web Designer",
      description: "It is a long established fact that a reader of a page when looking at its layout.",
      salary: "$560",
      period: "Hour",
      posted: "1 Day ago",
      type: "Full Time",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
    },
    {
      company: "Amazon",
      location: "Southfield",
      position: "IT Management",
      description: "It is a long established fact that a reader of a page when looking at its layout.",
      salary: "$560",
      period: "Hour",
      posted: "2 Day ago",
      type: "Full Time",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
    },
    {
      company: "Github",
      location: "Southfield",
      position: "Sr. Product Designer",
      description: "It is a long established fact that a reader of a page when looking at its layout.",
      salary: "$560",
      period: "Hour",
      posted: "2 Day ago",
      type: "Full Time",
      logo: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
    },
    {
      company: "Dropbox",
      location: "New York",
      position: "Web Designer",
      description: "It is a long established fact that a reader of a page when looking at its layout.",
      salary: "$560",
      period: "Hour",
      posted: "1 Day ago",
      type: "Full Time",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/cb/Dropbox_logo_2017.svg"
    },
    {
      company: "Adobe",
      location: "California",
      position: "IT Management",
      description: "It is a long established fact that a reader of a page when looking at its layout.",
      salary: "$560",
      period: "Hour",
      posted: "2 Day ago",
      type: "Full Time",
      logo: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.svg"
    }
  ];

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
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4 border border-gray-200">
                  <img 
                    src={job.logo} 
                    alt={`${job.company} logo`}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<span class="text-lg font-bold text-gray-600">${job.company.charAt(0)}</span>`;
                    }}
                  />
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">{job.company}, {job.location}</h5>
                  <span className="text-gray-600 text-sm">{job.position}</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{job.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      // Store job data for application
                      localStorage.setItem('selectedJob', JSON.stringify({
                        title: job.position,
                        company: job.company,
                        location: job.location,
                        description: job.description,
                        salary: `${job.salary}/${job.period}`,
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
                      jobTitle: job.position, 
                      companyName: job.company 
                    })}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{job.salary}</span>
                  <span className="text-gray-600 text-sm">/ {job.period}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{job.posted}</span>
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