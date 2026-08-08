import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

type DatabaseResponse<T = unknown> = {
  data: T;
  errCode: number;
  errMsg: string;
};

async function invokeDatabase<T = unknown>(
  page: Page,
  method: string,
  args: unknown[] = []
): Promise<DatabaseResponse<T>> {
  const result = await page.evaluate(
    async ({ databaseMethod, databaseArgs }) =>
      (window as any).__OPENIM_E2E__.database(databaseMethod, databaseArgs),
    { databaseMethod: method, databaseArgs: args }
  );
  expect(
    result.ok,
    `${method} bridge failed: ${JSON.stringify(result.error)}`
  ).toBe(true);
  return result.value as DatabaseResponse<T>;
}

async function invokeRawDatabase<T = unknown>(
  page: Page,
  method: string,
  args: unknown[] = []
): Promise<T> {
  const result = await page.evaluate(
    async ({ databaseMethod, databaseArgs }) =>
      (window as any).__OPENIM_E2E__.database(databaseMethod, databaseArgs),
    { databaseMethod: method, databaseArgs: args }
  );
  expect(
    result.ok,
    `${method} bridge failed: ${JSON.stringify(result.error)}`
  ).toBe(true);
  return result.value as T;
}

function parseData<T>(response: DatabaseResponse<string>): T {
  return JSON.parse(response.data) as T;
}

test('group-member database methods match the Go DB contract', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');

  await page.evaluate(() => {
    (window as any).__OPENIM_NATIVE_WINDOW_CLOSE__ = window.close;
  });

  await page.evaluate(() =>
    (window as any).__OPENIM_E2E__.initialize({
      coreWasmPath: '/assets/openIM.wasm',
      sqlWasmPath: '/assets/sql-wasm.wasm',
      debug: false,
    })
  );
  await invokeDatabase(page, 'setSqlWasmPath', ['/assets/sql-wasm.wasm']);
  const databaseID = `db_contract_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}`;
  const initialized = await invokeDatabase(page, 'initDB', [databaseID, '']);
  expect(initialized.errCode, initialized.errMsg).toBe(0);

  const groupID = 'group-main';
  const members = [
    {
      groupID,
      userID: 'ordinary_match',
      nickname: 'Ordinary Match',
      roleLevel: 20,
      joinTime: 15,
    },
    {
      groupID,
      userID: 'admin_late',
      nickname: 'Admin Match Late',
      roleLevel: 60,
      joinTime: 20,
    },
    {
      groupID,
      userID: 'owner_match',
      nickname: 'Owner Match',
      roleLevel: 100,
      joinTime: 30,
    },
    {
      groupID,
      userID: 'admin_early',
      nickname: 'Admin Match Early',
      roleLevel: 60,
      joinTime: 10,
    },
    {
      groupID: 'group-other',
      userID: 'other_match',
      nickname: 'Other Match',
      roleLevel: 100,
      joinTime: 1,
    },
  ];
  const inserted = await invokeDatabase(page, 'batchInsertGroupMember', [
    JSON.stringify(members),
  ]);
  expect(inserted.errCode, inserted.errMsg).toBe(0);

  const ownerAndAdmin = await invokeDatabase<string>(
    page,
    'getGroupMemberOwnerAndAdminDB',
    [groupID]
  );
  expect(ownerAndAdmin.errCode, ownerAndAdmin.errMsg).toBe(0);
  expect(
    parseData<Array<{ userID: string }>>(ownerAndAdmin).map(item => item.userID)
  ).toEqual(['owner_match', 'admin_late', 'admin_early']);

  const searched = await invokeDatabase<string>(page, 'searchGroupMembersDB', [
    'match',
    groupID,
    true,
    true,
    0,
    20,
  ]);
  expect(searched.errCode, searched.errMsg).toBe(0);
  expect(
    parseData<Array<{ userID: string }>>(searched).map(item => item.userID)
  ).toEqual(['owner_match', 'admin_early', 'admin_late', 'ordinary_match']);

  const userIDOnlyWithoutGroup = await invokeDatabase<string>(
    page,
    'searchGroupMembersDB',
    ['admin_early', '', false, true, 0, 20]
  );
  expect(userIDOnlyWithoutGroup.errCode, userIDOnlyWithoutGroup.errMsg).toBe(0);
  expect(
    parseData<Array<{ userID: string }>>(userIDOnlyWithoutGroup).map(
      item => item.userID
    )
  ).toEqual(['admin_early']);

  const nicknameOnlyWithGroup = await invokeDatabase<string>(
    page,
    'searchGroupMembersDB',
    ['Admin Match', groupID, true, false, 0, 20]
  );
  expect(nicknameOnlyWithGroup.errCode, nicknameOnlyWithGroup.errMsg).toBe(0);
  expect(
    parseData<Array<{ userID: string }>>(nicknameOnlyWithGroup).map(
      item => item.userID
    )
  ).toEqual(['admin_early', 'admin_late']);

  const userIDOnlyWithGroup = await invokeDatabase<string>(
    page,
    'searchGroupMembersDB',
    ['other_match', groupID, false, true, 0, 20]
  );
  expect(userIDOnlyWithGroup.errCode, userIDOnlyWithGroup.errMsg).toBe(0);
  expect(parseData<unknown[]>(userIDOnlyWithGroup)).toEqual([]);

  const bothFieldsWithoutGroup = await invokeDatabase<string>(
    page,
    'searchGroupMembersDB',
    ['Other Match', '', true, true, 0, 20]
  );
  expect(bothFieldsWithoutGroup.errCode, bothFieldsWithoutGroup.errMsg).toBe(0);
  expect(
    parseData<Array<{ userID: string }>>(bothFieldsWithoutGroup).map(
      item => item.userID
    )
  ).toEqual(['other_match']);

  const paged = await invokeDatabase<string>(page, 'searchGroupMembersDB', [
    'match',
    groupID,
    true,
    true,
    1,
    2,
  ]);
  expect(paged.errCode, paged.errMsg).toBe(0);
  expect(
    parseData<Array<{ userID: string }>>(paged).map(item => item.userID)
  ).toEqual(['admin_early', 'admin_late']);

  const noSearchField = await invokeDatabase<string>(
    page,
    'searchGroupMembersDB',
    ['match', groupID, false, false, 0, 20]
  );
  expect(noSearchField.errCode).toBe(10001);

  const missingMember = await invokeDatabase<string>(
    page,
    'getGroupMemberInfoByGroupIDUserID',
    [groupID, 'missing-user']
  );
  expect(missingMember.errCode).toBe(10002);
  expect(missingMember.errMsg).toContain('missing-user');

  const missingFriendUpdate = await invokeDatabase(page, 'updateFriend', [
    JSON.stringify({ ownerUserID: 'owner', userID: 'missing-friend' }),
  ]);
  expect(missingFriendUpdate.errCode).toBe(10001);
  expect(missingFriendUpdate.errMsg).toContain(
    'updateFriend no record updated'
  );

  expect(
    await page.evaluate(
      () => window.close === (window as any).__OPENIM_NATIVE_WINDOW_CLOSE__
    )
  ).toBe(true);
  expect(await page.evaluate(() => typeof (window as any).closeDB)).toBe(
    'function'
  );

  const closed = await invokeDatabase(page, 'closeDB');
  expect(closed.errCode, closed.errMsg).toBe(0);
});

