import jwt from 'jsonwebtoken';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'allianza-leadership-platform-secret-12345';

export function hashPassword(password) {
  if (!password) return '';
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(password, hashedPassword) {
  if (!password || !hashedPassword) return false;
  return hashPassword(password) === hashedPassword;
}

export function createAuthToken(user) {
  return jwt.sign(
    {
      id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export function isAccountActive(user) {
  return !user.status || user.status === 'active';
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get('token')?.value;

    if (!token) {
      const headerStore = await headers();
      const authorization = headerStore.get('authorization');
      if (authorization?.startsWith('Bearer ')) {
        token = authorization.slice(7).trim();
      }
    }

    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    return null;
  }
}
