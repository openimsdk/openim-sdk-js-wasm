import { DatabaseErrorCode } from '@/constant';
import {
  ClientMessage,
  getMessage as databaseGetMessage,
  getAlreadyExistSeqList as databaseGetAlreadyExistSeqList,
  getLatestValidServerMessage as databaseGetLatestValidServerMessage,
  getMessageBySeq as databaseGetMessageBySeq,
  getMessagesByClientMsgIDs as databaseGetMessagesByClientMsgIDs,
  getMessagesBySeqs as databaseGetMessagesBySeqs,
  getMessageListNoTime as databaseGetMessageListNoTime,
  getConversationNormalMsgSeq as databaseGetConversationNormalMsgSeq,
  getConversationPeerNormalMsgSeq as databaseGetConversationPeerNormalMsgSeq,
  getMultipleMessage as databaseGetMultipleMessage,
  getSendingMessageList as databaseGetSendingMessageList,
  updateMessageTimeAndStatus as databaseUpdateMessageTimeAndStatus,
  updateMessage as databaseUpdateMessage,
  updateMessageBySeq as databaseUpdateMessageBySeq,
  updateColumnsMessage as databaseUpdateColumnsMessage,
  deleteConversationMsgs as databaseDeleteConversationMsgs,
  markConversationAllMessageAsRead as databaseMarkConversationAllMessageAsRead,
  searchAllMessageByContentType as databaseSearchAllMessageByContentType,
  insertMessage as databaseInsertMessage,
  batchInsertMessageList as databaseBatchInsertMessageList,
  getMessageList as databaseGetMesageList,
  messageIfExists as databaseMessageIfExists,
  searchMessageByKeyword as databaseSearchMessageByKeyword,
  searchMessageByContentType as databaseSearchMessageByContentType,
  searchMessageByContentTypeAndKeyword as databaseSearchMessageByContentTypeAndKeyword,
  updateMsgSenderFaceURLAndSenderNickname as databaseUpdateMsgSenderFaceURLAndSenderNickname,
  deleteConversationAllMessages as databaseDeleteConversationAllMessages,
  markDeleteConversationAllMessages as databaseMarkDeleteConversationAllMessages,
  getUnreadMessage as databaseGetUnreadMessage,
  markConversationMessageAsReadBySeqs as databaseMarkConversationMessageAsReadBySeqs,
  markConversationMessageAsRead as databaseMarkConversationMessageAsRead,
  getLatestActiveMessage as databaseGetLatestActiveMessage,
} from '@/sqls';
import {
  converSqlExecResult,
  convertObjectField,
  convertToSnakeCaseObject,
  formatResponse,
} from '@/utils';
import { getInstance } from './instance';

export async function getMessage(
  conversationID: string,
  clientMsgID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetMessage(db, conversationID, clientMsgID);

    if (execResult.length === 0) {
      return formatResponse(
        '',
        DatabaseErrorCode.ErrorNoRecord,
        `no message with id ${clientMsgID}`
      );
    }

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isRead',
        'isReact',
        'isExternalExtensions',
      ])[0]
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

export async function getAlreadyExistSeqList(
  conversationID: string,
  lostSeqListStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetAlreadyExistSeqList(
      db,
      conversationID,
      JSON.parse(lostSeqListStr)
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isRead',
        'isReact',
        'isExternalExtensions',
      ]).map(item => item.seq) ?? []
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

