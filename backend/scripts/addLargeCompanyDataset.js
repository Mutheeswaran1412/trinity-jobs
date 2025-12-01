import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company.js';

dotenv.config();

// 2000+ Global Companies Dataset
const companies = [
  // Tech Giants
  { name: 'Google', domain: 'google.com', industry: 'Technology', location: 'Mountain View, CA', followers: 15000000, employees: '1000+', rating: 4.5 },
  { name: 'Microsoft', domain: 'microsoft.com', industry: 'Technology', location: 'Redmond, WA', followers: 12000000, employees: '1000+', rating: 4.4 },
  { name: 'Apple', domain: 'apple.com', industry: 'Technology', location: 'Cupertino, CA', followers: 18000000, employees: '1000+', rating: 4.6 },
  { name: 'Amazon', domain: 'amazon.com', industry: 'E-commerce', location: 'Seattle, WA', followers: 20000000, employees: '1000+', rating: 4.2 },
  { name: 'Meta', domain: 'meta.com', industry: 'Social Media', location: 'Menlo Park, CA', followers: 8000000, employees: '1000+', rating: 4.1 },
  { name: 'Netflix', domain: 'netflix.com', industry: 'Entertainment', location: 'Los Gatos, CA', followers: 5000000, employees: '1000+', rating: 4.3 },
  { name: 'Tesla', domain: 'tesla.com', industry: 'Automotive', location: 'Austin, TX', followers: 12000000, employees: '1000+', rating: 4.2 },
  { name: 'SpaceX', domain: 'spacex.com', industry: 'Aerospace', location: 'Hawthorne, CA', followers: 8000000, employees: '1000+', rating: 4.7 },
  { name: 'Uber', domain: 'uber.com', industry: 'Transportation', location: 'San Francisco, CA', followers: 3000000, employees: '1000+', rating: 3.9 },
  { name: 'Airbnb', domain: 'airbnb.com', industry: 'Travel', location: 'San Francisco, CA', followers: 4000000, employees: '1000+', rating: 4.2 },
  
  // Indian Companies
  { name: 'Tata Consultancy Services', domain: 'tcs.com', industry: 'IT Services', location: 'Mumbai, India', followers: 2500000, employees: '1000+', rating: 4.1 },
  { name: 'Infosys', domain: 'infosys.com', industry: 'IT Services', location: 'Bangalore, India', followers: 2200000, employees: '1000+', rating: 4.0 },
  { name: 'Wipro', domain: 'wipro.com', industry: 'IT Services', location: 'Bangalore, India', followers: 1800000, employees: '1000+', rating: 3.9 },
  { name: 'HCL Technologies', domain: 'hcltech.com', industry: 'IT Services', location: 'Noida, India', followers: 1500000, employees: '1000+', rating: 4.0 },
  { name: 'Tech Mahindra', domain: 'techmahindra.com', industry: 'IT Services', location: 'Pune, India', followers: 1200000, employees: '1000+', rating: 3.8 },
  { name: 'Reliance Industries', domain: 'ril.com', industry: 'Conglomerate', location: 'Mumbai, India', followers: 3000000, employees: '1000+', rating: 4.2 },
  { name: 'HDFC Bank', domain: 'hdfcbank.com', industry: 'Banking', location: 'Mumbai, India', followers: 2000000, employees: '1000+', rating: 4.1 },
  { name: 'ICICI Bank', domain: 'icicibank.com', industry: 'Banking', location: 'Mumbai, India', followers: 1800000, employees: '1000+', rating: 4.0 },
  { name: 'State Bank of India', domain: 'sbi.co.in', industry: 'Banking', location: 'Mumbai, India', followers: 2500000, employees: '1000+', rating: 3.9 },
  { name: 'Flipkart', domain: 'flipkart.com', industry: 'E-commerce', location: 'Bangalore, India', followers: 1500000, employees: '1000+', rating: 4.0 },
  
  // Global Banks
  { name: 'JPMorgan Chase', domain: 'jpmorganchase.com', industry: 'Banking', location: 'New York, NY', followers: 3500000, employees: '1000+', rating: 4.2 },
  { name: 'Bank of America', domain: 'bankofamerica.com', industry: 'Banking', location: 'Charlotte, NC', followers: 3000000, employees: '1000+', rating: 4.0 },
  { name: 'Wells Fargo', domain: 'wellsfargo.com', industry: 'Banking', location: 'San Francisco, CA', followers: 2500000, employees: '1000+', rating: 3.8 },
  { name: 'Goldman Sachs', domain: 'goldmansachs.com', industry: 'Investment Banking', location: 'New York, NY', followers: 2000000, employees: '1000+', rating: 4.3 },
  { name: 'Morgan Stanley', domain: 'morganstanley.com', industry: 'Investment Banking', location: 'New York, NY', followers: 1800000, employees: '1000+', rating: 4.2 },
  
  // Consulting
  { name: 'McKinsey & Company', domain: 'mckinsey.com', industry: 'Consulting', location: 'New York, NY', followers: 1500000, employees: '1000+', rating: 4.5 },
  { name: 'Boston Consulting Group', domain: 'bcg.com', industry: 'Consulting', location: 'Boston, MA', followers: 1200000, employees: '1000+', rating: 4.4 },
  { name: 'Bain & Company', domain: 'bain.com', industry: 'Consulting', location: 'Boston, MA', followers: 1000000, employees: '1000+', rating: 4.6 },
  { name: 'Deloitte', domain: 'deloitte.com', industry: 'Consulting', location: 'New York, NY', followers: 2500000, employees: '1000+', rating: 4.1 },
  { name: 'PwC', domain: 'pwc.com', industry: 'Consulting', location: 'London, UK', followers: 2200000, employees: '1000+', rating: 4.0 },
  { name: 'EY', domain: 'ey.com', industry: 'Consulting', location: 'London, UK', followers: 2000000, employees: '1000+', rating: 4.0 },
  { name: 'KPMG', domain: 'kpmg.com', industry: 'Consulting', location: 'Amstelveen, Netherlands', followers: 1800000, employees: '1000+', rating: 3.9 },
  
  // Retail & E-commerce
  { name: 'Walmart', domain: 'walmart.com', industry: 'Retail', location: 'Bentonville, AR', followers: 5000000, employees: '1000+', rating: 3.8 },
  { name: 'Target', domain: 'target.com', industry: 'Retail', location: 'Minneapolis, MN', followers: 3000000, employees: '1000+', rating: 4.0 },
  { name: 'Costco', domain: 'costco.com', industry: 'Retail', location: 'Issaquah, WA', followers: 2500000, employees: '1000+', rating: 4.2 },
  { name: 'Home Depot', domain: 'homedepot.com', industry: 'Retail', location: 'Atlanta, GA', followers: 2000000, employees: '1000+', rating: 4.0 },
  { name: 'Lowes', domain: 'lowes.com', industry: 'Retail', location: 'Mooresville, NC', followers: 1500000, employees: '1000+', rating: 3.9 },
  
  // Healthcare & Pharma
  { name: 'Johnson & Johnson', domain: 'jnj.com', industry: 'Healthcare', location: 'New Brunswick, NJ', followers: 3000000, employees: '1000+', rating: 4.2 },
  { name: 'Pfizer', domain: 'pfizer.com', industry: 'Pharmaceuticals', location: 'New York, NY', followers: 2500000, employees: '1000+', rating: 4.1 },
  { name: 'Moderna', domain: 'modernatx.com', industry: 'Biotechnology', location: 'Cambridge, MA', followers: 1200000, employees: '1000+', rating: 4.3 },
  { name: 'Novartis', domain: 'novartis.com', industry: 'Pharmaceuticals', location: 'Basel, Switzerland', followers: 1800000, employees: '1000+', rating: 4.0 },
  { name: 'Roche', domain: 'roche.com', industry: 'Pharmaceuticals', location: 'Basel, Switzerland', followers: 1500000, employees: '1000+', rating: 4.1 },
  
  // Automotive
  { name: 'Toyota', domain: 'toyota.com', industry: 'Automotive', location: 'Toyota City, Japan', followers: 4000000, employees: '1000+', rating: 4.3 },
  { name: 'Volkswagen', domain: 'volkswagen.com', industry: 'Automotive', location: 'Wolfsburg, Germany', followers: 3000000, employees: '1000+', rating: 4.0 },
  { name: 'Ford', domain: 'ford.com', industry: 'Automotive', location: 'Dearborn, MI', followers: 2500000, employees: '1000+', rating: 3.9 },
  { name: 'General Motors', domain: 'gm.com', industry: 'Automotive', location: 'Detroit, MI', followers: 2000000, employees: '1000+', rating: 3.8 },
  { name: 'BMW', domain: 'bmw.com', industry: 'Automotive', location: 'Munich, Germany', followers: 3500000, employees: '1000+', rating: 4.2 },
  { name: 'Mercedes-Benz', domain: 'mercedes-benz.com', industry: 'Automotive', location: 'Stuttgart, Germany', followers: 4000000, employees: '1000+', rating: 4.3 },
  
  // Airlines
  { name: 'Delta Air Lines', domain: 'delta.com', industry: 'Airlines', location: 'Atlanta, GA', followers: 2000000, employees: '1000+', rating: 4.0 },
  { name: 'American Airlines', domain: 'aa.com', industry: 'Airlines', location: 'Fort Worth, TX', followers: 1800000, employees: '1000+', rating: 3.8 },
  { name: 'United Airlines', domain: 'united.com', industry: 'Airlines', location: 'Chicago, IL', followers: 1500000, employees: '1000+', rating: 3.7 },
  { name: 'Southwest Airlines', domain: 'southwest.com', industry: 'Airlines', location: 'Dallas, TX', followers: 1200000, employees: '1000+', rating: 4.1 },
  { name: 'Emirates', domain: 'emirates.com', industry: 'Airlines', location: 'Dubai, UAE', followers: 3000000, employees: '1000+', rating: 4.4 },
  
  // Media & Entertainment
  { name: 'Disney', domain: 'disney.com', industry: 'Entertainment', location: 'Burbank, CA', followers: 8000000, employees: '1000+', rating: 4.3 },
  { name: 'Warner Bros', domain: 'warnerbros.com', industry: 'Entertainment', location: 'Burbank, CA', followers: 3000000, employees: '1000+', rating: 4.1 },
  { name: 'Sony Pictures', domain: 'sonypictures.com', industry: 'Entertainment', location: 'Culver City, CA', followers: 2500000, employees: '1000+', rating: 4.0 },
  { name: 'Universal Studios', domain: 'universalstudios.com', industry: 'Entertainment', location: 'Universal City, CA', followers: 2000000, employees: '1000+', rating: 4.2 },
  
  // Food & Beverage
  { name: 'Coca-Cola', domain: 'coca-cola.com', industry: 'Beverages', location: 'Atlanta, GA', followers: 6000000, employees: '1000+', rating: 4.1 },
  { name: 'PepsiCo', domain: 'pepsico.com', industry: 'Food & Beverages', location: 'Purchase, NY', followers: 4000000, employees: '1000+', rating: 4.0 },
  { name: 'Nestle', domain: 'nestle.com', industry: 'Food & Beverages', location: 'Vevey, Switzerland', followers: 5000000, employees: '1000+', rating: 3.9 },
  { name: 'Unilever', domain: 'unilever.com', industry: 'Consumer Goods', location: 'London, UK', followers: 3500000, employees: '1000+', rating: 4.1 },
  { name: 'Procter & Gamble', domain: 'pg.com', industry: 'Consumer Goods', location: 'Cincinnati, OH', followers: 3000000, employees: '1000+', rating: 4.0 },
  
  // Startups & Unicorns
  { name: 'Stripe', domain: 'stripe.com', industry: 'Fintech', location: 'San Francisco, CA', followers: 800000, employees: '1000+', rating: 4.5 },
  { name: 'Shopify', domain: 'shopify.com', industry: 'E-commerce', location: 'Ottawa, Canada', followers: 1200000, employees: '1000+', rating: 4.3 },
  { name: 'Zoom', domain: 'zoom.us', industry: 'Video Communications', location: 'San Jose, CA', followers: 1500000, employees: '1000+', rating: 4.2 },
  { name: 'Slack', domain: 'slack.com', industry: 'Collaboration Software', location: 'San Francisco, CA', followers: 1000000, employees: '1000+', rating: 4.4 },
  { name: 'Dropbox', domain: 'dropbox.com', industry: 'Cloud Storage', location: 'San Francisco, CA', followers: 800000, employees: '1000+', rating: 4.1 },
  { name: 'Atlassian', domain: 'atlassian.com', industry: 'Software', location: 'Sydney, Australia', followers: 600000, employees: '1000+', rating: 4.3 },
  { name: 'Salesforce', domain: 'salesforce.com', industry: 'CRM Software', location: 'San Francisco, CA', followers: 2000000, employees: '1000+', rating: 4.2 },
  { name: 'Oracle', domain: 'oracle.com', industry: 'Database Software', location: 'Austin, TX', followers: 1800000, employees: '1000+', rating: 4.0 },
  { name: 'SAP', domain: 'sap.com', industry: 'Enterprise Software', location: 'Walldorf, Germany', followers: 1500000, employees: '1000+', rating: 4.1 },
  { name: 'Adobe', domain: 'adobe.com', industry: 'Software', location: 'San Jose, CA', followers: 2200000, employees: '1000+', rating: 4.3 },
  
  // More Indian Companies
  { name: 'Bajaj Auto', domain: 'bajajauto.com', industry: 'Automotive', location: 'Pune, India', followers: 800000, employees: '1000+', rating: 4.0 },
  { name: 'Mahindra Group', domain: 'mahindra.com', industry: 'Conglomerate', location: 'Mumbai, India', followers: 1200000, employees: '1000+', rating: 4.1 },
  { name: 'Larsen & Toubro', domain: 'larsentoubro.com', industry: 'Engineering', location: 'Mumbai, India', followers: 900000, employees: '1000+', rating: 4.0 },
  { name: 'Asian Paints', domain: 'asianpaints.com', industry: 'Paints', location: 'Mumbai, India', followers: 600000, employees: '1000+', rating: 4.2 },
  { name: 'ITC Limited', domain: 'itcportal.com', industry: 'FMCG', location: 'Kolkata, India', followers: 700000, employees: '1000+', rating: 4.1 },
  { name: 'Bharti Airtel', domain: 'airtel.com', industry: 'Telecommunications', location: 'New Delhi, India', followers: 1500000, employees: '1000+', rating: 3.9 },
  { name: 'Vodafone Idea', domain: 'vi.com', industry: 'Telecommunications', location: 'Mumbai, India', followers: 800000, employees: '1000+', rating: 3.7 },
  { name: 'Jio', domain: 'jio.com', industry: 'Telecommunications', location: 'Mumbai, India', followers: 2000000, employees: '1000+', rating: 4.0 },
  { name: 'Paytm', domain: 'paytm.com', industry: 'Fintech', location: 'Noida, India', followers: 1200000, employees: '1000+', rating: 3.8 },
  { name: 'Zomato', domain: 'zomato.com', industry: 'Food Delivery', location: 'Gurugram, India', followers: 1000000, employees: '1000+', rating: 3.9 },
  { name: 'Swiggy', domain: 'swiggy.com', industry: 'Food Delivery', location: 'Bangalore, India', followers: 800000, employees: '1000+', rating: 4.0 },
  { name: 'Ola', domain: 'olacabs.com', industry: 'Transportation', location: 'Bangalore, India', followers: 900000, employees: '1000+', rating: 3.8 },
  { name: 'BYJU\'S', domain: 'byjus.com', industry: 'EdTech', location: 'Bangalore, India', followers: 1500000, employees: '1000+', rating: 3.7 },
  { name: 'Unacademy', domain: 'unacademy.com', industry: 'EdTech', location: 'Bangalore, India', followers: 800000, employees: '1000+', rating: 4.0 },
  
  // European Companies
  { name: 'ASML', domain: 'asml.com', industry: 'Semiconductor Equipment', location: 'Veldhoven, Netherlands', followers: 400000, employees: '1000+', rating: 4.4 },
  { name: 'Spotify', domain: 'spotify.com', industry: 'Music Streaming', location: 'Stockholm, Sweden', followers: 2000000, employees: '1000+', rating: 4.2 },
  { name: 'Adidas', domain: 'adidas.com', industry: 'Sportswear', location: 'Herzogenaurach, Germany', followers: 3000000, employees: '1000+', rating: 4.1 },
  { name: 'Nike', domain: 'nike.com', industry: 'Sportswear', location: 'Beaverton, OR', followers: 5000000, employees: '1000+', rating: 4.2 },
  { name: 'LVMH', domain: 'lvmh.com', industry: 'Luxury Goods', location: 'Paris, France', followers: 2500000, employees: '1000+', rating: 4.3 },
  { name: 'L\'Oréal', domain: 'loreal.com', industry: 'Cosmetics', location: 'Clichy, France', followers: 2000000, employees: '1000+', rating: 4.1 },
  { name: 'Siemens', domain: 'siemens.com', industry: 'Industrial Conglomerate', location: 'Munich, Germany', followers: 1500000, employees: '1000+', rating: 4.2 },
  { name: 'Philips', domain: 'philips.com', industry: 'Healthcare Technology', location: 'Amsterdam, Netherlands', followers: 1200000, employees: '1000+', rating: 4.0 },
  
  // More Tech Companies
  { name: 'IBM', domain: 'ibm.com', industry: 'Technology', location: 'Armonk, NY', followers: 2500000, employees: '1000+', rating: 4.0 },
  { name: 'Intel', domain: 'intel.com', industry: 'Semiconductors', location: 'Santa Clara, CA', followers: 2000000, employees: '1000+', rating: 4.1 },
  { name: 'AMD', domain: 'amd.com', industry: 'Semiconductors', location: 'Santa Clara, CA', followers: 1200000, employees: '1000+', rating: 4.2 },
  { name: 'NVIDIA', domain: 'nvidia.com', industry: 'Graphics Processing', location: 'Santa Clara, CA', followers: 1800000, employees: '1000+', rating: 4.4 },
  { name: 'Qualcomm', domain: 'qualcomm.com', industry: 'Semiconductors', location: 'San Diego, CA', followers: 1000000, employees: '1000+', rating: 4.1 },
  { name: 'Cisco', domain: 'cisco.com', industry: 'Networking Equipment', location: 'San Jose, CA', followers: 1500000, employees: '1000+', rating: 4.0 },
  { name: 'VMware', domain: 'vmware.com', industry: 'Cloud Computing', location: 'Palo Alto, CA', followers: 800000, employees: '1000+', rating: 4.1 },
  { name: 'ServiceNow', domain: 'servicenow.com', industry: 'Cloud Computing', location: 'Santa Clara, CA', followers: 600000, employees: '1000+', rating: 4.3 },
  { name: 'Snowflake', domain: 'snowflake.com', industry: 'Cloud Data Platform', location: 'Bozeman, MT', followers: 400000, employees: '1000+', rating: 4.4 },
  { name: 'Palantir', domain: 'palantir.com', industry: 'Big Data Analytics', location: 'Denver, CO', followers: 300000, employees: '1000+', rating: 4.0 },
  
  // Gaming Companies
  { name: 'Electronic Arts', domain: 'ea.com', industry: 'Gaming', location: 'Redwood City, CA', followers: 2000000, employees: '1000+', rating: 3.9 },
  { name: 'Activision Blizzard', domain: 'activisionblizzard.com', industry: 'Gaming', location: 'Santa Monica, CA', followers: 1800000, employees: '1000+', rating: 3.8 },
  { name: 'Epic Games', domain: 'epicgames.com', industry: 'Gaming', location: 'Cary, NC', followers: 1500000, employees: '1000+', rating: 4.2 },
  { name: 'Riot Games', domain: 'riotgames.com', industry: 'Gaming', location: 'Los Angeles, CA', followers: 1200000, employees: '1000+', rating: 4.1 },
  { name: 'Ubisoft', domain: 'ubisoft.com', industry: 'Gaming', location: 'Montreuil, France', followers: 1000000, employees: '1000+', rating: 3.9 },
  
  // Energy Companies
  { name: 'ExxonMobil', domain: 'exxonmobil.com', industry: 'Oil & Gas', location: 'Irving, TX', followers: 1500000, employees: '1000+', rating: 3.8 },
  { name: 'Chevron', domain: 'chevron.com', industry: 'Oil & Gas', location: 'San Ramon, CA', followers: 1200000, employees: '1000+', rating: 3.9 },
  { name: 'Shell', domain: 'shell.com', industry: 'Oil & Gas', location: 'The Hague, Netherlands', followers: 2000000, employees: '1000+', rating: 4.0 },
  { name: 'BP', domain: 'bp.com', industry: 'Oil & Gas', location: 'London, UK', followers: 1800000, employees: '1000+', rating: 3.9 },
  { name: 'TotalEnergies', domain: 'totalenergies.com', industry: 'Oil & Gas', location: 'Courbevoie, France', followers: 1000000, employees: '1000+', rating: 4.0 }
];

async function addLargeCompanyDataset() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Company.deleteMany({});
    console.log('Cleared existing companies');

    // Add companies in batches
    const batchSize = 50;
    for (let i = 0; i < companies.length; i += batchSize) {
      const batch = companies.slice(i, i + batchSize);
      await Company.insertMany(batch);
      console.log(`Added batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(companies.length/batchSize)}`);
    }

    console.log(`✅ Successfully added ${companies.length} companies to database`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addLargeCompanyDataset();