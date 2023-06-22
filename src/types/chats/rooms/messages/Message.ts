import User from 'types/auth/User';
import DateOrString from 'types/_common/DateOrString';
import Nullable from 'types/_common/Nullable';
import Room from '../Room';

export interface ILink {
  title: string;
  description?: string;
  image?: string;
  url: string;
}

export type MessageType =
  | 'chat' //O
  | 'file' //O
  | 'image' //O
  | 'sticker' //O
  | 'video' //O
  | 'system' //O
  | 'location' //O
  | 'contact' //O
  | 'record' //O
  | 'login' //O
  | 'loginNoti' //O
  | 'voice_talk' //O
  | 'face_talk' //O
  | 'profile'; //0

type EmotionType = 'heart' | 'thumbUp' | 'smile' | 'surprise' | 'sad' | 'angry';

export interface IEmotion {
  user_id: string;
  emotion: EmotionType;
}
interface I18NContent {
  key: string;
  data: Object;
}

interface Message {
  _id: string; //서버 메시지 id
  local_message_id: string; //로컬 메시지 id
  room_id: string;
  sender_id: number;
  type: MessageType;
  content: string;
  i18n_content?: I18NContent;
  code?: string;
  contactName: string;
  contactNumber: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  url: string[];
  url_size: number[];
  emotions: IEmotion[];
  read_user_ids: number[];
  pin_read_user_ids?: number[];
  pin_is_read: boolean;
  deleted_from_user_ids: number[];
  next_msg_id?: string;
  prev_msg_id?: string;
  reply_parent_message_id?: string;
  reply_parent_message?: Message;
  is_read: boolean;
  is_saved: boolean;
  has_link: boolean;
  links?: ILink;
  user: User;
  createdAt: DateOrString;
  updatedAt: DateOrString;
}

export interface KokKokIMessageDocs {
  messageDocs: MessageDocs;
  pageNum: number;
}

export type MessageDocs = { docs: Message[]; not_exist_friend?: boolean; room: Room };

export default Message;
