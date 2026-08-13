const express = require('express');
const cors = require('cors');
const logger = require('./config/logger');

const app = express();
app.set('logger', logger);

const loggerMiddleware = require('./middleware/loggerMiddleware');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  credentials: true
}));
app.use(express.json());
app.use(loggerMiddleware);
const auditLogger = require('./middleware/audit.middleware');
app.use(auditLogger);
app.use(limiter);

// Routes
const authRoutes = require('./routes/auth.routes');
const sessionRoutes = require('./routes/session.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const studentRoutes = require('./routes/student.routes');
const classroomRoutes = require('./routes/classroom.routes');
const deviceRoutes = require('./routes/device.routes');
const reportsRoutes = require('./routes/reports.routes');
const adminRoutes = require('./routes/admin.routes');
const subjectRoutes = require('./routes/subject.routes');
const facultyRoutes = require('./routes/faculty.routes');
const uploadRoutes = require('./routes/upload.js');
const logsRoutes = require('./routes/logs.js');
const analyticsRoutes = require('./routes/analytics.js');
const timetableRoutes = require('./routes/timetable.routes');
const revocationRoutes = require('./routes/revocation.routes');

app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/revocation', revocationRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'TapID API is running' });
});

app.use((err, req, res, next) => {
  logger.error(err.message);
  if (err.name === 'MulterError' || err.message.startsWith('Only images')) {
    return res.status(400).json({ message: err.message });
  }
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Internal server error');
  return res.status(500).json({ message });
});

module.exports = app;
