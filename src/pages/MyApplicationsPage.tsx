import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, Eye, AlertCircle, Briefcase, MapPin, Calendar } from 'lucide-react';

interface Application {
  _id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  createdAt: string;
  jobId: {
    _id: string;
    jobTitle: string;
    company: string;
    location?: string;
  };
}

interface MyApplicationsPageProps {
  onNavigate: (page: string) => void;
  user: any;
  onLogout: () => void;
}

const MyApplicationsPage: React.FC<MyApplicationsPageProps> = ({ onNavigate, user }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [editingApp, setEditingApp] = useState<string | null>(null);
  const [editCoverLetter, setEditCoverLetter] = useState<string>('');

  useEffect(() => {
    fetchMyApplications();
  }, [user]);

  useEffect(() => {
    fetchMyApplications();
  }, [filter]);

  const fetchMyApplications = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/applications/candidate/${user.email}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditApplication = (appId: string, currentCoverLetter: string) => {
    setEditingApp(appId);
    setEditCoverLetter(currentCoverLetter || '');
  };

  const handleSaveApplication = async (appId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ coverLetter: editCoverLetter }),
      });

      if (response.ok) {
        // Update local state
        setApplications(prev => prev.map(app => 
          app._id === appId 
            ? { ...app, coverLetter: editCoverLetter }
            : app
        ));
        setEditingApp(null);
        setEditCoverLetter('');
        alert('Application updated successfully!');
      } else {
        alert('Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Failed to update application');
    }
  };

  const handleCancelEdit = () => {
    setEditingApp(null);
    setEditCoverLetter('');
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
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shortlisted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'hired': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending': return 'Your application is being reviewed';
      case 'reviewed': return 'Application under review by employer';
      case 'shortlisted': return 'Congratulations! You\'ve been shortlisted';
      case 'rejected': return 'Application was not selected';
      case 'hired': return 'Congratulations! You got the job';
      default: return 'Status unknown';
    }
  };

  const filteredApplications = applications.filter(app => 
    filter === 'all' || app.status === filter
  );

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    reviewed: applications.filter(app => app.status === 'reviewed').length,
    shortlisted: applications.filter(app => app.status === 'shortlisted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    hired: applications.filter(app => app.status === 'hired').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {applications.length} total applications
              </div>
              <button
                onClick={() => {
                  console.log('MyApplications: Manual refresh clicked');
                  fetchMyApplications();
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
            <div className="text-sm text-gray-600">Total Applied</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.reviewed}</div>
            <div className="text-sm text-gray-600">Reviewed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{statusCounts.shortlisted}</div>
            <div className="text-sm text-gray-600">Shortlisted</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{statusCounts.hired}</div>
            <div className="text-sm text-gray-600">Hired</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-4 border-b">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {['all', 'pending', 'reviewed', 'shortlisted', 'rejected', 'hired'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === status
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status as keyof typeof statusCounts]})
                </button>
              ))}
            </div>
          </div>

          {/* Applications List */}
          <div className="divide-y divide-gray-200">
            {filteredApplications.length === 0 ? (
              <div className="p-8 text-center">
                <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
                </h3>
                <p className="text-gray-600 mb-4">
                  {filter === 'all' 
                    ? 'Start applying to jobs to see your applications here'
                    : `You don't have any ${filter} applications at the moment`
                  }
                </p>
                <button
                  onClick={() => onNavigate('job-listings')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              filteredApplications.map((application) => (
                <div key={application._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {application.jobId.jobTitle}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="font-medium">{application.jobId.company}</span>
                            {application.jobId.location && (
                              <>
                                <span>•</span>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {application.jobId.location}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-2">{application.status.charAt(0).toUpperCase() + application.status.slice(1)}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm text-gray-700">{getStatusMessage(application.status)}</p>
                      </div>

                      {application.coverLetter && (
                        <div className="mb-3">
                          {editingApp === application._id ? (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Edit Cover Letter:</label>
                              <textarea
                                value={editCoverLetter}
                                onChange={(e) => setEditCoverLetter(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                rows={4}
                                maxLength={1000}
                              />
                              <div className="flex justify-end space-x-2 mt-2">
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveApplication(application._id)}
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex justify-between items-start">
                                <p className="text-sm text-gray-600 flex-1">
                                  <span className="font-medium">Cover Letter:</span> {application.coverLetter.length > 150 
                                    ? `${application.coverLetter.substring(0, 150)}...`
                                    : application.coverLetter
                                  }
                                </p>
                                {application.status === 'pending' && (
                                  <button
                                    onClick={() => handleEditApplication(application._id, application.coverLetter || '')}
                                    className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  >
                                    Edit
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          Applied {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => onNavigate('job-detail', { 
                            jobTitle: application.jobId.jobTitle, 
                            jobId: application.jobId._id,
                            companyName: application.jobId.company
                          })}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Job Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        {applications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => onNavigate('job-listings')}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center">
                  <Briefcase className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-medium">Apply to More Jobs</h4>
                    <p className="text-sm text-gray-600">Browse and apply to new opportunities</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => onNavigate('candidate-profile')}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium">Improve Profile</h4>
                    <p className="text-sm text-gray-600">Complete your profile to get better matches</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplicationsPage;