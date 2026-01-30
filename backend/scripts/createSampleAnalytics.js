import Analytics from '../models/Analytics.js';

export const createSampleAnalytics = async () => {
  try {
    console.log('📊 Creating sample analytics data...');

    // Clear existing analytics data
    await Analytics.deleteMany({});

    const sampleData = [
      // Sample data for mutheeswaran (your email)
      {
        userId: 'user_mutheeswaran',
        email: 'mutheeswaran@trinitetech.com',
        userType: 'candidate',
        eventType: 'search_appearance',
        metadata: { searchQuery: 'react developer' },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        userId: 'user_mutheeswaran',
        email: 'mutheeswaran@trinitetech.com',
        userType: 'candidate',
        eventType: 'search_appearance',
        metadata: { searchQuery: 'frontend developer' },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        userId: 'user_mutheeswaran',
        email: 'mutheeswaran@trinitetech.com',
        userType: 'candidate',
        eventType: 'search_appearance',
        metadata: { searchQuery: 'javascript developer' },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        userId: 'user_mutheeswaran',
        email: 'mutheeswaran@trinitetech.com',
        userType: 'candidate',
        eventType: 'search_appearance',
        metadata: { searchQuery: 'nodejs developer' },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId: 'user_mutheeswaran',
        email: 'mutheeswaran@trinitetech.com',
        userType: 'candidate',
        eventType: 'search_appearance',
        metadata: { searchQuery: 'fullstack developer' },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        userId: 'user_mutheeswaran',
        email: 'mutheeswaran@trinitetech.com',
        userType: 'candidate',
        eventType: 'recruiter_action',
        metadata: { action: 'profile_view', recruiterId: 'recruiter_1' },
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      },
      {
        userId: 'user_mutheeswaran',
        email: 'mutheeswaran@trinitetech.com',
        userType: 'candidate',
        eventType: 'recruiter_action',
        metadata: { action: 'contact_attempt', recruiterId: 'recruiter_2' },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: 'user_mutheeswaran',
        email: 'mutheeswaran@trinitetech.com',
        userType: 'candidate',
        eventType: 'recruiter_action',
        metadata: { action: 'profile_view', recruiterId: 'recruiter_3' },
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      }
    ];

    await Analytics.insertMany(sampleData);
    
    // Verify the data was created
    const count = await Analytics.countDocuments();
    console.log(`✅ Created ${count} analytics records`);
    
    // Show specific counts for mutheeswaran
    const searchCount = await Analytics.countDocuments({
      email: 'mutheeswaran@trinitetech.com',
      eventType: 'search_appearance'
    });
    
    const recruiterCount = await Analytics.countDocuments({
      email: 'mutheeswaran@trinitetech.com',
      eventType: 'recruiter_action'
    });
    
    console.log(`📊 For mutheeswaran@trinitetech.com: ${searchCount} search appearances, ${recruiterCount} recruiter actions`);
    
  } catch (error) {
    console.error('❌ Error creating sample analytics:', error);
  }
};