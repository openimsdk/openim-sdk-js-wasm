export enum MessageReceiveOption {
  /** @deprecated Use `Receive` instead. */
  Normal = 0,
  Receive = Normal,
  /** @deprecated Use `DoNotReceive` instead. */
  NotReceive = 1,
  DoNotReceive = NotReceive,
  /** @deprecated Use `ReceiveWithoutNotification` instead. */
  NotNotify = 2,
  ReceiveWithoutNotification = NotNotify,
}
/** @deprecated Use `MessageReceiveOption` instead. */
export import MessageReceiveOptType = MessageReceiveOption;
export enum AddFriendPermission {
  AddFriendAllowed = 0,
  AddFriendAllowedNoReview = 1,
  AddFriendDenied = 2,
}
export enum AllowType {
  Allowed = 0,
  NotAllowed = 1,
}
export enum GroupType {
  Group = 2,
  WorkingGroup = 2,
}
export enum GroupJoinSource {
  Invitation = 2,
  Search = 3,
  QrCode = 4,
}
export enum GroupMemberRole {
  Normal = 20,
  Admin = 60,
  Owner = 100,
}
export enum GroupVerificationType {
  ApplyNeedInviteNot = 0,
  AllNeed = 1,
  AllNot = 2,
}
export enum MessageStatus {
  Sending = 1,
  /** @deprecated Use `Succeeded` instead. */
  Succeed = 2,
  Succeeded = Succeed,
  Failed = 3,
}
export enum Platform {
  iOS = 1,
  Android = 2,
  Windows = 3,
  MacOSX = 4,
  Web = 5,
  Linux = 7,
  AndroidPad = 8,
  iPad = 9,
  Harmony = 11,
}
export enum LogLevel {
  Verbose = 6,
  Debug = 5,
  Info = 4,
  Warn = 3,
  Error = 2,
  Fatal = 1,
  Panic = 0,
}
export enum ApplicationHandleResult {
  Unprocessed = 0,
  /** @deprecated Use `Accepted` instead. */
  Agree = 1,
  Accepted = Agree,
  /** @deprecated Use `Rejected` instead. */
  Reject = -1,
  Rejected = Reject,
}
export enum MessageType {
  TextMessage = 101,
  PictureMessage = 102,
  VoiceMessage = 103,
  VideoMessage = 104,
  FileMessage = 105,
  AtTextMessage = 106,
  MergeMessage = 107,
  CardMessage = 108,
  LocationMessage = 109,
  CustomMessage = 110,
  TypingMessage = 113,
  QuoteMessage = 114,
  FaceMessage = 115,
  FriendAdded = 1201,
  OANotification = 1400,
  GroupCreated = 1501,
  GroupInfoUpdated = 1502,
  MemberQuit = 1504,
  GroupOwnerTransferred = 1507,
  MemberKicked = 1508,
  MemberInvited = 1509,
  MemberEnter = 1510,
  GroupDismissed = 1511,
  GroupMemberMuted = 1512,
  GroupMemberCancelMuted = 1513,
  GroupMuted = 1514,
  GroupCancelMuted = 1515,
  GroupAnnouncementUpdated = 1519,
  GroupNameUpdated = 1520,
  BurnMessageChange = 1701,
  RevokeMessage = 2101,
}
export enum SessionType {
  Single = 1,
  Group = 3,
  WorkingGroup = 3,
  Notification = 4,
}
export enum GroupStatus {
  Normal = 0,
  Banned = 1,
  Dismissed = 2,
  Muted = 3,
}
export enum GroupMentionType {
  /** @deprecated Use `Normal` instead. */
  AtNormal = 0,
  Normal = AtNormal,
  /** @deprecated Use `MentionedMe` instead. */
  AtMe = 1,
  MentionedMe = AtMe,
  /** @deprecated Use `MentionedAll` instead. */
  AtAll = 2,
  MentionedAll = AtAll,
  /** @deprecated Use `MentionedAllAndMe` instead. */
  AtAllAtMe = 3,
  MentionedAllAndMe = AtAllAtMe,
  /** @deprecated Use `GroupNotice` instead. */
  AtGroupNotice = 4,
  GroupNotice = AtGroupNotice,
}
/** @deprecated Use `GroupMentionType` instead. */
export import GroupAtType = GroupMentionType;
export enum GroupMemberFilter {
  All = 0,
  Owner = 1,
  Admin = 2,
  Normal = 3,
  AdminAndNormal = 4,
  AdminAndOwner = 5,
}
export enum Relationship {
  /** @deprecated Use `Black` instead. */
  isBlack = 0,
  Black = isBlack,
  /** @deprecated Use `Friend` instead. */
  isFriend = 1,
  Friend = isFriend,
}
export enum LoginStatus {
  /** @deprecated Use `LoggedOut` instead. */
  Logout = 1,
  LoggedOut = Logout,
  /** @deprecated Use `LoggingIn` instead. */
  Logging = 2,
  LoggingIn = Logging,
  /** @deprecated Use `LoggedIn` instead. */
  Logged = 3,
  LoggedIn = Logged,
}
export enum OnlineState {
  Online = 1,
  Offline = 0,
}
export enum GroupMessageReaderFilter {
  Read = 0,
  /** @deprecated Use `Unread` instead. */
  UnRead = 1,
  Unread = UnRead,
}
export enum MessageViewType {
  History = 0,
  Search = 1,
}
/** @deprecated Use `MessageViewType` instead. */
export import ViewType = MessageViewType;
