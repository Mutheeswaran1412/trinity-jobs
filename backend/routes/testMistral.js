import express from 'express';
import axios from 'axios';

const router = express.Router();

// Test Mistral AI connection
router.get('/test-mistral', async (req, res) => {
  try {
    console.log('Testing Mistral AI connection...');
    console.log('API Key:', process.env.OPENROUTER_API_KEY ? 'Present' : 'Missing');
    
    const testPrompt = `Analyze this job posting: "Software Engineer at Google, $120k salary, develop web applications". Respond with JSON: {"isSpam": false, "isFake": false, "riskScore": 10, "recommendation": "approve"}`;
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'mistralai/mistral-7b-instruct',
      messages: [{ role: 'user', content: testPrompt }],
      temperature: 0.1,
      max_tokens: 200
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
        'X-Title': 'ZyncJobs-Test'
      },
      timeout: 15000
    });

    console.log('Mistral AI Response:', response.data);
    
    res.json({
      success: true,
      message: 'Mistral AI is working!',
      response: response.data.choices[0].message.content,
      usage: response.data.usage
    });
    
  } catch (error) {
    console.error('Mistral AI Test Error:', error.response?.data || error.message);
    
    res.json({
      success: false,
      error: error.message,
      status: error.response?.status,
      details: error.response?.data,
      fallback: 'Using local analysis instead'
    });
  }
});

// Test job analysis
router.post('/test-job-analysis', async (req, res) => {
  try {
    const { mistralDetector } = await import('../utils/mistralJobDetector.js');
    
    const testJob = {
      jobTitle: req.body.jobTitle || 'Software Engineer',
      company: req.body.company || 'Tech Corp',
      location: req.body.location || 'San Francisco',
      description: req.body.description || 'We are looking for a skilled software engineer to join our team. Responsibilities include developing web applications, working with databases, and collaborating with cross-functional teams.',
      salary: { min: 80000, max: 120000, currency: 'USD' }
    };
    
    console.log('Testing job analysis for:', testJob.jobTitle);
    
    const analysis = await mistralDetector.detectJobIssues(testJob);
    
    res.json({
      success: true,
      jobData: testJob,
      analysis,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Job analysis test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;