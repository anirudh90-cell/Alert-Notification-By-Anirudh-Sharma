const NotificationStrategy = require('./NotificationStrategy');
const NotificationDelivery = require('../models/NotificationDelivery');
const UserAlertPreference = require('../models/UserAlertPreference');

class InAppNotificationStrategy extends NotificationStrategy {
  async deliver(alert, user) {
    try {
      const delivery = new NotificationDelivery({
        alertId: alert._id,
        userId: user._id,
        channel: 'in-app',
        status: 'delivered',
        deliveredAt: new Date()
      });
      
      await delivery.save();
      
      await UserAlertPreference.findOneAndUpdate(
        { userId: user._id, alertId: alert._id },
        { 
          lastDelivered: new Date(),
          $setOnInsert: { isRead: false, isSnoozed: false }
        },
        { upsert: true }
      );
      
      return { success: true, channel: 'in-app' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
module.exports = InAppNotificationStrategy;