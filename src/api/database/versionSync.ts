import { DatabaseErrorCode } from '@/constant';
import {
  LocalVersionSync,
  getVersionSync as databaseGetVersionSync,
  insertVersionSync as databaseInsertVersionSync,
  updateVersionSync as databaseUpdateVersionSync,
  deleteVersionSync as databaseDeleteVersionSync,
} from '@/sqls';
import {
  converSqlExecResult,
  convertObjectField,
  convertToSnakeCaseObject,
  formatResponse,
} from '@/utils';
import { getInstance } from './instance';

export async function getVersionSync(
  tableName: string,
  entityID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetVersionSync(db, tableName, entityID);

    if (execResult.length === 0) {
      return formatResponse(
        '',
        DatabaseErrorCode.RecordNotFound,
        `no sync version with tableName ${tableName}, entityID ${entityID}`
      );
    }

    const result = converSqlExecResult(execResult[0], 'CamelCase', [], {
      id_list: 'uidList',
    })[0];
    result.uidList = JSON.parse(result.uidList as string);

    return formatResponse(result);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function setVersionSync(versionSyncStr: string): Promise<string> {
  try {
    const db = await getInstance();

    const localVersionSync = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(versionSyncStr))
    ) as LocalVersionSync;

    localVersionSync.id_list = JSON.stringify(localVersionSync.uid_list);
    delete localVersionSync.uid_list;

    const execResult = databaseGetVersionSync(
      db,
      localVersionSync.table_name,
      localVersionSync.entity_id
    );
    const result = converSqlExecResult(execResult[0], 'CamelCase', []);

    if (result[0] && result[0].tableName) {
      databaseUpdateVersionSync(
        db,
        result[0].tableName as string,
        result[0].entityID as string,
        localVersionSync
      );
      return formatResponse('');
    } else {
      databaseInsertVersionSync(db, localVersionSync);
      return formatResponse('');
    }
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function deleteVersionSync(
  tablename: string,
  entityID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databaseDeleteVersionSync(db, tablename, entityID);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}
