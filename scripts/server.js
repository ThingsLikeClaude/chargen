import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA_DIR = process.env.CHARGEN_DATA_DIR || '.';
const DIST_DIR = join(fileURLToPath(import.meta.url), '..', '..', 'ui', 'dist');
const TIMEOUT_MS = 10 * 60 * 1000;

const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

let waitResolve = null;
let waitTimer = null;

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, data) {
  cors(res);
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function jsonFile(res, filename) {
  const filepath = join(DATA_DIR, filename);
  if (!existsSync(filepath)) {
    cors(res);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `${filename} not found` }));
    return;
  }
  const data = JSON.parse(readFileSync(filepath, 'utf-8'));
  json(res, data);
}

function serveStatic(req, res) {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const filepath = join(DIST_DIR, urlPath);
  if (!existsSync(filepath)) {
    // SPA fallback
    const index = join(DIST_DIR, 'index.html');
    if (existsSync(index)) {
      cors(res);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(readFileSync(index));
      return;
    }
    cors(res);
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const ext = extname(filepath);
  cors(res);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  res.end(readFileSync(filepath));
}

function longPoll(req, res) {
  cors(res);

  if (waitResolve) {
    res.writeHead(409, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Another client is already waiting' }));
    return;
  }

  waitTimer = setTimeout(() => {
    waitResolve = null;
    waitTimer = null;
    res.writeHead(408, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Timeout waiting for confirmation' }));
  }, TIMEOUT_MS);

  waitResolve = (result) => {
    clearTimeout(waitTimer);
    waitResolve = null;
    waitTimer = null;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
  };

  req.on('close', () => {
    if (waitResolve) {
      clearTimeout(waitTimer);
      waitResolve = null;
      waitTimer = null;
    }
  });
}

function confirm(req, res) {
  cors(res);
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    try {
      const result = JSON.parse(body);
      if (waitResolve) {
        waitResolve(result);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
  });
}

const server = createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url.split('?')[0];

  if (url === '/api/build') return jsonFile(res, 'recommended-build.json');
  if (url === '/api/skills') return jsonFile(res, 'skills.json');
  if (url === '/api/agent-presets') return jsonFile(res, 'agent-presets.json');
  if (url === '/api/scan') return jsonFile(res, 'scan.json');
  if (url === '/api/wait') return longPoll(req, res);
  if (url === '/api/confirm' && req.method === 'POST') return confirm(req, res);

  serveStatic(req, res);
});

const PORT = parseInt(process.env.CHARGEN_PORT || '0', 10);
server.listen(PORT, '127.0.0.1', () => {
  const addr = server.address();
  console.log(JSON.stringify({ port: addr.port, url: `http://127.0.0.1:${addr.port}` }));
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
