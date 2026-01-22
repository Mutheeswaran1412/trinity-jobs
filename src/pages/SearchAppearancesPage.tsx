import React from 'react';
import { ArrowLeft, Search } from 'lucide-react';

interface SearchAppearancesPageProps {
  onNavigate: (page: string) => void;
}

const SearchAppearancesPage: React.FC<SearchAppearancesPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => onNavigate('candidate-dashboard')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
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