import { Database } from '@jlongster/sql.js';
import { getAllConversationIDList } from './conversation';

export async function alterTable(db: Database) {
  alter351(db);
  alter380(db);
  alter381(db);
  await alter384(db);
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

async function alter384(db: Database) {
  try {
    // @ts-ignore
    const { data: idListStr } = await getAllConversationIDList();
    console.log(idListStr);
    (JSON.parse(idListStr) as string[]).map(id => {
      try {
        db.exec(
          `
            ALTER TABLE 'chat_logs_${id}' ADD COLUMN dst_user_ids text;
            `
        );
      } catch (error) {
        console.warn(error);
        // alter table error
      }
    });
  } catch (error) {
    // get conversation id list error
  }
}
