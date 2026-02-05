import squel from 'squel';
import { Database, QueryExecResult } from '@jlongster/sql.js';

export type LocalConversationGroup = { [key: string]: unknown };

// ==================== local_conversation_groups 表 ====================

export function localConversationGroups(db: Database): QueryExecResult[] {
  return db.exec(
    `
    CREATE TABLE IF NOT EXISTS 'local_conversation_groups' (
      'conversation_group_id' varchar(64),
      'name' varchar(255),
      'serial' INTEGER,
      'version' INTEGER,
      'ex' varchar(1024),
      'conversation_group_type' INTEGER,
      'hidden' INTEGER,
      PRIMARY KEY ('conversation_group_id')
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

  const sql = squel
    .insert()
    .into('local_conversation_groups')
    .setFieldsRows(localConversationGroups)
    .toString();

  return db.exec(sql);
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
      INSERT INTO local_conversation_groups (conversation_group_id, name, serial, version, ex, conversation_group_type, hidden)
      VALUES ('${group.conversation_group_id}', '${group.name}', ${
      group.serial
    }, ${group.version}, '${group.ex || ''}', ${
      group.conversation_group_type ?? 0
    }, ${group.hidden ?? 0})
      ON CONFLICT (conversation_group_id) DO UPDATE SET
        name = excluded.name,
        serial = excluded.serial,
        version = excluded.version,
        ex = excluded.ex,
        conversation_group_type = excluded.conversation_group_type,
        hidden = excluded.hidden
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
      `conversation_group_id = '${localConversationGroup.conversation_group_id}'`
    )
    .toString();

  return db.exec(sql);
}

export function deleteConversationGroup(
  db: Database,
  groupID: string
): QueryExecResult[] {
  return db.exec(
    `
    DELETE FROM local_conversation_groups
    WHERE conversation_group_id = "${groupID}"
    `
  );
}

export function deleteAllConversationGroups(db: Database): QueryExecResult[] {
  return db.exec(
    `
    DELETE FROM local_conversation_groups
    `
  );
}

export function getConversationGroup(
  db: Database,
  groupID: string
): QueryExecResult[] {
  return db.exec(
    `
    SELECT *
    FROM local_conversation_groups
    WHERE conversation_group_id = "${groupID}"
    LIMIT 1
    `
  );
}

export function getConversationGroups(
  db: Database,
  groupIDs: string[]
): QueryExecResult[] {
  const ids = groupIDs.map(v => `'${v}'`);
  return db.exec(
    `
    SELECT *
    FROM local_conversation_groups
    WHERE conversation_group_id IN (${ids.join(',')})
    `
  );
}

export function getAllConversationGroups(db: Database): QueryExecResult[] {
  return db.exec(
    `
    SELECT *
    FROM local_conversation_groups
    `
  );
}

export function updateConversationGroupSerial(
  db: Database,
  groupID: string,
  serial: number
): QueryExecResult[] {
  return db.exec(
    `
    UPDATE local_conversation_groups
    SET serial = ${serial}
    WHERE conversation_group_id = "${groupID}"
    `
  );
}

// ==================== local_conversation_group_members 表 ====================

export function localConversationGroupMembers(db: Database): QueryExecResult[] {
  return db.exec(
    `
    CREATE TABLE IF NOT EXISTS 'local_conversation_group_members' (
      'conversation_id' char(128),
      'conversation_group_id' varchar(64),
      PRIMARY KEY ('conversation_id', 'conversation_group_id')
    )
    `
  );
}

export function addConversationGroupMembers(
  db: Database,
  conversationID: string,
  groupIDs: string[]
): QueryExecResult[] {
  if (groupIDs.length === 0) {
    return [];
  }

  const values = groupIDs
    .map(groupID => `("${conversationID}", "${groupID}")`)
    .join(', ');

  return db.exec(
    `
    INSERT INTO local_conversation_group_members (conversation_id, conversation_group_id)
    VALUES ${values}
    ON CONFLICT DO NOTHING
    `
  );
}

export function removeConversationGroupMembers(
  db: Database,
  conversationID: string,
  groupIDs: string[]
): QueryExecResult[] {
  const ids = groupIDs.map(v => `'${v}'`);
  return db.exec(
    `
    DELETE FROM local_conversation_group_members
    WHERE conversation_id = "${conversationID}"
      AND conversation_group_id IN (${ids.join(',')})
    `
  );
}

export function getConversationGroupIDsByConversationID(
  db: Database,
  conversationID: string
): QueryExecResult[] {
  return db.exec(
    `
    SELECT conversation_group_id
    FROM local_conversation_group_members
    WHERE conversation_id = "${conversationID}"
    `
  );
}

export function getConversationIDsByGroupID(
  db: Database,
  groupID: string
): QueryExecResult[] {
  return db.exec(
    `
    SELECT conversation_id
    FROM local_conversation_group_members
    WHERE conversation_group_id = "${groupID}"
    `
  );
}

export function deleteConversationGroupMembersByGroupID(
  db: Database,
  groupID: string
): QueryExecResult[] {
  return db.exec(
    `
    DELETE FROM local_conversation_group_members
    WHERE conversation_group_id = "${groupID}"
    `
  );
}
