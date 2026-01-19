import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Briefcase, Clock, DollarSign, Building, Share2, X } from 'lucide-react';
import { API_ENDPOINTS } from '../config/constants';

interface JobDetailPageProps {
  onNavigate: (page: string, data?: any) => void;
  jobTitle?: string;
  jobId?: number;
  companyName?: string;
  user?: any;
  onLogout?: () => void;
  jobData?: any;
}

const JobDetailPage: React.FC<JobDetailPageProps> = ({ onNavigate, jobTitle, jobId, companyName, user, onLogout, jobData }) => {
  const [job, setJob] = useState<any>(null);
  const [jobPoster, setJobPoster] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

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
        // If jobData is passed from LatestJobs, use it directly
        if (jobData) {
          setJob(jobData);
          setLoading(false);
          return;
        }
        
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
  }, [jobId, jobTitle, companyName, jobData]);

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
      {/* Job Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={() => {
              console.log('Back button clicked');
              console.log('User:', user);
              console.log('User type:', user?.type, user?.userType);
              
              // Try onNavigate first
              try {
                if (user?.type === 'employer' || user?.userType === 'employer') {
                  console.log('Navigating to my-jobs');
                  onNavigate('my-jobs');
                } else {
                  console.log('Navigating to job-listings');
                  onNavigate('job-listings');
                }
              } catch (error) {
                console.error('Navigation error:', error);
                // Fallback to browser history
                window.history.back();
              }
            }}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back to Jobs</span>
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.jobTitle || job.title}</h1>
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
            
            <div className="mt-6 lg:mt-0 flex items-center space-x-3">
              {/* Always show share button for testing */}
              <button 
                onClick={() => setShowShareModal(true)}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              
              {/* Apply button - Always show Login to Apply */}
              <button 
                onClick={() => {
                  // Store job data for after login
                  localStorage.setItem('pendingJobApplication', JSON.stringify({
                    jobId: job.id || jobId,
                    jobTitle: job.jobTitle || job.title,
                    company: job.company,
                    jobData: job
                  }));
                  // Always redirect to login
                  onNavigate('login');
                }}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Login to Apply
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
              <p className="text-gray-600 leading-relaxed mb-4">{job.jobDescription || job.description}</p>
              
              {/* Created By & On Details */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">Created By:</span>
                    <span>{job.postedBy || jobPoster?.name || jobPoster?.fullName || 'System'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">On:</span>
                    <span>{job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: '2-digit', 
                      day: '2-digit' 
                    }) : '01/16/26'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">Company:</span>
                    <span>{job.employerCompany || jobPoster?.company || job.company}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Responsibilities</h2>
              <ul className="space-y-3">
                {job.responsibilities ? (
                  Array.isArray(job.responsibilities) ? job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-600">{responsibility}</span>
                    </li>
                  )) : (
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-600">{job.responsibilities}</span>
                    </li>
                  )
                ) : (
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-600">Develop and maintain high-quality software solutions</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <ul className="space-y-3">
                {job.requirements ? (
                  Array.isArray(job.requirements) ? job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-600">{requirement}</span>
                    </li>
                  )) : (
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-600">{job.requirements}</span>
                    </li>
                  )
                ) : (
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-600">Bachelor's degree or equivalent experience required</span>
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

            {/* Apply Button - Always show Login to Apply */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <button 
                onClick={() => {
                  // Store job data for after login
                  localStorage.setItem('pendingJobApplication', JSON.stringify({
                    jobId: job.id || jobId,
                    jobTitle: job.jobTitle || job.title,
                    company: job.company,
                    jobData: job
                  }));
                  // Always redirect to login
                  onNavigate('login');
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Login to Apply
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">Posted {job.posted}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share this job</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {/* LinkedIn */}
              <button
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  const jobTitle = job.jobTitle || job.title;
                  const company = job.company;
                  const location = job.location;
                  const salary = typeof job.salary === 'object' ? `${job.salary.currency || '$'}${job.salary.min}-${job.salary.max} ${job.salary.period || 'per year'}` : (job.salary || 'Competitive salary');
                  const experience = job.experience;
                  const jobType = job.type;
                  
                  // Create comprehensive job post content
                  const postContent = `🚀 Exciting Job Opportunity Alert! 🚀

📍 Position: ${jobTitle}
🏢 Company: ${company}
📍 Location: ${location}
💰 Salary: ${salary}
⏰ Type: ${jobType}
🎯 Experience: ${experience}

📋 Job Description:
${job.description || 'Great opportunity to join our team!'}

${job.skills && Array.isArray(job.skills) ? `🔧 Required Skills:
${job.skills.map(skill => `• ${skill}`).join('\n')}` : ''}

${job.benefits && Array.isArray(job.benefits) ? `🎁 Benefits:
${job.benefits.slice(0, 3).map(benefit => `• ${benefit}`).join('\n')}` : ''}

💼 Ready to take your career to the next level? Apply now!

#JobOpportunity #Hiring #${company.replace(/\s+/g, '')} #${jobTitle.replace(/\s+/g, '')} #TechJobs #CareerOpportunity

Apply here: ${window.location.href}`;
                  
                  const encodedContent = encodeURIComponent(postContent);
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&text=${encodedContent}`, '_blank');
                  setShowShareModal(false);
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">in</span>
                </div>
                <span className="font-medium text-gray-900">Share on LinkedIn</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                  setShowShareModal(false);
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">f</span>
                </div>
                <span className="font-medium text-gray-900">Share on Facebook</span>
              </button>

              {/* Twitter */}
              <button
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  const jobTitle = job.jobTitle || job.title;
                  const company = job.company;
                  const location = job.location;
                  const salary = typeof job.salary === 'object' ? `${job.salary.currency || '$'}${job.salary.min}-${job.salary.max}` : (job.salary || 'Competitive');
                  
                  const tweetText = `🚀 ${jobTitle} at ${company}
📍 ${location}
💰 ${salary}

${job.skills && Array.isArray(job.skills) ? `Skills: ${job.skills.slice(0, 3).join(', ')}` : ''}

#JobAlert #Hiring #${company.replace(/\s+/g, '')} #TechJobs`;
                  
                  const encodedText = encodeURIComponent(tweetText);
                  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${encodedText}`, '_blank');
                  setShowShareModal(false);
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">X</span>
                </div>
                <span className="font-medium text-gray-900">Share on X (Twitter)</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => {
                  const jobTitle = job.jobTitle || job.title;
                  const company = job.company;
                  const location = job.location;
                  const salary = typeof job.salary === 'object' ? `${job.salary.currency || '$'}${job.salary.min}-${job.salary.max} ${job.salary.period || 'per year'}` : (job.salary || 'Competitive salary');
                  const experience = job.experience;
                  
                  const whatsappMessage = `🚀 *Job Opportunity*

*Position:* ${jobTitle}
*Company:* ${company}
*Location:* ${location}
*Salary:* ${salary}
*Experience:* ${experience}

*Description:*
${job.description?.substring(0, 200)}...

${job.skills && Array.isArray(job.skills) ? `*Skills Required:* ${job.skills.slice(0, 5).join(', ')}` : ''}

Apply here: ${window.location.href}`;
                  
                  const encodedMessage = encodeURIComponent(whatsappMessage);
                  window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
                  setShowShareModal(false);
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="font-medium text-gray-900">Share on WhatsApp</span>
              </button>

              {/* Copy Link */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                  setShowShareModal(false);
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🔗</span>
                </div>
                <span className="font-medium text-gray-900">Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;