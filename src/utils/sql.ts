import { Database, QueryExecResult } from '@jlongster/sql.js';

export type SQLBinding = string | number | null | Uint8Array;

export function execPreparedQuery(
  db: Database,
  sql: string,
  bindings: SQLBinding[] = []
): QueryExecResult[] {
  const statement = db.prepare(sql);
  try {
    statement.bind(bindings);
    const values: any[][] = [];
    while (statement.step()) {
      values.push(statement.get());
    }
    return values.length === 0
      ? []
      : [{ columns: statement.getColumnNames(), values }];
  } finally {
    statement.free();
  }
}
