import { DatabaseErrorCode } from '@/constant';
import {
  ClientLocalConversationUnreadMessage,
  batchInsertConversationUnreadMessageList as databaseBatchInsertConversationUnreadMessageList,
  deleteConversationUnreadMessageList as databaseDeleteConversationUnreadMessageList,
} from '@/sqls';
import { convertToSnakeCaseObject, formatResponse } from '@/utils';
import { getInstance } from './instance';

export async function deleteConversationUnreadMessageList(
  conversationID: string,
  sendTime: number
): Promise<string> {
  try {
    const db = await getInstance();

    databaseDeleteConversationUnreadMessageList(db, conversationID, sendTime);
    const modifed = db.getRowsModified();

    return formatResponse(modifed);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function batchInsertConversationUnreadMessageList(
  messageListStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const messageList = (
      JSON.parse(messageListStr) as ClientLocalConversationUnreadMessage[]
    ).map((v: Record<string, unknown>) => convertToSnakeCaseObject(v));

    const execResult = databaseBatchInsertConversationUnreadMessageList(
      db,
      messageList
    );

    return formatResponse(execResult[0]);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}
