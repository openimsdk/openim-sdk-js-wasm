import { Platform } from './enum';
import { CreateGroupParams } from './params';

type DatabaseApi = (...args: any[]) => Promise<any>;

declare global {
  interface Window {
    // registered by js to provide database api
    [functionName: DatabaseAPI]: (...args: any[]) => Promise<any>;
    // [functionName: string]: (...args: any[]) => Promise<any>;

    // upload
    wasmOpen: DatabaseApi;
    wasmClose: DatabaseApi;
    wasmRead: DatabaseApi;
    getUpload: DatabaseApi;
    insertUpload: DatabaseApi;
    updateUpload: DatabaseApi;
    deleteUpload: DatabaseApi;
    fileMapSet: DatabaseApi;
    fileMapClear: DatabaseApi;

    setSqlWasmPath: DatabaseApi;
    initDB: DatabaseApi;
    // message
    getMessage: DatabaseApi;
    getMultipleMessage: DatabaseApi;
    getSendingMessageList: DatabaseApi;
    getNormalMsgSeq: DatabaseApi;
    updateMessageTimeAndStatus: DatabaseApi;
    updateMessage: DatabaseApi;
    updateMessageBySeq: DatabaseApi;
    updateColumnsMessage: DatabaseApi;
    insertMessage: DatabaseApi;
    batchInsertMessageList: DatabaseApi;
    getMessageList: DatabaseApi;
    getMessageListNoTime: DatabaseApi;
    messageIfExists: DatabaseApi;
    messageIfExistsBySeq: DatabaseApi;
    getAbnormalMsgSeq: DatabaseApi;
    getAbnormalMsgSeqList: DatabaseApi;
    batchInsertExceptionMsg: DatabaseApi;
    searchMessageByKeyword: DatabaseApi;
    searchMessageByContentType: DatabaseApi;
    searchMessageByContentTypeAndKeyword: DatabaseApi;
    updateMsgSenderNickname: DatabaseApi;
    updateMsgSenderFaceURL: DatabaseApi;
    updateMsgSenderFaceURLAndSenderNickname: DatabaseApi;
    getMsgSeqByClientMsgID: DatabaseApi;
    getMsgSeqListByGroupID: DatabaseApi;
    getMsgSeqListByPeerUserID: DatabaseApi;
    getMsgSeqListBySelfUserID: DatabaseApi;
    deleteAllMessage: DatabaseApi;
    getAllUnDeleteMessageSeqList: DatabaseApi;
    updateSingleMessageHasRead: DatabaseApi;
    updateGroupMessageHasRead: DatabaseApi;
    updateMessageStatusBySourceID: DatabaseApi;
    getAlreadyExistSeqList: DatabaseApi;
    getLatestValidServerMessage: DatabaseApi;
    getMessageBySeq: DatabaseApi;
    getMessagesByClientMsgIDs: DatabaseApi;
    getMessagesBySeqs: DatabaseApi;
    getConversationNormalMsgSeq: DatabaseApi;
    checkConversationNormalMsgSeq: DatabaseApi;
    getConversationPeerNormalMsgSeq: DatabaseApi;
    deleteConversationAllMessages: DatabaseApi;
    markDeleteConversationAllMessages: DatabaseApi;
    getUnreadMessage: DatabaseApi;
    markConversationMessageAsReadBySeqs: DatabaseApi;
    markConversationMessageAsReadDB: DatabaseApi;
    deleteConversationMsgs: DatabaseApi;
    markConversationAllMessageAsRead: DatabaseApi;
    searchAllMessageByContentType: DatabaseApi;
    insertSendingMessage: DatabaseApi;
    deleteSendingMessage: DatabaseApi;
    getAllSendingMessages: DatabaseApi;
    getLatestActiveMessage: DatabaseApi;
    // conversation
    getAllConversationListDB: DatabaseApi;
    getAllConversationListToSync: DatabaseApi;
    getHiddenConversationList: DatabaseApi;
    getConversation: DatabaseApi;
    getMultipleConversationDB: DatabaseApi;
    updateColumnsConversation: DatabaseApi;
    updateConversation: DatabaseApi;
    updateConversationForSync: DatabaseApi;
    decrConversationUnreadCount: DatabaseApi;
    batchInsertConversationList: DatabaseApi;
    insertConversation: DatabaseApi;
    getTotalUnreadMsgCountDB: DatabaseApi;
    batchUpdateConversationList: DatabaseApi;
    clearAllConversation: DatabaseApi;
    clearConversation: DatabaseApi;
    conversationIfExists: DatabaseApi;
    deleteConversation: DatabaseApi;
    deleteAllConversation: DatabaseApi;
    getConversationByUserID: DatabaseApi;
    getConversationListSplitDB: DatabaseApi;
    incrConversationUnreadCount: DatabaseApi;
    removeConversationDraft: DatabaseApi;
    resetAllConversation: DatabaseApi;
    resetConversation: DatabaseApi;
    setConversationDraftDB: DatabaseApi;
    setMultipleConversationRecvMsgOpt: DatabaseApi;
    unPinConversation: DatabaseApi;
    getAllSingleConversationIDList: DatabaseApi;
    findAllUnreadConversationConversationID: DatabaseApi;
    getAllConversationIDList: DatabaseApi;
    getAllConversations: DatabaseApi;
    searchConversations: DatabaseApi;
    // users
    getLoginUser: DatabaseApi;
    insertLoginUser: DatabaseApi;
    updateLoginUser: DatabaseApi;
    getStrangerInfo: DatabaseApi;
    setStrangerInfo: DatabaseApi;
    getJoinedSuperGroupList: DatabaseApi;
    getJoinedSuperGroupIDList: DatabaseApi;
    getSuperGroupInfoByGroupID: DatabaseApi;
    deleteSuperGroup: DatabaseApi;
    insertSuperGroup: DatabaseApi;
    updateSuperGroup: DatabaseApi;
    // app sdk version
    getAppSDKVersion: DatabaseApi;
    setAppSDKVersion: DatabaseApi;
    // version sync
    getVersionSync: DatabaseApi;
    setVersionSync: DatabaseApi;
    deleteVersionSync: DatabaseApi;
    // unread messages
    deleteConversationUnreadMessageList: DatabaseApi;
    batchInsertConversationUnreadMessageList: DatabaseApi;
    // super group messages
    superGroupGetMessage: DatabaseApi;
    superGroupGetMultipleMessage: DatabaseApi;
    superGroupGetNormalMinSeq: DatabaseApi;
    getSuperGroupNormalMsgSeq: DatabaseApi;
    superGroupUpdateMessageTimeAndStatus: DatabaseApi;
    superGroupUpdateMessage: DatabaseApi;
    superGroupInsertMessage: DatabaseApi;
    superGroupBatchInsertMessageList: DatabaseApi;
    superGroupGetMessageListNoTime: DatabaseApi;
    superGroupGetMessageList: DatabaseApi;
    superGroupUpdateColumnsMessage: DatabaseApi;
    superGroupDeleteAllMessage: DatabaseApi;
    superGroupSearchMessageByKeyword: DatabaseApi;
    superGroupSearchMessageByContentType: DatabaseApi;
    superGroupSearchMessageByContentTypeAndKeyword: DatabaseApi;
    superGroupUpdateMessageStatusBySourceID: DatabaseApi;
    superGroupGetSendingMessageList: DatabaseApi;
    superGroupUpdateGroupMessageHasRead: DatabaseApi;
    superGroupGetMsgSeqByClientMsgID: DatabaseApi;
    superGroupUpdateMsgSenderFaceURLAndSenderNickname: DatabaseApi;
    superGroupSearchAllMessageByContentType: DatabaseApi;
    getRowsModified: DatabaseApi;

    // black
    getBlackListDB: DatabaseApi;
    getBlackListUserID: DatabaseApi;
    getBlackInfoByBlockUserID: DatabaseApi;
    getBlackInfoList: DatabaseApi;
    insertBlack: DatabaseApi;
    deleteBlack: DatabaseApi;
    updateBlack: DatabaseApi;

    // friendRequest
    insertFriendRequest: DatabaseApi;
    deleteFriendRequestBothUserID: DatabaseApi;
    updateFriendRequest: DatabaseApi;
    getRecvFriendApplication: DatabaseApi;
    getSendFriendApplication: DatabaseApi;
    getFriendApplicationByBothID: DatabaseApi;
    getBothFriendReq: DatabaseApi;

    // friend
    insertFriend: DatabaseApi;
    deleteFriendDB: DatabaseApi;
    updateFriend: DatabaseApi;
    getAllFriendList: DatabaseApi;
    searchFriendList: DatabaseApi;
    getFriendInfoByFriendUserID: DatabaseApi;
    getFriendInfoList: DatabaseApi;
    getPageFriendList: DatabaseApi;
    updateColumnsFriend: DatabaseApi;
    getFriendListCount: DatabaseApi;
    batchInsertFriend: DatabaseApi;
    deleteAllFriend: DatabaseApi;

    // groups
    insertGroup: DatabaseApi;
    deleteGroup: DatabaseApi;
    updateGroup: DatabaseApi;
    getJoinedGroupListDB: DatabaseApi;
    getGroupInfoByGroupID: DatabaseApi;
    getAllGroupInfoByGroupIDOrGroupName: DatabaseApi;
    subtractMemberCount: DatabaseApi;
    addMemberCount: DatabaseApi;
    getJoinedWorkingGroupIDList: DatabaseApi;
    getJoinedWorkingGroupList: DatabaseApi;
    getGroupMemberAllGroupIDs: DatabaseApi;
    getUserJoinedGroupIDs: DatabaseApi;
    getGroups: DatabaseApi;
    batchInsertGroup: DatabaseApi;
    deleteAllGroup: DatabaseApi;

    // groupRequest
    insertGroupRequest: DatabaseApi;
    deleteGroupRequest: DatabaseApi;
    updateGroupRequest: DatabaseApi;
    getSendGroupApplication: DatabaseApi;
    insertAdminGroupRequest: DatabaseApi;
    deleteAdminGroupRequest: DatabaseApi;
    updateAdminGroupRequest: DatabaseApi;
    getAdminGroupApplication: DatabaseApi;

    // groupMember
    getGroupMemberInfoByGroupIDUserID: DatabaseApi;
    getAllGroupMemberList: DatabaseApi;
    getAllGroupMemberUserIDList: DatabaseApi;
    getGroupMemberCount: DatabaseApi;
    getGroupSomeMemberInfo: DatabaseApi;
    getGroupAdminID: DatabaseApi;
    getGroupMemberListByGroupID: DatabaseApi;
    getGroupMemberListSplit: DatabaseApi;
    getGroupMemberOwnerAndAdminDB: DatabaseApi;
    getGroupMemberOwner: DatabaseApi;
    getGroupMemberListByUserIDs: DatabaseApi;
    getGroupMemberListSplitByJoinTimeFilter: DatabaseApi;
    getGroupOwnerAndAdminByGroupID: DatabaseApi;
    getGroupMemberUIDListByGroupID: DatabaseApi;
    insertGroupMember: DatabaseApi;
    batchInsertGroupMember: DatabaseApi;
    deleteGroupMember: DatabaseApi;
    deleteGroupAllMembers: DatabaseApi;
    updateGroupMember: DatabaseApi;
    updateGroupMemberField: DatabaseApi;
    searchGroupMembersDB: DatabaseApi;

    // temp chche logs
    batchInsertTempCacheMessageList: DatabaseApi;
    InsertTempCacheMessage: DatabaseApi;

    // notification
    getNotificationAllSeqs: DatabaseApi;
    batchInsertNotificationSeq: DatabaseApi;
    setNotificationSeq: DatabaseApi;

    // table master
    getExistedTables: DatabaseApi;

    // registered by go wasm
    initSDK: (operationID: string, config: string) => void;
    login: (operationID: string, userID: string, token: string) => Promise<any>;
    logout: (operationID: string) => Promise<any>;
    commonEventFunc: (listener: (event: string) => void) => void;
    createTextMessage: (operationID: string, text: string) => Promise<string[]>;
    getAllConversationList: (operationID: string) => Promise<string>;
    getOneConversation: (
      operationID: string,
      sessionType: number,
      sourceID: string
    ) => Promise<string>;
    getAdvancedHistoryMessageList: (
      operationID: string,
      getAdvancedHistoryMessageListParamsStr: string
    ) => Promise<string>;
    getAdvancedHistoryMessageListReverse: (
      operationID: string,
      getAdvancedHistoryMessageListReverseParamsStr: string
    ) => Promise<string>;
    fetchSurroundingMessages: (
      operationID: string,
      fetchSurroundingMessagesParamsStr: string
    ) => Promise<string>;
    getHistoryMessageList: (
      operationID: string,
      getHistoryMsgParamsParamsStr: string
    ) => Promise<string>;
    getSpecifiedGroupsInfo: (
      operationID: string,
      params: string
    ) => Promise<string>;
    deleteConversationAndDeleteAllMsg: (
      operationID: string,
      conversationID: string
    ) => Promise<string>;
    markConversationMessageAsRead: (
      operationID: string,
      conversationID: string
    ) => Promise<string>;
    markMessagesAsReadByMsgID: (
      operationID: string,
      conversationID: string,
      msgIDListStr: string
    ) => Promise<string>;
    sendGroupMessageReadReceipt: (
      operationID: string,
      conversationID: string,
      msgIDListStr: string
    ) => Promise<string>;
    getGroupMessageReaderList: (
      operationID: string,
      conversationID: string,
      clientMsgID: string
    ) => Promise<string>;
    getGroupMemberList: (
      operationID: string,
      groupID: string,
      filter: number,
      offset: number,
      count: number
    ) => Promise<string>;
    createImageMessageByURL: (
      operationID: string,
      sourcePictureStr: string,
      bigPictureStr: string,
      snapshotPictureStr: string
    ) => Promise<string>;
    createCustomMessage: (
      operationID: string,
      data: string,
      extension: string,
      description: string
    ) => Promise<string>;
    createQuoteMessage: (
      operationID: string,
      text: string,
      message: string
    ) => Promise<string>;
    createAdvancedQuoteMessage: (
      operationID: string,
      text: string,
      message: string,
      messageEntityListStr: string
    ) => Promise<string>;
    createAdvancedTextMessage: (
      operationID: string,
      text: string,
      messageEntityListStr: string
    ) => Promise<string>;
    sendMessage: (
      operationID: string,
      message: string,
      recvID: string,
      groupID: string,
      offlinePushInfoStr: string
    ) => Promise<string>;
    sendMessageNotOss: (
      operationID: string,
      message: string,
      recvID: string,
      groupID: string,
      offlinePushInfoStr: string,
      fileArrayBuffer?: ArrayBuffer,
      snpFileArrayBuffer?: ArrayBuffer
    ) => Promise<string>;
    sendMessageByBuffer: (
      operationID: string,
      message: string,
      recvID: string,
      groupID: string,
      offlinePushInfoStr: string
    ) => Promise<string>;
    setMessageLocalEx: (
      operationID: string,
      conversationID: string,
      clientMsgID: string,
      localEx: string
    ) => Promise<string>;
    getHistoryMessageListReverse: (
      operationID: string,
      getMessageOptions: string
    ) => Promise<string>;
    revokeMessage: (
      operationID: string,
      conversationID: string,
      clientMsgID: string
    ) => Promise<string>;
    setConversationPrivateChat: (
      operationID: string,
      conversationID: string,
      isPrivate: boolean
    ) => Promise<string>;
    setConversationBurnDuration: (
      operationID: string,
      conversationID: string,
      burnDuration: number
    ) => Promise<string>;
    getLoginStatus: (operationID: string) => Promise<string>;
    setAppBackgroundStatus: (
      isBackground: boolean,
      operationID: string
    ) => Promise<string>;
    iLogin: (
      operationID: string,
      token: string,
      userID: string
    ) => Promise<string>;
    getLoginUserID: (operationID: string) => Promise<string>;
    getSelfUserInfo: (operationID: string) => Promise<string>;
    getUsersInfo: (
      operationID: string,
      userIDList: string[]
    ) => Promise<string>;
    getUsersInfoWithCache: (
      operationID: string,
      userIDList: string[],
      groupID: string
    ) => Promise<string>;
    setSelfInfo: (operationID: string, userInfo: string[]) => Promise<string>;
    createTextAtMessage: (
      operationID: string,
      text: string,
      atUserIDList: string[],
      atUsersInfo?: AtUsersInfoItem[],
      message?: string
    ) => Promise<string>;
    createSoundMessageByURL: (
      operationID: string,
      uuid: string,
      soundPath: string,
      sourceUrl: string,
      dataSize: number,
      duration: number
    ) => Promise<string>;
    createVideoMessageByURL: (
      operationID: string,
      videoPath: string,
      duration: string,
      videoType: string,
      snapshotPath: number,
      videoUUID: number,
      videoUrl: string,
      videoSize: number,
      snapshotUUID: string,
      snapshotSize: number,
      snapshotUrl: string,
      snapshotWidth: number,
      snapshotHeight: number
    ) => Promise<string>;
    createFileMessageByURL: (
      operationID: string,
      filePath: string,
      fileName: string,
      uuid: string,
      sourceUrl: string,
      fileSize: number
    ) => Promise<string>;
    createFileMessageFromFullPath: (
      operationID: string,
      fileFullPath: string,
      fileName: string
    ) => Promise<string>;
    createImageMessageFromFullPath: (
      operationID: string,
      imageFullPath: string
    ) => Promise<string>;
    createSoundMessageFromFullPath: (
      operationID: string,
      soundPath: string,
      duration: number
    ) => Promise<string>;
    createVideoMessageFromFullPath: (
      operationID: string,
      videoFullPath: string,
      videoType: string,
      duration: number,
      snapshotFullPath: string
    ) => Promise<string>;
    createMergerMessage: (
      operationID: string,
      messageList: MessageItem[],
      title: string,
      summaryList: string[]
    ) => Promise<string>;
    createForwardMessage: (operationID: string, m: string) => Promise<string>;
    createFaceMessage: (
      operationID: string,
      index: number,
      data: string
    ) => Promise<string>;
    createLocationMessage: (
      operationID: string,
      description: string,
      longitude: number,
      latitude: number
    ) => Promise<string>;
    createCardMessage: (
      operationID: string,
      cardInfo: string
    ) => Promise<string>;
    deleteMessageFromLocalStorage: (
      operationID: string,
      conversationID: string,
      clientMsgID: string
    ) => Promise<string>;
    deleteMessage: (
      operationID: string,
      conversationID: string,
      clientMsgID: string
    ) => Promise<string>;
    deleteAllConversationFromLocal: (operationID: string) => Promise<string>;
    deleteAllMsgFromLocal: (operationID: string) => Promise<string>;
    deleteAllMsgFromLocalAndSvr: (operationID: string) => Promise<string>;
    insertSingleMessageToLocalStorage: (
      operationID: string,
      message: string,
      recvID: string,
      sendID: string
    ) => Promise<string>;
    insertGroupMessageToLocalStorage: (
      operationID: string,
      message: string,
      groupID: string,
      sendID: string
    ) => Promise<string>;
    typingStatusUpdate: (
      operationID: string,
      recvID: string,
      msgTip: string
    ) => Promise<string>;
    changeInputStates: (
      operationID: string,
      conversationID: string,
      focus: boolean
    ) => Promise<void>;
    getInputstates: (
      operationID: string,
      conversationID: string,
      userID: string
    ) => Promise<Platform[]>;
    markNotifyMessageHasRead: (
      operationID: string,
      conversationID: string
    ) => Promise<string>;
    clearConversationAndDeleteAllMsg: (
      operationID: string,
      userID: string
    ) => Promise<string>;
    hideConversation: (
      operationID: string,
      conversationID: string
    ) => Promise<string>;
    getConversationListSplit: (
      operationID: string,
      offset: number,
      count: number
    ) => Promise<string>;
    searchConversation: (
      operationID: string,
      searchParams: string
    ) => Promise<string>;
    setConversationEx: (
      operationID: string,
      conversationID: number,
      ex: number
    ) => Promise<string>;
    getConversationIDBySessionType: (
      operationID: string,
      sourceID: string,
      sessionType: number
    ) => Promise<string>;
    getMultipleConversation: (
      operationID: string,
      conversationIDList: string[]
    ) => Promise<string>;
    deleteConversation: (
      operationID: string,
      conversationID: string
    ) => Promise<string>;
    setConversationDraft: (
      operationID: string,
      conversationID: string,
      draftText: string
    ) => Promise<string>;
    pinConversation: (
      operationID: string,
      conversationID: string,
      isPinned: boolean
    ) => Promise<string>;
    getTotalUnreadMsgCount: (operationID: string) => Promise<string>;
    getConversationRecvMessageOpt: (
      operationID: string,
      conversationIDList: string[]
    ) => Promise<string>;
    setConversationRecvMessageOpt: (
      operationID: string,
      conversationID: string,
      opt: OptType
    ) => Promise<string>;
    searchLocalMessages: (
      operationID: string,
      options: string
    ) => Promise<string>;
    addFriend: (
      operationID: string,
      toUserID: string,
      reqMsg: string
    ) => Promise<string>;
    searchFriends: (
      operationID: string,
      keywordList: string[],
      isSearchUserID: boolean,
      isSearchNickname: boolean,
      isSearchRemark: boolean
    ) => Promise<string>;
    getSpecifiedFriendsInfo: (
      operationID: string,
      userIDList: string[]
    ) => Promise<string>;
    getFriendApplicationListAsRecipient: (
      operationID: string,
      handleResults: number[],
      offset: number,
      count: number
    ) => Promise<string>;
    getFriendApplicationListAsApplicant: (
      operationID: string,
      offset: number,
      count: number
    ) => Promise<string>;
    getFriendApplicationUnhandledCount: (
      operationID: string,
      time: number
    ) => Promise<number>;
    getFriendList: (operationID: string) => Promise<string>;
    getFriendListPage: (operationID: string) => Promise<string>;
    updateFriends: (operationID: string, friends: string) => Promise<string>;
    setFriendRemark: (
      operationID: string,
      toUserID: string,
      remark: string
    ) => Promise<string>;
    pinFriends: (
      operationID: string,
      pinFriendParams: string
    ) => Promise<string>;
    setFriendsEx: (
      operationID: string,
      toUserIDs: string,
      ex: string
    ) => Promise<string>;
    checkFriend: (operationID: string, userIDList: string[]) => Promise<string>;
    acceptFriendApplication: (
      operationID: string,
      toUserID: string,
      handleMsg: string
    ) => Promise<string>;
    refuseFriendApplication: (
      operationID: string,
      toUserID: string,
      handleMsg: string
    ) => Promise<string>;
    deleteFriend: (
      operationID: string,
      friendUserID: string
    ) => Promise<string>;
    addBlack: (operationID: string, blackUserID: string) => Promise<string>;
    removeBlack: (operationID: string, removeUserID: string) => Promise<string>;
    getBlackList: (operationID: string) => Promise<string>;
    inviteUserToGroup: (
      operationID: string,
      groupID: string,
      reason: string,
      userIDList: string[]
    ) => Promise<string>;
    kickGroupMember: (
      operationID: string,
      groupID: string,
      reason: string,
      userIDList: string[]
    ) => Promise<string>;
    isJoinGroup: (operationID: string, groupID: string) => Promise<string>;
    getSpecifiedGroupMembersInfo: (
      operationID: string,
      groupID: string,
      reason: string,
      userIDList: string[]
    ) => Promise<string>;
    getUsersInGroup: (
      operationID: string,
      groupID: string,
      reason: string,
      userIDList: string[]
    ) => Promise<string>;
    getGroupMemberListByJoinTimeFilter: (
      operationID: string,
      groupID: string,
      filterUserIDList: string[],
      offset: number,
      count: number,
      joinTimeBegin: number,
      joinTimeEnd: number
    ) => Promise<string>;
    searchGroupMembers: (
      operationID: string,
      groupID: string,
      keywordList: string[],
      isSearchUserID: boolean,
      isSearchMemberNickname: boolean,
      offset: number,
      count: number
    ) => Promise<string>;
    setGroupApplyMemberFriend: (
      operationID: string,
      rule: AllowType,
      groupID: string
    ) => Promise<string>;
    setGroupLookMemberInfo: (
      operationID: string,
      rule: AllowType,
      groupID: string
    ) => Promise<string>;
    getJoinedGroupList: (operationID: string) => Promise<string>;
    getJoinedGroupListPage: (operationID: string) => Promise<string>;
    createGroup: (
      operationID: string,
      options: CreateGroupParams
    ) => Promise<string>;
    setGroupInfo: (
      operationID: string,
      groupBaseInfo: string
    ) => Promise<string>;
    setGroupMemberNickname: (
      operationID: string,
      groupID: string,
      userID: string,
      GroupMemberNickname: string
    ) => Promise<string>;
    setGroupMemberInfo: (
      operationID: string,
      memberInfo: string
    ) => Promise<string>;
    joinGroup: (
      operationID: string,
      groupID: string,
      reqMsg: string,
      joinSource: GroupJoinSource
    ) => Promise<string>;
    searchGroups: (
      operationID: string,
      keywordList: string[],
      isSearchGroupID: boolean,
      isSearchGroupName: boolean
    ) => Promise<string>;
    quitGroup: (operationID: string, groupID: string) => Promise<string>;
    dismissGroup: (operationID: string, groupID: string) => Promise<string>;
    changeGroupMute: (
      operationID: string,
      groupID: string,
      isMute: boolean
    ) => Promise<string>;
    changeGroupMemberMute: (
      operationID: string,
      groupID: string,
      userID: string,
      mutedSeconds: number
    ) => Promise<string>;
    transferGroupOwner: (
      operationID: string,
      groupID: string,
      newOwnerUserID: string
    ) => Promise<string>;
    getGroupMemberOwnerAndAdmin: (
      operationID: string,
      groupID: string
    ) => Promise<string>;
    getGroupApplicationListAsApplicant: (
      operationID: string,
      groupID: string[],
      handleResults: number[],
      offset: number,
      count: number
    ) => Promise<string>;
    getGroupApplicationListAsRecipient: (
      operationID: string,
      groupID: string[],
      handleResults: number[],
      offset: number,
      count: number
    ) => Promise<string>;
    getGroupApplicationUnhandledCount: (
      operationID: string,
      time: number
    ) => Promise<number>;
    acceptGroupApplication: (
      operationID: string,
      groupID: string,
      fromUserID: string,
      handleMsg: string
    ) => Promise<string>;
    refuseGroupApplication: (
      operationID: string,
      groupID: string,
      fromUserID: string,
      handleMsg: string
    ) => Promise<string>;
    resetConversationGroupAtType: (
      operationID: string,
      conversationID: string
    ) => Promise<string>;
    setGroupMemberRoleLevel: (
      operationID: string,
      groupID: string,
      userID: string,
      roleLevel: GroupRole
    ) => Promise<string>;
    setGroupVerification: (
      operationID: string,
      verification: GroupVerificationType,
      groupID: string
    ) => Promise<string>;
    setGlobalRecvMessageOpt: (
      operationID: string,
      opt: OptType
    ) => Promise<string>;
    newRevokeMessage: (operationID: string, message: string) => Promise<string>;
    wakeUp: (operationID: string) => Promise<string>;
    findMessageList: (
      operationID: string,
      conversationID: string,
      clientMsgIDList: string[]
    ) => Promise<string>;
    uploadFile: (operationID: string, upload: UploadParams) => Promise<string>;
    networkStatusChanged: (operationID: string) => Promise<string>;
    subscribeUsersStatus: (
      userIDList: string[],
      operationID: string
    ) => Promise<string>;
    unsubscribeUsersStatus: (
      userIDList: string[],
      operationID: string
    ) => Promise<string>;
    getSubscribeUsersStatus: (operationID: string) => Promise<string>;
    getUserStatus: (operationID: string) => Promise<string>;
    setConversation: (
      operationID: string,
      conversationID: string,
      req: string
    ) => Promise<string>;

    signalingInvite: (...args) => Promise<string>;
    signalingInviteInGroup: (...args) => Promise<string>;
    signalingAccept: (...args) => Promise<string>;
    signalingReject: (...args) => Promise<string>;
    signalingCancel: (...args) => Promise<string>;
    signalingHungUp: (...args) => Promise<string>;
    signalingGetRoomByGroupID: (...args) => Promise<string>;
    signalingGetTokenByRoomID: (...args) => Promise<string>;
    getSignalingInvitationInfoStartApp: (...args) => Promise<string>;
    signalingSendCustomSignal: (...args) => Promise<string>;
    setConversationIsMsgDestruct: (...args) => Promise<string>;
    setConversationMsgDestructTime: (...args) => Promise<string>;

    // debug
    exec: (sql: string) => Promise<any>;
    exportDB: () => Promise<string>; //return Uint8Array
  }
  class Go {
    exited: boolean;
    importObject: WebAssembly.Imports;
    run: (instance: WebAssembly.Instance) => Promise<void>;
  }
}
