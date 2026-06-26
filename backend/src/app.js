const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const path = require('path');

require('dotenv').config();

const { errorHandler, notFound } = require('./middlewares/error.middleware');
const logger = require('./utils/logger');

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  skip: (req) => req.path === '/api/health',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization
app.use(mongoSanitize());

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/teachers', require('./routes/teacher.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/fees', require('./routes/fee.routes'));
app.use('/api/exams', require('./routes/exam.routes'));
app.use('/api/homework', require('./routes/homework.routes'));
app.use('/api/notices', require('./routes/notice.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/library', require('./routes/library.routes'));
app.use('/api/transport', require('./routes/transport.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/settings', require('./routes/settings.routes'));

// Additional routes
const classRoutes = require('./routes/class.routes');
const subjectRoutes = require('./routes/subject.routes');
const parentRoutes = require('./routes/parent.routes');
const timetableRoutes = require('./routes/timetable.routes');
const hrRoutes = require('./routes/hr.routes');
const documentRoutes = require('./routes/document.routes');

app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/documents', documentRoutes);

// Root route to prevent 404 on Render ping
app.get('/', (req, res) => {
  res.status(200).send('School ERP API is running.');
});

// Favicon route to prevent 404 errors
app.get('/favicon.ico', (req, res) => res.status(204).end());

// 404
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;
