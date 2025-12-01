// Test employer login
import fetch from 'node-fetch';

async function testEmployerLogin() {
  const testCredentials = [
    { email: 'test@employer.com', password: '123456' },
    { email: 'employer@test.com', password: '123456' },
    { email: 'hr@company.com', password: '123456' },
    { email: 'admin@trinity.com', password: '123456' }
  ];

  console.log('🧪 Testing Employer Login...\n');

  for (const cred of testCredentials) {
    try {
      console.log(`Testing: ${cred.email}`);
      
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cred),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ SUCCESS: ${cred.email}`);
        console.log(`   User Type: ${data.user.userType}`);
        console.log(`   Full Name: ${data.user.fullName}`);
        console.log(`   Access Token: ${data.accessToken ? 'Generated' : 'Missing'}\n`);
      } else {
        console.log(`❌ FAILED: ${cred.email}`);
        console.log(`   Error: ${data.error}\n`);
      }
    } catch (error) {
      console.log(`❌ ERROR: ${cred.email}`);
      console.log(`   Error: ${error.message}\n`);
    }
  }
}

testEmployerLogin();