import { DatabaseErrorCode } from '@/constant';
import {
  TempCacheClientMessage,
  batchInsertTempCacheMessageList as databseBatchInsertTempCacheMessageList,
} from '@/sqls';
import { convertToSnakeCaseObject, formatResponse } from '@/utils';
import { getInstance } from './instance';

export async function batchInsertTempCacheMessageList(
  messageListStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const messageList = (
      JSON.parse(messageListStr) as TempCacheClientMessage[]
    ).map((v: Record<string, unknown>) => convertToSnakeCaseObject(v));

    const execResult = databseBatchInsertTempCacheMessageList(db, messageList);

    return formatResponse(execResult[0]);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function InsertTempCacheMessage(
  messageStr: string
): Promise<string> {
  return batchInsertTempCacheMessageList(`[${messageStr}]`);
}
