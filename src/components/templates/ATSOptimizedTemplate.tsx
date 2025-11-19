import React from 'react';
import { ResumeData } from '../../types/resume';

interface TemplateProps {
  data: ResumeData;
  color?: string;
}

const ATSOptimizedTemplate: React.FC<TemplateProps> = ({ data, color = "#000000" }) => {
  return (
    <div className="w-[800px] min-h-[1100px] bg-white shadow-lg p-8 font-sans text-black">
      {/* ATS-Optimized Header */}
      <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.name}</h1>
        <h2 className="text-xl text-gray-700 mb-3">{data.title}</h2>
        <div className="text-sm text-gray-600">
          {data.contact.phone} | {data.contact.email} | {data.contact.address}
        </div>
      </div>

      {/* Professional Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Professional Summary</h3>
        <p className="text-gray-700 leading-relaxed">{data.summary}</p>
      </div>

      {/* Core Competencies */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Core Competencies</h3>
        <div className="grid grid-cols-3 gap-2">
          {data.skills.map((skill, index) => (
            <div key={index} className="text-sm text-gray-700">• {skill}</div>
          ))}
        </div>
      </div>

      {/* Professional Experience */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Professional Experience</h3>
        {data.experience.map((exp, index) => (
          <div key={index} className="mb-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-gray-900">{exp.role}</h4>
                <p className="text-gray-700 font-medium">{exp.company}, {exp.location}</p>
              </div>
              <p className="text-gray-600 text-sm">{exp.start_date} - {exp.end_date}</p>
            </div>
            <ul className="list-none space-y-1">
              {exp.points.map((point, pointIndex) => (
                <li key={pointIndex} className="text-gray-700 text-sm flex items-start">
                  <span className="mr-2">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Education</h3>
        {data.education.map((edu, index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                <p className="text-gray-700">{edu.institute}</p>
              </div>
              <p className="text-gray-600">{edu.year}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ATSOptimizedTemplate;