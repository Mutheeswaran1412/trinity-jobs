import React from 'react';
import useResumeStore from '../store/useResumeStore';
import ModernTemplate from './templates/ModernTemplate';
import SimpleTemplate from './templates/SimpleTemplate';
import ProfessionalTemplate from './templates/ProfessionalTemplate';

const ResumePreview = () => {
  const { resumeData, selectedTemplate, resumeScore } = useResumeStore();

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'simple':
        return <SimpleTemplate data={resumeData} />;
      case 'professional':
        return <ProfessionalTemplate data={resumeData} />;
      default:
        return <ModernTemplate data={resumeData} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Resume Preview</h3>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-600">Resume Score:</div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            resumeScore >= 80 ? 'bg-green-100 text-green-800' :
            resumeScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {resumeScore}%
          </div>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-white p-6 min-h-[600px] transform scale-75 origin-top-left w-[133%]">
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;