import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Eye, Calendar, MapPin, Building } from 'lucide-react';

interface MyApplicationsPageProps {
  onNavigate: (page: string) => void;
}

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  appliedAt: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';
  employerNotes?: string;
  updatedAt?: string;
}

const MyApplicationsPage: React.FC<MyApplicationsPageProps> = ({ onNavigate }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = () => {
    // Get applications from localStorage (in production, fetch from API)
    const savedApplications = JSON.parse(localStorage.getItem('userApplications') || '[]');
    setApplications(savedApplications);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'interviewed': return 'bg-purple-100 text-purple-800';
      case 'hired': return 'bg-green-200 text-green-900';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewed': return <Eye className="w-4 h-4" />;
      case 'shortlisted': return <CheckCircle className="w-4 h-4" />;
      case 'interviewed': return <Calendar className="w-4 h-4" />;
      case 'hired': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return !['hired', 'rejected'].includes(app.status);
    if (activeTab === 'shortlisted') return app.status === 'shortlisted';
    if (activeTab === 'completed') return ['hired', 'rejected'].includes(app.status);
    return true;
  });

  const ApplicationCard = ({ application }: { application: Application }) => (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{application.jobTitle}</h3>
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <Building className="w-4 h-4 mr-1" />
            <span className="mr-4">{application.company}</span>
            <MapPin className="w-4 h-4 mr-1" />
            <span>{application.location}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(application.status)}`}>
            {getStatusIcon(application.status)}
            <span className="ml-1 capitalize">{application.status}</span>
          </span>
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        <p>Applied: {new Date(application.appliedAt).toLocaleDateString()}</p>
        {application.updatedAt && application.updatedAt !== application.appliedAt && (
          <p>Updated: {new Date(application.updatedAt).toLocaleDateString()}</p>
        )}
      </div>

      {application.employerNotes && (
        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-blue-800">
            <strong>Employer Note:</strong> {application.employerNotes}
          </p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={() => {
            // Store job data for viewing
            localStorage.setItem('selectedJob', JSON.stringify({
              title: application.jobTitle,
              company: application.company,
              location: application.location
            }));
            onNavigate('job-detail');
          }}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Job
        </button>
        
        {application.status === 'rejected' && (
          <button
            onClick={() => onNavigate('job-listings')}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Find Similar Jobs
          </button>
        )}
      </div>
    </div>
  );

  if (loading) return <div className="p-6">Loading applications...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <div className="flex space-x-3">
          <button 
            onClick={() => onNavigate('job-listings')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Apply to More Jobs
          </button>
          <button 
            onClick={() => onNavigate('candidate-dashboard')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Applied</p>
              <p className="text-xl font-bold">{applications.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Shortlisted</p>
              <p className="text-xl font-bold">{applications.filter(a => a.status === 'shortlisted').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Interviewed</p>
              <p className="text-xl font-bold">{applications.filter(a => a.status === 'interviewed').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded">
              <Eye className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-xl font-bold">{applications.filter(a => !['hired', 'rejected'].includes(a.status)).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex space-x-8">
          {[
            { key: 'all', label: 'All Applications', count: applications.length },
            { key: 'active', label: 'Active', count: applications.filter(a => !['hired', 'rejected'].includes(a.status)).length },
            { key: 'shortlisted', label: 'Shortlisted', count: applications.filter(a => a.status === 'shortlisted').length },
            { key: 'completed', label: 'Completed', count: applications.filter(a => ['hired', 'rejected'].includes(a.status)).length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredApplications.map(application => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Clock className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'all' ? 'No applications yet' : `No ${activeTab} applications`}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'all' 
              ? 'Start applying to jobs to track your applications here.' 
              : `You don't have any ${activeTab} applications at the moment.`
            }
          </p>
          <button
            onClick={() => onNavigate('job-listings')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Browse Jobs
          </button>
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;