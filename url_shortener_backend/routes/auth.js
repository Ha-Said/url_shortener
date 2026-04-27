const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

function signToken(user) {
  return jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'An account with that email already exists.' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });

  res.status(201).json({ token: signToken(user), email: user.email });
}));

// POST /auth/login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

  await User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() });

  res.json({ token: signToken(user), email: user.email });
}));

module.exports = router;
