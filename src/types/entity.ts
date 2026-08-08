import { SdkEvent } from '../constant';
import {
  GroupType,
  SessionType,
  MessageType,
  Platform,
  MessageStatus,
  GroupStatus,
  GroupVerificationType,
  AllowType,
  GroupJoinSource,
  GroupMemberRole,
  MessageReceiveOption,
  GroupMentionType,
  LogLevel,
  ApplicationHandleResult,
  Relationship,
  OnlineState,
  AddFriendPermission,
} from './enum';
export type SdkEventEnvelope<T = unknown> = {
  event: SdkEvent;
  data: T;
  errCode: number;
  errMsg: string;
  operationID: string;
};
export type SdkResponse<T = string> = {
  event: string;
  errCode: number;
  errMsg: string;
  data: T;
  operationID: string;
};
export type WorkerResponse<T> = {
  data: T;
  errCode: number;
  errMsg: string;
};
export type InitConfig = {
  platformID: Platform;
  apiAddr: string;
  wsAddr: string;
  dataDir: string;
  systemType: string;
  logLevel: LogLevel;
  isLogStandardOutput: boolean;
  logFilePath: string;
  isExternalExtensions: boolean;
};
export type MessageEntity = {
  type: string;
  offset: number;
  length: number;
  url?: string;
  ex?: string;
  /** @deprecated Use `ex` instead. */
  info?: string;
};
export type AtUserInfo = {
  atUserID: string;
  groupNickname: string;
};
export type GroupApplicationItem = {
  attachedInfo?: string;
  createTime: number;
  creatorUserID: string;
  ex: string;
  groupFaceURL: string;
  groupID: string;
  groupName: string;
  groupType: GroupType;
  handleResult: ApplicationHandleResult;
  handleUserID: string;
  handledMsg: string;
  handledTime: number;
  introduction: string;
  inviterUserID?: string;
  memberCount: number;
  nickname: string;
  notification: string;
  ownerUserID: string;
  reqMsg: string;
  reqTime: number;
  joinSource: GroupJoinSource;
  status: GroupStatus;
  userFaceURL: string;
  userID: string;
};
export type FriendApplicationItem = {
  attachedInfo?: string;
  createTime: number;
  ex: string;
  fromFaceURL: string;
  fromNickname: string;
  fromUserID: string;
  handleMsg: string;
  handleResult: ApplicationHandleResult;
  handleTime: number;
  handlerUserID: string;
  reqMsg: string;
  toFaceURL: string;
  toNickname: string;
  toUserID: string;
};
export type PublicUserItem = {
  nickname: string;
  userID: string;
  faceURL: string;
  ex: string;
};
export type SelfUserInfo = {
  createTime: number;
  ex: string;
  faceURL: string;
  nickname: string;
  userID: string;
  globalRecvMsgOpt: MessageReceiveOption;
  addFriendPermission: AddFriendPermission;
};
export type PartialUserInfo = {
  userID: string;
} & Partial<Omit<SelfUserInfo, 'userID'>>;
export type FriendUserItem = {
  addSource: number;
  createTime: number;
  ex: string;
  faceURL: string;
  userID: string;
  nickname: string;
  operatorUserID: string;
  ownerUserID: string;
  remark: string;
  isPinned: boolean;
  attachedInfo: string;
};
export type SearchFriendsResultItem = FriendUserItem & {
  relationship: Relationship;
};
export type CheckFriendResultItem = {
  result: number;
  userID: string;
};
export type BlackUserItem = {
  addSource: number;
  attachedInfo?: string;
  userID: string;
  createTime: number;
  ex: string;
  faceURL: string;
  nickname: string;
  operatorUserID: string;
  ownerUserID: string;
};
export type GroupItem = {
  attachedInfo?: string;
  groupID: string;
  groupName: string;
  notification: string;
  notificationUserID: string;
  notificationUpdateTime: number;
  introduction: string;
  faceURL: string;
  ownerUserID: string;
  createTime: number;
  memberCount: number;
  status: GroupStatus;
  creatorUserID: string;
  groupType: GroupType;
  needVerification: GroupVerificationType;
  ex: string;
  applyMemberFriend: AllowType;
  lookMemberInfo: AllowType;
  /** @deprecated This field is retained only for patch.10 type compatibility. */
  displayIsRead?: boolean;
};
export type GroupMemberItem = {
  attachedInfo?: string;
  groupID: string;
  userID: string;
  nickname: string;
  faceURL: string;
  roleLevel: GroupMemberRole;
  muteEndTime: number;
  joinTime: number;
  joinSource: GroupJoinSource;
  inviterUserID: string;
  operatorUserID: string;
  ex: string;
};
export type ConversationItem = {
  conversationID: string;
  conversationType: SessionType;
  userID: string;
  groupID: string;
  showName: string;
  faceURL: string;
  recvMsgOpt: MessageReceiveOption;
  unreadCount: number;
  groupAtType: GroupMentionType;
  latestMsg: string;
  latestMsgSendTime: number;
  draftText: string;
  draftTextTime: number;
  burnDuration: number;
  msgDestructTime: number;
  isPinned: boolean;
  isNotInGroup: boolean;
  isPrivateChat: boolean;
  isMsgDestruct: boolean;
  updateUnreadCountTime?: number;
  attachedInfo: string;
  ex?: string;
  maxSeq?: number;
  minSeq?: number;
};
export type MessageItem = {
  clientMsgID: string;
  serverMsgID?: string;
  createTime: number;
  sendTime: number;
  sessionType: SessionType;
  sendID?: string;
  recvID?: string;
  msgFrom: number;
  contentType: MessageType;
  senderPlatformID: Platform;
  senderNickname?: string;
  senderFaceUrl?: string;
  groupID?: string;
  content?: string;
  seq: number;
  isRead: boolean;
  status: MessageStatus;
  isReact?: boolean;
  isExternalExtensions?: boolean;
  offlinePush?: OfflinePush;
  attachedInfo?: string;
  ex?: string;
  localEx?: string;
  textElem?: TextElem;
  cardElem?: CardElem;
  pictureElem?: PictureElem;
  soundElem?: SoundElem;
  videoElem?: VideoElem;
  fileElem?: FileElem;
  mergeElem?: MergeElem;
  atTextElem?: AtTextElem;
  faceElem?: FaceElem;
  locationElem?: LocationElem;
  customElem?: CustomElem;
  quoteElem?: QuoteElem;
  notificationElem?: NotificationElem;
  advancedTextElem?: AdvancedTextElem;
  typingElem?: TypingElem;
  attachedInfoElem?: AttachedInfoElem;
};
export type TextElem = {
  content: string;
};
export type CardElem = {
  userID: string;
  nickname: string;
  faceURL: string;
  ex: string;
};
export type AtTextElem = {
  text: string;
  atUserList: string[];
  atUsersInfo?: AtUserInfo[];
  quoteMessage?: MessageItem;
  isAtSelf?: boolean;
};
export type NotificationElem = {
  detail: string;
};
export type AdvancedTextElem = {
  text: string;
  messageEntityList: MessageEntity[];
};
export type TypingElem = {
  msgTips: string;
};
export type CustomElem = {
  data: string;
  description: string;
  extension: string;
};
export type FileElem = {
  filePath: string;
  uuid: string;
  sourceUrl: string;
  fileName: string;
  fileSize: number;
};
export type FaceElem = {
  index: number;
  data: string;
};
export type LocationElem = {
  description: string;
  longitude: number;
  latitude: number;
};
export type MergeElem = {
  title: string;
  abstractList: string[];
  multiMessage: MessageItem[];
  messageEntityList: MessageEntity[];
};
export type OfflinePush = {
  title: string;
  desc: string;
  ex: string;
  iOSPushSound: string;
  iOSBadgeCount: boolean;
};
export type PictureElem = {
  sourcePath: string;
  sourcePicture: Picture;
  bigPicture: Picture;
  snapshotPicture: Picture;
};
export type AttachedInfoElem = {
  groupHasReadInfo: GroupMessageReadSummary;
  isPrivateChat: boolean;
  isEncryption: boolean;
  inEncryptStatus: boolean;
  burnDuration: number;
  hasReadTime: number;
  messageEntityList?: MessageEntity[];
  uploadProgress?: MessageUploadProgress;
};
export type MessageUploadProgress = {
  total: number;
  save: number;
  current: number;
  uploadID?: string;
};
export type GroupMessageReadSummary = {
  hasReadCount: number;
  unreadCount?: number;
  hasReadUserIDList: string[];
  groupMemberCount: number;
};
export type Picture = {
  uuid: string;
  type: string;
  size: number;
  width: number;
  height: number;
  url: string;
};
export type QuoteElem = {
  text: string;
  quoteMessage: MessageItem;
};
export type SoundElem = {
  uuid: string;
  soundPath: string;
  sourceUrl: string;
  dataSize: number;
  duration: number;
};
export type VideoElem = {
  videoPath: string;
  videoUUID: string;
  videoUrl: string;
  videoType: string;
  videoSize: number;
  duration: number;
  snapshotPath: string;
  snapshotUUID: string;
  snapshotSize: number;
  snapshotUrl: string;
  snapshotWidth: number;
  snapshotHeight: number;
};
export type AdvancedRevokeContent = {
  clientMsgID: string;
  revokeTime: number;
  revokerID: string;
  revokerNickname: string;
  revokerRole: number;
  seq: number;
  sessionType: SessionType;
  sourceMessageSendID: string;
  sourceMessageSendTime: number;
  sourceMessageSenderNickname: string;
};

