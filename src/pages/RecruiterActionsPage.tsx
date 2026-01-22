import React, { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Mail, Phone, MessageSquare } from 'lucide-react';

interface RecruiterActionsPageProps {
  onNavigate: (page: string) => void;
}

const RecruiterActionsPage: React.FC<RecruiterActionsPageProps> = ({ onNavigate }) => {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading recruiter actions
    setTimeout(() => {
      setActions([
        {
          id: 1,
          type: 'view',
          recruiter: 'Sarah Johnson',
          company: 'Tech Solutions Inc.',
          date: '2024-01-15',
          message: 'Viewed your profile'
        },
        {
          id: 2,
          type: 'message',
          recruiter: 'Mike Chen',
          company: 'StartupXYZ',
          date: '2024-01-14',
          message: 'Sent you a message about Software Engineer position'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="w-5 h-5 text-blue-600" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'contact':
        return <Phone className="w-5 h-5 text-purple-600" />;
      default:
        return <Mail className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => onNavigate('candidate-dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Actions</h1>
          <p className="text-gray-600">Track how recruiters interact with your profile</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading recruiter actions...</p>
            </div>
          ) : actions.length > 0 ? (
            <div className="divide-y">
              {actions.map((action) => (
                <div key={action.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getActionIcon(action.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {action.recruiter}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(action.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600">{action.company}</p>
                      <p className="text-sm text-gray-700 mt-1">{action.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recruiter actions yet</h3>
              <p className="text-gray-600 mb-4">
                Complete your profile to start getting attention from recruiters
              </p>
              <button
                onClick={() => onNavigate('candidate-profile')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Complete Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterActionsPage;