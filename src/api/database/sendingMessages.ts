import { DatabaseErrorCode } from '@/constant';
import {
  LocalSendingMessage,
  insertSendingMessage as databaseInsertSendingMessage,
  deleteSendingMessage as databaseDeleteSendingMessage,
  getAllSendingMessages as datbaseGetAllSendingMessages,
} from '@/sqls';
import {
  converSqlExecResult,
  convertToSnakeCaseObject,
  formatResponse,
} from '@/utils';
import { getInstance } from './instance';

export async function insertSendingMessage(
  sendMessageStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const message = convertToSnakeCaseObject(
      JSON.parse(sendMessageStr)
    ) as LocalSendingMessage;

    const execResult = databaseInsertSendingMessage(db, message);

    return formatResponse(execResult);
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function deleteSendingMessage(
  conversationID: string,
  clientMsgID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseDeleteSendingMessage(
      db,
      conversationID,
      clientMsgID
    );

    return formatResponse(execResult);
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function getAllSendingMessages(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = datbaseGetAllSendingMessages(db);

    return formatResponse(
      converSqlExecResult(
        execResult[0],
        'CamelCase',
        ['isRead', 'isReact', 'isExternalExtensions'],
        undefined,
        ['dstUserIDs']
      )
    );
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}
