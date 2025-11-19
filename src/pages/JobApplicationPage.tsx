import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Briefcase, Building, MapPin, DollarSign } from 'lucide-react';

interface JobApplicationPageProps {
  onNavigate: (page: string) => void;
  user?: { id: string; name: string; email: string } | null;
}

const JobApplicationPage: React.FC<JobApplicationPageProps> = ({ onNavigate, user }) => {
  const [job, setJob] = useState<any>(null);
  const [formData, setFormData] = useState({
    coverLetter: '',
    resume: null as File | null,
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    // Get selected job from localStorage
    const selectedJob = localStorage.getItem('selectedJob');
    if (selectedJob) {
      setJob(JSON.parse(selectedJob));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        resume: e.target.files[0]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setSubmitMessage('Please login to apply for jobs');
      return;
    }

    if (!job) {
      setSubmitMessage('Job information not found');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const applicationData = {
        job_id: job._id || job.id,
        user_id: user.id,
        cover_letter: formData.coverLetter,
        additional_info: formData.additionalInfo,
        resume_filename: formData.resume?.name || ''
      };

      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData)
      });

      if (response.ok) {
        const result = await response.json();
        setSubmitMessage('Application submitted successfully!');
        setTimeout(() => {
          onNavigate('job-listings');
        }, 2000);
      } else {
        const error = await response.json();
        setSubmitMessage(error.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitMessage('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h2>
          <button 
            onClick={() => onNavigate('job-listings')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Job Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => onNavigate('job-listings')}
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to the job
        </button>

        {/* Application Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
          <div className="mb-8">
            <h3 className="text-lg text-gray-600 mb-2">You're Applying for</h3>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h2>
            <p className="text-gray-600">{job.company} • {job.location}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Step 1 of 3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-teal-600 h-2 rounded-full" style={{width: '33%'}}></div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-6">Resume & Cover Letter</h3>
          
          {submitMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              submitMessage.includes('successfully') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {submitMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">


            {/* Resume Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                  required
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <p className="text-blue-600 font-medium mb-1">
                    {formData.resume ? formData.resume.name : 'Upload Resume'}
                  </p>
                  <p className="text-sm text-gray-500">.doc, .docx, .pdf, .txt, .rtf up to 2MB</p>
                </label>
              </div>
            </div>

            {/* Cover Letter Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover letter
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  id="cover-letter-upload"
                />
                <label htmlFor="cover-letter-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <p className="text-blue-600 font-medium mb-1">Upload Cover Letter</p>
                  <p className="text-sm text-gray-500">.doc, .docx, .pdf, .txt, .rtf up to 2MB</p>
                </label>
              </div>
            </div>



            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationPage;