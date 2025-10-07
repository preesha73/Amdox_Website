const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();


// Get current user's profile
router.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update current user's profile
router.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { name, profile } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (profile !== undefined) update.profile = profile;

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true });
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;


