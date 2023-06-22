
import User from 'types/auth/User';
import { IEmotion } from './Message';

interface user_setting {
  user_id: number;
  is_fixed: boolean;
  is_muted: boolean;
  last_seen_time?: Date; //TODO: 데이터 타입확인필요
  created_at: Date;
  updated_at: Date;
}

interface Pin {
  _id: string;
  admin_id: number;
  joined_users: User[];
  joined_user_ids: number[];
  user_settings: user_setting[];
  call: string[]; //TODO: 데이터타입 확인필요
  name: string;
  type: string;
  archived_user_ids: string[]; //TODO:데이터 타입 확인필요
  createdAt: Date;
  updatedAt: Date;
  __v: boolean;
  fixed_msg: {
    room_id: string;
    room: string;
    sender_id: number;
    unread_count: number;
    type: string;
    content: string;
    emotions: Array<IEmotion>;
    read_user_ids: number[];
    pin_read_user_ids: string[]; //TODO: 데이터 타입확인필요
    deleted_from_user_ids: string[]; //TODO: 데이터 타입확인필요
    has_link: boolean;
    createdAt: Date;
    updatedAt: Date;
    _id: string;
    __v: boolean;
  };
}

export default Pin;
