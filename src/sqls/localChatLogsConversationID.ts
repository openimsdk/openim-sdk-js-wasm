import squel from 'squel';
import { Database, QueryExecResult } from '@jlongster/sql.js';

export type ClientMessage = { [key: string]: any };

function _initLocalChatLogsTable(db: Database, conversationID: string) {
  localChatLogsConversationID(db, conversationID);
}

export function localChatLogsConversationID(
  db: Database,
  conversationID: string
): QueryExecResult[] {
  return db.exec(
    `
    create table if not exists 'chat_logs_${conversationID}' (
        'client_msg_id' char(32),
        'server_msg_id' char(32),
        'send_id' char(32),
        'recv_id' char(32),
        'sender_platform_id' smallint,
        'sender_nick_name' varchar(255),
        'sender_face_url' varchar(255),
        'session_type' smallint,
        'msg_from' smallint,
        'content_type' smallint,
        'content' varchar(1000),
        'is_read' tinyint(1),
        'status' smallint,
        'seq' int DEFAULT 0,
        'send_time' int,
        'create_time' int,
        'attached_info' varchar(1024),
        'ex' varchar(1024),
        'local_ex' varchar(1024),
        'is_react' tinyint(1),
        'is_external_extensions' tinyint(1),
        'msg_first_modify_time' int,
        PRIMARY KEY ('client_msg_id')
      );
      `
  );
}

export function getMessage(
  db: Database,
  conversationID: string,
  clientMsgID: string
): QueryExecResult[] {
  _initLocalChatLogsTable(db, conversationID);

  return db.exec(
    `
    SELECT * FROM 'chat_logs_${conversationID}' WHERE client_msg_id = '${clientMsgID}' limit 1
    `
  );
}

export function getAlreadyExistSeqList(
  db: Database,
  conversationID: string,
  lostSeqList: number[]
): QueryExecResult[] {
  return db.exec(
    `
    SELECT seq FROM 'chat_logs_${conversationID}' WHERE seq in (${lostSeqList.join(
      ','
    )})
    `
  );
}

export function getMessageList(
  db: Database,
  conversationID: string,
  count: number,
  startTime: number,
  startSeq: number,
  startClientMsgID: string,
  isReverse: boolean
): QueryExecResult[] {
  return db.exec(
    // `
    // SELECT * FROM 'chat_logs_${conversationID}' WHERE send_time ${
    //   !isReverse ? '<' : '>'
    // } ${startTime} ORDER BY send_time ${
    //   !isReverse ? 'DESC' : 'ASC'
    // } LIMIT ${count}
    // `
    `
    SELECT * FROM 'chat_logs_${conversationID}'
    WHERE
      send_time ${!isReverse ? '<' : '>'} ${startTime}
      OR (
        send_time = ${startTime} AND (
          seq ${!isReverse ? '<' : '>'} ${startSeq}
          OR (seq = 0 AND client_msg_id != '${startClientMsgID}')
        )
      )
    ORDER BY
      send_time ${!isReverse ? 'DESC' : 'ASC'},
      seq ${!isReverse ? 'DESC' : 'ASC'}
    LIMIT ${count}
    `
  );
}

export function getMessageBySeq(
  db: Database,
  conversationID: string,
  seq: number
): QueryExecResult[] {
  _initLocalChatLogsTable(db, conversationID);
  return db.exec(
    `
    SELECT * FROM 'chat_logs_${conversationID}' WHERE seq = ${seq} limit 1;
    `
  );
}

export function getMessagesByClientMsgIDs(
  db: Database,
  conversationID: string,
  clientMsgIDs: string[]
): QueryExecResult[] {
  return db.exec(
    `
    SELECT * FROM 'chat_logs_${conversationID}' WHERE client_msg_id in (${clientMsgIDs
      .map(item => `'${item}'`)
      .join(',')}) order by send_time desc;
    `
  );
}

export function getMessagesBySeqs(
  db: Database,
  conversationID: string,
  seqs: number[]
): QueryExecResult[] {
  _initLocalChatLogsTable(db, conversationID);
  return db.exec(
    `
    SELECT * FROM 'chat_logs_${conversationID}' WHERE seq in (${seqs.join(
      ','
    )}) order by send_time desc;
    `
  );
}

