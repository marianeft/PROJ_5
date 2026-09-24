import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-jwt-secret-in-vercel';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cookies = Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(cookie => {
      const separator = cookie.indexOf('=');
      return [cookie.slice(0, separator).trim(), decodeURIComponent(cookie.slice(separator + 1))];
    }));
    const user = jwt.verify(cookies.iesis_token || '', JWT_SECRET);
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    });
  } catch {
    return res.status(401).json({ error: 'Not authenticated' });
  }
}
