import React from 'react';
import BackHeader from '../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { t } from 'i18next';
import { ChooseFriendsCallback } from './ChooseFriends';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import Room, { CallType } from 'types/chats/rooms/Room';
import { useAtomValue, useSetAtom } from 'jotai';
import showCallViewAtom from 'stores/showCallViewAtom';
import ChatSocketUtil from 'utils/chats/ChatSocketUtil';
import userAtom from 'stores/userAtom';

const NavButtonContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding: 20px;
  align-items: center;
  /* border-bottom-width:1px;
  border-bottom-color: #e3e3e3; */
`;
const Icon = styled.Image`
  width: 22px;
  height: 22px;
  tint-color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const NavLabel = styled.Text<{ fontSize: number }>`
  flex: 1;
  font-size: ${({ fontSize }) => fontSize - 1};
  margin-left: 10px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;

function NewChat() {
  const showCallView = useSetAtom(showCallViewAtom);
  const navigation = useNavigation<MainNavigationProp>();
  const user = useAtomValue(userAtom);
  const callback = async ({ roomTypeOfClient, userId, selectedFriendList, navigation }) => {
    const selectedFriendIdList: number[] = selectedFriendList.map((selectedFriend, i) => selectedFriend.id);
    if (roomTypeOfClient === 'video' || roomTypeOfClient === 'audio') {
      await ChatHttpUtil.requestGoCallRoomWithFriends(
        navigation,
        selectedFriendIdList,
        userId,
        roomTypeOfClient,
        (navigation, room: Room, callType: CallType) => {
          if (ChatSocketUtil.instance.isOnAlreadyCalling()) return;

          navigation.goBack();
          navigation.goBack();
          showCallView({
            open: true,
            viewType: 'full',
            params: { room: room, callType: callType, action: 'create' },
          });
        },
      );
    } else {
      await ChatHttpUtil.requestGoChatRoomWithFriends(navigation, selectedFriendIdList, userId);
    }
  };

  return (
    <MainLayout>
      <BackHeader title={t('new-chat.New chat')} />
      <NavButtonContainer
        onPress={() =>
          navigation.navigate('/chats/new-chat/choose-friends', {
            chatRoomType: 'chat',
            callback: new ChooseFriendsCallback(callback),
          })
        }
      >
        <Icon source={require('assets/chats/new-chat/ic-message.png')} />
        <NavLabel fontSize={user?.setting.ct_text_size as number}>{t('new-chat.New chat')}</NavLabel>
        <Icon source={require('assets/ic-next.png')} />
      </NavButtonContainer>
      <NavButtonContainer
        onPress={() =>
          navigation.navigate('/chats/new-chat/choose-friends', {
            chatRoomType: 'audio',
            callback: new ChooseFriendsCallback(callback),
          })
        }
      >
        <Icon source={require('assets/chats/new-chat/ic-call.png')} />
        <NavLabel fontSize={user?.setting.ct_text_size as number}>{t('new-chat.New Voice Chat')}</NavLabel>
        <Icon source={require('assets/ic-next.png')} />
      </NavButtonContainer>
      <NavButtonContainer
        onPress={() =>
          navigation.navigate('/chats/new-chat/choose-friends', {
            chatRoomType: 'video',
            callback: new ChooseFriendsCallback(callback),
          })
        }
      >
        <Icon source={require('assets/chats/new-chat/ic-mov.png')} />
        <NavLabel fontSize={user?.setting.ct_text_size as number}>{t('new-chat.New Video Chat')}</NavLabel>
        <Icon source={require('assets/ic-next.png')} />
      </NavButtonContainer>
    </MainLayout>
  );
}
export default NewChat;
