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

interface ProfessionalTemplateProps {
  data: ResumeData;
}

const ProfessionalTemplate: React.FC<ProfessionalTemplateProps> = ({ data }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white">
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-gray-800 text-white p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{data.personalInfo?.fullName || 'Your Name'}</h1>
          </div>

          {/* Contact */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 border-b border-gray-600 pb-2">CONTACT</h2>
            <div className="space-y-2 text-sm">
              <p>📧 {data.personalInfo?.email || 'email@example.com'}</p>
              <p>📞 {data.personalInfo?.phone || '+1 (555) 123-4567'}</p>
              <p>📍 {data.personalInfo?.address || 'City, State'}</p>
            </div>
          </div>

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3 border-b border-gray-600 pb-2">SKILLS</h2>
              <div className="space-y-2">
                {data.skills.map((skill, index) => (
                  <div key={index} className="text-sm">
                    <p>{skill}</p>
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                      <div className="bg-white h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 border-b border-gray-600 pb-2">EDUCATION</h2>
              {data.education.map((edu, index) => (
                <div key={index} className="mb-3 text-sm">
                  <h3 className="font-semibold">{edu.degree || 'Degree'}</h3>
                  <p className="text-gray-300">{edu.school || 'School Name'}</p>
                  <p className="text-gray-400">{edu.year || 'Year'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Content */}
        <div className="w-2/3 p-6">
          {/* Summary */}
          {data.summary && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-800 pb-2 mb-3">PROFESSIONAL SUMMARY</h2>
              <p className="text-gray-700">{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-800 pb-2 mb-3">WORK EXPERIENCE</h2>
              {data.experience.map((exp, index) => (
                <div key={index} className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{exp.title || 'Job Title'}</h3>
                      <p className="text-gray-600 font-medium">{exp.company || 'Company Name'}</p>
                    </div>
                    <span className="text-gray-500 font-medium">{exp.duration || 'Duration'}</span>
                  </div>
                  <p className="text-gray-700">{exp.description || 'Job description...'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalTemplate;