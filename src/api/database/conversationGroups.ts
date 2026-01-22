import { DatabaseErrorCode } from '@/constant';
import {
  insertConversationGroup as databaseInsertConversationGroup,
  batchInsertConversationGroups as databaseBatchInsertConversationGroups,
  upsertConversationGroups as databaseUpsertConversationGroups,
  updateConversationGroup as databaseUpdateConversationGroup,
  deleteConversationGroup as databaseDeleteConversationGroup,
  getConversationGroup as databaseGetConversationGroup,
  getConversationGroups as databaseGetConversationGroups,
  getAllConversationGroups as databaseGetAllConversationGroups,
  updateConversationGroupSerial as databaseUpdateConversationGroupSerial,
  replaceConversationGroupMembers as databaseReplaceConversationGroupMembers,
  addConversationGroupMembers as databaseAddConversationGroupMembers,
  removeConversationGroupMembers as databaseRemoveConversationGroupMembers,
  getConversationGroupIDsByConversationID as databaseGetConversationGroupIDsByConversationID,
  getConversationIDsByGroupID as databaseGetConversationIDsByGroupID,
  deleteConversationGroupMembersByGroupID as databaseDeleteConversationGroupMembersByGroupID,
  LocalConversationGroup,
} from '@/sqls';
import {
  converSqlExecResult,
  convertToSnakeCaseObject,
  formatResponse,
} from '@/utils';
import { getInstance } from './instance';

// ==================== local_conversation_groups API ====================

export async function insertConversationGroup(
  localConversationGroupStr: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localConversationGroup = convertToSnakeCaseObject(
      JSON.parse(localConversationGroupStr)
    ) as LocalConversationGroup;
    localConversationGroup.owner_user_id = loginUserID;

    databaseInsertConversationGroup(db, localConversationGroup);

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

export async function batchInsertConversationGroups(
  localConversationGroupsStr: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localConversationGroups = (
      JSON.parse(localConversationGroupsStr) as Record<string, unknown>[]
    ).map(group => {
      const converted = convertToSnakeCaseObject(
        group
      ) as LocalConversationGroup;
      converted.owner_user_id = loginUserID;
      return converted;
    });

    databaseBatchInsertConversationGroups(db, localConversationGroups);

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

export async function upsertConversationGroups(
  localConversationGroupsStr: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localConversationGroups = (
      JSON.parse(localConversationGroupsStr) as Record<string, unknown>[]
    ).map(group => {
      const converted = convertToSnakeCaseObject(
        group
      ) as LocalConversationGroup;
      converted.owner_user_id = loginUserID;
      return converted;
    });

    databaseUpsertConversationGroups(db, localConversationGroups);

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

export async function updateConversationGroup(
  localConversationGroupStr: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localConversationGroup = convertToSnakeCaseObject(
      JSON.parse(localConversationGroupStr)
    ) as LocalConversationGroup;
    localConversationGroup.owner_user_id = loginUserID;

    const result = databaseUpdateConversationGroup(db, localConversationGroup);
    if (db.getRowsModified() === 0) {
      return formatResponse(
        undefined,
        DatabaseErrorCode.ErrorNoRecord,
        'no record found'
      );
    }

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

export async function deleteConversationGroup(
  groupID: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databaseDeleteConversationGroup(db, groupID, loginUserID);

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

export async function getConversationGroup(
  groupID: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetConversationGroup(db, groupID, loginUserID);
    const result = converSqlExecResult(execResult[0], 'CamelCase');

    if (result.length === 0) {
      return formatResponse(
        undefined,
        DatabaseErrorCode.ErrorNoRecord,
        'no record found'
      );
    }

    return formatResponse(result[0]);
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function getConversationGroups(
  groupIDsStr: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();
    const groupIDs = JSON.parse(groupIDsStr) as string[];

    const execResult = databaseGetConversationGroups(db, groupIDs, loginUserID);

    return formatResponse(converSqlExecResult(execResult[0], 'CamelCase'));
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function getAllConversationGroups(
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetAllConversationGroups(db, loginUserID);

    return formatResponse(converSqlExecResult(execResult[0], 'CamelCase'));
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function updateConversationGroupSerial(
  groupID: string,
  serial: number,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databaseUpdateConversationGroupSerial(db, groupID, serial, loginUserID);
    if (db.getRowsModified() === 0) {
      return formatResponse(
        undefined,
        DatabaseErrorCode.ErrorNoRecord,
        'no record found'
      );
    }

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

// ==================== local_conversation_group_members API ====================

export async function replaceConversationGroupMembers(
  conversationID: string,
  groupIDsStr: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();
    const groupIDs = JSON.parse(groupIDsStr) as string[];

    databaseReplaceConversationGroupMembers(
      db,
      conversationID,
      groupIDs,
      loginUserID
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

export async function addConversationGroupMembers(
  conversationID: string,
  groupIDsStr: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();
    const groupIDs = JSON.parse(groupIDsStr) as string[];

    databaseAddConversationGroupMembers(
      db,
      conversationID,
      groupIDs,
      loginUserID
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

export async function removeConversationGroupMembers(
  conversationID: string,
  groupIDsStr: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();
    const groupIDs = JSON.parse(groupIDsStr) as string[];

    databaseRemoveConversationGroupMembers(
      db,
      conversationID,
      groupIDs,
      loginUserID
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

export async function getConversationGroupIDsByConversationID(
  conversationID: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetConversationGroupIDsByConversationID(
      db,
      conversationID,
      loginUserID
    );
    const result = converSqlExecResult(execResult[0], 'CamelCase') as {
      groupId: string;
    }[];
    const groupIDs = result.map(item => item.groupId);

    return formatResponse(groupIDs);
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function getConversationIDsByGroupID(
  groupID: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetConversationIDsByGroupID(
      db,
      groupID,
      loginUserID
    );
    const result = converSqlExecResult(execResult[0], 'CamelCase') as {
      conversationId: string;
    }[];
    const conversationIDs = result.map(item => item.conversationId);

    return formatResponse(conversationIDs);
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function deleteConversationGroupMembersByGroupID(
  groupID: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databaseDeleteConversationGroupMembersByGroupID(db, groupID, loginUserID);

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
