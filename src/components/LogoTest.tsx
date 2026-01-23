import React from 'react';

const LogoTest: React.FC = () => {
  const testTrinityLogo = () => {
    const logoPath = '/images/company-logos/trinity-logo.webp';
    console.log('Testing Trinity logo path:', logoPath);
    
    // Test if image loads
    const img = new Image();
    img.onload = () => console.log('Trinity logo loaded successfully');
    img.onerror = () => console.log('Trinity logo failed to load');
    img.src = logoPath;
  };

  React.useEffect(() => {
    testTrinityLogo();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h3>Logo Test</h3>
      <img 
        src="/images/company-logos/trinity-logo.webp" 
        alt="Trinity Logo Test"
        style={{ width: '64px', height: '64px', border: '1px solid #ccc' }}
        onLoad={() => console.log('Direct Trinity logo loaded')}
        onError={() => console.log('Direct Trinity logo failed')}
      />
    </div>
  );
};

export default LogoTest;