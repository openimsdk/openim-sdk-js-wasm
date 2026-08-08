import { DatabaseErrorCode } from '@/constant';
import {
  ClientUpload,
  getUpload as databaseGetUpload,
  insertUpload as databaseInsertUpload,
  updateUpload as databaseUpdateUpload,
  deleteUpload as databaseDeleteUpload,
  deleteExpireUpload as databaseDeleteExpireUpload,
} from '@/sqls';
import {
  converSqlExecResult,
  convertObjectField,
  convertToSnakeCaseObject,
  formatResponse,
} from '@/utils';
import { getInstance } from './instance';

export async function getUpload(partHash: string): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetUpload(db, partHash);

    const upload = converSqlExecResult(execResult[0], 'CamelCase');
    if (upload.length === 0) {
      throw `no upload with partHash = ${partHash}`;
    }

    return formatResponse(upload[0]);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function insertUpload(uploadStr: string): Promise<string> {
  try {
    const db = await getInstance();
    const upload = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(uploadStr))
    ) as ClientUpload;

    const execResult = databaseInsertUpload(db, upload);

    return formatResponse(execResult);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function updateUpload(uploadStr: string): Promise<string> {
  try {
    const db = await getInstance();
    const upload = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(uploadStr))
    ) as ClientUpload;

    const execResult = databaseUpdateUpload(db, upload);

    return formatResponse(execResult);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function deleteUpload(partHash: string): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseDeleteUpload(db, partHash);

    return formatResponse(execResult);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function deleteExpireUpload(): Promise<string> {
  try {
    const db = await getInstance();
    const execResult = databaseDeleteExpireUpload(db);

    return formatResponse(execResult);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}
