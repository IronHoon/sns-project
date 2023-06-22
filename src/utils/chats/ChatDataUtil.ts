import { t } from 'i18next';
import User from 'types/auth/User';
import Message, { MessageType } from 'types/chats/rooms/messages/Message';
import Room from 'types/chats/rooms/Room';
import AuthUtil from 'utils/AuthUtil';
import LogUtil from 'utils/LogUtil';

type newMessageForFrontType = {
  text?: string;
  contactName?: string;
  contactNumber?: string;
  uploadPathList?: string[];
  uploadSizeList?: number[];
  parentMessage?;
  type: MessageType;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
};
class ChatDataUtil {
  // static messageForFront(message: Message): Message {
  //   let text = message.content;
  //   if (message.type === 'system') {
  //     const i18n_content = message.i18n_content;
  //     if (i18n_content) {
  //       text = t(i18n_content.key, i18n_content.data);
  //     } else {
  //       // LogUtil.error('messageForFront error i18n_content is empty', [i18n_content]);
  //     }
  //   }

  //   return {
  //     ...message,
  //     content: text,
  //   };
  // }

  static newMessage({
    text,
    contactName,
    contactNumber,
    uploadPathList,
    uploadSizeList,
    parentMessage,
    type,
    latitude,
    longitude,
    formattedAddress,
  }: newMessageForFrontType): Message {
    const localMessageId = String(Math.round(Math.random() * 1000000));
    //@ts-ignore
    return {
      _id: localMessageId,
      local_message_id: localMessageId,
      createdAt: new Date(),
      user: {
        //@ts-ignore
        id: AuthUtil.getUserId(),
      },
      ...(text ? { content: text } : {}),
      ...(type ? { type: type } : {}),
      ...(parentMessage ? { reply_parent_message: parentMessage } : {}),
      ...(formattedAddress ? { formattedAddress: formattedAddress } : {}),
      ...(latitude ? { latitude: latitude } : {}),
      ...(longitude ? { longitude: longitude } : {}),
      ...(contactName ? { contactName: contactName } : {}),
      ...(contactNumber ? { contactNumber: contactNumber } : {}),
      ...(uploadPathList ? { url: uploadPathList } : {}),
      ...(uploadSizeList ? { url_size: uploadSizeList } : {}),
    };
  }

  static simpleMessageVer(room: Room) {
    if (room.preview_message?.type === 'image') {
      return `[ ${t('chats-main.Photo')} ]`;
    }
    if (room.preview_message?.type === 'video') {
      return `[ ${t('chats-main.Video')} ]`;
    }
    if (room.preview_message?.type === 'record') {
      return `[ ${t('chats-main.Record')} ]`;
    }
    if (room.preview_message?.type === 'file') {
      return `[ ${t('chats-main.File')} ]`;
    }
    if (room.preview_message?.type === 'contact') {
      return `[ ${t('chats-main.Contact')} ]`;
    }
    if (room.preview_message?.type === 'location') {
      return `[ ${t('chats-main.Location')} ]`;
    }
    if (room.preview_message?.type === 'system') {
      return `[ ${t('chats-main.System')} ]`;
    }
    return room.preview_message?.content;
  }
}
export default ChatDataUtil;
