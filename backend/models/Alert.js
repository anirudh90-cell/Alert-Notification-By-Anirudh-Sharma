const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['info', 'warning', 'critical'], 
    default: 'info' 
  },
  deliveryType: { 
    type: String, 
    enum: ['in-app', 'email', 'sms'], 
    default: 'in-app' 
  },
  reminderFrequency: { type: Number, default: 2 },
  visibility: {
    type: { type: String, enum: ['organization', 'team', 'user'], required: true },
    targetIds: [{ type: mongoose.Schema.Types.ObjectId }]
  },
  startTime: { type: Date, default: Date.now },
  expiryTime: Date,
  isActive: { type: Boolean, default: true },
  reminderEnabled: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;
