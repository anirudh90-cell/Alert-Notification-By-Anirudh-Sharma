const cron = require('node-cron');
const AlertService = require('../services/AlertService');
const UserAlertPreference = require('../models/UserAlertPreference');

class ReminderScheduler {
  constructor() {
    this.alertService = new AlertService();
  }
  
  start() {
    cron.schedule('0 */2 * * *', async () => {
      console.log('Processing reminders...');
      try {
        await this.alertService.processReminders();
        console.log('Reminders processed successfully');
      } catch (error) {
        console.error('Error processing reminders:', error);
      }
    });
    
    cron.schedule('0 0 * * *', async () => {
      console.log('Resetting daily snooze flags...');
      try {
        const now = new Date();
        await UserAlertPreference.updateMany(
          { 
            isSnoozed: true,
            snoozeUntil: { $lte: now }
          },
          { 
            isSnoozed: false,
            $unset: { snoozeUntil: 1 }
          }
        );
        console.log('Snooze flags reset successfully');
      } catch (error) {
        console.error('Error resetting snooze flags:', error);
      }
    });
  }
}
module.exports = ReminderScheduler;