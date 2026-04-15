const express = require('express');
const router = express.Router();
const {
  createJob, getJobs, getJob, updateJob, deleteJob,
  applyForJob, getHRJobs, getApplicants, updateApplicantStatus,
  analyzeJD, getMyApplications
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

// Public
router.get('/', protect, getJobs);
router.get('/my-applications', protect, getMyApplications);

// Job analysis
router.post('/analyze', protect, analyzeJD);

// HR routes
router.get('/hr/myjobs', protect, authorize('hr'), getHRJobs);
router.post('/', protect, authorize('hr'), createJob);
router.put('/:id', protect, authorize('hr'), updateJob);
router.delete('/:id', protect, authorize('hr'), deleteJob);
router.get('/:id/applicants', protect, authorize('hr'), getApplicants);
router.put('/:jobId/applicants/:applicantId', protect, authorize('hr'), updateApplicantStatus);

// User routes
router.get('/:id', protect, getJob);
router.post('/:id/apply', protect, authorize('user'), applyForJob);

module.exports = router;
