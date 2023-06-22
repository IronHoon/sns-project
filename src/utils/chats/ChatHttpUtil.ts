import { fi } from 'date-fns/locale';
import { get, post, remove } from 'net/rest/api';
import User from 'types/auth/User';
import Message, { MessageDocs } from 'types/chats/rooms/messages/Message';
import Room, { CallType } from 'types/chats/rooms/Room';
import Nullable from 'types/_common/Nullable';
import { CreateRoomRequest } from 'types/_request/CreateRoomRequest';
import AuthUtil from 'utils/AuthUtil';
import LogUtil from '../LogUtil';
import InviteFriends from '../../types/_request/InviteFriends';
import useSocket from '../../hooks/useSocket';

class ChatHttpUtil {
  static async requestSaveMessage(room_id: string, message: Message): Promise<void> {
    return new Promise(async (resolve, reject) => {
      post(`/chats/rooms/${room_id}/messages/${message._id}/${!message.is_saved ? 'save' : 'unsave'}`, null)
        .then((res) => {
          LogUtil.info(`[${room_id}] requestSaveMessage res`, res);
          resolve();
        })
        .catch((error) => {
          LogUtil.info(`[${room_id}] requestSaveMessage res`, null);
          reject(error);
        });
    });
  }

  static async requestClearMessageOfRoom(room: Room, useDeleteAllType: boolean): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const param = {
        type: useDeleteAllType ? 'all' : '',
      };
      LogUtil.info(`[${room._id}] requestAllDeleteMessage request`, param);
      post(`/chats/rooms/${room._id}/clear?type=${useDeleteAllType ? 'all' : ''}`, {})
        .then((res) => {
          LogUtil.info(`[${room._id}] requestAllDeleteMessage res`, res);
          resolve();
        })
        .catch((error) => {
          LogUtil.info(`[${room._id}] requestAllDeleteMessage res`, null);
          reject(error);
        });
    });
  }

  static async requestReportRoom(
    room: Room,
    useBlockUserAndDeleteAllConversation: boolean,
    reportValue: string,
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      //신고 + 나가기(useBlockUserAndDeleteAllConversation)
      post(`/chats/rooms/reports`, {
        report_issue: reportValue,
        room_id: room._id,
        ...(useBlockUserAndDeleteAllConversation ? { type: 'block' } : {}),
      })
        .then((res) => {
          LogUtil.info(`[${room._id}] requestReportRoom /chats/rooms/reports res`, res);
          if (!useBlockUserAndDeleteAllConversation) {
            resolve();
            return;
          }

          for (const userId of room.joined_user_ids) {
            //해당 모든 유저를 block하기.
            AuthUtil.requestBlockUser('chat', userId)
              .then(() => {
                LogUtil.info(`[${room._id}] requestReportRoom /auth/block res`, res);
                resolve();
              })
              .catch((error) => {
                LogUtil.info(`[${room._id}] requestReportRoom /auth/block error`, null);
                reject(error);
              });
          }
        })
        .catch((error) => {
          LogUtil.info(`[${room._id}] requestReportRoom /chats/rooms/reports error`, null);
          reject(error);
        });
    });
  }

  static async requestPinRoom(room: Room): Promise<void> {
    return new Promise(async (resolve, reject) => {
      post(`/chats/rooms/${room._id}/pin`, null)
        .then((res) => {
          LogUtil.info(`[${room._id}] requestPinRoom res`, res);
          resolve();
        })
        .catch((error) => {
          LogUtil.info(`[${room._id}] requestPinRoom res`, null);
          reject(error);
        });
    });
  }

  static async requestMuteRoom(room: Room): Promise<void> {
    return new Promise(async (resolve, reject) => {
      post(`/chats/rooms/${room._id}/mute`, null)
        .then((res) => {
          LogUtil.info(`[${room._id}] requestMuteRoom res`, res);
          resolve();
        })
        .catch((error) => {
          LogUtil.info(`[${room._id}] requestMuteRoom res`, null);
          reject(error);
        });
    });
  }

  static async requestReadRoom(room: Room): Promise<void> {
    return new Promise(async (resolve, reject) => {
      post(`/chats/rooms/${room._id}/messages/read`, null)
        .then((res) => {
          LogUtil.info(`[${room._id}] requestReadRoom res`, res);
          resolve();
        })
        .catch((error) => {
          LogUtil.info(`[${room._id}] requestReadRoom res`, null);
          reject(error);
        });
    });
  }

  static async requestArchiveRoom(room: Room): Promise<void> {
    return new Promise(async (resolve, reject) => {
      post(`/chats/rooms/${room._id}/archive`, null)
        .then((res) => {
          LogUtil.info(`[${room._id}] requestReadRoom res`, res);
          resolve();
        })
        .catch((error) => {
          LogUtil.info(`[${room._id}] requestReadRoom res`, null);
          reject(error);
        });
    });
  }

  static async requestUnarchiveRoom(checkedRoom: Room): Promise<void> {
    return new Promise(async (resolve, reject) => {
      post(`/chats/rooms/${checkedRoom._id}/unarchive`, null)
        .then((res) => {
          LogUtil.info(`[${checkedRoom._id}] requestUnarchiveRoom res`, res);
          resolve();
        })
        .catch((error) => {
          LogUtil.info(`[${checkedRoom._id}] requestUnarchiveRoom res`, null);
          reject(error);
        });
    });
  }

  static async requestRemoveUser(admin_id: number, remove_user_id: number, room_id: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      post(`/chat/rooms/${room_id}/remove`, {
        admin_id: admin_id,
        remove_user_id: remove_user_id,
      })
        .then((res) => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  static requestLeaveRoom(room_ids: string[]): Promise<void> {
    return new Promise(async (resolve, reject) => {
      post(`/chats/rooms/exit`, {
        room_ids: room_ids,
      })
        .then((res) => {
          LogUtil.info(`[${room_ids}] requestLeaveRoom res`, res);
          resolve();
        })
        .catch((error) => {
          LogUtil.info(`[${room_ids}] requestLeaveRoom res`, null);
          reject(error);
        });
    });
  }

  static requestGetRoom(room_id: string): Promise<Nullable<Room>> {
    return new Promise((resolve, reject) => {
      get<Room>(`/chats/rooms/${room_id}`)
        .then((room) => {
          // LogUtil.info(`[${room_id}] requestGetRoom res`, room);
          resolve(room ?? null);
        })
        .catch((error) => {
          LogUtil.info(`[${room_id}] requestGetRoom res`, null);
          reject(error);
        });
    });
  }

  static requestGetMessagesOfRoom(room_id: string): Promise<Nullable<MessageDocs>> {
    return new Promise((resolve, reject) => {
      get<MessageDocs>(`/chats/rooms/${room_id}/messages?page=1&limit=60`)
        .then((messageDocs) => {
          // LogUtil.info(`[${room_id}] requestGetMessagesOfRoom res`);
          resolve(messageDocs ?? null);
        })
        .catch((error) => {
          LogUtil.info(`[${room_id}] requestGetMessagesOfRoom res`, null);
          reject(error);
        });
    });
  }

  static requestCreateRoom(joined_user_ids: number[], myId: number): Promise<Nullable<Room>> {
    return new Promise(async (resolve, reject) => {
      const type = joined_user_ids.length > 1 ? 'group' : joined_user_ids[0] == myId ? 'me' : 'chat';
      post<Room, CreateRoomRequest>('/chats/rooms', {
        joined_user_ids: joined_user_ids,
        admin_id: myId,
        type: type,
      })
        .then((room) => {
          // LogUtil.info(`requestCreateRoom res`, room);
          resolve(room ?? null);
        })
        .catch((error) => {
          const response = error.response;
          const data = response?.data;
          const room = data?.room;
          // LogUtil.info(`requestCreateRoom error room`, room);
          reject(error);
        });
    });
  }

  static requestShareCreateRoom(
    joined_user_ids: number[],
    myId: number,
    sharedChatList: Message[],
    chatSocketUtil,
  ): Promise<Nullable<Room>> {
    return new Promise(async (resolve, reject) => {
      let type;
      for (let i = 0; i < joined_user_ids.length; i++) {
        type = joined_user_ids[i] === myId ? 'me' : 'chat';
        console.log('type: ', type);
        post<Room, CreateRoomRequest>('/chats/rooms', {
          joined_user_ids: [joined_user_ids[i]],
          admin_id: myId,
          type: type,
        })
          .then((room) => {
            LogUtil.info(`requestCreateRoom res`, room);
            for (const newIMessage of sharedChatList) {
              LogUtil.info('onSend kokkokIMessages', newIMessage);
              if (newIMessage) {
                chatSocketUtil.emitChatRoom('채팅중', room?._id ?? '', myId, newIMessage);
              }
            }
            resolve(room ?? null);
          })
          .catch((error) => {
            const response = error.response;
            const data = response?.data;
            const room = data?.room;
            console.log('share chatlist : ', sharedChatList);
            LogUtil.info(`requestCreateRoom error room`, room);
            for (const newIMessage of sharedChatList) {
              LogUtil.info('onSend kokkokIMessages', newIMessage);
              if (newIMessage) {
                chatSocketUtil.emitChatRoom('채팅중', room?._id ?? '', myId, newIMessage);
              }
            }
            reject(error.response.data.message);
          });
      }
    });
  }

  static syncBadgeUnreadCount() :Promise<void> {
    return new Promise<void>( async(resolve, reject)=>{
      post('auth/push/sync-badge',{}).then(()=>{
        console.log('syncBadge success')
        resolve()
      }).catch((error)=>{
        console.log('syncBadge error')
        reject()
      })
    })
  }

  static requestInviteFriends(navigation, user_ids: number[], roomId: string): Promise<Nullable<Room>> {
    console.log('roomId : ', roomId);
    console.log('user_ids : ', user_ids);
    return new Promise(async (resolve, reject) => {
      const goNextPage = (navigation, room: Room) => {
        navigation.goBack();
        navigation.replace('/chats/chat-room', { room: room });
      };
      post<Room, InviteFriends>(`/chats/rooms/${roomId}/join`, {
        user_ids: user_ids,
      })
        .then((room) => {
          LogUtil.info(`requestInviteFriends res`, room);
          // resolve(room??null);
          console.log('성공');
          if (room) {
            goNextPage(navigation, room);
          }
          resolve(room ?? null);
        })
        .catch((error) => {
          // LogUtil.info(`ChooseFriends error: `, error);
          //@ts-ignore
          const response = error.response;
          const data = response?.data;
          const room = data?.room;
          console.dir(error);
          if (room) {
            goNextPage(navigation, room);
            resolve(room ?? null);
          } else {
            reject(error);
          }
        });
    });
  }

  static requestGoChatRoomWithFriends(navigation, joined_user_ids: number[], myId: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const goNextPage = (navigation, room: Room) => {
        navigation.goBack();
        navigation.replace('/chats/chat-room', { room: room });
      };

      ChatHttpUtil.requestCreateRoom(joined_user_ids, myId)
        .then((room) => {
          if (room) {
            goNextPage(navigation, room);
          }
          resolve();
        })
        .catch((error) => {
          // LogUtil.info(`ChooseFriends error: `, error);
          //@ts-ignore
          const response = error.response;
          const data = response?.data;
          const room = data?.room;
          if (room) {
            goNextPage(navigation, room);
            resolve();
          } else {
            reject(error);
          }
        });
    });
  }

  static requestCreateQRWallet(myId: number): Promise<Nullable<Room>> {
    return new Promise(async (resolve, reject) => {
      const type = 'wallet';
      post<Room, CreateRoomRequest>('/chats/rooms', {
        joined_user_ids: [myId],
        admin_id: myId,
        type: type,
      })
        .then((room) => {
          LogUtil.info(`requestCreateQRWallet res`, room);
          resolve(room ?? null);
        })
        .catch((error) => {
          const response = error.response;
          const data = response?.data;
          const room = data?.room;
          LogUtil.info(`requestCreateQRWallet error room`, room);
          reject(error);
        });
    });
  }

  static requestGoQRWallet(navigation, myId: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const goNextPage = (navigation, room: Room) => {
        navigation.replace('/chats/chat-room', { room: room });
      };

      ChatHttpUtil.requestCreateQRWallet(myId)
        .then((room) => {
          if (room) {
            goNextPage(navigation, room);
          }
          resolve();
        })
        .catch((error) => {
          // LogUtil.info(`ChooseFriends error: `, error);
          //@ts-ignore
          const response = error.response;
          const data = response?.data;
          const room = data?.room;
          if (room) {
            goNextPage(navigation, room);
            resolve();
          } else {
            reject(error);
          }
        });
    });
  }

  static requestGoCallRoomWithFriends(
    navigation,
    joined_user_ids: number[],
    myId: number,
    callType: CallType,
    goNextPage: (navigation, room: Room, callType: CallType) => void,
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      ChatHttpUtil.requestCreateRoom(joined_user_ids, myId)
        .then((room) => {
          if (room) {
            goNextPage(navigation, room, callType);
          }
          resolve();
        })
        .catch((error) => {
          // LogUtil.info(`requestGoCallRoomWithFriends error: `, error);
          //@ts-ignore
          const response = error.response;
          const data = response?.data;
          const room = data?.room;
          // LogUtil.info(`requestGoCallRoomWithFriends error room: `, room);
          if (room) {
            goNextPage(navigation, room, callType);
            resolve();
          } else {
            reject(error);
          }
        });
    });
  }

  static async requestGetUserByContact(contact: string): Promise<User | null> {
    LogUtil.info(`ChatHttpUtil requestGetUserByContact contact:${contact}`);
    try {
      return (await get<User>(`/auth/users/detail?contact=+${contact}`)) ?? null;
    } catch (e) {
      LogUtil.error('ChatHttpUtil requestGetUserByContact error ', e);
      return null;
    }
  }
}

export default ChatHttpUtil;
