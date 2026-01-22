// Utility functions for text processing

export const decodeHtmlEntities = (text: string | null | undefined): string => {
  if (!text || typeof text !== 'string') return text || '';
  
  const htmlEntities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™'
  };
  
  return text.replace(/&[#\w]+;/g, (entity) => {
    return htmlEntities[entity] || entity;
  });
};

export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return 'Recently posted';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    // Check if date is in the future (invalid)
    if (date > now) {
      return 'Recently posted';
    }
    
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else {
      return date.toLocaleDateString();
    }
  } catch (error) {
    return 'Recently posted';
  }
};

export const formatSalary = (salary: any): string => {
  if (!salary) return 'Competitive';
  
  if (typeof salary === 'object') {
    const { min, max, currency = 'USD', period = 'yearly' } = salary;
    if (min && max) {
      const currencySymbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;
      const periodText = period === 'yearly' ? 'per year' : 
                        period === 'monthly' ? 'per month' : 
                        period === 'hourly' ? 'per hour' : period;
      return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()} ${periodText}`;
    }
  }
  
  return salary.toString();
};