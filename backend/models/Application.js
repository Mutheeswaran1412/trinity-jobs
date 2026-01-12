import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  candidateName: {
    type: String,
    required: true
  },
  candidateEmail: {
    type: String,
    required: true
  },
  candidatePhone: String,
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  employerEmail: String,
  coverLetter: String,
  resumeUrl: String,
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  }
}, {
  timestamps: true
});

applicationSchema.index({ jobId: 1, candidateEmail: 1 }, { unique: true });
applicationSchema.index({ candidateId: 1 });
applicationSchema.index({ employerId: 1 });
applicationSchema.index({ status: 1 });

export default mongoose.model('Application', applicationSchema);
