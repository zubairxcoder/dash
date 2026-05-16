const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!origin || origin.includes('localhost') || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    const allowed = process.env.CLIENT_URL;
    if (allowed && origin === allowed) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB connection (cached for serverless)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log('✅ MongoDB Connected');
};

// Middleware to ensure DB is connected on every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'DB connection failed' });
  }
});

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/projects',  require('./routes/projects'));
app.use('/api/tasks',     require('./routes/tasks'));
app.use('/api/clients',   require('./routes/clients'));
app.use('/api/team',      require('./routes/team'));
app.use('/api/finance',   require('./routes/finance'));
app.use('/api/activity',  require('./routes/activity'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '✅ DevOps Dashboard API Running' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route Not Found' });
});

// For local dev
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;