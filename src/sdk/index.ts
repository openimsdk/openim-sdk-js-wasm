import { initDatabaseAPI, workerPromise } from '@/api';
import Emitter from '@/utils/emitter';
import { v4 as uuidv4 } from 'uuid';
import { getGO, initializeWasm, getGoExitPromise } from './initialize';

import {
  AccessFriendApplicationParams,
  AccessGroupApplicationParams,
  AccessMessageParams,
  AddFriendParams,
  AdvancedMsgParams,
  AdvancedQuoteMsgParams,
  AtMsgParams,
  ChangeGroupMemberMuteParams,
  ChangeGroupMuteParams,
  CreateGroupParams,
  CustomMsgParams,
  CustomSignalParams,
  FaceMessageParams,
  FileMsgParamsByURL,
  FindMessageParams,
  GetAdvancedHistoryMsgParams,
  GetGroupMemberByTimeParams,
  GetGroupMemberParams,
  GetGroupMessageReaderParams,
  GetHistoryMsgParams,
  GetOneConversationParams,
  ImageMsgParamsByURL,
  InitAndLoginConfig,
  InsertGroupMsgParams,
  InsertSingleMsgParams,
  AccessToGroupParams,
  SetConversationRecvOptParams,
  JoinGroupParams,
  LocationMsgParams,
  UpdateMemberInfoParams,
  MergerMsgParams,
  PartialUserItem,
  SetConversationPinParams,
  QuoteMsgParams,
  RemarkFriendParams,
  RtcActionParams,
  SearchFriendParams,
  SearchGroupMemberParams,
  SearchGroupParams,
  SearchLocalParams,
  SendGroupReadReceiptParams,
  SendMsgParams,
  SetBurnDurationParams,
  SetConversationMsgDestructParams,
  SetConversationMsgDestructTimeParams,
  SetConversationDraftParams,
  SetGroupRoleParams,
  SetGroupVerificationParams,
  SetMemberPermissionParams,
  SetMessageLocalExParams,
  SetConversationPrivateStateParams,
  SignalingInviteParams,
  SoundMsgParamsByURL,
  SplitConversationParams,
  TransferGroupParams,
  TypingUpdateParams,
  UploadFileParams,
  VideoMsgParamsByURL,
  SetGroupMemberNickParams,
  WasmPathConfig,
  PinFriendParams,
  SetFriendExParams,
  SetConversationExParams,
  AddBlackParams,
  OffsetParams,
  UpdateFriendsParams,
  SetConversationParams,
  GetSpecifiedFriendsParams,
  ChangeInputStatesParams,
  GetInputstatesParams,
  FetchSurroundingParams,
  CreateTargetedGroupMessageParams,
  ModifyMessageParams,
  DeleteMessagesParams,
} from '../types/params';

import {
  AdvancedGetMessageResult,
  BlackUserItem,
  CallingRoomData,
  CardElem,
  ConversationItem,
  FriendApplicationItem,
  FriendshipInfo,
  FriendUserItem,
  GroupApplicationItem,
  GroupItem,
  GroupMemberItem,
  IMConfig,
  MessageItem,
  OfflinePush,
  PublicUserItem,
  RtcInvite,
  RtcInviteResults,
  SearchedFriendsInfo,
  SearchMessageResult,
  SelfUserInfo,
  UserOnlineState,
  WSEvent,
  WsResponse,
} from '../types/entity';
import {
  GroupAtType,
  LoginStatus,
  MessageReceiveOptType,
  Platform,
} from '@/types/enum';
import { logBoxStyleValue } from '@/utils';
class SDK extends Emitter {
  private wasmInitializedPromise: Promise<any>;
  private goExitPromise: Promise<void> | undefined;
  private goExisted = false;
  private tryParse = true;
  private isLogStandardOutput = true;

  constructor(url = '/openIM.wasm', debug = true) {
    super();

    initDatabaseAPI(debug);
    this.isLogStandardOutput = debug;
    this.wasmInitializedPromise = initializeWasm(url);
    this.goExitPromise = getGoExitPromise();

    if (this.goExitPromise) {
      this.goExitPromise
        .then(() => {
          this._logWrap('SDK => wasm exist');
        })
        .catch(err => {
          this._logWrap('SDK => wasm with error ', err);
        })
        .finally(() => {
          this.goExisted = true;
        });
    }
  }

  _logWrap(...args: any[]) {
    if (this.isLogStandardOutput) {
      console.info(...args);
    }
  }

