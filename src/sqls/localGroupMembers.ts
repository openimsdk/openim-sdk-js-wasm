import squel from 'squel';
import { Database, QueryExecResult } from '@jlongster/sql.js';
import { execPreparedQuery } from '@/utils';
import { GroupMemberRole } from '@/types/enum';

export type LocalGroupMember = { [key: string]: any };

export function localGroupMembers(db: Database): QueryExecResult[] {
  return db.exec(
    `
      create table if not exists 'local_group_members' (
        'group_id' varchar(64),
        'user_id' varchar(64),
        'nickname' varchar(255),
        'user_group_face_url' varchar(255),
        'role_level' integer,
        'join_time' integer,
        'join_source' integer,
        'inviter_user_id' text,
        'mute_end_time' integer DEFAULT 0,
        'operator_user_id' varchar(64),
        'ex' varchar(1024),
        'attached_info' varchar(1024),
        PRIMARY KEY ('group_id', 'user_id')
    ) 
      `
  );
}

export function getGroupMemberInfoByGroupIDUserID(
  db: Database,
  groupID: string,
  userID: string
): QueryExecResult[] {
  return db.exec(
    `
      select *
      from local_group_members
      WHERE group_id = "${groupID}" 
      AND user_id = "${userID}" 
      LIMIT 1
      `
  );
}

export function getAllGroupMemberList(db: Database): QueryExecResult[] {
  return db.exec(
    `
    SELECT *
    FROM local_group_members
      `
  );
}

export function getAllGroupMemberUserIDList(db: Database): QueryExecResult[] {
  return db.exec(
    `
      SELECT user_id
      FROM local_group_members
        `
  );
}

export function getGroupMemberCount(
  db: Database,
  groupID: string
): QueryExecResult[] {
  return db.exec(
    `
    SELECT count(*) FROM local_group_members 
    WHERE group_id = "${groupID}" 
      `
  );
}

export function getGroupSomeMemberInfo(
  db: Database,
  groupID: string,
  userIDList: string[]
): QueryExecResult[] {
  const ids = userIDList.map(v => `'${v}'`);
  return db.exec(
    `
    select *
    from local_group_members
    where group_id = "${groupID}"
    and user_id in (${ids.join(',')})
      `
  );
}

export function getGroupAdminID(
  db: Database,
  groupID: string
): QueryExecResult[] {
  return db.exec(
    `SELECT user_id
       FROM local_group_members
      WHERE group_id = ?
        AND role_level = ?`,
    [groupID, GroupMemberRole.Admin]
  );
}

export function getGroupMemberListByGroupID(
  db: Database,
  groupID: string
): QueryExecResult[] {
  return db.exec(
    `
      SELECT * FROM local_group_members 
      WHERE group_id = "${groupID}" 
        `
  );
}

export function getGroupMemberListSplit(
  db: Database,
  groupID: string,
  filter: number,
  offset: number,
  count: number
): QueryExecResult[] {
  let condition = `
    SELECT * FROM local_group_members 
        WHERE group_id = "${groupID}" 
        ORDER BY role_level DESC,join_time ASC 
    LIMIT ${count} OFFSET ${offset}
    `;
  if (filter === 1) {
    condition = `
        SELECT * FROM local_group_members 
            WHERE group_id = "${groupID}" 
            And role_level = 100 
        LIMIT ${count} OFFSET ${offset}
        `;
  }
  if (filter === 2) {
    condition = `
        SELECT * FROM local_group_members 
            WHERE group_id = "${groupID}" 
            And role_level = 60 
        ORDER BY join_time ASC 
        LIMIT ${count} OFFSET ${offset}
        `;
  }
  if (filter === 3) {
    condition = `
        SELECT * FROM local_group_members 
            WHERE group_id = "${groupID}" 
            And role_level = 20 
        ORDER BY join_time ASC 
        LIMIT ${count} OFFSET ${offset}
        `;
  }
  if (filter === 4) {
    condition = `
        SELECT * FROM local_group_members 
            WHERE group_id = "${groupID}" 
            And ( role_level = 20 OR role_level = 60 )  
        ORDER BY role_level DESC,join_time ASC 
        LIMIT ${count} OFFSET ${offset}
        `;
  }
  if (filter === 5) {
    condition = `
        SELECT * FROM local_group_members 
            WHERE group_id = "${groupID}" 
            And ( role_level = 100 OR role_level = 60 )  
        ORDER BY role_level DESC,join_time ASC 
        LIMIT ${count} OFFSET ${offset}
        `;
  }
  return db.exec(condition);
}

