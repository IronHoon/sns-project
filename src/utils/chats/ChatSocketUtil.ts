import axios from 'axios';
import { HangupCallback, UserWithAttendeeId } from 'components/molecules/CallView';
import { t } from 'i18next';
import MySetting from 'MySetting';
import { RootNatigation } from 'navigations/RootNavigation';
import { DispatchWithoutAction } from 'react';
import Toast from 'react-native-toast-message';
import { connect, io, Socket } from 'socket.io-client';
import { ChatStatus } from 'stores/chatStatusAtom';
import Message, { KokKokIMessageDocs, MessageDocs } from 'types/chats/rooms/messages/Message';
import Room, { CallType, OnRoomsType } from 'types/chats/rooms/Room';
import { OnResponse } from 'types/_common/OnReponse';
import PromiseUtil from 'utils/PromiseUtil';
import AuthUtil from '../AuthUtil';
import LogUtil from '../LogUtil';
import CallManagerForIos from '../calls/CallManagerForIos';
import CallManagerForAos from 'utils/calls/CallManagerForAos';
import AmazonChimeUtil from 'utils/calls/AmazonChimeUtil';

export type JoinCallAction = 'create' | 'join';
class ChatSocketUtil {
  static readonly instance: ChatSocketUtil = new ChatSocketUtil();

  //@ts-ignore
  chatStatus: ChatStatus;
  //@ts-ignore
  forceUpdateForChatStatus: DispatchWithoutAction;
  amazonChimeUtil: AmazonChimeUtil = AmazonChimeUtil.instance;

  socket?: Socket;
  connecting: boolean = false;
  private readonly connectTimeoutMilliseconds: number = 20 * 1000;

