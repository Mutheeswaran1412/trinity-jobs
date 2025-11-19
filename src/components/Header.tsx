import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Search, User, Building, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onNavigate?: (page: string) => void;
  user?: {name: string, type: 'candidate' | 'employer'} | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const megaMenuRef = useRef(null);

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
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-gray-800 shadow-lg sticky top-0 z-50">
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
            <button onClick={handleCompaniesClick} className="text-white hover:text-gray-300 font-medium transition-colors">
              Companies
            </button>
            <button onClick={handleCareerResourcesClick} className="text-white hover:text-gray-300 font-medium transition-colors">
              Career Resources
            </button>
            <button className="text-white hover:text-gray-300 font-medium transition-colors">
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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigate && onNavigate('dashboard');
                      }} 
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      Dashboard
                    </button>
                    <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      Logout
                    </button>
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
              <button onClick={handleCareerResourcesClick} className="block text-left text-white hover:text-gray-300 font-medium">
                Career Resources
              </button>
              <button className="block text-left text-white hover:text-gray-300 font-medium">
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