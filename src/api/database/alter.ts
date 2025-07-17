import { Database } from '@jlongster/sql.js';

export function alterTable(db: Database) {
  alter351(db);
  alter380(db);
  alter381(db);
  alter383p8(db);
}

function alter351(db: Database) {
  try {
    db.exec(
      `
        ALTER TABLE local_friends ADD COLUMN is_pinned numeric;
        `
    );
  } catch (error) {
    // alter table error
  }
}

function alter380(db: Database) {
  try {
    db.exec(
      `
        ALTER TABLE local_groups ADD COLUMN display_is_read numeric;
        `
    );
  } catch (error) {
    // alter table error
  }
}

function alter381(db: Database) {
  try {
    db.exec(
      `
        ALTER TABLE local_app_sdk_version ADD COLUMN installed numeric;
        `
    );
  } catch (error) {
    // alter table error
  }
}

function alter383p8(db: Database) {
  try {
    db.exec(
      `
        ALTER TABLE local_users ADD COLUMN add_friend_permission numeric;
        `
    );
  } catch (error) {
    // alter table error
  }
}
