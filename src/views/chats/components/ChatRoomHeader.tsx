import { useNavigation } from '@react-navigation/native';
import IconButton from 'components/atoms/MIconButton';
import Padding from 'components/containers/Padding';
import BackHeader from 'components/molecules/BackHeader';
import PrevHeader from 'components/molecules/PrevHeader';
import { useAtomValue, useSetAtom } from 'jotai';
import { MainNavigationProp } from 'navigations/MainNavigator';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Keyboard, TextInput, View } from 'react-native';
import showCallViewAtom from 'stores/showCallViewAtom';
import Room from 'types/chats/rooms/Room';
import ChatSocketUtil from 'utils/chats/ChatSocketUtil';
import { ChatRoomModeType, IconImage } from '../ChatRoom';
import ChatRoomTitle from './ChatRoomTitle';
import IC_CLOSE_ROUND from 'assets/chats/chatroom/ic_close_round.svg';
import styled, { css } from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import LogUtil from '../../../utils/LogUtil';
import Toast from 'react-native-toast-message';
import friendListAtom from 'stores/friendListAtom';

type ChatRoomHeaderProp = {
  roomState: Room;
  messageDocs;
  setChatRoomMode;
  chatRoomMode: ChatRoomModeType;
  isForward;
  setCount;
  setIsForward;
  setCheckedChatList;
  setSearchValue;
  isSystemAccount;
  isStipopShowing;
  showStipopBottomSheet;
  StipopModule;
  isBlockUser;
  setIsStipopShowing;
  isMe: boolean;
  targetUser;
};
function ChatRoomHeader({
  roomState,
  messageDocs,
  setChatRoomMode,
  chatRoomMode,
  isForward,
  setCount,
  setIsForward,
  setCheckedChatList,
  setSearchValue,
  isSystemAccount,
  isStipopShowing,
  showStipopBottomSheet,
  StipopModule,
  isBlockUser,
  isMe,
  setIsStipopShowing,
  targetUser,
}: ChatRoomHeaderProp) {
  const showCallView = useSetAtom(showCallViewAtom);
  const { t } = useTranslation();
  const navigation = useNavigation<MainNavigationProp>();
  const [inputValue, setInputValue] = useState('');
  const roomType = roomState.type;
  const inputRef = useRef<TextInput | null>(null);
  //나를 추가한 유저 리스트
  const addedMeList = useAtomValue(friendListAtom);
  const isAddedMe = addedMeList?.includes(targetUser?.id);

  const isVoiceCallAble = useMemo(() => {
    if (
      targetUser?.user_setting &&
      (targetUser?.user_setting.sc_voice_call === 'public' ||
        (targetUser?.user_setting.sc_voice_call === 'friends' && isAddedMe))
    ) {
      return true;
    } else {
      return false;
    }
  }, [targetUser]);

  const isVideoCallAble = useMemo(() => {
    if (
      targetUser?.user_setting &&
      (targetUser?.user_setting.sc_video_call === 'public' ||
        (targetUser?.user_setting.sc_video_call === 'friends' && isAddedMe))
    ) {
      return true;
    } else {
      return false;
    }
  }, [targetUser]);

  useEffect(() => {
    if (chatRoomMode === 'searchMode') {
      inputRef.current?.focus();
      setInputValue('');
    }
  }, [chatRoomMode, inputRef]);

  const buttonList = [
    {
      name: 'call',
      icon: require('assets/chats/chatroom/ic-call.png'),
      onClick: () => {
        Keyboard.dismiss();
        if (ChatSocketUtil.instance.isOnAlreadyCalling()) {
          return;
        }
        isStipopShowing && showStipopBottomSheet();
        if (roomState) {
          if (roomState.joined_users.length <= 1) {
            Toast.show({
              type: 'error',
              text1: t("chats-main.I can't call on the phone"),
              text2: t("chats-main.because I'm alone in the chat room"),
            });
          } else {
            showCallView({
              open: true,
              viewType: 'full',
              params: { room: roomState, callType: 'audio', action: 'create' },
            });
          }
        }
      },
    },
    {
      name: 'mov',
      icon: require('assets/chats/chatroom/ic-mov.png'),
      onClick: () => {
        Keyboard.dismiss();
        if (ChatSocketUtil.instance.isOnAlreadyCalling()) {
          return;
        }
        isStipopShowing && showStipopBottomSheet();
        if (roomState) {
          if (roomState.joined_users.length <= 1) {
            Toast.show({
              type: 'error',
              text1: t("chats-main.I can't call on the phone"),
              text2: t("chats-main.because I'm alone in the chat room"),
            });
          } else {
            showCallView({
              open: true,
              viewType: 'full',
              params: { room: roomState, callType: 'video', action: 'create' },
            });
          }
        }
      },
    },
    {
      name: 'search',
      icon: require('assets/chats/chatroom/ic-search.png'),
      onClick: () => {
        isStipopShowing && showStipopBottomSheet();
        setChatRoomMode((chatRoomMode) => (chatRoomMode === 'searchMode' ? 'normal' : 'searchMode'));
      },
    },
    {
      name: 'menu',
      icon: require('assets/chats/chatroom/ic-menu.png'),
      onClick: () => {
        isStipopShowing && showStipopBottomSheet();
        roomState ? navigation.navigate('/chats/chat-room/chat-room-detail', { room: roomState }) : undefined;
      },
    },
  ];

  if (roomState.type === 'wallet') {
    return <BackHeader title={t('qr-wallet.QR wallet')} onClick={() => navigation.navigate('/more')} />;
  }

  if (chatRoomMode === 'searchMode') {
    return (
      <HeaderContainer border={false}>
        <Padding>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
            <BackHeaderButton onPress={() => setChatRoomMode('normal')}>
              <IconImage themeColor={true} source={require('assets/ic-back.png')} />
            </BackHeaderButton>
            <IconButton
              themeColor={true}
              source={require('assets/chats/chatroom/ic-search.png')}
              onClick={() => setSearchValue(inputValue)}
            />
            <SearchInput
              ref={inputRef}
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={() => {
                setSearchValue(inputValue);
              }}
            />
            <IC_CLOSE_ROUND
              onTouchStart={() => {
                setInputValue('');
                setSearchValue('');
              }}
            />
          </View>
        </Padding>
      </HeaderContainer>
    );
  }

  if (!isForward) {
    const button = (() => {
      if (isMe) {
        return buttonList
          .filter((button) => button.name !== 'mov' && button.name !== 'call')
          .map((button, i) => (
            <IconButton key={i} themeColor={true} source={button.icon} onClick={() => button.onClick()} />
          ));
      }

      return !isBlockUser && !isSystemAccount
        ? buttonList.map((button, i) =>
            (roomState?.joined_users?.length ?? 0) > 9 ? (
              button.name !== 'mov' &&
              button.name !== 'call' && (
                <IconButton key={i} themeColor={true} source={button.icon} onClick={() => button.onClick()} />
              )
            ) : roomType === 'chat' && button.name === 'call' ? (
              isVoiceCallAble && (
                <IconButton key={i} themeColor={true} source={button.icon} onClick={() => button.onClick()} />
              )
            ) : roomType === 'chat' && button.name === 'mov' ? (
              isVideoCallAble && (
                <IconButton key={i} themeColor={true} source={button.icon} onClick={() => button.onClick()} />
              )
            ) : (
              <IconButton key={i} themeColor={true} source={button.icon} onClick={() => button.onClick()} />
            ),
          )
        : undefined;
    })();

    return (
      <PrevHeader
        title={roomState ? <ChatRoomTitle roomState={roomState} /> : undefined}
        button={button}
        buttonWrap={true}
        onClick={() => {
          StipopModule.remove();
          setIsStipopShowing(false);
          // navigation.navigate('/chats');
          navigation.goBack();
        }}
      />
    );
  } else {
    return (
      <BackHeader
        title={'Forward'}
        onClick={() => {
          setCount(0);
          setIsForward(false);
          setCheckedChatList([]);
        }}
        isForward={isForward}
        // button={[<DeselectButton key={0} count={count} handleDeselect={handleDeselect} />]}
      />
    );
  }
}
export default React.memo(ChatRoomHeader);

const HeaderContainer = styled.View<{ border?: boolean }>`
  ${(props) =>
    !props.border && props.theme.dark
      ? css``
      : css`
          border-bottom-width: 1px;
          border-color: ${COLOR.GRAY};
        `}
  height: 56px;
`;

const BackHeaderButton = styled.TouchableOpacity`
  left: 0;
`;

const SearchInput = styled(TextInput)`
  flex: 1;
  margin-left: 8px;
  padding: 0px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
