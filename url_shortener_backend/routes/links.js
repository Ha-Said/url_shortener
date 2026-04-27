const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const Link = require('../models/Link');
const asyncHandler = require('../middleware/asyncHandler');

// POST /links — shorten a URL
router.post('/', asyncHandler(async (req, res) => {
  const { originalUrl, alias } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'originalUrl is required.' });
  }

  // basic URL validation
  try {
    new URL(originalUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid URL.' });
  }

  // if a custom alias was requested, check it's not taken
  if (alias) {
    const taken = await Link.findOne({ code: alias });
    if (taken) {
      return res.status(409).json({ error: 'That alias is already taken.' });
    }
  }

  const code = alias || nanoid(6);
  const shortUrl = `${process.env.APP_URL}/s/${code}`;

  const link = await Link.create({
    code,
    originalUrl,
    owner: req.user?._id ?? null, // will be populated once auth is wired up
  });

  res.status(201).json({
    id: link._id,
    code: link.code,
    shortUrl,
    originalUrl: link.originalUrl,
    createdAt: link.createdAt,
  });
}));

// GET /links — list all links (optionally filter by owner later)
router.get('/', asyncHandler(async (req, res) => {
  const links = await Link.find({ isActive: true })
    .sort({ createdAt: -1 })
    .select('-clicks') // exclude heavy click array from list view
    .lean();

  const result = links.map((l) => ({
    id: l._id,
    code: l.code,
    shortUrl: `${process.env.APP_URL}/s/${l.code}`,
    originalUrl: l.originalUrl,
    clickCount: l.clickCount,
    createdAt: l.createdAt,
  }));

  res.json(result);
}));

// DELETE /links/:code — soft-delete a link
router.delete('/:code', asyncHandler(async (req, res) => {
  const link = await Link.findOneAndUpdate(
    { code: req.params.code },
    { isActive: false },
    { new: true }
  );

  if (!link) return res.status(404).json({ error: 'Link not found.' });
  res.json({ message: 'Link deleted.' });
}));

module.exports = router;
