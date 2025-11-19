import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function testMistralAPI() {
  try {
    console.log('Testing Mistral AI API...');
    console.log('API Key:', process.env.OPENROUTER_API_KEY ? 'Present' : 'Missing');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          { role: 'user', content: 'Hello, test message' }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    });
    
    console.log('Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Mistral AI API is working!');
      console.log('Response:', data.choices[0].message.content);
    } else {
      const errorData = await response.text();
      console.log('❌ API Error:', response.status, response.statusText);
      console.log('Error details:', errorData);
    }
  } catch (error) {
    console.log('❌ Connection Error:', error.message);
  }
}

testMistralAPI();