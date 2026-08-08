import { DatabaseErrorCode } from '@/constant';
import {
  ClientConversation,
  batchInsertConversationList as databaseBatchInsertConversationList,
  decrConversationUnreadCount as databaseDecrConversationUnreadCount,
  getAllConversationList as databaseGetAllConversationList,
  getAllConversationListToSync as databaseGetAllConversationListToSync,
  getConversation as databaseGetConversation,
  getHiddenConversationList as databaseGetHiddenConversationList,
  getAllSingleConversationIDList as databaseGetAllSingleConversationIDList,
  findAllUnreadConversationConversationID as databaseFindAllUnreadConversationConversationID,
  getAllConversationIDList as databaseGetAllConversationIDList,
  updateColumnsConversation as databaseUpdateColumnsConversation,
  updateAllConversation as databaseUpdateAllConversation,
  getTotalUnreadMsgCount as databaseGetTotalUnreadMsgCount,
  getMultipleConversation as databaseGetMultipleConversation,
  getConversationByUserID as databaseGetConversationByUserID,
  getConversationListSplit as databaseGetConversationListSplit,
  incrConversationUnreadCount as databaseIncrConversationUnreadCount,
  updateConversation as databaseUpdateConversation,
  deleteConversation as databaseDeleteConversation,
  conversationIfExists as databaseConversationIfExists,
  resetConversation as databaseResetConversation,
  resetAllConversation as databaseResetAllConversation,
  clearConversation as databaseClearConversation,
  clearAllConversation as databaseClearAllConversation,
  setConversationDraft as databaseSetConversationDraft,
  removeConversationDraft as databaseRemoveConversationDraft,
  unPinConversation as databaseUnPinConversation,
  setMultipleConversationRecvMsgOpt as databaseSetMultipleConversationRecvMsgOpt,
  getAllConversations as databaseGetAllConversations,
  searchConversations as databaseSearchConversations,
  deleteAllConversation as databaseDeleteAllConversation,
} from '@/sqls';
import {
  converSqlExecResult,
  convertObjectField,
  convertToSnakeCaseObject,
  formatResponse,
} from '@/utils';
import { getInstance } from './instance';

