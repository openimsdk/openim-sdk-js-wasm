import squel from 'squel';
import { Database, QueryExecResult } from '@jlongster/sql.js';
import { execPreparedQuery } from '@/utils';

export type LocalFriend = { [key: string]: any };

export function localFriends(db: Database): QueryExecResult[] {
  return db.exec(
    `
      create table if not exists 'local_friends'
      (
          'owner_user_id'    varchar(64),
          'friend_user_id'   varchar(64),
          'remark'           varchar(255),
          'create_time'      INTEGER,
          'add_source'       INTEGER,
          'operator_user_id' varchar(64),
          'name'             varchar(255),
          'face_url'         varchar(255),
          'ex'               varchar(1024),
          'attached_info'    varchar(1024),
          'is_pinned'        numeric,
          primary key ('owner_user_id', 'friend_user_id')
      )       
      `
  );
}

export function insertFriend(
  db: Database,
  localFriend: LocalFriend
): QueryExecResult[] {
  const sql = squel
    .insert()
    .into('local_friends')
    .setFields(localFriend)
    .toString();

  return db.exec(sql);
}

export function deleteFriend(
  db: Database,
  friendUserID: string,
  loginUserID: string
): QueryExecResult[] {
  return db.exec(
    `
    DELETE FROM local_friends 
          WHERE owner_user_id="${loginUserID}" 
          and friend_user_id="${friendUserID}"
        `
  );
}
export function updateFriend(
  db: Database,
  localFriend: LocalFriend
): QueryExecResult[] {
  const sql = squel
    .update()
    .table('local_friends')
    .setFields(localFriend)
    .where(
      `owner_user_id = '${localFriend.owner_user_id}' and friend_user_id = '${localFriend.friend_user_id}'`
    )
    .toString();

  return db.exec(sql);
}

export function getAllFriendList(
  db: Database,
  loginUser: string
): QueryExecResult[] {
  return db.exec(
    `
      select *
        from local_friends
        where owner_user_id = "${loginUser}"
        `
  );
}

export function getPageFriendList(
  db: Database,
  offset: number,
  count: number,
  loginUser: string
): QueryExecResult[] {
  return db.exec(
    `
      select *
        from local_friends
        where owner_user_id = "${loginUser}"
        order by name
        limit ${count} offset ${offset}
        `
  );
}

export function searchFriendList(
  db: Database,
  keyword: string,
  isSearchUserID: boolean,
  isSearchNickname: boolean,
  isSearchRemark: boolean
): QueryExecResult[] {
  const conditions: string[] = [];
  const bindings: string[] = [];
  const keywordPattern = `%${keyword}%`;
  if (isSearchUserID) {
    conditions.push('friend_user_id LIKE ?');
    bindings.push(keywordPattern);
  }
  if (isSearchNickname) {
    conditions.push('name LIKE ?');
    bindings.push(keywordPattern);
  }
  if (isSearchRemark) {
    conditions.push('remark LIKE ?');
    bindings.push(keywordPattern);
  }

  const where =
    conditions.length > 0 ? `WHERE (${conditions.join(' OR ')})` : '';
  return execPreparedQuery(
    db,
    `
      SELECT *
      FROM local_friends
      ${where}
      ORDER BY create_time DESC
    `,
    bindings
  );
}

export function getFriendInfoByFriendUserID(
  db: Database,
  friendUserID: string,
  loginUser: string
): QueryExecResult[] {
  return db.exec(
    `
      select *
        from local_friends
        where owner_user_id = "${loginUser}"
         and friend_user_id = "${friendUserID}"
        limit 1
        `
  );
}

export function getFriendInfoList(
  db: Database,
  friendUserIDList: string[]
): QueryExecResult[] {
  const values = friendUserIDList.map(v => `'${v}'`).join(',');
  return db.exec(
    `
      select *
        from local_friends
        where friend_user_id in (${values})
        `
  );
}

export function updateColumnsFriend(
  db: Database,
  friendUserIDs: string[],
  localFriend: LocalFriend
): QueryExecResult[] {
  const values = friendUserIDs.map(v => `'${v}'`).join(',');
  const sql = squel
    .update()
    .table('local_friends')
    .setFields(localFriend)
    .where(`friend_user_id IN (${values})`)
    .toString();

  return db.exec(sql);
}

export function getFriendListCount(db: Database): QueryExecResult[] {
  return db.exec(
    `
      SELECT COUNT(*) FROM local_friends;
      `
  );
}

export function deleteAllFriend(db: Database): QueryExecResult[] {
  return db.exec(
    `
      DELETE FROM local_friends;
      `
  );
}
