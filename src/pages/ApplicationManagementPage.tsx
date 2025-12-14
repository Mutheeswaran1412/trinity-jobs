import React from 'react';
import { ArrowLeft, Users, Mail } from 'lucide-react';
import ApplicationManager from '../components/ApplicationManager';

interface ApplicationManagementPageProps {
  onNavigate: (page: string) => void;
}

const ApplicationManagementPage: React.FC<ApplicationManagementPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('employer-dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Application Management</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span>Email notifications enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-gray-600">
            Manage job applications and update candidate statuses. Email notifications will be sent automatically when you update application statuses.
          </p>
        </div>

        <ApplicationManager />
      </div>
    </div>
  );
};

export default ApplicationManagementPage;