  util = {
    showListenerOfSocket(prefix: string, socket: Socket) {
      const chatRoomList = socket.hasListeners('chat-room-list');
      const chatRoom = socket.hasListeners('chat-room');
      const receiveCall = socket.hasListeners('receive-call');
      LogUtil.info(`${prefix} [socketId:${socket?.id}] response socket listener`, {
        chatRoomList,
        chatRoom,
        receiveCall,
      });
    },
    connect(prefix: string): Promise<Socket> {
      return new Promise(async (resolve) => {
        const instance = ChatSocketUtil.instance;
        const oldSocket = instance.socket;
        instance.connecting = true;

        if (oldSocket) {
          if (oldSocket.connected) {
            LogUtil.info(`${prefix} [socketId:${oldSocket?.id}] 이전 소켓에 연결되어 있어 반환합니다.`);
            instance.util.showListenerOfSocket(prefix, oldSocket);
            resolve(oldSocket);
            instance.connecting = false;
            return;
          } else {
            let count: number = 0;
            while (count >= 200 || !instance.socket?.connected) {
              // LogUtil.info(`${prefix} [socketId:${instance.socket?.id}] 다른 소켓이 연결중이라 기다립니다.`);
              await new PromiseUtil().sleep(300);
              count++;
            }
            LogUtil.info(`${prefix} [socketId:${instance.socket?.id}] 다른 소켓 연결이 끝나서 해당 소켓을 반환합니다.`);
            resolve(instance.socket);
            instance.connecting = false;
            return;
          }
        }

        LogUtil.info(`${prefix} [socketId:${instance.socket?.id}] 소켓 연결을 시도합니다.: ${MySetting.socketUrl}`);
        const Authorization = axios?.defaults?.headers?.common?.Authorization?.toString();
        LogUtil.info('ChatSocketUtil connect Authorization', [Authorization]);
        const newSocket = connect(MySetting.socketUrl, {
          //기본값으로 reconnect가 설정되어 있음.
          secure: true,
          rejectUnauthorized: false,
          transports: ['websocket'],
          extraHeaders: {
            Authorization,
          },
        });
        instance.socket = newSocket;

        const connectionTimeoutId = setTimeout(async () => {
          LogUtil.error(`${prefix} [socketId:${newSocket?.id}] connect time out error`);
          await this.connect(prefix);
          resolve(instance.socket!);
          instance.connecting = false;
        }, instance.connectTimeoutMilliseconds);

        newSocket.once('connect_error', async (error) => {
          LogUtil.error(`${prefix} [socketId:${newSocket?.id}] connect_error`, error);
          clearTimeout(connectionTimeoutId);
          await this.connect(prefix);
          resolve(instance.socket!);
          instance.connecting = false;
        });
        newSocket.once('disconnect', async (reason) => {
          LogUtil.error(`${prefix} [socketId:${newSocket?.id}] disconnect reason: ${reason}`);
          clearTimeout(connectionTimeoutId);
          await this.connect(prefix);
          resolve(instance.socket!);
          instance.connecting = false;
        });
        newSocket.once('connect', async () => {
          while (!newSocket.connected) {
            await new PromiseUtil().sleep(100);
          }
          LogUtil.info(`${prefix} [socketId:${newSocket?.id}] response newSocket`);
          clearTimeout(connectionTimeoutId);
          resolve(newSocket);
          instance.connecting = false;
        });
      });
    },
    close(prefix: string): Promise<void> {
      return new Promise(async (resolve, reject) => {
        const instance = ChatSocketUtil.instance;
        const socket = instance.socket;
        instance.socket = undefined;
        try {
          if (socket) {
            instance.util.showListenerOfSocket(prefix, socket);
            LogUtil.info(`${prefix} [socketId:${socket?.id}] request close`);
            socket.removeAllListeners();
            socket.disconnect();
          }

          resolve();
        } catch (error) {
          LogUtil.error(`${prefix} [socketId:${socket?.id}] close error`, error);
          reject(error);
        }
      });
    },
    pushMessage(room_id, newMessage: Message) {
      const that = ChatSocketUtil.instance;
      LogUtil.info('pushMessage room_id, messageDocsByRoomId.length', [
        room_id,
        that.chatStatus.messageDocsByRoomId.size,
      ]);

      let iMessageDocs = that.chatStatus.messageDocsByRoomId?.[room_id];
      if (!iMessageDocs?.messageDocs?.docs) {
        iMessageDocs = {
          ...iMessageDocs,
          //@ts-ignore
          messageDocs: {
            docs: [],
          },
        };
      }
      LogUtil.info('이 메시지 있을까?', [newMessage?.local_message_id]);
      const foundList = newMessage?.local_message_id
        ? iMessageDocs.messageDocs.docs.filter(
            (oldMessage) => oldMessage?.local_message_id === newMessage.local_message_id,
          )
        : [];
      const existMessage = (foundList.length ?? 0) > 0;
      if (existMessage) {
        LogUtil.info('있어서 서버 id를 넣어줍니다.', newMessage);

        let message: Message = foundList[0];
        LogUtil.info('OldJeans Message', message);
        message._id = newMessage._id;
        // iMessageDocs.messageDocs.docs = iMessageDocs.messageDocs.docs.map((oldMessage)=>{
        //   if(oldMessage.local_message_id === newMessage.local_message_id){
        //     console.log('NewJeans Message',newMessage)
        //     return newMessage
        //   }else{
        //     return oldMessage
        //   }
        // })

        const getData = (room_id, messageDocsByRoomId, newMessage) => {
          const iMessageDocs = messageDocsByRoomId[room_id];
          if (iMessageDocs) {
            if (iMessageDocs?.messageDocs?.docs) {
              iMessageDocs.messageDocs.docs = iMessageDocs.messageDocs.docs.map((oldMessage) => {
                if (oldMessage.local_message_id === newMessage.local_message_id) {
                  console.log('NewJeans Message', newMessage);
                  return newMessage;
                } else {
                  return oldMessage;
                }
              });
            }
            return {
              ...messageDocsByRoomId,
              [room_id]: {
                messageDocs: iMessageDocs.messageDocs,
              },
            };
          }

          return messageDocsByRoomId;
        };

        const instance = ChatSocketUtil.instance;
        instance.chatStatus.messageDocsByRoomId = getData(
          instance.chatStatus.currentRoomForChat?._id,
          instance.chatStatus.messageDocsByRoomId,
          newMessage,
        );
        instance.forceUpdateForChatStatus();
        LogUtil.info('end pushMessage');
      } else {
        LogUtil.info('없어서 메시지 넣습니다.', newMessage);
        iMessageDocs.messageDocs.docs.push(newMessage);
        const newMap = {
          ...that.chatStatus.messageDocsByRoomId,
          [room_id]: {
            messageDocs: iMessageDocs.messageDocs,
          },
        };

        const chatSocketUtil = ChatSocketUtil.instance;
        chatSocketUtil.chatStatus.messageDocsByRoomId = newMap;
        chatSocketUtil.forceUpdateForChatStatus();
      }
    },
    removeAllMessages() {
      const chatSocketUtil = ChatSocketUtil.instance;
      chatSocketUtil.chatStatus.messageDocsByRoomId = {};
      chatSocketUtil.forceUpdateForChatStatus();
    },
  };

