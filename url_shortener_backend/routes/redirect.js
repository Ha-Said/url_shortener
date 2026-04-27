const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// GET /s/:code — resolve short link and record click
router.get('/:code', asyncHandler(async (req, res) => {
  const link = await Link.findOne({ code: req.params.code, isActive: true });

  if (!link) return res.status(404).json({ error: 'Link not found.' });

  // check expiry
  if (link.expiresAt && link.expiresAt < new Date()) {
    return res.status(410).json({ error: 'This link has expired.' });
  }

  // build click record
  const clickData = {
    clickedAt: new Date(),
    ip: req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip,
    userAgent: req.headers['user-agent'] || null,
    referer: req.headers['referer'] || null,
    // geo / device fields left null — populate with a lookup service later
  };

  // update link atomically
  await Link.findByIdAndUpdate(link._id, {
    $inc: { clickCount: 1 },
    $set: { lastClickedAt: clickData.clickedAt },
    $push: { clicks: clickData },
  });

  // keep owner's totalClicks in sync
  if (link.owner) {
    await User.findByIdAndUpdate(link.owner, {
      $inc: { totalClicks: 1 },
      $set: { lastActiveAt: clickData.clickedAt },
    });
  }

  res.redirect(301, link.originalUrl);
}));

module.exports = router;
