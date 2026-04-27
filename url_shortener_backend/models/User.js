const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    // stats aggregates (updated on each link/click event)
    totalLinks: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: null },
  },
  { timestamps: true } // createdAt, updatedAt
);

module.exports = mongoose.model('User', userSchema);
