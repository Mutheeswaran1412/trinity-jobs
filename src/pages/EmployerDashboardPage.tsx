import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Globe, MessageSquare } from 'lucide-react';

interface EmployerDashboardPageProps {
  onNavigate: (page: string) => void;
}

const EmployerDashboardPage: React.FC<EmployerDashboardPageProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<any>(null);
  const [companyName, setCompanyName] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setCompanyName(parsedUser.company || parsedUser.companyName || 'ZyncJobs Technology Solutions LLC');
      fetchEmployerData(parsedUser);
    }
  }, []);

  const fetchEmployerData = async (userData: any) => {
    try {
      const jobsResponse = await fetch('http://localhost:5000/api/jobs');
      if (jobsResponse.ok) {
        const allJobs = await jobsResponse.json();
        const jobsArray = Array.isArray(allJobs) ? allJobs : [];
        
        console.log('All jobs:', jobsArray.length);
        console.log('User data:', userData);
        console.log('Sample job:', jobsArray[0]);
        
        const employerJobs = jobsArray.filter((job: any) => {
          const matchesId = job.employerId === userData.id;
          const matchesEmail = job.employerEmail === userData.email;
          const matchesCompany = job.company?.toLowerCase() === userData.companyName?.toLowerCase();
          const matchesSpecial = userData.email === 'muthees@trinitetech.com' && 
            (job.company?.toLowerCase().includes('muthees') || job.company?.toLowerCase().includes('zyncjobs'));
          
          const matches = matchesId || matchesEmail || matchesCompany || matchesSpecial;
          
          if (matches) {
            console.log('Job matches:', job.title, {
              matchesId, matchesEmail, matchesCompany, matchesSpecial,
              jobCompany: job.company,
              jobEmployerEmail: job.employerEmail
            });
          }
          
          return matches;
        });
        
        console.log('Filtered jobs:', employerJobs.length);
        setJobs(employerJobs);
      }
    } catch (error) {
      console.error('Error fetching employer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCompanyLogo = (name: string) => {
    const COMPANY_DOMAIN_MAP: { [key: string]: string } = {
      'google': 'google.com', 'amazon': 'amazon.com', 'microsoft': 'microsoft.com',
      'apple': 'apple.com', 'meta': 'meta.com', 'facebook': 'facebook.com',
      'netflix': 'netflix.com', 'tesla': 'tesla.com', 'ibm': 'ibm.com',
      'oracle': 'oracle.com', 'salesforce': 'salesforce.com', 'adobe': 'adobe.com',
      'intel': 'intel.com', 'nvidia': 'nvidia.com', 'cisco': 'cisco.com',
      'zoho': 'zoho.com', 'infosys': 'infosys.com', 'tcs': 'tcs.com',
      'wipro': 'wipro.com', 'cognizant': 'cognizant.com', 'accenture': 'accenture.com'
    };
    const lowerName = name.toLowerCase().trim();
    const domain = COMPANY_DOMAIN_MAP[lowerName] || `${lowerName}.com`;
    return `https://img.logo.dev/${domain}?token=pk_X-1ZO13CRYuFHfXgt5hQ`;
  };
  return (
    <div className="min-h-screen bg-gray-50">


      {/* Main Content */}
      <div className="bg-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back To Job
          </button>
        </div>
      </div>

      {/* Company Profile Section */}
      <div className="bg-black py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-start space-x-8">
            <div className="bg-white p-4 rounded-lg">
              <img
                src={getCompanyLogo(companyName)}
                alt="Company Logo"
                className="w-24 h-24 rounded object-contain bg-white"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  const domain = companyName.toLowerCase().trim() + '.com';
                  img.onerror = () => {
                    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&size=128&background=6366f1&color=ffffff&bold=true`;
                  };
                  img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {companyName}
          </h1>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'jobs'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Jobs
              </button>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'overview' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {companyName}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {companyName} is currently accepting resumes for a variety of positions. Please review the database of positions that we are seeking to fill and contact us for additional information about any specific opportunity.
                  </p>
                </div>
              )}

              {activeTab === 'jobs' && (
                <div>
                  <div className="mb-4 text-sm text-gray-600">
                    1 - {jobs.length} of {jobs.length} Jobs
                  </div>
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      </div>
                    ) : jobs.length === 0 ? (
                      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                        <p className="text-gray-500 mb-4">No job postings yet</p>
                        <button 
                          onClick={() => onNavigate('job-posting')}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Post Your First Job
                        </button>
                      </div>
                    ) : (
                      jobs.map((job: any) => (
                        <div key={job._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-white border border-gray-200 rounded flex items-center justify-center flex-shrink-0 p-1">
                                <img
                                  src={getCompanyLogo(companyName)}
                                  alt={companyName}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&size=48&background=6366f1&color=ffffff&bold=true`;
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <h4 
                                  className="text-xl font-semibold text-blue-600 hover:text-blue-700 cursor-pointer mb-2"
                                  onClick={() => onNavigate('job-detail', { jobTitle: job.title, jobId: job._id, companyName: job.company })}
                                >
                                  {job.title}
                                </h4>
                                <div className="text-gray-600 mb-2">
                                  <span className="font-medium">{companyName}</span>
                                  <span className="mx-2">•</span>
                                  <span>{job.location}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center space-x-1">
                                    <div className="w-4 h-4 bg-gray-400 rounded-sm flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-sm"></div>
                                    </div>
                                    <span>{job.type || 'Full-time'}</span>
                                  </div>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                                  {job.description?.substring(0, 150)}...
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                                    <div className="w-4 h-4 text-yellow-500">⚡</div>
                                    <span>Easy Apply</span>
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    Posted {new Date(job.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Company Logo</p>
                    <img
                      src={getCompanyLogo(companyName)}
                      alt={companyName}
                      className="w-16 h-16 rounded object-contain bg-white border border-gray-200 p-2 mt-2"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        const domain = companyName.toLowerCase().trim() + '.com';
                        img.onerror = () => {
                          img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&size=64&background=random&bold=true`;
                        };
                        img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Website</p>
                    <a 
                      href={`https://${companyName.toLowerCase().trim()}.com`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                    >
                      <Globe className="w-4 h-4" />
                      <span>{companyName.toLowerCase().trim()}.com</span>
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Headquarters</p>
                    <p className="font-medium text-gray-900">Plano, TX, USA</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => onNavigate('job-posting')}
                    className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-blue-900">Post New Job</p>
                  </button>
                  <button 
                    onClick={() => onNavigate('job-management')}
                    className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-green-900">Manage Jobs</p>
                  </button>
                  <button 
                    onClick={() => onNavigate('application-management')}
                    className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-orange-900">Manage Applications</p>
                  </button>
                  <button 
                    onClick={() => onNavigate('hire-talent')}
                    className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <p className="font-medium text-purple-900">Browse Candidates</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Button */}
      <div className="fixed right-0 top-1/2 transform -translate-y-1/2">
        <button className="bg-teal-600 text-white px-3 py-8 rounded-l-lg hover:bg-teal-700 transition-colors">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-medium transform -rotate-90 whitespace-nowrap">Feedback</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default EmployerDashboardPage;