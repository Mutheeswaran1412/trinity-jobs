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

  // Get company logo (placeholder)
  const getCompanyLogo = (companyName: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&size=64&background=3b82f6&color=ffffff&bold=true`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNavigate={onNavigate} user={user} onLogout={onLogout} />
      
      {/* Search Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search companies, industries, or locations"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

          </div>
        </div>
      </div>

      {/* Company Listings */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${companies.length} companies found`}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
            <div key={company._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start space-x-4 mb-4">
                <img 
                  src={getCompanyLogo(company.name)} 
                  alt={company.name}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
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

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {company.description}
              </p>

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
                <button 
                  onClick={() => onNavigate && onNavigate('company-view', { companyName: company.name })}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  View Profile
                </button>
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