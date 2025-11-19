import React from 'react';

interface ResumeData {
  personalInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  summary?: string;
  experience?: Array<{
    title?: string;
    company?: string;
    duration?: string;
    description?: string;
  }>;
  education?: Array<{
    degree?: string;
    school?: string;
    year?: string;
  }>;
  skills?: string[];
}

interface ModernTemplateProps {
  data: ResumeData;
}

const ModernTemplate: React.FC<ModernTemplateProps> = ({ data }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <h1 className="text-3xl font-bold">{data.personalInfo?.fullName || 'Your Name'}</h1>
        <div className="mt-2 space-y-1">
          <p>{data.personalInfo?.email || 'email@example.com'}</p>
          <p>{data.personalInfo?.phone || '+1 (555) 123-4567'}</p>
          <p>{data.personalInfo?.address || 'City, State'}</p>
        </div>
      </div>

      <div className="p-6">
        {/* Summary */}
        {data.summary && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-600 border-b-2 border-blue-600 pb-2 mb-3">SUMMARY</h2>
            <p className="text-gray-700">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-600 border-b-2 border-blue-600 pb-2 mb-3">EXPERIENCE</h2>
            {data.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{exp.title || 'Job Title'}</h3>
                    <p className="text-blue-600 font-medium">{exp.company || 'Company Name'}</p>
                  </div>
                  <span className="text-gray-600">{exp.duration || 'Duration'}</span>
                </div>
                <p className="text-gray-700 mt-2">{exp.description || 'Job description...'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-blue-600 border-b-2 border-blue-600 pb-2 mb-3">EDUCATION</h2>
            {data.education.map((edu, index) => (
              <div key={index} className="mb-3">
                <h3 className="font-semibold">{edu.degree || 'Degree'}</h3>
                <p className="text-blue-600">{edu.school || 'School Name'}</p>
                <p className="text-gray-600">{edu.year || 'Year'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-blue-600 border-b-2 border-blue-600 pb-2 mb-3">SKILLS</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernTemplate;