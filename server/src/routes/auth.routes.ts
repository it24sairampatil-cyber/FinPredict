// FinPredict.js - Authentication Routes
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authenticateJwt, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password, displayName, role, department } = req.body;

    if (!email || !username || !password || !displayName) {
      res.status(400).json({ error: 'Missing required registration fields.' });
      return;
    }

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (existing) {
      res.status(409).json({ error: 'Username or email is already registered.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      username,
      passwordHash,
      displayName,
      role: role === 'admin' ? 'admin' : 'user',
      department: department || (role === 'admin' ? 'Executive Governance' : 'FP&A Operations'),
      clearanceLevel: role === 'admin' ? 'Executive Compliance Lead' : 'Standard Analyst',
      avatarInitials: displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    });

    await user.save();

    const secret = process.env.JWT_SECRET || 'finpredict_institutional_jwt_secret_key_2026_xyz';
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        department: user.department,
        clearanceLevel: user.clearanceLevel
      },
      secret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        department: user.department,
        clearanceLevel: user.clearanceLevel,
        avatarInitials: user.avatarInitials
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal registration failure.', details: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username/email and password are required.' });
      return;
    }

    const user = await User.findOne({
      $or: [{ username: username.toLowerCase() }, { email: username.toLowerCase() }]
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials. User not found.' });
      return;
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'finpredict_institutional_jwt_secret_key_2026_xyz';
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        department: user.department,
        clearanceLevel: user.clearanceLevel
      },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Authenticated successfully.',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        department: user.department,
        clearanceLevel: user.clearanceLevel,
        avatarInitials: user.avatarInitials
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal authentication failure.', details: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticateJwt, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }
    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve profile.', details: err.message });
  }
});

// POST /api/auth/seed (Seed Default Demo Analyst & Admin Accounts)
router.post('/seed', async (_req: Request, res: Response): Promise<void> => {
  try {
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('DemoPass2026!', salt);

    // 1. Analyst user
    let analyst = await User.findOne({ username: 'analyst' });
    if (!analyst) {
      analyst = new User({
        username: 'analyst',
        email: 'alex.chen@enterprise.internal',
        passwordHash: demoPasswordHash,
        displayName: 'Alex Chen',
        role: 'user',
        department: 'FP&A Operations & Modeling',
        clearanceLevel: 'Standard Analyst',
        avatarInitials: 'AC'
      });
      await analyst.save();
    }

    // 2. Compliance admin
    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      admin = new User({
        username: 'admin',
        email: 'sarah.vance@enterprise.internal',
        passwordHash: demoPasswordHash,
        displayName: 'Sarah Vance, CFA',
        role: 'admin',
        department: 'Executive Governance & Regulatory Compliance',
        clearanceLevel: 'Executive Compliance Lead',
        avatarInitials: 'SV'
      });
      await admin.save();
    }

    res.json({
      message: 'Demo accounts verified in MongoDB.',
      accounts: [
        { username: 'analyst', role: 'user', demoPassword: 'DemoPass2026!' },
        { username: 'admin', role: 'admin', demoPassword: 'DemoPass2026!' }
      ]
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Seeding failure.', details: err.message });
  }
});

export default router;
