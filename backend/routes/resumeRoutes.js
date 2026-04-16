const express = require('express');
const router = express.Router();
const { uploadResume, getResumes, deleteResume, generateResume, skillGapAnalysis } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Upload with multer error handling
router.post('/upload', protect, (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
      }
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    next();
  });
}, uploadResume);

router.get('/', protect, getResumes);
router.delete('/:resumeId', protect, deleteResume);
router.post('/generate', protect, generateResume);
router.post('/skill-gap', protect, skillGapAnalysis);

module.exports = router;
