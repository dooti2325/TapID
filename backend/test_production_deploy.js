const http = require('http');
process.env.SERVE_STATIC = 'true';
const app = require('./app');

const PORT = 5056;
const BASE_URL = `http://127.0.0.1:${PORT}`;

let server;

async function testProductionDeploy() {
  console.log('--- Testing Production-Like Deployment & Static Serving ---');
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`[PROD TEST] Server listening on ${BASE_URL}`);
      resolve();
    });
  });

  try {
    // 1. Test SPA root serving
    const rootRes = await fetch(`${BASE_URL}/`);
    const rootText = await rootRes.text();
    console.log(`[PROD TEST] GET / -> status: ${rootRes.status}, contains "<!DOCTYPE html>": ${rootText.includes('<!DOCTYPE html>') || rootText.includes('<html')}`);

    if (rootRes.status !== 200 || (!rootText.includes('<!DOCTYPE html>') && !rootText.includes('<html'))) {
      throw new Error(`Production static serving failed for root: status ${rootRes.status}`);
    }

    // 2. Test SPA deep link fallback (HTML5 history API)
    const spaRes = await fetch(`${BASE_URL}/attendance/reports`);
    const spaText = await spaRes.text();
    console.log(`[PROD TEST] GET /attendance/reports -> status: ${spaRes.status}, serves SPA index.html: ${spaText.includes('<div id="root">') || spaText.includes('index-')}`);

    if (spaRes.status !== 200) {
      throw new Error(`SPA fallback failed: status ${spaRes.status}`);
    }

    // 3. Test API route still works alongside static files
    const apiRes = await fetch(`${BASE_URL}/api/health`);
    const apiJson = await apiRes.json();
    console.log(`[PROD TEST] GET /api/health -> status: ${apiRes.status}, data:`, apiJson);

    if (apiRes.status !== 200 || apiJson.status !== 'ok') {
      throw new Error(`API routing broken under static serving`);
    }

    console.log('\n>>> PRODUCTION-LIKE DEPLOYMENT VERIFICATION PASSED <<<\n');
  } catch (err) {
    console.error('[PROD TEST ERROR]:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
  }
}

testProductionDeploy();
