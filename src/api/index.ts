import { initBackend } from 'absurd-sql-optimized/dist/indexeddb-main-thread';
import { RPCMessageEvent, RPC, RPCError } from 'rpc-shooter';
import { DatabaseErrorCode } from '@/constant';

let rpc: RPC | undefined;
let worker: Worker | undefined;
let debug = false;

function supportsModuleWorkers() {
  if (typeof Worker !== 'undefined' && 'type' in Worker.prototype) {
    return true;
  }
  try {
    const blob = new Blob([''], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    new Worker(url, { type: 'module' });
    URL.revokeObjectURL(url);
    return true;
  } catch (e) {
    return false;
  }
}

function initWorker() {
  if (typeof window === 'undefined') {
    return;
  }

  // use for webpack 4
  // const IMWorker = require('worker-loader!./worker.js');
  // worker = new IMWorker.default();

  // use for webpack5+ or vite
  const isViteEnvironment = import.meta.url.includes('.vite/deps');
  const isNuxtEnvironment = import.meta.url.includes('_nuxt/node_modules');
  const isQuasarEnvironment = import.meta.url.includes('.q-cache');
  const isSupportModuleWorker = supportsModuleWorkers();
  let workerUrl = isSupportModuleWorker
    ? new URL('worker.js', import.meta.url)
    : new URL('worker-legacy.js', import.meta.url);
  if (isViteEnvironment) {
    workerUrl = workerUrl.href.replace(
      '.vite/deps',
      '@openim/wasm-client-sdk/lib'
    ) as unknown as URL;
  }
  if (isNuxtEnvironment) {
    workerUrl = workerUrl.href.replace(
      '.cache/vite/client/deps',
      '@openim/wasm-client-sdk/lib'
    ) as unknown as URL;
  }
  if (isQuasarEnvironment) {
    workerUrl = workerUrl.href.replace(
      /\.q-cache\/dev-spa\/[^/]+\/deps/,
      '@openim/wasm-client-sdk/lib'
    ) as unknown as URL;
  }
  worker = new Worker(workerUrl, {
    type: isSupportModuleWorker ? 'module' : 'classic',
  });
  // This is only required because Safari doesn't support nested
  // workers. This installs a handler that will proxy creating web
  // workers through the main thread
  initBackend(worker);

  rpc = new RPC({
    event: new RPCMessageEvent({
      currentEndpoint: worker,
      targetEndpoint: worker,
    }),
  });
}

function resetWorker() {
  if (rpc) {
    rpc.destroy();
    rpc = undefined;
  }
  if (worker) {
    worker.terminate();
    worker = undefined;
  }
}

initWorker();

function catchErrorHandle(error: unknown) {
  // defined in rpc-shooter
  if ((error as RPCError).code === -32300) {
    resetWorker();

    return JSON.stringify({
      data: '',
      errCode: DatabaseErrorCode.ErrorDBTimeout,
      errMsg: 'database maybe damaged',
    });
  }

  throw error;
}

function _logWrap(...args: any[]) {
  if (debug) {
    console.info(...args);
  }
}

function registeMethodOnWindow(
  name: string,
  realName?: string,
  needStringify = true
) {
  _logWrap(`=> (database api) registe ${realName ?? name}`);

  return async (...args: unknown[]) => {
    if (!rpc || !worker) {
      initWorker();
    }

    if (!rpc) {
      return;
    }

    try {
      _logWrap(
        `=> (invoked by go wasm) run ${
          realName ?? name
        } method with args ${JSON.stringify(args)}`
      );
      const response = await rpc.invoke(name, ...args, { timeout: 5000000 });
      _logWrap(
        `=> (invoked by go wasm) run ${realName ?? name} method with response `,
        JSON.stringify(response)
      );

      if (!needStringify) {
        return response;
      }

      return JSON.stringify(response);
    } catch (error: unknown) {
      // defined in rpc-shooter
      catchErrorHandle(error);
    }
  };
}

// register method on window for go wasm invoke
export function initDatabaseAPI(isLogStandardOutput = true): void {
  if (!rpc) {
    return;
  }
  debug = isLogStandardOutput;

  // upload
  window.wasmOpen = registeMethodOnWindow('wasmOpen');
  window.wasmClose = registeMethodOnWindow('wasmClose');
  window.wasmRead = registeMethodOnWindow('wasmRead', 'wasmRead', false);
  window.getUpload = registeMethodOnWindow('getUpload');
  window.insertUpload = registeMethodOnWindow('insertUpload');
  window.updateUpload = registeMethodOnWindow('updateUpload');
  window.deleteUpload = registeMethodOnWindow('deleteUpload');
  window.fileMapSet = registeMethodOnWindow('fileMapSet');
  window.fileMapClear = registeMethodOnWindow('fileMapClear');

  window.setSqlWasmPath = registeMethodOnWindow('setSqlWasmPath');
  window.initDB = registeMethodOnWindow('initDB');
  window.close = registeMethodOnWindow('close');

  // message
  window.getMessage = registeMethodOnWindow('getMessage');
  window.getMultipleMessage = registeMethodOnWindow('getMultipleMessage');
  window.getSendingMessageList = registeMethodOnWindow('getSendingMessageList');
  window.getNormalMsgSeq = registeMethodOnWindow('getNormalMsgSeq');
  window.updateMessageTimeAndStatus = registeMethodOnWindow(
    'updateMessageTimeAndStatus'
  );
  window.updateMessage = registeMethodOnWindow('updateMessage');
  window.updateMessageBySeq = registeMethodOnWindow('updateMessageBySeq');
  window.updateColumnsMessage = registeMethodOnWindow('updateColumnsMessage');
  window.insertMessage = registeMethodOnWindow('insertMessage');
  window.batchInsertMessageList = registeMethodOnWindow(
    'batchInsertMessageList'
  );
  window.getMessageList = registeMethodOnWindow('getMessageList');
  window.getMessageListNoTime = registeMethodOnWindow('getMessageListNoTime');
  window.messageIfExists = registeMethodOnWindow('messageIfExists');
  window.messageIfExistsBySeq = registeMethodOnWindow('messageIfExistsBySeq');
  window.getAbnormalMsgSeq = registeMethodOnWindow('getAbnormalMsgSeq');
  window.getAbnormalMsgSeqList = registeMethodOnWindow('getAbnormalMsgSeqList');
  window.batchInsertExceptionMsg = registeMethodOnWindow(
    'batchInsertExceptionMsg'
  );
  window.searchMessageByKeyword = registeMethodOnWindow(
    'searchMessageByKeyword'
  );
  window.searchMessageByContentType = registeMethodOnWindow(
    'searchMessageByContentType'
  );
  window.searchMessageByContentTypeAndKeyword = registeMethodOnWindow(
    'searchMessageByContentTypeAndKeyword'
  );
  window.updateMsgSenderNickname = registeMethodOnWindow(
    'updateMsgSenderNickname'
  );
  window.updateMsgSenderFaceURL = registeMethodOnWindow(
    'updateMsgSenderFaceURL'
  );
  window.updateMsgSenderFaceURLAndSenderNickname = registeMethodOnWindow(
    'updateMsgSenderFaceURLAndSenderNickname'
  );
  window.getMsgSeqByClientMsgID = registeMethodOnWindow(
    'getMsgSeqByClientMsgID'
  );
  window.getMsgSeqListByGroupID = registeMethodOnWindow(
    'getMsgSeqListByGroupID'
  );
  window.getMsgSeqListByPeerUserID = registeMethodOnWindow(
    'getMsgSeqListByPeerUserID'
  );
  window.getMsgSeqListBySelfUserID = registeMethodOnWindow(
    'getMsgSeqListBySelfUserID'
  );
  window.deleteAllMessage = registeMethodOnWindow('deleteAllMessage');
  window.getAllUnDeleteMessageSeqList = registeMethodOnWindow(
    'getAllUnDeleteMessageSeqList'
  );
  window.updateSingleMessageHasRead = registeMethodOnWindow(
    'updateSingleMessageHasRead'
  );
  window.updateGroupMessageHasRead = registeMethodOnWindow(
    'updateGroupMessageHasRead'
  );
  window.updateMessageStatusBySourceID = registeMethodOnWindow(
    'updateMessageStatusBySourceID'
  );
  window.getAlreadyExistSeqList = registeMethodOnWindow(
    'getAlreadyExistSeqList'
  );
  window.getLatestValidServerMessage = registeMethodOnWindow(
    'getLatestValidServerMessage'
  );
  window.getMessageBySeq = registeMethodOnWindow('getMessageBySeq');
  window.getMessagesByClientMsgIDs = registeMethodOnWindow(
    'getMessagesByClientMsgIDs'
  );
  window.getMessagesBySeqs = registeMethodOnWindow('getMessagesBySeqs');
  window.getConversationNormalMsgSeq = registeMethodOnWindow(
    'getConversationNormalMsgSeq'
  );
  window.checkConversationNormalMsgSeq = registeMethodOnWindow(
    'getConversationNormalMsgSeq'
  );
  window.getConversationPeerNormalMsgSeq = registeMethodOnWindow(
    'getConversationPeerNormalMsgSeq'
  );
  window.deleteConversationAllMessages = registeMethodOnWindow(
    'deleteConversationAllMessages'
  );
  window.markDeleteConversationAllMessages = registeMethodOnWindow(
    'markDeleteConversationAllMessages'
  );
  window.getUnreadMessage = registeMethodOnWindow('getUnreadMessage');
  window.markConversationMessageAsReadBySeqs = registeMethodOnWindow(
    'markConversationMessageAsReadBySeqs'
  );
  window.markConversationMessageAsReadDB = registeMethodOnWindow(
    'markConversationMessageAsRead'
  );
  window.deleteConversationMsgs = registeMethodOnWindow(
    'deleteConversationMsgs'
  );
  window.markConversationAllMessageAsRead = registeMethodOnWindow(
    'markConversationAllMessageAsRead'
  );
  window.searchAllMessageByContentType = registeMethodOnWindow(
    'searchAllMessageByContentType'
  );
  window.insertSendingMessage = registeMethodOnWindow('insertSendingMessage');
  window.deleteSendingMessage = registeMethodOnWindow('deleteSendingMessage');
  window.getAllSendingMessages = registeMethodOnWindow('getAllSendingMessages');
  // conversation
  window.getAllConversationListDB = registeMethodOnWindow(
    'getAllConversationList'
  );
  window.getAllConversationListToSync = registeMethodOnWindow(
    'getAllConversationListToSync'
  );
  window.getHiddenConversationList = registeMethodOnWindow(
    'getHiddenConversationList'
  );
  window.getConversation = registeMethodOnWindow('getConversation');
  window.getMultipleConversationDB = registeMethodOnWindow(
    'getMultipleConversation'
  );
  window.updateColumnsConversation = registeMethodOnWindow(
    'updateColumnsConversation'
  );
  window.updateConversation = registeMethodOnWindow(
    'updateColumnsConversation',
    'updateConversation'
  );
  window.updateConversationForSync = registeMethodOnWindow(
    'updateColumnsConversation',
    'updateConversationForSync'
  );
  window.decrConversationUnreadCount = registeMethodOnWindow(
    'decrConversationUnreadCount'
  );
  window.batchInsertConversationList = registeMethodOnWindow(
    'batchInsertConversationList'
  );
  window.insertConversation = registeMethodOnWindow('insertConversation');
  window.getTotalUnreadMsgCountDB = registeMethodOnWindow(
    'getTotalUnreadMsgCount'
  );
  window.getConversationByUserID = registeMethodOnWindow(
    'getConversationByUserID'
  );
  window.getConversationListSplitDB = registeMethodOnWindow(
    'getConversationListSplit'
  );
  window.deleteConversation = registeMethodOnWindow('deleteConversation');
  window.deleteAllConversation = registeMethodOnWindow('deleteAllConversation');
  window.batchUpdateConversationList = registeMethodOnWindow(
    'batchUpdateConversationList'
  );
  window.conversationIfExists = registeMethodOnWindow('conversationIfExists');
  window.resetConversation = registeMethodOnWindow('resetConversation');
  window.resetAllConversation = registeMethodOnWindow('resetAllConversation');
  window.clearConversation = registeMethodOnWindow('clearConversation');
  window.clearAllConversation = registeMethodOnWindow('clearAllConversation');
  window.setConversationDraftDB = registeMethodOnWindow('setConversationDraft');
  window.removeConversationDraft = registeMethodOnWindow(
    'removeConversationDraft'
  );
  window.unPinConversation = registeMethodOnWindow('unPinConversation');
  // window.updateAllConversation = registeMethodOnWindow('updateAllConversation');
  window.incrConversationUnreadCount = registeMethodOnWindow(
    'incrConversationUnreadCount'
  );
  window.setMultipleConversationRecvMsgOpt = registeMethodOnWindow(
    'setMultipleConversationRecvMsgOpt'
  );
  window.getAllSingleConversationIDList = registeMethodOnWindow(
    'getAllSingleConversationIDList'
  );
  window.findAllUnreadConversationConversationID = registeMethodOnWindow(
    'findAllUnreadConversationConversationID'
  );
  window.getAllConversationIDList = registeMethodOnWindow(
    'getAllConversationIDList'
  );
  window.getAllConversations = registeMethodOnWindow('getAllConversations');
  window.searchConversations = registeMethodOnWindow('searchConversations');
  window.getLatestActiveMessage = registeMethodOnWindow(
    'getLatestActiveMessage'
  );

  // users
  window.getLoginUser = registeMethodOnWindow('getLoginUser');
  window.insertLoginUser = registeMethodOnWindow('insertLoginUser');
  window.updateLoginUser = registeMethodOnWindow('updateLoginUser');
  window.getStrangerInfo = registeMethodOnWindow('getStrangerInfo');
  window.setStrangerInfo = registeMethodOnWindow('setStrangerInfo');

  // app sdk versions
  window.getAppSDKVersion = registeMethodOnWindow('getAppSDKVersion');
  window.setAppSDKVersion = registeMethodOnWindow('setAppSDKVersion');

  // versions sync
  window.getVersionSync = registeMethodOnWindow('getVersionSync');
  window.setVersionSync = registeMethodOnWindow('setVersionSync');
  window.deleteVersionSync = registeMethodOnWindow('deleteVersionSync');

  // super groups
  window.getJoinedSuperGroupList = registeMethodOnWindow(
    'getJoinedSuperGroupList'
  );
  window.getJoinedSuperGroupIDList = registeMethodOnWindow(
    'getJoinedSuperGroupIDList'
  );
  window.getSuperGroupInfoByGroupID = registeMethodOnWindow(
    'getSuperGroupInfoByGroupID'
  );
  window.deleteSuperGroup = registeMethodOnWindow('deleteSuperGroup');
  window.insertSuperGroup = registeMethodOnWindow('insertSuperGroup');
  window.updateSuperGroup = registeMethodOnWindow('updateSuperGroup');

  // unread messages
  window.deleteConversationUnreadMessageList = registeMethodOnWindow(
    'deleteConversationUnreadMessageList'
  );
  window.batchInsertConversationUnreadMessageList = registeMethodOnWindow(
    'batchInsertConversationUnreadMessageList'
  );

  // super group messages
  window.superGroupGetMessage = registeMethodOnWindow('superGroupGetMessage');
  window.superGroupGetMultipleMessage = registeMethodOnWindow(
    'superGroupGetMultipleMessage'
  );
  window.superGroupGetNormalMinSeq = registeMethodOnWindow(
    'superGroupGetNormalMinSeq'
  );
  window.getSuperGroupNormalMsgSeq = registeMethodOnWindow(
    'getSuperGroupNormalMsgSeq'
  );
  window.superGroupUpdateMessageTimeAndStatus = registeMethodOnWindow(
    'superGroupUpdateMessageTimeAndStatus'
  );
  window.superGroupUpdateMessage = registeMethodOnWindow(
    'superGroupUpdateMessage'
  );
  window.superGroupInsertMessage = registeMethodOnWindow(
    'superGroupInsertMessage'
  );
  window.superGroupBatchInsertMessageList = registeMethodOnWindow(
    'superGroupBatchInsertMessageList'
  );
  window.superGroupGetMessageListNoTime = registeMethodOnWindow(
    'superGroupGetMessageListNoTime'
  );
  window.superGroupGetMessageList = registeMethodOnWindow(
    'superGroupGetMessageList'
  );
  window.superGroupUpdateColumnsMessage = registeMethodOnWindow(
    'superGroupUpdateColumnsMessage'
  );
  window.superGroupDeleteAllMessage = registeMethodOnWindow(
    'superGroupDeleteAllMessage'
  );
  window.superGroupSearchMessageByKeyword = registeMethodOnWindow(
    'superGroupSearchMessageByKeyword'
  );
  window.superGroupSearchMessageByContentType = registeMethodOnWindow(
    'superGroupSearchMessageByContentType'
  );
  window.superGroupSearchMessageByContentTypeAndKeyword = registeMethodOnWindow(
    'superGroupSearchMessageByContentTypeAndKeyword'
  );
  window.superGroupUpdateMessageStatusBySourceID = registeMethodOnWindow(
    'superGroupUpdateMessageStatusBySourceID'
  );
  window.superGroupGetSendingMessageList = registeMethodOnWindow(
    'superGroupGetSendingMessageList'
  );
  window.superGroupUpdateGroupMessageHasRead = registeMethodOnWindow(
    'superGroupUpdateGroupMessageHasRead'
  );
  window.superGroupGetMsgSeqByClientMsgID = registeMethodOnWindow(
    'superGroupGetMsgSeqByClientMsgID'
  );
  window.superGroupUpdateMsgSenderFaceURLAndSenderNickname =
    registeMethodOnWindow('superGroupUpdateMsgSenderFaceURLAndSenderNickname');
  window.superGroupSearchAllMessageByContentType = registeMethodOnWindow(
    'superGroupSearchAllMessageByContentType'
  );

  // debug
  window.exec = registeMethodOnWindow('exec');
  window.getRowsModified = registeMethodOnWindow('getRowsModified');
  window.exportDB = async () => {
    if (!rpc || !worker) {
      initWorker();
    }

    if (!rpc) {
      return;
    }

    try {
      _logWrap('=> (invoked by go wasm) run exportDB method ');
      const result = await rpc.invoke('exportDB', undefined, { timeout: 5000 });
      _logWrap(
        '=> (invoked by go wasm) run exportDB method with response ',
        JSON.stringify(result)
      );
      return result;
    } catch (error: unknown) {
      catchErrorHandle(error);
    }
  };

  // black
  window.getBlackListDB = registeMethodOnWindow('getBlackList');
  window.getBlackListUserID = registeMethodOnWindow('getBlackListUserID');
  window.getBlackInfoByBlockUserID = registeMethodOnWindow(
    'getBlackInfoByBlockUserID'
  );
  window.getBlackInfoList = registeMethodOnWindow('getBlackInfoList');
  window.insertBlack = registeMethodOnWindow('insertBlack');
  window.deleteBlack = registeMethodOnWindow('deleteBlack');
  window.updateBlack = registeMethodOnWindow('updateBlack');

  // friendRequest
  window.insertFriendRequest = registeMethodOnWindow('insertFriendRequest');
  window.deleteFriendRequestBothUserID = registeMethodOnWindow(
    'deleteFriendRequestBothUserID'
  );
  window.updateFriendRequest = registeMethodOnWindow('updateFriendRequest');
  window.getRecvFriendApplication = registeMethodOnWindow(
    'getRecvFriendApplication'
  );
  window.getSendFriendApplication = registeMethodOnWindow(
    'getSendFriendApplication'
  );
  window.getFriendApplicationByBothID = registeMethodOnWindow(
    'getFriendApplicationByBothID'
  );
  window.getBothFriendReq = registeMethodOnWindow('getBothFriendReq');

  // friend
  window.insertFriend = registeMethodOnWindow('insertFriend');
  window.deleteFriendDB = registeMethodOnWindow('deleteFriend');
  window.updateFriend = registeMethodOnWindow('updateFriend');
  window.getAllFriendList = registeMethodOnWindow('getAllFriendList');
  window.searchFriendList = registeMethodOnWindow('searchFriendList');
  window.getFriendInfoByFriendUserID = registeMethodOnWindow(
    'getFriendInfoByFriendUserID'
  );
  window.getFriendInfoList = registeMethodOnWindow('getFriendInfoList');
  window.getPageFriendList = registeMethodOnWindow('getPageFriendList');
  window.updateColumnsFriend = registeMethodOnWindow('updateColumnsFriend');
  window.getFriendListCount = registeMethodOnWindow('getFriendListCount');
  window.batchInsertFriend = registeMethodOnWindow('batchInsertFriend');
  window.deleteAllFriend = registeMethodOnWindow('deleteAllFriend');

  // groups
  window.insertGroup = registeMethodOnWindow('insertGroup');
  window.deleteGroup = registeMethodOnWindow('deleteGroup');
  window.updateGroup = registeMethodOnWindow('updateGroup');
  window.getJoinedGroupListDB = registeMethodOnWindow('getJoinedGroupList');
  window.getGroupInfoByGroupID = registeMethodOnWindow('getGroupInfoByGroupID');
  window.getAllGroupInfoByGroupIDOrGroupName = registeMethodOnWindow(
    'getAllGroupInfoByGroupIDOrGroupName'
  );
  window.subtractMemberCount = registeMethodOnWindow('subtractMemberCount');
  window.addMemberCount = registeMethodOnWindow('addMemberCount');
  window.getJoinedWorkingGroupIDList = registeMethodOnWindow(
    'getJoinedWorkingGroupIDList'
  );
  window.getJoinedWorkingGroupList = registeMethodOnWindow(
    'getJoinedWorkingGroupList'
  );
  window.getGroupMemberAllGroupIDs = registeMethodOnWindow(
    'getGroupMemberAllGroupIDs'
  );
  window.getUserJoinedGroupIDs = registeMethodOnWindow('getUserJoinedGroupIDs');
  window.getGroups = registeMethodOnWindow('getGroups');
  window.getGroupMemberListByUserIDs = registeMethodOnWindow(
    'getGroupMemberListByUserIDs'
  );
  window.batchInsertGroup = registeMethodOnWindow('batchInsertGroup');
  window.deleteAllGroup = registeMethodOnWindow('deleteAllGroup');

  // groupRequest
  window.insertGroupRequest = registeMethodOnWindow('insertGroupRequest');
  window.deleteGroupRequest = registeMethodOnWindow('deleteGroupRequest');
  window.updateGroupRequest = registeMethodOnWindow('updateGroupRequest');
  window.getSendGroupApplication = registeMethodOnWindow(
    'getSendGroupApplication'
  );
  window.insertAdminGroupRequest = registeMethodOnWindow(
    'insertAdminGroupRequest'
  );
  window.deleteAdminGroupRequest = registeMethodOnWindow(
    'deleteAdminGroupRequest'
  );
  window.updateAdminGroupRequest = registeMethodOnWindow(
    'updateAdminGroupRequest'
  );
  window.getAdminGroupApplication = registeMethodOnWindow(
    'getAdminGroupApplication'
  );

  // groupMember
  window.getGroupMemberInfoByGroupIDUserID = registeMethodOnWindow(
    'getGroupMemberInfoByGroupIDUserID'
  );
  window.getAllGroupMemberList = registeMethodOnWindow('getAllGroupMemberList');
  window.getAllGroupMemberUserIDList = registeMethodOnWindow(
    'getAllGroupMemberUserIDList'
  );
  window.getGroupMemberCount = registeMethodOnWindow('getGroupMemberCount');
  window.getGroupSomeMemberInfo = registeMethodOnWindow(
    'getGroupSomeMemberInfo'
  );
  window.getGroupAdminID = registeMethodOnWindow('getGroupAdminID');
  window.getGroupMemberListByGroupID = registeMethodOnWindow(
    'getGroupMemberListByGroupID'
  );
  window.getGroupMemberListSplit = registeMethodOnWindow(
    'getGroupMemberListSplit'
  );
  window.getGroupMemberOwnerAndAdminDB = registeMethodOnWindow(
    'getGroupMemberOwnerAndAdmin'
  );
  window.getGroupMemberOwner = registeMethodOnWindow('getGroupMemberOwner');
  window.getGroupMemberListSplitByJoinTimeFilter = registeMethodOnWindow(
    'getGroupMemberListSplitByJoinTimeFilter'
  );
  window.getGroupOwnerAndAdminByGroupID = registeMethodOnWindow(
    'getGroupOwnerAndAdminByGroupID'
  );
  window.getGroupMemberUIDListByGroupID = registeMethodOnWindow(
    'getGroupMemberUIDListByGroupID'
  );
  window.insertGroupMember = registeMethodOnWindow('insertGroupMember');
  window.batchInsertGroupMember = registeMethodOnWindow(
    'batchInsertGroupMember'
  );
  window.deleteGroupMember = registeMethodOnWindow('deleteGroupMember');
  window.deleteGroupAllMembers = registeMethodOnWindow('deleteGroupAllMembers');
  window.updateGroupMember = registeMethodOnWindow('updateGroupMember');
  window.updateGroupMemberField = registeMethodOnWindow(
    'updateGroupMemberField'
  );
  window.searchGroupMembersDB = registeMethodOnWindow(
    'searchGroupMembers',
    'searchGroupMembersDB'
  );

  // temp cache chat logs
  window.batchInsertTempCacheMessageList = registeMethodOnWindow(
    'batchInsertTempCacheMessageList'
  );
  window.InsertTempCacheMessage = registeMethodOnWindow(
    'InsertTempCacheMessage'
  );

  // notification
  window.getNotificationAllSeqs = registeMethodOnWindow(
    'getNotificationAllSeqs'
  );
  window.setNotificationSeq = registeMethodOnWindow('setNotificationSeq');
  window.batchInsertNotificationSeq = registeMethodOnWindow(
    'batchInsertNotificationSeq'
  );

  window.getExistedTables = registeMethodOnWindow('getExistedTables');
}

export const workerPromise = rpc?.connect(5000);
