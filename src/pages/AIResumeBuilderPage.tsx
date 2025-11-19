import React, { useState } from 'react';
import { Sparkles, Download, Save, ArrowLeft, Eye, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { aiResumeService, ResumeData, AIResumeRequest } from '../services/aiResumeService';
import { downloadResumeAsPDF } from '../utils/pdfExport';
import ATSOptimizedTemplate from '../components/templates/ATSOptimizedTemplate';
import { ResumeData as TemplateResumeData } from '../types/resume';

interface AIResumeBuilderPageProps {
  onNavigate?: (page: string) => void;
  user?: {name: string, type: 'candidate' | 'employer'} | null;
  onLogout?: () => void;
  selectedTemplate?: any;
}

const AIResumeBuilderPage: React.FC<AIResumeBuilderPageProps> = ({ onNavigate, user, onLogout, selectedTemplate }) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [suggestions, setSuggestions] = useState<{[key: string]: string[]}>({});
  const [showSuggestions, setShowSuggestions] = useState<{[key: string]: boolean}>({});
  
  const [formData, setFormData] = useState<AIResumeRequest>({
    jobTitle: '',
    industry: '',
    experienceLevel: 'mid',
    skills: [],
    personalInfo: {
      name: user?.name || '',
      email: '',
      phone: '',
      location: ''
    },
    education: {
      degree: '',
      institution: '',
      year: '',
      gpa: ''
    }
  });

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
    'Sales', 'Engineering', 'Design', 'Operations', 'Consulting'
  ];

  const skillSuggestions = {
    'Software Engineer': ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git'],
    'Data Analyst': ['Python', 'SQL', 'Excel', 'Tableau', 'Power BI', 'Statistics'],
    'Marketing Manager': ['Digital Marketing', 'SEO', 'Google Analytics', 'Social Media', 'Content Strategy'],
    'Project Manager': ['Agile', 'Scrum', 'JIRA', 'Risk Management', 'Stakeholder Management'],
    'Designer': ['Figma', 'Adobe Creative Suite', 'UI/UX', 'Prototyping', 'User Research']
  };

  const handleGenerateResume = async () => {
    setIsGenerating(true);
    try {
      // Create smart prompt from form data
      const smartPrompt = `${formData.jobTitle} with ${formData.experienceLevel} experience in ${(formData.skills || []).join(', ')}, ${formData.industry} industry, ${formData.personalInfo?.name || 'Professional'}, email: ${formData.personalInfo?.email}, phone: ${formData.personalInfo?.phone}, location: ${formData.personalInfo?.location}, education: ${formData.education?.degree} from ${formData.education?.institution} graduated ${formData.education?.year} with ${formData.education?.gpa} GPA`;
      
      const response = await fetch('http://localhost:5000/api/smart-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: smartPrompt })
      });
      const data = await response.json();
      if (data.success) {
        setResumeData(data.resume);
        setStep(3);
      }
    } catch (error) {
      console.error('Smart resume generation failed:', error);
    }
    setIsGenerating(false);
  };

  const handleSkillToggle = (skill: string) => {
    const currentSkills = formData.skills || [];
    const updatedSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    
    setFormData(prev => ({ ...prev, skills: updatedSkills }));
  };

  const getSuggestedSkills = () => {
    const jobTitle = formData.jobTitle;
    for (const [key, skills] of Object.entries(skillSuggestions)) {
      if (jobTitle.toLowerCase().includes(key.toLowerCase())) {
        return skills;
      }
    }
    return ['Communication', 'Problem Solving', 'Team Work', 'Leadership', 'Time Management'];
  };

  const convertToTemplateFormat = (data: ResumeData): TemplateResumeData => {
    return {
      name: data.personalInfo.name,
      title: formData.jobTitle,
      contact: {
        phone: data.personalInfo.phone || '',
        email: data.personalInfo.email,
        address: data.personalInfo.location || ''
      },
      summary: data.summary,
      skills: data.skills,
      experience: data.experience.map(exp => ({
        role: exp.position,
        company: exp.company,
        location: '',
        start_date: exp.duration.split(' - ')[0] || '',
        end_date: exp.duration.split(' - ')[1] || 'Present',
        points: exp.description
      })),
      education: formData.education?.degree ? [{
        degree: formData.education.degree,
        year: formData.education.year || 'Present',
        institute: formData.education.institution || 'University'
      }] : data.education.map(edu => ({
        degree: edu.degree,
        year: edu.year,
        institute: edu.institution
      })),
      profilePic: '/images/profiles/default-avatar.jpg'
    };
  };

  const getAISuggestions = async (type: string, input: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, input })
      });
      const data = await response.json();
      const suggestionList = data.suggestions || [];
      setSuggestions(prev => ({ ...prev, [type]: suggestionList }));
      setShowSuggestions(prev => ({ ...prev, [type]: suggestionList.length > 0 }));
      return suggestionList;
    } catch (error) {
      console.error('AI suggestions error:', error);
      return [];
    }
  };

  const parseEducation = async (text: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/parse-education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const result = await response.json();
      if (result.success && result.data) {
        const edu = result.data;
        setFormData(prev => ({
          ...prev,
          education: {
            degree: edu.degree || '',
            institution: edu.institution || '',
            year: edu.graduation_year || '',
            gpa: edu.gpa_percentage || '',
            field: edu.field_of_study || '',
            location: edu.location || ''
          }
        }));
        // Show suggestions as toast
        if (edu.suggestions && edu.suggestions.length > 0) {
          alert(`✅ Education parsed!\n\nSuggestions:\n${edu.suggestions.join('\n')}`);
        }
      }
    } catch (error) {
      console.error('Education parsing error:', error);
    }
  };

  const getCollegeInfo = async (collegeName: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'college_info', input: collegeName })
      });
      const data = await response.json();
      if (data.success) {
        // Auto-fill degree suggestions
        setSuggestions(prev => ({ ...prev, degree: data.degrees || [] }));
        // Auto-suggest year and GPA
        if (data.years && data.years.length > 0) {
          setFormData(prev => ({ 
            ...prev, 
            education: { 
              ...prev.education, 
              year: data.years[0] // Use most recent year
            }
          }));
        }
        if (data.gpa && data.gpa.length > 0) {
          setFormData(prev => ({ 
            ...prev, 
            education: { 
              ...prev.education, 
              gpa: data.gpa[1] // Use higher GPA range
            }
          }));
        }
      }
    } catch (error) {
      console.error('College info error:', error);
    }
  };

  const selectSuggestion = (type: string, value: string) => {
    if (type === 'job_title') {
      setFormData(prev => ({ ...prev, jobTitle: value }));
    } else if (type === 'degree') {
      setFormData(prev => ({ ...prev, education: { ...prev.education, degree: value } }));
    } else if (type === 'college') {
      setFormData(prev => ({ ...prev, education: { ...prev.education, institution: value } }));
      // Auto-fill related college info
      getCollegeInfo(value);
    } else if (type === 'industry') {
      setFormData(prev => ({ ...prev, industry: value }));
    } else if (type === 'year') {
      setFormData(prev => ({ ...prev, education: { ...prev.education, year: value } }));
    } else if (type === 'gpa') {
      setFormData(prev => ({ ...prev, education: { ...prev.education, gpa: value } }));
    }
    setShowSuggestions(prev => ({ ...prev, [type]: false }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} user={user} onLogout={onLogout} />
      
      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center text-sm font-medium`}>1</div>
              <span className={step >= 1 ? 'text-blue-500 font-medium' : 'text-gray-400'}>Job Details</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center text-sm font-medium`}>2</div>
              <span className={step >= 2 ? 'text-blue-500 font-medium' : 'text-gray-400'}>Skills & Info</span>
            </div>
            <div className="w-16 h-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 ${step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center text-sm font-medium`}>3</div>
              <span className={step >= 3 ? 'text-blue-500 font-medium' : 'text-gray-400'}>AI Generated Resume</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <button onClick={() => onNavigate?.('resume-templates')} className="mr-4" title="Back to templates">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Tell us about your target job</h2>
            </div>
            
            <div className="space-y-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={async (e) => {
                    setFormData(prev => ({ ...prev, jobTitle: e.target.value }));
                    if (e.target.value.length > 2) {
                      await getAISuggestions('job_title', e.target.value);
                    } else {
                      setShowSuggestions(prev => ({ ...prev, job_title: false }));
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, job_title: false })), 200)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Software Engineer, Marketing Manager"
                />
                {showSuggestions.job_title && suggestions.job_title && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {suggestions.job_title.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onMouseDown={() => selectSuggestion('job_title', suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={async (e) => {
                    setFormData(prev => ({ ...prev, industry: e.target.value }));
                    if (e.target.value.length > 2) {
                      await getAISuggestions('industry', e.target.value);
                    } else {
                      setShowSuggestions(prev => ({ ...prev, industry: false }));
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, industry: false })), 200)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Technology, Healthcare, Finance"
                />
                {showSuggestions.industry && suggestions.industry && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {suggestions.industry.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onMouseDown={() => selectSuggestion('industry', suggestion)}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm border-b border-gray-100 last:border-b-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: 'entry', label: 'Entry Level (0-2 years)' },
                    { value: 'mid', label: 'Mid Level (3-5 years)' },
                    { value: 'senior', label: 'Senior (6-10 years)' },
                    { value: 'executive', label: 'Executive (10+ years)' }
                  ].map(level => (
                    <button
                      key={level.value}
                      onClick={() => setFormData(prev => ({ ...prev, experienceLevel: level.value as any }))}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        formData.experienceLevel === level.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.jobTitle || !formData.industry}
                  className="bg-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Add Skills
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add your skills and contact info</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Your Skills</label>
                <p className="text-sm text-gray-500 mb-4">Choose skills relevant to your target job</p>
                <div className="flex flex-wrap gap-2">
                  {getSuggestedSkills().map(skill => (
                    <button
                      key={skill}
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        formData.skills?.includes(skill)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.personalInfo?.email || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      personalInfo: { ...prev.personalInfo, email: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.personalInfo?.phone || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      personalInfo: { ...prev.personalInfo, phone: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.personalInfo?.location || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      personalInfo: { ...prev.personalInfo, location: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City, State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={formData.personalInfo?.linkedin || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="linkedin.com/in/yourprofile"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="block text-xs font-medium text-blue-700 mb-1">🤖 Smart Parser - Type anything about your education</label>
                  <input
                    type="text"
                    placeholder="e.g., BE CSE loyola 23 8.7 CGPA or Bachelor Computer Science MIT 2023"
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        const text = e.currentTarget.value;
                        if (text.length > 5) {
                          await parseEducation(text);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-blue-600 mt-1">Press Enter to auto-fill all fields below</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Degree/Course</label>
                    <input
                      type="text"
                      value={formData.education?.degree || ''}
                      onChange={async (e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          education: { ...prev.education, degree: e.target.value }
                        }));
                        if (e.target.value.length > 2) {
                          await getAISuggestions('degree', e.target.value);
                        } else {
                          setShowSuggestions(prev => ({ ...prev, degree: false }));
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, degree: false })), 200)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="e.g., Bachelor of Engineering"
                    />
                    {showSuggestions.degree && suggestions.degree && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                        {suggestions.degree.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onMouseDown={() => selectSuggestion('degree', suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 text-xs border-b border-gray-100 last:border-b-0"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-600 mb-1">School/College</label>
                    <input
                      type="text"
                      value={formData.education?.institution || ''}
                      onChange={async (e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          education: { ...prev.education, institution: e.target.value }
                        }));
                        if (e.target.value.length > 2) {
                          await getAISuggestions('college', e.target.value);
                        } else {
                          setShowSuggestions(prev => ({ ...prev, college: false }));
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, college: false })), 200)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="e.g., MIT, Harvard University"
                    />
                    {showSuggestions.college && suggestions.college && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                        {suggestions.college.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onMouseDown={() => selectSuggestion('college', suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 text-xs border-b border-gray-100 last:border-b-0"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Year of Graduation</label>
                    <input
                      type="text"
                      value={formData.education?.year || ''}
                      onChange={async (e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          education: { ...prev.education, year: e.target.value }
                        }));
                        if (e.target.value.length >= 4) {
                          await getAISuggestions('year', e.target.value);
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, year: false })), 200)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="e.g., 2023"
                    />
                    {showSuggestions.year && suggestions.year && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                        {suggestions.year.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onMouseDown={() => selectSuggestion('year', suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 text-xs border-b border-gray-100 last:border-b-0"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-600 mb-1">GPA/Percentage (Optional)</label>
                    <input
                      type="text"
                      value={formData.education?.gpa || ''}
                      onChange={async (e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          education: { ...prev.education, gpa: e.target.value }
                        }));
                        if (e.target.value.length > 1) {
                          await getAISuggestions('gpa', e.target.value);
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, gpa: false })), 200)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="e.g., 3.8/4.0 or 85%"
                    />
                    {showSuggestions.gpa && suggestions.gpa && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                        {suggestions.gpa.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onMouseDown={() => selectSuggestion('gpa', suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 text-xs border-b border-gray-100 last:border-b-0"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerateResume}
                  disabled={isGenerating || !formData.personalInfo?.email}
                  className="bg-blue-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  {isGenerating ? 'Generating...' : 'Generate AI Resume'}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && resumeData && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your AI Generated Resume</h2>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={() => setShowPreview(true)}
                    className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-600 flex items-center gap-2 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 flex items-center gap-2 font-medium">
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button 
                    onClick={async () => {
                      const templateData = convertToTemplateFormat(resumeData);
                      const success = await downloadResumeAsPDF('ai-resume-preview', 'SyncJobs-AI-Generated-Resume');
                      if (success) {
                        alert('Resume downloaded successfully!');
                      }
                    }}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 flex items-center gap-2 font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                <div className="bg-white p-6 rounded shadow-sm">
                  {/* ATS-Optimized Resume Preview */}
                  <div className="text-center border-b-2 border-gray-300 pb-4 mb-4">
                    <h1 className="text-xl font-bold text-gray-900 mb-1">{resumeData.personalInfo.name}</h1>
                    <h2 className="text-sm text-gray-700 mb-2">{formData.jobTitle}</h2>
                    <div className="text-xs text-gray-600">
                      {resumeData.personalInfo.phone} | {resumeData.personalInfo.email} | {resumeData.personalInfo.location}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">PROFESSIONAL SUMMARY</h3>
                      <p className="text-gray-700 text-xs leading-relaxed">{resumeData.summary}</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">CORE COMPETENCIES</h3>
                      <div className="grid grid-cols-2 gap-1">
                        {resumeData.skills.slice(0, 8).map((skill, index) => (
                          <div key={index} className="text-xs text-gray-700">• {skill}</div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">PROFESSIONAL EXPERIENCE</h3>
                      {resumeData.experience.map((exp, index) => (
                        <div key={index} className="mb-3">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="font-bold text-gray-900 text-xs">{exp.position}</p>
                              <p className="text-gray-700 text-xs font-medium">{exp.company}</p>
                            </div>
                            <p className="text-gray-600 text-xs">{exp.duration}</p>
                          </div>
                          <ul className="list-none space-y-1">
                            {exp.description.slice(0, 3).map((point, i) => (
                              <li key={i} className="text-xs text-gray-700 flex items-start">
                                <span className="mr-1">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-sm uppercase tracking-wide">EDUCATION</h3>
                      {resumeData.education.map((edu, index) => (
                        <div key={index} className="mb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-900 text-xs">{edu.degree}</p>
                              <p className="text-gray-700 text-xs">{edu.institution}</p>
                            </div>
                            <p className="text-gray-600 text-xs">{edu.year}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Customize Your Resume</h3>
              <div className="space-y-4">
                <button
                  onClick={() => setStep(2)}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all"
                >
                  <div className="font-semibold text-gray-900">Edit Skills & Contact Info</div>
                  <div className="text-sm text-gray-500 mt-1">Update your skills and personal information</div>
                </button>
                
                <button
                  onClick={() => setStep(1)}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all"
                >
                  <div className="font-semibold text-gray-900">Change Job Target</div>
                  <div className="text-sm text-gray-500 mt-1">Update job title, industry, or experience level</div>
                </button>

                <button
                  onClick={() => onNavigate?.('resume-templates')}
                  className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all"
                >
                  <div className="font-semibold text-gray-900">Try Different Template</div>
                  <div className="text-sm text-gray-500 mt-1">Choose a different resume design</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer onNavigate={onNavigate} />
      
      {/* Preview Modal */}
      {showPreview && resumeData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Resume Preview</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={async () => {
                    const templateData = convertToTemplateFormat(resumeData);
                    const success = await downloadResumeAsPDF('ai-resume-preview', 'SyncJobs-AI-Generated-Resume');
                    if (success) {
                      alert('Resume downloaded successfully!');
                    }
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Close preview"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[80vh]">
              <div id="ai-resume-preview" className="transform scale-75 origin-top-left">
                <ATSOptimizedTemplate data={convertToTemplateFormat(resumeData)} color="#000000" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIResumeBuilderPage;