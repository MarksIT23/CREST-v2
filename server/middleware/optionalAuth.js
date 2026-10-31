import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'crest-cect-secret-key-2026';

export function getRequester(req) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.role) return null;
    return { id: decoded.id, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}

export function isStaffRequester(req) {
  const requester = getRequester(req);
  return { requester, staff: !!requester && (requester.role === 'admin' || requester.role === 'faculty') };
}
