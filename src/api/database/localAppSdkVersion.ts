import { DatabaseErrorCode } from '@/constant';
import {
  LocalAppSDKVersion,
  getAppSDKVersion as databaseGetAppSDKVersion,
  insertAppSDKVersion as databaseInsertAppSDKVersion,
  updateAppSDKVersion as databaseUpdateAppSDKVersion,
} from '@/sqls';
import {
  converSqlExecResult,
  convertObjectField,
  convertToSnakeCaseObject,
  formatResponse,
} from '@/utils';
import { getInstance } from './instance';

export async function getAppSDKVersion(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetAppSDKVersion(db);

    if (execResult.length === 0) {
      return formatResponse(
        '',
        DatabaseErrorCode.RecordNotFound,
        'no app version with database'
      );
    }

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', ['installed'])[0]
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function setAppSDKVersion(
  appSdkVersionStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    const localAppSDKVersion = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(appSdkVersionStr))
    ) as LocalAppSDKVersion;

    const execResult = databaseGetAppSDKVersion(db);

    const result = converSqlExecResult(execResult[0], 'CamelCase', [
      'installed',
    ]);
    if (result[0] && result[0].version) {
      databaseUpdateAppSDKVersion(
        db,
        result[0].version as string,
        localAppSDKVersion
      );
      return formatResponse('');
    } else {
      databaseInsertAppSDKVersion(db, localAppSDKVersion);
      return formatResponse('');
    }
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}
