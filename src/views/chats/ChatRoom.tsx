import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import MainLayout from 'components/layouts/MainLayout';
import styled, { ThemeContext } from 'styled-components/native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import {
  Alert,
  Dimensions,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import PlusMenu from './components/PlusMenu';
import Add from 'assets/chats/chatroom/ic-add.svg';
import Block from 'assets/chats/chatroom/ic-block.svg';
import Exit from 'assets/chats/chatroom/ic-exit.svg';
import { COLOR } from 'constants/COLOR';
import { Row } from 'components/layouts/Row';
import Pin from 'assets/chats/chatroom/ic-pin.svg';
import PinW from 'assets/chats/chatroom/ic_pin_w.svg';
import { Column } from 'components/layouts/Column';
import ArrowUp from 'assets/chats/chatroom/ic-up.svg';
import ArrowDown from 'assets/chats/chatroom/ic-down.svg';
import ArrowUpW from 'assets/chats/chatroom/ic-up-w.svg';
import ArrowDownW from 'assets/chats/chatroom/ic-down-w.svg';
import Message, { MessageDocs } from 'types/chats/rooms/messages/Message';
import LogUtil from 'utils/LogUtil';
import { useAtom, useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import { BACKGROUND } from 'constants/BACKGROUND';
import User from '../../types/auth/User';
import ChatDataUtil from 'utils/chats/ChatDataUtil';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import AuthUtil from 'utils/AuthUtil';
import { useTranslation } from 'react-i18next';
import DateUtil from 'utils/DateUtil';
import useSocket from 'hooks/useSocket';
import useFetch, { useFetchWithType } from '../../net/useFetch';
import { post, remove } from '../../net/rest/api';
import shareAtom from '../../stores/shareAtom';
import Toast, { BaseToast } from 'react-native-toast-message';
import { NativeModules } from 'react-native';
import { NativeEventEmitter } from 'react-native';
import ChatRoomHeader from './components/ChatRoomHeader';
import ChatRoomFooter from './components/ChatRoomFooter';
import MessageList from './components/MessageList';
import ChatWebView from './components/chatbubble/ChatWebView';
import { ToastConfig as GlobalToastConfig } from 'config/ToastConfig';
import ChatSocketUtil from 'utils/chats/ChatSocketUtil';

export type ChatRoomModeType = 'normal' | 'plusMenu' | 'recordMode' | 'replyMode' | 'searchMode';

const NotExistFriend = styled.View<{ dark: boolean }>`
  flex-direction: row;
  height: 50px;
  width: ${Dimensions.get('window').width - 26}px;
  opacity: 0.8;
  border-radius: 18px;
  background-color: ${({ dark }) => (dark ? '#262525' : '#999999')};
  position: absolute;
  margin: 8px 13px 0px 13px;
  top: 0px;
  align-items: center;
  justify-content: space-around;
`;
const IconTextButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;
const ButtonLabel = styled.Text<{ fontSize: number }>`
  font-size: ${({ fontSize }) => fontSize - 2};
  color: #ffffff;
  margin-left: 8px;
`;
const Divider = styled.View`
  flex: 1;
  border-bottom-color: ${COLOR.GRAY};
  border-bottom-width: 1px;
`;
const IconImages = styled.Image`
  width: 16px;
  height: 16px;
  margin: auto 0;
`;
const PinContainer = styled.View<{ show: boolean }>`
  flex-direction: column;
  width: 100%;
  background-color: ${({ theme }) => (theme.dark ? '#88808f' : '#fcf2e8')};
  position: absolute;
  top: 0px;
`;
const PinWrap = styled.View`
  width: 50px;
  padding-left: 15px;
  padding-top: 18px;
`;
const PinText = styled.Text`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: 13px;
  line-height: 19px;
`;
const ArrowWrap = styled.Pressable`
  /* width: ${`${Dimensions.get('window').width / 4}px`}; */
  width: 50px;
  align-items: flex-end;
  padding-right: 15px;
  padding-top: 18px;
`;
const IDText = styled.Text`
  color: #999999;
  font-size: 12px;
  line-height: 19px;
  margin-top: 5px;
  margin-bottom: 10px;
`;

const DontShowButton = styled.TouchableOpacity`
  height: 37.5px;
  align-items: center;
  justify-content: center;
  border-top-color: #eee2d7;
  border-top-width: 1px;
`;
const DontShowLabel = styled.Text`
  font-size: 13px;
  line-height: 19px;
  color: ${COLOR.PRIMARY};
`;

const ChatRoom = function () {
  // LogUtil.info('ChatRoom');
  const { chatStatus, chatSocketUtil, forceUpdateForChatStatus } = useSocket();

  //메타정보
  const { t } = useTranslation();
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute();
  const themeContext = useContext(ThemeContext);
  const myUser = useAtomValue<User | null>(userAtom);
  const myUserId: number = AuthUtil.getUserId() ?? -1;
  const systemAccountUserId = 5;

  //로컬정보
  const input = useRef<any>();
  //@ts-ignore
  const roomState = route.params.room;
  const room_id: string = roomState?._id;
  const targetUser = useMemo(() => roomState?.joined_users?.filter((user) => user.id !== myUserId)?.[0], [roomState]);

  const isSystemAccount = targetUser?.id === systemAccountUserId && roomState.joined_users.length === 2;

  const { data: userData, mutate: userMutate } = useFetchWithType<User>(
    targetUser?.uid ? `auth/users/detail?uid=${targetUser?.uid ?? ''}` : '',
  );
  const refreshChatRoom = async () => {
    if (room_id) {
      await chatSocketUtil.easy.joinRoomForChat('ChatRoom refresh', room_id);
    }
  };

  const fixed_msg = chatStatus?.currentRoomForChat?.fixed_msg;
  const dontShow = chatStatus?.currentRoomForChat?.user_settings.filter((user) => user.user_id === myUserId)[0]
    .is_fixmsg_read;
  const [showPin, setShowPin] = useState<boolean>(!dontShow && !!fixed_msg);
  useFocusEffect(
    useCallback(() => {
      setShowPin(!dontShow && !!fixed_msg);
      (async () => {
        await ChatHttpUtil.requestReadRoom(roomState);
      })();
    }, [dontShow, fixed_msg, roomState]),
  );

  const [isBigPinMessage, setIsBigPin] = useState<boolean>(false);
  const [isForward, setIsForward] = useState<boolean>(false);
  const [checkedChatList, setCheckedChatList] = useState<Message[]>([]);
  const [count, setCount] = useState(0);
  const [share, setShare] = useAtom(shareAtom);
  const messageDocsByRoomId = chatStatus.messageDocsByRoomId;
  const iMessageDocs: any = room_id && messageDocsByRoomId[room_id]; //kokkokIMessageDocs:onMessages 이벤트에 의해서 변경되는 주체.
  const messageDocs: MessageDocs | undefined = iMessageDocs?.messageDocs; //서버에서 받은 데이터
  const [isNotFriend, setIsNotFriend] = useState<boolean>(messageDocs?.not_exist_friend || false);
  const messageListWithSystemMessages = useMemo(() => {
    const prepareMessage = (messageList: Message[], myUserId, roomState) => {
      let newMessageList = [...messageList];
      const addSystemLastSeenTime = (_messageList: Message[], myUserId, roomState) => {
        const systemMessageId = 'system:last_seen_time';
        _messageList = _messageList.filter((message) => message._id !== systemMessageId);

        const lastSeenDate = roomState?.user_settings?.filter((userSetting) => userSetting.user_id === myUserId)?.[0]
          ?.last_seen_time;
        if (
          lastSeenDate &&
          _messageList[0]?.createdAt &&
          lastSeenDate < _messageList[0]?.createdAt &&
          _messageList[0]?.sender_id !== myUserId
        ) {
          //@ts-ignore
          _messageList.push({
            _id: systemMessageId,
            type: 'system',
            content: t('chat-room.Unread Message'),
            createdAt: lastSeenDate,
            updatedAt: lastSeenDate,
          });
        }
        return _messageList;
      };
      const addSystemDate = (_messageList: Message[]) => {
        const systemMessageId = 'system:date';
        _messageList = _messageList.filter((message) => !message._id.includes(systemMessageId));

        let newSystemMessageObj = {};
        for (const message of _messageList) {
          const todayDateStr = DateUtil.getChatDate(message.createdAt);
          const newSystemMessage = {
            _id: `${systemMessageId}:${todayDateStr}`,
            type: 'system',
            content: todayDateStr,
            createdAt: new Date(DateUtil.date(message.createdAt).toDateString()),
          };
          newSystemMessageObj = {
            ...newSystemMessageObj,
            [newSystemMessage._id]: newSystemMessage,
          };
        }
        return [..._messageList, ...Object.values<Message>(newSystemMessageObj)];
      };

      newMessageList = addSystemLastSeenTime(newMessageList, myUserId, roomState);
      newMessageList = addSystemDate(newMessageList);
      newMessageList.sort((a, b) => DateUtil.subtract(a.createdAt, b.createdAt));
      LogUtil.info('messageList length', [newMessageList.length]);
      return newMessageList;
    };
    return prepareMessage(messageDocs?.docs ?? [], myUserId, roomState);
  }, [chatStatus.messageDocsByRoomId, myUserId, roomState]);
  //디자인
  const [chatRoomMode, setChatRoomMode] = useState<ChatRoomModeType>('normal');
  const [parentMessage, setParentMessage] = useState<Message | undefined>();
  const background = useMemo(() => {
    if (!myUser) {
      return '#f8f8f8';
    }
    return myUser?.setting.ct_background;
  }, [myUser]);

  const type = useMemo(() => {
    if (!myUser) {
      return 'color';
    }
    return myUser?.setting.ct_background_type;
  }, [myUser]);
  const ToastConfig = {
    ...GlobalToastConfig,
    success: (props) => {
      const disableBackButton = props?.props?.disableBackButton;
      if (props.text1)
        return (
          <>
            <BaseToast
              {...props}
              text1NumberOfLines={2}
              onPress={() => {
                if (!disableBackButton) {
                  navigation.navigate('/chats');
                }
              }}
              style={{
                borderLeftColor: '#15979e',
                borderRadius: 0,
                padding: 12,
                borderLeftWidth: 3,
              }}
              contentContainerStyle={{ paddingHorizontal: 12 }}
              text1Style={{
                marginLeft: 0,
                padding: 0,
                fontSize: 12,
                fontWeight: '400',
              }}
              renderLeadingIcon={() => <IconImages source={require('../../assets/ic_success.png')} />}
              renderTrailingIcon={() =>
                !disableBackButton ? <IconImages source={require('../../assets/ic-arrow.png')} /> : undefined
              }
            />
          </>
        );
    },
  };

  LogUtil.info('roomState', roomState._id);

  // const keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', () => setChatRoomMode('normal')); //이 부분에 의해서, 검색 모드일떄 normal 모드로 바뀌기도 함, 음.. 필요없는 코드같아서 제거
  const setParentMessageForReply = (parentMessageForReply: Message | undefined) => {
    setParentMessage(parentMessageForReply);
    setChatRoomMode('replyMode');

    input?.current?.focus();
  };

  const onSend = useCallback(
    (newIMessages: Message[] = []) => {
      for (const newIMessage of newIMessages) {
        LogUtil.info('onSend kokkokIMessages', newIMessages);
        // LogUtil.info('onSend kokkokIMessages reply_message', newIMessages?.reply_message);
        if (newIMessage) {
          chatSocketUtil.emitChatRoom('채팅중', room_id, myUserId, newIMessage);
        }
      }
      setParentMessage(undefined);
    },
    [room_id, myUserId],
  );

  const addFriend = async () => {
    if (!targetUser) {
      LogUtil.error('ChatRoom requestAddFriend targetUser not exist');
      return;
    }
    LogUtil.info(`ChatRoom requestAddFriend targetUser.contact:${targetUser.contact}`);

    try {
      await AuthUtil.requestAddFriend(targetUser.contact);
      const getMessageDocsByRoomId = (room_id, messageDocsByRoomId) => {
        const iMessageDocs = messageDocsByRoomId[room_id];
        if (iMessageDocs) {
          iMessageDocs.messageDocs.not_exist_friend = false;
        }
        return { ...messageDocsByRoomId };
      };

      chatStatus.messageDocsByRoomId = getMessageDocsByRoomId(room_id, messageDocsByRoomId);
      forceUpdateForChatStatus();
    } catch (error: any) {
      const message = error.response?.data?.message ?? '';
      if (message === '차단한 유저 입니다. 차단 해제 후 추가해 주세요.') {
        Toast.show({
          type: 'error',
          text1: 'Blocked User. Add friend after unblocking.',
        });
      } else {
        Alert.alert('Error', message);
      }
    }
  };
  const block = async () => {
    if (!targetUser) {
      LogUtil.error('ChatRoom requestBlockUser targetUser not exist');
      return;
    }

    try {
      if (userData?.block) {
        remove(`/auth/block/${targetUser.id}`).then(async () => {
          await refreshChatRoom();
          console.log('차단 해제 성공!');
          await userMutate();
        });
      } else {
        await AuthUtil.requestBlockUser('chat', targetUser.id);
        await refreshChatRoom();
        await userMutate();
      }
    } catch (error) {
      LogUtil.error('ChatRoom requestBlockUser error', error);
    }
  };

  const exit = async () => {
    try {
      await ChatHttpUtil.requestLeaveRoom([room_id]);
      navigation.goBack();
    } catch (error) {
      LogUtil.error('ChatRoom requestLeaveRoom error', error);
    }
  };

  useEffect(() => {
    if (messageDocs && messageDocs?.not_exist_friend !== undefined) {
      setIsNotFriend(messageDocs?.not_exist_friend);
    }
  }, [messageDocs]);
  useEffect(() => {
    if (!room_id) return;

    const prefix = 'ChatRoom';
    ChatSocketUtil.instance.easy.joinRoomForChat(prefix, room_id);
    return () => {
      ChatSocketUtil.instance.easy.leaveRoomForChat(prefix, room_id);
    };
  }, [room_id]);

  // const url = 'https://awesome.contents.com/';
  // const title = 'Awesome Contents';
  // const message = 'Please check this out.';
  // const icon = 'data:<data_type>/<file_extension>;base64,<base64_data>';

  useFocusEffect(
    useCallback(() => {
      if (share) {
        Toast.show({ text1: 'Message forwarded. You can check\nthe message on Chats.' });
        setShare(false);
      }
    }, [share]),
  );

  const [searchValue, setSearchValue] = useState<string>('');
  const [searchedMessageIndex, setSearchedMessageIndex] = useState(0);
  const [searchedMessageList, setSearchedMessageList] = useState<Message[]>([]);
  const [messageIndexById, setMessageIndexById] = useState<Record<string, number>>({});

  const { data: blockData } = useFetch('auth/block');
  const blocklist = blockData?.blocklist.map((data) => data.target_id);
  const isBlockUser = !!(targetUser?.id && blocklist?.includes(targetUser.id));

  useEffect(() => {
    if (chatRoomMode !== 'searchMode') {
      setSearchedMessageList([]);
      setMessageIndexById({});
      setSearchValue('');
    }
  }, [chatRoomMode]);

  useEffect(() => {
    if (!searchValue) {
      return;
    }

    setSearchedMessageList(
      messageListWithSystemMessages.filter(
        (message) => (message.content ?? '').includes(searchValue) && !message._id.includes('system'),
      ),
    );
    setMessageIndexById(
      messageListWithSystemMessages.reduce((prev, message, i) => ({ ...prev, [message._id]: i }), {}),
    );
  }, [messageListWithSystemMessages, searchValue]);

  useEffect(() => {
    setSearchedMessageIndex(0);
  }, [searchValue]);

  // stipop

  const { StipopModule } = NativeModules;

  let nativeEventEmitter: any = null;

  switch (Platform.OS) {
    case 'android':
      nativeEventEmitter = new NativeEventEmitter(StipopModule);
      break;

    case 'ios':
      const { StipopEmitter } = NativeModules;
      nativeEventEmitter = new NativeEventEmitter(StipopEmitter);
      break;
  }

  // Stipop Tap Listener
  let stickerSingleTapListener = null;
  let stickerDoubleTapListener = null;

  const tapListenerInit = () => {
    stickerSingleTapListener = nativeEventEmitter.addListener('onStickerSingleTapped', (event) => {
      console.log('Single tapped');
      const stickerImgUrl = event.stickerImg;
      onSend([
        ChatDataUtil.newMessage({
          text: `[${t('chats-main.Sticker')}]`,
          type: 'sticker',
          uploadPathList: [stickerImgUrl],
        }),
      ]);
      showStipopBottomSheet();
    });
    /* If you want to use double tap feature, change the plist file and implement this function. */
    stickerDoubleTapListener = nativeEventEmitter.addListener('onStickerDoubleTapped', (event) => {
      console.log('Double tapped');
      const stickerImgUrl = event.stickerImg;
      onSend([
        ChatDataUtil.newMessage({
          text: `[${t('chats-main.Sticker')}]`,
          type: 'sticker',
          uploadPathList: [stickerImgUrl],
        }),
      ]);
      showStipopBottomSheet();
    });
  };

  const tapListenerRemove = () => {
    if (stickerSingleTapListener != null) {
      // @ts-ignore
      stickerSingleTapListener.remove();
    }
    if (stickerDoubleTapListener != null) {
      // @ts-ignore
      stickerDoubleTapListener.remove();
    }
  };

  useEffect(() => {
    tapListenerInit();

    return () => {
      tapListenerRemove();
    };
  }, []);
  // end of Stipop Tap Listener

  // Stipop Picker View
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isStipopShowing, setIsStipopShowing] = useState(false);
  let keyboardDidShowListenerRef = useRef<any>();
  let keyboardDidHideListenerRef = useRef<any>();
  useEffect(() => {
    if (keyboardDidShowListenerRef.current && keyboardDidHideListenerRef.current) return;

    keyboardDidShowListenerRef.current = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    keyboardDidHideListenerRef.current = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      if (keyboardDidHideListenerRef.current != null) {
        keyboardDidHideListenerRef.current.remove();
      }
      if (keyboardDidShowListenerRef.current != null) {
        keyboardDidShowListenerRef.current.remove();
      }
    };
  }, [keyboardDidShowListenerRef.current, keyboardDidHideListenerRef.current]);
  // // end of Stipop Picker View

  const showStipopBottomSheet = useCallback(() => {
    switch (Platform.OS) {
      case 'android':
        StipopModule.show(isKeyboardVisible, isStipopShowing, (resultBool) => {
          setIsStipopShowing(!isStipopShowing);
        });
        break;

      case 'ios':
        StipopModule.show(isKeyboardVisible, isStipopShowing, (error, resultBool) => {
          setIsStipopShowing(!isStipopShowing);
        });
        break;
    }
  }, [StipopModule, isKeyboardVisible, isStipopShowing]);

  // // Stipop Connect User
  useEffect(() => {
    if (myUser) {
      StipopModule.connect(myUser.id.toString());
    }
  }, [StipopModule, myUser]);
  // // end of Stipop Connect User

  return (
    <>
      <MainLayout>
        <ChatRoomHeader
          roomState={roomState}
          messageDocs={messageDocs}
          setChatRoomMode={setChatRoomMode}
          isForward={isForward}
          setIsForward={setIsForward}
          setCheckedChatList={setCheckedChatList}
          setCount={setCount}
          chatRoomMode={chatRoomMode}
          setIsStipopShowing={setIsStipopShowing}
          isSystemAccount={isSystemAccount}
          isMe={roomState.type === 'me'}
          setSearchValue={(inputValue) => {
            LogUtil.info('inputValue', [inputValue]);
            setSearchValue(inputValue);
          }}
          isStipopShowing={isStipopShowing}
          showStipopBottomSheet={showStipopBottomSheet}
          StipopModule={StipopModule}
          isBlockUser={isBlockUser}
          targetUser={targetUser}
        />
        <TouchableWithoutFeedback
          onPress={() => {
            isStipopShowing && showStipopBottomSheet();

            Keyboard.dismiss();
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
            style={{ flex: 1 }}
          >
            <ImageBackground
              source={
                type === 'album'
                  ? { uri: background }
                  : type === 'image'
                  ? background && BACKGROUND[parseInt(background)]
                  : undefined
              }
              style={[
                { flex: 1 },
                type === 'color' && { backgroundColor: background },
                type === '0' && (themeContext.dark ? { backgroundColor: '#585858' } : { backgroundColor: '#f8f8f8' }),
              ]}
            >
              <MessageList
                messageListWithSystemMessages={messageListWithSystemMessages}
                searchedMessageIndex={searchedMessageIndex}
                searchedMessageList={searchedMessageList}
                messageIndexById={messageIndexById}
                unreadCountInfoByRoomId={chatStatus.unreadCountInfoByRoomId}
                room_id={room_id}
                count={count}
                setCount={setCount}
                roomState={roomState}
                isSystemAccount={isSystemAccount}
                dark={themeContext.dark}
                setParentMessageForReply={setParentMessageForReply}
                setIsForward={setIsForward}
                isForward={isForward}
                checkedChatList={checkedChatList}
                setShowPin={setShowPin}
                setChatRoomMode={setChatRoomMode}
                setCheckedChatList={setCheckedChatList}
                searchValue={searchValue}
                isStipopShowing={isStipopShowing}
                showStipopBottomSheet={showStipopBottomSheet}
              />
              <ChatRoomFooter
                isBlockUser={isBlockUser}
                roomState={roomState}
                setCount={setCount}
                setCheckedChatList={setCheckedChatList}
                input={input}
                setChatRoomMode={setChatRoomMode}
                chatRoomMode={chatRoomMode}
                isForward={isForward}
                onSend={onSend}
                setIsForward={setIsForward}
                parentMessage={parentMessage}
                setParentMessage={setParentMessage}
                checkedChatList={checkedChatList}
                count={count}
                searchValue={searchValue}
                selectedIndex={searchedMessageIndex}
                setSelectedIndex={setSearchedMessageIndex}
                searchedMessageList={searchedMessageList}
                isSystemAccount={isSystemAccount}
                dark={themeContext.dark}
                isStipopShowing={isStipopShowing}
                showStipopBottomSheet={showStipopBottomSheet}
              />
              {!isSystemAccount && isNotFriend && roomState.type === 'chat' && roomState.joined_users.length === 2 && (
                <NotExistFriend dark={themeContext.dark}>
                  <IconTextButton onPress={addFriend}>
                    <Add />
                    <ButtonLabel fontSize={myUser?.setting.ct_text_size as number}>
                      {t('chat-room.Add friend')}
                    </ButtonLabel>
                  </IconTextButton>
                  <IconTextButton onPress={block}>
                    <Block />
                    <ButtonLabel fontSize={myUser?.setting.ct_text_size as number}>
                      {userData?.block ? 'Unblock' : t('chat-room.Block')}
                    </ButtonLabel>
                  </IconTextButton>
                  <IconTextButton onPress={exit}>
                    <Exit />
                    <ButtonLabel fontSize={myUser?.setting.ct_text_size as number}>{t('chat-room.Exit')}</ButtonLabel>
                  </IconTextButton>
                </NotExistFriend>
              )}
              {!isSystemAccount && showPin && (
                <PinContainer show={isBigPinMessage}>
                  <Row style={{ flex: 1 }}>
                    <PinWrap>{themeContext.dark ? <PinW /> : <Pin />}</PinWrap>
                    <Column style={{ flex: 1, paddingTop: 8 }}>
                      <PinText numberOfLines={isBigPinMessage ? 4 : 2}>{fixed_msg?.content}</PinText>
                      <IDText>
                        {fixed_msg?.user?.first_name ?? ''} {fixed_msg?.user?.last_name ?? ''} Post
                      </IDText>
                    </Column>
                    <ArrowWrap onPress={() => setIsBigPin(!isBigPinMessage)}>
                      {isBigPinMessage ? (
                        themeContext.dark ? (
                          <ArrowUpW />
                        ) : (
                          <ArrowUp />
                        )
                      ) : themeContext.dark ? (
                        <ArrowDownW />
                      ) : (
                        <ArrowDown />
                      )}
                    </ArrowWrap>
                  </Row>
                  {isBigPinMessage && (
                    <DontShowButton
                      onPress={async () => {
                        LogUtil.info('room_id', room_id);
                        setShowPin(false);
                        await post(`chats/rooms/${room_id}/read-pin`, {})
                          .then((result) => {
                            console.log(result);
                          })
                          .catch((e) => {
                            LogUtil.info(JSON.stringify(e));
                          });
                      }}
                    >
                      <DontShowLabel>{t('chat-room.Dont Show')}</DontShowLabel>
                    </DontShowButton>
                  )}
                </PinContainer>
              )}
            </ImageBackground>
            {chatRoomMode === 'plusMenu' && <PlusMenu roomState={roomState} dark={themeContext.dark} onSend={onSend} />}
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </MainLayout>

      <SafeAreaView
        style={[{ flex: 0 }, themeContext.dark ? { backgroundColor: '#30302E' } : { backgroundColor: '#ffffff' }]}
      />
      <Toast config={ToastConfig} />
    </>
  );
};

export default ChatRoom;

export const IconImage = styled.Image<{ themeColor: boolean }>`
  width: 16px;
  height: 16px;
  tint-color: ${(props) => (props.themeColor && props.theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
