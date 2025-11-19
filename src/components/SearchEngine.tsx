import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Users, Star, Building, Globe, Briefcase, Sparkles } from 'lucide-react';
import { searchAPI } from '../api/search';

const SearchEngine: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const searchResults = await searchAPI(query);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  const getSuggestions = (input: string): string[] => {
    const allJobs = [
      'React Developer', 'Python Developer', 'Java Developer', 'JavaScript Developer', 'Node.js Developer',
      'Angular Developer', 'Vue.js Developer', 'PHP Developer', 'C# Developer', 'Go Developer',
      'Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'AI Engineer',
      'UI/UX Designer', 'Graphic Designer', 'Product Designer', 'Web Designer',
      'Content Writer', 'Content Manager', 'Marketing Manager', 'Digital Marketing Specialist',
      'Sales Executive', 'Business Development Manager', 'Account Manager',
      'Project Manager', 'Product Manager', 'Scrum Master', 'Business Analyst',
      'DevOps Engineer', 'Cloud Engineer', 'Cybersecurity Analyst', 'QA Engineer'
    ];
    
    const allLocations = [
      'Chennai', 'Bangalore', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune', 'Kolkata', 'Kochi',
      'New York', 'California', 'Texas', 'Florida', 'Washington', 'Chicago', 'Boston',
      'Toronto', 'Vancouver', 'Montreal', 'London', 'Manchester', 'Berlin', 'Munich',
      'Sydney', 'Melbourne', 'Singapore', 'Tokyo', 'Dubai', 'Remote', 'Work from Home'
    ];

    if (!input || input.length < 1) return [];
    
    const inputLower = input.toLowerCase();
    const jobMatches = allJobs.filter(job => job.toLowerCase().includes(inputLower));
    const locationMatches = allLocations.filter(location => location.toLowerCase().includes(inputLower));
    
    return [...jobMatches, ...locationMatches].slice(0, 8);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 2) {
      const newSuggestions = getSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const renderCompanyCard = (company: any) => (
    <div key={`company-${company.id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4 mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
          <Building className="w-8 h-8 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            {company.name}
          </h3>
          <p className="text-sm text-gray-600">{company.industry}</p>
          <div className="flex items-center space-x-1 mt-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{company.rating}</span>
          </div>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4">{company.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{company.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{company.employees} employees</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Globe className="w-4 h-4" />
          <span>{company.website}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-sm text-blue-600 font-medium">
          {company.openJobs} open positions
        </span>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
          View Company
        </button>
      </div>
    </div>
  );

  const renderJobCard = (job: any) => (
    <div key={`job-${job.id}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2">
            {job.role}
          </h3>
          <p className="text-gray-600 font-medium">{job.company}</p>
          <div className="flex items-center text-gray-600 mt-1">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{job.location}</span>
            <span className="mx-2">•</span>
            <span>{job.type}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4">{job.description}</p>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, 4).map((skill: string, index: number) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {skill}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-gray-500 text-sm">+{job.skills.length - 4} more</span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-sm text-green-600 font-medium">{job.salary}</span>
        <div className="space-x-2">
          <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
            Save Job
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Search Jobs & Companies</h1>
          
          <div className="relative max-w-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Smart Search</span>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="searchInput"
                type="text"
                placeholder="Search jobs, companies, locations (e.g., React Developer, Chennai)..."
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0 flex items-center"
                    >
                      <Search className="w-4 h-4 text-gray-400 mr-3" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? 'Searching...' : `${results.length} results found`}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">Try different keywords or browse all opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.map((item) => 
              item.type === 'company' ? renderCompanyCard(item) : renderJobCard(item)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchEngine;