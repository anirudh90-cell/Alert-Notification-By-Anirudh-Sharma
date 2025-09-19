const Alert = require('../models/Alert');
const User = require('../models/User');
const UserAlertPreference = require('../models/UserAlertPreference');
const NotificationService = require('./NotificationService');

class AlertService {
  constructor() {
    this.notificationService = new NotificationService();
  }
  
  async createAlert(alertData, creatorId) {
    const alert = new Alert({
      ...alertData,
      createdBy: creatorId
    });
    
    await alert.save();
    
    if (alert.isActive && new Date() >= alert.startTime) {
      await this.deliverAlert(alert);
    }
    
    return alert;
  }
  
  async updateAlert(alertId, updates) {
    const alert = await Alert.findByIdAndUpdate(alertId, updates, { new: true });
    return alert;
  }
  
  async deliverAlert(alert) {
    const users = await this.notificationService.getEligibleUsers(alert);
    const results = await this.notificationService.deliverAlert(alert, users);
    return results;
  }
  
  async processReminders() {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    
    const alerts = await Alert.find({
      isActive: true,
      reminderEnabled: true,
      startTime: { $lte: now },
      $or: [
        { expiryTime: { $exists: false } },
        { expiryTime: { $gt: now } }
      ]
    });
    
    for (const alert of alerts) {
      const preferences = await UserAlertPreference.find({
        alertId: alert._id,
        $or: [
          { lastDelivered: { $exists: false } },
          { lastDelivered: { $lte: twoHoursAgo } }
        ]
      }).populate('userId');
      
      if (preferences.length > 0) {
        const users = preferences.map(p => p.userId).filter(Boolean);
        await this.notificationService.deliverAlert(alert, users);
      }
    }
  }
}
module.exports = AlertService;