export async function getLatestValidServerMessage(
  conversationID: string,
  startTime: number,
  isReverse: boolean
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetLatestValidServerMessage(
      db,
      conversationID,
      startTime,
      isReverse
    );

    const message = converSqlExecResult(execResult[0], 'CamelCase', [
      'isRead',
      'isReact',
      'isExternalExtensions',
    ])[0];

    if (!message) {
      return formatResponse(
        '',
        DatabaseErrorCode.ErrorNoRecord,
        `no message with conversationID ${conversationID}`
      );
    }

    return formatResponse(message);
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function getMessageList(
  conversationID: string,
  count: number,
  startTime: number,
  startSeq: number,
  startClientMsgID: string,
  isReverse = false
): Promise<string> {
  if (startTime <= 0) {
    return getMessageListNoTime(conversationID, count, isReverse);
  }
  try {
    const db = await getInstance();

    const execResult = databaseGetMesageList(
      db,
      conversationID,
      count,
      startTime,
      startSeq,
      startClientMsgID,
      isReverse
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isRead',
        'isReact',
        'isExternalExtensions',
      ])
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

export async function getMessageBySeq(
  conversationID: string,
  seq: number
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetMessageBySeq(db, conversationID, seq);

    if (execResult.length === 0) {
      return formatResponse(
        '',
        DatabaseErrorCode.ErrorNoRecord,
        `no message with seq ${seq}`
      );
    }

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isRead',
        'isReact',
        'isExternalExtensions',
      ])[0]
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

export async function getMessagesByClientMsgIDs(
  conversationID: string,
  clientMsgIDListStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetMessagesByClientMsgIDs(
      db,
      conversationID,
      JSON.parse(clientMsgIDListStr)
    );

    if (execResult.length === 0) {
      return formatResponse(
        '',
        DatabaseErrorCode.ErrorNoRecord,
        `no message with clientMsgIDListStr ${clientMsgIDListStr}`
      );
    }

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isRead',
        'isReact',
        'isExternalExtensions',
      ])
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

export async function getMessagesBySeqs(
  conversationID: string,
  seqListStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetMessagesBySeqs(
      db,
      conversationID,
      JSON.parse(seqListStr)
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isRead',
        'isReact',
        'isExternalExtensions',
      ])
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

export async function getMessageListNoTime(
  conversationID: string,
  count: number,
  isReverse = false
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetMessageListNoTime(
      db,
      conversationID,
      count,
      isReverse
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isRead',
        'isReact',
        'isExternalExtensions',
      ])
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

