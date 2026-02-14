const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { initDB } = require('./config/db');
const authRoutes = require('./routes/auth.routes');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server failed to start:', error);
    process.exit(1);
  }
};

startServer();