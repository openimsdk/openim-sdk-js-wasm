import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const sdkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const mode = process.argv[2] || 'all';
const projects = mode === 'all' ? ['contract', 'database'] : [mode];
if (projects.some(project => !['contract', 'database'].includes(project))) {
  throw new Error(`Unknown E2E mode: ${mode}`);
}

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    cwd: sdkRoot,
    env,
    stdio: 'inherit'
  });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

let status = run('npm', ['run', 'test:e2e:typecheck']);
if (status !== 0) process.exit(status);

if (projects.includes('database')) {
  status = run(process.execPath, ['./tests/e2e/support/build.mjs']);
  if (status !== 0) process.exit(status);
}

const args = [
  'playwright',
  'test',
  '--config=tests/e2e/playwright.config.ts',
  ...projects.map(project => `--project=${project}`)
];
status = run('npx', args, {
  ...process.env,
  OPENIM_E2E_WEB_SERVER: projects.includes('database') ? '1' : '0'
});
process.exit(status);
