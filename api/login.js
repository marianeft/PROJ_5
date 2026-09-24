import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-jwt-secret-in-vercel';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (username !== 'admin' || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const user = {
    id: 1,
    username: 'admin',
    email: 'admin@iesis.local',
    full_name: 'Administrator',
    role: 'admin'
  };
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });

  res.setHeader('Set-Cookie', `iesis_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${process.env.VERCEL ? '; Secure' : ''}`);
  return res.status(200).json({ success: true, message: 'Login successful', user, token });
}
