import mongoose from 'mongoose';

const jobAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  alertName: {
    type: String,
    required: true
  },
  criteria: {
    keywords: [String],
    location: String,
    jobType: [String],
    experienceLevel: String,
    salaryMin: Number,
    salaryMax: Number,
    company: String
  },
  frequency: {
    type: String,
    enum: ['instant', 'daily', 'weekly'],
    default: 'daily'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSent: Date,
  totalJobsSent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

jobAlertSchema.index({ userId: 1 });
jobAlertSchema.index({ isActive: 1 });
jobAlertSchema.index({ frequency: 1 });

export default mongoose.model('JobAlert', jobAlertSchema);