import React from 'react';
import { ResumeData } from '../../types/resume';

interface TemplateProps {
  data: ResumeData;
  color?: string;
}

const ModernMinimalistTemplate: React.FC<TemplateProps> = ({ data, color = "#009688" }) => {
  return (
    <div className="w-[800px] min-h-[1100px] bg-white shadow-lg">
      {/* Header */}
      <div className="p-8 border-b-4" style={{ borderColor: color }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-gray-800">{data.name}</h1>
            <p className="text-xl text-gray-600 mt-2">{data.title}</p>
          </div>
          {data.profilePic && (
            <img 
              src={data.profilePic}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
          )}
        </div>
        
        <div className="flex space-x-8 mt-4 text-sm text-gray-600">
          <span>{data.contact.phone}</span>
          <span>{data.contact.email}</span>
          <span>{data.contact.address}</span>
        </div>
      </div>

      <div className="p-8">
        {/* Summary */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 pb-1 border-b-2" style={{ color, borderColor: color }}>
            SUMMARY
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 pb-1 border-b-2" style={{ color, borderColor: color }}>
                EXPERIENCE
              </h2>
              {data.experience.map((exp, index) => (
                <div key={index} className="mb-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-base">{exp.role}</h3>
                      <p className="text-sm" style={{ color }}>{exp.company} • {exp.location}</p>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {exp.start_date} - {exp.end_date}
                    </span>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4">
                    {exp.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="relative">
                        <span className="absolute -left-4 top-2 w-1 h-1 rounded-full" style={{ backgroundColor: color }}></span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-3 pb-1 border-b-2" style={{ color, borderColor: color }}>
                SKILLS
              </h2>
              <div className="space-y-2">
                {data.skills.map((skill, index) => (
                  <div key={index} className="text-sm">
                    <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-gray-700">
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3 pb-1 border-b-2" style={{ color, borderColor: color }}>
                EDUCATION
              </h2>
              {data.education.map((edu, index) => (
                <div key={index} className="mb-4">
                  <p className="font-semibold text-sm">{edu.degree}</p>
                  <p className="text-xs text-gray-600">{edu.institute}</p>
                  <p className="text-xs" style={{ color }}>{edu.year}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernMinimalistTemplate;