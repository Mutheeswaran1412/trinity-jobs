import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

dotenv.config();

async function fixApplications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all applications
    const applications = await Application.find({});
    console.log(`📊 Found ${applications.length} applications to fix`);

    let fixed = 0;
    let errors = 0;

    for (const app of applications) {
      try {
        // Convert jobId to ObjectId if it's a string
        if (typeof app.jobId === 'string') {
          app.jobId = mongoose.Types.ObjectId(app.jobId);
        }

        // Find job to get employer info
        const job = await Job.findById(app.jobId);
        if (job) {
          app.employerId = job.employerId || null;
          app.employerEmail = job.employerEmail || '';
        }

        // Find candidate by email to get candidateId
        const candidate = await User.findOne({ email: app.candidateEmail });
        if (candidate) {
          app.candidateId = candidate._id;
          
          // Update user's appliedJobs array
          const alreadyApplied = candidate.appliedJobs.some(
            aj => aj.jobId.toString() === app.jobId.toString()
          );
          
          if (!alreadyApplied) {
            candidate.appliedJobs.push({
              jobId: app.jobId,
              appliedAt: app.createdAt,
              status: app.status
            });
            await candidate.save();
          }
        }

        await app.save();
        fixed++;
        console.log(`✅ Fixed application ${app._id}`);
      } catch (err) {
        errors++;
        console.error(`❌ Error fixing application ${app._id}:`, err.message);
      }
    }

    console.log(`\n🎉 Migration complete!`);
    console.log(`✅ Fixed: ${fixed}`);
    console.log(`❌ Errors: ${errors}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

fixApplications();
