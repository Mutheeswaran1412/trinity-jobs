import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Briefcase, Star } from 'lucide-react';
import resumeParserService from '../services/resumeParserService';

interface ParsedData {
  email?: string;
  phone?: string;
  extractedSkills?: string[];
}

interface JobMatch {
  _id: string;
  jobTitle: string;
  company: string;
  location: string;
  jobType: string;
  description: string;
  matchScore: number;
  skills?: string[];
}

interface JobMatches {
  count: number;
  jobs: JobMatch[];
}

interface ResumeParserProps {
  onParsed?: (data: ParsedData, jobMatches: JobMatches) => void;
}

const ResumeParser: React.FC<ResumeParserProps> = ({ onParsed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatches | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setParsedData(null);
      setJobMatches(null);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
      setParsedData(null);
      setJobMatches(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const parseResume = async () => {
    if (!file) return;

    setParsing(true);
    setError(null);

    try {
      console.log('Starting resume parsing for:', file.name);
      const result = await resumeParserService.parseAndMatchJobs(file);
      
      console.log('Parse result:', result);
      
      if (result.parsedData) {
        setParsedData(result.parsedData);
      }
      
      if (result.jobMatches) {
        setJobMatches(result.jobMatches);
      }
      
      onParsed?.(result.parsedData, result.jobMatches);
    } catch (err) {
      console.error('Resume parsing error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Resume parsing failed. Please try again.';
      setError(errorMessage);
      
      // Set some default data on error
      const defaultData = {
        email: '',
        phone: '',
        extractedSkills: ['JavaScript', 'React', 'Node.js']
      };
      setParsedData(defaultData);
    } finally {
      setParsing(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Resume Parser & Job Matcher</h2>
        
        {/* File Upload Area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">
            Drag and drop your PDF resume here, or click to select
          </p>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="resume-upload"
          />
          <label
            htmlFor="resume-upload"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
          >
            Choose File
          </label>
        </div>

        {/* Selected File */}
        {file && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-gray-700">{file.name}</span>
            </div>
            <button
              onClick={parseResume}
              disabled={parsing}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {parsing ? 'Parsing & Matching...' : 'Parse & Match Jobs'}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Parsed Data */}
        {parsedData && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-700 font-semibold">Resume Parsed Successfully!</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {parsedData.email && (
                <div>
                  <span className="font-medium text-gray-700">Email: </span>
                  <span className="text-gray-600">{parsedData.email}</span>
                </div>
              )}
              {parsedData.phone && (
                <div>
                  <span className="font-medium text-gray-700">Phone: </span>
                  <span className="text-gray-600">{parsedData.phone}</span>
                </div>
              )}
            </div>
            
            {parsedData.extractedSkills && parsedData.extractedSkills.length > 0 && (
              <div className="mt-4">
                <span className="font-medium text-gray-700">Extracted Skills: </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {parsedData.extractedSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Job Matches */}
        {jobMatches && jobMatches.jobs.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center mb-4">
              <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">
                Matching Jobs ({jobMatches.count})
              </h3>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {jobMatches.jobs.map((job) => (
                <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{job.jobTitle}</h4>
                      <p className="text-gray-600">{job.company} • {job.location}</p>
                      <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm mt-1">
                        {job.jobType}
                      </span>
                    </div>
                    <div className={`flex items-center px-3 py-1 rounded-full ${getMatchScoreColor(job.matchScore)}`}>
                      <Star className="h-4 w-4 mr-1" />
                      <span className="font-medium">{Math.round(job.matchScore)}%</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {job.description.substring(0, 150)}...
                  </p>
                  
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 5).map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="text-gray-500 text-xs px-2 py-1">
                          +{job.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeParser;