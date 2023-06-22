import React, { useContext, useState } from 'react';
import styled, { ThemeContext } from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import { Column } from 'components/layouts/Column';
import { ImageSourcePropType } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { t } from 'i18next';
import Room, { RoomTypeOfServer } from 'types/chats/rooms/Room';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

interface NavButtonProps {
  icon: ImageSourcePropType;
  children?: string;
  onClick: () => void;
}

const NavButtonContainer = styled.Pressable`
  flex-direction: row;
  padding: 20px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
`;
const Icon26 = styled.Image`
  width: 22px;
  height: 22px;
  tint-color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Icon22 = styled.Image`
  width: 22px;
  height: 22px;
  tint-color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Label = styled.Text<{ fontSize: number }>`
  flex: 1;
  margin-left: 15px;
  font-size: ${({ fontSize }) => fontSize - 1};
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;

const NavButton = ({ icon, onClick, children }: NavButtonProps) => {
  const themeContext = useContext(ThemeContext);
  const myUser = useAtomValue(userAtom);

  return (
    <NavButtonContainer
      style={({ pressed }) => [
        {
          backgroundColor: pressed
            ? themeContext.dark
              ? '#88808f'
              : '#fcf2e8'
            : themeContext.dark
            ? '#585858'
            : '#ffffff',
        },
      ]}
      onPress={() => onClick()}
    >
      <Icon26 source={icon} />
      <Label fontSize={myUser?.setting.ct_text_size}>{children}</Label>
      <Icon22 source={require('assets/ic-next.png')} />
    </NavButtonContainer>
  );
};

type ChatRoomDetailMenuNavProps = { type: RoomTypeOfServer; setIsVisible: Function; room: Room };
function ChatRoomDetailMenuNav({ type, setIsVisible, room }: ChatRoomDetailMenuNavProps) {
  const navigation = useNavigation<MainNavigationProp>();

  return (
    <Column>
      <NavButton
        icon={require('assets/chats/chatroom-detail/ic-media.png')}
        onClick={() => navigation.navigate('/chats/chat-room/chat-room-detail/media', { room })}
      >
        {t('chat-info.Media')}
      </NavButton>
      <NavButton
        icon={require('assets/chats/chatroom-detail/ic-file.png')}
        onClick={() => navigation.navigate('/chats/chat-room/chat-room-detail/files', { room })}
      >
        {t('chat-info.Files')}
      </NavButton>
      <NavButton
        icon={require('assets/chats/chatroom-detail/ic-link.png')}
        onClick={() => navigation.navigate('/chats/chat-room/chat-room-detail/links', { room })}
      >
        {t('chat-info.Links')}
      </NavButton>
      {type !== 'me' && (
        <NavButton icon={require('assets/chats/chatroom-detail/ic-report.png')} onClick={() => setIsVisible(true)}>
          {t('chat-info.Report')}
        </NavButton>
      )}
    </Column>
  );
}

export default ChatRoomDetailMenuNav;
