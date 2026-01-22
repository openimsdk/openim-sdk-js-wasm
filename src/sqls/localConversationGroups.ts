import squel from 'squel';
import { Database, QueryExecResult } from '@jlongster/sql.js';

export type LocalConversationGroup = { [key: string]: unknown };
export type LocalConversationGroupMember = { [key: string]: unknown };

// ==================== local_conversation_groups 表 ====================

export function localConversationGroups(db: Database): QueryExecResult[] {
  return db.exec(
    `
    CREATE TABLE IF NOT EXISTS 'local_conversation_groups' (
      'group_id' varchar(64),
      'owner_user_id' varchar(64),
      'name' varchar(255),
      'serial' INTEGER,
      'version' INTEGER,
      'ex' varchar(1024),
      PRIMARY KEY ('group_id', 'owner_user_id')
    )
    `
  );
}

export function insertConversationGroup(
  db: Database,
  localConversationGroup: LocalConversationGroup
): QueryExecResult[] {
  const sql = squel
    .insert()
    .into('local_conversation_groups')
    .setFields(localConversationGroup)
    .toString();

  return db.exec(sql);
}

export function batchInsertConversationGroups(
  db: Database,
  localConversationGroups: LocalConversationGroup[]
): QueryExecResult[] {
  if (localConversationGroups.length === 0) {
    return [];
  }

  let sql = squel.insert().into('local_conversation_groups');
  localConversationGroups.forEach(group => {
    sql = sql.setFieldsRows([group]);
  });

  return db.exec(sql.toString());
}

export function upsertConversationGroups(
  db: Database,
  localConversationGroups: LocalConversationGroup[]
): QueryExecResult[] {
  if (localConversationGroups.length === 0) {
    return [];
  }

  const results: QueryExecResult[] = [];
  localConversationGroups.forEach(group => {
    const sql = `
      INSERT INTO local_conversation_groups (group_id, owner_user_id, name, serial, version, ex)
      VALUES ('${group.group_id}', '${group.owner_user_id}', '${group.name}', ${
      group.serial
    }, ${group.version}, '${group.ex || ''}')
      ON CONFLICT (group_id, owner_user_id) DO UPDATE SET
        name = excluded.name,
        serial = excluded.serial,
        version = excluded.version,
        ex = excluded.ex
    `;
    results.push(...db.exec(sql));
  });

  return results;
}

export function updateConversationGroup(
  db: Database,
  localConversationGroup: LocalConversationGroup
): QueryExecResult[] {
  const sql = squel
    .update()
    .table('local_conversation_groups')
    .setFields(localConversationGroup)
    .where(
      `owner_user_id = '${localConversationGroup.owner_user_id}' AND group_id = '${localConversationGroup.group_id}'`
    )
    .toString();

  return db.exec(sql);
}

export function deleteConversationGroup(
  db: Database,
  groupID: string,
  ownerUserID: string
): QueryExecResult[] {
  return db.exec(
    `
    DELETE FROM local_conversation_groups
    WHERE owner_user_id = "${ownerUserID}"
      AND group_id = "${groupID}"
    `
  );
}

export function getConversationGroup(
  db: Database,
  groupID: string,
  ownerUserID: string
): QueryExecResult[] {
  return db.exec(
    `
    SELECT *
    FROM local_conversation_groups
    WHERE owner_user_id = "${ownerUserID}"
      AND group_id = "${groupID}"
    LIMIT 1
    `
  );
}

export function getConversationGroups(
  db: Database,
  groupIDs: string[],
  ownerUserID: string
): QueryExecResult[] {
  const ids = groupIDs.map(v => `'${v}'`);
  return db.exec(
    `
    SELECT *
    FROM local_conversation_groups
    WHERE owner_user_id = "${ownerUserID}"
      AND group_id IN (${ids.join(',')})
    `
  );
}

