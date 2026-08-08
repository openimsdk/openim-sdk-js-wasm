import {
  MessageEntity,
  OfflinePush,
  Picture,
  AtUserInfo,
  MessageItem,
  SelfUserInfo,
  GroupItem,
  SignalingInvitation,
} from './entity';
import {
  AllowType,
  GroupJoinSource,
  GroupVerificationType,
  MessageType,
  MessageReceiveOption,
  GroupMemberRole,
  GroupMemberFilter,
  GroupMessageReaderFilter,
  LogLevel,
  GroupMentionType,
  MessageViewType,
} from './enum';

export type WasmPathConfig = {
  coreWasmPath?: string;
  sqlWasmPath?: string;
  debug?: boolean;
};

export type LoginParams = {
  userID: string;
  token: string;
  platformID: number;
  apiAddr: string;
  wsAddr: string;
  logLevel?: LogLevel;
  isLogStandardOutput?: boolean;
  isExternalExtensions?: boolean;
  tryParse?: boolean;
};

export type ConversationSessionParams = {
  sourceID: string;
  sessionType: number;
};
export type GetAdvancedHistoryMessageListParams = {
  count: number;
  viewType: MessageViewType;
  startClientMsgID: string;
  conversationID: string;
};
export type GetGroupMemberListParams = {
  groupID: string;
  filter: GroupMemberFilter;
  offset: number;
  count: number;
};
export type SendMessageParams = {
  recvID: string;
  groupID: string;
  offlinePushInfo?: OfflinePush;
  message: MessageItem;
  isOnlineOnly?: boolean;
};
export type SetMessageLocalExParams = {
  conversationID: string;
  clientMsgID: string;
  localEx: string;
};
export type CreateImageMessageByURLParams = {
  sourcePicture: Picture;
  bigPicture: Picture;
  snapshotPicture: Picture;
  sourcePath: string;
};
export type CreateVideoMessageByURLParams = {
  videoPath: string;
  duration: number;
  videoType: string;
  snapshotPath: string;
  videoUUID: string;
  videoUrl: string;
  videoSize: number;
  snapshotUUID: string;
  snapshotSize: number;
  snapshotUrl: string;
  snapshotWidth: number;
  snapshotHeight: number;
  snapShotType?: string;
};
export type CreateCustomMessageParams = {
  data: string;
  extension: string;
  description: string;
};
export type CreateQuoteMessageParams = {
  text: string;
  message: string;
};
export type CreateAdvancedQuoteMessageParams = {
  text: string;
  message: MessageItem;
  messageEntityList?: MessageEntity[];
};
export type CreateAdvancedTextMessageParams = {
  text: string;
  messageEntityList?: MessageEntity[];
};
export type SetConversationParams = {
  conversationID: string;
  recvMsgOpt?: MessageReceiveOption;
  groupAtType?: GroupMentionType;
  burnDuration?: number;
  msgDestructTime?: number;
  isPinned?: boolean;
  isPrivateChat?: boolean;
  isMsgDestruct?: boolean;
  ex?: string;
};
export type ConversationListPaginationParams = {
  offset: number;
  count: number;
};
export type SetConversationDraftParams = {
  conversationID: string;
  draftText: string;
};
export type JoinGroupParams = {
  groupID: string;
  reqMsg: string;
  joinSource: GroupJoinSource;
  ex?: string;
};
export type SearchGroupsParams = {
  keywordList: string[];
  isSearchGroupID: boolean;
  isSearchGroupName: boolean;
};
export type ChangeGroupMuteParams = {
  groupID: string;
  isMute: boolean;
};
export type ChangeGroupMemberMuteParams = {
  groupID: string;
  userID: string;
  mutedSeconds: number;
};
export type TransferGroupOwnerParams = {
  groupID: string;
  newOwnerUserID: string;
};
export type HandleGroupApplicationParams = {
  groupID: string;
  fromUserID: string;
  handleMsg: string;
};
export type CreateTextAtMessageParams = {
  text: string;
  atUserIDList: string[];
  atUsersInfo?: AtUserInfo[];
  message?: MessageItem;
};
export type CreateSoundMessageByURLParams = {
  uuid: string;
  soundPath: string;
  sourceUrl: string;
  dataSize: number;
  duration: number;
  soundType?: string;
};
export type CreateFileMessageByURLParams = {
  filePath: string;
  fileName: string;
  uuid: string;
  sourceUrl: string;
  fileSize: number;
  fileType?: string;
};
export type CreateMergerMessageParams = {
  messageList: MessageItem[];
  title: string;
  summaryList: string[];
};
export type CreateFaceMessageParams = {
  index: number;
  data: string;
};
export type CreateLocationMessageParams = {
  description: string;
  longitude: number;
  latitude: number;
};
export type InsertSingleMessageToLocalStorageParams = {
  message: MessageItem;
  recvID: string;
  sendID: string;
};
export type InsertGroupMessageToLocalStorageParams = {
  message: MessageItem;
  groupID: string;
  sendID: string;
};
export type ConversationMessageParams = {
  conversationID: string;
  clientMsgID: string;
};
export type MessageReadReceiptParams = {
  conversationID: string;
  clientMsgIDList: string[];
};
export type ChangeInputStatesParams = {
  conversationID: string;
  focus: boolean;
};
export type GetInputStatesParams = {
  conversationID: string;
  userID: string;
};
export type SearchLocalMessagesParams = {
  conversationID: string;
  keywordList: string[];
  keywordListMatchType?: number;
  senderUserIDList?: string[];
  messageTypeList?: MessageType[];
  searchTimePosition?: number;
  searchTimePeriod?: number;
  pageIndex?: number;
  count?: number;
};
export type AddFriendParams = {
  toUserID: string;
  reqMsg: string;
};
export type SearchFriendsParams = {
  keywordList: string[];
  isSearchUserID: boolean;
  isSearchNickname: boolean;
  isSearchRemark: boolean;
};
export type GetSpecifiedFriendsParams = {
  friendUserIDList: string[];
  filterBlack?: boolean;
};
export type UpdateFriendsParams = {
  friendUserIDs: string[];
  isPinned?: boolean;
  remark?: string;
  ex?: string;
};
export type HandleFriendApplicationParams = {
  toUserID: string;
  handleMsg: string;
};
export type AddBlackParams = {
  toUserID: string;
  ex?: string;
};
export type GroupMemberUserListParams = {
  groupID: string;
  userIDList: string[];
};
export type GroupMemberOperationParams = GroupMemberUserListParams & {
  reason: string;
};
export type GetGroupMemberListByJoinTimeFilterParams = {
  groupID: string;
  filterUserIDList: string[];
  offset: number;
  count: number;
  joinTimeBegin: number;
  joinTimeEnd: number;
};
export type SearchGroupMembersParams = {
  groupID: string;
  keywordList: string[];
  isSearchUserID: boolean;
  isSearchMemberNickname: boolean;
  offset: number;
  count: number;
};
export type PaginationParams = {
  offset: number;
  count: number;
};
export type CreateGroupParams = {
  memberUserIDs: string[];
  groupInfo: Partial<GroupItem>;
  adminUserIDs?: string[];
  ownerUserID?: string;
};
export type SetGroupMemberInfoParams = {
  groupID: string;
  userID: string;
  nickname?: string;
  faceURL?: string;
  roleLevel?: GroupMemberRole;
  ex?: string;
};
export type FindMessageQuery = {
  conversationID: string;
  clientMsgIDList: string[];
};
export type UploadFileParams = {
  name: string;
  contentType: string;
  uuid: string;
  file?: File;
  filepath?: string;
  cause?: string;
};
export type SetSelfInfoParams = Partial<
  Pick<
    SelfUserInfo,
    'nickname' | 'faceURL' | 'ex' | 'globalRecvMsgOpt' | 'addFriendPermission'
  >
