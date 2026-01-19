import React, { useState, useEffect } from 'react';
import { Search, MapPin, Users, Star, Building, Globe } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface Company {
  _id: string;
  name: string;
  industry: string;
  rating: number;
  description: string;
  location: string;
  employees: string;
  website: string;
  openJobs: number;
  logo?: string;
}

const CompaniesPage = ({ onNavigate, user, onLogout }: { 
  onNavigate?: (page: string) => void;
  user?: {name: string, type: 'candidate' | 'employer'} | null;
  onLogout?: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch companies from API
  const fetchCompanies = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`http://localhost:5000/api/companies?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        console.error('Failed to fetch companies');
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [searchTerm]);

  // Get company logo - use Google favicons like employer registration
  const getCompanyLogo = (company: Company) => {
    // Use logo from API response if available
    if (company.logo && !company.logo.includes('ui-avatars.com')) {
      return company.logo;
    }
    
    // Use Google favicons with website domain (same as employer registration)
    if (company.website) {
      const domain = company.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    }
    
    // Fallback to letter avatar
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&size=64&background=3b82f6&color=ffffff&bold=true`;
  };

  // Handle logo error by showing letter avatar
  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const companyName = target.getAttribute('data-company-name') || '';
    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&size=64&background=3b82f6&color=ffffff&bold=true`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} user={user} onLogout={onLogout} />
      
      {/* Hero Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-lg mb-4">Browse Companies</p>
          <h1 className="text-5xl font-bold text-gray-900 mb-12">
            {loading ? 'Loading...' : `${companies.length} Companies`}
          </h1>
          
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by cities"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <select className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500">
              <option>Industry</option>
              <option>Technology</option>
              <option>Healthcare</option>
              <option>Finance</option>
              <option>Education</option>
            </select>
            <select className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500">
              <option>Size</option>
              <option>1-50 employees</option>
              <option>51-200 employees</option>
              <option>201-1000 employees</option>
              <option>1000+ employees</option>
            </select>
            <select className="px-6 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500">
              <option>Work Setting</option>
              <option>Remote</option>
              <option>Hybrid</option>
              <option>On-site</option>
            </select>
            <button className="px-6 py-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg font-medium flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Hiring</span>
            </button>
            <button className="px-4 py-3 text-blue-600 font-medium hover:text-blue-800">
              Clear filters
            </button>
          </div>
        </div>
      </div>

      {/* Company Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-gray-700 text-lg font-medium">
            {loading ? 'Loading...' : `${companies.length} tech companies`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-500">Try adjusting your search terms or browse all companies.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companies.map((company) => (
            <div key={company._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-center mb-6">
                <img 
                  src={getCompanyLogo(company)} 
                  alt={company.name}
                  data-company-name={company.name}
                  onError={handleLogoError}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{company.name}</h3>
                <p className="text-gray-600 mb-1">{company.location}</p>
                <p className="text-sm text-gray-500 mb-2">{company.industry}</p>
                {company.website && (
                  <a 
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-2"
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    Visit Website
                  </a>
                )}
                {company.openJobs > 0 && (
                  <p className="text-sm text-blue-600 font-medium">{company.openJobs} open jobs</p>
                )}
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
      
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default CompaniesPage;