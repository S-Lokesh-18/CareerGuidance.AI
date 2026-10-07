import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_career_guidance_portal_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Check existing email
    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
        data: null,
      });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name.trim(), email.toLowerCase().trim(), passwordHash]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie('token', token, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
        data: null,
      });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
        data: null,
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie('token', token, COOKIE_OPTIONS);

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at,
        },
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie('token', COOKIE_OPTIONS);
  return res.json({
    success: true,
    message: 'Logged out successfully.',
    data: null,
  });
}

export async function getMe(req, res, next) {
  try {
    const result = await query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
        data: null,
      });
    }

    return res.json({
      success: true,
      message: 'User profile retrieved.',
      data: {
        user: result.rows[0],
      },
    });
  } catch (err) {
    next(err);
  }
}

export default {
  register,
  login,
  logout,
  getMe,
};
