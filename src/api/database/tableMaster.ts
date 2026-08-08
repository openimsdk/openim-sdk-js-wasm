import { converSqlExecResult, formatResponse } from '@/utils';
import {
  getExistTables as databaseGetExistTables,
  getExistedTables as databaseGetExistedTables,
} from '@/sqls';
import { DatabaseErrorCode } from '@/constant';
import { getInstance } from './instance';

export async function getExistedTables(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetExistedTables(db);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [], {
        tbl_name: 'tblName',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

// Core wasm calls getExistTables and expects data to unmarshal into []string.
export async function getExistTables(): Promise<string> {
  try {
    const db = await getInstance();
    const execResult = databaseGetExistTables(db);
    const names = (execResult[0]?.values || []).map(row => String(row[0]));

    return formatResponse(names);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}
