const mongoose = require('mongoose');

const notificationDeliverySchema = new mongoose.Schema({
  alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  channel: { type: String, enum: ['in-app', 'email', 'sms'], required: true },
  status: { type: String, enum: ['pending', 'delivered', 'failed'], default: 'pending' },
  deliveredAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const NotificationDelivery = mongoose.model('NotificationDelivery', notificationDeliverySchema);
module.exports = NotificationDelivery;
