import React from 'react';
import { Search } from 'lucide-react';
import BackButton from '../components/BackButton';

interface SearchAppearancesPageProps {
  onNavigate: (page: string) => void;
}

const SearchAppearancesPage: React.FC<SearchAppearancesPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BackButton 
          onClick={() => window.history.back()}
          text="Back"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors mb-4"
        />
        <h1 className="text-2xl font-bold text-gray-900">Search Appearances</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <div className="p-8 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No search appearances yet</h3>
            <p className="text-gray-600">Optimize your profile to appear in more searches</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAppearancesPage;