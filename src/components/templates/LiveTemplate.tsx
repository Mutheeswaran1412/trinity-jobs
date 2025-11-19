import React from 'react';

interface LiveTemplateProps {
  data: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      city: string;
      country: string;
      pincode: string;
    };
    summary: string;
    experience: any[];
    education: any[];
    skills: string[];
  };
}

const LiveTemplate: React.FC<LiveTemplateProps> = ({ data }) => {
  return (
    <div className="bg-white w-full h-full p-6 font-sans text-sm">
      {/* Header Section */}
      <div className="bg-teal-500 text-white p-6 relative">
        {/* Photo Section */}
        <div className="absolute top-4 left-6">
          <div className="w-24 h-24 bg-gray-600 rounded-lg flex items-center justify-center">
            <div className="text-white text-xs text-center">
              <div className="mb-1">📷</div>
              <div>Edit Photo</div>
            </div>
          </div>
        </div>
        
        {/* Name Section */}
        <div className="ml-32">
          <h1 className="text-2xl font-bold mb-1">
            {data.personalInfo.name || 'First name'} {data.personalInfo.name ? 'Surname' : ''}
          </h1>
          
          {/* Contact Info */}
          <div className="space-y-1 text-sm">
            <div className="flex items-center">
              <span className="mr-2">📍</span>
              <span>{data.personalInfo.city || 'City'}, {data.personalInfo.country || 'Country'} {data.personalInfo.pincode || 'Pin code'}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📞</span>
              <span>{data.personalInfo.phone || 'Phone'}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">✉️</span>
              <span>{data.personalInfo.email || 'Email'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="p-6 space-y-6">
        {/* Summary Section */}
        <div>
          <h2 className="text-lg font-bold text-teal-600 border-b-2 border-teal-600 pb-1 mb-3">
            SUMMARY
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {data.summary || 'Your professional summary will appear here...'}
          </p>
        </div>

        {/* Experience Section */}
        <div>
          <h2 className="text-lg font-bold text-teal-600 border-b-2 border-teal-600 pb-1 mb-3">
            EXPERIENCE
          </h2>
          {data.experience.length > 0 ? (
            data.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <h3 className="font-semibold">{exp.title}</h3>
                <p className="text-gray-600">{exp.company} | {exp.duration}</p>
                <p className="text-gray-700 mt-1">{exp.description}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Your work experience will appear here...</p>
          )}
        </div>

        {/* Education Section */}
        <div>
          <h2 className="text-lg font-bold text-teal-600 border-b-2 border-teal-600 pb-1 mb-3">
            EDUCATION
          </h2>
          {data.education.length > 0 ? (
            data.education.map((edu, index) => (
              <div key={index} className="mb-4">
                <h3 className="font-semibold">{edu.degree}</h3>
                <p className="text-gray-600">{edu.school} | {edu.year}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Your education details will appear here...</p>
          )}
        </div>

        {/* Skills Section */}
        <div>
          <h2 className="text-lg font-bold text-teal-600 border-b-2 border-teal-600 pb-1 mb-3">
            SKILLS
          </h2>
          {data.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span key={index} className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Your skills will appear here...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveTemplate;