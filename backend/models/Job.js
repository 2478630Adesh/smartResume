const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  requirements: { type: String, default: '' },
  requiredSkills: [{ type: String }],
  experienceLevel: { type: String, enum: ['entry', 'mid', 'senior', 'lead'], default: 'entry' },
  experienceYears: { type: Number, default: 0 },
  location: { type: String, default: '' },
  salary: { type: String, default: '' },
  jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'], default: 'full-time' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
  applicants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resumeId: { type: String },
    appliedAt: { type: Date, default: Date.now },
    atsScore: { type: Number, default: 0 },
    matchingSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    matchPercentage: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'reviewed', 'shortlisted', 'rejected'], default: 'pending' }
  }],
  deadline: { type: Date },
  tags: [{ type: String }]
}, { timestamps: true });

jobSchema.index({ title: 'text', description: 'text', company: 'text' });

module.exports = mongoose.model('Job', jobSchema);
