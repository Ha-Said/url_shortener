const mongoose = require('mongoose');
const { Schema } = mongoose;

const clickSchema = new Schema(
  {
    // when the click happened
    clickedAt: { type: Date, default: Date.now },
    // request metadata for stats
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
    referer: { type: String, default: null },
    // geo (populated later if you add a geo-lookup service)
    country: { type: String, default: null },
    city: { type: String, default: null },
    // device / browser parsed from userAgent
    device: { type: String, default: null },   // 'mobile' | 'tablet' | 'desktop'
    browser: { type: String, default: null },
    os: { type: String, default: null },
  },
  { _id: false }
);

const linkSchema = new Schema(
  {
    // the unique short code, e.g. "ab12cd"
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    originalUrl: {
      type: String,
      required: true,
    },
    // null = anonymous link
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    // optional custom alias set by the user
    alias: { type: String, default: null },
    // optional expiry
    expiresAt: { type: Date, default: null },
    // soft-delete / disable without removing
    isActive: { type: Boolean, default: true },
    // click counter (fast read without aggregating clicks array)
    clickCount: { type: Number, default: 0 },
    // last time someone clicked this link
    lastClickedAt: { type: Date, default: null },
    // full click history for detailed stats
    clicks: { type: [clickSchema], default: [] },
  },
  { timestamps: true } // createdAt = when the short link was made
);

module.exports = mongoose.model('Link', linkSchema);
