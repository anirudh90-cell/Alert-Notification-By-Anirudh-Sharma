class NotificationStrategy {
  async deliver(alert, user) {
    throw new Error('deliver method must be implemented');
  }
}
module.exports = NotificationStrategy;
