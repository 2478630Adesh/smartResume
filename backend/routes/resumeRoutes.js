const express = require('express');
const router = express.Router();
const { uploadResume, getResumes, deleteResume, generateResume, skillGapAnalysis } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/', protect, getResumes);
router.delete('/:resumeId', protect, deleteResume);
router.post('/generate', protect, generateResume);
router.post('/skill-gap', protect, skillGapAnalysis);

module.exports = router;