export function getMessageListNoTime(
  db: Database,
  conversationID: string,
  count: number,
  isReverse: boolean
): QueryExecResult[] {
  _initLocalChatLogsTable(db, conversationID);
  return db.exec(
    `
    SELECT * FROM 'chat_logs_${conversationID}' ORDER BY send_time ${
      !isReverse ? 'DESC' : 'ASC'
    } LIMIT ${count}
    `
  );
}

export function getConversationNormalMsgSeq(
  db: Database,
  conversationID: string
): QueryExecResult[] {
  _initLocalChatLogsTable(db, conversationID);
  return db.exec(
    `
      SELECT seq FROM 'chat_logs_${conversationID}' order by seq desc limit 1;
      `
  );
}

export function getConversationPeerNormalMsgSeq(
  db: Database,
  conversationID: string,
  loginUserID: string
): QueryExecResult[] {
  return db.exec(
    `
      SELECT seq FROM 'chat_logs_${conversationID}' where send_id != '${loginUserID}' order by seq desc limit 1;
      `
  );
}

export function getSendingMessageList(
  db: Database,
  conversationID: string
): QueryExecResult[] {
  return db.exec(
    `
    SELECT * FROM 'chat_logs_${conversationID}' WHERE status = 1;
    `
  );
}

export function updateMessageTimeAndStatus(
  db: Database,
  conversationID: string,
  clientMsgID: string,
  serverMsgID: string,
  sendTime: number,
  status: number
): QueryExecResult[] {
  return db.exec(
    `
    UPDATE 'chat_logs_${conversationID}' SET server_msg_id = '${serverMsgID}', send_time = ${sendTime}, status = ${status} WHERE client_msg_id = '${clientMsgID}' and seq=0;
    `
  );
}

export function updateMessage(
  db: Database,
  conversationID: string,
  clientMsgID: string,
  localChatLogs: ClientMessage
): QueryExecResult[] {
  const sql = squel
    .update()
    .table(`'chat_logs_${conversationID}'`)
    .setFields(localChatLogs)
    .where(`client_msg_id = '${clientMsgID}'`)
    .toString();
  return db.exec(sql);
}

export function updateMessageBySeq(
  db: Database,
  conversationID: string,
  seq: number,
  localChatLogs: ClientMessage
): QueryExecResult[] {
  const sql = squel
    .update()
    .table(`'chat_logs_${conversationID}'`)
    .setFields(localChatLogs)
    .where(`seq = '${seq}'`)
    .toString();
  return db.exec(sql);
}

export function batchInsertMessageList(
  db: Database,
  conversationID: string,
  messageList: ClientMessage[]
): QueryExecResult[] {
  _initLocalChatLogsTable(db, conversationID);
  const sql = squel
    .insert()
    .into(`'chat_logs_${conversationID}'`)
    .setFieldsRows(messageList)
    .toString();
  return db.exec(sql);
}

export function insertMessage(
  db: Database,
  conversationID: string,
  localChatLogs: ClientMessage
): QueryExecResult[] {
  const sql = squel
    .insert()
    .into(`'chat_logs_${conversationID}'`)
    .setFields(localChatLogs)
    .toString();
  return db.exec(sql);
}

export function getMultipleMessage(
  db: Database,
  conversationID: string,
  clientMsgIDs: string[]
): QueryExecResult[] {
  return db.exec(
    `
    SELECT * FROM 'chat_logs_${conversationID}' WHERE client_msg_id in (${clientMsgIDs
      .map(item => `'${item}'`)
      .join(',')}) order by send_time desc;
    `
  );
}

export function searchMessageByKeyword(
  db: Database,
  conversationID: string,
  contentType: number[],
  keywordList: string[],
  keywordListMatchType: number,
  startTime: number,
  endTime: number,
  offset: number,
  count: number
): QueryExecResult[] {
  const finalEndTime = endTime ? endTime : new Date().getTime();
  let subCondition = '';
  const values = contentType.map(v => `${v}`).join(',');
  const connectStr = keywordListMatchType === 0 ? 'or ' : 'and ';
  keywordList.forEach((keyword, index) => {
    if (index == 0) {
      subCondition += 'And (';
    }
    if (index + 1 >= keywordList.length) {
      subCondition += 'content like ' + "'%" + keywordList[index] + "%') ";
    } else {
      subCondition +=
        'content like ' + "'%" + keywordList[index] + "%' " + connectStr;
    }
  });
  return db.exec(
    `  
    SELECT * FROM 'chat_logs_${conversationID}' 
          WHERE send_time  between ${startTime} and ${finalEndTime} 
          AND status <=3  
          And content_type IN (${values}) 
          ${subCondition}
    ORDER BY send_time DESC LIMIT ${count} OFFSET ${offset};
    `
  );
}

