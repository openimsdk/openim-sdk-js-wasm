import { DatabaseErrorCode } from '@/constant';
import {
  locaBlacks,
  localFriends,
  localGroups,
  localFriendRequests,
  localGroupRequests,
  localAdminGroupRequests,
  localConversations,
  localUsers,
  localSuperGroups,
  localConversationUnreadMessages,
  localGroupMembers,
  tempCacheLocalChatLogs,
  localNotification,
  localUploads,
  localStranger,
  localSendingMessages,
  localAppSDKVersions,
  localVersionSyncs,
  localUserCommands,
} from '@/sqls';
import { formatResponse } from '@/utils';
import { QueryExecResult } from '@jlongster/sql.js';
import { getInstance, resetInstance } from './instance';
import { alterTable } from './alter';

let sqlWasmPath: string;

export function setSqlWasmPath(wasmPath: string) {
  sqlWasmPath = wasmPath;
}

export async function init(userId: string, dir: string): Promise<string> {
  // console.info(
  //   `=> (database api) invoke init with args ${JSON.stringify({
  //     userId,
  //     dir,
  //   })}`
  // );

  try {
    // console.time('SDK => (performance measure) init database used ');

    const db = await getInstance(`${dir}${userId}.sqlite`, sqlWasmPath);
    const results: QueryExecResult[][] = [];
    const execResultLocalUploads = localUploads(db);
    const execResultLocalStrangers = localStranger(db);
    const execResultLocalConversations = localConversations(db);
    const execResultLocalUsers = localUsers(db);
    const execResultLocalUserCommands = localUserCommands(db);
    const execResultLocalBlack = locaBlacks(db);
    const execResultLocalFriend = localFriends(db);
    const execResuLocalGroup = localGroups(db);
    const execResuLocalGroupRequest = localGroupRequests(db);
    const execResuLocalGroupMembers = localGroupMembers(db);
    const execResuLocalAdminGroupRequest = localAdminGroupRequests(db);
    const execResultlocaFendRequest = localFriendRequests(db);
    const execResultLocalSuperGroups = localSuperGroups(db);
    const execResultTempCacheLocalChatLogs = tempCacheLocalChatLogs(db);
    const execResultLocalNotification = localNotification(db);
    const execResultLocalSendMessages = localSendingMessages(db);
    const execResultLocalConversationUnreadMessages =
      localConversationUnreadMessages(db);
    const execResultLocalAppSDKVersions = localAppSDKVersions(db);
    const execResultLocalVersionSync = localVersionSyncs(db);
    alterTable(db);
    results.push(
      ...[
        execResultLocalUploads,
        execResultLocalStrangers,
        execResultLocalConversations,
        execResultLocalUsers,
        execResultLocalUserCommands,
        execResultLocalSuperGroups,
        execResultLocalConversationUnreadMessages,
        execResultLocalBlack,
        execResultLocalFriend,
        execResuLocalGroup,
        execResuLocalGroupMembers,
        execResultlocaFendRequest,
        execResuLocalGroupRequest,
        execResuLocalAdminGroupRequest,
        execResultTempCacheLocalChatLogs,
        execResultLocalNotification,
        execResultLocalSendMessages,
        execResultLocalAppSDKVersions,
        execResultLocalVersionSync,
      ]
    );

    return formatResponse(results);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  } finally {
    // console.timeEnd('SDK => (performance measure) init database used ');
  }
}

export async function closeDB() {
  // console.info('=> (database api) invoke closeDB');

  try {
    await resetInstance();

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}
