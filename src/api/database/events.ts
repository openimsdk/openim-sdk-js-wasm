import { DatabaseErrorCode } from '@/constant';
import {
  LocalEvent,
  claimEvent as databaseClaimEvent,
  completeEvent as databaseCompleteEvent,
  failEvent as databaseFailEvent,
  getNextPendingEvent as databaseGetNextPendingEvent,
  insertEvent as databaseInsertEvent,
  purgeCompletedEvents as databasePurgeCompletedEvents,
  recoverExpiredLeases as databaseRecoverExpiredLeases,
  upsertEventByDedupe as databaseUpsertEventByDedupe,
} from '@/sqls';
import {
  converSqlExecResult,
  convertToSnakeCaseObject,
  formatResponse,
} from '@/utils';
import { getInstance } from './instance';

export async function insertEvent(ev: string): Promise<string> {
  try {
    const db = await getInstance();
    const localEvent = convertToSnakeCaseObject(JSON.parse(ev)) as LocalEvent;

    databaseInsertEvent(db, localEvent);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function upsertEventByDedupe(ev: string): Promise<string> {
  try {
    const db = await getInstance();
    const localEvent = convertToSnakeCaseObject(JSON.parse(ev)) as LocalEvent;

    databaseUpsertEventByDedupe(db, localEvent);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function claimNextEvent(
  netOK: boolean,
  nowMS: number,
  workerID: string,
  leaseTTL: number
): Promise<string> {
  try {
    const db = await getInstance();

    const candidateResult = databaseGetNextPendingEvent(db, netOK, nowMS);
    if (
      candidateResult.length === 0 ||
      candidateResult[0].values.length === 0
    ) {
      return formatResponse(
        '',
        DatabaseErrorCode.ErrorNoRecord,
        'no pending event'
      );
    }
    const candidateList = converSqlExecResult(candidateResult[0], 'CamelCase', [
      'requiresNetwork',
    ]);
    const candidate = candidateList[0];

    if (!candidate) {
      return formatResponse(
        '',
        DatabaseErrorCode.ErrorNoRecord,
        'no pending event'
      );
    }

    databaseClaimEvent(db, candidate.id as string, workerID, leaseTTL, nowMS);
    const modified = db.getRowsModified();
    if (modified === 0) {
      return formatResponse(
        '',
        DatabaseErrorCode.ErrorNoRecord,
        'no pending event'
      );
    }

    return formatResponse({
      ...candidate,
      state: 'processing',
      leaseOwner: workerID,
      leaseExpiresAt: leaseTTL,
      updatedAt: nowMS,
    });
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function completeEvent(id: string): Promise<string> {
  try {
    const db = await getInstance();
    const now = Date.now();

    databaseCompleteEvent(db, id, now);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function failEvent(
  id: string,
  attempts: number,
  lastError: string,
  nextRunMS: number,
  state: string
): Promise<string> {
  try {
    const db = await getInstance();
    const now = Date.now();

    databaseFailEvent(db, id, attempts, lastError, nextRunMS, state, now);

    return formatResponse('');
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function recoverExpiredLeases(nowMS: number): Promise<string> {
  try {
    const db = await getInstance();

    databaseRecoverExpiredLeases(db, nowMS, nowMS);
    const modified = db.getRowsModified();

    return formatResponse(modified);
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}

export async function purgeCompletedEvents(beforeMS: number): Promise<string> {
  try {
    const db = await getInstance();

    databasePurgeCompletedEvents(db, beforeMS);
    const modified = db.getRowsModified();

    return formatResponse(modified);
  } catch (e) {
    console.error(e);

    return formatResponse(
      undefined,
      DatabaseErrorCode.ErrorInit,
      JSON.stringify(e)
    );
  }
}
