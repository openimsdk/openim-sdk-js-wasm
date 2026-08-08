import { DatabaseErrorCode } from '@/constant';
import {
  insertGroupRequest as databaseInsertGroupRequest,
  deleteGroupRequest as databaseDeleteGroupRequest,
  updateGroupRequest as databaseUpdateGroupRequest,
  getSendGroupApplication as databaseGetSendGroupApplication,
  insertAdminGroupRequest as databaseInsertAdminGroupRequest,
  deleteAdminGroupRequest as databaseDeleteAdminGroupRequest,
  updateAdminGroupRequest as databaseUpdateAdminGroupRequest,
  getAdminGroupApplication as databaseGetAdminGroupApplication,
  LocalGroupRequest,
} from '@/sqls';
import {
  convertToSnakeCaseObject,
  convertObjectField,
  formatResponse,
  converSqlExecResult,
} from '@/utils';
import { getInstance } from './instance';

export async function insertGroupRequest(
  localGroupRequestStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    const localGroupRequest = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(localGroupRequestStr), {
        groupFaceURL: 'face_url',
        userFaceURL: 'user_face_url',
        handledMsg: 'handle_msg',
        handledTime: 'handle_time',
      })
    ) as LocalGroupRequest;

    databaseInsertGroupRequest(db, localGroupRequest);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function deleteGroupRequest(
  groupID: string,
  userID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databaseDeleteGroupRequest(db, groupID, userID);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function updateGroupRequest(
  localGroupRequestStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localGroupRequest = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(localGroupRequestStr), {
        groupFaceURL: 'face_url',
        userFaceURL: 'user_face_url',
        handledMsg: 'handle_msg',
        handledTime: 'handle_time',
      })
    ) as LocalGroupRequest;
    databaseUpdateGroupRequest(db, localGroupRequest);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getSendGroupApplication(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetSendGroupApplication(db);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [], {
        face_url: 'groupFaceURL',
        user_face_url: 'userFaceURL',
        handle_msg: 'handledMsg',
        handle_time: 'handledTime',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function insertAdminGroupRequest(
  localAdminGroupRequestStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    const localAminGroupRequest = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(localAdminGroupRequestStr), {
        groupFaceURL: 'face_url',
        userFaceURL: 'user_face_url',
        handledMsg: 'handle_msg',
        handledTime: 'handle_time',
      })
    ) as LocalGroupRequest;

    databaseInsertAdminGroupRequest(db, localAminGroupRequest);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function deleteAdminGroupRequest(
  groupID: string,
  userID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databaseDeleteAdminGroupRequest(db, groupID, userID);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function updateAdminGroupRequest(
  localGroupRequestStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localGroupRequest = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(localGroupRequestStr), {
        groupFaceURL: 'face_url',
        userFaceURL: 'user_face_url',
        handledMsg: 'handle_msg',
        handledTime: 'handle_time',
      })
    ) as LocalGroupRequest;
    databaseUpdateAdminGroupRequest(db, localGroupRequest);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getAdminGroupApplication(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetAdminGroupApplication(db);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [], {
        face_url: 'groupFaceURL',
        user_face_url: 'userFaceURL',
        handle_msg: 'handledMsg',
        handle_time: 'handledTime',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}
