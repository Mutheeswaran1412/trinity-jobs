import React from 'react';
import { ResumeData } from '../../types/resume';

interface TemplateProps {
  data: ResumeData;
  color?: string;
}

const DarkProfessionalTemplate: React.FC<TemplateProps> = ({ data, color = "#2F4858" }) => {
  return (
    <div className="w-[800px] min-h-[1100px] bg-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-8 text-white" style={{ backgroundColor: color }}>
        <div className="flex items-center space-x-6">
          {data.profilePic && (
            <img 
              src={data.profilePic}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{data.name}</h1>
            <p className="text-xl opacity-90">{data.title}</p>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-gray-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ color }}>CONTACT</h2>
            <div className="space-y-2 text-sm">
              <p>{data.contact.phone}</p>
              <p>{data.contact.email}</p>
              <p>{data.contact.address}</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3" style={{ color }}>SKILLS</h2>
            <div className="space-y-2">
              {data.skills.map((skill, index) => (
                <div key={index} className="text-sm">
                  <div className="flex justify-between items-center">
                    <span>{skill}</span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2 mt-1">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ backgroundColor: color, width: '85%' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3" style={{ color }}>EDUCATION</h2>
            {data.education.map((edu, index) => (
              <div key={index} className="mb-4">
                <p className="font-semibold text-sm">{edu.degree}</p>
                <p className="text-xs text-gray-600">{edu.institute}</p>
                <p className="text-xs" style={{ color }}>{edu.year}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content */}
        <div className="w-2/3 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3" style={{ color }}>PROFESSIONAL SUMMARY</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4" style={{ color }}>WORK EXPERIENCE</h2>
            {data.experience.map((exp, index) => (
              <div key={index} className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-base">{exp.role}</h3>
                    <p className="text-sm font-medium" style={{ color }}>{exp.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{exp.start_date} - {exp.end_date}</p>
                    <p className="text-xs text-gray-500">{exp.location}</p>
                  </div>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {exp.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start">
                      <span className="mr-2 mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkProfessionalTemplate;