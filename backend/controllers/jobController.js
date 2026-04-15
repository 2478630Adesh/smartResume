const Job = require('../models/Job');
const User = require('../models/User');
const { calculateATSScore, analyzeJobDescription } = require('../utils/atsAnalyzer');

// @desc    Create a new job posting (HR only)
// @route   POST /api/jobs
const createJob = async (req, res) => {
  try {
    const { title, company, description, requirements, requiredSkills, experienceLevel, experienceYears, location, salary, jobType, deadline, tags } = req.body;

    const job = await Job.create({
      title,
      company,
      description,
      requirements,
      requiredSkills: requiredSkills || [],
      experienceLevel,
      experienceYears,
      location,
      salary,
      jobType,
      postedBy: req.user._id,
      deadline,
      tags
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all active jobs
// @route   GET /api/jobs
const getJobs = async (req, res) => {
  try {
    const { search, skills, jobType, experienceLevel } = req.query;
    let query = { status: 'active' };

    if (search) {
      query.$text = { $search: search };
    }
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim().toLowerCase());
      query.requiredSkills = { $in: skillArray };
    }
    if (jobType) query.jobType = jobType;
    if (experienceLevel) query.experienceLevel = experienceLevel;

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email')
      .populate('applicants.user', 'name email skills');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update job (HR only)
// @route   PUT /api/jobs/:id
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete job (HR only)
// @route   DELETE /api/jobs/:id
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
const applyForJob = async (req, res) => {
  try {
    const { resumeId } = req.body;
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const alreadyApplied = job.applicants.find(
      app => app.user.toString() === req.user._id.toString()
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const user = await User.findById(req.user._id);
    
    // Calculate ATS score
    let resumeSkills = user.skills || [];
    let resumeText = '';
    
    if (resumeId) {
      const resume = user.resumes.find(r => r._id.toString() === resumeId);
      if (resume && resume.parsedSkills.length > 0) {
        resumeSkills = [...new Set([...resumeSkills, ...resume.parsedSkills])];
      }
    }

    const analysis = calculateATSScore(
      resumeSkills,
      job.requiredSkills,
      resumeText,
      job.description
    );

    job.applicants.push({
      user: req.user._id,
      resumeId,
      atsScore: analysis.atsScore,
      matchingSkills: analysis.matchingSkills,
      missingSkills: analysis.missingSkills,
      matchPercentage: analysis.matchPercentage
    });

    await job.save();

    res.json({
      message: 'Application submitted successfully',
      analysis
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get HR's posted jobs
// @route   GET /api/jobs/hr/myjobs
const getHRJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .populate('applicants.user', 'name email skills')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get applicants for a job with leaderboard
// @route   GET /api/jobs/:id/applicants
const getApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('applicants.user', 'name email skills education experience');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Sort applicants by ATS score for leaderboard
    const leaderboard = job.applicants
      .sort((a, b) => b.atsScore - a.atsScore)
      .map((app, index) => ({
        rank: index + 1,
        user: app.user,
        atsScore: app.atsScore,
        matchPercentage: app.matchPercentage,
        matchingSkills: app.matchingSkills,
        missingSkills: app.missingSkills,
        appliedAt: app.appliedAt,
        status: app.status
      }));

    res.json({ job: { title: job.title, company: job.company }, leaderboard });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update applicant status (HR)
// @route   PUT /api/jobs/:jobId/applicants/:applicantId
const updateApplicantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.jobId);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    const applicant = job.applicants.id(req.params.applicantId);
    if (!applicant) return res.status(404).json({ message: 'Applicant not found' });

    applicant.status = status;
    await job.save();

    res.json({ message: 'Applicant status updated', applicant });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Analyze a job description
// @route   POST /api/jobs/analyze
const analyzeJD = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ message: 'Job description is required' });
    }

    const analysis = analyzeJobDescription(jobDescription);
    
    // If user is logged in, compare with their skills
    let skillGap = null;
    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user && user.skills.length > 0) {
        skillGap = calculateATSScore(
          user.skills,
          analysis.extractedSkills,
          '',
          jobDescription
        );
      }
    }

    res.json({ ...analysis, skillGap });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's applications
// @route   GET /api/jobs/my-applications
const getMyApplications = async (req, res) => {
  try {
    const jobs = await Job.find({
      'applicants.user': req.user._id
    }).populate('postedBy', 'name email');

    const applications = jobs.map(job => {
      const myApp = job.applicants.find(
        app => app.user.toString() === req.user._id.toString()
      );
      return {
        job: {
          _id: job._id,
          title: job.title,
          company: job.company,
          location: job.location,
          jobType: job.jobType
        },
        application: myApp
      };
    });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createJob, getJobs, getJob, updateJob, deleteJob,
  applyForJob, getHRJobs, getApplicants, updateApplicantStatus,
  analyzeJD, getMyApplications
};
