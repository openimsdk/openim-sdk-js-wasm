import { DatabaseErrorCode } from '@/constant';
import {
  LocalUserCommand,
  processUserCommandAdd as databaseProcessUserCommandAdd,
  processUserCommandUpdate as databaseProcessUserCommandUpdate,
  processUserCommandDelete as databaseProcessUserCommandDelete,
  processUserCommandGetAll as databaseProcessUserCommandGetAll,
} from '@/sqls';
import {
  converSqlExecResult,
  convertObjectField,
  convertToSnakeCaseObject,
  formatResponse,
} from '@/utils';
import { getInstance } from './instance';

export async function processUserCommandGetAll(): Promise<string> {
  try {
    const db = await getInstance();
    const execResult = databaseProcessUserCommandGetAll(db);

    return formatResponse(converSqlExecResult(execResult[0], 'CamelCase'));
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function processUserCommandAdd(
  commandStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const command = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(commandStr))
    ) as LocalUserCommand;

    databaseProcessUserCommandAdd(db, command);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function processUserCommandUpdate(
  commandStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const command = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(commandStr))
    ) as LocalUserCommand;

    databaseProcessUserCommandUpdate(db, command);
    const modified = db.getRowsModified();
    if (modified === 0) {
      throw 'processUserCommandUpdate no record updated';
    }

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function processUserCommandDelete(
  commandStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const command = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(commandStr))
    ) as LocalUserCommand;

    databaseProcessUserCommandDelete(db, command);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}
