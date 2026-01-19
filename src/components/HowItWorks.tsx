import React from 'react';

interface HowItWorksProps {
  onNavigate?: (page: string) => void;
}

const HowItWorks: React.FC<HowItWorksProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h6 className="text-blue-600 font-semibold text-lg mb-2">How It Work</h6>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Follow Easy 4 Steps</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            It is a long established fact that a reader will be distracted by the 
            readable content of a page when looking at its layout.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: "🔍",
              title: "Search Jobs",
              description: "Browse thousands of job opportunities from top companies. Use filters to find jobs that match your skills and preferences.",
              page: "job-listings"
            },
            {
              icon: "📄",
              title: "CV/Resume",
              description: "Upload your resume or create one using our AI-powered resume builder. Showcase your skills and experience effectively.",
              page: "resume-templates"
            },
            {
              icon: "👤",
              title: "Create Account",
              description: "Sign up for free to save jobs, track applications, and get personalized job recommendations based on your profile.",
              page: "register"
            },
            {
              icon: "✅",
              title: "Apply Them",
              description: "Apply to jobs with one click. Track your application status and communicate directly with hiring managers.",
              page: "job-listings"
            }
          ].map((step, index) => (
            <div key={index} className="text-center cursor-pointer hover:transform hover:scale-105 transition-all duration-200" onClick={() => onNavigate && onNavigate(step.page)}>
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4 hover:bg-blue-700">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;