  _invoker<T>(
    functionName: string,
    func: (...args: any[]) => Promise<any>,
    args: any[],
    processor?: (data: string) => string
  ): Promise<WsResponse<T>> {
    return new Promise(async (resolve, reject) => {
      this._logWrap(
        `%cSDK =>%c [OperationID:${
          args[0]
        }] (invoked by js) run ${functionName} with args ${JSON.stringify(
          args
        )}`,
        'font-size:14px; background:#7CAEFF; border-radius:4px; padding-inline:4px;',
        ''
      );

      let response = {
        operationID: args[0],
        event: (functionName.slice(0, 1).toUpperCase() +
          functionName.slice(1).toLowerCase()) as any,
      } as WsResponse<T>;
      try {
        if (!getGO() || getGO().exited || this.goExisted) {
          throw 'wasm exist already, fail to run';
        }

        let data = await func(...args);
        if (processor) {
          this._logWrap(
            `%cSDK =>%c [OperationID:${
              args[0]
            }] (invoked by js) run ${functionName} with response before processor ${JSON.stringify(
              data
            )}`,
            logBoxStyleValue('#FFDC19'),
            ''
          );
          data = processor(data);
        }

        if (this.tryParse) {
          try {
            data = JSON.parse(data);
          } catch (error) {
            // parse error
          }
        }
        response.data = data;
        resolve(response);
      } catch (error) {
        this._logWrap(
          `%cSDK =>%c [OperationID:${
            args[0]
          }] (invoked by js) run ${functionName} with error ${JSON.stringify(
            error
          )}`,
          logBoxStyleValue('#EE4245'),
          ''
        );
        response = {
          ...response,
          ...(error as WsResponse<T>),
        };
        reject(response);
      }
    });
  }
  login = async (params: InitAndLoginConfig, operationID = uuidv4()) => {
    this._logWrap(
      `SDK => (invoked by js) run login with args ${JSON.stringify({
        params,
        operationID,
      })}`
    );

    await workerPromise;
    await this.wasmInitializedPromise;
    window.commonEventFunc(event => {
      try {
        this._logWrap(
          `%cSDK =>%c received event %c${event}%c `,
          logBoxStyleValue('#282828', '#ffffff'),
          '',
          'color: #4f2398;',
          ''
        );
        const parsed = JSON.parse(event) as WSEvent;
        if (this.tryParse) {
          try {
            parsed.data = JSON.parse(parsed.data as string);
          } catch (error) {
            // parse error
          }
        }

        this.emit(parsed.event, parsed as any);
      } catch (error) {
        console.error(error);
      }
    });

    const config: IMConfig = {
      platformID: params.platformID,
      apiAddr: params.apiAddr,
      wsAddr: params.wsAddr,
      dataDir: './',
      logLevel: params.logLevel || 5,
      isLogStandardOutput:
        params.isLogStandardOutput ?? this.isLogStandardOutput,
      logFilePath: './',
      isExternalExtensions: params.isExternalExtensions || false,
    };
    this.tryParse = params.tryParse ?? true;
    window.initSDK(operationID, JSON.stringify(config));
    return await window.login(operationID, params.userID, params.token);
  };
  logout = <T>(operationID = uuidv4()) => {
    window.fileMapClear();
    return this._invoker<T>('logout', window.logout, [operationID]);
  };
  getAllConversationList = (operationID = uuidv4()) => {
    return this._invoker<ConversationItem[]>(
      'getAllConversationList',
      window.getAllConversationList,
      [operationID]
    );
  };
  getOneConversation = (
    params: GetOneConversationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<ConversationItem>(
      'getOneConversation',
      window.getOneConversation,
      [operationID, params.sessionType, params.sourceID]
    );
  };
  getAdvancedHistoryMessageList = (
    params: GetAdvancedHistoryMsgParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<AdvancedGetMessageResult>(
      'getAdvancedHistoryMessageList',
      window.getAdvancedHistoryMessageList,
      [operationID, JSON.stringify(params)]
    );
  };
  getAdvancedHistoryMessageListReverse = (
    params: GetAdvancedHistoryMsgParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<AdvancedGetMessageResult>(
      'getAdvancedHistoryMessageListReverse',
      window.getAdvancedHistoryMessageListReverse,
      [operationID, JSON.stringify(params)]
    );
  };
  fetchSurroundingMessages = (
    params: FetchSurroundingParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<{ messageList: MessageItem[] }>(
      'fetchSurroundingMessages',
      window.fetchSurroundingMessages,
      [operationID, JSON.stringify(params)]
    );
  };
  getSpecifiedGroupsInfo = (params: string[], operationID = uuidv4()) => {
    return this._invoker<GroupItem[]>(
      'getSpecifiedGroupsInfo',
      window.getSpecifiedGroupsInfo,
      [operationID, JSON.stringify(params)]
    );
  };
  deleteConversationAndDeleteAllMsg = <T>(
    conversationID: string,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'deleteConversationAndDeleteAllMsg',
      window.deleteConversationAndDeleteAllMsg,
      [operationID, conversationID]
    );
  };
  markConversationMessageAsRead = <T>(data: string, operationID = uuidv4()) => {
    return this._invoker<T>(
      'markConversationMessageAsRead',
      window.markConversationMessageAsRead,
      [operationID, data]
    );
  };
  sendGroupMessageReadReceipt = <T>(
    params: SendGroupReadReceiptParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'sendGroupMessageReadReceipt',
      window.sendGroupMessageReadReceipt,
      [
        operationID,
        params.conversationID,
        JSON.stringify(params.clientMsgIDList),
      ]
    );
  };
  getGroupMessageReaderList = (
    params: GetGroupMessageReaderParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<GroupMemberItem[]>(
      'getGroupMessageReaderList',
      window.getGroupMessageReaderList,
      [
        operationID,
        params.conversationID,
        params.clientMsgID,
        params.filter,
        params.offset,
        params.count,
      ]
    );
  };
  getGroupMemberList = (
    params: GetGroupMemberParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<GroupMemberItem[]>(
      'getGroupMemberList',
      window.getGroupMemberList,
      [operationID, params.groupID, params.filter, params.offset, params.count]
    );
  };
  createTextMessage = (text: string, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'createTextMessage',
      window.createTextMessage,
      [operationID, text],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };
  createImageMessageByURL = (
    params: ImageMsgParamsByURL,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'createImageMessageByURL',
      window.createImageMessageByURL,
      [
        operationID,
        params.sourcePath,
        JSON.stringify(params.sourcePicture),
        JSON.stringify(params.bigPicture),
        JSON.stringify(params.snapshotPicture),
      ],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };
  createImageMessageByFile = (
    params: ImageMsgParamsByURL & { file: File },
    operationID = uuidv4()
  ) => {
    params.sourcePicture.uuid = `${params.sourcePicture.uuid}/${params.file.name}`;
    window.fileMapSet(params.sourcePicture.uuid, params.file);
    return this._invoker<MessageItem>(
      'createImageMessageByFile',
      window.createImageMessageByURL,
      [
        operationID,
        params.sourcePath,
        JSON.stringify(params.sourcePicture),
        JSON.stringify(params.bigPicture),
        JSON.stringify(params.snapshotPicture),
      ],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };
  createCustomMessage = (params: CustomMsgParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'createCustomMessage',
      window.createCustomMessage,
      [operationID, params.data, params.extension, params.description],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };
  createQuoteMessage = (params: QuoteMsgParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'createQuoteMessage',
      window.createQuoteMessage,
      [operationID, params.text, params.message],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };
  createAdvancedQuoteMessage = (
    params: AdvancedQuoteMsgParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'createAdvancedQuoteMessage',
      window.createAdvancedQuoteMessage,
      [
        operationID,
        params.text,
        JSON.stringify(params.message),
        JSON.stringify(params.messageEntityList),
      ],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };
  createAdvancedTextMessage = (
    params: AdvancedMsgParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'createAdvancedTextMessage',
      window.createAdvancedTextMessage,
      [operationID, params.text, JSON.stringify(params.messageEntityList)],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };
  sendMessage = (params: SendMsgParams, operationID = uuidv4()) => {
    const offlinePushInfo = params.offlinePushInfo ?? {
      title: 'You have a new message.',
      desc: '',
      ex: '',
      iOSPushSound: '+1',
      iOSBadgeCount: true,
    };
    return this._invoker<MessageItem>('sendMessage', window.sendMessage, [
      operationID,
      JSON.stringify(params.message),
      params.recvID,
      params.groupID,
      JSON.stringify(offlinePushInfo),
      params.isOnlineOnly ?? false,
    ]);
  };
  sendMessageNotOss = (params: SendMsgParams, operationID = uuidv4()) => {
    const offlinePushInfo = params.offlinePushInfo ?? {
      title: 'You have a new message.',
      desc: '',
      ex: '',
      iOSPushSound: '+1',
      iOSBadgeCount: true,
    };
    return this._invoker<MessageItem>(
      'sendMessageNotOss',
      window.sendMessageNotOss,
      [
        operationID,
        JSON.stringify(params.message),
        params.recvID,
        params.groupID,
        JSON.stringify(offlinePushInfo),
        params.isOnlineOnly ?? false,
      ]
    );
  };

  setMessageLocalEx = <T>(
    params: SetMessageLocalExParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>('setMessageLocalEx', window.setMessageLocalEx, [
      operationID,
      params.conversationID,
      params.clientMsgID,
      params.localEx,
    ]);
  };

  exportDB(operationID = uuidv4()) {
    return this._invoker('exportDB', window.exportDB, [operationID]);
  }

  getHistoryMessageListReverse = (
    params: GetHistoryMsgParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<AdvancedGetMessageResult>(
      'getHistoryMessageListReverse',
      window.getHistoryMessageListReverse,
      [operationID, JSON.stringify(params)]
    );
  };

  revokeMessage = <T>(data: AccessMessageParams, operationID = uuidv4()) => {
    return this._invoker<T>('revokeMessage', window.revokeMessage, [
      operationID,
      data.conversationID,
      data.clientMsgID,
    ]);
  };

  setConversation = <T>(
    params: SetConversationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>('setConversation', window.setConversation, [
      operationID,
      params.conversationID,
      JSON.stringify(params),
    ]);
  };

  /**
   * @deprecated Use setConversation instead.
   */
  setConversationPrivateChat = <T>(
    params: SetConversationPrivateStateParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'setConversationPrivateChat',
      window.setConversation,
      [
        operationID,
        params.conversationID,
        JSON.stringify({
          isPrivateChat: params.isPrivate,
        }),
      ]
    );
  };

  /**
   * @deprecated Use setConversation instead.
   */
  setConversationBurnDuration = <T>(
    params: SetBurnDurationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'setConversationBurnDuration',
      window.setConversation,
      [
        operationID,
        params.conversationID,
        JSON.stringify({
          burnDuration: params.burnDuration,
        }),
      ]
    );
  };

  getLoginStatus = (operationID = uuidv4()) => {
    return this._invoker<LoginStatus>(
      'getLoginStatus',
      window.getLoginStatus,
      [operationID],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };

  setAppBackgroundStatus = <T>(data: boolean, operationID = uuidv4()) => {
    return this._invoker<T>(
      'setAppBackgroundStatus',
      window.setAppBackgroundStatus,
      [operationID, data]
    );
  };

  networkStatusChanged = <T>(operationID = uuidv4()) => {
    return this._invoker<T>(
      'networkStatusChanged ',
      window.networkStatusChanged,
      [operationID]
    );
  };

  getLoginUserID = (operationID = uuidv4()) => {
    return this._invoker<string>('getLoginUserID', window.getLoginUserID, [
      operationID,
    ]);
  };

  getSelfUserInfo = (operationID = uuidv4()) => {
    return this._invoker<SelfUserInfo>(
      'getSelfUserInfo',
      window.getSelfUserInfo,
      [operationID]
    );
  };

  getUsersInfo = (data: string[], operationID = uuidv4()) => {
    return this._invoker<PublicUserItem[]>(
      'getUsersInfo',
      window.getUsersInfo,
      [operationID, JSON.stringify(data)]
    );
  };

  /**
   * @deprecated Use setSelfInfo instead.
   */
  SetSelfInfoEx = <T>(data: PartialUserItem, operationID = uuidv4()) => {
    return this._invoker<T>('SetSelfInfoEx', window.setSelfInfo, [
      operationID,
      JSON.stringify(data),
    ]);
  };

  setSelfInfo = <T>(data: PartialUserItem, operationID = uuidv4()) => {
    return this._invoker<T>('setSelfInfo', window.setSelfInfo, [
      operationID,
      JSON.stringify(data),
    ]);
  };

  createTextAtMessage = (data: AtMsgParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'createTextAtMessage',
      window.createTextAtMessage,
      [
        operationID,
        data.text,
        JSON.stringify(data.atUserIDList),
        JSON.stringify(data.atUsersInfo),
        JSON.stringify(data.message) ?? '',
      ],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };
  createSoundMessageByURL = (
    data: SoundMsgParamsByURL,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'createSoundMessageByURL',
      window.createSoundMessageByURL,
      [operationID, JSON.stringify(data)],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };
  createSoundMessageByFile = (
    data: SoundMsgParamsByURL & { file: File },
    operationID = uuidv4()
  ) => {
    data.uuid = `${data.uuid}/${data.file.name}`;
    window.fileMapSet(data.uuid, data.file);
    return this._invoker<MessageItem>(
      'createSoundMessageByFile',
      window.createSoundMessageByURL,
      [operationID, JSON.stringify(data)],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };

  createVideoMessageByURL = (
    data: VideoMsgParamsByURL,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'createVideoMessageByURL',
      window.createVideoMessageByURL,
      [operationID, JSON.stringify(data)],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };

  createVideoMessageByFile = (
    data: VideoMsgParamsByURL & { videoFile: File; snapshotFile: File },
    operationID = uuidv4()
  ) => {
    data.videoUUID = `${data.videoUUID}/${data.videoFile.name}`;
    data.snapshotUUID = `${data.snapshotUUID}/${data.snapshotFile.name}`;
    window.fileMapSet(data.videoUUID, data.videoFile);
    window.fileMapSet(data.snapshotUUID, data.snapshotFile);
    return this._invoker<MessageItem>(
      'createVideoMessageByFile',
      window.createVideoMessageByURL,
      [operationID, JSON.stringify(data)],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };

  createFileMessageByURL = (
    data: FileMsgParamsByURL,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'createFileMessageByURL',
      window.createFileMessageByURL,
      [operationID, JSON.stringify(data)],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };

  createFileMessageByFile = (
    data: FileMsgParamsByURL & { file: File },
    operationID = uuidv4()
  ) => {
    data.uuid = `${data.uuid}/${data.file.name}`;
    window.fileMapSet(data.uuid, data.file);
    return this._invoker<MessageItem>(
      'createFileMessageByFile',
      window.createFileMessageByURL,
      [operationID, JSON.stringify(data)],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };

  createMergerMessage = (data: MergerMsgParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'createMergerMessage ',
      window.createMergerMessage,
      [
        operationID,
        JSON.stringify(data.messageList),
        data.title,
        JSON.stringify(data.summaryList),
      ],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };

  createForwardMessage = (data: MessageItem, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'createForwardMessage ',
      window.createForwardMessage,
      [operationID, JSON.stringify(data)],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };

  createFaceMessage = (data: FaceMessageParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'createFaceMessage ',
      window.createFaceMessage,
      [operationID, data.index, data.data],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };

  createLocationMessage = (data: LocationMsgParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'createLocationMessage ',
      window.createLocationMessage,
      [operationID, data.description, data.longitude, data.latitude],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };

  createCardMessage = (data: CardElem, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'createCardMessage ',
      window.createCardMessage,
      [operationID, JSON.stringify(data)],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };

  deleteMessageFromLocalStorage = <T>(
    data: AccessMessageParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'deleteMessageFromLocalStorage ',
      window.deleteMessageFromLocalStorage,
      [operationID, data.conversationID, data.clientMsgID]
    );
  };

  deleteMessage = <T>(data: AccessMessageParams, operationID = uuidv4()) => {
    return this._invoker<T>('deleteMessage ', window.deleteMessage, [
      operationID,
      data.conversationID,
      data.clientMsgID,
    ]);
  };

  deleteAllConversationFromLocal = <T>(operationID = uuidv4()) => {
    return this._invoker<T>(
      'deleteAllConversationFromLocal ',
      window.deleteAllConversationFromLocal,
      [operationID]
    );
  };

  deleteAllMsgFromLocal = <T>(operationID = uuidv4()) => {
    return this._invoker<T>(
      'deleteAllMsgFromLocal ',
      window.deleteAllMsgFromLocal,
      [operationID]
    );
  };

  deleteAllMsgFromLocalAndSvr = <T>(operationID = uuidv4()) => {
    return this._invoker<T>(
      'deleteAllMsgFromLocalAndSvr ',
      window.deleteAllMsgFromLocalAndSvr,
      [operationID]
    );
  };

  insertSingleMessageToLocalStorage = <T>(
    data: InsertSingleMsgParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'insertSingleMessageToLocalStorage ',
      window.insertSingleMessageToLocalStorage,
      [operationID, JSON.stringify(data.message), data.recvID, data.sendID]
    );
  };

  insertGroupMessageToLocalStorage = <T>(
    data: InsertGroupMsgParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'insertGroupMessageToLocalStorage ',
      window.insertGroupMessageToLocalStorage,
      [operationID, JSON.stringify(data.message), data.groupID, data.sendID]
    );
  };
  /**
   * @deprecated Use changeInputStates instead.
   */
  typingStatusUpdate = <T>(
    data: TypingUpdateParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>('typingStatusUpdate ', window.typingStatusUpdate, [
      operationID,
      data.recvID,
      data.msgTip,
    ]);
  };
  changeInputStates = (
    data: ChangeInputStatesParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<void>('changeInputStates ', window.changeInputStates, [
      operationID,
      data.conversationID,
      data.focus,
    ]);
  };
  getInputstates = (data: GetInputstatesParams, operationID = uuidv4()) => {
    return this._invoker<Platform[]>('getInputstates ', window.getInputstates, [
      operationID,
      data.conversationID,
      data.userID,
    ]);
  };
  clearConversationAndDeleteAllMsg = <T>(
    data: string,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'clearConversationAndDeleteAllMsg ',
      window.clearConversationAndDeleteAllMsg,
      [operationID, data]
    );
  };
  hideConversation = <T>(data: string, operationID = uuidv4()) => {
    return this._invoker<T>('hideConversation ', window.hideConversation, [
      operationID,
      data,
    ]);
  };
  getConversationListSplit = (
    data: SplitConversationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<ConversationItem[]>(
      'getConversationListSplit ',
      window.getConversationListSplit,
      [operationID, data.offset, data.count]
    );
  };
  // searchConversation = (data: SplitConversationParams, operationID = uuidv4()) => {
  //   return this._invoker<ConversationItem[]>(
  //     'searchConversation ',
  //     window.searchConversation,
  //     [operationID, data.offset, data.count]
  //   );
  // };
  /**
   * @deprecated Use setConversation instead.
   */
  setConversationEx = (
    data: SetConversationExParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<ConversationItem[]>(
      'setConversationEx ',
      window.setConversation,
      [
        operationID,
        data.conversationID,
        JSON.stringify({
          ex: data.ex,
        }),
      ]
    );
  };
  getConversationIDBySessionType = (
    data: GetOneConversationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<string>(
      'getConversationIDBySessionType ',
      window.getConversationIDBySessionType,
      [operationID, data.sourceID, data.sessionType]
    );
  };

  getMultipleConversation = (data: string[], operationID = uuidv4()) => {
    return this._invoker<ConversationItem[]>(
      'getMultipleConversation ',
      window.getMultipleConversation,
      [operationID, JSON.stringify(data)]
    );
  };

  deleteConversation = <T>(data: string, operationID = uuidv4()) => {
    return this._invoker<T>('deleteConversation ', window.deleteConversation, [
      operationID,
      data,
    ]);
  };

  /**
   * @deprecated Use setConversation instead.
   */
  setConversationDraft = <T>(
    data: SetConversationDraftParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'setConversationDraft ',
      window.setConversationDraft,
      [operationID, data.conversationID, data.draftText]
    );
  };

  /**
   * @deprecated Use setConversation instead.
   */
  pinConversation = <T>(
    data: SetConversationPinParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>('pinConversation ', window.setConversation, [
      operationID,
      data.conversationID,
      JSON.stringify({
        isPinned: data.isPinned,
      }),
    ]);
  };
  getTotalUnreadMsgCount = (operationID = uuidv4()) => {
    return this._invoker<number>(
      'getTotalUnreadMsgCount ',
      window.getTotalUnreadMsgCount,
      [operationID]
    );
  };

  getConversationRecvMessageOpt = (data: string[], operationID = uuidv4()) => {
    return this._invoker<ConversationItem[]>(
      'getConversationRecvMessageOpt ',
      window.getConversationRecvMessageOpt,
      [operationID, JSON.stringify(data)]
    );
  };

  /**
   * @deprecated Use setConversation instead.
   */
  setConversationRecvMessageOpt = <T>(
    data: SetConversationRecvOptParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'setConversationRecvMessageOpt ',
      window.setConversation,
      [
        operationID,
        data.conversationID,
        JSON.stringify({
          recvMsgOpt: data.opt,
        }),
      ]
    );
  };
  searchLocalMessages = (data: SearchLocalParams, operationID = uuidv4()) => {
    return this._invoker<SearchMessageResult>(
      'searchLocalMessages ',
      window.searchLocalMessages,
      [operationID, JSON.stringify(data)]
    );
  };
  addFriend = <T>(data: AddFriendParams, operationID = uuidv4()) => {
    return this._invoker<T>('addFriend ', window.addFriend, [
      operationID,
      JSON.stringify(data),
    ]);
  };
  searchFriends = (data: SearchFriendParams, operationID = uuidv4()) => {
    return this._invoker<SearchedFriendsInfo[]>(
      'searchFriends ',
      window.searchFriends,
      [operationID, JSON.stringify(data)]
    );
  };
  getSpecifiedFriendsInfo = (
    data: GetSpecifiedFriendsParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<FriendUserItem[]>(
      'getSpecifiedFriendsInfo',
      window.getSpecifiedFriendsInfo,
      [operationID, JSON.stringify(data.friendUserIDList), data.filterBlack]
    );
  };
  getFriendApplicationListAsRecipient = (operationID = uuidv4()) => {
    return this._invoker<FriendApplicationItem[]>(
      'getFriendApplicationListAsRecipient ',
      window.getFriendApplicationListAsRecipient,
      [operationID]
    );
  };
  getFriendApplicationListAsApplicant = (operationID = uuidv4()) => {
    return this._invoker<FriendApplicationItem[]>(
      'getFriendApplicationListAsApplicant ',
      window.getFriendApplicationListAsApplicant,
      [operationID]
    );
  };
  getFriendList = (filterBlack = false, operationID = uuidv4()) => {
    return this._invoker<FriendUserItem[]>(
      'getFriendList ',
      window.getFriendList,
      [operationID, filterBlack]
    );
  };
  getFriendListPage = (
    data: OffsetParams & { filterBlack?: boolean },
    operationID = uuidv4()
  ) => {
    return this._invoker<FriendUserItem[]>(
      'getFriendListPage ',
      window.getFriendListPage,
      [operationID, data.offset, data.count, data.filterBlack ?? false]
    );
  };
  updateFriends = <T>(data: UpdateFriendsParams, operationID = uuidv4()) => {
    return this._invoker<T>('updateFriends ', window.updateFriends, [
      operationID,
      JSON.stringify(data),
    ]);
  };
  /**
   * @deprecated Use updateFriends instead.
   */
  setFriendRemark = <T>(data: RemarkFriendParams, operationID = uuidv4()) => {
    return this._invoker<T>('setFriendRemark ', window.updateFriends, [
      operationID,
      JSON.stringify({
        friendUserIDs: [data.toUserID],
        remark: data.remark,
      }),
    ]);
  };
  /**
   * @deprecated Use updateFriends instead.
   */
  pinFriends = <T>(data: PinFriendParams, operationID = uuidv4()) => {
    return this._invoker<T>('pinFriends ', window.updateFriends, [
      operationID,
      JSON.stringify({
        friendUserIDs: data.toUserIDs,
        isPinned: data.isPinned,
      }),
    ]);
  };
  /**
   * @deprecated Use updateFriends instead.
   */
  setFriendsEx = <T>(data: SetFriendExParams, operationID = uuidv4()) => {
    return this._invoker<T>('setFriendsEx ', window.updateFriends, [
      operationID,
      JSON.stringify({
        friendUserIDs: data.toUserIDs,
        ex: data.ex,
      }),
      data.ex,
    ]);
  };
  checkFriend = (data: string[], operationID = uuidv4()) => {
    return this._invoker<FriendshipInfo[]>('checkFriend', window.checkFriend, [
      operationID,
      JSON.stringify(data),
    ]);
  };
  acceptFriendApplication = <T>(
    data: AccessFriendApplicationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'acceptFriendApplication',
      window.acceptFriendApplication,
      [operationID, JSON.stringify(data)]
    );
  };
  refuseFriendApplication = <T>(
    data: AccessFriendApplicationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'refuseFriendApplication ',
      window.refuseFriendApplication,
      [operationID, JSON.stringify(data)]
    );
  };
  deleteFriend = <T>(data: string, operationID = uuidv4()) => {
    return this._invoker<T>('deleteFriend ', window.deleteFriend, [
      operationID,
      data,
    ]);
  };
  addBlack = <T>(data: AddBlackParams, operationID = uuidv4()) => {
    return this._invoker<T>('addBlack ', window.addBlack, [
      operationID,
      data.toUserID,
      data.ex ?? '',
    ]);
  };
  removeBlack = <T>(data: string, operationID = uuidv4()) => {
    return this._invoker<T>('removeBlack ', window.removeBlack, [
      operationID,
      data,
    ]);
  };
  getBlackList = (operationID = uuidv4()) => {
    return this._invoker<BlackUserItem[]>(
      'getBlackList ',
      window.getBlackList,
      [operationID]
    );
  };
  inviteUserToGroup = <T>(
    data: AccessToGroupParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>('inviteUserToGroup ', window.inviteUserToGroup, [
      operationID,
      data.groupID,
      data.reason,
      JSON.stringify(data.userIDList),
    ]);
  };
  kickGroupMember = <T>(data: AccessToGroupParams, operationID = uuidv4()) => {
    return this._invoker<T>('kickGroupMember ', window.kickGroupMember, [
      operationID,
      data.groupID,
      data.reason,
      JSON.stringify(data.userIDList),
    ]);
  };
  isJoinGroup = <T>(data: string, operationID = uuidv4()) => {
    return this._invoker<T>('isJoinGroup ', window.isJoinGroup, [
      operationID,
      data,
    ]);
  };

  getSpecifiedGroupMembersInfo = (
    data: Omit<AccessToGroupParams, 'reason'>,
    operationID = uuidv4()
  ) => {
    return this._invoker<GroupMemberItem[]>(
      'getSpecifiedGroupMembersInfo ',
      window.getSpecifiedGroupMembersInfo,
      [operationID, data.groupID, JSON.stringify(data.userIDList)]
    );
  };
  getUsersInGroup = (
    data: Omit<AccessToGroupParams, 'reason'>,
    operationID = uuidv4()
  ) => {
    return this._invoker<string[]>('getUsersInGroup ', window.getUsersInGroup, [
      operationID,
      data.groupID,
      JSON.stringify(data.userIDList),
    ]);
  };
  getGroupMemberListByJoinTimeFilter = (
    data: GetGroupMemberByTimeParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<GroupMemberItem[]>(
      'getGroupMemberListByJoinTimeFilter ',
      window.getGroupMemberListByJoinTimeFilter,
      [
        operationID,
        data.groupID,
        data.offset,
        data.count,
        data.joinTimeBegin,
        data.joinTimeEnd,
        JSON.stringify(data.filterUserIDList),
      ]
    );
  };
  searchGroupMembers = (
    data: SearchGroupMemberParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<GroupMemberItem[]>(
      'searchGroupMembers ',
      window.searchGroupMembers,
      [operationID, JSON.stringify(data)]
    );
  };
  /**
   * @deprecated Use setGroupInfo instead.
   */
  setGroupApplyMemberFriend = <T>(
    data: SetMemberPermissionParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>('setGroupApplyMemberFriend ', window.setGroupInfo, [
      operationID,
      JSON.stringify({
        groupID: data.groupID,
        applyMemberFriend: data.rule,
      }),
    ]);
  };
  /**
   * @deprecated Use setGroupInfo instead.
   */
  setGroupLookMemberInfo = <T>(
    data: SetMemberPermissionParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>('setGroupLookMemberInfo ', window.setGroupInfo, [
      operationID,
      JSON.stringify({
        groupID: data.groupID,
        lookMemberInfo: data.rule,
      }),
    ]);
  };
  getJoinedGroupList = (operationID = uuidv4()) => {
    return this._invoker<GroupItem[]>(
      'getJoinedGroupList ',
      window.getJoinedGroupList,
      [operationID]
    );
  };
  getJoinedGroupListPage = (data: OffsetParams, operationID = uuidv4()) => {
    return this._invoker<GroupItem[]>(
      'getJoinedGroupListPage ',
      window.getJoinedGroupListPage,
      [operationID, data.offset, data.count]
    );
  };
  createGroup = (data: CreateGroupParams, operationID = uuidv4()) => {
    return this._invoker<GroupItem>('createGroup ', window.createGroup, [
      operationID,
      JSON.stringify(data),
    ]);
  };
  setGroupInfo = <T>(
    data: Partial<GroupItem> & { groupID: string },
    operationID = uuidv4()
  ) => {
    return this._invoker<T>('setGroupInfo ', window.setGroupInfo, [
      operationID,
      JSON.stringify(data),
    ]);
  };
  /**
   * @deprecated Use setGroupMemberInfo instead.
   */
  setGroupMemberNickname = <T>(
    data: SetGroupMemberNickParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'setGroupMemberNickname ',
      window.setGroupMemberInfo,
      [
        operationID,
        JSON.stringify({
          groupID: data.groupID,
          userID: data.userID,
          nickname: data.groupMemberNickname,
        }),
      ]
    );
  };
  setGroupMemberInfo = <T>(
    data: UpdateMemberInfoParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>('setGroupMemberInfo ', window.setGroupMemberInfo, [
      operationID,
      JSON.stringify(data),
    ]);
  };
  joinGroup = <T>(data: JoinGroupParams, operationID = uuidv4()) => {
    return this._invoker<T>('joinGroup ', window.joinGroup, [
      operationID,
      data.groupID,
      data.reqMsg,
      data.joinSource,
      data.ex ?? '',
    ]);
  };
  searchGroups = (data: SearchGroupParams, operationID = uuidv4()) => {
    return this._invoker<GroupItem[]>('searchGroups ', window.searchGroups, [
      operationID,
      JSON.stringify(data),
    ]);
  };
  quitGroup = <T>(data: string, operationID = uuidv4()) => {
    return this._invoker<T>('quitGroup ', window.quitGroup, [
      operationID,
      data,
    ]);
  };
  dismissGroup = <T>(data: string, operationID = uuidv4()) => {
    return this._invoker<T>('dismissGroup ', window.dismissGroup, [
      operationID,
      data,
    ]);
  };
  changeGroupMute = <T>(
    data: ChangeGroupMuteParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>('changeGroupMute ', window.changeGroupMute, [
      operationID,
      data.groupID,
      data.isMute,
    ]);
  };
  changeGroupMemberMute = <T>(
    data: ChangeGroupMemberMuteParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'changeGroupMemberMute ',
      window.changeGroupMemberMute,
      [operationID, data.groupID, data.userID, data.mutedSeconds]
    );
  };
  transferGroupOwner = <T>(
    data: TransferGroupParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>('transferGroupOwner ', window.transferGroupOwner, [
      operationID,
      data.groupID,
      data.newOwnerUserID,
    ]);
  };
  getGroupApplicationListAsApplicant = (operationID = uuidv4()) => {
    return this._invoker<GroupApplicationItem[]>(
      'getGroupApplicationListAsApplicant ',
      window.getGroupApplicationListAsApplicant,
      [operationID]
    );
  };
  getGroupApplicationListAsRecipient = (operationID = uuidv4()) => {
    return this._invoker<GroupApplicationItem[]>(
      'getGroupApplicationListAsRecipient ',
      window.getGroupApplicationListAsRecipient,
      [operationID]
    );
  };
  acceptGroupApplication = <T>(
    data: AccessGroupApplicationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'acceptGroupApplication ',
      window.acceptGroupApplication,
      [operationID, data.groupID, data.fromUserID, data.handleMsg]
    );
  };
  refuseGroupApplication = <T>(
    data: AccessGroupApplicationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'refuseGroupApplication ',
      window.refuseGroupApplication,
      [operationID, data.groupID, data.fromUserID, data.handleMsg]
    );
  };
  /**
   * @deprecated Use setConversation instead.
   */
  resetConversationGroupAtType = <T>(data: string, operationID = uuidv4()) => {
    return this._invoker<T>(
      'resetConversationGroupAtType ',
      window.setConversation,
      [
        operationID,
        data,
        JSON.stringify({
          groupAtType: GroupAtType.AtNormal,
        }),
      ]
    );
  };
  /**
   * @deprecated Use setGroupMemberInfo instead.
   */
  setGroupMemberRoleLevel = <T>(
    data: SetGroupRoleParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'setGroupMemberRoleLevel ',
      window.setGroupMemberInfo,
      [
        operationID,
        JSON.stringify({
          groupID: data.groupID,
          userID: data.userID,
          roleLevel: data.roleLevel,
        }),
      ]
    );
  };
  /**
   * @deprecated Use setGroupInfo instead.
   */
  setGroupVerification = <T>(
    data: SetGroupVerificationParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>('setGroupVerification ', window.setGroupInfo, [
      operationID,
      JSON.stringify({
        groupID: data.groupID,
        needVerification: data.verification,
      }),
    ]);
  };
  getGroupMemberOwnerAndAdmin = (data: string, operationID = uuidv4()) => {
    return this._invoker<GroupMemberItem[]>(
      'getGroupMemberOwnerAndAdmin ',
      window.getGroupMemberOwnerAndAdmin,
      [operationID, data]
    );
  };
  /**
   * @deprecated Use setSelfInfo instead.
   */
  setGlobalRecvMessageOpt = <T>(
    opt: MessageReceiveOptType,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>('setGlobalRecvMessageOpt ', window.setSelfInfo, [
      operationID,
      JSON.stringify({ globalRecvMsgOpt: opt }),
    ]);
  };
  findMessageList = (data: FindMessageParams[], operationID = uuidv4()) => {
    return this._invoker<SearchMessageResult>(
      'findMessageList ',
      window.findMessageList,
      [operationID, JSON.stringify(data)]
    );
  };
  uploadFile = (data: UploadFileParams, operationID = uuidv4()) => {
    data.uuid = `${data.uuid}/${data.file?.name}`;
    window.fileMapSet(data.uuid, data.file);
    return this._invoker<{ url: string }>('uploadFile ', window.uploadFile, [
      operationID,
      JSON.stringify({
        ...data,
        filepath: '',
        cause: '',
      }),
    ]);
  };
  subscribeUsersStatus = (data: string[], operationID = uuidv4()) => {
    return this._invoker<UserOnlineState[]>(
      'subscribeUsersStatus ',
      window.subscribeUsersStatus,
      [operationID, JSON.stringify(data)]
    );
  };
  unsubscribeUsersStatus = (data: string[], operationID = uuidv4()) => {
    return this._invoker<UserOnlineState[]>(
      'unsubscribeUsersStatus ',
      window.unsubscribeUsersStatus,
      [operationID, JSON.stringify(data)]
    );
  };
  getUserStatus = (operationID = uuidv4()) => {
    return this._invoker<UserOnlineState[]>(
      'getUserStatus ',
      window.getUserStatus,
      [operationID]
    );
  };
  getSubscribeUsersStatus = (operationID = uuidv4()) => {
    return this._invoker<UserOnlineState[]>(
      'getSubscribeUsersStatus ',
      window.getSubscribeUsersStatus,
      [operationID]
    );
  };
  signalingInvite = (data: SignalingInviteParams, operationID = uuidv4()) => {
    return this._invoker<RtcInviteResults>(
      'signalingInvite ',
      window.signalingInvite,
      [operationID, JSON.stringify(data)]
    );
  };
  signalingInviteInGroup = (
    data: SignalingInviteParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<RtcInviteResults>(
      'signalingInviteInGroup ',
      window.signalingInviteInGroup,
      [operationID, JSON.stringify(data)]
    );
  };
  signalingAccept = (data: RtcActionParams, operationID = uuidv4()) => {
    return this._invoker<RtcInviteResults>(
      'signalingAccept ',
      window.signalingAccept,
      [operationID, JSON.stringify(data)]
    );
  };
  signalingReject = <T>(data: RtcActionParams, operationID = uuidv4()) => {
    return this._invoker<T>('signalingReject ', window.signalingReject, [
      operationID,
      JSON.stringify(data),
    ]);
  };
  signalingCancel = <T>(data: RtcActionParams, operationID = uuidv4()) => {
    return this._invoker<T>('signalingCancel ', window.signalingCancel, [
      operationID,
      JSON.stringify(data),
    ]);
  };
  signalingHungUp = <T>(data: RtcActionParams, operationID = uuidv4()) => {
    return this._invoker<T>('signalingHungUp ', window.signalingHungUp, [
      operationID,
      JSON.stringify(data),
    ]);
  };
  signalingGetRoomByGroupID = (groupID: string, operationID = uuidv4()) => {
    return this._invoker<CallingRoomData>(
      'signalingGetRoomByGroupID ',
      window.signalingGetRoomByGroupID,
      [operationID, groupID]
    );
  };
  signalingGetTokenByRoomID = (roomID: string, operationID = uuidv4()) => {
    return this._invoker<RtcInviteResults>(
      'signalingGetTokenByRoomID ',
      window.signalingGetTokenByRoomID,
      [operationID, roomID]
    );
  };
  getSignalingInvitationInfoStartApp = (operationID = uuidv4()) => {
    return this._invoker<{
      invitation: RtcInvite | null;
      offlinePushInfo: OfflinePush;
    }>(
      'getSignalingInvitationInfoStartApp ',
      window.getSignalingInvitationInfoStartApp,
      [operationID]
    );
  };
  signalingSendCustomSignal = <T>(
    data: CustomSignalParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'signalingSendCustomSignal ',
      window.signalingSendCustomSignal,
      [operationID, data.customInfo, data.roomID]
    );
  };
  setConversationIsMsgDestruct = <T>(
    data: SetConversationMsgDestructParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'setConversationIsMsgDestruct ',
      window.setConversation,
      [
        operationID,
        data.conversationID,
        JSON.stringify({ isMsgDestruct: data.isMsgDestruct }),
      ]
    );
  };
  setConversationMsgDestructTime = <T>(
    data: SetConversationMsgDestructTimeParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'setConversationMsgDestructTime ',
      window.setConversation,
      [
        operationID,
        data.conversationID,
        JSON.stringify({
          msgDestructTime: data.msgDestructTime,
        }),
      ]
    );
  };
  createTargetedGroupMessage = (
    params: CreateTargetedGroupMessageParams,
    operationID = uuidv4()
  ) => {
    return this._invoker<MessageItem>(
      'createTargetedGroupMessage',
      window.createTargetedGroupMessage,
      [
        operationID,
        JSON.stringify(params.message),
        JSON.stringify(params.dstUserIDs),
      ],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };
  modifyMessage = (params: ModifyMessageParams, operationID = uuidv4()) => {
    return this._invoker<MessageItem>(
      'modifyMessage',
      window.modifyMessage,
      [operationID, JSON.stringify(params)],
      data => {
        // compitable with old version sdk
        return data[0];
      }
    );
  };
  deleteMessages = <T>(data: DeleteMessagesParams, operationID = uuidv4()) => {
    return this._invoker<T>('deleteMessages ', window.deleteMessages, [
      operationID,
      JSON.stringify(data),
    ]);
  };

  deleteUserAllMessagesInConv = <T>(
    data: {
      conversationID: string;
      userID: string;
    },
    operationID = uuidv4()
  ) => {
    return this._invoker<T>(
      'deleteUserAllMessagesInConv ',
      window.deleteUserAllMessagesInConv,
      [operationID, data.conversationID, data.userID]
    );
  };

  fileMapSet = (uuid: string, file: File) => window.fileMapSet(uuid, file);
}

let instance: SDK;

export function getSDK(config?: WasmPathConfig): SDK {
  const {
    sqlWasmPath,
    coreWasmPath = '/openIM.wasm',
    debug = true,
  } = config || {};
  if (typeof window === 'undefined') {
    return {} as SDK;
  }

  if (instance) {
    return instance;
  }

  instance = new SDK(coreWasmPath, debug);

  if (sqlWasmPath) {
    window.setSqlWasmPath(sqlWasmPath);
  }

  return instance;
}
