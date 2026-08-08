import { spawnSync } from 'node:child_process';
import { accessSync, constants } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const sdkRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..'
);
const coreRoot = path.resolve(
  process.env.OPENIM_SDK_CORE_DIR || path.join(sdkRoot, '../openim-sdk-core')
);

function run(command, args, cwd, env = process.env) {
  console.log(`[wasm-e2e] ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(
  'go',
  ['build', '-o', path.join(sdkRoot, 'assets/openIM.wasm'), './wasm/cmd'],
  coreRoot,
  {
    ...process.env,
    GOOS: 'js',
    GOARCH: 'wasm',
  }
);
run('npm', ['run', 'build'], sdkRoot);

for (const artifact of [
  'assets/openIM.wasm',
  'assets/sql-wasm.wasm',
  'assets/wasm_exec.js',
  'lib/index.es.js',
  'lib/worker.js',
  'lib/worker-legacy.js',
]) {
  accessSync(path.join(sdkRoot, artifact), constants.R_OK);
}
