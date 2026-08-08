import type {} from '@/types';
import { initDatabaseAPI, workerPromise } from '@/api';
import Emitter from '@/utils/emitter';
import { v4 as uuidV4 } from 'uuid';
import { getGO, initializeWasm, getGoExitPromise } from './initialize';

import {
  HandleFriendApplicationParams,
  HandleGroupApplicationParams,
  ConversationMessageParams,
  AddFriendParams,
  CreateAdvancedTextMessageParams,
  CreateAdvancedQuoteMessageParams,
  CreateTextAtMessageParams,
  ChangeGroupMemberMuteParams,
  ChangeGroupMuteParams,
  CreateGroupParams,
  CreateCustomMessageParams,
  CreateFaceMessageParams,
  CreateFileMessageByURLParams,
  FindMessageQuery,
  GetAdvancedHistoryMessageListParams,
  GetGroupMemberListByJoinTimeFilterParams,
  GetGroupMemberListParams,
  ConversationSessionParams,
  CreateImageMessageByURLParams,
  LoginParams,
  InsertGroupMessageToLocalStorageParams,
  InsertSingleMessageToLocalStorageParams,
  GroupMemberOperationParams,
  GroupMemberUserListParams,
  JoinGroupParams,
  CreateLocationMessageParams,
  SetGroupMemberInfoParams,
  CreateMergerMessageParams,
  SetSelfInfoParams,
  CreateQuoteMessageParams,
  SearchFriendsParams,
  SearchGroupMembersParams,
  SearchGroupsParams,
  SearchLocalMessagesParams,
  SendMessageParams,
  SetConversationDraftParams,
  SetMessageLocalExParams,
  CreateSoundMessageByURLParams,
  ConversationListPaginationParams,
  TransferGroupOwnerParams,
  UploadFileParams,
  CreateVideoMessageByURLParams,
  WasmPathConfig,
  AddBlackParams,
  PaginationParams,
  UpdateFriendsParams,
  SetConversationParams,
  GetSpecifiedFriendsParams,
  ChangeInputStatesParams,
  GetInputStatesParams,
  GetFriendApplicationListAsRecipientParams,
  GetFriendApplicationListAsApplicantParams,
  ApplicationUnhandledCountParams,
  GroupApplicationListParams,
} from '../types/params';

import {
  AdvancedMessageListResult,
  BlackUserItem,
  CardElem,
  ConversationItem,
  FriendApplicationItem,
  CheckFriendResultItem,
  FriendUserItem,
  GroupApplicationItem,
  GroupItem,
  GroupMemberItem,
  InitConfig,
  MessageItem,
  PublicUserItem,
  SearchFriendsResultItem,
  SearchMessageResult,
  SelfUserInfo,
  UserOnlineState,
  SdkEventEnvelope,
  SdkResponse,
  WorkerResponse,
} from '../types/entity';
import { LoginStatus, Platform } from '@/types/enum';
import { logBoxStyleValue } from '@/utils';

class WasmSdk extends Emitter {
  private wasmInitializationPromise: Promise<Go | null>;
  private goRuntimeExitPromise: Promise<void> | undefined;
  private goExited = false;
  private parseResponses = true;
  private logToConsole = true;

  constructor(url = '/openIM.wasm', debug = true) {
    super();

    initDatabaseAPI(debug);
    this.logToConsole = debug;
    this.wasmInitializationPromise = initializeWasm(url);
    this.goRuntimeExitPromise = getGoExitPromise();

    if (this.goRuntimeExitPromise) {
      this.goRuntimeExitPromise
        .then(() => {
          this.logSdk('SDK => wasm exist');
        })
        .catch(err => {
          this.logSdk('SDK => wasm with error ', err);
        })
        .finally(() => {
          this.goExited = true;
        });
    }
  }

  private logSdk(...args: any[]) {
    if (this.logToConsole) {
      console.info(...args);
    }
  }

