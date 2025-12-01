import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, MapPin, Star, Users, Code, Mail, Phone } from 'lucide-react';
import CandidateProfileModal from '../components/CandidateProfileModal';

interface Candidate {
  _id: string;
  name?: string;
  fullName?: string;
  title?: string;
  location?: string;
  skills?: string[];
  experience?: string;
  rating?: number;
  salary?: string;
  availability?: string;
  email?: string;
}

interface CandidateSearchPageProps {
  onNavigate: (page: string) => void;
}

const CandidateSearchPage: React.FC<CandidateSearchPageProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch candidates from API
  const fetchCandidates = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSkill) params.append('skill', selectedSkill);
      if (selectedLocation) params.append('location', selectedLocation);
      
      const response = await fetch(`http://localhost:5000/api/candidates?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      } else {
        console.error('Failed to fetch candidates');
        setCandidates([]);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [searchTerm, selectedSkill, selectedLocation]);

  const skills = ["React", "Python", "TypeScript", "AWS", "Node.js", "Machine Learning", "Kubernetes", "Vue.js"];
  const locations = ["San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Remote"];

  // Get avatar initials from name
  const getAvatar = (name: string) => {
    return name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'NA';
  };

  // Get candidate name (handle both fullName and name fields)
  const getCandidateName = (candidate: Candidate) => {
    return candidate.fullName || candidate.name || 'Anonymous';
  };

  // Get candidate location
  const getCandidateLocation = (candidate: Candidate) => {
    return candidate.location || 'Location not specified';
  };

  // Get candidate skills
  const getCandidateSkills = (candidate: Candidate) => {
    const skills = candidate.skills || [];
    return skills.length > 0 ? skills : ['No skills listed'];
  };

  const handleViewProfile = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Find Top Tech Talent 🎯
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browse our pool of verified tech professionals and find the perfect candidates for your team
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-200">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Skills</option>
              {skills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${candidates.length} candidates found`}
            {(searchTerm || selectedSkill || selectedLocation) && (
              <span className="ml-2 text-blue-600">
                {searchTerm && ` for "${searchTerm}"`}
                {selectedSkill && ` with ${selectedSkill}`}
                {selectedLocation && ` in ${selectedLocation}`}
              </span>
            )}
          </p>
        </div>

        {/* Candidates Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading candidates...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or register as a candidate.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {candidates.map((candidate) => (
            <div key={candidate._id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {getAvatar(getCandidateName(candidate))}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{getCandidateName(candidate)}</h3>
                  <p className="text-blue-600 font-semibold mb-2">{candidate.title}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{getCandidateLocation(candidate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{candidate.experience || '2+ years'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{candidate.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                  <Code className="w-4 h-4" />
                  <span>Skills</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {getCandidateSkills(candidate).map((skill, index) => (
                    <span 
                      key={index} 
                      className={skill === 'No skills listed' ? 'text-gray-500 text-sm' : 'bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium'}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Expected Salary</p>
                  <p className="font-bold text-green-600">{candidate.salary}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Availability</p>
                  <p className="font-semibold text-gray-900">{candidate.availability}</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => candidate.email && (window.location.href = `mailto:${candidate.email}`)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Contact</span>
                </button>
                <button 
                  onClick={() => handleViewProfile(candidate)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-colors"
                >
                  View Profile
                </button>
              </div>
            </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <button className="bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
            Load More Candidates
          </button>
        </div>
      </div>
      
      <CandidateProfileModal
        candidate={selectedCandidate}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default CandidateSearchPage;