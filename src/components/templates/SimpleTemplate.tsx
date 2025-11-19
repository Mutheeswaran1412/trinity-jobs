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

interface SimpleTemplateProps {
  data: ResumeData;
}

const SimpleTemplate: React.FC<SimpleTemplateProps> = ({ data }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-6">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{data.personalInfo?.fullName || 'Your Name'}</h1>
        <div className="mt-2 text-gray-600">
          <p>{data.personalInfo?.email || 'email@example.com'} | {data.personalInfo?.phone || '+1 (555) 123-4567'}</p>
          <p>{data.personalInfo?.address || 'City, State'}</p>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">SUMMARY</h2>
          <p className="text-gray-700">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">EXPERIENCE</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{exp.title || 'Job Title'}</h3>
                  <p className="text-gray-600">{exp.company || 'Company Name'}</p>
                </div>
                <span className="text-gray-500 text-sm">{exp.duration || 'Duration'}</span>
              </div>
              <p className="text-gray-700 mt-2">{exp.description || 'Job description...'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">EDUCATION</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <h3 className="font-semibold">{edu.degree || 'Degree'}</h3>
              <p className="text-gray-600">{edu.school || 'School Name'} | {edu.year || 'Year'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">SKILLS</h2>
          <p className="text-gray-700">{data.skills.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

export default SimpleTemplate;