import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import dotenv from 'dotenv';

dotenv.config();

// Company domain mapping for logo generation
const domainMap = {
  'google': 'google.com',
  'microsoft': 'microsoft.com',
  'amazon': 'amazon.com',
  'apple': 'apple.com',
  'meta': 'meta.com',
  'netflix': 'netflix.com',
  'tesla': 'tesla.com',
  'stripe': 'stripe.com',
  'trinity technology solutions': 'trinitetech.com',
  'trinity technology solution': 'trinitetech.com',
  'trinity tech': 'trinitetech.com',
  'trello': 'trello.com',
  'myntra': 'myntra.com',
  'cleartrip': 'cleartrip.com',
  'makemytrip': 'makemytrip.com',
  'mindtree': 'mindtree.com',
  'reliance industries': 'ril.com',
  'tcs': 'tcs.com',
  'infosys': 'infosys.com',
  'wipro': 'wipro.com',
  'accenture': 'accenture.com',
  'ibm': 'ibm.com',
  'oracle': 'oracle.com',
  'salesforce': 'salesforce.com',
  'adobe': 'adobe.com',
  'uber': 'uber.com',
  'airbnb': 'airbnb.com',
  'spotify': 'spotify.com',
  'linkedin': 'linkedin.com',
  'twitter': 'twitter.com',
  'facebook': 'facebook.com'
};

const getCompanyLogo = (companyName) => {
  const companyLower = companyName.toLowerCase().trim();
  const matchedDomain = domainMap[companyLower];
  
  if (matchedDomain) {
    return `https://img.logo.dev/${matchedDomain}?token=pk_X-NzP5XzTfCUQXerf-1rvQ&size=200`;
  }
  
  return '';
};

const isClearbitUrl = (url) => {
  if (!url) return false;
  return url.includes('clearbit.com') || 
         url.includes('logo.clearbit.com') ||
         url.includes('google.com/s2/favicons') ||
         url.includes('gstatic.com');
};

async function fixClearbitLogos() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all jobs with Clearbit URLs
    console.log('🔍 Finding jobs with Clearbit URLs...');
    const jobsWithClearbit = await Job.find({
      companyLogo: { $regex: /clearbit\.com|logo\.clearbit\.com|google\.com\/s2\/favicons|gstatic\.com/i }
    });

    console.log(`📊 Found ${jobsWithClearbit.length} jobs with Clearbit URLs`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const job of jobsWithClearbit) {
      console.log(`\n🔧 Processing job: ${job.jobTitle} at ${job.company}`);
      console.log(`   Current logo: ${job.companyLogo}`);

      // Generate new logo URL
      const newLogoUrl = getCompanyLogo(job.company);
      
      if (newLogoUrl) {
        // Update the job with new logo URL
        await Job.findByIdAndUpdate(job._id, {
          companyLogo: newLogoUrl
        });
        console.log(`   ✅ Updated logo: ${newLogoUrl}`);
        updatedCount++;
      } else {
        // Remove the Clearbit URL if we can't find a replacement
        await Job.findByIdAndUpdate(job._id, {
          companyLogo: ''
        });
        console.log(`   ⚠️  Removed Clearbit URL (no replacement found)`);
        skippedCount++;
      }
    }

    // Also fix company logos in Company collection
    console.log('\n🔍 Finding companies with Clearbit URLs...');
    const companiesWithClearbit = await Company.find({
      logo: { $regex: /clearbit\.com|logo\.clearbit\.com|google\.com\/s2\/favicons|gstatic\.com/i }
    });

    console.log(`📊 Found ${companiesWithClearbit.length} companies with Clearbit URLs`);

    for (const company of companiesWithClearbit) {
      console.log(`\n🔧 Processing company: ${company.name}`);
      console.log(`   Current logo: ${company.logo}`);

      const newLogoUrl = getCompanyLogo(company.name);
      
      if (newLogoUrl) {
        await Company.findByIdAndUpdate(company._id, {
          logo: newLogoUrl
        });
        console.log(`   ✅ Updated logo: ${newLogoUrl}`);
        updatedCount++;
      } else {
        await Company.findByIdAndUpdate(company._id, {
          logo: ''
        });
        console.log(`   ⚠️  Removed Clearbit URL (no replacement found)`);
        skippedCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Successfully updated: ${updatedCount} records`);
    console.log(`⚠️  Cleared without replacement: ${skippedCount} records`);
    console.log(`📊 Total processed: ${updatedCount + skippedCount} records`);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('💡 Tip: Clear your browser cache to see the updated logos');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the migration
fixClearbitLogos();