  easy = {
    async join(prefix: string): Promise<void> {
      const instance = ChatSocketUtil.instance;
      await instance.util.connect(prefix);

      instance.onEndCall(prefix);

      await instance.onReceiveCall(prefix);

      const roomId = instance.chatStatus?.currentRoomForChat?._id;
      if (roomId) {
        await instance.easy.joinRoomForChat(prefix, roomId);
      }

      await instance.easy.joinRoomList(prefix);
    },
    async leave(prefix: string): Promise<void> {
      const instance = ChatSocketUtil.instance;
      await instance.easy.leaveRoomList(prefix);
      await instance.util.close(prefix);
    },
    async joinRoomList(prefix: string) {
      const instance = ChatSocketUtil.instance;
      const socket = await instance.util.connect(prefix);

      try {
        if (socket && !socket.hasListeners('join-room-list')) {
          socket.once('join-room-list', (res) => {
            LogUtil.info(`${prefix} [socketId:${socket?.id}] 서버는 방목록 요청을 받을 준비가 되었습니다.`);
            instance.easy.getRooms(prefix);
          });
        }

        if (socket && !socket.hasListeners('chat-room-list')) {
          socket.on('chat-room-list', (res) => {
            LogUtil.info(`${prefix} [socketId:${socket?.id}] 방 목록이 변화하여 서버에서 받았습니다.`, res);
            instance.easy.getRooms(prefix);
          });
        }

        const userId = AuthUtil.getUserId();
        if (userId && socket?.connected) {
          LogUtil.info(`${prefix} [socketId:${socket?.id}] 서버에 방목록 요청합니다.`);
          socket.emit('join-room-list', {
            user_id: userId,
          });
        }
      } catch (error) {
        LogUtil.info('joinRoomList error', error);
      }
    },
    leaveRoomList(prefix: string): Promise<void> {
      return new Promise(async (resolve, reject) => {
        try {
          const instance = ChatSocketUtil.instance;
          const socket = instance.socket;

          if (socket && !socket.hasListeners('exit-room-list')) {
            socket.once('exit-room-list', (res) => {
              LogUtil.info(`${prefix} [socketId:${socket?.id}] 서버는 앞으로 방 목록을 주지 않겠습니다.`);
            });
          }

          const userId = AuthUtil.getUserId();
          if (userId && socket?.connected) {
            LogUtil.info(`${prefix} [socketId:${socket?.id}] 앞으로, 방 목록을 받지 않겠습니다.`);
            socket.emit('exit-room-list', {
              user_id: userId,
            });
          }

          resolve();
        } catch (error) {
          LogUtil.info('leaveCall error', error);
          reject(error);
        }
      });
    },
    joinRoomForChat(prefix: string, room_id: string): Promise<void> {
      return new Promise(async (resolve, reject) => {
        const instance = ChatSocketUtil.instance;
        await instance.util.connect(prefix);

        try {
          instance.onPin(prefix);
          instance.onChatRoom(prefix);
          instance.onDeleteMessage(prefix);
          instance.onDeleteMedia(prefix);
          await instance.easy.getMessagesOfRoom(prefix, room_id, { resetPage: true });
          resolve();
        } catch (error) {
          LogUtil.info('joinRoom error', error);
          reject(error);
        }
      });
    },
    leaveRoomForChat(prefix: string, roomId): Promise<void> {
      return new Promise(async (resolve, reject) => {
        const instance = ChatSocketUtil.instance;
        const socket = instance.socket;
        try {
          instance.chatStatus.currentRoomForChat = null;
          instance.forceUpdateForChatStatus();

          if (socket && !socket.hasListeners('exit-room')) {
            socket.once('exit-room', (res) => {
              LogUtil.info(`${prefix} [socketId:${socket?.id}] onExitRoom`);
            });
          }

          if (socket?.connected) {
            LogUtil.info(`${prefix} [socketId:${socket?.id}] emitExitRoom`);
            socket.emit('exit-room', {
              room_id: roomId,
            });
          }
          resolve();
        } catch (error) {
          LogUtil.info('leaveRoom error', error);
          reject(error);
        }
      });
    },
    joinCall(
      prefix: string,
      room_id: string,
      callType: CallType,
      action: JoinCallAction = 'create',
      onEnterCallCallback: OnResponse,
    ): Promise<{ meeting; attendee }> {
      return new Promise(async (resolve, reject) => {
        const instance = ChatSocketUtil.instance;
        const socket = await instance.util.connect(prefix);
        try {
          LogUtil.info(`${prefix} [socketId:${socket?.id}] joinCall end-call 등록 시작전`);
          const { meeting, attendee, callRoomType, room } = await instance.emitJoinCall(
            prefix,
            room_id,
            callType,
            action,
          );
          if (meeting.ExternalMeetingId == null) {
            meeting.ExternalMeetingId = '';
          }

          LogUtil.info(`${prefix} [socketId:${socket?.id}] joinCall enter-call 등록 시작전`);
          if (socket) {
            socket.removeListener('enter-call');
            socket.on('enter-call', (res) => {
              onEnterCallCallback({ user: res.user, meeting, attendee });
            });
          }

          instance.chatStatus.currentRoomForCall = room;
          instance.forceUpdateForChatStatus();

          resolve({ meeting, attendee });
        } catch (e) {
          reject(e);
        }
      });
    },
    leaveCall(prefix: string): Promise<void> {
      return new Promise(async (resolve, reject) => {
        const instance = ChatSocketUtil.instance;
        const socket = await instance.util.connect(prefix);
        try {
          const roomIdForCall = instance.chatStatus.currentRoomForCall?._id;
          if (!roomIdForCall) {
            LogUtil.info('ChatSocketUtilContent leaveCall !roomIdForCall');
            return;
          }

          instance.chatStatus.currentRoomForCall = null;
          instance.forceUpdateForChatStatus();

          await instance.emitExitCall(prefix, roomIdForCall);
          resolve();
        } catch (error) {
          LogUtil.info('leaveCall error', error);
          resolve();
        }
      });
    },
    getRooms(prefix: string): Promise<OnRoomsType> {
      return new Promise(async (resolve, reject) => {
        const userId = AuthUtil.getUserId();
        const instance = ChatSocketUtil.instance;
        const socket = instance.socket;
        if (!(userId && socket?.connected)) {
          reject('[emitRooms] not valid');
          return;
        }

        if (!socket.hasListeners('rooms')) {
          socket.on('rooms', (rooms) => {
            LogUtil.info(`${prefix} [socketId:${socket?.id}] 방 목록을 서버에서 받았습니다.`);

            instance.chatStatus.rooms = rooms;

            const unArchivedRoomList: Room[] = rooms?.unArchivedRooms ?? [];
            instance.chatStatus.myUnreadCount = unArchivedRoomList
              .map((room) => room.unread_count)
              .reduce((partialSum, a) => partialSum + a, 0);
            instance.chatStatus.isChatRoomReady = true;

            instance.forceUpdateForChatStatus();
            resolve(rooms);
          });
        }
        const param = { user_id: userId };
        LogUtil.info(`${prefix} [socketId:${socket?.id}] 방 목록을 서버에 요청하였습니다.`, param);
        socket.emit('rooms', param);
      });
    },
    getMessagesOfRoom(prefix: string, roomId: string, options: { resetPage: boolean }): Promise<Room> {
      return new Promise(async (resolve, reject) => {
        const instance = ChatSocketUtil.instance;
        const socket = instance.socket;
        try {
          if (socket?.connected) {
            LogUtil.info(`${prefix} [socketId:${socket?.id}] join-room request`);
            instance.onChangeReadRange(prefix, (res) => {
              instance.chatStatus.unreadCountInfoByRoomId = {
                ...instance.chatStatus.unreadCountInfoByRoomId,
                [roomId]: res.readRange,
              };
              instance.forceUpdateForChatStatus();
            });

            if (!socket.hasListeners('join-room')) {
              socket.once('join-room', async (res) => {
                LogUtil.info(`${prefix} [socketId:${socket?.id}] join-room response`);
                instance.chatStatus.currentRoomForChat = res.room;
                instance.chatStatus.unreadCountInfoByRoomId = {
                  ...instance.chatStatus.unreadCountInfoByRoomId,
                  [roomId]: res.readRange,
                };
                instance.forceUpdateForChatStatus();

                await instance.emitMessages(prefix, res.room._id, options);
                resolve(res.room);
              });
            }

            socket.emit('join-room', {
              room_id: roomId,
              user_id: AuthUtil.getUserId(),
            });
          }
        } catch (error) {
          LogUtil.error(`${prefix} [socketId:${socket?.id}] emitJoinRoom error`, error);
          reject(error);
        }
      });
    },
    inviteUserInCall(prefix: string, user_ids: string[]): Promise<any> {
      return new Promise(async (resolve, reject) => {
        const instance = ChatSocketUtil.instance;
        const socket = instance.socket;
        const room_id = instance.chatStatus.currentRoomForCall?._id;
        if (!(socket?.connected && room_id)) {
          reject('[emitInviteCall] not valid');
          return;
        }

        if (!socket.hasListeners('invite-call-error')) {
          socket.once('invite-call-error', (res) => {
            LogUtil.info(`${prefix} [socketId:${socket?.id}] 전화 초대 에러`, res);
            reject(res);
          });
        }

        if (!socket.hasListeners('invite-call')) {
          socket.once('invite-call', (res) => {
            LogUtil.info(`${prefix} [socketId:${socket?.id}] 전화 초대 응답`, res);
            resolve(res);
          });
        }

        const param = { room_id: room_id, user_ids: user_ids };
        LogUtil.info(`${prefix} [socketId:${socket?.id}] 전화 초대 요청`, param);
        socket.emit('invite-call', param);
      });
    },
  };