export function getGroupMemberListByUserIDs(
  db: Database,
  groupID: string,
  filter: number,
  userIDs: string[]
): QueryExecResult[] {
  const ids = userIDs.map(v => `'${v}'`);
  let condition = `
    SELECT * FROM local_group_members 
        WHERE group_id = "${groupID}" 
        And user_id IN (${ids.join(',')})
        ORDER BY role_level DESC,join_time ASC 
    `;
  if (filter === 1) {
    condition = `
        SELECT * FROM local_group_members 
            WHERE group_id = "${groupID}" 
            And role_level = 100 
            And user_id IN (${ids.join(',')})
        `;
  }
  if (filter === 2) {
    condition = `
        SELECT * FROM local_group_members 
            WHERE group_id = "${groupID}" 
            And role_level = 60 
            And user_id IN (${ids.join(',')})
        ORDER BY join_time ASC 
        `;
  }
  if (filter === 3) {
    condition = `
        SELECT * FROM local_group_members 
            WHERE group_id = "${groupID}" 
            And role_level = 20 
            And user_id IN (${ids.join(',')})
        ORDER BY join_time ASC 
        `;
  }
  if (filter === 4) {
    condition = `
        SELECT * FROM local_group_members 
            WHERE group_id = "${groupID}" 
            And ( role_level = 20 OR role_level = 60 )  
            And user_id IN (${ids.join(',')})
        ORDER BY role_level DESC,join_time ASC 
        `;
  }
  if (filter === 5) {
    condition = `
        SELECT * FROM local_group_members 
            WHERE group_id = "${groupID}" 
            And ( role_level = 100 OR role_level = 60 )  
            And user_id IN (${ids.join(',')})
        ORDER BY role_level DESC,join_time ASC 
        `;
  }
  return db.exec(condition);
}

export function getGroupMemberOwnerAndAdmin(
  db: Database,
  groupID: string
): QueryExecResult[] {
  return db.exec(
    `SELECT *
       FROM local_group_members
      WHERE group_id = ?
        AND role_level IN (?, ?)
      ORDER BY join_time DESC`,
    [groupID, GroupMemberRole.Owner, GroupMemberRole.Admin]
  );
}

export function getGroupMemberOwner(
  db: Database,
  groupID: string
): QueryExecResult[] {
  return db.exec(
    `SELECT *
       FROM local_group_members
      WHERE group_id = ?
        AND role_level = ?`,
    [groupID, GroupMemberRole.Owner]
  );
}

export function getGroupMemberListSplitByJoinTimeFilter(
  db: Database,
  groupID: string,
  offset: number,
  count: number,
  joinTimeBegin = 0,
  joinTimeEnd = 100000000000,
  userIDList: string[]
): QueryExecResult[] {
  let condition = '';
  if (userIDList.length === 0) {
    condition = `
        SELECT * FROM local_group_members 
            WHERE group_id = "${groupID}" 
            And join_time  between ${joinTimeBegin} and ${joinTimeEnd}  
            ORDER BY join_time DESC 
            LIMIT ${count} OFFSET ${offset}
        `;
  } else {
    const ids = userIDList.map(v => `'${v}'`);
    condition = `
        SELECT * FROM local_group_members 
        WHERE group_id = "${groupID}" 
        And join_time  between ${joinTimeBegin} and ${joinTimeEnd}  
        And user_id NOT IN (${ids.join(',')})
        ORDER BY join_time DESC 
        LIMIT ${count} OFFSET ${offset}
        `;
  }

  return db.exec(condition);
}