export type RevokedInfo = {
  revokerID: string;
  revokerRole: number;
  clientMsgID: string;
  revokerNickname: string;
  revokeTime: number;
  sourceMessageSendTime: number;
  sourceMessageSendID: string;
  sourceMessageSenderNickname: string;
  sessionType: number;
  seq: number;
  ex: string;
  isAdminRevoke?: boolean;
};

export type MessageReadReceipt = {
  userID: string;
  groupID: string;
  msgIDList: string[];
  readTime: number;
  msgFrom: number;
  contentType: MessageType;
  sessionType: SessionType;
};

export type SearchMessageResult = {
  totalCount: number;
  searchResultItems?: SearchMessageResultItem[];
  findResultItems?: SearchMessageResultItem[];
};

export type SearchMessageResultItem = {
  conversationID: string;
  messageCount: number;
  conversationType: SessionType;
  showName: string;
  faceURL: string;
  messageList: MessageItem[];
};

export type AdvancedMessageListResult = {
  isEnd: boolean;
  errCode: number;
  errMsg: string;
  messageList: MessageItem[];
};

export type SignalingInvitation = {
  inviterUserID: string;
  inviteeUserIDList: string[];
  customData?: string;
  groupID: string;
  roomID: string;
  timeout: number;
  mediaType: string;
  sessionType: SessionType;
  platformID: Platform;
  initiateTime?: number;
  busyLineUserIDList?: string[];
};