  onEndCall(prefix: string) {
    if (this.socket) {
      this.socket.removeListener('end-call');
      this.socket.on('end-call', (res) => {
        LogUtil.info(`${prefix} [socketId:${this.socket?.id}] onEndCall`);

        try {
          Toast.show({
            type: 'success',
            text1: t('chats-main.The call has ended'),
          });
        } catch (e) {
          LogUtil.error('joinCall Toast.show error', e);
        }

        //시스템 전화 끊기
        if (MySetting.isIos) {
          CallManagerForIos.me.util.hangupAll();
        } else {
          CallManagerForAos.deleteCallOnAndroid();
        }
        try {
          AmazonChimeUtil.instance.stopMeeting();
        } catch (e) {
          LogUtil.error('joinCall stopMeeting error', e);
        }
        HangupCallback.emit();

        ChatSocketUtil.instance.chatStatus.currentRoomForCall = null;
        ChatSocketUtil.instance.forceUpdateForChatStatus();
      });
    }
  }

  async onReceiveCall(prefix: string) {
    const instance = ChatSocketUtil.instance;
    const socket = await instance.util.connect(prefix);

    LogUtil.info(`${prefix} [socketId:${this.socket?.id}] registering receive-call `);
    socket.removeListener('receive-call-error');
    socket.on('receive-call-error', async (res) => {
      LogUtil.error(`${prefix} [socketId:${socket?.id}] receive-call-error`, res);
    });

    socket.removeListener('receive-call');
    socket.on('receive-call', async ({ room, callType }) => {
      const isOnAlreadyCalling = ChatSocketUtil.instance.isOnAlreadyCalling(false);
      const isBackground = MySetting.isBackground;
      LogUtil.info(`${prefix} [socketId:${socket?.id}] receive-call broadcast`, {
        room,
        callType,
        isBackground,
        isOnAlreadyCalling,
      });

      if (isBackground || isOnAlreadyCalling) {
        return;
      }

      RootNatigation.navigate('/chats/receive-call', { room, callType });
    });
    LogUtil.info(`${prefix} [socketId:${this.socket?.id}] finish registering receive-call`);
  }

