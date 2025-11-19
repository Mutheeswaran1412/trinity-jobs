import React from 'react';
import { ResumeData } from '../../types/resume';

interface TemplateProps {
  data: ResumeData;
  color?: string;
}

const CleanBlueTemplate: React.FC<TemplateProps> = ({ data, color = "#0066CC" }) => {
  return (
    <div className="w-[800px] min-h-[1100px] bg-white shadow-lg p-10 font-sans">
      <div className="flex">
        
        {/* Left Panel */}
        <div className="w-1/3 bg-gray-50 p-6 rounded-lg">
          {data.profilePic && (
            <img 
              src={data.profilePic}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto mb-5 object-cover"
            />
          )}

          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p className="text-sm mb-1">{data.contact.address}</p>
          <p className="text-sm mb-1">{data.contact.phone}</p>
          <p className="text-sm mb-4">{data.contact.email}</p>

          <h2 className="text-xl font-semibold mt-6 mb-2">Skills</h2>
          <ul className="text-sm list-disc ml-4">
            {data.skills.map((skill, index) => (
              <li key={index} className="mb-1">{skill}</li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-2">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <p className="font-medium text-sm">{edu.degree}, {edu.year}</p>
              <p className="text-xs text-gray-600">{edu.institute}</p>
            </div>
          ))}
        </div>

        {/* Right Panel */}
        <div className="w-2/3 pl-10">
          <h1 className="text-4xl font-bold mb-2" style={{ color }}>{data.name}</h1>
          <p className="text-lg font-medium text-gray-600 mb-6">{data.title}</p>

          <h2 className="text-2xl font-semibold mb-2" style={{ color }}>Summary</h2>
          <p className="text-sm text-gray-700 mb-6 leading-relaxed">{data.summary}</p>

          <h2 className="text-2xl font-semibold mb-2" style={{ color }}>Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-5">
              <p className="font-semibold text-base">{exp.role} | {exp.company}</p>
              <p className="text-xs text-gray-500 mb-2">{exp.location} | {exp.start_date} – {exp.end_date}</p>
              <ul className="list-disc ml-5 text-sm">
                {exp.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="mb-1">{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CleanBlueTemplate;