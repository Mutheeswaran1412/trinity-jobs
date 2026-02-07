const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://jobportal_user:jobportal123@jobportal.pnp4szn.mongodb.net/?retryWrites=true&w=majority&appName=Jobportal';

async function checkServiceNowApplications() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('jobportal');
    
    // First, find the ServiceNow Platform Admin job
    const job = await db.collection('jobs').findOne({
      $or: [
        { jobTitle: { $regex: /ServiceNow.*Platform.*Admin/i } },
        { title: { $regex: /ServiceNow.*Platform.*Admin/i } }
      ]
    });
    
    if (job) {
      console.log('Found ServiceNow Platform Admin job:');
      console.log('Job ID:', job._id);
      console.log('Job Title:', job.jobTitle || job.title);
      console.log('Company:', job.company);
      
      // Now find applications for this job
      const applications = await db.collection('applications').find({
        jobId: job._id.toString()
      }).toArray();
      
      console.log(`\nFound ${applications.length} applications for this job:`);
      
      if (applications.length > 0) {
        applications.forEach((app, index) => {
          console.log(`\nApplication ${index + 1}:`);
          console.log('- Candidate:', app.candidateName);
          console.log('- Email:', app.candidateEmail);
          console.log('- Status:', app.status);
          console.log('- Applied:', new Date(app.createdAt).toLocaleDateString());
        });
      } else {
        console.log('No applications found for this job.');
      }
    } else {
      console.log('ServiceNow Platform Admin job not found in database');
      
      // Let's see what jobs are available
      const allJobs = await db.collection('jobs').find({}).limit(10).toArray();
      console.log('\nAvailable jobs in database:');
      allJobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.jobTitle || job.title} at ${job.company}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkServiceNowApplications();