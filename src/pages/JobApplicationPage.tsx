import React, { useState, useEffect } from 'react';
import BackButton from '../components/BackButton';

interface JobApplicationPageProps {
  onNavigate: (page: string) => void;
  jobId?: string;
  jobData?: {
    title: string;
    company: string;
    location: string;
    description: string;
    requirements?: string;
  };
}

interface ApplicationData {
  // Location details
  country: string;
  postalCode: string;
  city: string;
  streetAddress: string;
  
  // CV details
  cvFile: File | null;
  cvFileName: string;
  
  // Questions
  workExperience: string;
  jobTitle: string;
  company: string;
  
  // Contact info (from user profile)
  fullName: string;
  email: string;
  phone: string;
}

const JobApplicationPage: React.FC<JobApplicationPageProps> = ({ onNavigate, jobId, jobData }) => {
  
  // Get job data from localStorage if available
  const getJobData = () => {
    if (jobData) return jobData;
    
    const savedJob = localStorage.getItem('selectedJob');
    if (savedJob) {
      try {
        return JSON.parse(savedJob);
      } catch (error) {
        console.error('Error parsing saved job data:', error);
      }
    }
    
    return {
      title: 'Job Title',
      company: 'Company Name', 
      location: 'Location',
      description: 'Job description will appear here when you apply for a specific job.',
      requirements: ''
    };
  };
  
  const currentJobData = getJobData();
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    country: 'India',
    postalCode: '',
    city: 'Chennai, Tamil Nadu',
    streetAddress: '',
    cvFile: null,
    cvFileName: '',
    workExperience: '',
    jobTitle: '',
    company: '',
    fullName: 'Mutheeswaran G',
    email: 'mutheeswaran124@gmail.com',
    phone: '+91 95003 66784'
  });

  const updateData = (field: keyof ApplicationData, value: any) => {
    setApplicationData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getProgressPercentage = () => {
    return (currentStep / 4) * 100;
  };

  // Step 1: Location Details
  const renderLocationStep = () => (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => onNavigate('job-listings')} className="text-blue-600 hover:text-blue-700">
          ← Back to Jobs
        </button>
        <button onClick={() => onNavigate('candidate-dashboard')} className="text-blue-600 hover:text-blue-700">
          Save and close
        </button>
      </div>
      
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${getProgressPercentage()}%` }}></div>
        </div>
        <div className="text-right text-sm text-gray-600 mt-1">{Math.round(getProgressPercentage())}%</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Review your location details from your profile</h1>
          <p className="text-gray-600 mb-6">
            Sharing location helps connect you with relevant jobs and estimate your commute time. 
            We'll save any changes to your profile.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <div className="flex justify-between items-center">
                <span className="text-gray-900">{applicationData.country}</span>
                <button className="text-blue-600 hover:text-blue-700">Change</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Postal code</label>
              <input
                type="text"
                value={applicationData.postalCode}
                onChange={(e) => updateData('postalCode', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City, State/Territory</label>
              <input
                type="text"
                value={applicationData.city}
                onChange={(e) => updateData('city', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Street address</label>
              <div className="text-sm text-gray-500 mb-2">🔒 Not shown to employers</div>
              <input
                type="text"
                value={applicationData.streetAddress}
                onChange={(e) => updateData('streetAddress', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => onNavigate('job-listings')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back to Jobs
            </button>
            <button
              onClick={nextStep}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">{currentJobData.title}</h3>
          <p className="text-gray-600 mb-4">{currentJobData.company} - {currentJobData.location}</p>
          
          {currentJobData.requirements && (
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <p className="font-medium">{currentJobData.requirements}</p>
            </div>
          )}
          
          <div>
            <h4 className="font-medium mb-2">Job Description:</h4>
            <div className="text-gray-700 text-sm max-h-48 overflow-y-auto">
              <p className="whitespace-pre-line">{currentJobData.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: CV Upload
  const renderCVStep = () => (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevStep} className="text-gray-600 hover:text-gray-700">← Back</button>
        <button onClick={() => onNavigate('candidate-dashboard')} className="text-blue-600 hover:text-blue-700">
          Save and close
        </button>
      </div>
      
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${getProgressPercentage()}%` }}></div>
        </div>
        <div className="text-right text-sm text-gray-600 mt-1">{Math.round(getProgressPercentage())}%</div>
      </div>

      <div className="bg-white p-6 rounded-lg max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add a CV for the employer</h1>

        <div className="border-2 border-blue-300 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-gray-100 p-2 rounded mr-3">📄</div>
              <div>
                <div className="font-medium">Mutheeswaran.Resume.pdf</div>
                <div className="text-sm text-gray-500">Uploaded Mar 13, 2025</div>
              </div>
            </div>
            <div className="bg-green-500 text-white rounded-full p-1">✓</div>
          </div>
          
          <div className="bg-orange-100 p-4 rounded-lg">
            <div className="flex items-start">
              <img src="/api/placeholder/60/60" alt="Profile" className="w-15 h-15 rounded-full mr-4" />
              <div className="flex-1">
                <h3 className="font-bold text-lg">MUTHEESWARAN G</h3>
                <p className="text-sm text-gray-600 mb-2">STUDENT</p>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-semibold mb-1">EDUCATION</h4>
                    <p>B.Tech Information Technology</p>
                    <p>Loyola-ICAM College of Engineering and Technology</p>
                    <p>CGPA: 7.2</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">ABOUT ME</h4>
                    <p className="text-xs">Currently pursuing a Bachelor's degree of Information Technology at Loyola-ICAM college of Engineering and Technology My academic journey has been complemented by hands-on experience gained through internships and personal projects...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={prevStep}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  // Step 3: Questions
  const renderQuestionsStep = () => (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevStep} className="text-gray-600 hover:text-gray-700">← Back</button>
        <button onClick={() => onNavigate('candidate-dashboard')} className="text-blue-600 hover:text-blue-700">
          Save and close
        </button>
      </div>
      
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${getProgressPercentage()}%` }}></div>
        </div>
        <div className="text-right text-sm text-gray-600 mt-1">{Math.round(getProgressPercentage())}%</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Answer these questions from the employer</h1>
          <p className="text-gray-600 mb-6">
            These questions are from the employer. If a question seems inappropriate, you can 
            <button className="text-blue-600 hover:text-blue-700 underline ml-1">report the job</button>.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How many years of total work experience do you have? *
              </label>
              <input
                type="text"
                value={applicationData.workExperience}
                onChange={(e) => updateData('workExperience', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 2 years"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job title</label>
              <input
                type="text"
                value={applicationData.jobTitle}
                onChange={(e) => updateData('jobTitle', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your current/previous job title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={applicationData.company}
                onChange={(e) => updateData('company', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter company name"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              onClick={prevStep}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Having an issue with this application? 
              <button className="text-blue-600 hover:text-blue-700 underline ml-1">Tell us more</button>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              This site is protected by reCAPTCHA and the Google 
              <button className="text-blue-600 hover:text-blue-700 underline mx-1">Privacy Policy</button>
              and <button className="text-blue-600 hover:text-blue-700 underline">Terms of Service</button> apply.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">{currentJobData.title}</h3>
          <p className="text-gray-600 mb-4">{currentJobData.company} - {currentJobData.location}</p>
          
          {currentJobData.requirements && (
            <div className="bg-yellow-50 p-4 rounded-lg mb-4">
              <p className="font-medium">{currentJobData.requirements}</p>
            </div>
          )}
          
          <div>
            <h4 className="font-medium mb-2">Job Description:</h4>
            <div className="text-gray-700 text-sm max-h-48 overflow-y-auto">
              <p className="whitespace-pre-line">{currentJobData.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Review
  const renderReviewStep = () => (
    <div className="max-w-4xl mx-auto p-6 bg-blue-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevStep} className="text-gray-600 hover:text-gray-700">← Back</button>
        <button onClick={() => onNavigate('candidate-dashboard')} className="text-blue-600 hover:text-blue-700">
          Save and close
        </button>
      </div>
      
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${getProgressPercentage()}%` }}></div>
        </div>
        <div className="text-right text-sm text-gray-600 mt-1">{Math.round(getProgressPercentage())}%</div>
      </div>

      <div className="bg-white p-6 rounded-lg max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Review your application</h1>
        <p className="text-gray-600 mb-6">
          You will not be able to make changes after you submit your application.
        </p>

        <div className="space-y-6">
          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-600">Contact information</h3>
              <button className="text-blue-600 hover:text-blue-700">Edit</button>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-500">Full name</div>
                <div className="font-medium">{applicationData.fullName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Email address</div>
                <div className="font-medium">{applicationData.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">City, State</div>
                <div className="font-medium">{applicationData.city}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Phone Number</div>
                <div className="font-medium">{applicationData.phone}</div>
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-600">CV</h3>
              <div className="space-x-2">
                <button className="text-blue-600 hover:text-blue-700">Download</button>
                <button className="text-blue-600 hover:text-blue-700">Edit</button>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded mr-3">📄</div>
              <span className="text-blue-600">Mutheeswaran.Resume.pdf</span>
            </div>
            
            <div className="bg-orange-100 p-4 rounded-lg mt-4">
              <div className="flex items-start">
                <img src="/api/placeholder/50/50" alt="Profile" className="w-12 h-12 rounded-full mr-3" />
                <div>
                  <h4 className="font-bold">MUTHEESWARAN G</h4>
                  <p className="text-sm text-gray-600">STUDENT</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-600 mb-2">Application responses</h3>
            <div className="space-y-2">
              <div>
                <div className="text-sm text-gray-500">Work experience</div>
                <div className="font-medium">{applicationData.workExperience || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Job title</div>
                <div className="font-medium">{applicationData.jobTitle || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Company</div>
                <div className="font-medium">{applicationData.company || 'Not specified'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={prevStep}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => {
              // Handle application submission
              const jobData = JSON.parse(localStorage.getItem('selectedJob') || '{}');
              const applicationDetails = {
                id: Date.now(),
                jobTitle: jobData.title,
                company: jobData.company,
                location: jobData.location,
                appliedAt: new Date().toISOString(),
                status: 'Applied',
                ...applicationData
              };
              
              // Save application to localStorage
              const existingApplications = JSON.parse(localStorage.getItem('userApplications') || '[]');
              existingApplications.push(applicationDetails);
              localStorage.setItem('userApplications', JSON.stringify(existingApplications));
              
              alert('🎉 Application submitted successfully! You will be redirected to your dashboard.');
              setTimeout(() => {
                onNavigate('candidate-dashboard');
              }, 1500);
            }}
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <span>Submit Application</span>
            <span>✓</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {currentStep === 1 && renderLocationStep()}
      {currentStep === 2 && renderCVStep()}
      {currentStep === 3 && renderQuestionsStep()}
      {currentStep === 4 && renderReviewStep()}
      
      {/* Back Button - show on all steps except first */}
      {currentStep > 1 && (
        <div className="fixed bottom-6 right-6 z-50">
          <BackButton onBack={prevStep} />
        </div>
      )}
    </div>
  );
};

export default JobApplicationPage;