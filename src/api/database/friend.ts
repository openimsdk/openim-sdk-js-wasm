import { DatabaseErrorCode } from '@/constant';
import {
  insertFriend as databaseInsertFriend,
  deleteFriend as databasedeleteFriend,
  updateFriend as databaseupdateFriend,
  updateColumnsFriend as databaseupdateColumnsFriend,
  getAllFriendList as databaseGetAllFriendList,
  getPageFriendList as databaseGetPageFriendList,
  searchFriendList as databasesearchFriendList,
  getFriendInfoByFriendUserID as databaseGetFriendInfoByFriendUserID,
  getFriendInfoList as databaseGetFriendInfoList,
  getFriendListCount as databaseGetFriendListCount,
  deleteAllFriend as databaseDeleteAllFriend,
  LocalFriend,
} from '@/sqls';
import {
  converSqlExecResult,
  convertObjectField,
  convertToSnakeCaseObject,
  formatResponse,
} from '@/utils';
import { getInstance } from './instance';

export async function insertFriend(localFriendStr: string): Promise<string> {
  try {
    const db = await getInstance();
    const localFriend = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(localFriendStr), {
        userID: 'friend_user_id',
        nickname: 'name',
      })
    ) as LocalFriend;

    databaseInsertFriend(db, localFriend);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function deleteFriend(
  friendUserID: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    databasedeleteFriend(db, friendUserID, loginUserID);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function updateFriend(localFriendStr: string): Promise<string> {
  try {
    const db = await getInstance();
    const localFriend = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(localFriendStr), {
        userID: 'friend_user_id',
        nickname: 'name',
      })
    ) as LocalFriend;

    databaseupdateFriend(db, localFriend);
    if (db.getRowsModified() === 0) {
      throw new Error('updateFriend no record updated');
    }

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getAllFriendList(loginUserID: string): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetAllFriendList(db, loginUserID);

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', ['isPinned'], {
        name: 'nickname',
        friend_user_id: 'userID',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getPageFriendList(
  offset: number,
  count: number,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetPageFriendList(
      db,
      offset,
      count,
      loginUserID
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', ['isPinned'], {
        name: 'nickname',
        friend_user_id: 'userID',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function searchFriendList(
  key: string,
  isSearchUserID: boolean,
  isSearchNickname: boolean,
  isSearchRemark: boolean
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databasesearchFriendList(
      db,
      key,
      isSearchUserID,
      isSearchNickname,
      isSearchRemark
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', ['isPinned'], {
        name: 'nickname',
        friend_user_id: 'userID',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getFriendInfoByFriendUserID(
  friendUserID: string,
  loginUserID: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetFriendInfoByFriendUserID(
      db,
      friendUserID,
      loginUserID
    );

    if (execResult.length === 0) {
      return formatResponse(
        '',
        DatabaseErrorCode.RecordNotFound,
        `no friend with id ${friendUserID}`
      );
    }

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', ['isPinned'], {
        name: 'nickname',
        friend_user_id: 'userID',
      })[0]
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getFriendInfoList(
  friendUserIDListStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetFriendInfoList(
      db,
      JSON.parse(friendUserIDListStr)
    );

    return formatResponse(
      converSqlExecResult(execResult[0], 'CamelCase', ['isPinned'], {
        name: 'nickname',
        friend_user_id: 'userID',
      })
    );
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function updateColumnsFriend(
  friendUserIDListStr: string,
  localFriendStr: string
): Promise<string> {
  try {
    const db = await getInstance();
    const localFriend = convertToSnakeCaseObject(
      convertObjectField(JSON.parse(localFriendStr), {
        userID: 'friend_user_id',
        nickname: 'name',
      })
    ) as LocalFriend;

    databaseupdateColumnsFriend(
      db,
      JSON.parse(friendUserIDListStr),
      localFriend
    );

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function getFriendListCount(): Promise<string> {
  try {
    const db = await getInstance();

    const execResult = databaseGetFriendListCount(db);

    return formatResponse(execResult[0]?.values[0]?.[0] ?? 0);
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function batchInsertFriend(
  localFriendListStr: string
): Promise<string> {
  try {
    const db = await getInstance();

    const list = JSON.parse(localFriendListStr) as LocalFriend[];

    list.map(item => {
      const localFriend = convertToSnakeCaseObject(
        convertObjectField(item, {
          userID: 'friend_user_id',
          nickname: 'name',
        })
      ) as LocalFriend;
      databaseInsertFriend(db, localFriend);

      return null;
    });

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}

export async function deleteAllFriend(): Promise<string> {
  try {
    const db = await getInstance();

    databaseDeleteAllFriend(db);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(undefined, DatabaseErrorCode.InitializationFailed, e);
  }
}