>;

export type GroupApplicationListParams = {
  groupIDs: string[];
  handleResults: number[];
  offset: number;
  count: number;
};

export type GetFriendApplicationListAsRecipientParams = {
  handleResults: number[];
  offset: number;
  count: number;
};

export type GetFriendApplicationListAsApplicantParams = {
  offset: number;
  count: number;
};

export type ApplicationUnhandledCountParams = {
  time: number;
};

// Compatibility names retained for applications upgrading from patch.10.
/** @deprecated Use `LoginParams` instead. */
export type InitAndLoginConfig = LoginParams;
/** @deprecated Use `ConversationSessionParams` instead. */
export type GetOneConversationParams = ConversationSessionParams;
/** @deprecated Use `GetAdvancedHistoryMessageListParams` instead. */
export type GetAdvancedHistoryMsgParams = GetAdvancedHistoryMessageListParams;
/** @deprecated Use the Core-aligned surrounding-message parameters instead. */
export type FetchSurroundingParams = {
  startMessage: MessageItem;
  viewType: MessageViewType;
  before: number;
  after: number;
};
/** @deprecated Use the Core-aligned history-message parameters instead. */
export type GetHistoryMsgParams = {
  userID: string;
  groupID: string;
  count: number;
  startClientMsgID: string;
  conversationID?: string;
};
/** @deprecated Use `MessageReadReceiptParams` instead. */
export type SendGroupReadReceiptParams = MessageReadReceiptParams;
/** @deprecated Use the Core-aligned group reader parameters instead. */
export type GetGroupMessageReaderParams = {
  conversationID: string;
  clientMsgID: string;
  filter: GroupMessageReaderFilter;
  offset: number;
  count: number;
};
/** @deprecated Use `GetGroupMemberListParams` instead. */
export type GetGroupMemberParams = GetGroupMemberListParams;
/** @deprecated Use `SendMessageParams` instead. */
export type SendMsgParams = SendMessageParams;
/** @deprecated Use `CreateImageMessageByURLParams` instead. */
export type ImageMsgParamsByURL = CreateImageMessageByURLParams;
/** @deprecated Use `CreateVideoMessageByURLParams` instead. */
export type VideoMsgParamsByURL = CreateVideoMessageByURLParams;
/** @deprecated Use the Core-aligned video message parameters instead. */
export type VideoMsgParamsByFullPath = {
  videoFullPath: string;
  videoType: string;
  duration: number;
  snapshotFullPath: string;
};
/** @deprecated Use `CreateCustomMessageParams` instead. */
export type CustomMsgParams = CreateCustomMessageParams;
/** @deprecated Use `CreateQuoteMessageParams` instead. */
export type QuoteMsgParams = CreateQuoteMessageParams;
/** @deprecated Use `CreateAdvancedQuoteMessageParams` instead. */
export type AdvancedQuoteMsgParams = CreateAdvancedQuoteMessageParams;
/** @deprecated Use `CreateAdvancedTextMessageParams` instead. */
export type AdvancedMsgParams = CreateAdvancedTextMessageParams;
/** @deprecated Use `SetConversationParams` instead. */
export type SetConversationPrivateStateParams = {
  conversationID: string;
  isPrivate: boolean;
};
/** @deprecated Use `ConversationListPaginationParams` instead. */
export type SplitConversationParams = ConversationListPaginationParams;
/** @deprecated Use `SetConversationParams` instead. */
export type SetConversationPinParams = {
  conversationID: string;
  isPinned: boolean;
};
/** @deprecated Use `SearchGroupsParams` instead. */
export type SearchGroupParams = SearchGroupsParams;
/** @deprecated Use `TransferGroupOwnerParams` instead. */
export type TransferGroupParams = TransferGroupOwnerParams;
/** @deprecated Use `HandleGroupApplicationParams` instead. */
export type AccessGroupApplicationParams = HandleGroupApplicationParams;
/** @deprecated Use `SetGroupMemberInfoParams` instead. */
export type SetGroupRoleParams = {
  groupID: string;
  userID: string;
  roleLevel: GroupMemberRole;
};
/** @deprecated Use the Core-aligned group verification parameters instead. */
export type SetGroupVerificationParams = {
  verification: GroupVerificationType;
  groupID: string;
};
/** @deprecated Use `SetConversationParams` instead. */
export type SetBurnDurationParams = {
  conversationID: string;
  burnDuration: number;
};
/** @deprecated Use `CreateTextAtMessageParams` instead. */
export type AtMsgParams = CreateTextAtMessageParams;
/** @deprecated Use `CreateSoundMessageByURLParams` instead. */
export type SoundMsgParamsByURL = CreateSoundMessageByURLParams;
/** @deprecated Use `CreateFileMessageByURLParams` instead. */
export type FileMsgParamsByURL = CreateFileMessageByURLParams;
/** @deprecated Use the Core-aligned file message parameters instead. */
export type FileMsgParamsByFullPath = {
  fileFullPath: string;
  fileName: string;
};
/** @deprecated Use the Core-aligned sound message parameters instead. */
export type SoundMsgParamsByFullPath = {
  soundPath: string;
  duration: number;
};
/** @deprecated Use `CreateMergerMessageParams` instead. */
export type MergerMsgParams = CreateMergerMessageParams;
/** @deprecated Use `CreateFaceMessageParams` instead. */
export type FaceMessageParams = CreateFaceMessageParams;
/** @deprecated Use `CreateLocationMessageParams` instead. */
export type LocationMsgParams = CreateLocationMessageParams;
/** @deprecated Use `InsertSingleMessageToLocalStorageParams` instead. */
export type InsertSingleMsgParams = InsertSingleMessageToLocalStorageParams;
/** @deprecated Use `InsertGroupMessageToLocalStorageParams` instead. */
export type InsertGroupMsgParams = InsertGroupMessageToLocalStorageParams;
/** @deprecated Use `ConversationMessageParams` instead. */
export type AccessMessageParams = ConversationMessageParams;
/** @deprecated Use `ChangeInputStatesParams` instead. */
export type TypingUpdateParams = {
  recvID: string;
  msgTip: string;
};
/** @deprecated Use `GetInputStatesParams` instead. */
export type GetInputstatesParams = GetInputStatesParams;
/** @deprecated Use `SetConversationParams` instead. */
export type SetConversationExParams = {
  conversationID: string;
  ex: string;
};
/** @deprecated Use `SetConversationParams` instead. */
export type SetConversationRecvOptParams = {
  conversationID: string;
  opt: MessageReceiveOption;
};
/** @deprecated Use `SearchLocalMessagesParams` instead. */
export type SearchLocalParams = SearchLocalMessagesParams;
/** @deprecated Use `SearchFriendsParams` instead. */
export type SearchFriendParams = SearchFriendsParams;
/** @deprecated Use `UpdateFriendsParams` instead. */
export type RemarkFriendParams = {
  toUserID: string;
  remark: string;
};
/** @deprecated Use `UpdateFriendsParams` instead. */
export type PinFriendParams = {
  toUserIDs: string[];
  isPinned: boolean;
};
/** @deprecated Use `UpdateFriendsParams` instead. */
export type SetFriendExParams = {
  toUserIDs: string[];
  ex: string;
};
/** @deprecated Use `HandleFriendApplicationParams` instead. */
export type AccessFriendApplicationParams = HandleFriendApplicationParams;
/** @deprecated Use `GroupMemberOperationParams` instead. */
export type AccessToGroupParams = GroupMemberOperationParams;
/** @deprecated Use `GetGroupMemberListByJoinTimeFilterParams` instead. */
export type GetGroupMemberByTimeParams =
  GetGroupMemberListByJoinTimeFilterParams;
