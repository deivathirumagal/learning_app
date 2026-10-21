import { db } from '../db.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : authHeader;

  if (!token) {
    return res.status(401).json({
      error: 'HTTP 401 Unauthorized',
      message: 'Access token required. Please sign in to continue.'
    });
  }

  // Validate 32-character hexadecimal token format: /^[0-9a-f]{32}$/i
  if (!/^[0-9a-f]{32}$/i.test(token)) {
    return res.status(401).json({
      error: 'HTTP 401 Unauthorized',
      message: 'Invalid token format. Expected a 32-character hexadecimal token.'
    });
  }

  // Query SQLite sessions table joining users
  const session = db.prepare(`
    SELECT s.token, s.user_id, s.expires_at, u.id, u.name, u.email, u.role, u.roll_no, u.department
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
  `).get(token);

  if (!session) {
    return res.status(401).json({
      error: 'HTTP 401 Unauthorized',
      message: 'Invalid or expired session token. Please log in again.'
    });
  }

  // Check expiration
  if (new Date(session.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return res.status(401).json({
      error: 'HTTP 401 Unauthorized',
      message: 'Your session has expired. Please log in again.'
    });
  }

  req.user = {
    id: session.id,
    name: session.name,
    email: session.email,
    role: session.role,
    roll_no: session.roll_no,
    department: session.department
  };

  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'HTTP 403 Forbidden',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
}
