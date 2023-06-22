import { UserWithAttendeeId } from 'components/molecules/CallView';
import { atom } from 'jotai';
import { KokKokIMessageDocs } from 'types/chats/rooms/messages/Message';
import Room, { OnRoomsType } from 'types/chats/rooms/Room';
import Nullable from 'types/_common/Nullable';

export type ChatStatus = {
  isChatRoomReady: boolean;
  rooms: Nullable<OnRoomsType>;
  myUnreadCount: number;
  currentRoomForChat: Nullable<Room>;
  currentRoomForCall: Nullable<Room>;
  unreadCountInfoByRoomId: Record<string, Record<string, [string, string]>>;
  messageDocsByRoomId: Record<string, KokKokIMessageDocs>;
  callState: 'ringing' | 'calling';
  callUserWithAttendeeIdByContact: Map<string, UserWithAttendeeId>;
  callVideoIdByAttendeeId: Map<string, number>;
  callAttendeeIdListForMute: string[];
  callAttendeeIdListForActiveSpeaker: string[];
  callCurrentSpeaker: UserWithAttendeeId | null;
};
export type ChatStatusField =
  | 'isChatRoomReady'
  | 'rooms'
  | 'myUnreadCount'
  | 'currentRoomForChat'
  | 'currentRoomForCall'
  | 'unreadCountInfoByRoomId'
  | 'messageDocsByRoomId'
  | 'callState'
  | 'callUserWithAttendeeIdByContact'
  | 'callVideoIdByAttendeeId'
  | 'callAttendeeIdListForMute'
  | 'callAttendeeIdListForActiveSpeaker'
  | 'callCurrentSpeaker';
const chatStatusAtom = atom<ChatStatus>({
  isChatRoomReady: false,
  rooms: null,
  myUnreadCount: 0,
  currentRoomForChat: null,
  currentRoomForCall: null,
  unreadCountInfoByRoomId: {},
  messageDocsByRoomId: {},
  callState: 'ringing',
  callUserWithAttendeeIdByContact: new Map(),
  callVideoIdByAttendeeId: new Map(),
  callAttendeeIdListForMute: [],
  callAttendeeIdListForActiveSpeaker: [],
  callCurrentSpeaker: null,
});

export default chatStatusAtom;
