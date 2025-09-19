const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const User = require('../models/User');
const Team = require('../models/Team');
const UserAlertPreference = require('../models/UserAlertPreference');
const NotificationDelivery = require('../models/NotificationDelivery');
const AlertService = require('../services/AlertService');
const alertService = new AlertService();

// Admin Routes
router.post('/alerts', async (req, res) => {
  try {
    const alert = await alertService.createAlert(req.body, req.user.id);
    res.status(201).json(alert);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/alerts', async (req, res) => {
  try {
    const { severity, status, audience, audienceIds } = req.query;
    const filter = {};

    if (severity) filter.severity = severity;
    if (status === 'active') filter.isActive = true;
    if (status === 'expired') filter.expiryTime = { $lt: new Date() };

    if (audience && audience !== 'all') {
      filter['visibility.type'] = audience;
      if ((audience === 'team' || audience === 'user') && audienceIds) {
        const ids = audienceIds.split(',');
        filter['visibility.targetIds'] = { $in: ids };
      }
    }

    const alerts = await Alert.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/alerts/:id', async (req, res) => {
  try {
    const alert = await alertService.updateAlert(req.params.id, req.body);
    res.json(alert);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User Routes
router.get('/user/alerts', async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    // Find alerts based on visibility
    const alerts = await Alert.find({
      isActive: true,
      startTime: { $lte: new Date() },
      $and: [
        { $or: [ { expiryTime: { $exists: false } }, { expiryTime: { $gt: new Date() } } ] },
        { $or: [
            { 'visibility.type': 'organization' },
            { 'visibility.type': 'team', 'visibility.targetIds': user?.teamId },
            { 'visibility.type': 'user', 'visibility.targetIds': userId }
        ] }
      ]
    });
    
    // Get user preferences for each alert
    const alertsWithPreferences = await Promise.all(
      alerts.map(async (alert) => {
        const preference = await UserAlertPreference.findOne({
          userId,
          alertId: alert._id
        });
        
        return {
          ...alert.toObject(),
          isRead: preference?.isRead || false,
          isSnoozed: preference?.isSnoozed || false,
          snoozeUntil: preference?.snoozeUntil
        };
      })
    );
    
    res.json(alertsWithPreferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/user/alerts/:id/snooze', async (req, res) => {
  try {
    const userId = req.user.id;
    const alertId = req.params.id;
    
    // Snooze until end of day
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    await UserAlertPreference.findOneAndUpdate(
      { userId, alertId },
      { 
        isSnoozed: true, 
        snoozeUntil: tomorrow 
      },
      { upsert: true }
    );
    
    res.json({ message: 'Alert snoozed until tomorrow' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/user/alerts/:id/read', async (req, res) => {
  try {
    const userId = req.user.id;
    const alertId = req.params.id;
    
    await UserAlertPreference.findOneAndUpdate(
      { userId, alertId },
      { isRead: true },
      { upsert: true }
    );
    
    res.json({ message: 'Alert marked as read' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/user/alerts/:id/unread', async (req, res) => {
  try {
    const userId = req.user.id;
    const alertId = req.params.id;

    await UserAlertPreference.findOneAndUpdate(
      { userId, alertId },
      { isRead: false },
      { upsert: true }
    );

    res.json({ message: 'Alert marked as unread' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Snoozed alerts list for user
router.get('/user/alerts/snoozed', async (req, res) => {
  try {
    const userId = req.user.id;
    const prefs = await UserAlertPreference.find({ userId, isSnoozed: true })
      .populate('alertId');
    const list = prefs
      .filter(p => p.alertId)
      .map(p => ({
        _id: p.alertId._id,
        title: p.alertId.title,
        message: p.alertId.message,
        severity: p.alertId.severity,
        visibility: p.alertId.visibility,
        snoozeUntil: p.snoozeUntil
      }));
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin helper routes used by UI
router.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find({}).select('_id name email role teamId');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/admin/teams', async (req, res) => {
  try {
    const teams = await Team.find({}).select('_id name');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: trigger reminders manually (for demo/testing)
router.post('/admin/trigger-reminders', async (req, res) => {
  try {
    await alertService.processReminders();
    res.json({ message: 'Reminders processed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics Route
router.get('/analytics', async (req, res) => {
  try {
    const totalAlerts = await Alert.countDocuments();
    const activeAlerts = await Alert.countDocuments({ isActive: true });
    
    const severityBreakdown = await Alert.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    
    const deliveryStats = await NotificationDelivery.aggregate([
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        } 
      }
    ]);
    
    const snoozeStats = await UserAlertPreference.aggregate([
      { 
        $match: { isSnoozed: true } 
      },
      { 
        $group: { 
          _id: '$alertId', 
          snoozeCount: { $sum: 1 } 
        } 
      }
    ]);
    
    res.json({
      totalAlerts,
      activeAlerts,
      severityBreakdown,
      deliveryStats,
      totalSnoozed: snoozeStats.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

