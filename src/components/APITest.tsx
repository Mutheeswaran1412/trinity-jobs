import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/env';

const APITest = () => {
  const [testResult, setTestResult] = useState('Testing...');

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('🔍 Testing API URL:', API_ENDPOINTS.BASE_URL);
        
        const response = await fetch(`${API_ENDPOINTS.BASE_URL}/api/test`);
        const data = await response.json();
        
        setTestResult(`✅ API Connected: ${JSON.stringify(data)}`);
      } catch (error) {
        setTestResult(`❌ API Error: ${error.message}`);
      }
    };

    testAPI();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <div><strong>API Test:</strong></div>
      <div>URL: {API_ENDPOINTS.BASE_URL}</div>
      <div>{testResult}</div>
    </div>
  );
};

export default APITest;