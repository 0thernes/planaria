/**
 * Zero-Dependency Local HTTP Server for the PLANARIA Surgical Vivisection Studio
 *
 * Serves static ES modules, compiled .hbin artifacts, .plang sources, and benchmark JSON
 * directly from disk with strict path-traversal containment.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const PORT = parseInt(process.env.PORT || '4174', 10);

const MIME = {
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
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  let relPath = urlPath === '/' ? 'src/web/index.html' : urlPath.replace(/^\/+/, '');
  // Convenience alias: /styles.css, /app.js, etc. resolve inside src/web/ if not found at root
  let fullPath = path.resolve(ROOT, relPath);
  if (!fullPath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    const webFallback = path.resolve(ROOT, 'src/web', relPath);
    if (webFallback.startsWith(ROOT) && fs.existsSync(webFallback) && !fs.statSync(webFallback).isDirectory()) {
      fullPath = webFallback;
    } else {
      res.writeHead(404);
      res.end(`Not Found: ${urlPath}`);
      return;
    }
  }

  const ext = path.extname(fullPath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  fs.createReadStream(fullPath).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[PLANARIA] Surgical Vivisection Studio live at http://127.0.0.1:${PORT}`);
});
