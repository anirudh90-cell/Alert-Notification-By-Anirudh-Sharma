require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const ReminderScheduler = require('./schedular/ReminderScheduler');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/alerting_platform';
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');

    const scheduler = new ReminderScheduler();
    scheduler.start();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
