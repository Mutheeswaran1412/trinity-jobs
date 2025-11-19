import { useEffect, useState } from "react";
import { Search, MapPin, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { aiSuggestions } from '../utils/aiSuggestions';

interface HeroProps {
  onNavigate?: (page: string, data?: any) => void;
  user?: {name: string, type: 'candidate' | 'employer'} | null;
  onShowNotification?: (notification: {type: 'success' | 'error' | 'info', message: string}) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate, user, onShowNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [jobSuggestions, setJobSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const getJobSuggestions = async (input: string): Promise<string[]> => {
    return await aiSuggestions.getJobSuggestions(input);
  };

  const getLocationSuggestions = async (input: string): Promise<string[]> => {
    return await aiSuggestions.getLocationSuggestions(input);
  };

  const handleJobInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 2) {
      const suggestions = await getJobSuggestions(value);
      setJobSuggestions(suggestions);
      setShowJobSuggestions(true);
    } else {
      setShowJobSuggestions(false);
    }
  };

  const handleLocationInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    
    if (value.length >= 2) {
      const suggestions = await getLocationSuggestions(value);
      setLocationSuggestions(suggestions);
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
    }
  };

  const selectJobSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowJobSuggestions(false);
  };

  const selectLocationSuggestion = (suggestion: string) => {
    setLocation(suggestion);
    setShowLocationSuggestions(false);
  };

  return (
    <section className="relative py-16 lg:py-24 pb-32 lg:pb-40 overflow-hidden" style={{backgroundColor: '#EAF1FB'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Find your dream job with our
                <span className="text-blue-600"> forward-thinking</span> platform
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                Connect with top companies and discover opportunities that match your skills and ambitions in the tech industry.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onNavigate && onNavigate('register')}
                className="bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => onNavigate && onNavigate('job-listings')}
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold hover:border-gray-400 transition-colors"
              >
                Browse Jobs
              </button>
            </div>

            {/* Trusted by section */}
            <div className="pt-8">
              <p className="text-sm text-gray-500 mb-4">Trusted by professionals from</p>
              <div className="flex items-center gap-8 opacity-60">
                <span className="text-lg font-semibold text-gray-400">Google</span>
                <span className="text-lg font-semibold text-gray-400">Microsoft</span>
                <span className="text-lg font-semibold text-gray-400">Amazon</span>
              </div>
            </div>
          </div>

          {/* Right Content - Job Portal Image */}
          <div className="relative flex justify-center">
            <div className="relative p-4 rounded-3xl" style={{backgroundColor: '#EAF1FB'}}>
              <img
                src="/images/jop_portal.png"
                alt="Job Portal Dashboard"
                className="w-full max-w-lg h-auto rounded-2xl shadow-2xl"
              />
              
              {/* Stats Card */}
              <div className="absolute top-4 -right-4 bg-white rounded-2xl p-4 shadow-lg">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">150+</div>
                  <p className="text-sm text-gray-600">Companies trust us</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Start your <span className="text-blue-600">job search</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Job title, skills or company"
                value={searchTerm}
                onChange={handleJobInputChange}
                onFocus={() => searchTerm.length >= 2 && setShowJobSuggestions(true)}
                onBlur={() => setTimeout(() => setShowJobSuggestions(false), 200)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {showJobSuggestions && jobSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {jobSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onMouseDown={() => selectJobSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0 flex items-center"
                    >
                      <Search className="w-4 h-4 text-gray-400 mr-3" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={handleLocationInputChange}
                onFocus={() => location.length >= 2 && setShowLocationSuggestions(true)}
                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onMouseDown={() => selectLocationSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0 flex items-center"
                    >
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => {
                if (onNavigate) {
                  if (user) {
                    onNavigate('job-listings', { searchTerm, location });
                  } else {
                    onNavigate('register');
                  }
                }
              }}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Search Jobs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