  onChatRoom(prefix: string) {
    if (this.socket) {
      this.socket.removeListener('chat-room-error');
      this.socket.on('chat-room-error', (res) => {
        LogUtil.error(
          `${prefix} [socketId:${this.socket?.id}] 채팅방에 메시지가 추가,변화,삭제 중 서버에서 에러가 났습니다.`,
          res,
        );
      });

      this.socket.removeListener('chat-room');
      this.socket.on('chat-room', (message: Message) => {
        LogUtil.info(`${prefix} [socketId:${this.socket?.id}] 채팅방에 메시지가 추가,변화,삭제하였습니다.`, message);
        LogUtil.info('start pushMessage');
        this.util.pushMessage(message.room_id, message);
      });
    }
  }

  onChangeReadRange(prefix: string, onChangeReadCountCallback?: OnResponse) {
    if (this.socket) {
      this.socket.removeListener('change-read-range-error');
      this.socket.on('change-read-range-error', (res) => {
        LogUtil.error(
          `${prefix} [socketId:${this.socket?.id}] 메시지 숫자들을 서버에서 만들던 중 에러가 났습니다.`,
          res,
        );
      });

      this.socket.removeListener('change-read-range');
      this.socket.on('change-read-range', (res) => {
        LogUtil.info(`${prefix} [socketId:${this.socket?.id}] 메시지 숫자들이 변화하였습니다.`, res);

        if (onChangeReadCountCallback) {
          onChangeReadCountCallback(res);
        }
      });
    }
  }