  private invokeCore<T>(
    functionName: string,
    func: (...args: any[]) => Promise<any>,
    args: any[],
    processor?: (data: string) => string
  ): Promise<SdkResponse<T>> {
    return new Promise(async (resolve, reject) => {
      this.logSdk(
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
        errCode: 0,
        errMsg: '',
      } as SdkResponse<T>;
      try {
        if (!getGO() || getGO().exited || this.goExited) {
          throw 'wasm exist already, fail to run';
        }

        let data = await func(...args);
        if (processor) {
          this.logSdk(
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

        if (this.parseResponses) {
          try {
            data = JSON.parse(data);
          } catch (error) {
            // parse error
          }
        }
        response.data = data;
        resolve(response);
      } catch (error) {
        this.logSdk(
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
          ...(error as SdkResponse<T>),
        };
        reject(response);
      }
    });
  }

  login = async (
    params: LoginParams,
    operationID = uuidV4()
  ): Promise<string> => {
    this.logSdk(
      `SDK => (invoked by js) run login with args ${JSON.stringify({
        params,
        operationID,
      })}`
    );

    await workerPromise;
    await this.wasmInitializationPromise;
    window.commonEventFunc(event => {
      try {
        this.logSdk(
          `%cSDK =>%c received event %c${event}%c `,
          logBoxStyleValue('#282828', '#ffffff'),
          '',
          'color: #4f2398;',
          ''
        );
        const parsed = JSON.parse(event) as SdkEventEnvelope;
        if (this.parseResponses) {
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

    const config: InitConfig = {
      platformID: params.platformID,
      apiAddr: params.apiAddr,
      wsAddr: params.wsAddr,
      dataDir: './',
      systemType: 'web',
      logLevel: params.logLevel || 5,
      isLogStandardOutput: params.isLogStandardOutput ?? this.logToConsole,
      logFilePath: './',
      isExternalExtensions: params.isExternalExtensions || false,
    };
    this.parseResponses = params.tryParse ?? true;
    window.initSDK(operationID, JSON.stringify(config));
    return await window.login(operationID, params.userID, params.token);
  };
  logout = (operationID = uuidV4()) => {
    window.fileMapClear();
    return this.invokeCore<void>('logout', window.logout, [operationID]);
  };
  getAllConversationList = (operationID = uuidV4()) => {
    return this.invokeCore<ConversationItem[]>(
      'getAllConversationList',
      window.getAllConversationList,
      [operationID]
    );
  };
  getOneConversation = (
    params: ConversationSessionParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<ConversationItem>(
      'getOneConversation',
      window.getOneConversation,
      [operationID, params.sessionType, params.sourceID]
    );
  };
  getAdvancedHistoryMessageList = (
    params: GetAdvancedHistoryMessageListParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<AdvancedMessageListResult>(
      'getAdvancedHistoryMessageList',
      window.getAdvancedHistoryMessageList,
      [operationID, JSON.stringify(params)]
    );
  };
  getAdvancedHistoryMessageListReverse = (
    params: GetAdvancedHistoryMessageListParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<AdvancedMessageListResult>(
      'getAdvancedHistoryMessageListReverse',
      window.getAdvancedHistoryMessageListReverse,
      [operationID, JSON.stringify(params)]
    );
  };
  getSpecifiedGroupsInfo = (params: string[], operationID = uuidV4()) => {
    return this.invokeCore<GroupItem[]>(
      'getSpecifiedGroupsInfo',
      window.getSpecifiedGroupsInfo,
      [operationID, JSON.stringify(params)]
    );
  };
  deleteConversationAndDeleteAllMsg = (
    conversationID: string,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<void>(
      'deleteConversationAndDeleteAllMsg',
      window.deleteConversationAndDeleteAllMsg,
      [operationID, conversationID]
    );
  };
  markConversationMessageAsRead = (data: string, operationID = uuidV4()) => {
    return this.invokeCore<void>(
      'markConversationMessageAsRead',
      window.markConversationMessageAsRead,
      [operationID, data]
    );
  };
  markAllConversationMessageAsRead = (operationID = uuidV4()) => {
    return this.invokeCore<void>(
      'markAllConversationMessageAsRead',
      window.markAllConversationMessageAsRead,
      [operationID]
    );
  };
  getGroupMemberList = (
    params: GetGroupMemberListParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<GroupMemberItem[]>(
      'getGroupMemberList',
      window.getGroupMemberList,
      [operationID, params.groupID, params.filter, params.offset, params.count]
    );
  };
  createTextMessage = (text: string, operationID = uuidV4()) => {
    return this.invokeCore<MessageItem>(
      'createTextMessage',
      window.createTextMessage,
      [operationID, text],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };
  createImageMessage = (imagePath: string, operationID = uuidV4()) => {
    return this.invokeCore<MessageItem | ''>(
      'createImageMessage',
      window.createImageMessage,
      [operationID, imagePath],
      data => data[0]
    );
  };
  createImageMessageFromFullPath = (
    imageFullPath: string,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem | ''>(
      'createImageMessageFromFullPath',
      window.createImageMessageFromFullPath,
      [operationID, imageFullPath],
      data => data[0]
    );
  };
  createImageMessageByURL = (
    params: CreateImageMessageByURLParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem>(
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
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };
  createImageMessageByFile = (
    params: CreateImageMessageByURLParams & { file: File },
    operationID = uuidV4()
  ) => {
    params.sourcePicture.uuid = `${params.sourcePicture.uuid}/${params.file.name}`;
    window.fileMapSet(params.sourcePicture.uuid, params.file);
    return this.invokeCore<MessageItem>(
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
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };
  createCustomMessage = (
    params: CreateCustomMessageParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem>(
      'createCustomMessage',
      window.createCustomMessage,
      [operationID, params.data, params.extension, params.description],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };
  createQuoteMessage = (
    params: CreateQuoteMessageParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem>(
      'createQuoteMessage',
      window.createQuoteMessage,
      [operationID, params.text, params.message],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };
  createAdvancedQuoteMessage = (
    params: CreateAdvancedQuoteMessageParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem>(
      'createAdvancedQuoteMessage',
      window.createAdvancedQuoteMessage,
      [
        operationID,
        params.text,
        JSON.stringify(params.message),
        JSON.stringify(params.messageEntityList),
      ],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };
  createAdvancedTextMessage = (
    params: CreateAdvancedTextMessageParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem>(
      'createAdvancedTextMessage',
      window.createAdvancedTextMessage,
      [operationID, params.text, JSON.stringify(params.messageEntityList)],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };
  sendMessage = (params: SendMessageParams, operationID = uuidV4()) => {
    const offlinePushInfo = params.offlinePushInfo ?? {
      title: 'You have a new message.',
      desc: '',
      ex: '',
      iOSPushSound: '+1',
      iOSBadgeCount: true,
    };
    return this.invokeCore<MessageItem>('sendMessage', window.sendMessage, [
      operationID,
      JSON.stringify(params.message),
      params.recvID,
      params.groupID,
      JSON.stringify(offlinePushInfo),
      params.isOnlineOnly ?? false,
    ]);
  };
  sendMessageNotOss = (params: SendMessageParams, operationID = uuidV4()) => {
    const offlinePushInfo = params.offlinePushInfo ?? {
      title: 'You have a new message.',
      desc: '',
      ex: '',
      iOSPushSound: '+1',
      iOSBadgeCount: true,
    };
    return this.invokeCore<MessageItem>(
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

  setMessageLocalEx = (
    params: SetMessageLocalExParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<void>(
      'setMessageLocalEx',
      window.setMessageLocalEx,
      [operationID, params.conversationID, params.clientMsgID, params.localEx]
    );
  };

  exportDB(operationID = uuidV4()) {
    return this.invokeCore('exportDB', window.exportDB, [operationID]);
  }

  revokeMessage = (data: ConversationMessageParams, operationID = uuidV4()) => {
    return this.invokeCore<void>('revokeMessage', window.revokeMessage, [
      operationID,
      data.conversationID,
      data.clientMsgID,
    ]);
  };

  setConversation = (params: SetConversationParams, operationID = uuidV4()) => {
    return this.invokeCore<void>('setConversation', window.setConversation, [
      operationID,
      params.conversationID,
      JSON.stringify(params),
    ]);
  };

  getLoginStatus = (operationID = uuidV4()) => {
    return this.invokeCore<LoginStatus>(
      'getLoginStatus',
      window.getLoginStatus,
      [operationID],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };

  setAppBackgroundStatus = (data: boolean, operationID = uuidV4()) => {
    return this.invokeCore<void>(
      'setAppBackgroundStatus',
      window.setAppBackgroundStatus,
      [operationID, data]
    );
  };

  networkStatusChanged = (operationID = uuidV4()) => {
    return this.invokeCore<void>(
      'networkStatusChanged ',
      window.networkStatusChanged,
      [operationID]
    );
  };

  getSelfUserInfo = (operationID = uuidV4()) => {
    return this.invokeCore<SelfUserInfo>(
      'getSelfUserInfo',
      window.getSelfUserInfo,
      [operationID]
    );
  };

  getUsersInfo = (data: string[], operationID = uuidV4()) => {
    return this.invokeCore<PublicUserItem[]>(
      'getUsersInfo',
      window.getUsersInfo,
      [operationID, JSON.stringify(data)]
    );
  };

  setSelfInfo = (data: SetSelfInfoParams, operationID = uuidV4()) => {
    return this.invokeCore<void>('setSelfInfo', window.setSelfInfo, [
      operationID,
      JSON.stringify(data),
    ]);
  };

  createTextAtMessage = (
    data: CreateTextAtMessageParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem>(
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
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };
  createSoundMessageByURL = (
    data: CreateSoundMessageByURLParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem>(
      'createSoundMessageByURL',
      window.createSoundMessageByURL,
      [operationID, JSON.stringify(data)],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };
  createSoundMessage = (
    soundPath: string,
    duration: number,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem | ''>(
      'createSoundMessage',
      window.createSoundMessage,
      [operationID, soundPath, duration],
      data => data[0]
    );
  };
  createSoundMessageFromFullPath = (
    soundPath: string,
    duration: number,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem | ''>(
      'createSoundMessageFromFullPath',
      window.createSoundMessageFromFullPath,
      [operationID, soundPath, duration],
      data => data[0]
    );
  };
  createSoundMessageByFile = (
    data: CreateSoundMessageByURLParams & { file: File },
    operationID = uuidV4()
  ) => {
    data.uuid = `${data.uuid}/${data.file.name}`;
    window.fileMapSet(data.uuid, data.file);
    return this.invokeCore<MessageItem>(
      'createSoundMessageByFile',
      window.createSoundMessageByURL,
      [operationID, JSON.stringify(data)],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };

  createVideoMessageByURL = (
    data: CreateVideoMessageByURLParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem>(
      'createVideoMessageByURL',
      window.createVideoMessageByURL,
      [operationID, JSON.stringify(data)],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };
  createVideoMessage = (
    videoPath: string,
    videoType: string,
    duration: number,
    snapshotPath: string,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem | ''>(
      'createVideoMessage',
      window.createVideoMessage,
      [operationID, videoPath, videoType, duration, snapshotPath],
      data => data[0]
    );
  };
  createVideoMessageFromFullPath = (
    videoFullPath: string,
    videoType: string,
    duration: number,
    snapshotFullPath: string,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem | ''>(
      'createVideoMessageFromFullPath',
      window.createVideoMessageFromFullPath,
      [operationID, videoFullPath, videoType, duration, snapshotFullPath],
      data => data[0]
    );
  };

  createVideoMessageByFile = (
    data: CreateVideoMessageByURLParams & {
      videoFile: File;
      snapshotFile: File;
    },
    operationID = uuidV4()
  ) => {
    data.videoUUID = `${data.videoUUID}/${data.videoFile.name}`;
    data.snapshotUUID = `${data.snapshotUUID}/${data.snapshotFile.name}`;
    window.fileMapSet(data.videoUUID, data.videoFile);
    window.fileMapSet(data.snapshotUUID, data.snapshotFile);
    return this.invokeCore<MessageItem>(
      'createVideoMessageByFile',
      window.createVideoMessageByURL,
      [operationID, JSON.stringify(data)],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };

  createFileMessageByURL = (
    data: CreateFileMessageByURLParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem>(
      'createFileMessageByURL',
      window.createFileMessageByURL,
      [operationID, JSON.stringify(data)],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };
  createFileMessage = (
    filePath: string,
    fileName: string,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem | ''>(
      'createFileMessage',
      window.createFileMessage,
      [operationID, filePath, fileName],
      data => data[0]
    );
  };
  createFileMessageFromFullPath = (
    fileFullPath: string,
    fileName: string,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem | ''>(
      'createFileMessageFromFullPath',
      window.createFileMessageFromFullPath,
      [operationID, fileFullPath, fileName],
      data => data[0]
    );
  };

  createFileMessageByFile = (
    data: CreateFileMessageByURLParams & { file: File },
    operationID = uuidV4()
  ) => {
    data.uuid = `${data.uuid}/${data.file.name}`;
    window.fileMapSet(data.uuid, data.file);
    return this.invokeCore<MessageItem>(
      'createFileMessageByFile',
      window.createFileMessageByURL,
      [operationID, JSON.stringify(data)],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };

  createMergerMessage = (
    data: CreateMergerMessageParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem>(
      'createMergerMessage ',
      window.createMergerMessage,
      [
        operationID,
        JSON.stringify(data.messageList),
        data.title,
        JSON.stringify(data.summaryList),
      ],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };

  createForwardMessage = (data: MessageItem, operationID = uuidV4()) => {
    return this.invokeCore<MessageItem>(
      'createForwardMessage ',
      window.createForwardMessage,
      [operationID, JSON.stringify(data)],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };

  createFaceMessage = (
    data: CreateFaceMessageParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem>(
      'createFaceMessage ',
      window.createFaceMessage,
      [operationID, data.index, data.data],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };

  createLocationMessage = (
    data: CreateLocationMessageParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem>(
      'createLocationMessage ',
      window.createLocationMessage,
      [operationID, data.description, data.longitude, data.latitude],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };

  createCardMessage = (data: CardElem, operationID = uuidV4()) => {
    return this.invokeCore<MessageItem>(
      'createCardMessage ',
      window.createCardMessage,
      [operationID, JSON.stringify(data)],
      data => {
        // Go synchronous factory methods return a single-item tuple.
        return data[0];
      }
    );
  };

  deleteMessageFromLocalStorage = (
    data: ConversationMessageParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<void>(
      'deleteMessageFromLocalStorage ',
      window.deleteMessageFromLocalStorage,
      [operationID, data.conversationID, data.clientMsgID]
    );
  };

  deleteMessage = (data: ConversationMessageParams, operationID = uuidV4()) => {
    return this.invokeCore<void>('deleteMessage ', window.deleteMessage, [
      operationID,
      data.conversationID,
      data.clientMsgID,
    ]);
  };

  hideAllConversations = (operationID = uuidV4()) => {
    return this.invokeCore<void>(
      'hideAllConversations',
      window.hideAllConversations,
      [operationID]
    );
  };

  deleteAllMsgFromLocal = (operationID = uuidV4()) => {
    return this.invokeCore<void>(
      'deleteAllMsgFromLocal ',
      window.deleteAllMsgFromLocal,
      [operationID]
    );
  };

  deleteAllMsgFromLocalAndSvr = (operationID = uuidV4()) => {
    return this.invokeCore<void>(
      'deleteAllMsgFromLocalAndSvr ',
      window.deleteAllMsgFromLocalAndSvr,
      [operationID]
    );
  };

  insertSingleMessageToLocalStorage = (
    data: InsertSingleMessageToLocalStorageParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem>(
      'insertSingleMessageToLocalStorage ',
      window.insertSingleMessageToLocalStorage,
      [operationID, JSON.stringify(data.message), data.recvID, data.sendID]
    );
  };

  insertGroupMessageToLocalStorage = (
    data: InsertGroupMessageToLocalStorageParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<MessageItem>(
      'insertGroupMessageToLocalStorage ',
      window.insertGroupMessageToLocalStorage,
      [operationID, JSON.stringify(data.message), data.groupID, data.sendID]
    );
  };
  changeInputStates = (
    data: ChangeInputStatesParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<void>(
      'changeInputStates ',
      window.changeInputStates,
      [operationID, data.conversationID, data.focus]
    );
  };
  getInputStates = (data: GetInputStatesParams, operationID = uuidV4()) => {
    return this.invokeCore<Platform[]>(
      'getInputStates',
      window.getInputStates,
      [operationID, data.conversationID, data.userID]
    );
  };
  clearConversationAndDeleteAllMsg = (data: string, operationID = uuidV4()) => {
    return this.invokeCore<void>(
      'clearConversationAndDeleteAllMsg ',
      window.clearConversationAndDeleteAllMsg,
      [operationID, data]
    );
  };
  hideConversation = (data: string, operationID = uuidV4()) => {
    return this.invokeCore<void>('hideConversation ', window.hideConversation, [
      operationID,
      data,
    ]);
  };
  getConversationListSplit = (
    data: ConversationListPaginationParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<ConversationItem[]>(
      'getConversationListSplit ',
      window.getConversationListSplit,
      [operationID, data.offset, data.count]
    );
  };
  searchConversation = (searchParam: string, operationID = uuidV4()) => {
    return this.invokeCore<ConversationItem[]>(
      'searchConversation',
      window.searchConversation,
      [operationID, searchParam]
    );
  };
  getMultipleConversation = (data: string[], operationID = uuidV4()) => {
    return this.invokeCore<ConversationItem[]>(
      'getMultipleConversation ',
      window.getMultipleConversation,
      [operationID, JSON.stringify(data)]
    );
  };

  setConversationDraft = (
    data: SetConversationDraftParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<void>(
      'setConversationDraft ',
      window.setConversationDraft,
      [operationID, data.conversationID, data.draftText]
    );
  };

  getTotalUnreadMsgCount = (operationID = uuidV4()) => {
    return this.invokeCore<number>(
      'getTotalUnreadMsgCount ',
      window.getTotalUnreadMsgCount,
      [operationID]
    );
  };

  searchLocalMessages = (
    data: SearchLocalMessagesParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<SearchMessageResult>(
      'searchLocalMessages ',
      window.searchLocalMessages,
      [operationID, JSON.stringify(data)]
    );
  };
  addFriend = (data: AddFriendParams, operationID = uuidV4()) => {
    return this.invokeCore<void>('addFriend ', window.addFriend, [
      operationID,
      JSON.stringify(data),
    ]);
  };
  searchFriends = (data: SearchFriendsParams, operationID = uuidV4()) => {
    return this.invokeCore<SearchFriendsResultItem[]>(
      'searchFriends ',
      window.searchFriends,
      [operationID, JSON.stringify(data)]
    );
  };
  getSpecifiedFriendsInfo = (
    data: GetSpecifiedFriendsParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<FriendUserItem[]>(
      'getSpecifiedFriendsInfo',
      window.getSpecifiedFriendsInfo,
      [operationID, JSON.stringify(data.friendUserIDList), data.filterBlack]
    );
  };
  getFriendApplicationListAsRecipient = (
    data: GetFriendApplicationListAsRecipientParams = {
      handleResults: [],
      offset: 0,
      count: 0,
    },
    operationID = uuidV4()
  ) => {
    return this.invokeCore<FriendApplicationItem[]>(
      'getFriendApplicationListAsRecipient ',
      window.getFriendApplicationListAsRecipient,
      [operationID, JSON.stringify(data)]
    );
  };
  getFriendApplicationListAsApplicant = (
    data: GetFriendApplicationListAsApplicantParams = {
      offset: 0,
      count: 0,
    },
    operationID = uuidV4()
  ) => {
    return this.invokeCore<FriendApplicationItem[]>(
      'getFriendApplicationListAsApplicant ',
      window.getFriendApplicationListAsApplicant,
      [operationID, JSON.stringify(data)]
    );
  };
  getFriendApplicationUnhandledCount = (
    data: ApplicationUnhandledCountParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<number>(
      'getFriendApplicationUnhandledCount ',
      window.getFriendApplicationUnhandledCount,
      [operationID, JSON.stringify(data)]
    );
  };
  getFriendList = (filterBlack = false, operationID = uuidV4()) => {
    return this.invokeCore<FriendUserItem[]>(
      'getFriendList ',
      window.getFriendList,
      [operationID, filterBlack]
    );
  };
  getFriendListPage = (
    data: PaginationParams & { filterBlack?: boolean },
    operationID = uuidV4()
  ) => {
    return this.invokeCore<FriendUserItem[]>(
      'getFriendListPage ',
      window.getFriendListPage,
      [operationID, data.offset, data.count, data.filterBlack ?? false]
    );
  };
  updateFriends = (data: UpdateFriendsParams, operationID = uuidV4()) => {
    return this.invokeCore<void>('updateFriends ', window.updateFriends, [
      operationID,
      JSON.stringify(data),
    ]);
  };
  checkFriend = (data: string[], operationID = uuidV4()) => {
    return this.invokeCore<CheckFriendResultItem[]>(
      'checkFriend',
      window.checkFriend,
      [operationID, JSON.stringify(data)]
    );
  };
  acceptFriendApplication = (
    data: HandleFriendApplicationParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<void>(
      'acceptFriendApplication',
      window.acceptFriendApplication,
      [operationID, JSON.stringify(data)]
    );
  };
  refuseFriendApplication = (
    data: HandleFriendApplicationParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<void>(
      'refuseFriendApplication ',
      window.refuseFriendApplication,
      [operationID, JSON.stringify(data)]
    );
  };
  deleteFriend = (data: string, operationID = uuidV4()) => {
    return this.invokeCore<void>('deleteFriend ', window.deleteFriend, [
      operationID,
      data,
    ]);
  };
  addBlack = (data: AddBlackParams, operationID = uuidV4()) => {
    return this.invokeCore<void>('addBlack ', window.addBlack, [
      operationID,
      data.toUserID,
      data.ex ?? '',
    ]);
  };
  removeBlack = (data: string, operationID = uuidV4()) => {
    return this.invokeCore<void>('removeBlack ', window.removeBlack, [
      operationID,
      data,
    ]);
  };
  getBlackList = (operationID = uuidV4()) => {
    return this.invokeCore<BlackUserItem[]>(
      'getBlackList ',
      window.getBlackList,
      [operationID]
    );
  };
  inviteUserToGroup = (
    data: GroupMemberOperationParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<void>(
      'inviteUserToGroup ',
      window.inviteUserToGroup,
      [operationID, data.groupID, data.reason, JSON.stringify(data.userIDList)]
    );
  };
  kickGroupMember = (
    data: GroupMemberOperationParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<void>('kickGroupMember ', window.kickGroupMember, [
      operationID,
      data.groupID,
      data.reason,
      JSON.stringify(data.userIDList),
    ]);
  };
  isJoinGroup = (data: string, operationID = uuidV4()) => {
    return this.invokeCore<boolean>('isJoinGroup ', window.isJoinGroup, [
      operationID,
      data,
    ]);
  };

  getSpecifiedGroupMembersInfo = (
    data: GroupMemberUserListParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<GroupMemberItem[]>(
      'getSpecifiedGroupMembersInfo ',
      window.getSpecifiedGroupMembersInfo,
      [operationID, data.groupID, JSON.stringify(data.userIDList)]
    );
  };
  getUsersInGroup = (
    data: GroupMemberUserListParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<string[]>(
      'getUsersInGroup ',
      window.getUsersInGroup,
      [operationID, data.groupID, JSON.stringify(data.userIDList)]
    );
  };
  getGroupMemberListByJoinTimeFilter = (
    data: GetGroupMemberListByJoinTimeFilterParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<GroupMemberItem[]>(
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
    data: SearchGroupMembersParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<GroupMemberItem[]>(
      'searchGroupMembers ',
      window.searchGroupMembers,
      [operationID, JSON.stringify(data)]
    );
  };
  getJoinedGroupList = (operationID = uuidV4()) => {
    return this.invokeCore<GroupItem[]>(
      'getJoinedGroupList ',
      window.getJoinedGroupList,
      [operationID]
    );
  };
  getJoinedGroupListPage = (data: PaginationParams, operationID = uuidV4()) => {
    return this.invokeCore<GroupItem[]>(
      'getJoinedGroupListPage ',
      window.getJoinedGroupListPage,
      [operationID, data.offset, data.count]
    );
  };
  createGroup = (data: CreateGroupParams, operationID = uuidV4()) => {
    return this.invokeCore<GroupItem>('createGroup ', window.createGroup, [
      operationID,
      JSON.stringify(data),
    ]);
  };
  setGroupInfo = (
    data: Partial<GroupItem> & { groupID: string },
    operationID = uuidV4()
  ) => {
    return this.invokeCore<void>('setGroupInfo ', window.setGroupInfo, [
      operationID,
      JSON.stringify(data),
    ]);
  };
  setGroupMemberInfo = (
    data: SetGroupMemberInfoParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<void>(
      'setGroupMemberInfo ',
      window.setGroupMemberInfo,
      [operationID, JSON.stringify(data)]
    );
  };
  joinGroup = (data: JoinGroupParams, operationID = uuidV4()) => {
    return this.invokeCore<void>('joinGroup ', window.joinGroup, [
      operationID,
      data.groupID,
      data.reqMsg,
      data.joinSource,
      data.ex ?? '',
    ]);
  };
  searchGroups = (data: SearchGroupsParams, operationID = uuidV4()) => {
    return this.invokeCore<GroupItem[]>('searchGroups ', window.searchGroups, [
      operationID,
      JSON.stringify(data),
    ]);
  };
  quitGroup = (data: string, operationID = uuidV4()) => {
    return this.invokeCore<void>('quitGroup ', window.quitGroup, [
      operationID,
      data,
    ]);
  };
  dismissGroup = (data: string, operationID = uuidV4()) => {
    return this.invokeCore<void>('dismissGroup ', window.dismissGroup, [
      operationID,
      data,
    ]);
  };
  changeGroupMute = (data: ChangeGroupMuteParams, operationID = uuidV4()) => {
    return this.invokeCore<void>('changeGroupMute ', window.changeGroupMute, [
      operationID,
      data.groupID,
      data.isMute,
    ]);
  };
  changeGroupMemberMute = (
    data: ChangeGroupMemberMuteParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<void>(
      'changeGroupMemberMute ',
      window.changeGroupMemberMute,
      [operationID, data.groupID, data.userID, data.mutedSeconds]
    );
  };
  transferGroupOwner = (
    data: TransferGroupOwnerParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<void>(
      'transferGroupOwner ',
      window.transferGroupOwner,
      [operationID, data.groupID, data.newOwnerUserID]
    );
  };
  getGroupApplicationListAsApplicant = (
    data: GroupApplicationListParams = {
      groupIDs: [],
      handleResults: [],
      offset: 0,
      count: 0,
    },
    operationID = uuidV4()
  ) => {
    return this.invokeCore<GroupApplicationItem[]>(
      'getGroupApplicationListAsApplicant ',
      window.getGroupApplicationListAsApplicant,
      [operationID, JSON.stringify(data)]
    );
  };
  getGroupApplicationListAsRecipient = (
    data: GroupApplicationListParams = {
      groupIDs: [],
      handleResults: [],
      offset: 0,
      count: 0,
    },
    operationID = uuidV4()
  ) => {
    return this.invokeCore<GroupApplicationItem[]>(
      'getGroupApplicationListAsRecipient ',
      window.getGroupApplicationListAsRecipient,
      [operationID, JSON.stringify(data)]
    );
  };
  getGroupApplicationUnhandledCount = (
    data: ApplicationUnhandledCountParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<number>(
      'getGroupApplicationUnhandledCount ',
      window.getGroupApplicationUnhandledCount,
      [operationID, JSON.stringify(data)]
    );
  };
  acceptGroupApplication = (
    data: HandleGroupApplicationParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<void>(
      'acceptGroupApplication ',
      window.acceptGroupApplication,
      [operationID, data.groupID, data.fromUserID, data.handleMsg]
    );
  };
  refuseGroupApplication = (
    data: HandleGroupApplicationParams,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<void>(
      'refuseGroupApplication ',
      window.refuseGroupApplication,
      [operationID, data.groupID, data.fromUserID, data.handleMsg]
    );
  };
  getGroupMemberOwnerAndAdmin = (data: string, operationID = uuidV4()) => {
    return this.invokeCore<GroupMemberItem[]>(
      'getGroupMemberOwnerAndAdmin ',
      window.getGroupMemberOwnerAndAdmin,
      [operationID, data]
    );
  };
  getAtAllTag = (operationID = uuidV4()) => {
    return this.invokeCore<string>('getAtAllTag', window.getAtAllTag, [
      operationID,
    ]);
  };
  findMessageList = (data: FindMessageQuery[], operationID = uuidV4()) => {
    return this.invokeCore<SearchMessageResult>(
      'findMessageList ',
      window.findMessageList,
      [operationID, JSON.stringify(data)]
    );
  };
  uploadFile = (data: UploadFileParams, operationID = uuidV4()) => {
    data.uuid = `${data.uuid}/${data.file?.name}`;
    window.fileMapSet(data.uuid, data.file);
    return this.invokeCore<{ url: string }>('uploadFile ', window.uploadFile, [
      operationID,
      JSON.stringify({
        ...data,
        filepath: '',
        cause: '',
      }),
    ]);
  };
  updateFcmToken = (
    fcmToken: string,
    expireTime: number,
    operationID = uuidV4()
  ) => {
    return this.invokeCore<void>('updateFcmToken', window.updateFcmToken, [
      operationID,
      fcmToken,
      expireTime,
    ]);
  };
  subscribeUsersStatus = (data: string[], operationID = uuidV4()) => {
    return this.invokeCore<UserOnlineState[]>(
      'subscribeUsersStatus ',
      window.subscribeUsersStatus,
      [operationID, JSON.stringify(data)]
    );
  };
  unsubscribeUsersStatus = (data: string[], operationID = uuidV4()) => {
    return this.invokeCore<UserOnlineState[]>(
      'unsubscribeUsersStatus ',
      window.unsubscribeUsersStatus,
      [operationID, JSON.stringify(data)]
    );
  };
  getUserStatus = (data: string[], operationID = uuidV4()) => {
    return this.invokeCore<UserOnlineState[]>(
      'getUserStatus ',
      window.getUserStatus,
      [operationID, JSON.stringify(data)]
    );
  };
  getSubscribeUsersStatus = (operationID = uuidV4()) => {
    return this.invokeCore<UserOnlineState[]>(
      'getSubscribeUsersStatus ',
      window.getSubscribeUsersStatus,
      [operationID]
    );
  };
  fileMapSet = (uuid: string, file: File): Promise<WorkerResponse<string>> =>
    window.fileMapSet(uuid, file);
}

let instance: WasmSdk;

export function getSDK(config?: WasmPathConfig): WasmSdk {
  const {
    sqlWasmPath,
    coreWasmPath = '/openIM.wasm',
    debug = true,
  } = config || {};
  if (typeof window === 'undefined') {
    return {} as WasmSdk;
  }

  if (instance) {
    return instance;
  }

  instance = new WasmSdk(coreWasmPath, debug);

  if (sqlWasmPath) {
    window.setSqlWasmPath(sqlWasmPath);
  }

  return instance;
}
