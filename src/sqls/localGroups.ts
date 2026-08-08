import squel from 'squel';
import { Database, QueryExecResult } from '@jlongster/sql.js';
import { execPreparedQuery } from '@/utils';

export type LocalGroup = { [key: string]: any };

export function localGroups(db: Database): QueryExecResult[] {
  return db.exec(
    `
      create table if not exists 'local_groups'
      (
          'group_id'                 varchar(64) PRIMARY KEY,
          'name'                  TEXT,
          'notification'            varchar(255),
          'introduction'            varchar(255),
          'face_url'           varchar(255),
          'create_time'             INTEGER,
          'status'              INTEGER,
          'creator_user_id'      varchar(64),
          'group_type'              INTEGER,
          'owner_user_id'          varchar(64),
          'member_count'            INTEGER,
          'ex'                   varchar(1024),
          'attached_info'           varchar(1024),
          'need_verification'     INTEGER,
          'look_member_info'     INTEGER,
          'apply_member_friend'      INTEGER,
          'notification_update_time' INTEGER,
          'notification_user_id'   TEXT,
          'display_is_read'        numeric
      )  
      `
  );
}

export function insertGroup(
  db: Database,
  localGroup: LocalGroup
): QueryExecResult[] {
  const sql = squel
    .insert()
    .into('local_groups')
    .setFields(localGroup)
    .toString();

  return db.exec(sql);
}

export function deleteGroup(db: Database, groupID: string): QueryExecResult[] {
  return db.exec(
    `
    DELETE FROM local_groups 
          WHERE group_id="${groupID}" 
        `
  );
}

export function updateGroup(
  db: Database,
  groupID: string,
  localGroup: LocalGroup
): QueryExecResult[] {
  const sql = squel
    .update()
    .table('local_groups')
    .setFields(localGroup)
    .where(`group_id = '${groupID}'`)
    .toString();

  return db.exec(sql);
}

export function getJoinedGroupList(db: Database): QueryExecResult[] {
  return db.exec(
    `
    SELECT * FROM local_groups
    `
  );
}

export function getGroupInfoByGroupID(
  db: Database,
  groupID: string
): QueryExecResult[] {
  return db.exec(
    `
    SELECT *
      FROM local_groups
      WHERE group_id = "${groupID}"
    `
  );
}

export function getAllGroupInfoByGroupIDOrGroupName(
  db: Database,
  keyword: string,
  isSearchGroupID: boolean,
  isSearchGroupName: boolean
): QueryExecResult[] {
  const keywordPattern = `%${keyword}%`;
  let condition = 'name LIKE ?';
  let bindings = [keywordPattern];
  if (isSearchGroupID && isSearchGroupName) {
    condition = '(group_id LIKE ? OR name LIKE ?)';
    bindings = [keywordPattern, keywordPattern];
  } else if (isSearchGroupID) {
    condition = 'group_id LIKE ?';
  }

  return execPreparedQuery(
    db,
    `
      SELECT *
      FROM local_groups
      WHERE ${condition}
      ORDER BY create_time DESC
    `,
    bindings
  );
}

export function subtractMemberCount(
  db: Database,
  groupID: string
): QueryExecResult[] {
  return db.exec(
    `  
    update local_groups set member_count = member_count-1 where group_id = '${groupID}'
    `
  );
}

export function addMemberCount(
  db: Database,
  groupID: string
): QueryExecResult[] {
  return db.exec(
    `  
    update local_groups set member_count = member_count+1 where group_id = '${groupID}'   
    `
  );
}

export function getGroupMemberAllGroupIDs(db: Database): QueryExecResult[] {
  return db.exec(
    `
    select distinct group_id from local_group_members
    `
  );
}

export function getGroups(db: Database, groupIDs: string[]): QueryExecResult[] {
  const values = groupIDs.map(v => `'${v}'`).join(',');
  return db.exec(
    `
    select * from local_groups where group_id in (${values});
    `
  );
}

export function deleteAllGroup(db: Database): QueryExecResult[] {
  return db.exec(
    `
    DELETE FROM local_groups;
    `
  );
}
