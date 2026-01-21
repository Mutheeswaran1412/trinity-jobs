import React, { useState, useEffect, useRef } from 'react';
import { Building2 } from 'lucide-react';

interface Company {
  name: string;
  domain?: string;
  logo?: string;
  website?: string;
}

interface CompanyAutocompleteProps {
  value: string;
  onChange: (value: string, companyData?: Company) => void;
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
  const [isSelected, setIsSelected] = useState(false);
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
      if (value.length < 2 || isSelected) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/companies?search=${encodeURIComponent(value)}`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch (error) {
        console.error('Company search error:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchCompanies, 300);
    return () => clearTimeout(debounce);
  }, [value, isSelected]);

  const getCompanyLogo = (company: Company) => {
    // Use Clearbit as primary (better quality logos)
    if (company.domain) {
      return `https://logo.clearbit.com/${company.domain}`;
    }
    return null;
  };

  const getFallbackLogo = (company: Company) => {
    // Use Google favicon as fallback
    if (company.domain) {
      return `https://www.google.com/s2/favicons?domain=${company.domain}&sz=64`;
    }
    return null;
  };

  const handleSelect = (company: Company, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSelected(true);
    onChange(company.name, company);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          setIsSelected(false);
          onChange(e.target.value);
        }}
        onFocus={() => !isSelected && suggestions.length > 0 && setShowSuggestions(true)}
        placeholder={placeholder}
        className={className}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((company, index) => (
            <div
              key={`${company.domain || company.name}-${index}`}
              onMouseDown={(e) => handleSelect(company, e)}
              className="px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors flex items-center space-x-3"
            >
              <div className="w-8 h-8 flex-shrink-0">
                {getCompanyLogo(company) && (
                  <img
                    src={getCompanyLogo(company)!}
                    alt={company.name}
                    className="w-8 h-8 rounded object-contain bg-white border"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      const fallbackUrl = getFallbackLogo(company);
                      if (fallbackUrl && img.src !== fallbackUrl) {
                        img.src = fallbackUrl;
                      } else {
                        img.style.display = 'none';
                      }
                    }}
                  />
                )}
              </div>
              <span className="text-gray-900 font-medium">{company.name}</span>
              {company.domain && (
                <span className="text-gray-500 text-sm ml-auto">{company.domain}</span>
              )}
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
