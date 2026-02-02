import express from 'express';
import SearchAnalytics from '../models/SearchAnalytics.js';

const router = express.Router();

// POST /api/search-analytics/track - Track a search query
router.post('/track', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const cleanQuery = query.trim().toLowerCase();
    
    // Update or create search analytics
    await SearchAnalytics.findOneAndUpdate(
      { query: cleanQuery },
      { 
        $inc: { count: 1 },
        $set: { lastSearched: new Date() }
      },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/search-analytics/popular - Get popular searches
router.get('/popular', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const popularSearches = await SearchAnalytics
      .find({})
      .sort({ count: -1, lastSearched: -1 })
      .limit(parseInt(limit))
      .select('query count -_id');

    // If no searches found, return default popular searches
    if (popularSearches.length === 0) {
      return res.json({
        searches: ['React', 'Python', 'JavaScript', 'Node.js', 'Java', 'Angular']
      });
    }

    const searches = popularSearches.map(item => 
      item.query.charAt(0).toUpperCase() + item.query.slice(1)
    );

    res.json({ searches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/search-analytics/trending - Get trending searches (recent + popular)
router.get('/trending', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    // Get searches from last 7 days, sorted by count
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const trendingSearches = await SearchAnalytics
      .find({ lastSearched: { $gte: weekAgo } })
      .sort({ count: -1, lastSearched: -1 })
      .limit(parseInt(limit))
      .select('query count -_id');

    if (trendingSearches.length === 0) {
      return res.json({
        searches: ['Full Stack', 'Remote', 'Senior', 'Frontend', 'Backend', 'DevOps']
      });
    }

    const searches = trendingSearches.map(item => 
      item.query.charAt(0).toUpperCase() + item.query.slice(1)
    );

    res.json({ searches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;