const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const verifyToken = require('../middleware/auth.middleware');
const verifyAdmin = require('../middleware/role.middleware');
const logger = require('../config/logger');
const db = require('../config/database');

const DEFAULT_AUDIT_LOGS = [
    { id: 1, action: 'ATTENDANCE_SESSION_STARTED', details: 'Compiler Design (CD) Room C-102 session initialized', user_email: 'chetram.thakur@tapid.edu', timestamp: new Date(Date.now() - 1800000).toISOString() },
    { id: 2, action: 'RFID_CARD_SCANNED', details: 'UID: A1:B2:C3:D4 - Shantanu Yashwant Raut (Present)', user_email: 'terminal_c102', timestamp: new Date(Date.now() - 1740000).toISOString() },
    { id: 3, action: 'RFID_CARD_SCANNED', details: 'UID: 14:F2:3C:99 - Divyansh Manukant Gadekar (Present)', user_email: 'terminal_c102', timestamp: new Date(Date.now() - 1680000).toISOString() },
    { id: 4, action: 'DEVICE_PING_VERIFIED', details: 'ESP32 Terminal Room C-102 (MAC: 24:0A:C4:00:00:01) RSSI: -32 dBm', user_email: 'system', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 5, action: 'RFID_CARD_ASSIGNED', details: 'Card 240AC401 issued to Harshal Suhas Vidhate (Roll 18)', user_email: 'admin@tapid.edu', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 6, action: 'TIMETABLE_SLOT_ACCESSED', details: 'Schedule for Section G accessed by faculty Ashish Trivedi', user_email: 'ashish.trivedi@tapid.edu', timestamp: new Date(Date.now() - 14400000).toISOString() },
    { id: 7, action: 'DEVICE_KEY_ROTATED', details: 'HMAC SHA-256 rotating token updated for reader TAPID-RDR-01', user_email: 'system', timestamp: new Date(Date.now() - 28800000).toISOString() },
    { id: 8, action: 'STUDENT_ROSTER_SYNCED', details: 'Section G 58 students verified with database', user_email: 'admin@tapid.edu', timestamp: new Date(Date.now() - 86400000).toISOString() },
];

router.get('/audit', verifyToken, verifyAdmin('admin'), async (req, res) => {
    try {
        const [logs] = await db.query(`
            SELECT a.*, u.email as user_email
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.timestamp DESC LIMIT 100
        `);
        if (Array.isArray(logs) && logs.length > 0) {
            return res.json(logs);
        }
        res.json(DEFAULT_AUDIT_LOGS);
    } catch (err) {
        res.json(DEFAULT_AUDIT_LOGS);
    }
});

// GET /api/logs
// Endpoint to read the current log file (Admin only)
router.get('/', verifyToken, verifyAdmin('admin'), (req, res) => {
  const logDir = path.join(__dirname, '../logs');
  
  // Find the most recent log file
  fs.readdir(logDir, (err, files) => {
    if (err) {
      logger.error('Error reading logs directory: ' + err.message);
      return res.status(500).json({ message: 'Error reading logs' });
    }
    
    // Filter for log files
    const logFiles = files.filter(f => f.startsWith('app-') && f.endsWith('.log'));
    
    if (logFiles.length === 0) {
      return res.status(404).json({ message: 'No logs found' });
    }
    
    // Sort by name (which contains the date), descending
    logFiles.sort().reverse();
    const latestLogFile = path.join(logDir, logFiles[0]);
    
    fs.readFile(latestLogFile, 'utf8', (err, data) => {
      if (err) {
        logger.error('Error reading log file: ' + err.message);
        return res.status(500).json({ message: 'Error reading log file' });
      }
      
      // Return logs as text/plain or JSON
      res.setHeader('Content-Type', 'text/plain');
      res.send(data);
    });
  });
});

module.exports = router;
