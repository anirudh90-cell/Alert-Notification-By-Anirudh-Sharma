const express = require('express');
const cors = require('cors');
const alertRoutes = require('./controllers/alertController');
const auth = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(auth);

app.use('/api', alertRoutes);

module.exports = app;