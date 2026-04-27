const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const Link = require('../models/Link');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const authMiddleware = require('../middleware/auth');

// POST /links — shorten a URL (auth optional)
router.post('/', asyncHandler(async (req, res) => {
  const { originalUrl, alias } = req.body;

  if (!originalUrl) return res.status(400).json({ error: 'originalUrl is required.' });

  try { new URL(originalUrl); } catch {
    return res.status(400).json({ error: 'Invalid URL.' });
  }

  // resolve owner from token if present
  let owner = null;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
      owner = decoded._id;
    } catch { /* anonymous */ }
  }

  if (alias) {
    const taken = await Link.findOne({ code: alias });
    if (taken) return res.status(409).json({ error: 'That alias is already taken.' });
  }

  const code = alias || nanoid(6);
  const shortUrl = `${process.env.APP_URL}/s/${code}`;

  const link = await Link.create({ code, originalUrl, owner });

  // bump owner's link count
  if (owner) {
    await User.findByIdAndUpdate(owner, { $inc: { totalLinks: 1 } });
  }

  res.status(201).json({
    id: link._id,
    code: link.code,
    shortUrl,
    originalUrl: link.originalUrl,
    clickCount: link.clickCount,
    createdAt: link.createdAt,
  });
}));

// GET /links — list links for the authenticated user
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const links = await Link.find({ owner: req.user._id, isActive: true })
    .sort({ createdAt: -1 })
    .select('-clicks')
    .lean();

  res.json(links.map((l) => ({
    id: l._id,
    code: l.code,
    shortUrl: `${process.env.APP_URL}/s/${l.code}`,
    originalUrl: l.originalUrl,
    clickCount: l.clickCount,
    createdAt: l.createdAt,
  })));
}));

// DELETE /links/:code — soft-delete (owner only)
router.delete('/:code', authMiddleware, asyncHandler(async (req, res) => {
  const link = await Link.findOneAndUpdate(
    { code: req.params.code, owner: req.user._id },
    { isActive: false },
    { new: true }
  );
  if (!link) return res.status(404).json({ error: 'Link not found.' });
  res.json({ message: 'Link deleted.' });
}));

module.exports = router;