export function searchMessageByContentType(
  db: Database,
  conversationID: string,
  contentType: number[],
  startTime: number,
  endTime: number,
  offset: number,
  count: number
): QueryExecResult[] {
  const values = contentType.map(v => `${v}`).join(',');
  const finalEndTime = endTime ? endTime : new Date().getTime();
  return db.exec(
    `  
    SELECT * FROM 'chat_logs_${conversationID}' 
          WHERE send_time between ${startTime} and ${finalEndTime} 
          AND status <=3 
          And content_type IN (${values}) 
    ORDER BY send_time DESC LIMIT ${count} OFFSET ${offset};
    `
  );
}

export function searchMessageByContentTypeAndKeyword(
  db: Database,
  conversationID: string,
  contentType: number[],
  keywordList: string[],
  keywordListMatchType: number,
  startTime: number,
  endTime: number
): QueryExecResult[] {
  const values = contentType.map(v => `${v}`).join(',');
  const finalEndTime = endTime ? endTime : new Date().getTime();
  let subCondition = '';
  const connectStr = keywordListMatchType === 0 ? 'or ' : 'and ';
  keywordList.forEach((keyword, index) => {
    if (index == 0) {
      subCondition += 'And (';
    }
    if (index + 1 >= keywordList.length) {
      subCondition += 'content like ' + "'%" + keywordList[index] + "%') ";
    } else {
      subCondition +=
        'content like ' + "'%" + keywordList[index] + "%' " + connectStr;
    }
  });
  return db.exec(
    `  
      SELECT * FROM 'chat_logs_${conversationID}' 
            WHERE send_time between ${startTime} and ${finalEndTime} 
            AND status <=3 
            And content_type IN (${values}) 
            ${subCondition}
      ORDER BY send_time DESC;
      `
  );
}

export function messageIfExists(
  db: Database,
  conversationID: string,
  clientMsgID: string
): QueryExecResult[] {
  return db.exec(
    `
      SELECT * FROM 'chat_logs_${conversationID}' WHERE client_msg_id = '${clientMsgID}';
      `
  );
}

// export function MessageIfExistsBySeq(
//     db: Database,
//     conversationID: string,
//     seq: number
// ): QueryExecResult[] {
//     return db.exec(
//         `
//       SELECT * FROM 'chat_logs_${conversationID}' WHERE seq = ${seq};
//       `
//     );
// }

// export function UpdateGroupMessageHasRead(
//     db: Database,
// )

// export function getMultipleMessage(
//     db: Database,
// )

// export function updateMsgSenderNickname(
//     db: Database,
// )

// export function updateMsgSenderFaceURL(
//     db: Database,
// )

export function updateMsgSenderFaceURLAndSenderNickname(
  db: Database,
  conversationID: string,
  sendID: string,
  faceURL: string,
  nickname: string
): QueryExecResult[] {
  _initLocalChatLogsTable(db, conversationID);
  return db.exec(
    `
      UPDATE 'chat_logs_${conversationID}' SET sender_face_url = '${faceURL}', sender_nick_name = '${nickname}' WHERE send_id = '${sendID}';
      `
  );
}

// export function getMsgSeqByClientMsgID(
//     db: Database,
// )

// export function getMsgSeqListByGroupID(
//     db: Database,
// )

// export function getMsgSeqListByPeerUserID(
//     db: Database,
// )

// export function getMsgSeqListBySelfUserID(
//     db: Database,
// )

// export function deleteAllMessage(
//     db: Database,
// )

// export function getAllUnDeleteMessageSeqList(
//     db: Database,
// )

export function deleteConversationAllMessages(
  db: Database,
  conversationID: string
): QueryExecResult[] {
  return db.exec(
    `
      DELETE FROM 'chat_logs_${conversationID}' WHERE 1=1;
      `
  );
}

