const express = require('express');
require('dotenv').config();

const { initDB } = require('./config/db');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);

const startServer = async () => {
  await initDB();

  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
};

startServer();