test('all native batched ID queries accept lists above SQLite variable limit', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');

  await page.evaluate(() =>
    (window as any).__OPENIM_E2E__.initialize({
      coreWasmPath: '/assets/openIM.wasm',
      sqlWasmPath: '/assets/sql-wasm.wasm',
      debug: false,
    })
  );
  await invokeDatabase(page, 'setSqlWasmPath', ['/assets/sql-wasm.wasm']);
  const databaseID = `db_batch_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}`;
  const initialized = await invokeDatabase(page, 'initDB', [databaseID, '']);
  expect(initialized.errCode, initialized.errMsg).toBe(0);

  const hitID = 'batch-hit';
  for (const [method, payload] of [
    ['insertConversation', { conversationID: hitID }],
    ['insertBlack', { ownerUserID: 'owner', userID: hitID }],
    [
      'batchInsertFriend',
      [{ ownerUserID: 'owner', userID: hitID, createTime: 1 }],
    ],
    ['insertGroup', { groupID: hitID, groupName: 'Batch Hit' }],
    [
      'batchInsertGroupMember',
      [{ groupID: 'batch-group', userID: hitID, roleLevel: 20 }],
    ],
  ] as const) {
    const response = await invokeDatabase(page, method, [
      JSON.stringify(payload),
    ]);
    expect(response.errCode, `${method}: ${response.errMsg}`).toBe(0);
  }

  const compileOptions = await invokeRawDatabase<
    Array<{ columns: string[]; values: Array<Array<string>> }>
  >(page, 'exec', ['PRAGMA compile_options']);
  const optionValues = compileOptions[0].values.flat().map(String);
  const configuredLimit = optionValues
    .map(value => /^MAX_VARIABLE_NUMBER=(\d+)$/.exec(value))
    .find((value): value is RegExpExecArray => value !== null);
  const variableLimit = configuredLimit ? Number(configuredLimit[1]) : 32766;
  const ids = Array.from(
    { length: variableLimit + 1 },
    (_, index) => `missing-${index}`
  );
  ids[ids.length - 1] = hitID;
  const idsJSON = JSON.stringify(ids);

  for (const [method, args] of [
    ['getMultipleConversationDB', [idsJSON]],
    ['getBlackInfoList', [idsJSON]],
    ['getFriendInfoList', [idsJSON]],
    ['getGroups', [idsJSON]],
    ['getGroupSomeMemberInfo', ['batch-group', idsJSON]],
    ['getGroupMemberListByUserIDs', ['batch-group', 0, idsJSON]],
  ] as const) {
    const response = await invokeDatabase<string>(page, method, [...args]);
    expect(response.errCode, `${method}: ${response.errMsg}`).toBe(0);
    expect(parseData<unknown[]>(response)).toHaveLength(1);
  }
});
