import squel from 'squel';
import { Database, QueryExecResult } from '@jlongster/sql.js';

export type LocalUserCommand = { [key: string]: unknown };

export function localUserCommands(db: Database): QueryExecResult[] {
  return db.exec(
    `
      create table if not exists 'local_user_command' (
            'user_id' char(128),
            'type' integer,
            'uuid' varchar(255),
            'create_time' integer,
            'value' varchar(255),
            'ex' varchar(1024),
            primary key ('user_id', 'type', 'uuid')
        )
    `
  );
}

export function processUserCommandGetAll(db: Database): QueryExecResult[] {
  return db.exec(
    `
        select * from local_user_command;
    `
  );
}

export function processUserCommandAdd(
  db: Database,
  command: LocalUserCommand
): QueryExecResult[] {
  const sql = squel
    .insert()
    .into('local_user_command')
    .setFields(command)
    .toString();

  return db.exec(sql);
}

export function processUserCommandUpdate(
  db: Database,
  command: LocalUserCommand
): QueryExecResult[] {
  const sql = squel
    .update()
    .table('local_user_command')
    .setFields(command)
    .where(
      `user_id = '${command.user_id}' and type = ${command.type} and uuid = '${command.uuid}'`
    )
    .toString();

  return db.exec(sql);
}

export function processUserCommandDelete(
  db: Database,
  command: LocalUserCommand
): QueryExecResult[] {
  return db.exec(
    `
        delete from local_user_command where type = ${command.type} and uuid = '${command.uuid}';
    `
  );
}
