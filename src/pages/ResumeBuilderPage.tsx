import React, { useState } from 'react';
import { FileText, Sparkles, Download, Save, Eye } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface ResumeBuilderPageProps {
  onNavigate?: (page: string) => void;
  user?: {name: string, type: 'candidate' | 'employer'} | null;
  onLogout?: () => void;
}

interface ResumeData {
  jobTitle: string;
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    description: string;
    duration: string;
  }>;
  education: Array<{
    college: string;
    degree: string;
    year: string;
  }>;
}

const ResumeBuilderPage: React.FC<ResumeBuilderPageProps> = ({ onNavigate, user, onLogout }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
    jobTitle: '',
    summary: '',
    skills: [],
    experience: [],
    education: []
  });
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const templates = [
    { id: 'modern', name: 'Modern', preview: 'Clean and professional' },
    { id: 'classic', name: 'Classic', preview: 'Traditional format' },
    { id: 'creative', name: 'Creative', preview: 'Stand out design' }
  ];

  const getContentSuggestions = (jobTitle: string) => {
    const suggestionMap: { [key: string]: string[] } = {
      'data analyst': [
        'Analyzed large datasets to identify trends and insights',
        'Created interactive dashboards using Power BI/Tableau',
        'Improved data processing efficiency by 30%'
      ],
      'software engineer': [
        'Developed scalable web applications using React/Node.js',
        'Implemented CI/CD pipelines reducing deployment time',
        'Collaborated with cross-functional teams on product features'
      ],
      'default': [
        'Led cross-functional teams to achieve project goals',
        'Improved operational efficiency through process optimization',
        'Delivered high-quality results within tight deadlines'
      ]
    };
    return suggestionMap[jobTitle.toLowerCase()] || suggestionMap['default'];
  };

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: resumeData.jobTitle,
          skills: resumeData.skills
        })
      });
      const data = await response.json();
      setResumeData(prev => ({ ...prev, summary: data.summary }));
    } catch (error) {
      console.error('Error generating summary:', error);
    }
    setIsGenerating(false);
  };

  const saveResume = async () => {
    try {
      await fetch('http://localhost:5000/api/save-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.name || 'guest',
          resume_data: resumeData
        })
      });
      alert('Resume saved successfully!');
    } catch (error) {
      console.error('Error saving resume:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header onNavigate={onNavigate} user={user} onLogout={onLogout} />
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              48,933 resumes created today
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Your <span className="text-blue-500">professional AI resume</span>, ready in minutes
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Our AI resume builder saves your time with smart content suggestions and impactful summaries. Get hired faster, stress-free!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onNavigate?.('resume-templates')}
                className="bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors text-lg"
              >
                Create AI Resume Now
              </button>
              <button 
                onClick={() => onNavigate?.('resume-templates')}
                className="border-2 border-blue-500 text-blue-500 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
              >
                Improve My Resume
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8">
              <div>
                <div className="text-4xl font-bold text-green-500 mb-2">48%</div>
                <p className="text-gray-600">more likely to get hired</p>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-500 mb-2">12%</div>
                <p className="text-gray-600">better pay with your next job</p>
              </div>
            </div>
          </div>

          {/* Right Content - Resume Preview */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="text-right mb-4">
                <span className="text-sm text-gray-500">Senior Analyst</span>
              </div>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Samantha Williams</h2>
                <p className="text-gray-600">New York, 10001</p>
                <p className="text-sm text-gray-500">📧 LinkedIn: samantha.williams@example.com 📞 (555) 789-1234</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">SUMMARY</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Senior Analyst with 5+ years of experience in data analytics, business intelligence, and process optimization. Skilled in advanced statistical analysis, forecasting, and leading data-driven strategies to support business growth and operational excellence. Strong communication and analytical skills.
                </p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">EXPERIENCE</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">Jul 2021 - Current</p>
                        <p className="text-sm text-gray-600">Sr. CA - New York, NY</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      Advised and reporting for key business functions, identifying trends and providing insights to optimize performance and profitability.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">EDUCATION</h3>
                <p className="text-sm text-gray-700">New York University - New York, NY | Bachelor of Science</p>
                <p className="text-sm text-gray-600">Economics, 2017</p>
              </div>
            </div>
            
            {/* AI Badge */}
            <div 
              onClick={() => onNavigate?.('resume-templates')}
              className="absolute -bottom-4 -right-4 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 cursor-pointer hover:bg-blue-600 transition-colors"
            >
              <Sparkles className="w-5 h-5" />
              Generate with AI
            </div>
            

          </div>
        </div>
      </div>



      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default ResumeBuilderPage;