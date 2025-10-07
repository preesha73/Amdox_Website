const express = require('express');
const Job = require('../models/job');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/jobs with filters
router.get('/api/jobs', async (req, res) => {
  try {
    const { q, location, type, minSalary } = req.query;
    const criteria = {};
    if (q) criteria.title = new RegExp(q, 'i');
    if (location) criteria.location = new RegExp(location, 'i');
    if (type) criteria.type = type;
    if (minSalary) criteria.salaryMin = { $gte: Number(minSalary) };

    const jobs = await Job.find(criteria).sort('-createdAt');
    return res.json({ jobs });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/jobs (employer only)
router.post('/api/jobs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Employer') {
      return res.status(403).json({ error: 'Employers only' });
    }
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    return res.status(201).json({ job });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

// Employer's own jobs
router.get('/api/my-jobs', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Employer') return res.status(403).json({ error: 'Employers only' });
    const jobs = await Job.find({ postedBy: req.user._id }).sort('-createdAt');
    return res.json({ jobs });
  } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }
});
 


