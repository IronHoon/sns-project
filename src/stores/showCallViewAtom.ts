import { atom } from 'jotai';
import Room, { CallType } from 'types/chats/rooms/Room';
import { JoinCallAction } from 'utils/chats/ChatSocketUtil';

type CallViewParams = {
  navigation: any;
  room: Room;
  callType: CallType;
  action: JoinCallAction;
};
export type CallViewType = 'pip' | 'full' | 'invite-friends';
export type CallViewStatus = { open: boolean; viewType: CallViewType; params: CallViewParams };
//@ts-ignore
const showCallViewAtom = atom<CallViewStatus>({
  open: false,
  viewType: 'full',
  params: {
    room: {},
    callType: 'audio',
    action: 'create',
  },
});

export default showCallViewAtom;
