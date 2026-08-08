import { expect, test } from '@playwright/test';
import surface from '../contracts/sdk-surface.json';

test('runtime SDK exposes the reviewed public surface', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  const methods = await page.evaluate(async expectedMethods => {
    (window as any).__OPENIM_E2E__.initialize({
      coreWasmPath: '/assets/openIM.wasm',
      sqlWasmPath: '/assets/sql-wasm.wasm',
      debug: false,
    });
    return (window as any).__OPENIM_E2E__.surface(expectedMethods);
  }, surface.ownMethods);
  expect(methods).toEqual(surface.ownMethods);
});

test('removed Core method is not exposed on the browser global', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  const exports = await page.evaluate(async () => {
    (window as any).__OPENIM_E2E__.initialize({
      coreWasmPath: '/assets/openIM.wasm',
      sqlWasmPath: '/assets/sql-wasm.wasm',
      debug: false,
    });
    await (window as any).__OPENIM_E2E__.waitForWasm();
    return {
      retained: typeof (window as any).markConversationMessageAsRead,
      removed: typeof (window as any).markMessagesAsReadByMsgID,
    };
  });

  expect(exports).toEqual({ retained: 'function', removed: 'undefined' });
});

test('runtime bundle retains patch.10 enum compatibility exports', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  const compatibility = await page.evaluate(() => {
    const sdkModule = (window as any).__OPENIM_E2E__.module;
    return {
      sameEventEnum: sdkModule.CbEvents === sdkModule.SdkEvent,
      connecting: sdkModule.CbEvents.OnConnecting,
      receive: sdkModule.MessageReceiveOptType.Normal,
      mention: sdkModule.GroupAtType.AtMe,
      view: sdkModule.ViewType.History,
      succeeded: sdkModule.MessageStatus.Succeed,
    };
  });

  expect(compatibility).toEqual({
    sameEventEnum: true,
    connecting: 'OnConnecting',
    receive: 0,
    mention: 1,
    view: 0,
    succeeded: 2,
  });
});