export async function getAllConversationList(): Promise<string> {
  try {
    const db = await getInstance();
    const execResult = databaseGetAllConversationList(db);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isPinned',
        'isPrivateChat',
        'isNotInGroup',
        'isMsgDestruct',
      ])
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getAllConversationListToSync(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetAllConversationListToSync(db);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isPinned',
        'isPrivateChat',
        'isNotInGroup',
        'isMsgDestruct',
      ])
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function findAllUnreadConversationConversationID(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseFindAllUnreadConversationConversationID(db);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase').map(
        item => item.conversationID
      )
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getAllSingleConversationIDList(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetAllSingleConversationIDList(db);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase').map(
        item => item.conversationID
      )
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getAllConversationIDList(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetAllConversationIDList(db);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase').map(
        item => item.conversationID
      )
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getHiddenConversationList(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetHiddenConversationList(db);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isPinned',
        'isPrivateChat',
        'isNotInGroup',
        'isMsgDestruct',
      ])
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getConversation(conversationID: string): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetConversation(db, conversationID);

    if (execResult.length === 0) {
      return formatResponse(
        '',
        DatabaseErrorCode.RecordNotFound,
        `no conversation with id ${conversationID}`
      );
    }

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isPinned',
        'isPrivateChat',
        'isNotInGroup',
        'isMsgDestruct',
      ])[0]
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getMultipleConversation(
  conversationIDList: string
): Promise<string> {
  try {
    const db = await getInstance();
    const idList = JSON.parse(conversationIDList);

    const execResult = databaseGetMultipleConversation(db, idList);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isPinned',
        'isPrivateChat',
        'isNotInGroup',
        'isMsgDestruct',
      ])
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function updateColumnsConversation(
  conversationID: string,
  conversation: ClientConversation | string
): Promise<string> {
  try {
    const db = await getInstance();
    let parsedConversation = conversation as ClientConversation;
    if (typeof conversation === 'string') {
      parsedConversation = convertToSnakeCaseObject(
        convertObjectField(JSON.parse(conversation))
      ) as ClientConversation;
    }

    const execResult = databaseUpdateColumnsConversation(
      db,
      conversationID,
      parsedConversation
    );
    const modifed = db.getRowsModified();

    if (modifed === 0) {
      throw 'updateColumnsConversation no record updated';
    }

    return formatResponse(execResult);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function decrConversationUnreadCount(
  conversationID: string,
  count: number
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseDecrConversationUnreadCount(
      db,
      conversationID,
      count
    );

    return formatResponse(execResult);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function batchInsertConversationList(
  conversationListStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const conversationList = (
      (JSON.parse(conversationListStr) || []) as ClientConversation[]
    ).map((v: Record<string, unknown>) => convertToSnakeCaseObject(v));

    if (conversationList.length === 0) {
      return formatResponse('');
    }

    const execResult = databaseBatchInsertConversationList(
      db,
      conversationList
    );

    return formatResponse(execResult);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function insertConversation(
  conversationStr: string
): Promise<string> {
  return batchInsertConversationList(`[${conversationStr}]`);
}

export async function getTotalUnreadMsgCount(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetTotalUnreadMsgCount(db);

    return formatResponse(execResult[0]?.values[0]?.[0] ?? 0);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getConversationByUserID(userID: string): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetConversationByUserID(db, userID);

    if (execResult.length === 0) {
      return formatResponse(
        '',
        DatabaseErrorCode.RecordNotFound,
        `no conversation with userID ${userID}`
      );
    }

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isPinned',
        'isPrivateChat',
        'isNotInGroup',
        'isMsgDestruct',
      ])[0]
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getConversationListSplit(
  offset: number,
  count: number
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetConversationListSplit(db, offset, count);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isPinned',
        'isPrivateChat',
        'isNotInGroup',
        'isMsgDestruct',
      ])
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function deleteConversation(
  conversationID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databaseDeleteConversation(db, conversationID);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function deleteAllConversation(): Promise<string> {
  try {
    const db = await getInstance();

    databaseDeleteAllConversation(db);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function updateConversation(
  conversationStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    const localConversation = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(conversationStr))
    ) as ClientConversation;

    databaseUpdateConversation(db, localConversation);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function batchUpdateConversationList(
  conversationListStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const conversationList = (
      (JSON.parse(conversationListStr) || []) as ClientConversation[]
    ).map((v: Record<string, unknown>) => convertToSnakeCaseObject(v));

    if (conversationList.length === 0) {
      return formatResponse('');
    }

    conversationList.forEach(conversation => {
      databaseUpdateConversation(db, conversation);
    });

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function conversationIfExists(
  conversationID: string
): Promise<string> {
  try {
    const db = await getInstance();
    const execResult = databaseConversationIfExists(db, conversationID);

    return formatResponse(execResult.length !== 0);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function resetConversation(
  conversationID: string
): Promise<string> {
  try {
    const db = await getInstance();
    databaseResetConversation(db, conversationID);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function resetAllConversation(): Promise<string> {
  try {
    const db = await getInstance();
    databaseResetAllConversation(db);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function clearConversation(
  conversationID: string
): Promise<string> {
  try {
    const db = await getInstance();
    databaseClearConversation(db, conversationID);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function clearAllConversation(): Promise<string> {
  try {
    const db = await getInstance();
    databaseClearAllConversation(db);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function setConversationDraft(
  conversationID: string,
  draftText: string
): Promise<string> {
  try {
    const db = await getInstance();
    databaseSetConversationDraft(db, conversationID, draftText);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function removeConversationDraft(
  conversationID: string,
  draftText: string
): Promise<string> {
  try {
    const db = await getInstance();
    databaseRemoveConversationDraft(db, conversationID, draftText);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function unPinConversation(
  conversationID: string,
  isPinned: number
): Promise<string> {
  try {
    const db = await getInstance();
    databaseUnPinConversation(db, conversationID, isPinned);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function updateAllConversation(
  conversationStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const parsedConversation = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(conversationStr))
    ) as ClientConversation;

    if (parsedConversation.conversation_id) {
      throw new Error('updateAllConversation requires an empty conversationID');
    }

    const nonZeroFields = Object.entries(parsedConversation).reduce(
      (fields, [key, value]) => {
        if (
          key !== 'conversation_id' &&
          value !== undefined &&
          value !== null &&
          value !== '' &&
          value !== 0 &&
          value !== false
        ) {
          fields[key] = value;
        }
        return fields;
      },
      {} as ClientConversation
    );

    if (Object.keys(nonZeroFields).length === 0) {
      throw new Error('updateAllConversation has no non-zero fields');
    }

    const execResult = databaseUpdateAllConversation(db, nonZeroFields);
    if (db.getRowsModified() === 0) {
      throw new Error('updateAllConversation updated no records');
    }

    return formatResponse(execResult);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function updateOrCreateConversations(
  conversationListStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const conversationList = (
      (JSON.parse(conversationListStr) || []) as ClientConversation[]
    ).map(
      conversation =>
        convertToSnakeCaseObject(
          convertObjectField(conversation)
        ) as ClientConversation
    );

    if (conversationList.length === 0) {
      return formatResponse('');
    }

    const queryResult = databaseGetAllConversationIDList(db);
    const existingIDs = new Set(
      queryResult.length === 0
        ? []
        : converSqlExecResult(queryResult[0], 'CamelCase').map(
            item => item.conversationID as string
          )
    );
    const conversationsToInsert = conversationList.filter(
      conversation => !existingIDs.has(conversation.conversation_id as string)
    );
    const conversationsToUpdate = conversationList.filter(conversation =>
      existingIDs.has(conversation.conversation_id as string)
    );

    db.exec('BEGIN');
    try {
      if (conversationsToInsert.length > 0) {
        databaseBatchInsertConversationList(db, conversationsToInsert);
      }
      conversationsToUpdate.forEach(conversation => {
        databaseUpdateColumnsConversation(
          db,
          conversation.conversation_id as string,
          { unread_count: conversation.unread_count }
        );
      });
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function incrConversationUnreadCount(
  conversationID: string
): Promise<string> {
  try {
    const db = await getInstance();
    const execResult = databaseIncrConversationUnreadCount(db, conversationID);

    return formatResponse(execResult);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function setMultipleConversationRecvMsgOpt(
  conversationIDListStr: string,
  opt: number
): Promise<string> {
  try {
    const db = await getInstance();
    databaseSetMultipleConversationRecvMsgOpt(
      db,
      JSON.parse(conversationIDListStr),
      opt
    );

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getAllConversations(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetAllConversations(db);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isPinned',
        'isPrivateChat',
        'isNotInGroup',
        'isMsgDestruct',
      ])
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function searchConversations(keyword: string): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseSearchConversations(db, keyword);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [
        'isPinned',
        'isPrivateChat',
        'isNotInGroup',
        'isMsgDestruct',
      ])
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}