export function markDeleteConversationAllMessages(
  db: Database,
  conversationID: string
): QueryExecResult[] {
  return db.exec(
    `
      UPDATE 'chat_logs_${conversationID}' SET status = 2 WHERE (1=1) and (conversation_id = '${conversationID}')';
      `
  );
}

export function getUnreadMessage(
  db: Database,
  conversationID: string,
  loginUserID: string
): QueryExecResult[] {
  return db.exec(
    `
      SELECT * FROM 'chat_logs_${conversationID}' WHERE send_id != '${loginUserID}' and is_read = 0;
      `
  );
}

export function markConversationMessageAsReadBySeqs(
  db: Database,
  conversationID: string,
  seqList: number[],
  loginUserID: string
): QueryExecResult[] {
  _initLocalChatLogsTable(db, conversationID);
  const values = seqList.map(v => `${v}`).join(',');
  return db.exec(
    `
      UPDATE 'chat_logs_${conversationID}' SET is_read = 1 WHERE seq IN (${values}) and send_id != '${loginUserID}';
      `
  );
}

export function markConversationMessageAsRead(
  db: Database,
  conversationID: string,
  clientMsgIDList: string[],
  loginUserID: string
): QueryExecResult[] {
  const values = clientMsgIDList.map(v => `'${v}'`).join(',');
  return db.exec(
    `
      UPDATE 'chat_logs_${conversationID}' SET is_read = 1 WHERE client_msg_id IN (${values}) and send_id != '${loginUserID}';
      `
  );
}

export function updateColumnsMessage(
  db: Database,
  conversationID: string,
  clientMsgID: string,
  localChatLogs: ClientMessage
): QueryExecResult[] {
  const sql = squel
    .update()
    .table(`'chat_logs_${conversationID}'`)
    .setFields(localChatLogs)
    .where(`client_msg_id = '${clientMsgID}'`)
    .toString();
  return db.exec(sql);
}

export function deleteConversationMsgs(
  db: Database,
  conversationID: string,
  clientMsgIDList: string[]
): QueryExecResult[] {
  const values = clientMsgIDList.map(v => `'${v}'`).join(',');
  return db.exec(
    `
      DELETE FROM 'chat_logs_${conversationID}' WHERE client_msg_id IN (${values});
      `
  );
}

// export function updateSingleMessageHasRead(
//     db: Database,
// )

// export function updateGroupMessageHasRead(
//     db: Database,
// )

// export function updateMessageStatusBySourceID(
//     db: Database,
// )

export function markConversationAllMessageAsRead(
  db: Database,
  conversationID: string,
  loginUserID: string
): QueryExecResult[] {
  return db.exec(
    `
      UPDATE 'chat_logs_${conversationID}' SET is_read = 1 WHERE is_read = 0 and send_id != '${loginUserID}';
      `
  );
}

// export function deleteConversationMsgsBySeqs(
//     db: Database,
// )

export function searchAllMessageByContentType(
  db: Database,
  conversationID: string,
  contentType: number
): QueryExecResult[] {
  return db.exec(
    `
      SELECT * FROM 'chat_logs_${conversationID}' WHERE content_type = ${contentType};
      `
  );
}

export function getLatestActiveMessage(
  db: Database,
  conversationID: string,
  isReverse: boolean
): QueryExecResult[] {
  _initLocalChatLogsTable(db, conversationID);
  const order = isReverse ? 'ASC' : 'DESC';
  return db.exec(
    `
      SELECT * FROM 'chat_logs_${conversationID}' WHERE status < 4 ORDER BY send_time ${order};
    `
  );
}

export function getLatestValidServerMessage(
  db: Database,
  conversationID: string,
  startTime: number,
  isReverse: boolean
): QueryExecResult[] {
  _initLocalChatLogsTable(db, conversationID);
  const order = isReverse ? 'ASC' : 'DESC';
  return db.exec(
    `
      SELECT * FROM 'chat_logs_${conversationID}' WHERE send_time ${
      isReverse ? '<' : '>'
    } ${startTime} AND seq != 0 ORDER BY send_time ${
      isReverse ? 'DESC' : 'ASC'
    } LIMIT 1
    `
  );
}
