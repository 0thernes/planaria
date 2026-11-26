/**
 * Zero-Dependency Hardened Local HTTP Server for the PLANARIA v2.2 Surgical Vivisection Studio
 *
 * Serves static ES modules, compiled .hbin artifacts, .plang sources, and benchmark JSON
 * directly from disk with strict canonical realpath containment, public-root allowlisting,
 * static error responses, and hardened browser security headers.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_ROOT = fs.realpathSync(__dirname);
const SERVER_START_MS = Date.now();
const SERVER_VERSION = JSON.parse(fs.readFileSync(path.join(DEFAULT_ROOT, 'package.json'), 'utf8')).version;

export const MIME = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.plang': 'text/plain; charset=utf-8',
  '.hbin': 'application/octet-stream',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
});

const PUBLIC_TOP_DIRS = new Set(['src', 'programs', 'artifacts', 'results']);

const SECURITY_HEADERS = Object.freeze({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; worker-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
  'Cache-Control': 'no-cache',
});

function isWithin(baseDir, targetPath) {
  const rel = path.relative(baseDir, targetPath);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function sendPlain(res, statusCode, message, extraHeaders = {}, method = 'GET') {
  const body = Buffer.from(message, 'utf8');
  res.writeHead(statusCode, {
    ...SECURITY_HEADERS,
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': String(body.length),
    ...extraHeaders,
  });
  if (method === 'HEAD') {
    res.end();
  } else {
    res.end(body);
  }
}

function hasForbiddenSegment(relPosix) {
  if (relPosix.includes('\0') || relPosix.includes('\\') || relPosix.includes(':')) return true;
  const parts = relPosix.split('/').filter(Boolean);
  for (const seg of parts) {
    if (seg === '.' || seg === '..' || seg.startsWith('.')) return true;
  }
  return false;
}

function resolvePublicFile(canonicalRoot, canonicalWebRoot, relPosix) {
  const candidates = [];
  if (relPosix === '') {
    candidates.push(path.join(canonicalWebRoot, 'index.html'));
  } else {
    const parts = relPosix.split('/').filter(Boolean);
    if (parts.length > 0 && PUBLIC_TOP_DIRS.has(parts[0])) {
      candidates.push(path.resolve(canonicalRoot, ...parts));
    }
    // Convenience fallback for root-level web assets (/styles.css, /app.js, etc.)
    candidates.push(path.resolve(canonicalWebRoot, ...parts));
  }

  for (const candidate of candidates) {
    if (!isWithin(canonicalRoot, candidate)) continue;
    let realTarget;
    try {
      realTarget = fs.realpathSync(candidate);
    } catch {
      continue;
    }
    if (!isWithin(canonicalRoot, realTarget)) continue;
    const relFromRoot = path.relative(canonicalRoot, realTarget);
    const topDir = relFromRoot.split(path.sep)[0];
    if (!PUBLIC_TOP_DIRS.has(topDir)) continue;

    let stat;
    try {
      stat = fs.statSync(realTarget);
    } catch {
      continue;
    }
    if (stat.isFile()) {
      return { realTarget, stat };
    }
  }
  return null;
}

export function createPlanariaServer(rootDir = DEFAULT_ROOT) {
  const canonicalRoot = fs.realpathSync(rootDir);
  const canonicalWebRoot = fs.realpathSync(path.join(canonicalRoot, 'src', 'web'));

  return http.createServer((req, res) => {
    const method = (req.method || 'GET').toUpperCase();
    if (method !== 'GET' && method !== 'HEAD') {
      sendPlain(res, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' }, method);
      return;
    }

    let rawTarget = (req.url || '/').split('?')[0];
    // Accept RFC 9110 absolute-form origin targets (e.g., GET http://127.0.0.1:4174/ HTTP/1.1)
    if (/^https?:\/\//i.test(rawTarget)) {
      const slashAfterHost = rawTarget.indexOf('/', rawTarget.indexOf('://') + 3);
      rawTarget = slashAfterHost === -1 ? '/' : rawTarget.slice(slashAfterHost);
    }

    let decodedPath;
    try {
      decodedPath = decodeURIComponent(rawTarget);
    } catch {
      sendPlain(res, 400, 'Bad Request', {}, method);
      return;
    }

    if (decodedPath === '/healthz') {
      const payload = Buffer.from(JSON.stringify({
        status: 'ok',
        service: 'planaria-studio',
        version: SERVER_VERSION,
        uptimeSeconds: Math.floor((Date.now() - SERVER_START_MS) / 1000),
      }), 'utf8');
      res.writeHead(200, {
        ...SECURITY_HEADERS,
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': String(payload.length),
      });
      res.end(method === 'HEAD' ? undefined : payload);
      return;
    }

    const relPosix = decodedPath === '/' ? '' : decodedPath.replace(/^\/+/, '');
    if (hasForbiddenSegment(relPosix)) {
      sendPlain(res, 403, 'Forbidden', {}, method);
      return;
    }

    const resolved = resolvePublicFile(canonicalRoot, canonicalWebRoot, relPosix);
    if (!resolved) {
      sendPlain(res, 404, 'Not Found', {}, method);
      return;
    }

    // Open FD & fstat BEFORE writeHead(200) to close TOCTOU symlink race and ensure reachable 500 error handling
    let fd;
    let fstat;
    try {
      fd = fs.openSync(resolved.realTarget, 'r');
      fstat = fs.fstatSync(fd);
      if (!fstat.isFile()) {
        fs.closeSync(fd);
        sendPlain(res, 404, 'Not Found', {}, method);
        return;
      }
    } catch {
      if (fd !== undefined) {
        try { fs.closeSync(fd); } catch { /* ignore */ }
      }
      sendPlain(res, 500, 'Internal Server Error', {}, method);
      return;
    }

    const ext = path.extname(resolved.realTarget).toLowerCase();
    const contentType = Object.prototype.hasOwnProperty.call(MIME, ext)
      ? MIME[ext]
      : 'application/octet-stream';
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': contentType,
      'Content-Length': String(fstat.size),
    });

    if (method === 'HEAD') {
      try { fs.closeSync(fd); } catch { /* ignore */ }
      res.end();
      return;
    }

    const stream = fs.createReadStream(null, { fd, autoClose: true });
    stream.on('error', () => {
      if (!res.headersSent) {
        sendPlain(res, 500, 'Internal Server Error', {}, method);
      } else {
        res.destroy();
      }
    });
    res.on('close', () => {
      if (!stream.destroyed) stream.destroy();
    });
    stream.pipe(res);
  });
}

function parsePort(raw) {
  if (raw === undefined || raw === '') return 4174;
  if (!/^\d+$/.test(String(raw))) {
    throw new RangeError(`Invalid PORT "${raw}": must be an integer in 0..65535`);
  }
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new RangeError(`Invalid PORT ${port}: must be in 0..65535`);
  }
  return port;
}

function isMainEntry() {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(__filename);
  } catch {
    return path.resolve(process.argv[1]) === __filename;
  }
}

const isMain = isMainEntry();
if (isMain) {
  let port;
  try {
    port = parsePort(process.env.PORT);
  } catch (err) {
    console.error(`[PLANARIA SERVER ERROR] ${err.message}`);
    process.exit(1);
  }
  const server = createPlanariaServer(DEFAULT_ROOT);
  server.on('error', (err) => {
    console.error(`[PLANARIA SERVER ERROR] ${err.message}`);
    process.exit(1);
  });
  server.listen(port, '127.0.0.1', () => {
    const addr = server.address();
    const actualPort = typeof addr === 'object' && addr ? addr.port : port;
    console.log(`[PLANARIA] Surgical Vivisection Studio live at http://127.0.0.1:${actualPort}`);
  });
}
