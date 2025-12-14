import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Search, User, Building, ChevronDown, Settings } from 'lucide-react';

interface HeaderProps {
  onNavigate?: (page: string) => void;
  user?: {name: string, type: 'candidate' | 'employer'} | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isCareerDropdownOpen, setIsCareerDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const careerDropdownRef = useRef<HTMLDivElement>(null);

  const handleLoginClick = () => {
    setIsDropdownOpen(false);
    if (onNavigate) {
      onNavigate('login');
    }
  };

  const handleRegisterClick = () => {
    setIsDropdownOpen(false);
    if (onNavigate) {
      onNavigate('register');
    }
  };

  const handleEmployerLoginClick = () => {
    setIsDropdownOpen(false);
    if (onNavigate) {
      onNavigate('employer-login');
    }
  };

  const handleEmployersClick = () => {
    if (onNavigate) {
      onNavigate('employers');
    }
  };

  const handleFindJobsClick = () => {
    if (onNavigate) {
      // Check if user is logged in
      if (user) {
        // User is logged in, go directly to job listings
        onNavigate('job-listings');
      } else {
        // User not logged in, show registration flow
        onNavigate('register');
      }
    }
  };

  const handleCompaniesClick = () => {
    if (onNavigate) {
      // Check if user is logged in
      if (user) {
        // User is logged in, go directly to companies
        onNavigate('companies');
      } else {
        // User not logged in, show registration flow
        onNavigate('register');
      }
    }
  };

