const mongoose = require('mongoose');

const userAlertPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert', required: true },
  isRead: { type: Boolean, default: false },
  isSnoozed: { type: Boolean, default: false },
  snoozeUntil: Date,
  lastDelivered: Date,
  createdAt: { type: Date, default: Date.now }
});

userAlertPreferenceSchema.index({ userId: 1, alertId: 1 }, { unique: true });

const UserAlertPreference = mongoose.model('UserAlertPreference', userAlertPreferenceSchema);
module.exports = UserAlertPreference;
