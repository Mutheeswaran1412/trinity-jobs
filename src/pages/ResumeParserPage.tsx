import React, { useState, useEffect } from 'react';
import { Upload, FileText, Download, Eye } from 'lucide-react';
import ResumeParserAlgorithm from '../components/ResumeParserAlgorithm';
import { ResumeTable } from '../components/ResumeTable';
import type { Resume } from '../lib/redux/types';

interface ResumeParserPageProps {
  onNavigate: (page: string) => void;
}

const ResumeParserPage: React.FC<ResumeParserPageProps> = ({ onNavigate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      parseResume(file);
    }
  };

  const parseResume = async (file: File) => {
    setLoading(true);
    try {
      const mockResume: Resume = {
        profile: {
          name: 'John Doe',
          email: 'john.doe@email.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA',
          url: '',
          summary: 'Experienced software developer with 5+ years in full-stack development'
        },
        workExperiences: [{
          company: 'Tech Corp',
          jobTitle: 'Senior Developer',
          date: '2020 - Present',
          descriptions: ['Led development of web applications using React and Node.js']
        }],
        educations: [{
          school: 'University of California',
          degree: 'Bachelor of Computer Science',
          date: '2018',
          gpa: '',
          descriptions: []
        }],
        projects: [],
        skills: {
          featuredSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
          descriptions: []
        },
        custom: {
          descriptions: []
        }
      };
      setTimeout(() => {
        setParsedData(mockResume);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error parsing resume:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => onNavigate('candidate-dashboard')}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Parser</h1>
          <p className="text-gray-600">
            Upload your resume to extract and analyze key information for better job matching
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Resume</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
              />
              <label htmlFor="resume-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your resume here or click to browse
                </p>
                <p className="text-sm text-gray-500">PDF files only, max 10MB</p>
              </label>
            </div>

            {selectedFile && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            {previewUrl && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Preview</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src={previewUrl}
                    className="w-full h-96"
                    title="Resume Preview"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Parsed Results */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Parsed Information</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Parsing resume...</span>
              </div>
            ) : parsedData ? (
              <div className="space-y-6">
                {/* Personal Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Personal Information</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">{parsedData.profile.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{parsedData.profile.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{parsedData.profile.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-gray-900">{parsedData.profile.location}</p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.featuredSkills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Experience</h3>
                  {parsedData.workExperiences.map((exp, index) => (
                    <div key={index} className="border-l-4 border-blue-200 pl-4 mb-4">
                      <h4 className="font-medium text-gray-900">{exp.jobTitle}</h4>
                      <p className="text-blue-600">{exp.company}</p>
                      <p className="text-sm text-gray-500">{exp.date}</p>
                      <p className="text-gray-700 mt-1">{exp.descriptions.join('. ')}</p>
                    </div>
                  ))}
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Education</h3>
                  {parsedData.educations.map((edu, index) => (
                    <div key={index} className="border-l-4 border-green-200 pl-4 mb-4">
                      <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                      <p className="text-green-600">{edu.school}</p>
                      <p className="text-sm text-gray-500">{edu.date}</p>
                    </div>
                  ))}
                </div>

                {/* Resume Table */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Structured Data</h4>
                  <ResumeTable resume={parsedData} />
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t mt-6">
                  <button
                    onClick={() => {
                      // Save parsed data to profile
                      localStorage.setItem('parsedResumeData', JSON.stringify(parsedData));
                      alert('Resume data saved to your profile!');
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save to Profile
                  </button>
                  <button
                    onClick={() => onNavigate('resume-builder')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Edit in Builder
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Upload a resume to see parsed information</p>
              </div>
            )}
          </div>
        </div>

        {/* Algorithm Explanation */}
        {parsedData && (
          <ResumeParserAlgorithm 
            textItems={[
              { text: parsedData.profile.name, x: 100, y: 700, width: 120, bold: true },
              { text: parsedData.profile.email, x: 100, y: 680, width: 150 },
              { text: parsedData.profile.phone, x: 100, y: 660, width: 130 },
              ...parsedData.skills.featuredSkills.map((skill: string, idx: number) => ({
                text: skill,
                x: 100 + (idx * 80),
                y: 500,
                width: 60
              }))
            ]}
            parsedData={parsedData}
          />
        )}
      </div>
    </div>
  );
};

export default ResumeParserPage;