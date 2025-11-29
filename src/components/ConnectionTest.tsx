import React, { useState } from 'react';

const ConnectionTest: React.FC = () => {
  const [result, setResult] = useState<string>('');

  const testConnection = async () => {
    try {
      console.log('Testing connection to backend...');
      const response = await fetch('http://localhost:5001/api/test');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));
      
      if (!response.ok) {
        setResult(`❌ Backend returned ${response.status}`);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.log('Non-JSON response:', text);
        setResult(`❌ Backend not responding with JSON`);
        return;
      }
      
      const data = await response.json();
      console.log('Connection test result:', data);
      setResult(`✅ Connected: ${data.message}`);
    } catch (error) {
      console.error('Connection test failed:', error);
      setResult(`❌ Cannot reach backend - Is Flask running?`);
    }
  };

  const testRegister = async () => {
    try {
      console.log('Testing registration...');
      const response = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test${Date.now()}@example.com`,
          password: 'test123456',
          fullName: 'Test User',
          userType: 'jobseeker'
        })
      });
      const data = await response.json();
      console.log('Registration test result:', data);
      setResult(`✅ Registration: ${data.message || data.error}`);
    } catch (error) {
      console.error('Registration test failed:', error);
      setResult(`❌ Registration failed: ${error}`);
    }
  };

  return (
    <div style={{ position: 'fixed', top: '10px', right: '10px', background: 'white', padding: '10px', border: '1px solid #ccc', zIndex: 9999 }}>
      <h4>Backend Test</h4>
      <button onClick={testConnection} style={{ margin: '5px', padding: '5px 10px' }}>
        Test Connection
      </button>
      <button onClick={testRegister} style={{ margin: '5px', padding: '5px 10px' }}>
        Test Register
      </button>
      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        {result}
      </div>
    </div>
  );
};

export default ConnectionTest;