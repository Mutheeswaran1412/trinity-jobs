import React, { useState, useEffect } from 'react';
import { Mail, User, Phone, FileText, Clock, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';

interface Application {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  createdAt: string;
  jobId: {
    _id: string;
    jobTitle: string;
    company: string;
  };
}

interface ApplicationManagerProps {
  jobId?: string;
}

const ApplicationManager: React.FC<ApplicationManagerProps> = ({ jobId }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchApplications();
  }, [jobId, filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Get employer's jobs first
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const jobsResponse = await fetch('http://localhost:5000/api/jobs');
      const allJobs = await jobsResponse.json();
      const employerJobs = allJobs.filter((job: any) => 
        job.employerId === user.id || 
        job.employerEmail === user.email || 
        job.company?.toLowerCase() === user.companyName?.toLowerCase() ||
        (user.email === 'muthees@trinitetech.com' && job.company?.toLowerCase().includes('zyncjobs'))
      );
      
      // Get applications for employer's jobs
      let allApplications: any[] = [];
      for (const job of employerJobs) {
        const response = await fetch(`http://localhost:5000/api/applications/job/${job._id}`);
        if (response.ok) {
          const jobApplications = await response.json();
          allApplications = [...allApplications, ...jobApplications.map((app: any) => ({
            ...app,
            jobId: { _id: job._id, jobTitle: job.title, company: job.company }
          }))];
        }
      }
      
      setApplications(allApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      setUpdating(applicationId);
      console.log('Updating application:', applicationId, 'to status:', newStatus);
      
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log('Update response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Update result:', result);
        
        // Update the local state immediately
        setApplications(prev => prev.map(app => 
          app._id === applicationId 
            ? { ...app, status: newStatus }
            : app
        ));
        
        alert(`Application status updated to ${newStatus}. Email notification sent to candidate.`);
      } else {
        const errorText = await response.text();
        console.error('Update error:', errorText);
        alert(`Error: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update application status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'reviewed': return <Eye className="w-4 h-4 text-blue-500" />;
      case 'shortlisted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'hired': return <CheckCircle className="w-4 h-4 text-purple-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'hired': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = applications.filter(app => 
    filter === 'all' || app.status === filter
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Job Applications</h2>
          <div className="text-sm text-gray-500">
            {filteredApplications.length} applications
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {['all', 'pending', 'reviewed', 'shortlisted', 'rejected', 'hired'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                filter === status
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredApplications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No applications found</p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div key={application._id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <h3 className="font-medium text-gray-900">{application.candidateName}</h3>
                    </div>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1">{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{application.candidateEmail}</span>
                    </div>
                    {application.candidatePhone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{application.candidatePhone}</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Applied {new Date(application.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {application.coverLetter && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {application.coverLetter.length > 150 
                          ? `${application.coverLetter.substring(0, 150)}...`
                          : application.coverLetter
                        }
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    {application.resumeUrl && (
                      <a
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        View Resume
                      </a>
                    )}
                  </div>
                </div>

                <div className="ml-6 flex-shrink-0">
                  <div className="flex flex-col space-y-2">
                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            console.log('Clicked Mark Reviewed for:', application._id);
                            updateApplicationStatus(application._id, 'reviewed');
                          }}
                          disabled={updating === application._id}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {updating === application._id ? 'Updating...' : 'Mark Reviewed'}
                        </button>
                        <button
                          onClick={() => {
                            console.log('Clicked Shortlist for:', application._id);
                            updateApplicationStatus(application._id, 'shortlisted');
                          }}
                          disabled={updating === application._id}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {updating === application._id ? 'Updating...' : 'Shortlist'}
                        </button>
                        <button
                          onClick={() => {
                            console.log('Clicked Reject for:', application._id);
                            updateApplicationStatus(application._id, 'rejected');
                          }}
                          disabled={updating === application._id}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {updating === application._id ? 'Updating...' : 'Reject'}
                        </button>
                      </>
                    )}
                    
                    {application.status === 'reviewed' && (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(application._id, 'shortlisted')}
                          disabled={updating === application._id}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(application._id, 'rejected')}
                          disabled={updating === application._id}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {application.status === 'shortlisted' && (
                      <>
                        <button
                          onClick={() => updateApplicationStatus(application._id, 'hired')}
                          disabled={updating === application._id}
                          className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
                        >
                          Hire
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(application._id, 'rejected')}
                          disabled={updating === application._id}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    
                    {updating === application._id && (
                      <div className="text-xs text-gray-500 text-center">
                        Updating...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicationManager;