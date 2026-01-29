import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  userType: {
    type: String,
    enum: ['candidate', 'employer'],
    required: true
  },
  eventType: {
    type: String,
    enum: ['profile_view', 'search_appearance', 'recruiter_action', 'job_posted', 'application_received'],
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound indexes for better query performance
analyticsSchema.index({ email: 1, eventType: 1 });
analyticsSchema.index({ userId: 1, eventType: 1 });
analyticsSchema.index({ createdAt: -1 });

export default mongoose.model('Analytics', analyticsSchema);