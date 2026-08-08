import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const coreDir = path.resolve(
  process.env.OPENIM_SDK_CORE_DIR ||
    path.join(projectDir, '..', 'openim-sdk-core')
);

await import(path.join(projectDir, 'assets', 'wasm_exec.js'));

const go = new globalThis.Go();
const wasm = fs.readFileSync(path.join(projectDir, 'assets', 'openIM.wasm'));
const { instance } = await WebAssembly.instantiate(wasm, go.importObject);
void go.run(instance);

// Let Go execute main() and register the JS globals. The program intentionally
// remains blocked afterwards because the SDK is event-driven.
await new Promise(resolve => setTimeout(resolve, 10));

const mainSource = fs.readFileSync(
  path.join(coreDir, 'wasm', 'cmd', 'main.go'),
  'utf8'
);
const expected = new Set(['commonEventFunc']);
for (const match of mainSource.matchAll(
  /js\.Global\(\)\.Set\("([A-Za-z0-9_]+)"/g
)) {
  expected.add(match[1]);
}

const missing = [...expected].filter(
  functionName => typeof globalThis[functionName] !== 'function'
);
if (missing.length > 0) {
  console.error(`Missing WASM runtime exports: ${missing.join(', ')}`);
  process.exit(1);
}

console.log(`WASM runtime exports OK: ${expected.size}`);
process.exit(0);
