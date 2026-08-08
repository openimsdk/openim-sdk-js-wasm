import { DatabaseErrorCode } from '@/constant';
import {
  getBlackList as databaseGetBlackList,
  getBlackListUserID as databaseGetBlackListUserID,
  getBlackInfoByBlockUserID as databaseGetBlackInfoByBlockUserID,
  getBlackInfoList as databaseGetBlackInfoList,
  insertBlack as databaseInsertBlack,
  deleteBlack as databasedeleteBlack,
  updateBlack as databaseupdateBlack,
  LocalBlack,
} from '@/sqls';
import {
  converSqlExecResult,
  convertObjectField,
  convertToSnakeCaseObject,
  formatResponse,
} from '@/utils';
import { getInstance } from './instance';

export async function getBlackList(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetBlackList(db);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [], {
        block_user_id: 'userID',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getBlackListUserID(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetBlackListUserID(db);

    return formatResponse(converSqlExecResult(execResult[0], 'CamelCase'));
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getBlackInfoByBlockUserID(
  blockUserID: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetBlackInfoByBlockUserID(
      db,
      blockUserID,
      loginUserID
    );

    return formatResponse(converSqlExecResult(execResult[0], 'CamelCase'));
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getBlackInfoList(
  blockUserIDListStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetBlackInfoList(
      db,
      JSON.parse(blockUserIDListStr)
    );

    return formatResponse(converSqlExecResult(execResult[0], 'CamelCase'));
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function insertBlack(localBlackStr: string): Promise<string> {
  try {
    const db = await getInstance();

    const localBlack = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(localBlackStr), {
        userID: 'block_user_id',
        name: 'nickname',
      })
    ) as LocalBlack;

    databaseInsertBlack(db, localBlack);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function deleteBlack(
  blockUserID: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databasedeleteBlack(db, blockUserID, loginUserID);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function updateBlack(
  ownerUserID: string,
  blockUserID: string,
  localBlackStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    const localBlack = {
      ...convertToSnakeCaseObject(
        convertObjectField(JSON.parse(localBlackStr), {
          userID: 'block_user_id',
        })
      ),
      owner_user_id: ownerUserID,
      block_user_id: blockUserID,
    } as LocalBlack;

    databaseupdateBlack(db, localBlack);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}
