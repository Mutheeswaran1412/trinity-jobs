import React from 'react';
import ResumeParserComponent from '../components/resume-parser/page';

interface ResumeParserPageProps {
  onNavigate: (page: string) => void;
}

const ResumeParserPage: React.FC<ResumeParserPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('candidate-dashboard')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Dashboard
        </button>
        <ResumeParserComponent onNavigate={onNavigate} />
      </div>
    </div>
  );
};

export default ResumeParserPage;