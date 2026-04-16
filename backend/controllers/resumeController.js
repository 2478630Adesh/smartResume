const User = require('../models/User');
const path = require('path');
const fs = require('fs');

// Try to load optional parsers
let pdfParse = null;
let mammoth = null;
try { pdfParse = require('pdf-parse'); } catch(e) { console.log('pdf-parse not installed, PDF skill extraction disabled'); }
try { mammoth = require('mammoth'); } catch(e) { console.log('mammoth not installed, DOCX skill extraction disabled'); }

// @desc    Upload resume
// @route   POST /api/resume/upload
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file. Only PDF and DOCX files are allowed.' });
    }

    console.log('📤 File uploaded:', req.file.originalname, '| Type:', req.file.mimetype, '| Size:', req.file.size);

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    let parsedSkills = [];
    
    // Try to extract skills from uploaded file
    try {
      if (req.file.mimetype === 'application/pdf' && pdfParse) {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        parsedSkills = extractSkillsFromText(pdfData.text);
        console.log('📄 PDF parsed, skills found:', parsedSkills.length);
      } else if (req.file.mimetype.includes('wordprocessingml') && mammoth) {
        const result = await mammoth.extractRawText({ path: req.file.path });
        parsedSkills = extractSkillsFromText(result.value);
        console.log('📄 DOCX parsed, skills found:', parsedSkills.length);
      } else {
        console.log('⚠️ Skipping file parsing (parser not available or unsupported type)');
      }
    } catch (parseError) {
      console.log('⚠️ File parsing error (non-fatal):', parseError.message);
      // Continue without parsed skills - upload still succeeds
    }

    const resumeData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      parsedSkills,
      atsScore: 0
    };

    user.resumes.push(resumeData);
    await user.save();

    const savedResume = user.resumes[user.resumes.length - 1];
    console.log('✅ Resume saved to DB:', savedResume.originalName);
    
    res.status(201).json({ message: 'Resume uploaded successfully', resume: savedResume });
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    res.status(500).json({ message: 'Failed to upload resume', error: error.message });
  }
};

