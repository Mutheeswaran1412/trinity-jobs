import React, { useState, useEffect } from 'react';
import { LayoutDashboard, User, Briefcase, MessageSquare, FileText, Bookmark, CreditCard, Settings, Trash2, LogOut, Search, Bell, Plus, MoreVertical, Users, Eye, Edit } from 'lucide-react';
import { decodeHtmlEntities, formatDate, formatSalary } from '../utils/textUtils';

interface EmployerDashboardPageProps {
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

const EmployerDashboardPage: React.FC<EmployerDashboardPageProps> = ({ onNavigate, onLogout }) => {
  const [user, setUser] = useState<any>(null);
  const [employerName, setEmployerName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log('Dashboard - User data:', parsedUser);
      console.log('Dashboard - companyLogo:', parsedUser.companyLogo);
      console.log('Dashboard - companyWebsite:', parsedUser.companyWebsite);
      setUser(parsedUser);
      setEmployerName(parsedUser.name || 'Employer');
      setCompanyName(parsedUser.company || parsedUser.companyName || 'Company');
      setCompanyLogo(parsedUser.companyLogo || '');
      setCompanyWebsite(parsedUser.companyWebsite || '');
      fetchDashboardData(parsedUser);
    }
  }, []);

  const fetchDashboardData = async (userData: any) => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetch('http://localhost:5000/api/jobs'),
        fetch('http://localhost:5000/api/applications')
      ]);

      if (jobsRes.ok) {
        const allJobs = await jobsRes.json();
        console.log('Dashboard - All jobs:', allJobs.length);
        console.log('Dashboard - User data for filtering:', userData);
        const employerJobs = Array.isArray(allJobs) ? allJobs.filter((job: any) => {
          const matchesId = job.employerId === userData.id || job.employerId === userData._id;
          const matchesEmail = job.employerEmail === userData.email;
          console.log(`Job: ${job.jobTitle}, matchesId: ${matchesId}, matchesEmail: ${matchesEmail}`);
          return matchesId || matchesEmail;
        }) : [];
        console.log('Dashboard - Filtered employer jobs:', employerJobs.length);
        setJobs(employerJobs);
      }

      if (appsRes.ok) {
        try {
          const response = await appsRes.json();
          const allApps = response.applications || response || [];
          console.log('Dashboard - All applications:', allApps.length);
          const employerApps = Array.isArray(allApps) ? allApps.filter((app: any) => {
            const matchesId = app.employerId === userData.id || app.employerId === userData._id;
            const matchesEmail = app.employerEmail === userData.email;
            const matchesCompany = app.jobId?.company?.toLowerCase() === userData.companyName?.toLowerCase();
            console.log(`App: ${app.candidateName}, matchesId: ${matchesId}, matchesEmail: ${matchesEmail}, matchesCompany: ${matchesCompany}`);
            return matchesId || matchesEmail || matchesCompany;
          }) : [];
          console.log('Dashboard - Filtered employer applications:', employerApps.length);
          setApplications(employerApps);
        } catch (jsonError) {
          console.error('Error parsing applications JSON:', jsonError);
          setApplications([]);
        }
      } else {
        console.log('Applications API not available or returned error');
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackLogo = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=6366f1&color=ffffff&bold=true`;
  };

  const getDisplayLogo = () => {
    if (companyLogo && companyLogo.trim() !== '') {
      console.log('Using stored logo:', companyLogo);
      return companyLogo;
    }
    console.log('Using fallback logo for:', companyName);
    return getFallbackLogo(companyName);
  };

  const stats = [
    { label: 'Posted Job', value: jobs.length.toString().padStart(2, '0'), icon: Users, color: 'bg-lime-400' },
    { label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length.toString().padStart(2, '0'), icon: Bookmark, color: 'bg-lime-400' },
    { label: 'Application', value: applications.length > 999 ? `${(applications.length / 1000).toFixed(1)}k` : applications.length.toString().padStart(2, '0'), icon: Eye, color: 'bg-lime-400' },
    { label: 'Save Candidate', value: '00', icon: Edit, color: 'bg-lime-400' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* User Profile */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={getDisplayLogo()}
                alt={employerName}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  console.log('Logo failed to load, using fallback');
                  img.src = getFallbackLogo(employerName || companyName);
                }}
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">{employerName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
              {companyWebsite && (
                <a 
                  href={companyWebsite.startsWith('http') ? companyWebsite : `https://${companyWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 block truncate"
                >
                  {companyWebsite.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveMenu('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeMenu === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <User className="w-5 h-5" />
            <span className="font-medium">My Profile</span>
          </button>

          <button
            onClick={() => setActiveMenu('applications')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeMenu === 'applications' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Applications</span>
            {applications.length > 0 && (
              <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {applications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('my-jobs')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Briefcase className="w-5 h-5" />
            <span className="font-medium">My Jobs</span>
          </button>

          <button
            onClick={() => onNavigate('job-posting')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">Submit Job</span>
          </button>

          <button
            onClick={() => onNavigate('candidate-search')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Bookmark className="w-5 h-5" />
            <span className="font-medium">Save Candidate</span>
          </button>

          <button
            onClick={() => console.log('Membership feature coming soon')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            <span className="font-medium">Membership</span>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Account Settings</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                console.log('Delete account feature coming soon');
              }
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span className="font-medium">Delete Account</span>
          </button>
        </nav>

        {/* Profile Complete */}
        <div className="p-6 border-t border-gray-200">
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Profile Complete</span>
              <span className="font-semibold text-gray-900">87%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-lime-400 h-2 rounded-full" style={{ width: '87%' }}></div>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                localStorage.removeItem('user');
                onNavigate('home');
              }
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search here.."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4 ml-6">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => onNavigate('job-posting')}
                className="bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-800 transition-colors"
              >
                Post a Job
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8">
          {activeMenu === 'dashboard' ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-gray-500 text-sm">{stat.label}</p>
                      </div>
                      <div className={`${stat.color} rounded-full p-3`}>
                        <stat.icon className="w-6 h-6 text-gray-800" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Job Views Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Views</h2>
                  
                  <div className="mb-4">
                    <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                      <option>All Jobs</option>
                      {jobs.map(job => (
                        <option key={job._id}>{job.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 mb-6">
                    <button className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700">1h</button>
                    <button className="px-3 py-1 text-xs bg-emerald-700 text-white rounded-full">Day</button>
                    <button className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700">Week</button>
                    <button className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700">Month</button>
                    <button className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700">Year</button>
                  </div>

                  {/* Chart */}
                  <div className="relative h-64">
                    <div className="absolute inset-0 flex items-end justify-between space-x-2 px-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => {
                        const height = Math.floor(Math.random() * 60) + 20;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-gradient-to-t from-emerald-400 to-emerald-200 rounded-t-lg transition-all hover:from-emerald-500 hover:to-emerald-300 cursor-pointer relative group" 
                              style={{ height: `${height}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {Math.floor(height * 3)} views
                              </div>
                            </div>
                            <span className="text-xs text-gray-500 mt-2">{day}</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-400">
                      <span>300</span>
                      <span>200</span>
                      <span>100</span>
                      <span>50</span>
                    </div>
                  </div>
                </div>

                {/* Posted Jobs */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Posted Job</h2>
                  
                  <div className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                      </div>
                    ) : jobs.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm mb-4">No jobs posted yet</p>
                        <button
                          onClick={() => onNavigate('job-posting')}
                          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                        >
                          Post your first job
                        </button>
                      </div>
                    ) : (
                      jobs.slice(0, 5).map((job, index) => (
                        <div key={job._id} className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="flex items-start space-x-3">
                            <img
                              src={getDisplayLogo()}
                              alt={job.title}
                              className="w-10 h-10 rounded-lg object-cover"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = getFallbackLogo(companyName);
                              }}
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm">{decodeHtmlEntities(job.title)}</h3>
                              <p className="text-xs text-gray-500">{job.type || 'Fulltime'} . {job.location}</p>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : activeMenu === 'applications' ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-8">Applications</h1>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600 mb-6">Post more jobs to start receiving applications from candidates.</p>
                  <button
                    onClick={() => onNavigate('job-posting')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Post a Job
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {application.candidateName?.charAt(0).toUpperCase() || 'C'}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {application.candidateName || application.candidateEmail}
                                </h3>
                                <p className="text-lg text-emerald-600 font-medium">
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

                            {application.resumeUrl ? (
                              <div className="mb-3">
                                <button
                                  onClick={async () => {
                                    try {
                                      let resumeUrl = application.resumeUrl;
                                      
                                      // Handle different URL formats
                                      if (!resumeUrl.startsWith('http')) {
                                        resumeUrl = resumeUrl.startsWith('/') 
                                          ? `http://localhost:5000${resumeUrl}`
                                          : `http://localhost:5000/uploads/${resumeUrl}`;
                                      }
                                      
                                      // Test if file exists
                                      const testResponse = await fetch(resumeUrl, { method: 'HEAD' });
                                      if (testResponse.ok) {
                                        window.open(resumeUrl, '_blank', 'noopener,noreferrer');
                                      } else {
                                        alert('Resume file not found. The candidate may need to re-upload their resume.');
                                      }
                                    } catch (error) {
                                      alert('Unable to open resume. File may not exist.');
                                    }
                                  }}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center space-x-1 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <span>📄</span>
                                  <span>View Resume</span>
                                </button>
                              </div>
                            ) : (
                              <div className="mb-3">
                                <span className="text-gray-500 text-sm">📄 Resume not available</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="ml-6 flex flex-col space-y-2">
                          <select
                            value={application.status}
                            onChange={async (e) => {
                              try {
                                const response = await fetch(`http://localhost:5000/api/applications/${application._id}/status`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: e.target.value }),
                                });
                                if (response.ok) {
                                  setApplications(prev => 
                                    prev.map(app => 
                                      app._id === application._id ? { ...app, status: e.target.value } : app
                                    )
                                  );
                                }
                              } catch (error) {
                                console.error('Error updating status:', error);
                              }
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboardPage;
