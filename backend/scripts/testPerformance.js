import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testPerformance = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Testing Database Performance...\n');

    const db = mongoose.connection.db;

    // Test 1: Job Search Performance
    console.log('📊 Testing Job Search Speed:');
    const start1 = Date.now();
    const jobs = await db.collection('jobs').find({
      $text: { $search: 'developer' },
      isActive: true
    }).limit(20).toArray();
    const end1 = Date.now();
    console.log(`✅ Found ${jobs.length} jobs in ${end1 - start1}ms`);

    // Test 2: User Lookup Performance
    console.log('\n📊 Testing User Lookup Speed:');
    const start2 = Date.now();
    const users = await db.collection('users').find({
      role: 'candidate'
    }).limit(10).toArray();
    const end2 = Date.now();
    console.log(`✅ Found ${users.length} users in ${end2 - start2}ms`);

    // Test 3: Application Query Performance
    console.log('\n📊 Testing Application Query Speed:');
    const start3 = Date.now();
    const applications = await db.collection('applications').find({
      status: 'pending'
    }).limit(10).toArray();
    const end3 = Date.now();
    console.log(`✅ Found ${applications.length} applications in ${end3 - start3}ms`);

    // Performance Summary
    const totalTime = (end1 - start1) + (end2 - start2) + (end3 - start3);
    console.log(`\n🚀 Total Query Time: ${totalTime}ms`);
    console.log(totalTime < 500 ? '✅ EXCELLENT Performance!' : '⚠️ Consider more optimization');

    process.exit(0);
  } catch (error) {
    console.error('❌ Performance Test Failed:', error);
    process.exit(1);
  }
};

testPerformance();