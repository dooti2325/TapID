#!/usr/bin/env node
/**
 * ============================================================================
 * TapID Database Automated Backup & Rotation Script
 * ============================================================================
 * Dumps MySQL schema, data, triggers, and procedures, compresses with Gzip,
 * and maintains a rolling retention policy.
 *
 * Usage:
 *   node scripts/backup_database.js [--max-backups 14]
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { spawn } = require('child_process');

// Native zero-dependency .env loader
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const val = match[2].trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
                process.env[key] = val;
            }
        }
    }
}

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '3306';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'tapid';

const BACKUP_DIR = path.resolve(__dirname, '..', 'backups');
const MAX_BACKUPS = parseInt(process.env.BACKUP_RETENTION_COUNT || '14', 10);

// Find mysqldump executable
function findMysqldumpBinary() {
    const candidates = [
        'mysqldump',
        'C:\\Program Files\\MySQL\\MySQL Server 5.7\\bin\\mysqldump.exe',
        'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
        '/usr/bin/mysqldump',
        '/usr/local/bin/mysqldump'
    ];

    for (const candidate of candidates) {
        try {
            if (candidate === 'mysqldump') {
                return 'mysqldump';
            }
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        } catch {
            // continue searching
        }
    }
    return 'mysqldump';
}

async function performBackup() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `tapid_backup_${timestamp}.sql.gz`;
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    const mysqldumpBin = findMysqldumpBinary();
    console.log(`[Backup] Using mysqldump binary: ${mysqldumpBin}`);
    console.log(`[Backup] Target database: ${DB_NAME}@${DB_HOST}:${DB_PORT} (User: ${DB_USER})`);

    const args = [
        `--host=${DB_HOST}`,
        `--port=${DB_PORT}`,
        `--user=${DB_USER}`,
        `--password=${DB_PASS}`,
        '--routines',
        '--triggers',
        '--single-transaction',
        '--quick',
        DB_NAME
    ];

    return new Promise((resolve, reject) => {
        const dumpProcess = spawn(mysqldumpBin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
        const gzip = zlib.createGzip({ level: 9 });
        const outputStream = fs.createWriteStream(backupFilePath);

        let stderrData = '';

        dumpProcess.stdout.pipe(gzip).pipe(outputStream);

        dumpProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        dumpProcess.on('error', (err) => {
            reject(new Error(`Failed to start mysqldump: ${err.message}`));
        });

        outputStream.on('finish', () => {
            if (stderrData && !stderrData.includes('Using a password on the command line interface can be insecure')) {
                console.warn(`[Backup Warning] ${stderrData.trim()}`);
            }

            const stats = fs.statSync(backupFilePath);
            const sizeKb = (stats.size / 1024).toFixed(2);
            console.log(`[Backup Success] Created: ${backupFileName} (${sizeKb} KB)`);
            rotateBackups();
            resolve(backupFilePath);
        });

        dumpProcess.on('close', (code) => {
            if (code !== 0) {
                if (fs.existsSync(backupFilePath)) {
                    fs.unlinkSync(backupFilePath);
                }
                reject(new Error(`mysqldump exited with error code ${code}: ${stderrData}`));
            }
        });
    });
}

function rotateBackups() {
    try {
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('tapid_backup_') && (f.endsWith('.sql.gz') || f.endsWith('.sql')))
            .map(f => ({
                name: f,
                path: path.join(BACKUP_DIR, f),
                time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time);

        if (files.length > MAX_BACKUPS) {
            const toDelete = files.slice(MAX_BACKUPS);
            for (const file of toDelete) {
                fs.unlinkSync(file.path);
                console.log(`[Rotation] Pruned old backup: ${file.name}`);
            }
        }
        console.log(`[Rotation] Current active backups retained: ${Math.min(files.length, MAX_BACKUPS)} / ${MAX_BACKUPS}`);
    } catch (err) {
        console.error('[Rotation Error]', err.message);
    }
}

if (require.main === module) {
    performBackup()
        .then(() => {
            console.log('[Backup] Completed successfully.');
            process.exit(0);
        })
        .catch((err) => {
            console.error('[Backup Failed]', err.message);
            process.exit(1);
        });
}

module.exports = { performBackup, rotateBackups };
