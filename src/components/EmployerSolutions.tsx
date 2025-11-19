import React from 'react';
import { Zap, Users, Target, ArrowRight } from 'lucide-react';

interface EmployerSolutionsProps {
  onNavigate?: (page: string) => void;
}

const EmployerSolutions: React.FC<EmployerSolutionsProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: Zap,
      title: "AI-Powered Matching",
      description: "Our advanced algorithms connect you with the perfect candidates"
    },
    {
      icon: Users,
      title: "7M+ Tech Professionals",
      description: "Access the largest pool of qualified tech talent"
    },
    {
      icon: Target,
      title: "Precise Targeting",
      description: "Find candidates with exact skills and experience you need"
    }
  ];

  return (
    <section className="py-20" style={{backgroundColor: '#0C1015'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <img
              src="/images/Find and Hire Top Tech Talent.png"
              alt="Find and Hire Top Tech Talent"
              className="w-full h-auto"
            />
          </div>
          
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Find and Hire Top Tech Talent
            </h2>
            <p className="text-xl text-white mb-8 leading-relaxed">
              With access to millions of tech professionals and AI-powered matching tools, ZyncJobs makes hiring fast, effective, and efficient.
            </p>
            
            <div className="space-y-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-white">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onNavigate && onNavigate('candidate-search')}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Hire tech talent</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => onNavigate && onNavigate('job-posting')}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Post a job</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};



export default EmployerSolutions;