import { SdkEvent } from '@/constant';
import {
  BlackUserItem,
  ConversationInputStatus,
  ConversationItem,
  FriendApplicationItem,
  FriendUserItem,
  GroupApplicationItem,
  GroupItem,
  GroupMemberItem,
  GroupMessageReadReceipt,
  MessageItem,
  MessageReadReceipt,
  PublicUserItem,
  RevokedInfo,
  SelfUserInfo,
  FileUploadProgress,
  SignalingActionEvent,
  SignalingCustomSignalEvent,
  SignalingHungUpEvent,
  SignalingInvitationEvent,
  SignalingRoomParticipantChangedEvent,
  SignalingStreamChangeEvent,
  UserOnlineState,
} from './entity';

export type SdkEventDataMap = {
  [SdkEvent.Login]: unknown;
  [SdkEvent.OnProgress]: { progress: number; clientMsgID: string };
  [SdkEvent.OnBlackAdded]: BlackUserItem;
  [SdkEvent.OnBlackDeleted]: BlackUserItem;
  [SdkEvent.OnConversationChanged]: ConversationItem[];
  [SdkEvent.OnFriendAdded]: FriendUserItem;
  [SdkEvent.OnFriendApplicationAdded]: FriendApplicationItem;
  [SdkEvent.OnFriendApplicationAccepted]: FriendApplicationItem;
  [SdkEvent.OnFriendApplicationDeleted]: FriendApplicationItem;
  [SdkEvent.OnFriendApplicationRejected]: FriendApplicationItem;
  [SdkEvent.OnFriendDeleted]: FriendUserItem;
  [SdkEvent.OnFriendInfoChanged]: FriendUserItem;
  [SdkEvent.OnGroupApplicationAdded]: GroupApplicationItem;
  [SdkEvent.OnGroupApplicationDeleted]: GroupApplicationItem;
  [SdkEvent.OnGroupApplicationRejected]: GroupApplicationItem;
  [SdkEvent.OnGroupApplicationAccepted]: GroupApplicationItem;
  [SdkEvent.OnGroupDismissed]: GroupItem;
  [SdkEvent.OnGroupInfoChanged]: GroupItem;
  [SdkEvent.OnGroupMemberAdded]: GroupMemberItem;
  [SdkEvent.OnGroupMemberDeleted]: GroupMemberItem;
  [SdkEvent.OnGroupMemberInfoChanged]: GroupMemberItem;
  [SdkEvent.OnJoinedGroupAdded]: GroupItem;
  [SdkEvent.OnJoinedGroupDeleted]: GroupItem;
  [SdkEvent.OnNewConversation]: ConversationItem[];
  [SdkEvent.OnConversationUserInputStatusChanged]: ConversationInputStatus;
  [SdkEvent.OnNewRecvMessageRevoked]: RevokedInfo;
  [SdkEvent.OnRecvMessageRevoked]: string;
  [SdkEvent.OnRecvMessageModified]: MessageItem;
  [SdkEvent.OnRecvMessageExtensionsChanged]: {
    clientMsgID: string;
    reactionExtensionList: string;
  };
  [SdkEvent.OnRecvMessageExtensionsDeleted]: {
    clientMsgID: string;
    reactionExtensionKeyList: string;
  };
  [SdkEvent.OnRecvMessageExtensionsAdded]: {
    clientMsgID: string;
    reactionExtensionList: string;
  };
  [SdkEvent.OnMsgDeleted]: MessageItem;
  [SdkEvent.OnRecvC2CReadReceipt]: MessageReadReceipt[];
  [SdkEvent.OnRecvGroupReadReceipt]: GroupMessageReadReceipt;
  [SdkEvent.OnRecvNewMessage]: MessageItem;
  [SdkEvent.OnRecvNewMessages]: MessageItem[];
  [SdkEvent.OnRecvOfflineNewMessage]: MessageItem;
  [SdkEvent.OnRecvOnlineOnlyMessage]: MessageItem;
  [SdkEvent.OnRecvOfflineNewMessages]: MessageItem[];
  [SdkEvent.OnRecvOnlineOnlyMessages]: MessageItem[];
  [SdkEvent.OnSelfInfoUpdated]: SelfUserInfo;
  [SdkEvent.OnSyncServerFailed]: boolean;
  [SdkEvent.OnSyncServerStart]: boolean;
  [SdkEvent.OnSyncServerProgress]: number;
  [SdkEvent.OnSyncServerFinish]: boolean;
  [SdkEvent.OnTotalUnreadMessageCountChanged]: number;
  [SdkEvent.OnUserStatusChanged]: UserOnlineState;
  [SdkEvent.OnUserInputStatusChanged]: ConversationInputStatus;
  [SdkEvent.OnUserCommandAdd]: PublicUserItem;
  [SdkEvent.OnUserCommandDelete]: PublicUserItem;
  [SdkEvent.OnUserCommandUpdate]: PublicUserItem;
  [SdkEvent.OnRecvCustomBusinessMessage]: unknown;
  [SdkEvent.OnUploadLogsProgress]: unknown;
  [SdkEvent.OnConnectFailed]: void;
  [SdkEvent.OnConnectSuccess]: void;
  [SdkEvent.OnConnecting]: void;
  [SdkEvent.OnKickedOffline]: void;
  [SdkEvent.OnUserTokenExpired]: void;
  [SdkEvent.OnUserTokenInvalid]: string;
  [SdkEvent.OnReceiveNewInvitation]: SignalingInvitationEvent;
  [SdkEvent.OnInviteeAccepted]: SignalingActionEvent;
  [SdkEvent.OnInviteeRejected]: SignalingActionEvent;
  [SdkEvent.OnInvitationCancelled]: SignalingInvitationEvent;
  [SdkEvent.OnHangUp]: SignalingHungUpEvent;
  [SdkEvent.OnInvitationTimeout]: SignalingInvitationEvent;
  [SdkEvent.OnInviteeAcceptedByOtherDevice]: SignalingActionEvent;
  [SdkEvent.OnInviteeRejectedByOtherDevice]: SignalingActionEvent;
  [SdkEvent.OnStreamChange]: SignalingStreamChangeEvent;
  [SdkEvent.OnRoomParticipantConnected]: SignalingRoomParticipantChangedEvent;
  [SdkEvent.OnRoomParticipantDisconnected]: SignalingRoomParticipantChangedEvent;
  [SdkEvent.OnReceiveCustomSignal]: SignalingCustomSignalEvent;
  [SdkEvent.UploadComplete]: FileUploadProgress;
  [SdkEvent.Open]: { size: number; uuid: string };
  [SdkEvent.PartSize]: { partSize: number; num: number; uuid: string };
  [SdkEvent.HashPartProgress]: {
    index: number;
    size: number;
    partHash: string;
    uuid: string;
  };
  [SdkEvent.HashPartComplete]: {
    partsHash: string;
    fileHash: string;
    uuid: string;
  };
  [SdkEvent.UploadID]: { uploadID: string; uuid: string };
  [SdkEvent.UploadPartComplete]: {
    index: number;
    partSize: number;
    partHash: string;
    uuid: string;
  };
  [SdkEvent.Complete]: {
    size: number;
    url: string;
    typ: number;
    uuid: string;
  };
  [SdkEvent.UnUsedEvent]: unknown;
};

