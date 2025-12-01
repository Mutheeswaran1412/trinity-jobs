import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    unique: true
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  domain: {
    type: String,
    trim: true
  },
  logo: {
    type: String,
    trim: true
  },
  followers: {
    type: Number,
    default: 0
  },
  employees: {
    type: String,
    enum: ['1-50', '51-200', '201-1000', '1000+'],
    default: '1-50'
  },
  workSetting: {
    type: String,
    enum: ['Remote', 'Hybrid', 'On-site'],
    default: 'On-site'
  },
  isHiring: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 4.0
  }
}, {
  timestamps: true
});

companySchema.index({ name: 'text', industry: 'text', location: 'text', description: 'text' });
companySchema.index({ name: 1 }, { unique: true });
companySchema.index({ industry: 1 });
companySchema.index({ location: 1 });
companySchema.index({ isHiring: 1 });
companySchema.index({ rating: -1 });

export default mongoose.model('Company', companySchema);