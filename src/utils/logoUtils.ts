// Logo utility functions to ensure consistent logo URLs
export const getCompanyLogo = (companyName: string, domain?: string): string => {
  // If domain is provided, use img.logo.dev
  if (domain) {
    return `https://img.logo.dev/${domain}?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200`;
  }
  
  // Try to extract domain from company name
  const domainMap: { [key: string]: string } = {
    'google': 'google.com',
    'microsoft': 'microsoft.com',
    'amazon': 'amazon.com',
    'apple': 'apple.com',
    'meta': 'meta.com',
    'netflix': 'netflix.com',
    'tesla': 'tesla.com',
    'stripe': 'stripe.com',
    'trinity technology solutions': 'trinitetech.com',
    'trinity technology solution': 'trinitetech.com',
    'trinity tech': 'trinitetech.com',
    'trello': 'trello.com',
    'myntra': 'myntra.com',
    'cleartrip': 'cleartrip.com',
    'makemytrip': 'makemytrip.com',
    'mindtree': 'mindtree.com',
    'reliance industries': 'ril.com',
    'tcs': 'tcs.com',
    'infosys': 'infosys.com',
    'wipro': 'wipro.com',
    'accenture': 'accenture.com',
    'ibm': 'ibm.com',
    'oracle': 'oracle.com',
    'salesforce': 'salesforce.com',
    'adobe': 'adobe.com',
    'uber': 'uber.com',
    'airbnb': 'airbnb.com',
    'spotify': 'spotify.com',
    'linkedin': 'linkedin.com',
    'twitter': 'twitter.com',
    'facebook': 'facebook.com',
    'instagram': 'instagram.com',
    'youtube': 'youtube.com',
    'github': 'github.com',
    'gitlab': 'gitlab.com',
    'slack': 'slack.com',
    'zoom': 'zoom.us',
    'dropbox': 'dropbox.com',
    'atlassian': 'atlassian.com',
    'jira': 'atlassian.com',
    'confluence': 'atlassian.com'
  };
  
  const companyLower = companyName.toLowerCase().trim();
  const matchedDomain = domainMap[companyLower];
  
  if (matchedDomain) {
    return `https://img.logo.dev/${matchedDomain}?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200`;
  }
  
  // Return empty string if no logo found - component should handle fallback
  return '';
};

export const sanitizeLogo = (logoUrl: string): string => {
  if (!logoUrl) return '';
  
  // If it's already a valid img.logo.dev URL, return as is
  if (logoUrl.includes('img.logo.dev')) {
    return logoUrl;
  }
  
  // Block clearbit and google favicon URLs - these cause tracking prevention errors
  if (logoUrl.includes('clearbit.com') || 
      logoUrl.includes('google.com/s2/favicons') || 
      logoUrl.includes('gstatic.com') ||
      logoUrl.includes('logo.clearbit.com')) {
    return '';
  }
  
  return logoUrl;
};

// Helper function to get safe logo URL for any company
export const getSafeCompanyLogo = (companyName: string, existingLogo?: string): string => {
  // First try to sanitize existing logo
  const sanitized = sanitizeLogo(existingLogo || '');
  if (sanitized) {
    return sanitized;
  }
  
  // If no valid existing logo, generate one from company name
  return getCompanyLogo(companyName);
};

// Generate letter avatar as fallback
export const getLetterAvatar = (companyName: string): string => {
  const letter = companyName.charAt(0).toUpperCase();
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'
  ];
  const colorIndex = companyName.length % colors.length;
  const color = colors[colorIndex];
  
  // Return SVG data URL
  const svg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" fill="${color}" rx="4"/>
    <text x="16" y="20" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">${letter}</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};