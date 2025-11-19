import React, { useState } from 'react';
import { FileText, Star, Circle, Square, User, Briefcase, Shield } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface ResumeTemplatesPageProps {
  onNavigate?: (page: string) => void;
  user?: {name: string, type: 'candidate' | 'employer'} | null;
  onLogout?: () => void;
}

const ResumeTemplatesPage: React.FC<ResumeTemplatesPageProps> = ({ onNavigate, user, onLogout }) => {
  const [selectedCategory, setSelectedCategory] = useState('All Templates');

  const handleTemplateSelect = (template: any) => {
    // Set template in store and navigate to complete builder
    if (template.isBlank) {
      onNavigate?.('complete-resume-builder');
    } else {
      onNavigate?.('complete-resume-builder');
    }
  };

  const categories = [
    { id: 'all', name: 'All Templates', icon: FileText },
    { id: 'uploaded', name: 'Uploaded', icon: User },
    { id: 'simple', name: 'Simple', icon: Star },
    { id: 'modern', name: 'Modern', icon: Circle },
    { id: 'onecolumn', name: 'One column', icon: Square },
    { id: 'withphoto', name: 'With photo', icon: User },
    { id: 'professional', name: 'Professional', icon: Briefcase },
    { id: 'ats', name: 'ATS', icon: Shield }
  ];

  const templates = [
    {
      id: 1,
      name: 'Resume Template',
      category: 'professional',
      image: '/images/resume_templates/resume1.jpg',
      description: 'Professional resume template'
    }
  ];

  const filteredTemplates = selectedCategory === 'All Templates' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory.toLowerCase().replace(' ', ''));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} user={user} onLogout={onLogout} />
      
      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <span className="text-blue-500 font-medium">Choose template</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <span className="text-gray-400">Enter your details</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">3</div>
              <span className="text-gray-400">Download resume</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Resume templates</h1>
          <p className="text-xl text-gray-600 mb-2">
            Simple to use and ready in minutes resume templates — give it a try for free now!
          </p>
          <button className="text-blue-500 hover:text-blue-600 font-medium">
            Choose later
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 border-b">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-t-lg font-medium transition-colors ${
                  selectedCategory === category.name
                    ? 'text-blue-500 border-b-2 border-blue-500 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="relative group">
                <div className="aspect-[3/4] bg-gray-50 p-1">
                  <div className="w-full h-full bg-white rounded shadow-sm overflow-hidden">
                    <img 
                      src={template.image} 
                      alt={template.name} 
                      className="w-full h-full object-contain bg-white"
                    />
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                  <button 
                    onClick={() => handleTemplateSelect(template)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 text-sm"
                  >
                    Use This Template
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">{template.name}</h3>
                <p className="text-xs text-gray-600">{template.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
            Load More Templates
          </button>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default ResumeTemplatesPage;