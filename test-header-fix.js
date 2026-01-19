// Test script to verify header name consistency fix
console.log('=== Header Name Consistency Test ===');

// Check current localStorage user data
const currentUser = localStorage.getItem('user');
if (currentUser) {
  try {
    const userData = JSON.parse(currentUser);
    console.log('Current user data in localStorage:', userData);
    console.log('Available name fields:', {
      name: userData.name,
      fullName: userData.fullName,
      companyName: userData.companyName,
      company: userData.company,
      email: userData.email
    });
    
    // Show what name would be displayed
    const displayName = userData.name || userData.fullName || userData.companyName || userData.company || userData.email?.split('@')[0] || 'User';
    console.log('Display name that would be shown in header:', displayName);
  } catch (error) {
    console.error('Error parsing user data:', error);
  }
} else {
  console.log('No user data found in localStorage');
}

// Clear localStorage to test fresh login
console.log('\nClearing localStorage for fresh test...');
localStorage.removeItem('user');
console.log('localStorage cleared. Please login again to test the fix.');