  const handleCareerResourcesClick = () => {
    if (onNavigate) {
      // Check if user is logged in
      if (user) {
        // User is logged in, go directly to career resources
        onNavigate('career-resources');
      } else {
        // User not logged in, show registration flow
        onNavigate('register');
      }
    }
  };





  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
      if (careerDropdownRef.current && !careerDropdownRef.current.contains(event.target as Node)) {
        setIsCareerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button 
              onClick={() => onNavigate && onNavigate('home')}
              className="bg-red-600 text-white px-4 py-2 rounded font-bold text-xl hover:bg-red-700 transition-colors cursor-pointer"
            >
              ZyncJobs
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 flex-1 justify-start ml-8">
            <button onClick={handleFindJobsClick} className="text-white hover:text-gray-300 font-medium transition-colors">
              Job Search
            </button>
            <button onClick={() => onNavigate && onNavigate('company-test')} className="text-white hover:text-gray-300 font-medium transition-colors">
              🔍 Company Search
            </button>
            <button onClick={handleCompaniesClick} className="text-white hover:text-gray-300 font-medium transition-colors">
              Companies
            </button>
            <div className="relative" ref={careerDropdownRef}>
              <button 
                onClick={() => setIsCareerDropdownOpen(!isCareerDropdownOpen)}
                className="flex items-center space-x-1 text-white hover:text-gray-300 font-medium transition-colors"
              >
                <span>Career Resources</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCareerDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isCareerDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50">
                  <button 
                    onClick={() => {
                      setIsCareerDropdownOpen(false);
                      onNavigate && onNavigate('career-advice');
                    }}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Career Coach Agent
                  </button>
                  <button 
                    onClick={() => {
                      setIsCareerDropdownOpen(false);
                      onNavigate && onNavigate('skill-gap-analysis');
                    }}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Skill Gap Analysis
                  </button>
                  <button 
                    onClick={() => {
                      setIsCareerDropdownOpen(false);
                      onNavigate && onNavigate('career-roadmap');
                    }}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Career Roadmap Generator
                  </button>
                  <button 
                    onClick={() => {
                      setIsCareerDropdownOpen(false);
                      onNavigate && onNavigate('interview-simulation');
                    }}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Interview Simulation
                  </button>
                  <button 
                    onClick={() => {
                      setIsCareerDropdownOpen(false);
                      onNavigate && onNavigate('salary-report');
                    }}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Salary Benchmarking Tool
                  </button>
                  <button 
                    onClick={() => {
                      setIsCareerDropdownOpen(false);
                      onNavigate && onNavigate('learning-path');
                    }}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Learning Path Generator
                  </button>
                  <button 
                    onClick={() => {
                      setIsCareerDropdownOpen(false);
                      onNavigate && onNavigate('resume-parser');
                    }}
                    className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Resume Parser Tool
                  </button>

                </div>
              )}
            </div>
            <button 
              onClick={() => {
                if (user) {
                  onNavigate && onNavigate('my-jobs');
                } else {
                  onNavigate && onNavigate('register');
                }
              }}
              className="text-white hover:text-gray-300 font-medium transition-colors"
            >
              My Jobs
            </button>

          </nav>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-6 ml-auto">
            {/* For Employers Dropdown */}
            <div className="relative">
              <button 
                onClick={handleEmployersClick}
                className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors"
              >
                <span>For Employers</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            {/* Login/Register Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors"
                >
                  <span>{user.name}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{user.type}</p>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate && onNavigate('dashboard');
                      }} 
                      className="flex items-center w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <User className="w-5 h-5 mr-3 text-gray-400" />
                      Profile
                    </button>
                    {user?.name === 'ZyncJobs Admin' && (
                      <>
                        <button 
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onNavigate && onNavigate('job-moderation');
                          }} 
                          className="flex items-center w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          <Settings className="w-5 h-5 mr-3 text-gray-400" />
                          Job Moderation
                        </button>
                        <button 
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onNavigate && onNavigate('resume-moderation');
                          }} 
                          className="flex items-center w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          <Settings className="w-5 h-5 mr-3 text-gray-400" />
                          Resume Moderation
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate && onNavigate('job-listings');
                      }} 
                      className="flex items-center w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <Search className="w-5 h-5 mr-3 text-gray-400" />
                      Recommended Jobs
                    </button>
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate && onNavigate('my-jobs');
                      }} 
                      className="flex items-center w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <Building className="w-5 h-5 mr-3 text-gray-400" />
                      My Jobs
                    </button>
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate && onNavigate('alerts');
                      }} 
                      className="flex items-center w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h5m5 0v6" />
                      </svg>
                      Alerts
                    </button>
                    <div className="border-t border-gray-700 mt-2 pt-2">
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate && onNavigate('settings');
                        }} 
                        className="flex items-center w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </button>
                      <button 
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onLogout && onLogout();
                        }} 
                        className="flex items-center w-full text-left px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 text-white hover:text-gray-300 transition-colors"
                >
                  <span>Login/Register</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button onClick={handleLoginClick} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      Login
                    </button>
                    <button onClick={handleRegisterClick} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      Register
                    </button>
                    <button onClick={handleEmployerLoginClick} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      Employer Login
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex-shrink-0">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-600">
            <div className="space-y-4">
              <button onClick={handleFindJobsClick} className="block text-left text-white hover:text-gray-300 font-medium">
                Job Search
              </button>
              <button onClick={handleCompaniesClick} className="block text-left text-white hover:text-gray-300 font-medium">
                Companies
              </button>
              <div className="space-y-2">
                <p className="text-white font-medium">Career Resources</p>
                <div className="pl-4 space-y-2">
                  <button 
                    onClick={() => onNavigate && onNavigate('career-advice')}
                    className="block text-left text-gray-300 hover:text-white text-sm"
                  >
                    Career Coach Agent
                  </button>
                  <button 
                    onClick={() => onNavigate && onNavigate('skill-gap-analysis')}
                    className="block text-left text-gray-300 hover:text-white text-sm"
                  >
                    Skill Gap Analysis
                  </button>
                  <button 
                    onClick={() => onNavigate && onNavigate('career-roadmap')}
                    className="block text-left text-gray-300 hover:text-white text-sm"
                  >
                    Career Roadmap Generator
                  </button>
                  <button 
                    onClick={() => onNavigate && onNavigate('interview-simulation')}
                    className="block text-left text-gray-300 hover:text-white text-sm"
                  >
                    Interview Simulation
                  </button>
                  <button 
                    onClick={() => onNavigate && onNavigate('salary-report')}
                    className="block text-left text-gray-300 hover:text-white text-sm"
                  >
                    Salary Benchmarking Tool
                  </button>
                  <button 
                    onClick={() => onNavigate && onNavigate('learning-path')}
                    className="block text-left text-gray-300 hover:text-white text-sm"
                  >
                    Learning Path Generator
                  </button>
                  <button 
                    onClick={() => onNavigate && onNavigate('resume-parser')}
                    className="block text-left text-gray-300 hover:text-white text-sm"
                  >
                    Resume Parser Tool
                  </button>
                  <button 
                    onClick={() => onNavigate && onNavigate('company-test')}
                    className="block text-left text-gray-300 hover:text-white text-sm"
                  >
                    🧪 Company Search Test
                  </button>

                </div>
              </div>
              <button 
                onClick={() => {
                  if (user) {
                    onNavigate && onNavigate('my-jobs');
                  } else {
                    onNavigate && onNavigate('register');
                  }
                }}
                className="block text-left text-white hover:text-gray-300 font-medium"
              >
                My Jobs
              </button>
              <div className="pt-4 border-t border-gray-600 space-y-3">
                <button onClick={handleEmployersClick} className="block text-left text-white hover:text-gray-300 font-medium">
                  For Employers
                </button>
                <button className="flex items-center space-x-2 text-white hover:text-gray-300 font-medium">
                  <User className="w-4 h-4" />
                  <span>Login/Register</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;