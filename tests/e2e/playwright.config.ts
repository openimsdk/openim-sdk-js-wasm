import { defineConfig, devices } from '@playwright/test';

const host = process.env.OPENIM_E2E_HOST || '127.0.0.1';
const port = Number(process.env.OPENIM_E2E_HOST_PORT || 41737);
const useStaticHost = process.env.OPENIM_E2E_WEB_SERVER === '1';

export default defineConfig({
  testDir: './specs',
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  outputDir: '../../test-results/e2e/artifacts',
  reporter: [
    ['list'],
    ['html', { outputFolder: '../../playwright-report/e2e', open: 'never' }],
    ['junit', { outputFile: '../../test-results/e2e/junit.xml' }],
  ],
  use: {
    baseURL: `http://${host}:${port}`,
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: useStaticHost
    ? {
        command: 'node ./support/static-server.mjs',
        url: `http://${host}:${port}/health`,
        timeout: 30_000,
        reuseExistingServer: false,
      }
    : undefined,
  projects: [
    { name: 'contract', testMatch: '**/*.contract.spec.ts' },
    {
      name: 'database',
      testMatch: '**/*.database.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
