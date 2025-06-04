import { Database, QueryExecResult } from '@jlongster/sql.js';
import squel from 'squel';

export type LocalGroupRequest = { [key: string]: any };

export function localGroupRequests(db: Database): QueryExecResult[] {
  return db.exec(
    `
    create table if not exists "local_group_requests" (
        "group_id" varchar(64),
        "group_name" text,
        "notification" varchar(255),
        "introduction" varchar(255),
        "face_url" varchar(255),
        "create_time" integer,
        "status" integer,
        "creator_user_id" varchar(64),
        "group_type" integer,
        "owner_user_id" varchar(64),
        "member_count" integer,
        "user_id" varchar(64),
        "nickname" varchar(255),
        "user_face_url" varchar(255),
        "gender" integer,
        "handle_result" integer,
        "req_msg" varchar(255),
        "handle_msg" varchar(255),
        "req_time" integer,
        "handle_user_id" varchar(64),
        "handle_time" integer,
        "ex" varchar(1024),
        "attached_info" varchar(1024),
        "join_source" integer,
        "inviter_user_id" text,
        PRIMARY KEY ("group_id", "user_id")
      );
      `
  );
}

export function insertGroupRequest(
  db: Database,
  localGroupRequest: LocalGroupRequest
): QueryExecResult[] {
  const sql = squel
    .insert()
    .into('local_group_requests')
    .setFields(localGroupRequest)
    .toString();

  return db.exec(sql);
}

export function deleteGroupRequest(
  db: Database,
  groupID: string,
  userID: string
): QueryExecResult[] {
  return db.exec(
    `
        delete
        from local_group_requests
        where group_id = "${groupID}"
          and user_id = "${userID}"
        `
  );
}

export function deleteGroupRequestsFromUserID(
  db: Database,
  groupIDs: string[],
  userID: string
): QueryExecResult[] {
  return db.exec(
    `
        delete
        from local_group_requests
        where group_id in (${groupIDs.join(',')})
          and user_id = "${userID}"
        `
  );
}

export function updateGroupRequest(
  db: Database,
  localGroupRequest: LocalGroupRequest
): QueryExecResult[] {
  const sql = squel
    .update()
    .table('local_group_requests')
    .setFields(localGroupRequest)
    .where(
      `group_id = '${localGroupRequest.group_id}' and user_id = '${localGroupRequest.user_id}'`
    )
    .toString();

  return db.exec(sql);
}

export function getSendGroupApplication(db: Database): QueryExecResult[] {
  return db.exec(
    `
        select *
        from local_group_requests
        order by create_time desc
        `
  );
}
