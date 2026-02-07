import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company.js';
import fetch from 'node-fetch';

dotenv.config();

const MISTRAL_API_URL = 'https://api.openrouter.ai/api/v1/chat/completions';

async function generateCompaniesWithMistral() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const prompt = `Generate 500 real company names from different industries and countries. Include:
- Tech companies (Google, Microsoft, Apple, Meta, Amazon, Netflix, Uber, Airbnb, Stripe, Zoom, Slack, Dropbox, Spotify, Adobe, Oracle, SAP, Salesforce, ServiceNow, Snowflake, Palantir, etc.)
- Indian companies (TCS, Infosys, Wipro, HCL, Tech Mahindra, Reliance, HDFC, ICICI, SBI, Flipkart, Paytm, Zomato, Swiggy, Ola, BYJU'S, etc.)
- Banks (JPMorgan Chase, Bank of America, Wells Fargo, Goldman Sachs, Morgan Stanley, Citigroup, etc.)
- Consulting (McKinsey, BCG, Bain, Deloitte, PwC, EY, KPMG, Accenture, etc.)
- Automotive (Tesla, Toyota, BMW, Mercedes, Ford, GM, Volkswagen, etc.)
- Airlines (Emirates, Delta, American Airlines, United, Southwest, etc.)
- Retail (Walmart, Target, Costco, Home Depot, etc.)
- Healthcare (Johnson & Johnson, Pfizer, Moderna, Novartis, etc.)
- Energy (ExxonMobil, Shell, BP, Chevron, etc.)
- Food & Beverage (Coca-Cola, PepsiCo, Nestle, Unilever, etc.)

Return ONLY a JSON array with this exact format:
[
  {"name": "Google"},
  {"name": "Microsoft"},
  {"name": "Apple"}
]

No explanations, just the JSON array with 500 companies.`;

    console.log('🤖 Generating companies with Mistral AI...');

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'Trinity Jobs Company Generator'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('🎯 AI Response received, processing...');

    // Extract JSON from response
    let companiesData;
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        companiesData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response, using fallback companies');
      companiesData = getFallbackCompanies();
    }

    console.log(`📊 Processing ${companiesData.length} companies...`);

    // Process companies and generate domains, logos, followers
    const processedCompanies = companiesData.map(company => {
      const name = company.name.trim();
      const domain = generateDomain(name);
      const logo = `https://logo.clearbit.com/${domain}`;
      const followers = generateFollowers(name);
      const industry = guessIndustry(name);
      const location = guessLocation(name);

      return {
        name,
        domain,
        logo,
        followers,
        industry,
        location,
        website: `https://${domain}`,
        employees: '1000+',
        rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10 // 3.5-5.0
      };
    });

    // Clear existing and add new companies
    await Company.deleteMany({});
    console.log('🗑️ Cleared existing companies');

    // Add in batches
    const batchSize = 50;
    for (let i = 0; i < processedCompanies.length; i += batchSize) {
      const batch = processedCompanies.slice(i, i + batchSize);
      await Company.insertMany(batch);
      console.log(`✅ Added batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(processedCompanies.length/batchSize)}`);
    }

    console.log(`🎉 Successfully added ${processedCompanies.length} companies to database!`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

function generateDomain(companyName) {
  return companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '')
    .replace(/inc|ltd|llc|corp|corporation|company|co|group|technologies|tech|systems|solutions|services|international|global/g, '')
    .trim() + '.com';
}

function generateFollowers(companyName) {
  const name = companyName.toLowerCase();
  
  // Tech giants
  if (['google', 'apple', 'microsoft', 'amazon', 'meta', 'facebook'].some(tech => name.includes(tech))) {
    return Math.floor(Math.random() * 10000000) + 10000000; // 10M-20M
  }
  
  // Large companies
  if (['tesla', 'netflix', 'uber', 'airbnb', 'spotify', 'adobe', 'oracle', 'salesforce'].some(large => name.includes(large))) {
    return Math.floor(Math.random() * 5000000) + 3000000; // 3M-8M
  }
  
  // Indian IT
  if (['tcs', 'infosys', 'wipro', 'hcl', 'tech mahindra', 'reliance'].some(indian => name.includes(indian))) {
    return Math.floor(Math.random() * 3000000) + 1000000; // 1M-4M
  }
  
  // Banks
  if (['bank', 'chase', 'goldman', 'morgan', 'wells fargo', 'citigroup'].some(bank => name.includes(bank))) {
    return Math.floor(Math.random() * 2000000) + 1000000; // 1M-3M
  }
  
  // Default
  return Math.floor(Math.random() * 500000) + 100000; // 100K-600K
}

function guessIndustry(companyName) {
  const name = companyName.toLowerCase();
  
  if (['google', 'microsoft', 'apple', 'meta', 'amazon', 'netflix', 'adobe', 'oracle', 'salesforce'].some(tech => name.includes(tech))) {
    return 'Technology';
  }
  if (['tcs', 'infosys', 'wipro', 'hcl', 'tech mahindra'].some(it => name.includes(it))) {
    return 'IT Services';
  }
  if (['bank', 'chase', 'goldman', 'morgan', 'wells fargo', 'hdfc', 'icici', 'sbi'].some(bank => name.includes(bank))) {
    return 'Banking';
  }
  if (['mckinsey', 'bcg', 'bain', 'deloitte', 'pwc', 'accenture'].some(consulting => name.includes(consulting))) {
    return 'Consulting';
  }
  if (['tesla', 'toyota', 'bmw', 'mercedes', 'ford', 'volkswagen'].some(auto => name.includes(auto))) {
    return 'Automotive';
  }
  if (['emirates', 'delta', 'american airlines', 'united', 'southwest'].some(airline => name.includes(airline))) {
    return 'Airlines';
  }
  
  return 'Technology'; // Default
}

function guessLocation(companyName) {
  const name = companyName.toLowerCase();
  
  if (['tcs', 'infosys', 'wipro', 'hcl', 'reliance', 'hdfc', 'icici', 'flipkart', 'paytm', 'zomato'].some(indian => name.includes(indian))) {
    return 'India';
  }
  if (['emirates'].some(uae => name.includes(uae))) {
    return 'Dubai, UAE';
  }
  if (['toyota'].some(japan => name.includes(japan))) {
    return 'Japan';
  }
  if (['bmw', 'mercedes', 'volkswagen', 'sap', 'siemens'].some(german => name.includes(german))) {
    return 'Germany';
  }
  
  return 'United States'; // Default
}

function getFallbackCompanies() {
  return [
    {"name": "Google"}, {"name": "Microsoft"}, {"name": "Apple"}, {"name": "Amazon"}, {"name": "Meta"},
    {"name": "Netflix"}, {"name": "Tesla"}, {"name": "Uber"}, {"name": "Airbnb"}, {"name": "Spotify"},
    {"name": "TCS"}, {"name": "Infosys"}, {"name": "Wipro"}, {"name": "HCL Technologies"}, {"name": "Tech Mahindra"},
    {"name": "JPMorgan Chase"}, {"name": "Goldman Sachs"}, {"name": "McKinsey & Company"}, {"name": "Deloitte"}, {"name": "PwC"}
  ];
}

generateCompaniesWithMistral();