export type UserOnlineState = {
  platformIDs?: Platform[];
  status: OnlineState;
  userID: string;
};

export type ConversationInputStatus = {
  conversationID: string;
  userID: string;
  platformIDs: Platform[];
};

export type GroupMessageReadReceipt = {
  conversationID: string;
  groupMessageReadInfo: GroupMessageReadDetail[];
};
export type GroupMessageReadDetail = {
  clientMsgID: string;
  hasReadCount: number;
  unreadCount: number;
  readMembers: GroupMemberItem[];
};

export type SignalingInviteResult = {
  liveURL: string;
  roomID: string;
  token: string;
  busyLineUserIDList?: string[];
};

export type SignalingParticipantInfo = {
  userInfo: PublicUserItem;
  groupMemberInfo?: GroupMemberItem;
  groupInfo?: GroupItem;
};

export type SignalingRoomInfo = {
  participant?: SignalingParticipantInfo[];
  invitation?: SignalingInvitation;
  roomID: string;
};

export type SignalingInvitationInfo = Required<SignalingInvitation>;
export type SignalingOfflinePushInfo = OfflinePush & {
  signalInfo: string;
};
export type SignalingInvitationEvent = {
  invitation: SignalingInvitationInfo;
  offlinePushInfo: SignalingOfflinePushInfo | null;
  participant: SignalingParticipantInfo;
  userID: string;
};
export type SignalingActionEvent = SignalingInvitationEvent & {
  opUserPlatformID: Platform;
};
export type SignalingHungUpEvent = {
  invitation: SignalingInvitationInfo;
  offlinePushInfo: SignalingOfflinePushInfo | null;
  userID: string;
};
export type SignalingStreamChangeEvent = {
  roomID: string;
  streamType: string;
  mute: boolean;
};
export type SignalingRoomParticipantChangedEvent = {
  invitation: SignalingInvitationInfo | null;
  participant: SignalingParticipantInfo[] | null;
  groupID: string;
};
export type SignalingCustomSignalEvent = {
  roomID: string;
  customInfo: string;
};

