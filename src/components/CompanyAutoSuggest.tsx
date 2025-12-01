import React, { useState, useEffect, useRef } from 'react';
import { Search, Building2 } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  logo: string;
  followers: number;
}

interface CompanyAutoSuggestProps {
  onSelect: (company: Company) => void;
  placeholder?: string;
  value?: string;
}

const CompanyAutoSuggest: React.FC<CompanyAutoSuggestProps> = ({
  onSelect,
  placeholder = "Search company...",
  value = ""
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Company[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.length >= 2) {
        searchCompanies(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const searchCompanies = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/company/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data);
      setIsOpen(true);
    } catch (error) {
      console.error('Company search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (company: Company) => {
    setQuery(company.name);
    setIsOpen(false);
    onSelect(company);
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {loading ? (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : results.length > 0 ? (
            results.map((company) => (
              <div
                key={company.id}
                onClick={() => handleSelect(company)}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 group"
              >
                <div className="flex-shrink-0 w-10 h-10 mr-3">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-10 h-10 rounded object-cover border border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-10 h-10 bg-blue-100 rounded flex items-center justify-center border border-gray-200 ${company.logo ? 'hidden' : ''}`}>
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900 truncate">{company.name}</div>
                    {(company as any).source === 'clearbit' && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full ml-2">
                        Live
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatFollowers(company.followers)} followers
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-blue-600">Select →</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-gray-500">No companies found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyAutoSuggest;