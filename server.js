import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Load app version from package.json if available
let packageVersion = '1.0.0';
try {
  const pkgData = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  if (pkgData.version) {
    packageVersion = pkgData.version;
  }
} catch {
  // Use fallback
}

// Liveness & Readiness health check endpoint for Cloud Run, AWS ALB, Azure App Gateway
app.get('/_healthz', (req, res) => {
  res.status(200).send('OK');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

// Real-time Version & CI/CD deployment metadata endpoint
// Used by frontend to detect new releases without wiping user sessions or local state
app.get('/api/version', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json({
    version: process.env.APP_VERSION || packageVersion,
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
    status: 'online',
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'production',
  });
});

// Static assets with aggressive caching for hashed Vite files
app.use(
  '/assets',
  express.static(path.join(__dirname, 'dist', 'assets'), {
    maxAge: '1y',
    immutable: true,
  })
);

// General static files (favicon, manifest, images)
app.use(
  express.static(path.join(__dirname, 'dist'), {
    setHeaders: (res, filePath) => {
      // Do not cache index.html so users always get the latest bundle pointers
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  })
);

// SPA Fallback: serve index.html with no-cache for any unmatched frontend routes
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start HTTP Server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✈️  TRUVAER Aviation Production Server running on 0.0.0.0:${port} [v${packageVersion}]`);
  
  // Handshake with PM2: Signals cluster that this worker is ready to receive requests (Wait-Ready zero-downtime)
  if (process.send) {
    process.send('ready');
    console.log('📡 PM2 IPC: Process sent ready signal for zero-downtime cluster switch.');
  }
});

// Graceful Zero-Downtime Connection Draining for PM2 / Kubernetes / Docker
function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Draining in-flight HTTP connections (Zero Downtime)...`);
  server.close(() => {
    console.log('✅ All active connections drained. Process exiting cleanly.');
    process.exit(0);
  });

  // Fallback: force exit if long-polling or idle keep-alive holds open past 6 seconds
  setTimeout(() => {
    console.warn('⚠️ Force exiting after drain timeout.');
    process.exit(0);
  }, 6000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
