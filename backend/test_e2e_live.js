const http = require('http');
const app = require('./app');

const PORT = 5055;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

let server;

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return { status: res.status, ok: res.ok, data };
}

async function runE2ETests() {
  console.log('--- Starting TapID End-to-End Live Integration Verification ---');

  // Start HTTP server on test port
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`[E2E] Test server listening on ${BASE_URL}`);
      resolve();
    });
  });

  try {
    // 1. Health check
    const health = await request(`${BASE_URL}/health`);
    if (health.status !== 200) throw new Error(`Health failed: ${health.status}`);
    console.log('[PASS] 1. GET /api/health ->', health.data);

    // 2. Login as admin
    const adminLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: { email: 'admin@tapid.edu', password: 'password123' }
    });
    if (adminLogin.status !== 200) throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.data)}`);
    console.log('[PASS] 2. POST /api/auth/login (admin) -> status:', adminLogin.status, 'user:', adminLogin.data.user.email);
    const adminToken = adminLogin.data.token;

    // 3. Login as faculty
    const facultyLogin = await request(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: { email: 'faculty@tapid.edu', password: 'password123' }
    });
    if (facultyLogin.status !== 200) throw new Error(`Faculty login failed: ${JSON.stringify(facultyLogin.data)}`);
    console.log('[PASS] 3. POST /api/auth/login (faculty) -> status:', facultyLogin.status, 'user:', facultyLogin.data.user.email);
    const facultyToken = facultyLogin.data.token;

    // 4. Start live attendance session
    const startRes = await request(`${BASE_URL}/session/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${facultyToken}` },
      body: { subject_name: 'Compiler Design', room_number: 'C-102' }
    });
    if (startRes.status !== 200) throw new Error(`Start session failed: ${JSON.stringify(startRes.data)}`);
    const sessionId = startRes.data.session_id;
    console.log('[PASS] 4. POST /api/session/start -> Session ID:', sessionId);

    // 5. Query session details
    const sessionDetails = await request(`${BASE_URL}/session/${sessionId}`, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    if (sessionDetails.status !== 200) throw new Error(`Get session failed: ${JSON.stringify(sessionDetails.data)}`);
    console.log('[PASS] 5. GET /api/session/:id -> Room:', sessionDetails.data.room_number, 'Subject:', sessionDetails.data.subject_name, 'Enrolled:', sessionDetails.data.enrolled_count);

    // 6. Device card tap from ESP32 reader
    const tapRes = await request(`${BASE_URL}/attendance/record`, {
      method: 'POST',
      headers: { 'X-Device-Key': 'tapid-esp32-device-key-2026' },
      body: { rfid_uid: '14:F2:3C:99', mac_address: '24:0A:C4:00:00:01' }
    });
    if (tapRes.status !== 200) throw new Error(`Card tap failed: ${JSON.stringify(tapRes.data)}`);
    console.log('[PASS] 6. POST /api/attendance/record (card tap) ->', tapRes.data);

    // 7. Deduplication / Anti-passback test (duplicate tap)
    const dupTap = await request(`${BASE_URL}/attendance/record`, {
      method: 'POST',
      headers: { 'X-Device-Key': 'tapid-esp32-device-key-2026' },
      body: { rfid_uid: '14:F2:3C:99', mac_address: '24:0A:C4:00:00:01' }
    });
    if (dupTap.status === 409) {
      console.log('[PASS] 7. Deduplication verified: duplicate card tap rejected with HTTP 409 Conflict');
    } else {
      throw new Error(`Duplicate tap expected 409, got ${dupTap.status}`);
    }

    // 8. Verify live session attendance list
    const liveAttendance = await request(`${BASE_URL}/attendance/session/${sessionId}`, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    if (liveAttendance.status !== 200 || !Array.isArray(liveAttendance.data) || liveAttendance.data.length === 0) {
      throw new Error(`Get session attendance failed or empty: ${JSON.stringify(liveAttendance.data)}`);
    }
    console.log('[PASS] 8. GET /api/attendance/session/:id -> Verified present count:', liveAttendance.data.length, 'Student:', liveAttendance.data[0]?.name);

    // 9. Card Revocation & Security Enforcement
    const revRes = await request(`${BASE_URL}/revocation/card`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { uid: '88:E1:90:3F', reason: 'Lost card reported by student' }
    });
    if (revRes.status !== 200) throw new Error(`Revoke card failed: ${JSON.stringify(revRes.data)}`);
    console.log('[PASS] 9a. POST /api/revocation/card -> Card 88:E1:90:3F revoked');

    const revTap = await request(`${BASE_URL}/attendance/record`, {
      method: 'POST',
      headers: { 'X-Device-Key': 'tapid-esp32-device-key-2026' },
      body: { rfid_uid: '88:E1:90:3F', mac_address: '24:0A:C4:00:00:01' }
    });
    if (revTap.status === 403) {
      console.log('[PASS] 9b. Security Enforcement verified: Revoked card rejected with HTTP 403 Forbidden');
    } else {
      throw new Error(`Revoked card expected 403, got ${revTap.status}`);
    }

    // 10. Device Key / Unauthorized reader security check
    const spoofTap = await request(`${BASE_URL}/attendance/record`, {
      method: 'POST',
      headers: { 'X-Device-Key': 'invalid-spoofed-key' },
      body: { rfid_uid: '04:A2:8B:1A', mac_address: '24:0A:C4:00:00:01' }
    });
    if (spoofTap.status === 401) {
      console.log('[PASS] 10. Security Enforcement verified: Spoofed X-Device-Key rejected with HTTP 401 Unauthorized');
    } else {
      throw new Error(`Spoofed device key expected 401, got ${spoofTap.status}`);
    }

    // 11. Reports & Analytics
    const reports = await request(`${BASE_URL}/reports/attendance`, {
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    if (reports.status !== 200) throw new Error(`Reports failed: ${JSON.stringify(reports.data)}`);
    console.log('[PASS] 11. GET /api/reports/attendance -> Students evaluated:', reports.data.studentSummaries.length, 'Classes held:', reports.data.summary.totalClassesHeld);

    // 12. End session
    const endRes = await request(`${BASE_URL}/session/${sessionId}/end`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
    if (endRes.status !== 200) throw new Error(`End session failed: ${JSON.stringify(endRes.data)}`);
    console.log('[PASS] 12. POST /api/session/:id/end ->', endRes.data);

    console.log('\n======================================================');
    console.log('>>> ALL 12 END-TO-END VERIFICATION CHECKS PASSED <<<');
    console.log('======================================================\n');
  } catch (err) {
    console.error('\n[E2E TEST FAILURE]:', err.message);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
  }
}

runE2ETests();