export function getAllConversationGroups(
  db: Database,
  ownerUserID: string
): QueryExecResult[] {
  return db.exec(
    `
    SELECT *
    FROM local_conversation_groups
    WHERE owner_user_id = "${ownerUserID}"
    `
  );
}

export function updateConversationGroupSerial(
  db: Database,
  groupID: string,
  serial: number,
  ownerUserID: string
): QueryExecResult[] {
  return db.exec(
    `
    UPDATE local_conversation_groups
    SET serial = ${serial}
    WHERE owner_user_id = "${ownerUserID}"
      AND group_id = "${groupID}"
    `
  );
}

// ==================== local_conversation_group_members 表 ====================

export function localConversationGroupMembers(db: Database): QueryExecResult[] {
  return db.exec(
    `
    CREATE TABLE IF NOT EXISTS 'local_conversation_group_members' (
      'conversation_id' char(128),
      'group_id' varchar(64),
      'owner_user_id' varchar(64),
      PRIMARY KEY ('conversation_id', 'group_id', 'owner_user_id')
    )
    `
  );
}

export function replaceConversationGroupMembers(
  db: Database,
  conversationID: string,
  groupIDs: string[],
  ownerUserID: string
): QueryExecResult[] {
  // 先删除该会话的所有关联
  db.exec(
    `
    DELETE FROM local_conversation_group_members
    WHERE owner_user_id = "${ownerUserID}"
      AND conversation_id = "${conversationID}"
    `
  );

  // 如果没有新的关联则直接返回
  if (groupIDs.length === 0) {
    return [];
  }

  // 批量插入新的关联
  const values = groupIDs
    .map(groupID => `("${conversationID}", "${groupID}", "${ownerUserID}")`)
    .join(', ');

  return db.exec(
    `
    INSERT INTO local_conversation_group_members (conversation_id, group_id, owner_user_id)
    VALUES ${values}
    `
  );
}

export function addConversationGroupMembers(
  db: Database,
  conversationID: string,
  groupIDs: string[],
  ownerUserID: string
): QueryExecResult[] {
  if (groupIDs.length === 0) {
    return [];
  }

  const values = groupIDs
    .map(groupID => `("${conversationID}", "${groupID}", "${ownerUserID}")`)
    .join(', ');

  return db.exec(
    `
    INSERT INTO local_conversation_group_members (conversation_id, group_id, owner_user_id)
    VALUES ${values}
    ON CONFLICT DO NOTHING
    `
  );
}

export function removeConversationGroupMembers(
  db: Database,
  conversationID: string,
  groupIDs: string[],
  ownerUserID: string
): QueryExecResult[] {
  const ids = groupIDs.map(v => `'${v}'`);
  return db.exec(
    `
    DELETE FROM local_conversation_group_members
    WHERE owner_user_id = "${ownerUserID}"
      AND conversation_id = "${conversationID}"
      AND group_id IN (${ids.join(',')})
    `
  );
}

export function getConversationGroupIDsByConversationID(
  db: Database,
  conversationID: string,
  ownerUserID: string
): QueryExecResult[] {
  return db.exec(
    `
    SELECT group_id
    FROM local_conversation_group_members
    WHERE owner_user_id = "${ownerUserID}"
      AND conversation_id = "${conversationID}"
    `
  );
}

export function getConversationIDsByGroupID(
  db: Database,
  groupID: string,
  ownerUserID: string
): QueryExecResult[] {
  return db.exec(
    `
    SELECT conversation_id
    FROM local_conversation_group_members
    WHERE owner_user_id = "${ownerUserID}"
      AND group_id = "${groupID}"
    `
  );
}

export function deleteConversationGroupMembersByGroupID(
  db: Database,
  groupID: string,
  ownerUserID: string
): QueryExecResult[] {
  return db.exec(
    `
    DELETE FROM local_conversation_group_members
    WHERE owner_user_id = "${ownerUserID}"
      AND group_id = "${groupID}"
    `
  );
}
