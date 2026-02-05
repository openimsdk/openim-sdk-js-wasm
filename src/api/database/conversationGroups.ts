import { DatabaseErrorCode } from '@/constant';
import {
  insertConversationGroup as databaseInsertConversationGroup,
  batchInsertConversationGroups as databaseBatchInsertConversationGroups,
  upsertConversationGroups as databaseUpsertConversationGroups,
  updateConversationGroup as databaseUpdateConversationGroup,
  deleteConversationGroup as databaseDeleteConversationGroup,
  deleteAllConversationGroups as databaseDeleteAllConversationGroups,
  getConversationGroup as databaseGetConversationGroup,
  getConversationGroups as databaseGetConversationGroups,
  getAllConversationGroups as databaseGetAllConversationGroups,
  updateConversationGroupSerial as databaseUpdateConversationGroupSerial,
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
  localConversationGroupStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localConversationGroup = convertToSnakeCaseObject(
      JSON.parse(localConversationGroupStr)
    ) as LocalConversationGroup;

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
  localConversationGroupsStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localConversationGroups = (
      JSON.parse(localConversationGroupsStr) as Record<string, unknown>[]
    ).map(group => {
      return convertToSnakeCaseObject(group) as LocalConversationGroup;
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
  localConversationGroupsStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localConversationGroups = (
      JSON.parse(localConversationGroupsStr) as Record<string, unknown>[]
    ).map(group => {
      return convertToSnakeCaseObject(group) as LocalConversationGroup;
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
  localConversationGroupStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localConversationGroup = convertToSnakeCaseObject(
      JSON.parse(localConversationGroupStr)
    ) as LocalConversationGroup;

    databaseUpdateConversationGroup(db, localConversationGroup);
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
  groupID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databaseDeleteConversationGroup(db, groupID);

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

export async function deleteAllConversationGroups(): Promise<string> {
  try {
    const db = await getInstance();

    databaseDeleteAllConversationGroups(db);

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

export async function getConversationGroup(groupID: string): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetConversationGroup(db, groupID);
    const result = converSqlExecResult(execResult[0], 'CamelCase', ['hidden']);

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
  groupIDsStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const groupIDs = JSON.parse(groupIDsStr) as string[];

    const execResult = databaseGetConversationGroups(db, groupIDs);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', ['hidden'])
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

export async function getAllConversationGroups(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetAllConversationGroups(db);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', ['hidden'])
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

export async function updateConversationGroupSerial(
  groupID: string,
  serial: number
): Promise<string> {
  try {
    const db = await getInstance();

    databaseUpdateConversationGroupSerial(db, groupID, serial);
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

export async function addConversationGroupMembers(
  conversationID: string,
  groupIDsStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const groupIDs = JSON.parse(groupIDsStr) as string[];

    databaseAddConversationGroupMembers(db, conversationID, groupIDs);

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
  groupIDsStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const groupIDs = JSON.parse(groupIDsStr) as string[];

    databaseRemoveConversationGroupMembers(db, conversationID, groupIDs);

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
  conversationID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetConversationGroupIDsByConversationID(
      db,
      conversationID
    );
    const result = converSqlExecResult(execResult[0], 'CamelCase') as {
      conversationGroupID: string;
    }[];
    const groupIDs = result.map(item => item.conversationGroupID);

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
  groupID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetConversationIDsByGroupID(db, groupID);
    const result = converSqlExecResult(execResult[0], 'CamelCase') as {
      conversationID: string;
    }[];
    const conversationIDs = result.map(item => item.conversationID);

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
  groupID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databaseDeleteConversationGroupMembersByGroupID(db, groupID);

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
