import React, { useState } from 'react';
import styled from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import { Row } from 'components/layouts/Row';
import Call from 'assets/chats/chatroom-detail/btn-call.svg';
import Video from 'assets/chats/chatroom-detail/btn-video.svg';
import Mute from 'assets/chats/chatroom-detail/btn-alarm.svg';
import UnMute from 'assets/chats/chatroom-detail/btn-unmute.svg';
import More from 'assets/chats/chatroom-detail/btn-more.svg';
import Room, { IUserSetting, RoomTypeOfServer } from 'types/chats/rooms/Room';
import LogUtil from 'utils/LogUtil';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import chatStatusAtom from 'stores/chatStatusAtom';
import { useAtomValue } from 'jotai';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { useNavigation } from '@react-navigation/native';
import useSocket from 'hooks/useSocket';
import { useSetAtom } from 'jotai';
import showCallViewAtom from 'stores/showCallViewAtom';
import ChatSocketUtil from 'utils/chats/ChatSocketUtil';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';

const IconButton = styled.TouchableOpacity`
  margin-left: 8px;
  margin-right: 8px;
`;

type ChatRoomDetailButtonNavProps = {
  type: RoomTypeOfServer;
  setIsVisible: Function;
  room: Room;
  profileUserSetting: IUserSetting;
};
function ChatRoomDetailButtonNav({ type, setIsVisible, room, profileUserSetting }: ChatRoomDetailButtonNavProps) {
  const showCallView = useSetAtom(showCallViewAtom);
  const navigation = useNavigation<MainNavigationProp>();
  const { chatStatus, forceUpdateForChatStatus } = useSocket();
  const [isMute, setIsMute] = useState<boolean>(profileUserSetting?.is_muted);
  const { t } = useTranslation();

  const onPressMute = () => {
    ChatHttpUtil.requestMuteRoom(room).then(() => {
      const nextIsMute = !isMute;
      profileUserSetting.is_muted = nextIsMute;

      chatStatus.currentRoomForChat = room;
      setIsMute(nextIsMute);

      forceUpdateForChatStatus();
    });
  };

  const onPressCallVoice = () => {
    if (ChatSocketUtil.instance.isOnAlreadyCalling()) return;

    if (room) {
      if (room.joined_users.length <= 1) {
        LogUtil.info('room.joined_users.length', [room.joined_users.length]);
        Toast.show({
          type: 'error',
          text1: t("chats-main.I can't call on the phone"),
          text2: t("chats-main.because I'm alone in the chat room"),
        });
      } else {
        navigation.goBack();
        navigation.goBack();
        showCallView({
          open: true,
          viewType: 'full',
          params: { room: room, callType: 'audio', action: 'create' },
        });
      }
    }
  };
  const onPressCallVideo = () => {
    if (ChatSocketUtil.instance.isOnAlreadyCalling()) return;

    if (room) {
      if (room.joined_users.length <= 1) {
        Toast.show({
          type: 'error',
          text1: t("chats-main.I can't call on the phone"),
          text2: t("chats-main.because I'm alone in the chat room"),
        });
      } else {
        navigation.goBack();
        navigation.goBack();
        showCallView({
          open: true,
          viewType: 'full',
          params: { room: room, callType: 'video', action: 'create' },
        });
      }
    }
  };
  const onPressMore = () => {
    setIsVisible(true);
  };

  return (
    <Row style={{ justifyContent: 'center', marginVertical: 30 }}>
      {type === 'me' ? (
        <>
          {isMute ? (
            <IconButton onPress={onPressMute}>
              <UnMute width={56} height={56} />
            </IconButton>
          ) : (
            <IconButton onPress={onPressMute}>
              <Mute width={56} height={56} />
            </IconButton>
          )}
          <IconButton onPress={onPressMore}>
            <More width={56} height={56} />
          </IconButton>
        </>
      ) : (
        <>
          <IconButton onPress={onPressCallVoice}>
            <Call width={56} height={56} />
          </IconButton>
          <IconButton onPress={onPressCallVideo}>
            <Video width={56} height={56} />
          </IconButton>
          {isMute ? (
            <IconButton onPress={onPressMute}>
              <UnMute width={56} height={56} />
            </IconButton>
          ) : (
            <IconButton onPress={onPressMute}>
              <Mute width={56} height={56} />
            </IconButton>
          )}
          <IconButton onPress={onPressMore}>
            <More width={56} height={56} />
          </IconButton>
        </>
      )}
    </Row>
  );
}

export default ChatRoomDetailButtonNav;
