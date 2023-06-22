import User from 'types/auth/User';
import DateOrString from 'types/_common/DateOrString';
import { IEmotion, MessageType } from './rooms/messages/Message';

interface Message {
  _id: string; //메시지 id
  room_id: string;
  room: string;
  sender_id: number;
  unread_count: number;
  type: MessageType;
  content: string;
  emotions: IEmotion[];
  read_user_ids: number[];
  pin_read_user_ids?: number[];
  deleted_from_user_ids: number[];
  has_link: boolean;
  createdAt: DateOrString;
  updatedAt: DateOrString;
  __v: number;
  user: User;
}

export interface SavedMessage {
  _id: string;
  user_id: string;
  user: User;
  room_id: string;
  message: Message;
  message_id: string;
  createdAt: DateOrString;
  updatedAt: DateOrString;
  __v: number;
}
