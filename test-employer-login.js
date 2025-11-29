// Test specific employer login
const testEmployerLogin = async () => {
  try {
    console.log('Testing employer login: muthees@trinitetech.com');
    
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'muthees@trinitetech.com', 
        password: '123456' 
      }),
    });

    console.log(`Response Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login Success!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.json();
      console.log('❌ Login Failed!');
      console.log('Error:', JSON.stringify(error, null, 2));
    }
  } catch (err) {
    console.log('❌ Network Error!');
    console.log(`Error: ${err.message}`);
  }
};

testEmployerLogin();