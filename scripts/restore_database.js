#!/usr/bin/env node
/**
 * ============================================================================
 * TapID Database Restore Script
 * ============================================================================
 * Restores a compressed (.sql.gz) or plain SQL (.sql) backup file into the
 * configured MySQL database.
 *
 * Usage:
 *   node scripts/restore_database.js [path/to/backup.sql.gz]
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

function findMySQLBinary() {
    const candidates = [
        'mysql',
        'C:\\Program Files\\MySQL\\MySQL Server 5.7\\bin\\mysql.exe',
        'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
        '/usr/bin/mysql',
        '/usr/local/bin/mysql'
    ];

    for (const candidate of candidates) {
        try {
            if (candidate === 'mysql') return 'mysql';
            if (fs.existsSync(candidate)) return candidate;
        } catch {
            // continue
        }
    }
    return 'mysql';
}

function getLatestBackup() {
    if (!fs.existsSync(BACKUP_DIR)) return null;
    const files = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.startsWith('tapid_backup_') && (f.endsWith('.sql.gz') || f.endsWith('.sql')))
        .map(f => ({
            name: f,
            path: path.join(BACKUP_DIR, f),
            time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

    return files.length > 0 ? files[0].path : null;
}

async function restoreBackup(filePath) {
    const targetFile = filePath || getLatestBackup();
    if (!targetFile || !fs.existsSync(targetFile)) {
        throw new Error(`Backup file not found: ${targetFile}`);
    }

    const mysqlBin = findMySQLBinary();
    console.log(`[Restore] Target backup file: ${targetFile}`);
    console.log(`[Restore] Restoring to ${DB_NAME}@${DB_HOST}:${DB_PORT} using ${mysqlBin}...`);

    const args = [
        `--host=${DB_HOST}`,
        `--port=${DB_PORT}`,
        `--user=${DB_USER}`,
        `--password=${DB_PASS}`,
        DB_NAME
    ];

    return new Promise((resolve, reject) => {
        const mysqlProcess = spawn(mysqlBin, args, { stdio: ['pipe', 'inherit', 'pipe'] });
        let stderrData = '';

        mysqlProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        if (targetFile.endsWith('.gz')) {
            const gunzip = zlib.createGunzip();
            fs.createReadStream(targetFile).pipe(gunzip).pipe(mysqlProcess.stdin);
        } else {
            fs.createReadStream(targetFile).pipe(mysqlProcess.stdin);
        }

        mysqlProcess.on('close', (code) => {
            if (code === 0) {
                console.log(`[Restore Success] Database ${DB_NAME} restored successfully from ${path.basename(targetFile)}!`);
                resolve();
            } else {
                reject(new Error(`MySQL client exited with code ${code}: ${stderrData}`));
            }
        });

        mysqlProcess.on('error', (err) => {
            reject(new Error(`Failed to spawn mysql client: ${err.message}`));
        });
    });
}

if (require.main === module) {
    const specifiedFile = process.argv[2];
    restoreBackup(specifiedFile)
        .then(() => process.exit(0))
        .catch(err => {
            console.error('[Restore Failed]', err.message);
            process.exit(1);
        });
}

module.exports = { restoreBackup };
