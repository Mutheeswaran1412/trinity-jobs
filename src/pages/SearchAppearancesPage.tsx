import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, TrendingUp, Calendar } from 'lucide-react';

interface SearchAppearancesPageProps {
  onNavigate: (page: string) => void;
}

const SearchAppearancesPage: React.FC<SearchAppearancesPageProps> = ({ onNavigate }) => {
  const [appearances, setAppearances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppearances: 0,
    thisWeek: 0,
    topKeywords: [] as string[]
  });

  useEffect(() => {
    // Simulate loading search appearances
    setTimeout(() => {
      setAppearances([
        {
          id: 1,
          searchQuery: 'Software Engineer React',
          company: 'Tech Corp',
          date: '2024-01-15',
          position: 3
        },
        {
          id: 2,
          searchQuery: 'Frontend Developer JavaScript',
          company: 'StartupXYZ',
          date: '2024-01-14',
          position: 7
        }
      ]);
      
      setStats({
        totalAppearances: 15,
        thisWeek: 3,
        topKeywords: ['React', 'JavaScript', 'Frontend', 'Node.js']
      });
      
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => onNavigate('candidate-dashboard')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Search Appearances</h1>
          <p className="text-gray-600">See how often your profile appears in recruiter searches</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Search className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAppearances}</p>
                <p className="text-sm text-gray-600">Total Appearances</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">Last 30 days</p>
                <p className="text-sm text-gray-600">Tracking Period</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Keywords */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Search Keywords</h2>
          <div className="flex flex-wrap gap-2">
            {stats.topKeywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Search Appearances List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Search Appearances</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading search appearances...</p>
            </div>
          ) : appearances.length > 0 ? (
            <div className="divide-y">
              {appearances.map((appearance) => (
                <div key={appearance.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        "{appearance.searchQuery}"
                      </h3>
                      <p className="text-gray-600 mb-2">Searched by {appearance.company}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Position #{appearance.position} in results</span>
                        <span>{new Date(appearance.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appearance.position <= 5 
                          ? 'bg-green-100 text-green-800' 
                          : appearance.position <= 10
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        #{appearance.position}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No search appearances yet</h3>
              <p className="text-gray-600 mb-4">
                Optimize your profile with relevant skills and keywords to appear in more searches
              </p>
              <button
                onClick={() => onNavigate('candidate-profile')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Optimize Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAppearancesPage;