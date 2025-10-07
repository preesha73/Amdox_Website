const express = require('express');
const auth = require('../middleware/auth');
const Application = require('../models/application');

const router = express.Router();

// Apply to a job (Job Seeker only)
router.post('/api/jobs/:jobId/apply', auth, async (req, res) => {
  try {
    if (req.user.role !== 'JobSeeker') return res.status(403).json({ error: 'Job seekers only' });
    const { coverLetter, resumeUrl } = req.body;
    const existing = await Application.findOne({ job: req.params.jobId, applicant: req.user._id });
    if (existing) return res.status(400).json({ error: 'Already applied' });
    const application = await Application.create({ job: req.params.jobId, applicant: req.user._id, coverLetter, resumeUrl });
    return res.status(201).json({ application });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// My applications (Job Seeker)
router.get('/api/my-applications', auth, async (req, res) => {
  try {
    const apps = await Application.find({ applicant: req.user._id }).populate('job');
    return res.json({ applications: apps });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Applications for a specific job (Employer)
router.get('/api/jobs/:jobId/applications', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Employer') return res.status(403).json({ error: 'Employers only' });
    const apps = await Application.find({ job: req.params.jobId }).populate('applicant');
    return res.json({ applications: apps });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

// Update application status (Employer)
router.put('/api/applications/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Employer') return res.status(403).json({ error: 'Employers only' });
    const { status } = req.body;
    const valid = ['Submitted','Viewed','Interview','Rejected','Offer'];
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const app = await Application.findById(req.params.id).populate('job');
    if (!app) return res.status(404).json({ error: 'Application not found' });
    if (String(app.job.postedBy) !== String(req.user._id)) return res.status(403).json({ error: 'Not your job posting' });
    app.status = status;
    await app.save();
    return res.json({ application: app });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});


