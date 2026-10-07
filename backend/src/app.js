import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';


import authRoutes from './routes/authRoutes.js';
import careerRoutes from './routes/careerRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security headers
app.use(helmet());

// CORS config
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin || origin === CLIENT_URL || origin === 'http://localhost:5173' || origin === 'http://127.0.0.1:5173') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    data: null,
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again shortly.',
    data: null,
  },
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 45,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI request limit reached. Please wait a few moments before trying again.',
    data: null,
  },
});

app.use('/api', generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Career Guidance Portal Backend is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// App routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/roadmaps', aiLimiter, roadmapRoutes);
app.use('/api/resume', aiLimiter, resumeRoutes);
app.use('/api/chat', aiLimiter, chatRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 & Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
