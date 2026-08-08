import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const result = JSON.parse(
  execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: packageRoot,
    encoding: 'utf8',
  })
)[0];
const files = new Set(result.files.map(file => file.path));
const requiredFiles = [
  'lib/index.js',
  'lib/index.es.js',
  'lib/index.umd.js',
  'lib/index.d.ts',
  'lib/sdk/index.d.ts',
  'lib/worker.js',
  'lib/worker-legacy.js',
  'assets/openIM.wasm',
  'assets/sql-wasm.wasm',
  'assets/wasm_exec.js',
  'assets/version',
];

for (const file of requiredFiles) {
  assert(files.has(file), `Packed package is missing ${file}`);
}

const [indexDeclaration, sdkDeclaration, ...publicDeclarations] =
  await Promise.all([
    readFile(path.join(packageRoot, 'lib/index.d.ts'), 'utf8'),
    readFile(path.join(packageRoot, 'lib/sdk/index.d.ts'), 'utf8'),
    ...[
      'lib/constant/index.d.ts',
      'lib/types/enum.d.ts',
      'lib/types/entity.d.ts',
      'lib/types/eventData.d.ts',
      'lib/types/params.d.ts',
    ].map(filename => readFile(path.join(packageRoot, filename), 'utf8')),
  ]);
assert(
  indexDeclaration.includes('CbEvents'),
  'Packed root declaration must retain the CbEvents compatibility export'
);
assert(
  !sdkDeclaration.includes('markMessagesAsReadByMsgID'),
  'Packed SDK declaration must not expose markMessagesAsReadByMsgID'
);
const deprecatedMarkerCount = publicDeclarations.reduce(
  (count, declaration) =>
    count + (declaration.match(/@deprecated/g) || []).length,
  0
);
assert(
  deprecatedMarkerCount >= 100,
  `Packed declarations retained only ${deprecatedMarkerCount} compatibility deprecation markers`
);

console.log(
  `[wasm-packed-package] ${result.files.length} packed files verified`
);