export type SdkEventData<E extends SdkEvent> = E extends keyof SdkEventDataMap
  ? SdkEventDataMap[E]
  : never;

/** @deprecated Use `SdkEventDataMap` instead. */
export type EventDataMap = {
  [SdkEvent.OnProgress]: { progress: number; clientMsgID: string };
  [SdkEvent.OnBlackAdded]: BlackUserItem;
  [SdkEvent.OnBlackDeleted]: BlackUserItem;
  [SdkEvent.OnConversationChanged]: ConversationItem[];
  [SdkEvent.OnFriendAdded]: FriendUserItem;
  [SdkEvent.OnFriendApplicationAdded]: FriendApplicationItem;
  [SdkEvent.OnFriendApplicationDeleted]: FriendApplicationItem;
  [SdkEvent.OnFriendApplicationRejected]: FriendApplicationItem;
  [SdkEvent.OnFriendDeleted]: FriendUserItem;
  [SdkEvent.OnFriendInfoChanged]: FriendUserItem;
  [SdkEvent.OnGroupApplicationAdded]: GroupApplicationItem;
  [SdkEvent.OnGroupApplicationDeleted]: GroupApplicationItem;
  [SdkEvent.OnGroupApplicationRejected]: GroupApplicationItem;
  [SdkEvent.OnGroupApplicationAccepted]: GroupApplicationItem;
  [SdkEvent.OnGroupDismissed]: GroupItem;
  [SdkEvent.OnGroupMemberDeleted]: GroupMemberItem;
  [SdkEvent.OnGroupMemberInfoChanged]: GroupMemberItem;
  [SdkEvent.OnJoinedGroupAdded]: GroupItem;
  [SdkEvent.OnJoinedGroupDeleted]: GroupItem;
  [SdkEvent.OnNewConversation]: ConversationItem[];
  [SdkEvent.OnConversationUserInputStatusChanged]: ConversationInputStatus;
  [SdkEvent.OnNewRecvMessageRevoked]: RevokedInfo;
  [SdkEvent.OnRecvC2CReadReceipt]: MessageReadReceipt[];
  [SdkEvent.OnRecvGroupReadReceipt]: GroupMessageReadReceipt;
  [SdkEvent.OnRecvNewMessage]: MessageItem;
  [SdkEvent.OnRecvNewMessages]: MessageItem[];
  [SdkEvent.OnRecvOfflineNewMessage]: MessageItem;
  [SdkEvent.OnRecvOnlineOnlyMessage]: MessageItem;
  [SdkEvent.OnRecvOfflineNewMessages]: MessageItem[];
  [SdkEvent.OnRecvOnlineOnlyMessages]: MessageItem[];
  [SdkEvent.OnSelfInfoUpdated]: SelfUserInfo;
  [SdkEvent.OnSyncServerFailed]: void;
  [SdkEvent.OnSyncServerStart]: boolean;
  [SdkEvent.OnSyncServerProgress]: number;
  [SdkEvent.OnSyncServerFinish]: void;
  [SdkEvent.OnTotalUnreadMessageCountChanged]: number;
  [SdkEvent.OnUserStatusChanged]: UserOnlineState;
  [SdkEvent.OnConnectFailed]: void;
  [SdkEvent.OnConnectSuccess]: void;
  [SdkEvent.OnConnecting]: void;
  [SdkEvent.OnKickedOffline]: void;
  [SdkEvent.OnUserTokenExpired]: void;
  [SdkEvent.OnUserTokenInvalid]: void;
};
/** @deprecated Use `SdkEventData` instead. */
export type DataOfEvent<E extends SdkEvent> = E extends keyof EventDataMap
  ? EventDataMap[E]
  : never;