export function getGroupOwnerAndAdminByGroupID(
  db: Database,
  groupID: string
): QueryExecResult[] {
  return db.exec(
    `SELECT *
       FROM local_group_members
      WHERE group_id = ?
        AND role_level IN (?, ?)
      ORDER BY join_time DESC`,
    [groupID, GroupMemberRole.Owner, GroupMemberRole.Admin]
  );
}

export function getGroupMemberUIDListByGroupID(
  db: Database,
  groupID: string
): QueryExecResult[] {
  return db.exec(
    `
      SELECT user_id FROM local_group_members 
      WHERE group_id = "${groupID}" 
        `
  );
}

export function insertGroupMember(
  db: Database,
  localGroupMember: LocalGroupMember
): QueryExecResult[] {
  const sql = squel
    .insert()
    .into('local_group_members')
    .setFields(localGroupMember)
    .toString();

  return db.exec(sql);
}

export function batchInsertGroupMember(
  db: Database,
  localGroupMember: LocalGroupMember[]
): QueryExecResult[] {
  const sql = squel
    .insert()
    .into('local_group_members')
    .setFieldsRows(localGroupMember)
    .toString();

  return db.exec(sql);
}

export function deleteGroupMember(
  db: Database,
  groupID: string,
  userID: string
): QueryExecResult[] {
  return db.exec(
    `
    DELETE FROM local_group_members 
    WHERE group_id="${groupID}" 
    and user_id="${userID}"
      `
  );
}

export function deleteGroupAllMembers(
  db: Database,
  groupID: string
): QueryExecResult[] {
  return db.exec(
    `
      DELETE FROM local_group_members 
      WHERE group_id="${groupID}"
        `
  );
}

export function updateGroupMember(
  db: Database,
  localGroupMember: LocalGroupMember
): QueryExecResult[] {
  const sql = squel
    .update()
    .table('local_group_members')
    .setFields(localGroupMember)
    .where(
      `group_id = '${localGroupMember.group_id}' and user_id = '${localGroupMember.user_id}'`
    )
    .toString();

  return db.exec(sql);
}

export function updateGroupMemberField(
  db: Database,
  groupID: string,
  userID: string,
  localGroupMember: LocalGroupMember
): QueryExecResult[] {
  const sql = squel
    .update()
    .table('local_group_members')
    .setFields(localGroupMember)
    .where(`group_id = '${groupID}' and user_id = '${userID}'`)
    .toString();

  return db.exec(sql);
}

export function searchGroupMembers(
  db: Database,
  keyword: string,
  groupID: string,
  isSearchMemberNickname: boolean,
  isSearchUserID: boolean,
  offset: number,
  count: number
): QueryExecResult[] {
  if (!isSearchMemberNickname && !isSearchUserID) {
    throw new Error(
      'isSearchMemberNickname and isSearchUserID cannot both be false'
    );
  }

  const where: string[] = [];
  const bindings: Array<string | number> = [];
  const keywordPattern = `%${keyword}%`;

  if (isSearchMemberNickname && isSearchUserID) {
    where.push('(user_id LIKE ? OR nickname LIKE ?)');
    bindings.push(keywordPattern, keywordPattern);
  } else if (isSearchUserID) {
    where.push('user_id LIKE ?');
    bindings.push(keywordPattern);
  } else {
    where.push('nickname LIKE ?');
    bindings.push(keywordPattern);
  }

  if (groupID) {
    where.push('group_id = ?');
    bindings.push(groupID);
  }

  return execPreparedQuery(
    db,
    `
      SELECT * FROM local_group_members
      WHERE ${where.join(' AND ')}
      ORDER BY role_level DESC, join_time ASC
      LIMIT ? OFFSET ?
    `,
    [...bindings, count, offset]
  );
}

export function getUserJoinedGroupIDs(
  db: Database,
  userID: string
): QueryExecResult[] {
  return db.exec(
    `
    select group_id from local_group_members where user_id = "${userID}";
    `
  );
}