export async function getConversationNormalMsgSeq(
  conversationID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetConversationNormalMsgSeq(db, conversationID);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase')[0]?.seq ?? 0
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

export async function getConversationPeerNormalMsgSeq(
  conversationID: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetConversationPeerNormalMsgSeq(
      db,
      conversationID,
      loginUserID
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase')[0]?.seq ?? 0
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

export async function getSendingMessageList(
  conversationID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetSendingMessageList(db, conversationID);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isRead',
        'isReact',
        'isExternalExtensions',
      ])
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

export async function updateMessageTimeAndStatus(
  conversationID: string,
  clientMsgID: string,
  serverMsgID: string,
  sendTime: number,
  status: number
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseUpdateMessageTimeAndStatus(
      db,
      conversationID,
      clientMsgID,
      serverMsgID,
      sendTime,
      status
    );
    const modifed = db.getRowsModified();
    if (modifed === 0) {
      throw 'updateMessageTimeAndStatus no record updated';
    }

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

export async function updateMessage(
  conversationID: string,
  clientMsgID: string,
  messageStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const message = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(messageStr))
    ) as ClientMessage;

    const execResult = databaseUpdateMessage(
      db,
      conversationID,
      clientMsgID,
      message
    );
    const modifed = db.getRowsModified();
    if (modifed === 0) {
      throw 'updateMessage no record updated';
    }

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

export async function updateMessageBySeq(
  conversationID: string,
  seq: number,
  messageStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const message = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(messageStr))
    ) as ClientMessage;

    const execResult = databaseUpdateMessageBySeq(
      db,
      conversationID,
      seq,
      message
    );
    const modifed = db.getRowsModified();
    if (modifed === 0) {
      throw 'updateMessageBySeq no record updated';
    }

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

export async function batchInsertMessageList(
  conversationID: string,
  messageListStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const messageList = (JSON.parse(messageListStr) as ClientMessage[]).map(
      (v: Record<string, unknown>) => convertToSnakeCaseObject(v)
    );

    const execResult = databaseBatchInsertMessageList(
      db,
      conversationID,
      messageList
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

export async function insertMessage(
  conversationID: string,
  messageStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const message = convertToSnakeCaseObject(
      JSON.parse(messageStr)
    ) as ClientMessage;

    const execResult = databaseInsertMessage(db, conversationID, message);

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

export async function getMultipleMessage(
  conversationID: string,
  messageIDStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetMultipleMessage(
      db,
      conversationID,
      JSON.parse(messageIDStr)
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isRead',
        'isReact',
        'isExternalExtensions',
      ])
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

export async function searchMessageByKeyword(
  conversationID: string,
  contentTypeStr: string,
  keywordListStr: string,
  keywordListMatchType: number,
  startTime: number,
  endTime: number,
  offset: number,
  count: number
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseSearchMessageByKeyword(
      db,
      conversationID,
      JSON.parse(contentTypeStr),
      JSON.parse(keywordListStr),
      keywordListMatchType,
      startTime,
      endTime,
      offset,
      count
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isRead',
        'isReact',
        'isExternalExtensions',
      ])
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

export async function searchMessageByContentType(
  conversationID: string,
  contentTypeStr: string,
  startTime: number,
  endTime: number,
  offset: number,
  count: number
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseSearchMessageByContentType(
      db,
      conversationID,
      JSON.parse(contentTypeStr),
      startTime,
      endTime,
      offset,
      count
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isRead',
        'isReact',
        'isExternalExtensions',
      ])
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

export async function searchMessageByContentTypeAndKeyword(
  conversationID: string,
  contentTypeStr: string,
  keywordListStr: string,
  keywordListMatchType: number,
  startTime: number,
  endTime: number
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseSearchMessageByContentTypeAndKeyword(
      db,
      conversationID,
      JSON.parse(contentTypeStr),
      JSON.parse(keywordListStr),
      keywordListMatchType,
      startTime,
      endTime
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isRead',
        'isReact',
        'isExternalExtensions',
      ])
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

export async function messageIfExists(
  conversationID: string,
  clientMsgID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseMessageIfExists(db, conversationID, clientMsgID);

    return formatResponse(execResult.length !== 0);
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function updateMsgSenderFaceURLAndSenderNickname(
  conversationID: string,
  sendID: string,
  faceURL: string,
  nickname: string
): Promise<string> {
  try {
    const db = await getInstance();

    databaseUpdateMsgSenderFaceURLAndSenderNickname(
      db,
      conversationID,
      sendID,
      faceURL,
      nickname
    );

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

export async function deleteConversationAllMessages(
  conversationID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databaseDeleteConversationAllMessages(db, conversationID);

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

export async function markDeleteConversationAllMessages(
  conversationID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databaseMarkDeleteConversationAllMessages(db, conversationID);

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

export async function getUnreadMessage(
  conversationID: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetUnreadMessage(
      db,
      conversationID,
      loginUserID
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isRead',
        'isReact',
        'isExternalExtensions',
      ])
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

export async function markConversationMessageAsReadBySeqs(
  conversationID: string,
  seqListStr: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databaseMarkConversationMessageAsReadBySeqs(
      db,
      conversationID,
      JSON.parse(seqListStr),
      loginUserID
    );

    return formatResponse(db.getRowsModified());
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function markConversationMessageAsRead(
  conversationID: string,
  clientMsgIDListStr: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databaseMarkConversationMessageAsRead(
      db,
      conversationID,
      JSON.parse(clientMsgIDListStr),
      loginUserID
    );

    return formatResponse(db.getRowsModified());
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function updateColumnsMessage(
  conversationID: string,
  clientMsgID: string,
  messageStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const message = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(messageStr))
    ) as ClientMessage;

    const execResult = databaseUpdateColumnsMessage(
      db,
      conversationID,
      clientMsgID,
      message
    );
    const modifed = db.getRowsModified();
    if (modifed === 0) {
      throw 'updateMessage no record updated';
    }

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

export async function deleteConversationMsgs(
  conversationID: string,
  clientMsgIDListStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseDeleteConversationMsgs(
      db,
      conversationID,
      JSON.parse(clientMsgIDListStr)
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

export async function markConversationAllMessageAsRead(
  conversationID: string,
  clientMsgIDListStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    databaseMarkConversationAllMessageAsRead(
      db,
      conversationID,
      JSON.parse(clientMsgIDListStr)
    );

    return formatResponse(db.getRowsModified());
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function searchAllMessageByContentType(
  conversationID: string,
  clientMsgIDListStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseSearchAllMessageByContentType(
      db,
      conversationID,
      JSON.parse(clientMsgIDListStr)
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isRead',
        'isReact',
        'isExternalExtensions',
      ])
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

export async function getLatestActiveMessage(
  conversationID: string,
  isReverse: boolean
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetLatestActiveMessage(
      db,
      conversationID,
      isReverse
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isRead',
        'isReact',
        'isExternalExtensions',
      ])
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
