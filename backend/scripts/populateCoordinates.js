import Job from '../models/Job.js';
import connectDB from '../config/database.js';

// Simple geocoding function (you can replace with Google Maps API or other service)
const geocodeLocation = async (location) => {
  try {
    // This is a mock implementation - replace with actual geocoding service
    const locationMap = {
      'New York': [-74.0059, 40.7128],
      'San Francisco': [-122.4194, 37.7749],
      'London': [-0.1276, 51.5074],
      'Toronto': [-79.3832, 43.6532],
      'Berlin': [13.4050, 52.5200],
      'Remote': [0, 0],
      'Hybrid': [0, 0]
    };
    
    // Try to find exact match first
    const exactMatch = locationMap[location];
    if (exactMatch) return exactMatch;
    
    // Try partial match
    for (const [key, coords] of Object.entries(locationMap)) {
      if (location.toLowerCase().includes(key.toLowerCase()) || 
          key.toLowerCase().includes(location.toLowerCase())) {
        return coords;
      }
    }
    
    // Default coordinates if no match found
    return [0, 0];
  } catch (error) {
    console.error('Geocoding error:', error);
    return [0, 0];
  }
};

const populateJobCoordinates = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Finding jobs without coordinates...');
    const jobs = await Job.find({
      $or: [
        { coordinates: { $exists: false } },
        { 'coordinates.coordinates': [0, 0] }
      ]
    });
    
    console.log(`📍 Found ${jobs.length} jobs to update`);
    
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      console.log(`Processing ${i + 1}/${jobs.length}: ${job.jobTitle} at ${job.location}`);
      
      const coordinates = await geocodeLocation(job.location);
      
      await Job.findByIdAndUpdate(job._id, {
        coordinates: {
          type: 'Point',
          coordinates: coordinates
        }
      });
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Coordinates population completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Add sample data with enhanced fields
const addSampleEnhancedJobs = async () => {
  try {
    await connectDB();
    
    const sampleJobs = [
      {
        jobTitle: 'Senior React Developer',
        company: 'TechCorp',
        location: 'San Francisco',
        coordinates: { type: 'Point', coordinates: [-122.4194, 37.7749] },
        jobType: 'Full-time',
        locationType: 'Hybrid',
        industry: 'Technology',
        companySize: '201-500',
        salary: { min: 120000, max: 180000, currency: 'USD', period: 'yearly' },
        description: 'We are looking for a Senior React Developer to join our team...',
        skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
        benefits: ['Health Insurance', 'Remote Work', '401k'],
        status: 'approved',
        trending: true,
        views: 150,
        applications: 25
      },
      {
        jobTitle: 'Data Scientist',
        company: 'DataFlow Inc',
        location: 'New York',
        coordinates: { type: 'Point', coordinates: [-74.0059, 40.7128] },
        jobType: 'Full-time',
        locationType: 'On-site',
        industry: 'Technology',
        companySize: '51-200',
        salary: { min: 100000, max: 150000, currency: 'USD', period: 'yearly' },
        description: 'Join our data science team to work on cutting-edge ML projects...',
        skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
        benefits: ['Health Insurance', 'Stock Options', 'Learning Budget'],
        status: 'approved',
        featured: true,
        views: 200,
        applications: 30
      },
      {
        jobTitle: 'DevOps Engineer',
        company: 'CloudTech',
        location: 'Remote',
        coordinates: { type: 'Point', coordinates: [0, 0] },
        jobType: 'Full-time',
        locationType: 'Remote',
        industry: 'Technology',
        companySize: '11-50',
        salary: { min: 90000, max: 140000, currency: 'USD', period: 'yearly' },
        description: 'We need a DevOps Engineer to manage our cloud infrastructure...',
        skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
        benefits: ['Remote Work', 'Flexible Hours', 'Health Insurance'],
        status: 'approved',
        trending: true,
        views: 180,
        applications: 20
      }
    ];
    
    for (const jobData of sampleJobs) {
      const existingJob = await Job.findOne({ 
        jobTitle: jobData.jobTitle, 
        company: jobData.company 
      });
      
      if (!existingJob) {
        const job = new Job(jobData);
        await job.save();
        console.log(`✅ Created job: ${jobData.jobTitle} at ${jobData.company}`);
      } else {
        console.log(`⚠️ Job already exists: ${jobData.jobTitle} at ${jobData.company}`);
      }
    }
    
    console.log('🎉 Sample enhanced jobs added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding sample jobs:', error);
    process.exit(1);
  }
};

// Run the appropriate function based on command line argument
const command = process.argv[2];

if (command === 'populate') {
  populateJobCoordinates();
} else if (command === 'sample') {
  addSampleEnhancedJobs();
} else {
  console.log('Usage:');
  console.log('  node populateCoordinates.js populate  - Add coordinates to existing jobs');
  console.log('  node populateCoordinates.js sample    - Add sample enhanced jobs');
  process.exit(1);
}

export { populateJobCoordinates, addSampleEnhancedJobs };