  onPin(prefix: string, onPinCallback?: OnResponse) {
    if (this.socket) {
      this.socket.removeListener('pin');
      this.socket.on('pin', (message: MessageDocs) => {
        LogUtil.info(`${prefix} [socketId:${this.socket?.id}] onPin`, message);

        const getData = (room_id, messageDocsByRoomId: Record<string, KokKokIMessageDocs>, message: MessageDocs) => {
          const iMessageDocs: KokKokIMessageDocs = messageDocsByRoomId[room_id];
          if (iMessageDocs) {
            iMessageDocs.messageDocs.room.fixed_msg = message.room.fixed_msg;
            return {
              ...messageDocsByRoomId,
              [room_id]: {
                messageDocs: iMessageDocs.messageDocs,
              },
            };
          }

          return messageDocsByRoomId;
        };

        const tempCurrentRoom = this.chatStatus.currentRoomForChat;
        if (tempCurrentRoom) {
          const instance = ChatSocketUtil.instance;
          instance.chatStatus.messageDocsByRoomId = getData(
            this.chatStatus.currentRoomForChat!._id,
            this.chatStatus.messageDocsByRoomId,
            message,
          );
          tempCurrentRoom.fixed_msg = message.room.fixed_msg;
          tempCurrentRoom.user_settings.map((item) => (item.is_fixmsg_read = false));
          instance.chatStatus.currentRoomForChat = tempCurrentRoom;
          instance.forceUpdateForChatStatus();
        }

        if (onPinCallback) {
          onPinCallback(message);
        }
      });
    }
  }

  onDeleteMessage(prefix: string, onDeleteMessageCallback?: OnResponse) {
    if (this.socket) {
      this.socket.removeListener('delete-message-error');
      this.socket.on('delete-message-error', (res) => {
        LogUtil.error(`${prefix} [socketId:${this.socket?.id}] onDeleteMessage error`, res);
      });

      this.socket.removeListener('delete-message');
      this.socket.on('delete-message', (message: Message) => {
        LogUtil.info(`${prefix} [socketId:${this.socket?.id}] onDeleteMessage`, message);
        const getData = (room_id, messageDocsByRoomId, message) => {
          const iMessageDocs = messageDocsByRoomId[room_id];
          if (iMessageDocs) {
            iMessageDocs.messageDocs.docs = iMessageDocs.messageDocs.docs.filter(
              (eachMessage) => eachMessage._id !== message._id,
            );

            return {
              ...messageDocsByRoomId,
              [room_id]: {
                messageDocs: iMessageDocs.messageDocs,
              },
            };
          }

          return messageDocsByRoomId;
        };

        const instance = ChatSocketUtil.instance;
        instance.chatStatus.messageDocsByRoomId = getData(
          this.chatStatus.currentRoomForChat?._id,
          this.chatStatus.messageDocsByRoomId,
          message,
        );
        instance.forceUpdateForChatStatus();

        if (onDeleteMessageCallback) {
          onDeleteMessageCallback(message);
        }
      });
    }
  }

  onDeleteMedia(prefix: string, onDeleteMessageCallback?: OnResponse) {
    if (this.socket) {
      this.socket.removeListener('delete-media-error');
      this.socket.on('delete-media-error', (res) => {
        LogUtil.error(`${prefix} [socketId:${this.socket?.id}] onDeleteMedia error`, res);
      });

      this.socket.removeListener('delete-media');
      this.socket.on('delete-media', (message: Message) => {
        LogUtil.info(`${prefix} [socketId:${this.socket?.id}] onDeleteMedia`, message);
        const getData = (room_id, messageDocsByRoomId, message) => {
          const iMessageDocs = messageDocsByRoomId[room_id];
          if (iMessageDocs) {
            if (iMessageDocs?.messageDocs?.docs) {
              iMessageDocs.messageDocs.docs = iMessageDocs.messageDocs.docs.map((eachMessage) => {
                if (eachMessage._id !== message.message._id) {
                  return eachMessage;
                } else {
                  const me = AuthUtil.getUserId();
                  const deleteUrl = message.message.url_deleted_from_user.map((item) => {
                    if (item.user_id === me) {
                      return item.url;
                    }
                  });
                  return {
                    ...eachMessage,
                    ['url']: message.message.url.filter((item) => {
                      if (!deleteUrl.includes(item)) {
                        return item;
                      }
                    }),
                  };
                }
              });
            }

            return {
              ...messageDocsByRoomId,
              [room_id]: {
                messageDocs: iMessageDocs.messageDocs,
              },
            };
          }

          return messageDocsByRoomId;
        };

        const instance = ChatSocketUtil.instance;
        instance.chatStatus.messageDocsByRoomId = getData(
          this.chatStatus.currentRoomForChat?._id,
          this.chatStatus.messageDocsByRoomId,
          message,
        );
        instance.forceUpdateForChatStatus();

        if (onDeleteMessageCallback) {
          onDeleteMessageCallback(message);
        }
      });
    }
  }

  emitJoinCall(
    prefix: string,
    roomId: string,
    type: CallType,
    action: JoinCallAction = 'create',
  ): Promise<{ meeting; attendee; callRoomType; room }> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        const param = {
          room_id: roomId,
          type: type,
          action: action,
        };

