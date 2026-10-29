import { Router } from 'express';
import { storage, UserRecord } from '../services/storage';

const router = Router();

// Get current logged in user
router.get('/me', (req, res) => {
  const users = storage.getUsers();
  // Return first user by default (demo mode) or query
  const userId = req.headers['x-user-id'] as string;
  const user = (userId && storage.getUserById(userId)) || users[0];
  res.json({ success: true, user });
});

// Demo login switch
router.post('/demo-login', (req, res) => {
  const { role } = req.body; // 'farmer' or 'admin'
  const users = storage.getUsers();
  const targetUser = users.find(u => u.role === (role || 'farmer')) || users[0];
  storage.addAuditLog(targetUser.name, 'DEMO_LOGIN', `Logged in via demo mode as ${targetUser.role}`);
  res.json({
    success: true,
    user: targetUser,
    token: `demo-jwt-token-${targetUser.id}`,
    message: `Logged in as demo ${targetUser.role} (${targetUser.name})`,
  });
});

// Regular Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const users = storage.getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase()) || users[0];

  storage.addAuditLog(user.name, 'USER_LOGIN', `User logged in with email ${email}`);
  res.json({
    success: true,
    user,
    token: `jwt-token-${user.id}`,
    message: 'Login successful',
  });
});

// Signup
router.post('/signup', (req, res) => {
  const { name, email, phone, role, preferredLanguage, state, district } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required.' });
  }

  const newUser: UserRecord = {
    id: `usr-${Date.now()}`,
    name,
    email,
    phone: phone || '+91 90000 00000',
    role: role === 'admin' ? 'admin' : 'farmer',
    preferredLanguage: preferredLanguage || 'hi',
    state: state || 'Haryana',
    district: district || 'Karnal',
    createdAt: new Date().toISOString(),
  };

  storage.addUser(newUser);
  storage.addAuditLog(newUser.name, 'USER_REGISTER', `New user registered: ${newUser.email}`);

  res.status(201).json({
    success: true,
    user: newUser,
    token: `jwt-token-${newUser.id}`,
    message: 'User account created successfully.',
  });
});

// Update profile / language
router.put('/profile', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'usr-farmer-01';
  const user = storage.getUserById(userId);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  const { name, phone, preferredLanguage, state, district } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (preferredLanguage) user.preferredLanguage = preferredLanguage;
  if (state) user.state = state;
  if (district) user.district = district;

  storage.saveDatabase();
  res.json({ success: true, user, message: 'Profile updated successfully.' });
});

export default router;

