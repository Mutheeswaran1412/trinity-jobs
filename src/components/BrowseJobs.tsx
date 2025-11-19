import React, { useState } from 'react';
import { Search, Code, Database, Shield, BarChart3, Settings, Gamepad2, HelpCircle, Sparkles, ArrowRight } from 'lucide-react';
import { aiSuggestions } from '../utils/aiSuggestions';

interface BrowseJobsProps {
  onNavigate?: (page: string, filter?: string, filterType?: string) => void;
  user?: {name: string, type: 'candidate' | 'employer'} | null;
  onShowNotification?: (notification: {type: 'success' | 'error' | 'info', message: string}) => void;
}

const BrowseJobs: React.FC<BrowseJobsProps> = ({ onNavigate, user, onShowNotification }) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  
  const jobTitles = [
    { icon: Code, title: ".NET Developer", count: "1.2k", gradient: "from-blue-600 to-purple-600", bgImage: "./images/net%20developer.jpg" },
    { icon: BarChart3, title: "Business Analyst", count: "890", gradient: "from-emerald-600 to-teal-600", bgImage: "./images/businessanalys.jpg" },
    { icon: Shield, title: "Cyber Security", count: "567", gradient: "from-red-600 to-pink-600", bgImage: "./images/cybersecurity.jpg" },
    { icon: Database, title: "Data Scientist", count: "2.1k", gradient: "from-orange-600 to-yellow-600", bgImage: "./images/data%20scientist.jpg" },
    { icon: Settings, title: "DevOps Engineer", count: "945", gradient: "from-indigo-600 to-blue-600", bgImage: "./images/devopsengineer.jpg" },
    { icon: Code, title: "Full Stack Dev", count: "3.4k", gradient: "from-purple-600 to-pink-600", bgImage: "./images/fullstackdeveloper.jpg" },
    { icon: Gamepad2, title: "Game Developer", count: "234", gradient: "from-green-600 to-emerald-600", bgImage: "./images/gamedeveloper.jpg" },
    { icon: HelpCircle, title: "IT Support", count: "678", gradient: "from-cyan-600 to-blue-600", bgImage: "./images/itsupport.jpg" }
  ];

  const skills = [
    { name: "Apache Kafka", trend: "↗️ +15%" },
    { name: "AI", trend: "🔥 Hot" },
    { name: "Big Data", trend: "↗️ +8%" },
    { name: "Machine Learning", trend: "🔥 Hot" },
    { name: "ETL", trend: "↗️ +12%" },
    { name: "MongoDB", trend: "📈 Rising" },
    { name: "React", trend: "🔥 Hot" },
    { name: "TypeScript", trend: "📈 Rising" }
  ];

  const getSkillSuggestions = async (input: string): Promise<string[]> => {
    return await aiSuggestions.getSkillSuggestions(input);
  };

  const handleSkillInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkillInput(value);
    
    if (value.length >= 2) {
      const suggestions = await getSkillSuggestions(value);
      setSkillSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setSkillInput('');
    setShowSuggestions(false);
  };

  const removeSkill = (skillToRemove) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const getSearchSuggestions = async (input: string): Promise<string[]> => {
    const jobSuggestions = await aiSuggestions.getJobSuggestions(input);
    const locationSuggestions = await aiSuggestions.getLocationSuggestions(input);
    return [...jobSuggestions.slice(0, 4), ...locationSuggestions.slice(0, 4)];
  };

  const handleSearchInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length >= 2) {
      const newSuggestions = await getSearchSuggestions(value);
      setSearchSuggestions(newSuggestions);
      setShowSearchSuggestions(true);
    } else {
      setShowSearchSuggestions(false);
    }
  };

  const selectSearchSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSearchSuggestions(false);
  };

  const handleSearch = () => {
    const searchParams = {
      query: searchQuery,
      skills: selectedSkills
    };
    onNavigate && onNavigate('job-listings', JSON.stringify(searchParams));
  };

  return (
    <section className="py-20 bg-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-800 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-800 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gray-800 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300 text-sm font-medium">Discover Your Next Role</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Browse Jobs by Title,
            <br />Skill, or Role
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore thousands of opportunities with our AI-powered job matching
          </p>
        </div>
        
        {/* Advanced Search */}
        <div className="mb-16">
          <div className="relative max-w-4xl mx-auto">
            <div className="relative bg-gray-50 border border-gray-200 rounded-2xl p-8">
              <div className="space-y-4">
                {/* Main Search */}
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onFocus={() => searchQuery.length >= 2 && setShowSearchSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                      placeholder="Search jobs, companies, locations (e.g., React Developer, Chennai)..."
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                    />
                    {showSearchSuggestions && searchSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectSearchSuggestion(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0 flex items-center"
                          >
                            <Search className="w-4 h-4 text-gray-400 mr-3" />
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleSearch}
                    className="bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                  >
                    Search
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Skills Filter */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Filter by Skills</label>
                  </div>
                  <div className="relative">
                    <div className="bg-white border border-gray-300 rounded-xl p-3 min-h-[60px] focus-within:ring-2 focus-within:ring-gray-400">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedSkills.map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="ml-2 text-blue-600">
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={skillInput}
                        onChange={handleSkillInputChange}
                        placeholder="Add skills to filter jobs (e.g., Python, React)..."
                        className="w-full border-none outline-none text-sm"
                      />
                    </div>
                    {showSuggestions && skillSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-lg">
                        {skillSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => addSkill(suggestion)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Job Cards */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Popular Job Titles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobTitles.map((job, index) => (
              <div 
                key={index}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => {
                  if (user?.type === 'candidate') {
                    onNavigate && onNavigate('job-role', job.title);
                  } else if (user?.type === 'employer') {
                    if (onShowNotification) {
                      onShowNotification({
                        type: 'info',
                        message: 'You are currently logged in as an employer. Please logout and login as a candidate to access candidate features.'
                      });
                    }
                  } else {
                    sessionStorage.setItem('pendingJobRole', job.title);
                    onNavigate && onNavigate('register');
                  }
                }}
                className="group relative cursor-pointer"
              >
                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${job.gradient} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-all duration-500`}></div>
                
                {/* Card */}
                <div className="relative bg-gray-50 border border-gray-200 rounded-2xl p-6 h-48 overflow-hidden transition-all duration-500 group-hover:bg-gray-100 group-hover:border-gray-300 group-hover:scale-105">
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                    style={{ backgroundImage: `url(${job.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  ></div>
                  
                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <div className={`w-12 h-12 bg-gradient-to-r ${job.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <job.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-gray-900 font-semibold text-lg mb-2 group-hover:text-gray-700 transition-all duration-300">
                        {job.title}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">{job.count} jobs</span>
                      <ArrowRight className={`w-5 h-5 text-gray-500 transform transition-all duration-300 ${hoveredCard === index ? 'translate-x-1 text-gray-900' : ''}`} />
                    </div>
                  </div>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Skills Section */}
        <div>
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Trending Skills</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {skills.map((skill, index) => (
              <div
                key={index}
                onClick={() => onNavigate && onNavigate('skill-detail', skill.name)}
                className="group relative cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-30 transition-all duration-300"></div>
                <div className="relative bg-gray-50 border border-gray-200 rounded-full px-6 py-3 hover:bg-gray-100 hover:border-gray-300 transition-all duration-300 group-hover:scale-105">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium">{skill.name}</span>
                    <span className="text-xs text-gray-600">{skill.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrowseJobs;