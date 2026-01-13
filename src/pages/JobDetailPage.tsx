import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Briefcase, Clock, DollarSign, Building } from 'lucide-react';
import { API_ENDPOINTS } from '../config/constants';

interface JobDetailPageProps {
  onNavigate: (page: string, data?: any) => void;
  jobTitle?: string;
  jobId?: number;
  companyName?: string;
}

const JobDetailPage: React.FC<JobDetailPageProps> = ({ onNavigate, jobTitle, jobId, companyName }) => {
  const [job, setJob] = useState<any>(null);
  const [jobPoster, setJobPoster] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getFallbackLogo = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=6366f1&color=ffffff&bold=true`;
  };

  const getCompanyLogo = (job: any) => {
    const company = job.company || job.companyName || 'Company';
    
    // Try stored logo first
    if (job.companyLogo && job.companyLogo.trim() !== '') {
      return job.companyLogo;
    }
    
    // Try Clearbit logo
    if (job.companyWebsite) {
      const domain = job.companyWebsite.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0];
      return `https://logo.clearbit.com/${domain}`;
    }
    
    // Try logo.dev
    const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `https://img.logo.dev/${cleanCompany}.com?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ`;
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        if (jobId) {
          // Fetch job details
          const jobResponse = await fetch(`${API_ENDPOINTS.JOBS}/${jobId}`);
          if (jobResponse.ok) {
            const jobData = await jobResponse.json();
            setJob(jobData);
            
            // Fetch job poster (employer who posted this job)
            const usersResponse = await fetch(API_ENDPOINTS.USERS);
            if (usersResponse.ok) {
              const users = await usersResponse.json();
              const poster = users.find((user: any) => 
                user.userType === 'employer' && (
                  user.id === jobData.employerId || 
                  user._id === jobData.employerId ||
                  user.email === jobData.employerEmail ||
                  user.companyName?.toLowerCase() === jobData.company?.toLowerCase()
                )
              );
              setJobPoster(poster);
            }
          }
        } else {
          // Fallback to default job data
          const defaultJob = {
            id: 1,
            title: jobTitle || "Senior Frontend Developer",
            company: companyName || "TechCorp Inc.",
            location: "San Francisco, CA",
            type: "Full-time",
            salary: "$120,000 - $180,000",
            experience: "3-5 years",
            posted: "2 days ago",
            description: "We are looking for a talented Senior Frontend Developer to join our dynamic team.",
            responsibilities: [
              "Develop and maintain responsive web applications using React and TypeScript",
              "Collaborate with designers and backend developers to implement new features",
              "Optimize applications for maximum speed and scalability"
            ],
            requirements: [
              "Bachelor's degree in Computer Science or related field",
              "3+ years of experience with React and JavaScript/TypeScript",
              "Strong understanding of HTML5, CSS3, and responsive design"
            ],
            skills: ["React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Redux", "Git"],
            benefits: [
              "Competitive salary and equity package",
              "Comprehensive health, dental, and vision insurance",
              "Flexible work arrangements and remote work options"
            ]
          };
          
          // Ensure all required arrays exist with defaults
          defaultJob.responsibilities = defaultJob.responsibilities || [];
          defaultJob.requirements = defaultJob.requirements || [];
          defaultJob.skills = defaultJob.skills || [];
          defaultJob.benefits = defaultJob.benefits || [];
          
          setJob(defaultJob);
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, jobTitle, companyName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h2>
          <button onClick={() => onNavigate('job-listings')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={() => onNavigate('company-profile', { companyName: job.company })}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to {job.company}
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <img
                src={getCompanyLogo(job)}
                alt={job.company}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  const company = job.company || job.companyName || 'Company';
                  
                  // Try Google favicons as fallback
                  if (!img.src.includes('favicon')) {
                    const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '');
                    img.src = `https://www.google.com/s2/favicons?domain=${cleanCompany}.com&sz=64`;
                  } else {
                    // Final fallback to initials
                    img.src = getFallbackLogo(company);
                  }
                }}
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                <div className="flex items-center space-x-2 text-lg text-blue-600 font-medium mb-4">
                  <Building className="w-5 h-5" />
                  <span>{job.company}</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>{typeof job.salary === 'object' ? `${job.salary.currency || '$'}${job.salary.min}-${job.salary.max} ${job.salary.period || 'per year'}` : (job.salary || 'Competitive')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{job.experience} experience</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 lg:mt-0">
              <button 
                onClick={() => {
                  localStorage.setItem('selectedJob', JSON.stringify(job));
                  onNavigate('job-application');
                }}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <p className="text-gray-600 leading-relaxed">{job.description}</p>
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Responsibilities</h2>
              <ul className="space-y-3">
                {Array.isArray(job.responsibilities) ? job.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-600">{responsibility}</span>
                  </li>
                )) : (
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-600">{job.responsibilities || 'No responsibilities listed'}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <ul className="space-y-3">
                {Array.isArray(job.requirements) ? job.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-600">{requirement}</span>
                  </li>
                )) : (
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-600">{job.requirements || 'No requirements listed'}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Job Poster */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact the Job Poster</h3>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={jobPoster?.companyLogo || getCompanyLogo(job)}
                  alt={jobPoster?.name || jobPoster?.companyName || job.company}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    const name = jobPoster?.name || jobPoster?.companyName || job.company || 'User';
                    img.src = getFallbackLogo(name);
                  }}
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {jobPoster?.name || jobPoster?.fullName || job.employerName || 'Hiring Manager'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {jobPoster?.companyName || jobPoster?.company || 'Recruiting Company'}
                  </p>
                  <p className="text-sm text-gray-500">{jobPoster?.jobTitle || jobPoster?.position || 'Recruiter'}</p>
                  <p className="text-xs text-gray-400">Posting for: {job.company}</p>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                View Profile
                <span className="ml-1">→</span>
              </button>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(job.skills) ? job.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                )) : (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {job.skills || 'No skills listed'}
                  </span>
                )}
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits & Perks</h3>
              <ul className="space-y-2">
                {Array.isArray(job.benefits) ? job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-600 text-sm">{benefit}</span>
                  </li>
                )) : (
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-600 text-sm">{job.benefits || 'No benefits listed'}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Similar Jobs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Jobs</h3>
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <h4 className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer text-sm mb-1">
                    Senior React Developer
                  </h4>
                  <p className="text-sm text-gray-600">Tech Solutions Inc.</p>
                  <p className="text-xs text-gray-500">San Francisco, CA • $130k - $160k</p>
                </div>
                <div className="border-b border-gray-100 pb-3">
                  <h4 className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer text-sm mb-1">
                    Frontend Engineer
                  </h4>
                  <p className="text-sm text-gray-600">Digital Corp</p>
                  <p className="text-xs text-gray-500">Remote • $110k - $140k</p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer text-sm mb-1">
                    Full Stack Developer
                  </h4>
                  <p className="text-sm text-gray-600">StartupXYZ</p>
                  <p className="text-xs text-gray-500">New York, NY • $120k - $150k</p>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <button 
                onClick={() => {
                  localStorage.setItem('selectedJob', JSON.stringify(job));
                  onNavigate('job-application');
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Apply for this Position
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">Posted {job.posted}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;