import { DatabaseErrorCode } from '@/constant';
import {
  insertNotificationSeq as databaseInsertNotificationSeq,
  setNotificationSeq as databaseSetNotificationSeq,
  getNotificationAllSeqs as databaseGetNotificationAllSeqs,
  LocalNotification,
} from '@/sqls';
import { converSqlExecResult, formatResponse } from '@/utils';
import { getInstance } from './instance';

export async function setNotificationSeq(
  conversationID: string,
  seq: number
): Promise<string> {
  try {
    const db = await getInstance();
    let execResult = databaseSetNotificationSeq(db, conversationID, seq);

    const modified = db.getRowsModified();
    if (modified === 0) {
      execResult = databaseInsertNotificationSeq(db, conversationID, seq);
    }

    return formatResponse(execResult[0]);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getNotificationAllSeqs(): Promise<string> {
  try {
    const db = await getInstance();
    const execResult = databaseGetNotificationAllSeqs(db);

    return formatResponse(converSqlExecResult(execResult[0], 'CamelCase'));
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function batchInsertNotificationSeq(
  local_notification_seqs: string
): Promise<string> {
  try {
    const list = JSON.parse(local_notification_seqs) as LocalNotification[];
    const db = await getInstance();

    list.map(item => {
      const { conversationID, seq } = item;
      databaseInsertNotificationSeq(db, conversationID, seq);
    });

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}
