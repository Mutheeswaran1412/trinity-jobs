export const getCompanyLogo = (companyName: string): string => {
  if (!companyName) return '/images/trinity-logo.svg';
  
  // Get domain from company name
  const domain = getCompanyDomain(companyName);
  
  if (domain && isValidDomain(domain)) {
    return `https://logo.clearbit.com/${domain}`;
  }
  
  // Return default logo for unknown companies
  return '/images/trinity-logo.svg';
};

const isValidDomain = (domain: string): boolean => {
  // List of known working domains
  const validDomains = [
    'google.com', 'microsoft.com', 'apple.com', 'amazon.com',
    'facebook.com', 'meta.com', 'netflix.com', 'tesla.com',
    'uber.com', 'airbnb.com', 'spotify.com', 'twitter.com',
    'linkedin.com', 'adobe.com', 'salesforce.com', 'oracle.com',
    'ibm.com', 'intel.com', 'nvidia.com', 'paypal.com'
  ];
  
  return validDomains.includes(domain);
};

const getCompanyDomain = (companyName: string): string => {
  const name = companyName.toLowerCase();
  
  // Common company domain mappings
  const domainMap: { [key: string]: string } = {
    'google': 'google.com',
    'microsoft': 'microsoft.com',
    'apple': 'apple.com',
    'amazon': 'amazon.com',
    'facebook': 'facebook.com',
    'meta': 'meta.com',
    'netflix': 'netflix.com',
    'tesla': 'tesla.com',
    'uber': 'uber.com',
    'airbnb': 'airbnb.com',
    'spotify': 'spotify.com',
    'twitter': 'twitter.com',
    'linkedin': 'linkedin.com',
    'instagram': 'instagram.com',
    'youtube': 'youtube.com',
    'adobe': 'adobe.com',
    'salesforce': 'salesforce.com',
    'oracle': 'oracle.com',
    'ibm': 'ibm.com',
    'intel': 'intel.com',
    'nvidia': 'nvidia.com',
    'paypal': 'paypal.com',
    'ebay': 'ebay.com',
    'zoom': 'zoom.us',
    'slack': 'slack.com',
    'dropbox': 'dropbox.com',
    'github': 'github.com',
    'gitlab': 'gitlab.com',
    'atlassian': 'atlassian.com',
    'shopify': 'shopify.com',
    'stripe': 'stripe.com',
    'square': 'squareup.com',
    'twilio': 'twilio.com',
    'mongodb': 'mongodb.com',
    'redis': 'redis.com',
    'docker': 'docker.com',
    'kubernetes': 'kubernetes.io',
    'aws': 'aws.amazon.com',
    'azure': 'azure.microsoft.com',
    'gcp': 'cloud.google.com',
    'trinity technology solutions': 'trinitetech.com',
    'trinity tech': 'trinitetech.com',
    'trinitytech': 'trinitetech.com',
    'trinity': 'trinitetech.com'
  };
  
  // Check for exact matches first
  if (domainMap[name]) {
    return domainMap[name];
  }
  
  // Check for partial matches
  for (const [key, domain] of Object.entries(domainMap)) {
    if (name.includes(key) || key.includes(name)) {
      return domain;
    }
  }
  
  // Try to construct domain from company name (only for well-known patterns)
  return '';
};