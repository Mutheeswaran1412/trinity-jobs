// Test analytics endpoint
app.get('/api/test-analytics', async (req, res) => {
  try {
    const Analytics = (await import('./models/Analytics.js')).default;
    
    const email = 'mutheeswaran@trinitetech.com';
    
    const searchAppearances = await Analytics.countDocuments({
      email: { $regex: new RegExp(email, 'i') },
      eventType: 'search_appearance'
    });

    const recruiterActions = await Analytics.countDocuments({
      email: { $regex: new RegExp(email, 'i') },
      eventType: 'recruiter_action'
    });
    
    const allData = await Analytics.find({
      email: { $regex: new RegExp(email, 'i') }
    }).sort({ createdAt: -1 });
    
    res.json({
      status: 'success',
      email,
      searchAppearances,
      recruiterActions,
      totalRecords: allData.length,
      data: allData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});