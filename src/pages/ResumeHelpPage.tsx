import React from 'react';
import { ArrowLeft, FileText, Star, Eye, Download } from 'lucide-react';

interface ResumeHelpPageProps {
  onNavigate: (page: string) => void;
}

const ResumeHelpPage: React.FC<ResumeHelpPageProps> = ({ onNavigate }) => {
  const sections = [
    {
      icon: Star,
      title: "Professional Summary",
      description: "Write a compelling 2-3 line summary highlighting your key achievements and skills."
    },
    {
      icon: Eye,
      title: "ATS Optimization",
      description: "Use relevant keywords and simple formatting to pass Applicant Tracking Systems."
    },
    {
      icon: Download,
      title: "Format & Design",
      description: "Choose a clean, professional layout that's easy to read and scan quickly."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Resume Help 📄</h1>
          <p className="text-xl text-gray-600">
            Create a standout resume that gets you noticed by recruiters and hiring managers
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Resume Sections</h2>
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="bg-green-100 p-3 rounded-lg">
                  <section.icon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600">{section.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Resume Best Practices</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              Your resume is your first impression. Make it count with these proven strategies:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Keep it to 1-2 pages maximum</li>
              <li>Use action verbs and quantify achievements</li>
              <li>Tailor your resume for each job application</li>
              <li>Include relevant technical skills and certifications</li>
              <li>Proofread carefully for grammar and spelling errors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeHelpPage;