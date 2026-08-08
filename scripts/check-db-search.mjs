import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import initSqlJs from '@jlongster/sql.js';
import ts from 'typescript';

const projectDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const coreDir = path.resolve(
  process.env.OPENIM_SDK_CORE_DIR ||
    path.join(projectDir, '..', 'openim-sdk-core')
);
const require = createRequire(import.meta.url);

function loadTypeScriptModule(relativePath, mocks = {}) {
  const filename = path.join(projectDir, relativePath);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2018,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  const localRequire = specifier => mocks[specifier] || require(specifier);
  const evaluate = new Function(
    'require',
    'module',
    'exports',
    '__filename',
    '__dirname',
    output
  );
  evaluate(
    localRequire,
    loadedModule,
    loadedModule.exports,
    filename,
    path.dirname(filename)
  );
  return loadedModule.exports;
}

function records(results) {
  if (!results[0]) {
    return [];
  }
  const { columns, values } = results[0];
  return values.map(row =>
    Object.fromEntries(columns.map((column, index) => [column, row[index]]))
  );
}

function collectCoreModelSchemas() {
  const source = fs.readFileSync(
    path.join(coreDir, 'pkg', 'db', 'model_struct', 'data_model_struct.go'),
    'utf8'
  );
  const structs = new Map();
  for (const match of source.matchAll(
    /type\s+(\w+)\s+struct\s*\{([\s\S]*?)\n\}/g
  )) {
    const fields = [];
    const embedded = [];
    for (const rawLine of match[2].split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('//')) {
        continue;
      }
      const gormTag = line.match(/`gorm:"([^"]+)"/);
      if (gormTag) {
        const column = gormTag[1].match(/(?:^|;)column:([^;]+)/)?.[1];
        if (column) {
          fields.push({
            column,
            primaryKey: /(?:^|;)primary_key(?:;|$)/.test(gormTag[1]),
          });
        }
        continue;
      }
      const embeddedType = line.match(/^([A-Z]\w*)$/)?.[1];
      if (embeddedType) {
        embedded.push(embeddedType);
      }
    }
    structs.set(match[1], { fields, embedded });
  }

  const resolved = new Map();
  function resolve(name, resolving = new Set()) {
    if (resolved.has(name)) {
      return resolved.get(name);
    }
    assert.ok(!resolving.has(name), `Core model embedding cycle at ${name}`);
    const schema = structs.get(name);
    assert.ok(schema, `Core model ${name} was not found`);
    resolving.add(name);
    const fields = schema.embedded.flatMap(embeddedName =>
      resolve(embeddedName, resolving)
    );
    fields.push(...schema.fields);
    resolving.delete(name);
    resolved.set(name, fields);
    return fields;
  }

  return resolve;
}

const sqlUtils = loadTypeScriptModule('src/utils/sql.ts');
const enumTypes = loadTypeScriptModule('src/types/enum.ts');
const moduleMocks = {
  '@/utils': sqlUtils,
  '@/types/enum': enumTypes,
};
const conversations = loadTypeScriptModule(
  'src/sqls/localConversations.ts',
  moduleMocks
);
const friends = loadTypeScriptModule('src/sqls/localFriend.ts', moduleMocks);
const groups = loadTypeScriptModule('src/sqls/localGroups.ts', moduleMocks);
const groupMembers = loadTypeScriptModule(
  'src/sqls/localGroupMembers.ts',
  moduleMocks
);
const messages = loadTypeScriptModule(
  'src/sqls/localChatLogsConversationID.ts',
  moduleMocks
);
const migrations = loadTypeScriptModule('src/api/database/alter.ts');

const SQL = await initSqlJs({
  wasmBinary: fs.readFileSync(
    path.join(
      projectDir,
      'node_modules',
      '@jlongster',
      'sql.js',
      'dist',
      'sql-wasm.wasm'
    )
  ),
});

const schemaContracts = [
  ['src/sqls/localFriend.ts', 'localFriends', 'local_friends', 'LocalFriend'],
  [
    'src/sqls/localFriendRequest.ts',
    'localFriendRequests',
    'local_friend_requests',
    'LocalFriendRequest',
  ],
  ['src/sqls/localGroups.ts', 'localGroups', 'local_groups', 'LocalGroup'],
  [
    'src/sqls/localSuperGroups.ts',
    'localSuperGroups',
    'local_super_groups',
    'LocalGroup',
  ],
  [
    'src/sqls/localGroupMembers.ts',
    'localGroupMembers',
    'local_group_members',
    'LocalGroupMember',
  ],
  [
    'src/sqls/localGroupRequests.ts',
    'localGroupRequests',
    'local_group_requests',
    'LocalGroupRequest',
  ],
  [
    'src/sqls/localAdminGroupRequests.ts',
    'localAdminGroupRequests',
    'local_admin_group_requests',
    'LocalAdminGroupRequest',
  ],
  ['src/sqls/localUsers.ts', 'localUsers', 'local_users', 'LocalUser'],
  [
    'src/sqls/localStranger.ts',
    'localStranger',
    'local_stranger',
    'LocalStranger',
  ],
  ['src/sqls/localBlack.ts', 'locaBlacks', 'local_blacks', 'LocalBlack'],
  [
    'src/sqls/localChatLogsConversationID.ts',
    'localChatLogsConversationID',
    'chat_logs_schema_contract',
    'LocalChatLog',
    ['schema_contract'],
  ],
  [
    'src/sqls/tempCacheLocalChatLogs.ts',
    'tempCacheLocalChatLogs',
    'temp_cache_local_chat_logs',
    'LocalChatLog',
  ],
  [
    'src/sqls/localConversations.ts',
    'localConversations',
    'local_conversations',
    'LocalConversation',
  ],
  [
    'src/sqls/localConversationUnreadMessages.ts',
    'localConversationUnreadMessages',
    'local_conversation_unread_messages',
    'LocalConversationUnreadMessage',
  ],
  [
    'src/sqls/localNotification.ts',
    'localNotification',
    'local_notification_seqs',
    'NotificationSeqs',
  ],
  ['src/sqls/localUpload.ts', 'localUploads', 'local_uploads', 'LocalUpload'],
  [
    'src/sqls/localSendingMessages.ts',
    'localSendingMessages',
    'local_sending_messages',
    'LocalSendingMessages',
  ],
  [
    'src/sqls/localUserCommand.ts',
    'localUserCommands',
    'local_user_command',
    'LocalUserCommand',
  ],
  [
    'src/sqls/localVersionSync.ts',
    'localVersionSyncs',
    'local_sync_version',
    'LocalVersionSync',
  ],
  [
    'src/sqls/localAppSdkVersion.ts',
    'localAppSDKVersions',
    'local_app_sdk_version',
    'LocalAppSDKVersion',
  ],
];

const schemaDB = new SQL.Database();
for (const [modulePath, creatorName, , , creatorArgs = []] of schemaContracts) {
  const schemaModule = loadTypeScriptModule(modulePath, moduleMocks);
  assert.equal(
    typeof schemaModule[creatorName],
    'function',
    `${modulePath} does not export ${creatorName}`
  );
  schemaModule[creatorName](schemaDB, ...creatorArgs);
}
migrations.alterTable(schemaDB);

const resolveCoreModel = collectCoreModelSchemas();
for (const [, , tableName, modelName] of schemaContracts) {
  const tableInfo = records(schemaDB.exec(`PRAGMA table_info('${tableName}')`));
  assert.ok(tableInfo.length > 0, `SQLite table ${tableName} was not created`);
  const actualColumns = new Set(tableInfo.map(row => row.name));
  const coreFields = resolveCoreModel(modelName);
  const missingColumns = coreFields
    .map(field => field.column)
    .filter(column => !actualColumns.has(column));
  assert.deepEqual(
    missingColumns,
    [],
    `${tableName} is missing fields from Core model ${modelName}`
  );

  const actualPrimaryKey = tableInfo
    .filter(row => row.pk > 0)
    .sort((left, right) => left.pk - right.pk)
    .map(row => row.name);
  const corePrimaryKey = coreFields
    .filter(field => field.primaryKey)
    .map(field => field.column);
  assert.deepEqual(
    actualPrimaryKey,
    corePrimaryKey,
    `${tableName} primary key differs from Core model ${modelName}`
  );
}
schemaDB.close();

const legacyDB = new SQL.Database();
legacyDB.run(
  'CREATE TABLE local_conversations (conversation_id text PRIMARY KEY)'
);
legacyDB.run(
  'CREATE TABLE temp_cache_local_chat_logs (client_msg_id text PRIMARY KEY)'
);
migrations.alterTable(legacyDB);
const migratedColumns = records(
  legacyDB.exec('PRAGMA table_info(local_conversations)')
).map(row => row.name);
assert.ok(migratedColumns.includes('msg_destruct_time'));
assert.ok(migratedColumns.includes('is_msg_destruct'));
assert.ok(
  records(legacyDB.exec('PRAGMA table_info(temp_cache_local_chat_logs)'))
    .map(row => row.name)
    .includes('local_ex')
);
legacyDB.close();

const db = new SQL.Database();

conversations.localConversations(db);
db.run(
  'INSERT INTO local_conversations (conversation_id, show_name, latest_msg_send_time) VALUES (?, ?, ?), (?, ?, ?)',
  ['c1', 'Alice', 2, 'c2', 'Bob', 1]
);
assert.deepEqual(
  records(conversations.searchConversations(db, 'Ali')).map(
    row => row.conversation_id
  ),
  ['c1']
);
assert.equal(
  records(conversations.searchConversations(db, `%' OR 1=1 --`)).length,
  0
);
conversations.updateAllConversation(db, { is_pinned: 1 });
assert.equal(
  records(db.exec('SELECT * FROM local_conversations WHERE is_pinned = 1'))
    .length,
  2
);

friends.localFriends(db);
db.run(
  'INSERT INTO local_friends (owner_user_id, friend_user_id, name, remark, create_time) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
  ['self', 'u1', 'Alice', 'school', 2, 'self', 'u2', 'Bob', 'work', 1]
);
assert.equal(
  records(friends.searchFriendList(db, '', false, false, false)).length,
  2
);
assert.equal(
  records(friends.searchFriendList(db, `%' OR 1=1 --`, true, false, false))
    .length,
  0
);

groups.localGroups(db);
db.run(
  'INSERT INTO local_groups (group_id, name, create_time) VALUES (?, ?, ?), (?, ?, ?)',
  ['g1', 'Alpha', 2, 'g2', 'Beta', 1]
);
assert.deepEqual(
  records(
    groups.getAllGroupInfoByGroupIDOrGroupName(db, 'Alp', false, false)
  ).map(row => row.group_id),
  ['g1']
);
assert.equal(
  records(
    groups.getAllGroupInfoByGroupIDOrGroupName(db, `%' OR 1=1 --`, true, true)
  ).length,
  0
);

groupMembers.localGroupMembers(db);
db.run(
  'INSERT INTO local_group_members (group_id, user_id, nickname, role_level, join_time) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
  [
    'g1',
    'member-user',
    'First',
    20,
    1,
    'g1',
    'owner-user',
    'Member Nick',
    100,
    2,
  ]
);
assert.throws(() =>
  groupMembers.searchGroupMembers(db, '', '', false, false, 0, 10)
);
assert.deepEqual(
  records(
    groupMembers.searchGroupMembers(db, 'member-user', '', false, true, 0, 10)
  ).map(row => row.user_id),
  ['member-user']
);
assert.deepEqual(
  records(
    groupMembers.searchGroupMembers(db, 'er', 'g1', true, true, 0, 10)
  ).map(row => row.user_id),
  ['owner-user', 'member-user']
);

messages.localChatLogsConversationID(db, 'search_test');
db.run(
  `INSERT INTO 'chat_logs_search_test'
    (client_msg_id, content_type, content, status, send_time, send_id)
    VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)`,
  ['m1', 101, "Bob's hello", 2, 100, 'u1', 'm2', 102, 'picture', 2, 200, 'u2']
);
assert.deepEqual(
  records(
    messages.searchMessageByKeyword(
      db,
      'search_test',
      [101],
      ["Bob's"],
      0,
      0,
      300,
      0,
      10
    )
  ).map(row => row.client_msg_id),
  ['m1']
);
assert.equal(
  records(
    messages.searchMessageByKeyword(
      db,
      'search_test',
      [101],
      [`%' OR 1=1 --`],
      0,
      0,
      300,
      0,
      10
    )
  ).length,
  0
);
assert.deepEqual(
  records(
    messages.searchMessageByContentType(db, 'search_test', [102], 0, 300, 0, 10)
  ).map(row => row.client_msg_id),
  ['m2']
);

db.close();
console.log(`DB schema/search behavior OK: ${schemaContracts.length} tables`);
