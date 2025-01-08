import {
  MessageEntity,
  OfflinePush,
  PicBaseInfo,
  AtUsersInfoItem,
  MessageItem,
  SelfUserInfo,
  RtcInvite,
  GroupItem,
} from './entity';
import {
  AllowType,
  GroupJoinSource,
  GroupVerificationType,
  MessageType,
  MessageReceiveOptType,
  GroupMemberRole,
  GroupMemberFilter,
  LogLevel,
  GroupMessageReaderFilter,
  GroupAtType,
  ViewType,
} from './enum';

export type WasmPathConfig = {
  coreWasmPath?: string;
  sqlWasmPath?: string;
  debug?: boolean;
};

export type InitAndLoginConfig = {
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

export type GetOneConversationParams = {
  sourceID: string;
  sessionType: number;
};
export type GetAdvancedHistoryMsgParams = {
  count: number;
  viewType: ViewType;
  startClientMsgID: string;
  conversationID: string;
};
export type FetchSurroundingParams = {
  startMessage: MessageItem;
  viewType: ViewType;
  before: number;
  after: number;
};
export type GetHistoryMsgParams = {
  userID: string;
  groupID: string;
  count: number;
  startClientMsgID: string;
  conversationID?: string;
};
export type SendGroupReadReceiptParams = {
  conversationID: string;
  clientMsgIDList: string[];
};
export type GetGroupMessageReaderParams = {
  conversationID: string;
  clientMsgID: string;
  filter: GroupMessageReaderFilter;
  offset: number;
  count: number;
};
export type GetGroupMemberParams = {
  groupID: string;
  filter: GroupMemberFilter;
  offset: number;
  count: number;
};
export type SendMsgParams = {
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
export type ImageMsgParamsByURL = {
  sourcePicture: PicBaseInfo;
  bigPicture: PicBaseInfo;
  snapshotPicture: PicBaseInfo;
  sourcePath: string;
};
export type VideoMsgParamsByURL = {
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
export type VideoMsgParamsByFullPath = {
  videoFullPath: string;
  videoType: string;
  duration: number;
  snapshotFullPath: string;
};
export type CustomMsgParams = {
  data: string;
  extension: string;
  description: string;
};
export type QuoteMsgParams = {
  text: string;
  message: string;
};
export type AdvancedQuoteMsgParams = {
  text: string;
  message: MessageItem;
  messageEntityList?: MessageEntity[];
};
export type AdvancedMsgParams = {
  text: string;
  messageEntityList?: MessageEntity[];
};
export type SetConversationParams = {
  conversationID: string;
  recvMsgOpt?: MessageReceiveOptType;
  groupAtType?: GroupAtType;
  burnDuration?: number;
  msgDestructTime?: number;
  isPinned?: boolean;
  isPrivateChat?: boolean;
  isMsgDestruct?: boolean;
  ex?: string;
};
export type SetConversationPrivateStateParams = {
  conversationID: string;
  isPrivate: boolean;
};
export type SplitConversationParams = {
  offset: number;
  count: number;
};
export type SetConversationDraftParams = {
  conversationID: string;
  draftText: string;
};
export type SetConversationPinParams = {
  conversationID: string;
  isPinned: boolean;
};
export type JoinGroupParams = {
  groupID: string;
  reqMsg: string;
  joinSource: GroupJoinSource;
  ex?: string;
};
export type SearchGroupParams = {
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
export type TransferGroupParams = {
  groupID: string;
  newOwnerUserID: string;
};
export type AccessGroupApplicationParams = {
  groupID: string;
  fromUserID: string;
  handleMsg: string;
};
export type SetGroupRoleParams = {
  groupID: string;
  userID: string;
  roleLevel: GroupMemberRole;
};
export type SetGroupVerificationParams = {
  verification: GroupVerificationType;
  groupID: string;
};
export type SetBurnDurationParams = {
  conversationID: string;
  burnDuration: number;
};
export type AtMsgParams = {
  text: string;
  atUserIDList: string[];
  atUsersInfo?: AtUsersInfoItem[];
  message?: MessageItem;
};
export type SoundMsgParamsByURL = {
  uuid: string;
  soundPath: string;
  sourceUrl: string;
  dataSize: number;
  duration: number;
  soundType?: string;
};
export type FileMsgParamsByURL = {
  filePath: string;
  fileName: string;
  uuid: string;
  sourceUrl: string;
  fileSize: number;
  fileType?: string;
};
export type FileMsgParamsByFullPath = {
  fileFullPath: string;
  fileName: string;
};
export type SoundMsgParamsByFullPath = {
  soundPath: string;
  duration: number;
};
export type MergerMsgParams = {
  messageList: MessageItem[];
  title: string;
  summaryList: string[];
};
export type FaceMessageParams = {
  index: number;
  data: string;
};
export type LocationMsgParams = {
  description: string;
  longitude: number;
  latitude: number;
};
export type InsertSingleMsgParams = {
  message: MessageItem;
  recvID: string;
  sendID: string;
};
export type InsertGroupMsgParams = {
  message: MessageItem;
  groupID: string;
  sendID: string;
};
export type AccessMessageParams = {
  conversationID: string;
  clientMsgID: string;
};
export type TypingUpdateParams = {
  recvID: string;
  msgTip: string;
};
export type ChangeInputStatesParams = {
  conversationID: string;
  focus: boolean;
};
export type GetInputstatesParams = {
  conversationID: string;
  userID: string;
};
export type SetConversationExParams = {
  conversationID: string;
  ex: string;
};
export type SetConversationRecvOptParams = {
  conversationID: string;
  opt: MessageReceiveOptType;
};
export type SearchLocalParams = {
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
export type SearchFriendParams = {
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
export type RemarkFriendParams = {
  toUserID: string;
  remark: string;
};
export type PinFriendParams = {
  toUserIDs: string[];
  isPinned: boolean;
};
export type SetFriendExParams = {
  toUserIDs: string[];
  ex: string;
};
export type AccessFriendApplicationParams = {
  toUserID: string;
  handleMsg: string;
};
export type AddBlackParams = {
  toUserID: string;
  ex?: string;
};
export type AccessToGroupParams = {
  groupID: string;
  reason: string;
  userIDList: string[];
};
export type GetGroupMemberByTimeParams = {
  groupID: string;
  filterUserIDList: string[];
  offset: number;
  count: number;
  joinTimeBegin: number;
  joinTimeEnd: number;
};
export type SearchGroupMemberParams = {
  groupID: string;
  keywordList: string[];
  isSearchUserID: boolean;
  isSearchMemberNickname: boolean;
  offset: number;
  count: number;
};
export type SetMemberPermissionParams = {
  rule: AllowType;
  groupID: string;
};
export type OffsetParams = {
  offset: number;
  count: number;
};
export type CreateGroupParams = {
  memberUserIDs: string[];
  groupInfo: Partial<GroupItem>;
  adminUserIDs?: string[];
  ownerUserID?: string;
};
export type SetGroupMemberNickParams = {
  groupID: string;
  userID: string;
  groupMemberNickname: string;
};
export type UpdateMemberInfoParams = {
  groupID: string;
  userID: string;
  nickname?: string;
  faceURL?: string;
  roleLevel?: GroupMemberRole;
  ex?: string;
};
export type FindMessageParams = {
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
export type PartialUserItem = Partial<SelfUserInfo>;

export type SignalingInviteParams = {
  invitation: RtcInvite;
  offlinePushInfo?: OfflinePush;
};
export type RtcActionParams = {
  opUserID: string;
  invitation: RtcInvite;
};
export type CustomSignalParams = {
  roomID: string;
  customInfo: string;
};

export type SetConversationMsgDestructParams = {
  conversationID: string;
  isMsgDestruct: boolean;
};

export type SetConversationMsgDestructTimeParams = {
  conversationID: string;
  msgDestructTime: number;
};
