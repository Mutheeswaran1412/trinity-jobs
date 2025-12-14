import React, { useState, useEffect, useRef } from 'react';
import { Building2 } from 'lucide-react';

interface Company {
  name: string;
  domain?: string;
}

interface CompanyAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CompanyAutocomplete: React.FC<CompanyAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Company name...',
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<Company[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/companies/search?q=${encodeURIComponent(value)}`);
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Company search error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchCompanies, 300);
    return () => clearTimeout(debounce);
  }, [value]);

  const getCompanyLogo = (domain?: string) => {
    if (!domain) return null;
    return `https://img.logo.dev/${domain}?token=pk_X-1ZO13CRYuFHfXgt5hQ`;
  };

  const handleSelect = (company: Company) => {
    onChange(company.name);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className={className}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((company, index) => (
            <div
              key={index}
              onClick={() => handleSelect(company)}
              className="px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors flex items-center space-x-3"
            >
              {company.domain ? (
                <img
                  src={getCompanyLogo(company.domain)}
                  alt={company.name}
                  className="w-8 h-8 rounded object-contain bg-white"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.onerror = () => {
                      img.style.display = 'none';
                      img.nextElementSibling?.classList.remove('hidden');
                    };
                    img.src = `https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`;
                  }}
                />
              ) : null}
              <div className={`w-8 h-8 rounded bg-indigo-100 flex items-center justify-center ${company.domain ? 'hidden' : ''}`}>
                <Building2 className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-gray-900">{company.name}</span>
            </div>
          ))}
        </div>
      )}
      
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default CompanyAutocomplete;
