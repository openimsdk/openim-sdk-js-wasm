import { createReadStream, existsSync, statSync } from 'node:fs';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const e2eRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sdkRoot = path.resolve(e2eRoot, '../..');
const host = process.env.OPENIM_E2E_HOST || '127.0.0.1';
const port = Number(process.env.OPENIM_E2E_HOST_PORT || 41737);

const files = {
  '/': path.join(e2eRoot, 'harness/index.html'),
  '/index.html': path.join(e2eRoot, 'harness/index.html'),
  '/harness.js': path.join(e2eRoot, 'harness/harness.js'),
  '/sdk/index.es.js': path.join(sdkRoot, 'lib/index.es.js'),
  '/sdk/worker.js': path.join(sdkRoot, 'lib/worker.js'),
  '/sdk/worker-legacy.js': path.join(sdkRoot, 'lib/worker-legacy.js'),
  '/assets/wasm_exec.js': path.join(sdkRoot, 'assets/wasm_exec.js'),
  '/assets/sql-wasm.wasm': path.join(sdkRoot, 'assets/sql-wasm.wasm'),
  '/assets/openIM.wasm': path.join(sdkRoot, 'assets/openIM.wasm')
};

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.wasm', 'application/wasm']
]);
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'no-store',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

const server = http.createServer((request, response) => {
  const pathname = new URL(request.url || '/', `http://${host}:${port}`).pathname;
  if (pathname === '/health') {
    const missing = Object.entries(files)
      .filter(([, filename]) => !existsSync(filename))
      .map(([route]) => route);
    response.writeHead(missing.length ? 503 : 200, {
      ...headers,
      'Content-Type': 'application/json; charset=utf-8'
    });
    response.end(JSON.stringify({ ok: missing.length === 0, missing }));
    return;
  }
  const filename = files[pathname];
  if (!filename || !existsSync(filename) || !statSync(filename).isFile()) {
    response.writeHead(404, headers);
    response.end('Not found');
    return;
  }
  response.writeHead(200, {
    ...headers,
    'Content-Length': statSync(filename).size,
    'Content-Type': contentTypes.get(path.extname(filename)) || 'application/octet-stream'
  });
  createReadStream(filename).pipe(response);
});

server.listen(port, host, () => {
  console.log(`[wasm-e2e] static host listening at http://${host}:${port}`);
});

for (const signal of ['SIGHUP', 'SIGINT', 'SIGTERM']) {
  process.once(signal, () => server.close(() => process.exit(0)));
}
