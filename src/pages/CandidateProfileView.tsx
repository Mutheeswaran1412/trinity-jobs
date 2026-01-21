import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Mail, Phone, Download, ExternalLink, Github, Globe, MessageCircle } from 'lucide-react';
import ProfileHeadline from '../components/ProfileHeadline';
import DirectMessage from '../components/DirectMessage';

interface CandidateProfileViewProps {
  candidateId: string;
  onNavigate: (page: string) => void;
  onBack: () => void;
}

const CandidateProfileView: React.FC<CandidateProfileViewProps> = ({ candidateId, onNavigate, onBack }) => {
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  
  // Get current employer info from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchCandidateProfile();
  }, [candidateId]);

  const fetchCandidateProfile = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/profile/${candidateId}`);
      if (response.ok) {
        const data = await response.json();
        setCandidate(data);
      }
    } catch (error) {
      console.error('Error fetching candidate profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Candidate profile not found</p>
          <button onClick={onBack} className="text-blue-600 hover:text-blue-800">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              {candidate.profilePhoto ? (
                <img
                  src={candidate.profilePhoto}
                  alt={candidate.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-2xl font-semibold text-gray-600">
                  {candidate.name?.charAt(0)?.toUpperCase() || 'C'}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {candidate.name || 'Candidate Name'}
              </h1>
              
              <ProfileHeadline 
                userId={candidateId} 
                fallbackHeadline={candidate.title || candidate.jobTitle || 'Professional'}
              />

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                {candidate.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {candidate.location}
                  </div>
                )}
                {candidate.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {candidate.email}
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {candidate.phone}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMessage(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send Message
                </button>
                {candidate.resume && (
                  <button
                    onClick={() => window.open(candidate.resume.url || `http://localhost:5000/uploads/${candidate.resume.filename}`, '_blank')}
                    className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4" />
                    Download Resume
                  </button>
                )}
                <button
                  onClick={() => window.open(`mailto:${candidate.email}`, '_blank')}
                  className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Experience */}
            {candidate.experience && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
                <p className="text-gray-700 whitespace-pre-line">{candidate.experience}</p>
              </div>
            )}

            {/* Education */}
            {candidate.education && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Education</h2>
                <p className="text-gray-700 whitespace-pre-line">{candidate.education}</p>
                {candidate.certifications && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Certifications</h3>
                    <p className="text-gray-700">{candidate.certifications}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio Links */}
            {candidate.portfolioLinks && candidate.portfolioLinks.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Portfolio & Links</h2>
                <div className="space-y-3">
                  {candidate.portfolioLinks.map((link: any) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
                    >
                      {link.type === 'github' && <Github className="w-4 h-4" />}
                      {link.type === 'linkedin' && <ExternalLink className="w-4 h-4" />}
                      {link.type === 'portfolio' && <Globe className="w-4 h-4" />}
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
              <div className="space-y-3 text-sm">
                {candidate.yearsExperience && (
                  <div>
                    <span className="font-medium">Experience:</span> {candidate.yearsExperience} years
                  </div>
                )}
                {candidate.workAuthorization && (
                  <div>
                    <span className="font-medium">Work Authorization:</span> {candidate.workAuthorization}
                  </div>
                )}
                {candidate.securityClearance && candidate.securityClearance !== 'none' && (
                  <div>
                    <span className="font-medium">Security Clearance:</span> {candidate.securityClearance}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Direct Message Modal */}
      {showMessage && (
        <DirectMessage
          candidateId={candidateId}
          candidateName={candidate.name}
          candidateEmail={candidate.email}
          employerId={currentUser.id || currentUser._id || 'employer'}
          employerName={currentUser.name || 'Employer'}
          onClose={() => setShowMessage(false)}
        />
      )}
    </div>
  );
};

export default CandidateProfileView;