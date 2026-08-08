import { DatabaseErrorCode } from '@/constant';
import {
  ClientUser,
  getLoginUser as databaseGetLoginUser,
  insertLoginUser as databaseInsertLoginUser,
  updateLoginUser as databaseUpdateLoginUser,
  updateLoginUserByMap as databaseUpdateLoginUserByMap,
} from '@/sqls';
import {
  formatResponse,
  converSqlExecResult,
  convertToSnakeCaseObject,
  convertObjectField,
} from '@/utils';
import { getInstance } from './instance';

export async function getLoginUser(userID: string): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetLoginUser(db, userID);

    if (execResult.length === 0) {
      return formatResponse(
        '',
        DatabaseErrorCode.RecordNotFound,
        `no login user with id ${userID}`
      );
    }

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [], {
        name: 'nickname',
      })[0]
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function insertLoginUser(userStr: string): Promise<string> {
  try {
    const db = await getInstance();
    const user = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(userStr), { nickname: 'name' })
    ) as ClientUser;

    const execResult = databaseInsertLoginUser(db, user);

    return formatResponse(execResult);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function updateLoginUser(userStr: string): Promise<string> {
  try {
    const db = await getInstance();
    const user = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(userStr), { nickname: 'name' })
    ) as ClientUser;

    const execResult = databaseUpdateLoginUser(db, user);
    const modifed = db.getRowsModified();
    if (modifed === 0) {
      throw 'updateLoginUser no record updated';
    }
    return formatResponse(execResult);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function updateLoginUserByMap(
  userID: string,
  args: Record<string, unknown> | string
): Promise<string> {
  try {
    const db = await getInstance();
    const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
    const userArgs = convertToSnakeCaseObject(
      convertObjectField(parsedArgs, { nickname: 'name' })
    ) as ClientUser;
    delete userArgs.user_id;

    databaseUpdateLoginUserByMap(db, userID, userArgs);
    const modified = db.getRowsModified();
    if (modified === 0) {
      throw 'updateLoginUserByMap no record updated';
    }

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}