// @desc    Get all user resumes
// @route   GET /api/resume
const getResumes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.resumes || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resume/:resumeId
const deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const resume = user.resumes.id(req.params.resumeId);
    
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Delete file from storage
    if (resume.path && fs.existsSync(resume.path)) {
      fs.unlinkSync(resume.path);
    }

    user.resumes.pull(req.params.resumeId);
    await user.save();

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Generate resume HTML from profile
// @route   POST /api/resume/generate
const generateResume = async (req, res) => {
  try {
    const { template } = req.body;
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resumeHTML = buildResumeHTML(user, template || 'modern');
    res.json({ html: resumeHTML, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Skill gap analysis
// @route   POST /api/resume/skill-gap
const skillGapAnalysis = async (req, res) => {
  try {
    const { jobSkills, jobDescription } = req.body;
    const user = await User.findById(req.user._id);
    
    const { calculateATSScore } = require('../utils/atsAnalyzer');
    const analysis = calculateATSScore(
      user.skills || [],
      jobSkills || [],
      '',
      jobDescription || ''
    );

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper: Extract skills from text
const extractSkillsFromText = (text) => {
  if (!text) return [];
  const techSkills = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring boot',
    'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes', 'aws', 'azure',
    'gcp', 'git', 'linux', 'html', 'css', 'sql', 'graphql', 'rest api',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy',
    'agile', 'scrum', 'ci/cd', 'jenkins', 'terraform', 'figma', 'photoshop',
    'tailwind', 'bootstrap', 'sass', 'webpack', 'vite', 'next.js', 'nest.js',
    'firebase', 'supabase', 'elasticsearch', 'kafka', 'microservices', 'serverless',
    'swift', 'kotlin', 'flutter', 'react native', 'php', 'laravel', '.net',
    'power bi', 'tableau', 'data analysis', 'data science', 'nlp', 'computer vision'
  ];

  const lowerText = text.toLowerCase();
  return techSkills.filter(skill => lowerText.includes(skill));
};

// Helper: Build resume HTML
const buildResumeHTML = (user, template) => {
  const colors = template === 'modern' 
    ? { primary: '#1a365d', accent: '#2b6cb0', bg: '#ffffff', text: '#2d3748' }
    : { primary: '#1a1a2e', accent: '#e94560', bg: '#ffffff', text: '#333333' };

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>${user.name} - Resume</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: ${colors.text}; line-height: 1.6; }
  .resume { max-width: 800px; margin: 0 auto; padding: 40px; background: ${colors.bg}; }
  .header { text-align: center; padding-bottom: 20px; border-bottom: 3px solid ${colors.primary}; margin-bottom: 25px; }
  .header h1 { font-size: 28px; color: ${colors.primary}; letter-spacing: 2px; }
  .header .contact { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin-top: 10px; font-size: 13px; color: #666; }
  .section { margin-bottom: 22px; }
  .section-title { font-size: 16px; font-weight: 700; color: ${colors.primary}; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid ${colors.accent}; padding-bottom: 5px; margin-bottom: 12px; }
  .item { margin-bottom: 12px; }
  .item-header { display: flex; justify-content: space-between; align-items: baseline; }
  .item-title { font-weight: 600; font-size: 15px; color: ${colors.primary}; }
  .item-subtitle { color: #555; font-size: 13px; }
  .item-date { color: #888; font-size: 12px; }
  .item-desc { font-size: 13px; color: #555; margin-top: 4px; }
  .skills-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill-tag { background: ${colors.primary}15; color: ${colors.primary}; padding: 4px 12px; border-radius: 15px; font-size: 12px; font-weight: 500; }
  .links { display: flex; gap: 15px; flex-wrap: wrap; }
  .links a { color: ${colors.accent}; text-decoration: none; font-size: 13px; }
</style></head><body><div class="resume">
  <div class="header">
    <h1>${user.name || 'Your Name'}</h1>
    <div class="contact">
      ${user.email ? `<span>📧 ${user.email}</span>` : ''}
      ${user.phone ? `<span>📱 ${user.phone}</span>` : ''}
      ${user.location ? `<span>📍 ${user.location}</span>` : ''}
    </div>
    ${user.socialLinks ? `<div class="links" style="justify-content:center;margin-top:8px;">
      ${user.socialLinks.github ? `<a href="${user.socialLinks.github}">GitHub</a>` : ''}
      ${user.socialLinks.linkedin ? `<a href="${user.socialLinks.linkedin}">LinkedIn</a>` : ''}
      ${user.socialLinks.portfolio ? `<a href="${user.socialLinks.portfolio}">Portfolio</a>` : ''}
    </div>` : ''}
  </div>

  ${user.bio ? `<div class="section"><div class="section-title">Summary</div><p style="font-size:13px;color:#555;">${user.bio}</p></div>` : ''}

  ${user.skills && user.skills.length > 0 ? `<div class="section"><div class="section-title">Skills</div><div class="skills-list">${user.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div></div>` : ''}

  ${user.experience && user.experience.length > 0 ? `<div class="section"><div class="section-title">Experience</div>${user.experience.map(exp => `<div class="item"><div class="item-header"><div><span class="item-title">${exp.position}</span><span class="item-subtitle"> at ${exp.company}</span></div><span class="item-date">${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}</span></div>${exp.description ? `<p class="item-desc">${exp.description}</p>` : ''}</div>`).join('')}</div>` : ''}

  ${user.education && user.education.length > 0 ? `<div class="section"><div class="section-title">Education</div>${user.education.map(edu => `<div class="item"><div class="item-header"><div><span class="item-title">${edu.degree}${edu.field ? ' in ' + edu.field : ''}</span><span class="item-subtitle"> — ${edu.institution}</span></div><span class="item-date">${edu.startDate || ''} - ${edu.endDate || ''}</span></div>${edu.grade ? `<p class="item-desc">Grade: ${edu.grade}</p>` : ''}</div>`).join('')}</div>` : ''}

  ${user.projects && user.projects.length > 0 ? `<div class="section"><div class="section-title">Projects</div>${user.projects.map(proj => `<div class="item"><div class="item-header"><span class="item-title">${proj.title}</span><span class="item-date">${proj.startDate || ''} - ${proj.endDate || ''}</span></div>${proj.description ? `<p class="item-desc">${proj.description}</p>` : ''}${proj.technologies && proj.technologies.length > 0 ? `<div class="skills-list" style="margin-top:4px;">${proj.technologies.map(t => `<span class="skill-tag">${t}</span>`).join('')}</div>` : ''}</div>`).join('')}</div>` : ''}

  ${user.certifications && user.certifications.length > 0 ? `<div class="section"><div class="section-title">Certifications</div>${user.certifications.map(cert => `<div class="item"><div class="item-header"><span class="item-title">${cert.name}</span><span class="item-date">${cert.date || ''}</span></div>${cert.issuer ? `<p class="item-desc">Issued by: ${cert.issuer}</p>` : ''}</div>`).join('')}</div>` : ''}
</div></body></html>`;
};

module.exports = { uploadResume, getResumes, deleteResume, generateResume, skillGapAnalysis };
