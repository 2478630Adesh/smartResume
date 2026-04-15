const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['user', 'hr'], default: 'user' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  bio: { type: String, default: '' },
  profileImage: { type: String, default: '' },

  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, default: '' },
    startDate: { type: String },
    endDate: { type: String },
    grade: { type: String, default: '' },
    description: { type: String, default: '' }
  }],

  skills: [{ type: String }],

  projects: [{
    title: { type: String, required: true },
    description: { type: String, default: '' },
    technologies: [{ type: String }],
    link: { type: String, default: '' },
    github: { type: String, default: '' },
    startDate: { type: String },
    endDate: { type: String }
  }],

  experience: [{
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: String },
    endDate: { type: String },
    current: { type: Boolean, default: false },
    description: { type: String, default: '' },
    technologies: [{ type: String }]
  }],

  certifications: [{
    name: { type: String, required: true },
    issuer: { type: String, default: '' },
    date: { type: String },
    credentialId: { type: String, default: '' },
    url: { type: String, default: '' }
  }],

  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },

  resumes: [{
    filename: { type: String },
    originalName: { type: String },
    path: { type: String },
    uploadDate: { type: Date, default: Date.now },
    parsedSkills: [{ type: String }],
    atsScore: { type: Number, default: 0 }
  }]
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
