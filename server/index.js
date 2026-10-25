// FinPredict.js - Node.js & MongoDB Server for User & Activity Persistence
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from './models/User.js';
import { Activity } from './models/Activity.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finpredict';

app.use(cors());
app.use(express.json());

// In-memory fallback if MongoDB instance is not connected
let isMongoConnected = false;
const inMemoryUsers = new Map();
const inMemoryActivities = [];

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 3000
}).then(() => {
  isMongoConnected = true;
  console.log('✅ Connected to MongoDB successfully.');
}).catch((err) => {
  isMongoConnected = false;
  console.warn('⚠️ MongoDB connection deferred or unavailable:', err.message);
  console.log('ℹ️ Server will operate with persistent in-memory fallback.');
});

mongoose.connection.on('connected', () => { isMongoConnected = true; });
mongoose.connection.on('disconnected', () => { isMongoConnected = false; });

// 1. Health Status Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isMongoConnected ? 'connected' : 'in_memory_fallback',
    timestamp: new Date().toISOString()
  });
});

// 2. User Authentication & Registration (MongoDB Upsert)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, role } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const cleanUsername = username.trim();
    const cleanRole = role === 'admin' ? 'admin' : 'user';
    const cleanName = cleanUsername.includes('@') ? cleanUsername.split('@')[0] : cleanUsername;
    const avatarInitials = cleanName.length >= 2
      ? cleanName.slice(0, 2).toUpperCase()
      : cleanName.slice(0, 1).toUpperCase();

    const userData = {
      username: cleanName,
      displayName: cleanName,
      email: cleanUsername.includes('@') ? cleanUsername : `${cleanName.toLowerCase()}@enterprise.internal`,
      role: cleanRole,
      department: cleanRole === 'admin' ? 'Executive Governance & Regulatory Compliance' : 'FP&A Operations & Modeling',
      clearanceLevel: cleanRole === 'admin' ? 'Executive Compliance Lead' : 'Standard Analyst',
      avatarInitials,
      lastLogin: new Date()
    };

    let user;
    if (isMongoConnected) {
      user = await User.findOneAndUpdate(
        { username: cleanName },
        { $set: userData },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      inMemoryUsers.set(cleanName, userData);
      user = userData;
    }

    // Auto-log login activity in MongoDB
    const loginActivity = {
      username: cleanName,
      role: cleanRole,
      action: 'LOGIN',
      category: 'AUTH',
      details: { clearance: userData.clearanceLevel },
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      timestamp: new Date()
    };

    if (isMongoConnected) {
      await Activity.create(loginActivity);
    } else {
      inMemoryActivities.unshift({ id: `act_${Date.now()}`, ...loginActivity });
    }

    res.json({ user, storage: isMongoConnected ? 'mongodb' : 'in_memory' });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to process user authentication' });
  }
});

// 3. Log User Activity (MongoDB Insert)
app.post('/api/activities', async (req, res) => {
  try {
    const { username, role, action, category, details } = req.body;
    if (!username || !action) {
      return res.status(400).json({ error: 'Username and action are required' });
    }

    const activityData = {
      username,
      role: role || 'user',
      action,
      category: category || 'SYSTEM',
      details: details || {},
      ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      timestamp: new Date()
    };

    let savedActivity;
    if (isMongoConnected) {
      savedActivity = await Activity.create(activityData);
    } else {
      savedActivity = { id: `act_${Date.now()}_${Math.random()}`, ...activityData };
      inMemoryActivities.unshift(savedActivity);
      if (inMemoryActivities.length > 500) inMemoryActivities.pop();
    }

    res.status(201).json({ activity: savedActivity, storage: isMongoConnected ? 'mongodb' : 'in_memory' });
  } catch (error) {
    console.error('Error recording activity:', error);
    res.status(500).json({ error: 'Failed to record activity log' });
  }
});

// 4. Retrieve User Activities (Audit Log Stream)
app.get('/api/activities', async (req, res) => {
  try {
    const { username, category, limit = 100 } = req.query;
    const maxLimit = Math.min(parseInt(limit, 10) || 100, 200);

    let activities;
    if (isMongoConnected) {
      const query = {};
      if (username) query.username = username;
      if (category) query.category = category;
      activities = await Activity.find(query).sort({ timestamp: -1 }).limit(maxLimit).lean();
    } else {
      activities = inMemoryActivities.filter(a => {
        if (username && a.username !== username) return false;
        if (category && a.category !== category) return false;
        return true;
      }).slice(0, maxLimit);
    }

    res.json({ activities, storage: isMongoConnected ? 'mongodb' : 'in_memory' });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch user activities' });
  }
});

// 5. List All Users
app.get('/api/users', async (req, res) => {
  try {
    let users;
    if (isMongoConnected) {
      users = await User.find({}).sort({ lastLogin: -1 }).lean();
    } else {
      users = Array.from(inMemoryUsers.values());
    }
    res.json({ users, storage: isMongoConnected ? 'mongodb' : 'in_memory' });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users list' });
  }
});

// 6. Production Static Asset Serving for Single-Port Deployment
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) res.status(404).send('FinPredict distribution bundle building. Please run npm run build.');
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FinPredict Backend API & Static Server running on port ${PORT}`);
});
