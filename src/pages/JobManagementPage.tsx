import React, { useState, useEffect } from 'react';
import { Briefcase, Users, Eye, Edit, Trash2, Plus, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface JobManagementPageProps {
  onNavigate: (page: string) => void;
  user: {name: string, type: 'candidate' | 'employer'} | null;
  onLogout: () => void;
}

const JobManagementPage: React.FC<JobManagementPageProps> = ({ onNavigate, user, onLogout }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      fetchEmployerJobs(parsedUser);
    }
  }, []);

  const fetchEmployerJobs = async (userData: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/jobs');
      if (response.ok) {
        const allJobs = await response.json();
        const employerJobs = allJobs.filter((job: any) => 
          job.employer_id === userData.id || 
          job.employer_email === userData.email ||
          job.company?.toLowerCase() === userData.companyName?.toLowerCase()
        );
        setJobs(employerJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setJobs(jobs.filter(job => job._id !== jobId));
        }
      } catch (error) {
        console.error('Error deleting job:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
            <p className="text-gray-600 mt-2">Manage your job postings and applications</p>
          </div>
          <button
            onClick={() => onNavigate('job-posting')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Post New Job</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
            <p className="text-gray-500 mb-6">Create your first job posting to start hiring</p>
            <button
              onClick={() => onNavigate('job-posting')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job: any) => (
              <div key={job._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-2">{job.location} • {typeof job.salary === 'object' ? `${job.salary.currency || '$'}${job.salary.min}-${job.salary.max} ${job.salary.period || 'per year'}` : (job.salary || 'Competitive salary')}</p>
                    <p className="text-sm text-gray-500">
                      Posted {new Date(job.created_at).toLocaleDateString()} • 
                      Status: <span className={`font-medium ${job.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                        {job.status || 'Active'}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        sessionStorage.setItem('editJob', JSON.stringify(job));
                        onNavigate('job-posting');
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit job posting"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete job posting"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">0 Applications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">{job.views || 0} Views</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-600">{job.type || 'Full-time'}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      sessionStorage.setItem('selectedJobId', job._id);
                      onNavigate('candidate-search');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                  >
                    View Applications
                  </button>
                  <button
                    onClick={() => {
                      sessionStorage.setItem('editJob', JSON.stringify(job));
                      onNavigate('job-posting');
                    }}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors"
                  >
                    Edit Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default JobManagementPage;