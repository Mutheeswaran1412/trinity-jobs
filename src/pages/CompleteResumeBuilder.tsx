import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Download } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StepTabs from '../components/StepTabs';
import ResumePreview from '../components/ResumePreview';
import ContactStep from '../components/steps/ContactStep';
import SummaryStep from '../components/steps/SummaryStep';
import LiveTemplate from '../components/templates/LiveTemplate';
import useResumeStore from '../store/useResumeStore';

interface CompleteResumeBuilderProps {
  onNavigate?: (page: string) => void;
  user?: {name: string, type: 'candidate' | 'employer'} | null;
  onLogout?: () => void;
  selectedTemplate?: any;
}

const CompleteResumeBuilder: React.FC<CompleteResumeBuilderProps> = ({ onNavigate, user, onLogout, selectedTemplate: templateData }) => {
  const { 
    currentStep, 
    setCurrentStep, 
    selectedTemplate, 
    resumeData,
    calculateResumeScore 
  } = useResumeStore();

  useEffect(() => {
    calculateResumeScore();
  }, [resumeData, calculateResumeScore]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <ContactStep />;
      case 1:
        return <ExperienceStep />;
      case 2:
        return <EducationStep />;
      case 3:
        return <SkillsStep />;
      case 4:
        return <SummaryStep />;
      case 5:
        return <FinalizeStep onNavigate={onNavigate} />;
      default:
        return <ContactStep />;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return resumeData.personalInfo.name && resumeData.personalInfo.email;
      case 4:
        return resumeData.summary && resumeData.summary.length > 20;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => onNavigate?.('resume-templates')}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Templates
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Resume Builder - {templateData?.name || 'Modern Template'}
          </h1>
        </div>

        <StepTabs />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            {renderCurrentStep()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>
              
              {currentStep < 5 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={() => window.print()}
                  className="flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Resume Preview</h3>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-white min-h-[600px] transform scale-75 origin-top-left w-[133%]">
                  <LiveTemplate data={resumeData} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

// Placeholder components for missing steps
const ExperienceStep = () => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Work Experience</h2>
    <p className="text-gray-600">Experience step coming soon...</p>
  </div>
);

const EducationStep = () => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Education</h2>
    <p className="text-gray-600">Education step coming soon...</p>
  </div>
);

const SkillsStep = () => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills</h2>
    <p className="text-gray-600">Skills step coming soon...</p>
  </div>
);

const FinalizeStep = ({ onNavigate }) => (
  <div className="bg-white rounded-lg shadow-lg p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Finalize Resume</h2>
    <div className="space-y-4">
      <p className="text-gray-600">Your resume is ready! You can:</p>
      <div className="space-y-2">
        <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">
          Download as PDF
        </button>
        <button className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600">
          Share Resume Link
        </button>
        <button 
          onClick={() => onNavigate?.('resume-templates')}
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50"
        >
          Try Different Template
        </button>
      </div>
    </div>
  </div>
);

export default CompleteResumeBuilder;