import User from 'types/auth/User';
import DateOrString from 'types/_common/DateOrString';
import Nullable from 'types/_common/Nullable';
import DateUtil from 'utils/DateUtil';
import Message from './messages/Message';

export type RoomTypeOfServer = 'chat' | 'group' | 'me' | 'wallet'; //서버의 RoomType
export type RoomTypeOfClient = 'chat' | CallType; //클라이언트의 RoomType
export type CallType = 'audio' | 'video'; //클라이언트의 RoomType

export interface IUserSetting {
  user_id: number;
  is_muted: boolean; // 음소거 여부
  is_fixed: boolean; // 상단 고정 여부
  order?: string; // 고정 시 순서
  last_seen_time?: DateOrString;
  is_fixmsg_read: boolean;
  created_at: String;
  updated_at: String;
}
interface MediaPlacement {
  AudioHostUrl?: string;
  AudioFallbackUrl?: string;
  ScreenDataUrl?: string;
  ScreenSharingUrl?: string;
  ScreenViewingUrl?: string;
  SignalingUrl?: string;
  TurnControlUrl?: string;
  EventIngestionUrl?: string;
}
class Call {
  type?: string;
  MeetingId?: string;
  ExternalMeetingId?: string;
  MediaRegion?: string;
  MediaPlacement?: MediaPlacement[] | MediaPlacement;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Room {
  _id: string;
  admin_id: number;
  joined_users: User[];
  joined_user_ids: number[];
  user_settings: IUserSetting[];
  call: Call[];
  name: string;
  type: RoomTypeOfServer;
  unread_count: number;
  archived_user_ids: number[];
  messages: Message[];
  fixed_msg: Nullable<Message>;
  preview_message?: Message;
  createdAt?: DateOrString;
  updatedAt?: DateOrString;
  is_fixed: boolean;
  is_block?: boolean;
}

export type OnRoomsType = {
  unArchivedRooms: Room[];
  archivedRooms: Room[];
};

export const roomSort = (aRoom, bRoom) => {
  if (aRoom.preview_message?.createdAt && !bRoom.preview_message?.createdAt) {
    return -1;
  }
  if (!aRoom.preview_message?.createdAt && bRoom.preview_message?.createdAt) {
    return 1;
  }

  if (aRoom.preview_message?.createdAt && bRoom.preview_message?.createdAt) {
    return DateUtil.subtract(aRoom.preview_message.createdAt, bRoom.preview_message.createdAt) > 0 ? 1 : -1;
  }

  return aRoom.name.localeCompare(bRoom.name) > 0 ? 1 : -1;
};
export default Room;
