import squel from 'squel';
import { Database, QueryExecResult } from '@jlongster/sql.js';

export type LocalEvent = { [key: string]: any };

export function localEvents(db: Database): QueryExecResult[] {
  return db.exec(
    `
      create table if not exists 'local_events' (
          'id'                varchar(64) primary key,
          'type'              varchar(64) not null,
          'payload'           text not null,
          'state'             varchar(16) not null,
          'priority'          integer not null,
          'attempts'          integer not null,
          'max_attempts'      integer not null,
          'last_error'        text,
          'run_at'            integer not null,
          'lease_owner'       varchar(64),
          'lease_expires_at'  integer,
          'requires_network'  boolean not null,
          'partition_key'     varchar(128) not null,
          'seq'               integer,
          'dedupe_key'        varchar(256) unique,
          'idempotency_key'   varchar(256) not null,
          'created_at'        integer not null,
          'updated_at'        integer not null
      );
    `
  );
}

export function insertEvent(
  db: Database,
  localEvent: LocalEvent
): QueryExecResult[] {
  const sql = squel
    .insert()
    .into('local_events')
    .setFields(localEvent)
    .toString();

  return db.exec(sql);
}

export function upsertEventByDedupe(
  db: Database,
  localEvent: LocalEvent
): QueryExecResult[] {
  const insertSql = squel
    .insert()
    .into('local_events')
    .setFields(localEvent)
    .toString();

  const sql = `
    ${insertSql}
    ON CONFLICT(dedupe_key) DO UPDATE SET
      payload = excluded.payload,
      run_at = MIN(local_events.run_at, excluded.run_at),
      priority = MIN(local_events.priority, excluded.priority),
      updated_at = excluded.updated_at;
  `;

  return db.exec(sql);
}

export function getNextPendingEvent(
  db: Database,
  netOK: boolean,
  nowMS: number
): QueryExecResult[] {
  return db.exec(
    `
      SELECT * FROM local_events
      WHERE state = 'pending'
        AND run_at <= ${nowMS}
        AND (requires_network = 0 OR ${netOK ? 1 : 0} = 1)
      ORDER BY priority ASC, run_at ASC, created_at ASC
      LIMIT 1;
    `
  );
}

export function claimEvent(
  db: Database,
  id: string,
  workerID: string,
  leaseTTL: number,
  updatedAt: number
): QueryExecResult[] {
  const sql = squel
    .update()
    .table('local_events')
    .set('state', 'processing')
    .set('lease_owner', workerID)
    .set('lease_expires_at', leaseTTL)
    .set('updated_at', updatedAt)
    .where('id = ?', id)
    .where("state = 'pending'")
    .toString();

  return db.exec(sql);
}

export function completeEvent(
  db: Database,
  id: string,
  updatedAt: number
): QueryExecResult[] {
  const sql = squel
    .update()
    .table('local_events')
    .set('state', 'done')
    .set('updated_at', updatedAt)
    .where('id = ?', id)
    .toString();

  return db.exec(sql);
}

export function failEvent(
  db: Database,
  id: string,
  attempts: number,
  lastError: string,
  nextRunMS: number,
  state: string,
  updatedAt: number
): QueryExecResult[] {
  const sql = squel
    .update()
    .table('local_events')
    .set('state', state)
    .set('attempts', attempts)
    .set('last_error', lastError)
    .set('run_at', nextRunMS)
    .set('lease_owner', null)
    .set('lease_expires_at', null)
    .set('updated_at', updatedAt)
    .where('id = ?', id)
    .toString();

  return db.exec(sql);
}

export function recoverExpiredLeases(
  db: Database,
  nowMS: number,
  updatedAt: number
): QueryExecResult[] {
  return db.exec(
    `
      UPDATE local_events
      SET state = 'pending',
          lease_owner = NULL,
          lease_expires_at = NULL,
          updated_at = ${updatedAt}
      WHERE state = 'processing' AND lease_expires_at < ${nowMS};
    `
  );
}

export function purgeCompletedEvents(
  db: Database,
  beforeMS: number
): QueryExecResult[] {
  return db.exec(
    `
      DELETE FROM local_events
      WHERE state IN ('done', 'dead') AND updated_at < ${beforeMS};
    `
  );
}
