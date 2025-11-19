import React, { useState, useEffect } from 'react';
import { FileText, Star, Circle, Square, User, Briefcase, Shield, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { canvaService, CanvaTemplate } from '../services/canvaService';

interface CanvaResumeTemplatesProps {
  onNavigate?: (page: string, data?: any) => void;
  user?: {name: string, type: 'candidate' | 'employer'} | null;
  onLogout?: () => void;
}

const CanvaResumeTemplates: React.FC<CanvaResumeTemplatesProps> = ({ onNavigate, user, onLogout }) => {
  const [selectedCategory, setSelectedCategory] = useState('All Templates');
  const [templates, setTemplates] = useState<CanvaTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Templates', icon: FileText },
    { id: 'simple', name: 'Simple', icon: Star },
    { id: 'modern', name: 'Modern', icon: Circle },
    { id: 'onecolumn', name: 'One column', icon: Square },
    { id: 'withphoto', name: 'With photo', icon: User },
    { id: 'professional', name: 'Professional', icon: Briefcase },
    { id: 'ats', name: 'ATS', icon: Shield }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const uploadedTemplate: CanvaTemplate = {
        id: 'uploaded-1',
        name: 'Resume Template',
        category: 'professional',
        thumbnail: '/images/resume_templates/resume1.jpg',
        description: 'Professional resume template',
        preview_url: ''
      };
      setTemplates([uploadedTemplate]);
    } catch (err) {
      setError('Failed to load templates');
      console.error('Template loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: CanvaTemplate) => {
    onNavigate?.('complete-resume-builder', { selectedTemplate: template });
  };

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

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Resume templates</h1>
          <p className="text-xl text-gray-600 mb-2">
            Professional resume templates powered by Canva — ready in minutes!
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="text-blue-500 hover:text-blue-600 font-medium">
              Choose later
            </button>
            <button 
              onClick={loadTemplates}
              disabled={loading}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Templates
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error} - Showing fallback templates
            </div>
          )}
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading templates from Canva...</p>
          </div>
        )}

        {/* Templates Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="relative group">
                  <div className="aspect-[3/4] bg-gray-50 overflow-hidden">
                    <img 
                      src={template.thumbnail} 
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
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
        )}

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button 
            onClick={loadTemplates}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Load More Templates
          </button>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default CanvaResumeTemplates;