export type FileUploadProgress = {
  fileSize: number;
  streamSize: number;
  storageSize: number;
  uuid: string;
};

// Compatibility names retained for applications upgrading from patch.10.
/** @deprecated Use `SdkEventEnvelope` instead. */
export type WSEvent<T = unknown> = SdkEventEnvelope<T>;
/** @deprecated Use `SdkResponse` instead. */
export type WsResponse<T = string> = SdkResponse<T>;
/** @deprecated Use `InitConfig` instead. */
export type IMConfig = Omit<InitConfig, 'systemType'> & {
  systemType?: string;
};
/** @deprecated Use `Picture` instead. */
export type PicBaseInfo = Picture;
/** @deprecated Use `AtUserInfo` instead. */
export type AtUsersInfoItem = AtUserInfo;
/** @deprecated Use `SearchFriendsResultItem` instead. */
export type SearchedFriendsInfo = SearchFriendsResultItem;
/** @deprecated Use `CheckFriendResultItem` instead. */
export type FriendshipInfo = CheckFriendResultItem;
/** @deprecated Use `MessageUploadProgress` instead. */
export type UploadProgress = MessageUploadProgress;
/** @deprecated Use `GroupMessageReadSummary` instead. */
export type GroupHasReadInfo = GroupMessageReadSummary;
/** @deprecated Use `MessageReadReceipt` instead. */
export type ReceiptInfo = MessageReadReceipt;
/** @deprecated Use `AdvancedMessageListResult` instead. */
export type AdvancedGetMessageResult = AdvancedMessageListResult;
/** @deprecated Use `SignalingInvitation` instead. */
export type RtcInvite = Omit<
  SignalingInvitation,
  'sessionType' | 'platformID'
> & {
  sessionType: number;
  platformID: number;
};
/** @deprecated Use `GroupMessageReadReceipt` instead. */
export type GroupMessageReceiptInfo = GroupMessageReadReceipt;
/** @deprecated Use `GroupMessageReadDetail` instead. */
export type GroupMessageReadInfo = GroupMessageReadDetail;
/** @deprecated Use `SignalingInviteResult` instead. */
export type RtcInviteResults = SignalingInviteResult;
/** @deprecated Use `SignalingParticipantInfo` instead. */
export type ParticipantInfo = SignalingParticipantInfo;
/** @deprecated Use `SignalingRoomInfo` instead. */
export type CallingRoomData = Omit<
  SignalingRoomInfo,
  'participant' | 'invitation'
> & {
  participant?: ParticipantInfo[];
  invitation?: RtcInvite;
};
