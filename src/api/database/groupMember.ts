import { DatabaseErrorCode } from '@/constant';
import {
  LocalGroupMember,
  getGroupMemberInfoByGroupIDUserID as databaseGetGroupMemberInfoByGroupIDUserID,
  getAllGroupMemberList as databaseGetAllGroupMemberList,
  getAllGroupMemberUserIDList as databaseGetAllGroupMemberUserIDList,
  getGroupMemberCount as databaseGetGroupMemberCount,
  getGroupSomeMemberInfo as databaseGetGroupSomeMemberInfo,
  getGroupAdminID as databaseGetGroupAdminID,
  getGroupMemberListByGroupID as databaseGetGroupMemberListByGroupID,
  getGroupMemberListSplit as databaseGetGroupMemberListSplit,
  getGroupMemberOwnerAndAdmin as databaseGetGroupMemberOwnerAndAdmin,
  getGroupMemberOwner as databaseGetGroupMemberOwner,
  getGroupMemberListSplitByJoinTimeFilter as databaseGetGroupMemberListSplitByJoinTimeFilter,
  getGroupOwnerAndAdminByGroupID as databaseGetGroupOwnerAndAdminByGroupID,
  getGroupMemberUIDListByGroupID as databaseGetGroupMemberUIDListByGroupID,
  insertGroupMember as databaseInsertGroupMember,
  batchInsertGroupMember as databaseBatchInsertGroupMember,
  deleteGroupMember as databaseDeleteGroupMember,
  deleteGroupAllMembers as databaseDeleteGroupAllMembers,
  updateGroupMember as databaseUpdateGroupMember,
  updateGroupMemberField as databaseUpdateGroupMemberField,
  searchGroupMembers as databaseSearchGroupMembers,
  getUserJoinedGroupIDs as databaseGetUserJoinedGroupIDs,
  getGroupMemberListByUserIDs as databaseGetGroupMemberListByUserIDs,
} from '@/sqls';
import {
  converSqlExecResult,
  convertObjectField,
  convertToSnakeCaseObject,
  formatResponse,
} from '@/utils';
import { getInstance } from './instance';

export async function getGroupMemberInfoByGroupIDUserID(
  groupID: string,
  userID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetGroupMemberInfoByGroupIDUserID(
      db,
      groupID,
      userID
    );

    if (execResult.length === 0) {
      return formatResponse(
        '',
        DatabaseErrorCode.RecordNotFound,
        `no group member with groupID ${groupID} and userID ${userID}`
      );
    }

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [], {
        user_group_face_url: 'faceURL',
      })[0]
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getAllGroupMemberList(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetAllGroupMemberList(db);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [], {
        user_group_face_url: 'faceURL',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getAllGroupMemberUserIDList(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetAllGroupMemberUserIDList(db);

    return formatResponse(converSqlExecResult(execResult[0], 'CamelCase'));
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getGroupMemberCount(groupID: string): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetGroupMemberCount(db, groupID);

    return formatResponse(execResult[0]?.values[0]?.[0]);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getGroupSomeMemberInfo(
  groupID: string,
  userIDListStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetGroupSomeMemberInfo(
      db,
      groupID,
      JSON.parse(userIDListStr)
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [], {
        user_group_face_url: 'faceURL',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getGroupAdminID(groupID: string): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetGroupAdminID(db, groupID);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase').map(
        member => member.userID
      )
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getGroupMemberListByGroupID(
  groupID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetGroupMemberListByGroupID(db, groupID);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [], {
        user_group_face_url: 'faceURL',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getGroupMemberListSplit(
  groupID: string,
  filter: number,
  offset: number,
  count: number
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetGroupMemberListSplit(
      db,
      groupID,
      filter,
      offset,
      count
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [], {
        user_group_face_url: 'faceURL',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getGroupMemberListByUserIDs(
  groupID: string,
  filter: number,
  userIDs: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetGroupMemberListByUserIDs(
      db,
      groupID,
      filter,
      JSON.parse(userIDs)
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [], {
        user_group_face_url: 'faceURL',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getGroupMemberOwnerAndAdmin(
  groupID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetGroupMemberOwnerAndAdmin(db, groupID);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [], {
        user_group_face_url: 'faceURL',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getGroupMemberOwner(groupID: string): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetGroupMemberOwner(db, groupID);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [], {
        user_group_face_url: 'faceURL',
      })[0]
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getGroupMemberListSplitByJoinTimeFilter(
  groupID: string,
  offset: number,
  count: number,
  joinTimeBegin = 0,
  joinTimeEnd = 100000000000,
  userIDListStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetGroupMemberListSplitByJoinTimeFilter(
      db,
      groupID,
      offset,
      count,
      joinTimeBegin,
      joinTimeEnd,
      JSON.parse(userIDListStr)
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [], {
        user_group_face_url: 'faceURL',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getGroupOwnerAndAdminByGroupID(
  groupID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetGroupOwnerAndAdminByGroupID(db, groupID);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [], {
        user_group_face_url: 'faceURL',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getGroupMemberUIDListByGroupID(
  groupID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetGroupMemberUIDListByGroupID(db, groupID);
    const userIDList = converSqlExecResult(execResult[0], 'CamelCase');

    return formatResponse(userIDList.map(item => item.userID));
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function insertGroupMember(
  localGroupMemberStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localGroup = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(localGroupMemberStr), {
        faceURL: 'user_group_face_url',
      })
    ) as LocalGroupMember;

    databaseInsertGroupMember(db, localGroup);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function batchInsertGroupMember(
  localGroupMemberStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localGroupList = (
      (JSON.parse(localGroupMemberStr) || []) as LocalGroupMember[]
    ).map((v: Record<string, unknown>) =>
      convertToSnakeCaseObject(
        convertObjectField(v, {
          faceURL: 'user_group_face_url',
        })
      )
    );

    databaseBatchInsertGroupMember(db, localGroupList);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function deleteGroupMember(
  groupID: string,
  userID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databaseDeleteGroupMember(db, groupID, userID);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function deleteGroupAllMembers(groupID: string): Promise<string> {
  try {
    const db = await getInstance();

    databaseDeleteGroupAllMembers(db, groupID);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function updateGroupMember(
  localGroupMemberStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localGroupMember = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(localGroupMemberStr), {
        faceURL: 'user_group_face_url',
      })
    ) as LocalGroupMember;

    databaseUpdateGroupMember(db, localGroupMember);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function updateGroupMemberField(
  groupID: string,
  userID: string,
  localGroupMemberStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localGroupMember = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(localGroupMemberStr), {
        faceURL: 'user_group_face_url',
      })
    ) as LocalGroupMember;

    databaseUpdateGroupMemberField(db, groupID, userID, localGroupMember);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function searchGroupMembers(
  keyword: string,
  groupID: string,
  isSearchMemberNickname: boolean,
  isSearchUserID: boolean,
  offset: number,
  count: number
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseSearchGroupMembers(
      db,
      keyword,
      groupID,
      isSearchMemberNickname,
      isSearchUserID,
      offset,
      count
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', [], {
        user_group_face_url: 'faceURL',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getUserJoinedGroupIDs(userID: string): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetUserJoinedGroupIDs(db, userID);
    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase').map(item => item.groupID)
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}
