require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { testConnection } = require('./db');
const authRoutes = require('./routes/auth');
const salonRoutes = require('./routes/salons');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/salons', salonRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await testConnection();
});

module.exports = app;
