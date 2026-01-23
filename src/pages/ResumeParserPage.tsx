import React from 'react';
import ResumeParserComponent from '../components/resume-parser/page';
import Header from '../components/Header';

interface ResumeParserPageProps {
  onNavigate: (page: string) => void;
  user?: any;
  onLogout?: () => void;
}

const ResumeParserPage: React.FC<ResumeParserPageProps> = ({ onNavigate, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} user={user} onLogout={onLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ResumeParserComponent onNavigate={onNavigate} user={user} />
      </div>
    </div>
  );
};

export default ResumeParserPage;