import mongoose from 'mongoose';

const searchAnalyticsSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  count: {
    type: Number,
    default: 1
  },
  lastSearched: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
searchAnalyticsSchema.index({ query: 1 });
searchAnalyticsSchema.index({ count: -1 });
searchAnalyticsSchema.index({ lastSearched: -1 });

export default mongoose.model('SearchAnalytics', searchAnalyticsSchema);