        this.socket.removeListener('join-call-error');
        this.socket.on('join-call-error', (res) => {
          // clearTimeout(requestTimeoutId);
          LogUtil.error(
            `${prefix} [socketId:${this.socket?.id}] 전화방을 만들거나, 참여하던 중 서버에 에러가 있습니다.`,
            res,
          );
          reject(res);
        });
        this.socket.removeListener('join-call');
        this.socket.on('join-call', (res) => {
          // clearTimeout(requestTimeoutId);
          if (action === 'create') {
            LogUtil.info(`${prefix} [socketId:${this.socket?.id}] 전화방을 만듭니다.`);
          } else {
            LogUtil.info(`${prefix} [socketId:${this.socket?.id}] 전화방에 참여합니다.`);
          }
          resolve(res);
        });
        LogUtil.info(`${prefix} [socketId:${this.socket?.id}] join-call request`, param);
        this.socket.emit('join-call', param);
      }
    });
  }

  emitExitCall(prefix: string, roomId: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        if (this.socket?.connected) {
          this.socket.removeListener('exit-call-error');
          this.socket.on('exit-call-error', (errorRes) => {
            const code = errorRes?.error?.code;
            if (code === 'NotFound' || code === 'api.not found voice/video chat') {
              //정상
              resolve();
            } else {
              LogUtil.error(`${prefix} [socketId:${this.socket?.id}] exit-call response error`, errorRes);
              reject(errorRes);
            }
          });

          this.socket.removeListener('exit-call');
          this.socket.on('exit-call', () => {
            LogUtil.info(`${prefix} [socketId:${this.socket?.id}] exit-call response`);
            resolve();
          });
          const param = {
            room_id: roomId,
          };
          LogUtil.info(`${prefix} [socketId:${this.socket?.id}] exit-call request`, param);
          this.socket.emit('exit-call', param);
        }
      } catch (error) {
        LogUtil.error(`${prefix} [socketId:${this.socket?.id}] emitExitCall error`, error);
        reject(error);
      }
    });
  }

  private readonly messageCount = 50;
  emitMessages(prefix: string, room_id: string, options: { resetPage: boolean }): Promise<void> {
    //resetPage가 true이면, 초기화하는 것을 의미
    //resetPage가 false, 다음 페이지를 불러오는 것을 의미

    return new Promise(async (resolve, reject) => {
      if (!this.socket?.connected) {
        reject('[emitMessages] !this.socket?.connected');
        return;
      }

      // const requestTimeoutId = setTimeout(() => {
      //   LogUtil.info(`${prefix} [socketId:${this.socket?.id}] messages response timeout`);
      // }, this.requestTimeoutMilliseconds);

      this.socket.removeListener('messages-error');
      this.socket.once('messages-error', (error) => {
        LogUtil.error(`${prefix} [socketId:${this.socket?.id}] messages error`, error);
        // clearTimeout(requestTimeoutId);
        reject(error);
      });

      this.socket.removeListener('messages');
      this.socket.once('messages', (newMessageDocs: MessageDocs) => {
        LogUtil.info(`${prefix} [socketId:${this.socket?.id}] messages response length ${newMessageDocs.docs.length}`);
        if (newMessageDocs.docs.length === 0) {
          resolve();
          return;
        }

        const instance = ChatSocketUtil.instance;
        instance.chatStatus.currentRoomForChat = newMessageDocs.room;
        instance.forceUpdateForChatStatus();

        // if (!this.myStatus.messageDocsByRoomId[room_id]) {
        //   //@ts-ignore
        //   this.myStatus.messageDocsByRoomId = {
        //     ...this.myStatus.messageDocsByRoomId,
        //     [room_id]: {},
        //   };
        // }
        // const messageDocs = this.myStatus.messageDocsByRoomId[room_id];
        // messageDocs.pageNum = !messageDocs.pageNum || !fetchNextPage ? 1 : messageDocs.pageNum + 1;

        const messageDocs: KokKokIMessageDocs = (() => {
          const kokKokIMessageDocs = this.chatStatus.messageDocsByRoomId[room_id];
          const oldDocs = kokKokIMessageDocs?.messageDocs?.docs ?? [];
          let messageById = oldDocs.reduce((newObj, obj) => {
            newObj[obj._id] = obj;
            return newObj;
          }, {});

          const newDocs = newMessageDocs?.docs ?? [];
          messageById = newDocs.reduce((newObj, obj) => {
            newObj[obj._id] = obj;
            return newObj;
          }, messageById);

          return {
            ...kokKokIMessageDocs,
            messageDocs: {
              ...newMessageDocs,
              docs: Object.values(messageById),
            },
            pageNum: (kokKokIMessageDocs?.pageNum ?? 0) + 1,
          };
        })();

        LogUtil.info(`messageDocs length of messageDocsByRoomId ${messageDocs.messageDocs.docs.length}`);

        instance.chatStatus.messageDocsByRoomId = {
          ...instance.chatStatus.messageDocsByRoomId,
          [room_id]: messageDocs,
        };
        instance.forceUpdateForChatStatus();

        resolve();
      });

      const pageNum = options.resetPage ? 0 : this.chatStatus?.messageDocsByRoomId?.[room_id]?.pageNum ?? 0;
      if (this.chatStatus?.messageDocsByRoomId?.[room_id]?.pageNum) {
        this.chatStatus.messageDocsByRoomId[room_id].pageNum = pageNum;
      }

      if (this.chatStatus.messageDocsByRoomId?.[room_id]?.messageDocs?.docs && options.resetPage) {
        this.chatStatus.messageDocsByRoomId[room_id] = {
          ...this.chatStatus.messageDocsByRoomId[room_id].messageDocs,
          //@ts-ignore
          docs: [],
        };
      }

      const param = {
        room_id: room_id,
        user_id: AuthUtil.getUserId(),
        page: pageNum + 1,
        limit: this.messageCount,
        // type: 'all',
      };
      LogUtil.info('messages request', param);
      this.socket.emit('messages', param);
    });
  }

  emitChatRoom(prefix: string, room_id: string, sender_id: number, message: Message) {
    this.util.pushMessage(room_id, message);
    //TODO: 타이머를 걸어서, 메시지가 도착 안했음을 기록한다.
    //TODO: onChatRoom에서 해당 메시지가 도착한다면, 해당 타이머 해제. 어떤 자료 구조가 필요한가?

    const type = message.type;
    const content = message.content;
    const reply_parent_message_id = message?.reply_parent_message?._id;
    const upload_urls = message?.url;
    const upload_urls_size = message?.url_size;
    const contactName = message?.contactName;
    const contactNumber = message?.contactNumber;
    const latitude = message?.latitude;
    const longitude = message?.longitude;
    const formattedAddress = message?.formattedAddress;

    //메시지 전송
    if (this.socket?.connected) {
      const param = {
        room_id,
        sender_id,
        type,
        content,
        local_message_id: message.local_message_id,
        ...(formattedAddress ? { formattedAddress: formattedAddress } : {}),
        ...(latitude ? { latitude: latitude } : {}),
        ...(longitude ? { longitude: longitude } : {}),
        ...(reply_parent_message_id ? { reply_parent_message_id: reply_parent_message_id } : {}),
        ...(upload_urls ? { url: upload_urls } : {}),
        ...(upload_urls_size ? { url_size: upload_urls_size } : {}),
        ...(contactName ? { contactName: contactName } : {}),
        ...(contactNumber ? { contactNumber: contactNumber } : {}),
      };
      LogUtil.info(`${prefix} [socketId:${this.socket?.id}] emitChatRoom param`, param);
      try {
        this.socket.emit('chat-room', param);
      } catch (error) {
        LogUtil.error('chat-room error', error);
      }
    }
  }

  emitPin(prefix: string, room_id: string, message_id: string) {
    if (this.socket?.connected) {
      LogUtil.info(`${prefix} [socketId:${this.socket?.id}] emitPin`);
      const param = {
        room_id: room_id,
        message_id: message_id,
      };
      LogUtil.info('emitPin param', param);
      this.socket.emit('pin', param);
    }
  }

  emitDeleteMessage(prefix: string, room_id: string, message_id: string, type: string) {
    if (this.socket?.connected) {
      LogUtil.info(`${prefix} [socketId:${this.socket?.id}] emitDeleteMessage`);
      const param = {
        room_id: room_id,
        message_id: message_id,
        type: type,
      };
      LogUtil.info('emitDeleteMessage param', param);
      this.socket.emit('delete-message', param);
    }
  }

  emitDeleteMedia(prefix: string, url: string, message_id: string, type?: string) {
    if (this.socket?.connected) {
      LogUtil.info(`${prefix} [socketId:${this.socket?.id}] emitDeleteMedia`);
      const param = {
        url: url,
        message_id: message_id,
        type: type,
      };
      LogUtil.info('emitDeleteMedia param', param);
      this.socket.emit('delete-media', param);
    }
  }

  isOnAlreadyCalling(useToast: boolean = true) {
    const alreadyCalling = this.chatStatus.currentRoomForCall?._id;
    LogUtil.info('alreadyCalling', [alreadyCalling]);
    if (alreadyCalling && useToast) {
      Toast.show({
        type: 'error',
        text1: t('chats-main.During a call, you cannot connect a new call'),
      });
    }

    return alreadyCalling;
  }
}

export default ChatSocketUtil;
