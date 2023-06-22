import React from 'react';
import { Pressable, View } from 'react-native';
import Read from 'assets/chats/btn_read.svg';
import Pin from 'assets/chats/btn_pin.svg';
import PinOff from 'assets/chats/btn_pin_off.svg';
import Alarm from 'assets/chats/btn_alarm.svg';
import AlarmOff from 'assets/chats/btn_alarm_off.svg';
import ArchiveBtn from 'assets/chats/btn_archive.svg';
import Exit from 'assets/chats/btn_exit.svg';
import ExitW from 'assets/chats/btn_exit_white.svg';
import Room from 'types/chats/rooms/Room';
import { post } from 'net/rest/api';
import LogUtil from 'utils/LogUtil';
import AuthUtil from 'utils/AuthUtil';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import { useFetchWithType } from '../../../net/useFetch';
import User from '../../../types/auth/User';

type OnRoom = (room: Room) => void;
interface ChatRoomQuickActionsProps {
  room: Room;
  dark: boolean;
  onRead: OnRoom;
  onPin: OnRoom;
  onMute: OnRoom;
  onArchive: OnRoom;
  onExit: OnRoom;
  onClose: () => void;
}

const ChatRoomQuickActions = ({
  room,
  dark,
  onRead,
  onPin,
  onMute,
  onArchive,
  onExit,
  onClose,
}: ChatRoomQuickActionsProps) => {
  const readChat = () => {
    onRead(room);
    onClose();
  };
  const pinChat = async () => {
    onPin(room);
    onClose();
  };
  const muteChat = async () => {
    onMute(room);
    onClose();
  };
  const archiveChat = () => {
    onArchive(room);
    onClose();
  };
  const exitChat = () => {
    // LogUtil.info('exitChat ', room);
    onExit(room);
    onClose();
  };

  const myUser = useAtomValue(userAtom);
  const { data: userData } = useFetchWithType<User>('/auth/me');
  const userSetting = room.user_settings.filter((user) => user.user_id === myUser?.id);

  return (
    <View
      style={[
        {
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginRight: 10,
        },
        dark ? { backgroundColor: '#585858' } : { backgroundColor: '#ffffff' },
      ]}
    >
      <View
        style={{
          width: 50,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {room.unread_count !== 0 && (
          <Pressable onPress={() => readChat()}>
            <Read width={36} height={32} />
          </Pressable>
        )}
      </View>
      <View
        style={{
          width: 50,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Pressable onPress={() => pinChat()}>
          {userSetting[0]?.is_fixed ? <Pin width={36} height={32} /> : <PinOff width={36} height={32} />}
        </Pressable>
      </View>
      <View
        style={{
          width: 50,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Pressable onPress={() => muteChat()}>
          {userSetting[0]?.is_muted ? <Alarm width={36} height={32} /> : <AlarmOff width={36} height={32} />}
        </Pressable>
      </View>
      {!!userData?.setting.ct_active_chat && (
        <View
          style={{
            width: 50,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Pressable onPress={() => archiveChat()}>
            <ArchiveBtn width={36} height={32} />
          </Pressable>
        </View>
      )}
      <View
        style={{
          width: 50,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Pressable onPress={() => exitChat()}>
          {dark ? <ExitW width={36} height={32} /> : <Exit width={36} height={32} />}
        </Pressable>
      </View>
    </View>
  );
};

export default ChatRoomQuickActions;
