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
    enum: ['applied', 'reviewed', 'shortlisted', 'hired', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  // Application timeline tracking
  timeline: [{
    status: String,
    date: { type: Date, default: Date.now },
    note: String,
    updatedBy: String
  }],
  // Quick apply flag
  isQuickApply: { type: Boolean, default: false },
  // Salary negotiation
  salaryNegotiation: {
    candidateExpected: Number,
    employerOffered: Number,
    finalAgreed: Number,
    currency: { type: String, default: 'USD' },
    negotiationNotes: String
  },
  // Application withdrawal
  withdrawnAt: Date,
  withdrawalReason: String,
  // Follow-up reminder system
  followUpReminders: [{
    type: {
      type: String,
      enum: ['application_status', 'interview_reminder', 'follow_up', 'deadline_reminder'],
      required: true
    },
    scheduledDate: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    sentAt: Date,
    message: String,
    recipientEmail: String,
    reminderData: {
      interviewDate: Date,
      interviewTime: String,
      interviewLocation: String,
      interviewType: String, // 'phone', 'video', 'in-person'
      meetingLink: String,
      additionalNotes: String
    }
  }],
  // Next follow-up date
  nextFollowUpDate: Date
}, {
  timestamps: true
});

applicationSchema.index({ jobId: 1, candidateEmail: 1 }, { unique: true });
applicationSchema.index({ candidateId: 1 });
applicationSchema.index({ employerId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ withdrawnAt: 1 });

export default mongoose.model('Application', applicationSchema);
