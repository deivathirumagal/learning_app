import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db.js';

import authRoutes from './routes/auth.js';
import coursesRoutes from './routes/courses.js';
import enrollmentsRoutes from './routes/enrollments.js';
import progressRoutes from './routes/progress.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Asynchronously initialize database tables and seeds (handles both SQLite and Turso/libSQL)
initDatabase().catch(err => {
  console.error('Fatal Database initialization error:', err);
});

// Middleware to ensure DB is initialized before processing API requests (for serverless environments)
app.use(async (req, res, next) => {
  try {
    await initDatabase();
    next();
  } catch (err) {
    console.error('DB ready check failed:', err);
    res.status(500).json({ error: 'Database initialization failed.' });
  }
});

// CORS configuration: accept configured origin, Vercel preview URLs, or localhost
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // Allow localhost/127.0.0.1 on any port, vercel.app domains, or specified CLIENT_ORIGIN
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    const isVercel = /\.vercel\.app$/.test(origin);
    if (isLocalhost || isVercel || origin === CLIENT_ORIGIN) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logger for debugging and inspection
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Unit 4 E-Learning REST API',
    database: process.env.TURSO_DATABASE_URL ? 'Turso (libSQL Cloud)' : 'SQLite (Local)',
    timestamp: new Date().toISOString()
  });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/progress', progressRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred on the server.'
  });
});

// Start listening only in standalone server mode (when executed directly with node server.js)
const isDirectRun = process.argv[1] && process.argv[1].endsWith('server.js');
if (isDirectRun && (!process.env.VERCEL)) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`  Unit 4 E-Learning Express Server`);
    console.log(`  Running on: http://localhost:${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`  Database: ${process.env.TURSO_DATABASE_URL ? 'Turso (libSQL Cloud)' : 'SQLite (Local)'}`);
    console.log(`=================================================`);
  });
}

export default app;
