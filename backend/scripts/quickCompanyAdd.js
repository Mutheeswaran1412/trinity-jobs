import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company.js';

dotenv.config();

const uniqueCompanies = [
  'Accenture', 'Adidas', 'Adobe', 'Airbnb', 'Alibaba', 'AMD', 'Apple', 'ASML', 'Atlassian', 'Baidu',
  'BCG', 'BMW', 'Boeing', 'Booking.com', 'ByteDance', 'Canva', 'Capgemini', 'Cisco', 'Cloudflare', 'Coinbase',
  'Deloitte', 'Discord', 'Disney', 'Docker', 'Dropbox', 'eBay', 'Epic Games', 'EY', 'Facebook', 'Figma',
  'Flipkart', 'GitHub', 'GitLab', 'Goldman Sachs', 'Google', 'HCL Technologies', 'HDFC Bank', 'Huawei', 'IBM', 'ICICI Bank',
  'Infosys', 'Intel', 'JetBrains', 'JPMorgan Chase', 'Klarna', 'KPMG', 'LinkedIn', 'McKinsey', 'Mercedes-Benz', 'Meta',
  'Microsoft', 'MongoDB', 'Morgan Stanley', 'Netflix', 'Nike', 'Nintendo', 'NVIDIA', 'Oracle', 'Palantir', 'PayPal',
  'Paytm', 'PwC', 'Qualcomm', 'Razorpay', 'Reliance', 'Riot Games', 'Salesforce', 'Samsung', 'SAP', 'ServiceNow',
  'Shopify', 'Siemens', 'Slack', 'Snowflake', 'Sony', 'Spotify', 'Square', 'Stripe', 'TCS', 'Tesla',
  'Toyota', 'Twilio', 'Uber', 'Unilever', 'Valve', 'VMware', 'Volkswagen', 'Wells Fargo', 'Wipro', 'Xiaomi',
  'Zomato', 'Zoom', 'Swiggy', 'Ola', 'BYJU\'S', 'Unacademy', 'Freshworks', 'Zoho', 'InMobi', 'PhonePe'
];

function generateDomain(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/inc|ltd|corp|company/g, '') + '.com';
}

function generateFollowers(name) {
  const hash = name.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
  return Math.abs(hash % 5000000) + 100000;
}

async function quickAdd() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Company.deleteMany({});
    console.log('Cleared existing companies');

    const companies = uniqueCompanies.map(name => ({
      name,
      domain: generateDomain(name),
      logo: `https://logo.clearbit.com/${generateDomain(name)}`,
      followers: generateFollowers(name),
      industry: 'Technology',
      location: 'Global',
      website: `https://${generateDomain(name)}`,
      employees: '1000+',
      rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
      isHiring: Math.random() > 0.3,
      workSetting: ['Remote', 'Hybrid', 'On-site'][Math.floor(Math.random() * 3)]
    }));

    await Company.insertMany(companies);
    console.log(`✅ Added ${companies.length} companies successfully!`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

quickAdd();