/** @deprecated Use `SearchGroupMembersParams` instead. */
export type SearchGroupMemberParams = SearchGroupMembersParams;
/** @deprecated Use the Core-aligned group permission parameters instead. */
export type SetMemberPermissionParams = {
  rule: AllowType;
  groupID: string;
};
/** @deprecated Use `PaginationParams` instead. */
export type OffsetParams = PaginationParams;
/** @deprecated Use `SetGroupMemberInfoParams` instead. */
export type SetGroupMemberNickParams = {
  groupID: string;
  userID: string;
  groupMemberNickname: string;
};
/** @deprecated Use `SetGroupMemberInfoParams` instead. */
export type UpdateMemberInfoParams = SetGroupMemberInfoParams;
/** @deprecated Use `FindMessageQuery` instead. */
export type FindMessageParams = FindMessageQuery;
/** @deprecated Use `SetSelfInfoParams` instead. */
export type PartialUserItem = Partial<SelfUserInfo>;
/** @deprecated Use the Core-aligned signaling invitation parameters instead. */
export type SignalingInviteParams = {
  invitation: SignalingInvitation;
  offlinePushInfo?: OfflinePush;
};
/** @deprecated Use the Core-aligned signaling action parameters instead. */
export type RtcActionParams = {
  opUserID: string;
  invitation: SignalingInvitation;
};
/** @deprecated Use the Core-aligned custom signaling parameters instead. */
export type CustomSignalParams = {
  roomID: string;
  customInfo: string;
};
/** @deprecated Use `SetConversationParams` instead. */
export type SetConversationMsgDestructParams = {
  conversationID: string;
  isMsgDestruct: boolean;
};
/** @deprecated Use `SetConversationParams` instead. */
export type SetConversationMsgDestructTimeParams = {
  conversationID: string;
  msgDestructTime: number;
};
/** @deprecated Use `GroupApplicationListParams` instead. */
export type GetGroupApplicationListParams = {
  groupID: string[];
  handleResults: number[];
  offset: number;
  count: number;
};
/** @deprecated Use `GetFriendApplicationListAsApplicantParams` instead. */
export type GetFriendApplicationListAsApplicationParams =
  GetFriendApplicationListAsApplicantParams;
/** @deprecated Use `ApplicationUnhandledCountParams` instead. */
export type GetFriendApplicationUnhandledCountParams =
  ApplicationUnhandledCountParams;
/** @deprecated Use `ApplicationUnhandledCountParams` instead. */
export type GetSelfUnhandledApplyCountParams = ApplicationUnhandledCountParams;
