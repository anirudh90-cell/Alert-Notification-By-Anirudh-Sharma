const User = require('../models/User');
const UserAlertPreference = require('../models/UserAlertPreference');
const InAppNotificationStrategy = require('../strategies/InAppNotificationStrategy');
const EmailNotificationStrategy = require('../strategies/EmailNotificationStrategy');
const SMSNotificationStrategy = require('../strategies/SMSNotificationStrategy');

class NotificationService {
  constructor() {
    this.strategies = {
      'in-app': new InAppNotificationStrategy(),
      'email': new EmailNotificationStrategy(),
      'sms': new SMSNotificationStrategy()
    };
  }
  
  async deliverAlert(alert, users) {
    const results = [];
    
    for (const user of users) {
      const strategy = this.strategies[alert.deliveryType];
      if (strategy) {
        const result = await strategy.deliver(alert, user);
        results.push({ userId: user._id, ...result });
      }
    }
    
    return results;
  }
  
  async getEligibleUsers(alert) {
    let users = [];
    
    switch (alert.visibility.type) {
      case 'organization':
        users = await User.find({});
        break;
        
      case 'team':
        users = await User.find({ teamId: { $in: alert.visibility.targetIds } });
        break;
        
      case 'user':
        users = await User.find({ _id: { $in: alert.visibility.targetIds } });
        break;
    }
    
    const now = new Date();
    const eligibleUsers = [];
    
    for (const user of users) {
      const preference = await UserAlertPreference.findOne({
        userId: user._id,
        alertId: alert._id
      });
      
      if (!preference || !preference.isSnoozed || 
          (preference.snoozeUntil && preference.snoozeUntil < now)) {
        eligibleUsers.push(user);
      }
    }
    
    return eligibleUsers;
  }
}
module.exports = NotificationService;
