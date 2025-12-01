// Test login functionality
const testLogin = async (email, password, userType) => {
  try {
    console.log(`\n--- Testing ${userType} Login ---`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log(`Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login Success!');
      console.log(`User Type: ${data.user.userType}`);
      console.log(`Full Name: ${data.user.fullName}`);
      console.log(`Access Token: ${data.accessToken ? 'Generated' : 'Missing'}`);
      return true;
    } else {
      const error = await response.json();
      console.log('❌ Login Failed!');
      console.log(`Error: ${error.error}`);
      return false;
    }
  } catch (err) {
    console.log('❌ Network Error!');
    console.log(`Error: ${err.message}`);
    return false;
  }
};

// Test all login credentials
const runTests = async () => {
  console.log('🔍 Testing Login Functionality');
  console.log('================================');
  
  // Test candidate accounts
  await testLogin('test@candidate.com', '123456', 'Candidate');
  await testLogin('mutheeswaran1424@gmail.com', '123456', 'Candidate');
  
  // Test employer accounts
  await testLogin('test@employer.com', '123456', 'Employer');
  await testLogin('employer@test.com', '123456', 'Employer');
  await testLogin('hr@company.com', '123456', 'Employer');
  
  // Test invalid credentials
  await testLogin('invalid@email.com', 'wrongpass', 'Invalid');
  
  console.log('\n================================');
  console.log('✅ Test Complete!');
};

runTests();