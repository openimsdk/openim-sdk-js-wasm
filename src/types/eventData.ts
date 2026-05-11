import { CbEvents } from '@/constant';
import {
  BlackUserItem,
  ConversationGroup,
  ConversationGroupMemberChangedCallbackData,
  ConversationInputStatus,
  ConversationItem,
  FriendApplicationItem,
  FriendUserItem,
  GroupApplicationItem,
  GroupItem,
  GroupMemberItem,
  GroupMessageReceiptInfo,
  MessageItem,
  PinnedMessageChangeData,
  ReceiptInfo,
  RevokedInfo,
  SelfUserInfo,
  UploadProgressData,
  UserOnlineState,
} from './entity';

export type EventDataMap = {
  [CbEvents.OnProgress]: { progress: number; clientMsgID: string };
  [CbEvents.OnBlackAdded]: BlackUserItem;
  [CbEvents.OnBlackDeleted]: BlackUserItem;
  [CbEvents.OnConversationChanged]: ConversationItem[];
  [CbEvents.OnFriendAdded]: FriendUserItem;
  [CbEvents.OnFriendApplicationAdded]: FriendApplicationItem;
  [CbEvents.OnFriendApplicationDeleted]: FriendApplicationItem;
  [CbEvents.OnFriendApplicationRejected]: FriendApplicationItem;
  [CbEvents.OnFriendDeleted]: FriendUserItem;
  [CbEvents.OnFriendInfoChanged]: FriendUserItem;
  [CbEvents.OnGroupApplicationBadgeCountChanged]: number;
  [CbEvents.OnGroupApplicationAdded]: GroupApplicationItem;
  [CbEvents.OnGroupApplicationDeleted]: GroupApplicationItem;
  [CbEvents.OnGroupApplicationRejected]: GroupApplicationItem;
  [CbEvents.OnGroupApplicationAccepted]: GroupApplicationItem;
  [CbEvents.OnGroupDismissed]: GroupItem;
  [CbEvents.OnGroupMemberDeleted]: GroupMemberItem;
  [CbEvents.OnGroupMemberInfoChanged]: GroupMemberItem;
  [CbEvents.OnJoinedGroupAdded]: GroupItem;
  [CbEvents.OnJoinedGroupDeleted]: GroupItem;
  [CbEvents.OnNewConversation]: ConversationItem[];
  [CbEvents.OnConversationUserInputStatusChanged]: ConversationInputStatus;
  [CbEvents.OnNewRecvMessageRevoked]: RevokedInfo;
  [CbEvents.OnRecvC2CReadReceipt]: ReceiptInfo[];
  [CbEvents.OnRecvGroupReadReceipt]: GroupMessageReceiptInfo;
  [CbEvents.OnMsgDeleted]: MessageItem;
  [CbEvents.OnDeleteUserAllMsgsInConv]: {
    conversationID: string;
    userID: string;
  };
  [CbEvents.OnChangedPinnedMsg]: PinnedMessageChangeData;
  [CbEvents.OnRecvNewMessage]: MessageItem;
  [CbEvents.OnRecvNewMessages]: MessageItem[];
  [CbEvents.OnMessageModified]: MessageItem;
  [CbEvents.OnRecvOfflineNewMessage]: MessageItem;
  [CbEvents.OnRecvOnlineOnlyMessage]: MessageItem;
  [CbEvents.OnRecvOfflineNewMessages]: MessageItem[];
  [CbEvents.OnRecvOnlineOnlyMessages]: MessageItem[];
  [CbEvents.OnSelfInfoUpdated]: SelfUserInfo;
  [CbEvents.OnSyncServerFailed]: void;
  [CbEvents.OnSyncServerStart]: boolean;
  [CbEvents.OnSyncServerProgress]: number;
  [CbEvents.OnSyncServerFinish]: void;
  [CbEvents.OnTotalUnreadMessageCountChanged]: number;
  [CbEvents.OnUserStatusChanged]: UserOnlineState;
  [CbEvents.OnConnectFailed]: void;
  [CbEvents.OnConnectSuccess]: void;
  [CbEvents.OnConnecting]: void;
  [CbEvents.OnKickedOffline]: void;
  [CbEvents.OnUserTokenExpired]: void;
  [CbEvents.OnUserTokenInvalid]: void;
  [CbEvents.UploadComplete]: UploadProgressData;
  [CbEvents.OnConversationGroupAdded]: ConversationGroup[];
  [CbEvents.OnConversationGroupDeleted]: ConversationGroup[];
  [CbEvents.OnConversationGroupChanged]: ConversationGroup[];
  [CbEvents.OnConversationGroupMemberAdded]: ConversationGroupMemberChangedCallbackData;
  [CbEvents.OnConversationGroupMemberDeleted]: ConversationGroupMemberChangedCallbackData;
};

export type DataOfEvent<E extends CbEvents> = E extends keyof EventDataMap
  ? EventDataMap[E]
  : never;
