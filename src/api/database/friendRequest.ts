import { DatabaseErrorCode } from '@/constant';
import {
  insertFriendRequest as databaseInsertFriendRequest,
  deleteFriendRequestBothUserID as databasedeleteFriendRequestBothUserID,
  updateFriendRequest as databaseupdateFriendRequest,
  getRecvFriendApplication as databaseGetRecvFriendApplication,
  getSendFriendApplication as databaseGetSendFriendApplication,
  getFriendApplicationByBothID as databaseGetFriendApplicationByBothID,
  getBothFriendReq as databaseGetBothFriendReq,
  LocalFriendRequest,
} from '@/sqls';
import {
  converSqlExecResult,
  convertObjectField,
  convertToSnakeCaseObject,
  formatResponse,
} from '@/utils';
import { getInstance } from './instance';

export async function insertFriendRequest(
  localFriendRequestStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localFriendRequest = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(localFriendRequestStr))
    ) as LocalFriendRequest;

    databaseInsertFriendRequest(db, localFriendRequest);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function deleteFriendRequestBothUserID(
  fromUserID: string,
  toUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databasedeleteFriendRequestBothUserID(db, fromUserID, toUserID);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function updateFriendRequest(
  localFriendRequestStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localFriendRequest = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(localFriendRequestStr))
    ) as LocalFriendRequest;
    databaseupdateFriendRequest(db, localFriendRequest);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getRecvFriendApplication(
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetRecvFriendApplication(db, loginUserID);

    return formatResponse(converSqlExecResult(execResult[0], 'CamelCase'));
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getSendFriendApplication(
  fromUserId: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetSendFriendApplication(db, fromUserId);

    return formatResponse(converSqlExecResult(execResult[0], 'CamelCase'));
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getFriendApplicationByBothID(
  fromUserID: string,
  toUserID: boolean
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetFriendApplicationByBothID(
      db,
      fromUserID,
      toUserID
    );

    return formatResponse(converSqlExecResult(execResult[0], 'CamelCase'));
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getBothFriendReq(
  fromUserID: string,
  toUserID: boolean
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetBothFriendReq(db, fromUserID, toUserID);

    return formatResponse(converSqlExecResult(execResult[0], 'CamelCase'));
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}
