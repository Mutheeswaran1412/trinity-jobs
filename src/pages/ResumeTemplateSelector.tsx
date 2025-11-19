import React, { useState } from 'react';
import { colors, sampleResumeData, ResumeData } from '../types/resume';
import CleanBlueTemplate from '../components/templates/CleanBlueTemplate';
import DarkProfessionalTemplate from '../components/templates/DarkProfessionalTemplate';
import ModernMinimalistTemplate from '../components/templates/ModernMinimalistTemplate';
import ATSOptimizedTemplate from '../components/templates/ATSOptimizedTemplate';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { downloadResumeAsPDF } from '../utils/pdfExport';
import { Download } from 'lucide-react';

interface ResumeTemplateSelectorProps {
  onNavigate?: (page: string, data?: any) => void;
  user?: {name: string, type: 'candidate' | 'employer'} | null;
  onLogout?: () => void;
  resumeData?: ResumeData;
}

const ResumeTemplateSelector: React.FC<ResumeTemplateSelectorProps> = ({ 
  onNavigate, 
  user, 
  onLogout, 
  resumeData = sampleResumeData 
}) => {
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [selectedTemplate, setSelectedTemplate] = useState(0);

  const templates = [
    { name: 'ATS Optimized', component: ATSOptimizedTemplate, preview: 'ATS-friendly format for job applications' },
    { name: 'Clean Blue', component: CleanBlueTemplate, preview: 'Professional and clean design' },
    { name: 'Dark Professional', component: DarkProfessionalTemplate, preview: 'Modern dark theme with sidebar' },
    { name: 'Modern Minimalist', component: ModernMinimalistTemplate, preview: 'Clean and minimalist layout' }
  ];

  const SelectedTemplateComponent = templates[selectedTemplate].component;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Resume Template</h1>
          <p className="text-gray-600">Select a template and customize the color to match your style</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Templates</h2>
              <div className="space-y-3">
                {templates.map((template, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedTemplate(index)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTemplate === index 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.preview}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-semibold mt-6 mb-4">Color Theme</h2>
              <div className="grid grid-cols-4 gap-3">
                {colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-lg border-4 transition-all ${
                      selectedColor === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="space-y-3 mt-6">
                <button
                  onClick={() => onNavigate && onNavigate('ai-resume-builder', { 
                    selectedTemplate: selectedTemplate,
                    selectedColor: selectedColor 
                  })}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Use This Template
                </button>
                
                <button
                  onClick={async () => {
                    console.log('Download button clicked');
                    const success = await downloadResumeAsPDF('resume-preview', `SyncJobs-${templates[selectedTemplate].name}-Resume`);
                    if (success) {
                      alert('Resume downloaded successfully!');
                    }
                  }}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              <div className="overflow-auto max-h-[800px]">
                <div className="transform scale-75 origin-top-left">
                  <div id="resume-preview">
                    <SelectedTemplateComponent data={resumeData} color={selectedColor} />
                  </div>
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

export default ResumeTemplateSelector;