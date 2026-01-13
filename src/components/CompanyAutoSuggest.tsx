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
    if (value && value !== query) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.length >= 2 && isOpen) {
        searchCompanies(query);
      } else if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, isOpen]);

  const searchCompanies = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/companies?search=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data);
      setIsOpen(true);
    } catch (error) {
      console.error('Company search error:', error);
      // Fallback companies if API fails
      const fallbackCompanies = [
        { id: '1', name: 'Google', logo: 'https://img.logo.dev/google.com?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200', followers: 1000000 },
        { id: '2', name: 'Amazon', logo: 'https://img.logo.dev/amazon.com?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200', followers: 800000 },
        { id: '3', name: 'Microsoft', logo: 'https://img.logo.dev/microsoft.com?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200', followers: 900000 },
        { id: '4', name: 'Apple', logo: 'https://img.logo.dev/apple.com?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200', followers: 1200000 },
        { id: '5', name: 'Meta', logo: 'https://img.logo.dev/meta.com?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200', followers: 700000 },
        { id: '6', name: 'Trinity Technology Solutions', logo: 'https://img.logo.dev/trinitetech.com?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200', followers: 5000 }
      ];
      const filtered = fallbackCompanies.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
      setIsOpen(filtered.length > 0);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (company: Company) => {
    console.log('CompanyAutoSuggest - Selected company:', company);
    setQuery(company.name);
    setResults([]);
    setIsOpen(false);
    
    // Ensure logo is properly set
    const companyWithLogo = {
      ...company,
      logo: company.logo || `https://img.logo.dev/${company.name.toLowerCase().replace(/\s+/g, '')}.com?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200`
    };
    
    onSelect(companyWithLogo);
  };

  const formatFollowers = (count: number | undefined) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getCompanyLogo = (company: Company) => {
    // Try multiple logo sources
    const logoSources = [
      company.logo,
      `https://logo.clearbit.com/${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
      `https://img.logo.dev/${company.name.toLowerCase().replace(/\s+/g, '')}.com?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200`,
      `https://www.google.com/s2/favicons?domain=${company.name.toLowerCase().replace(/\s+/g, '')}.com&sz=64`
    ];
    
    return logoSources.find(url => url) || logoSources[1];
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length >= 2) {
              setIsOpen(true);
            }
          }}
          onFocus={() => {
            if (query.length >= 2) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => setIsOpen(false), 200);
          }}
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
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(company);
                }}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 group"
              >
                <div className="flex-shrink-0 w-10 h-10 mr-3">
                  <div className="w-10 h-10 rounded border border-gray-200 flex items-center justify-center bg-white">
                    <img 
                      src={getCompanyLogo(company)} 
                      alt={company.name}
                      className="w-8 h-8 object-contain"
                      onLoad={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'block';
                      }}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        // Try next logo source
                        const currentSrc = img.src;
                        const logoSources = [
                          `https://logo.clearbit.com/${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
                          `https://img.logo.dev/${company.name.toLowerCase().replace(/\s+/g, '')}.com?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200`,
                          `https://www.google.com/s2/favicons?domain=${company.name.toLowerCase().replace(/\s+/g, '')}.com&sz=64`
                        ];
                        
                        const currentIndex = logoSources.indexOf(currentSrc);
                        if (currentIndex < logoSources.length - 1) {
                          img.src = logoSources[currentIndex + 1];
                        } else {
                          // All sources failed, show initial
                          const container = img.parentElement;
                          if (container) {
                            container.innerHTML = `<div class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">${company.name.charAt(0)}</div>`;
                          }
                        }
                      }}
                    />
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