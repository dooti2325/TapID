const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const verifyToken = require('../middleware/auth.middleware');
const verifyAdmin = require('../middleware/role.middleware');
const logger = require('../config/logger');
const db = require('../config/database');

router.get('/audit', verifyToken, verifyAdmin('admin'), async (req, res) => {
    try {
        const [logs] = await db.query(`
            SELECT a.*, u.email as user_email
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.timestamp DESC LIMIT 100
        `);
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching audit logs' });
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
