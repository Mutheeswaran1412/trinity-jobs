import React from 'react';
import { Filter, Target, TrendingUp, ArrowRight } from 'lucide-react';

interface TechProfessionalsProps {
  onNavigate?: (page: string) => void;
  user?: {name: string, type: 'candidate' | 'employer'} | null;
}

const TechProfessionals: React.FC<TechProfessionalsProps> = ({ onNavigate, user }) => {
  const features = [
    {
      icon: Filter,
      title: "Smart Filtering",
      description: "Filter jobs by skills, experience level, salary range, and company culture"
    },
    {
      icon: Target,
      title: "Precise Matching", 
      description: "Our AI matches your profile with the most relevant opportunities"
    },
    {
      icon: TrendingUp,
      title: "Career Growth",
      description: "Track your career progress and discover advancement opportunities"
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden" style={{backgroundColor: '#EAF1FB'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Find the Right Tech Role, Your Way
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              ZyncJobs enables you to instantly filter jobs by skills, experience, and career goals—so you can confidently choose your next opportunity.
            </p>
            
            <div className="space-y-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => {
                if (onNavigate) {
                  if (user?.type === 'candidate') {
                    onNavigate('candidate-profile');
                  } else if (user?.type === 'employer') {
                    onNavigate('company-profile');
                  } else {
                    onNavigate('register');
                  }
                }
              }}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>Create your free profile</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative flex justify-center">
            <img
              src="/images/Find the Right Tech Role.png"
              alt="Find the Right Tech Role"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechProfessionals;