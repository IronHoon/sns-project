import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import { Row } from 'components/layouts/Row';
import { Column } from 'components/layouts/Column';
import Tail from 'assets/tail.svg';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageStyle,
  Keyboard,
  Linking,
  Platform,
  Pressable,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView, RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Reply from 'assets/chats/ic-reply.svg';
import { Menu, MenuItem } from 'react-native-material-menu';
import Clipboard from '@react-native-clipboard/clipboard';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import ChatBubbleReply from './ChatBubbleReply';
import ChatSocketUtil from 'utils/chats/ChatSocketUtil';
import AuthUtil from 'utils/AuthUtil';
import Lightbox from 'react-native-lightbox-v2';
import DateUtil from 'utils/DateUtil';
import FastImage from 'react-native-fast-image';
import useConfirm from '../../../hooks/useConfirm';
import LogUtil from 'utils/LogUtil';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { useTranslation } from 'react-i18next';
import Message from 'types/chats/rooms/messages/Message';
import { Checkbox } from '../../../components/atoms/input/Checkbox';
import { useSetAtom } from 'jotai';
import showCallViewAtom from 'stores/showCallViewAtom';
import profileDetailUidAtom from 'stores/profileDetailUidAtom';
import { useAtomValue } from 'jotai';
import friendListAtom from '../../../stores/friendListAtom';
import userAtom from '../../../stores/userAtom';
import Space from '../../../components/utils/Space';
import TimeStampBubble from './chatbubble/TimeStampBubble';
import ProfileImageBubble from './chatbubble/ProfileImageBubble';
import VideoBubble from './chatbubble/VideoBubble';
import ImageBubble from './chatbubble/ImageBubble';
import StickerBubble from './chatbubble/StickerBubble';
import MultiBubble from './chatbubble/MultiBubble';
import TextBubble from './chatbubble/TextBubble';
import RecordBubble from './RecordBubble';
import Voice from '../../../assets/chats/call/ic_call.svg';
import Video from '../../../assets/chats/call/ic_video.svg';
import FileBubble from './chatbubble/FileBubble';
import LoginBubble from './chatbubble/LoginBubble';
import LoginNotiBubble from './chatbubble/LoginNotiBubble';
import ContactBubble from './chatbubble/ContactBubble';
import LocationBubble from './chatbubble/LocationBubble';
import { LinkPreview } from '@flyerhq/react-native-link-preview';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import ProfileBubble from './chatbubble/ProfileBubble';

const ProfilesImageBox = styled.View`
  width: 30px;
  height: 30px;
  border-radius: 70px;
  overflow: hidden;
  margin-left: 12px;
  margin-right: 8px;
`;
const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const NameText = styled.Text`
  font-size: 12px;
  font-weight: 500;
  color: ${COLOR.BLACK};
  margin-bottom: 3px;
  margin-left: 5px;
`;

const ImgsContainer = styled(Lightbox)`
  margin: 1px;
`;
const Img = styled(FastImage)<{ open: boolean }>`
  width: 100%;
  height: 100%;
  /* aspect-ratio: 1; */
  border-radius: ${({ open }) => (open ? '0px' : '11px')};
`;

const renderRightActions = (progress, dragX) => {
  const trans = dragX.interpolate({
    inputRange: [0, 50, 100, 101],
    outputRange: [15, 0, 0, 1],
  });
  return (
    <RectButton
      style={{
        // flex: 1,
        width: 50,
        justifyContent: 'flex-end',
      }}
    >
      <Animated.View
        style={[
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <Reply />
      </Animated.View>
    </RectButton>
  );
};

type ChatBubbleProps = {
  roomType;
  dark;
  room_id: string;
  setParentMessageForReply;
  originalMessage: Message;
  setForward: Dispatch<SetStateAction<boolean>>;
  isForward: boolean;
  checkedChatList?: Message[];
  setCheckedChatList?: (chatList: Message[]) => void;
  count?: number;
  setCount?: (count) => void;
  setShowPin: Dispatch<SetStateAction<boolean>>;
  room;
  isSearched: boolean;
  searchValue: string;
  isSystemAccount?: boolean;
  isStipopShowing;
  showStipopBottomSheet;
  unreadCount: number | null;
  setChatRoomMode: () => void;
};

const ChatBubble = function ({
  roomType,
  dark,
  room_id,
  setParentMessageForReply,
  originalMessage,
  setForward,
  isForward,
  setShowPin,
  checkedChatList,
  setCheckedChatList,
  count = 0,
  setCount,
  room,
  isSearched,
  searchValue,
  isSystemAccount,
  isStipopShowing,
  showStipopBottomSheet,
  unreadCount,
  setChatRoomMode,
}: ChatBubbleProps) {
  const showCallView = useSetAtom(showCallViewAtom);
  const { t } = useTranslation();
  const navigation = useNavigation<MainNavigationProp>();
  const bubbleRef = useRef();
  const messageText = originalMessage?.i18n_content
    ? t(originalMessage.i18n_content.key, originalMessage.i18n_content.data)
    : originalMessage.content;
  const messageType = originalMessage?.type;
  const upload_urls = originalMessage?.url;
  const upload_urls_size = originalMessage?.url_size;
  const contactName = originalMessage?.contactName;
  const contactNumber = originalMessage?.contactNumber;
  const isWithIn24Hours =
    originalMessage?.createdAt && DateUtil.subtractHour(originalMessage?.createdAt, new Date()) < 24;
  const isMe = originalMessage?.user?.id === AuthUtil.getUserId();
  const isDeletedUser = !isMe && originalMessage.user.uid.split('_').pop() === `deleted${originalMessage.user.id}`;
  const userName = `${originalMessage?.user?.first_name ?? ''} ${originalMessage?.user?.last_name ?? ''}`;

  const [profileImage, setProfileImage] = useState();
  const setCurrentProfileUid = useSetAtom(profileDetailUidAtom);

  const [visible, setVisible] = useState<boolean>(false);
  const [locationX, setLocationX] = useState(0);
  const [locationY, setLocationY] = useState(0);
  const [isLightbox, setIsLightbox] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);
  const myUser = useAtomValue(userAtom);
  const addedMeList = useAtomValue(friendListAtom);

  const confirm = useConfirm();

  const isPrivacy = (data) => {
    if (data.sc_profile_photo === 'public' || (data.sc_profile_photo === 'friends' && addedMeList?.includes(data.id))) {
      return false;
    } else {
      return true;
    }
  };

  const hideMenu = () => setVisible(false);
  const showMenu = () => {
    console.log('y좌표', locationY);
    isStipopShowing && showStipopBottomSheet();
    !isSystemAccount && setVisible(true);
  };

  // LogUtil.info('ChatBubble content, unreadCount', [messageText, unreadCount]);

  // useEffect(() => {
  //   const isFriend = friendList?.filter((item) => item === originalMessage.user.id).length === 1;
  //   if (!isMe) {
  //     if (originalMessage.user.sc_profile_photo === 'friends' && isFriend) {
  //       if (
  //         originalMessage.user.profile_image === null ||
  //         originalMessage.user.profile_image === 'private' ||
  //         originalMessage.user.profile_image === ''
  //       ) {
  //         setProfileImage(require('assets/img-profile.png'));
  //       } else if (originalMessage.user.profile_image) {
  //         //@ts-ignore
  //         setProfileImage({ uri: originalMessage.user.profile_image });
  //       }
  //     } else if (originalMessage.user.sc_profile_photo === 'public') {
  //       if (
  //         originalMessage.user.profile_image === null ||
  //         originalMessage.user.profile_image === 'private' ||
  //         originalMessage.user.profile_image === ''
  //       ) {
  //         setProfileImage(require('assets/img-profile.png'));
  //       } else if (originalMessage.user.profile_image) {
  //         //@ts-ignore
  //         setProfileImage({ uri: originalMessage.user.profile_image });
  //       }
  //     } else {
  //       setProfileImage(require('assets/img-profile.png'));
  //     }
  //   } else {
  //     if (originalMessage.user?.profile_image) {
  //       //@ts-ignore
  //       setProfileImage({ uri: originalMessage.user?.profile_image });
  //     } else {
  //       setProfileImage(require('assets/img-profile.png'));
  //     }
  //   }
  // }, [originalMessage.user.sc_profile_photo]);

  const socketPrefix = '채팅중';

  const onPinMessage = useCallback(() => {
    hideMenu();
    originalMessage && ChatSocketUtil.instance.emitPin(socketPrefix, room_id, originalMessage._id);
    setShowPin(true);
  }, [originalMessage, ChatSocketUtil.instance, room_id, setShowPin]);

  const onSaveMessage = useCallback(() => {
    hideMenu();
    if (originalMessage) {
      const chatSocketUtil = ChatSocketUtil.instance;
      const chatStatus = chatSocketUtil.chatStatus;
      ChatHttpUtil.requestSaveMessage(room_id, originalMessage);
      originalMessage.is_saved = !originalMessage.is_saved;

      chatStatus.messageDocsByRoomId = chatStatus.messageDocsByRoomId;
      chatSocketUtil.forceUpdateForChatStatus();
    }
  }, [originalMessage, room_id, ChatSocketUtil.instance]);

  const onSaveMedia = useCallback(() => {
    hideMenu();
    originalMessage?.url.map((uri) => CameraRoll.save(uri, { type: 'photo' }));
  }, [originalMessage, room_id, ChatSocketUtil.instance]);

  const onForwardMessage = () => {
    hideMenu();
    setForward(!isForward);
  };
  const onCopyMessage = useCallback(() => {
    hideMenu();
    Clipboard.setString(messageText);
  }, [messageText]);
  const onReplyMessage = useCallback(() => {
    hideMenu();
    setParentMessageForReply(originalMessage);
  }, [originalMessage, setParentMessageForReply]);

  const setLocation = (x1, y1, _lx) => {
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const menuWidth = 200;
    const menuHeight = 280;

    const x2 = x1 + menuWidth;
    const y2 = y1 + menuHeight;

    // LogUtil.info("setLocation x1,x2,y1,y2,windowWidth,windowHeight", [x1, x2, y1, y2, windowWidth, windowHeight]);
    if (windowWidth < x2) {
      setLocationX(windowWidth - menuWidth);
    } else {
      setLocationX(x1);
    }

    setLocationY(y1);
  };

  useFocusEffect(
    useCallback(() => {
      if (!count) {
        setChecked(false);
      }
    }, [count]),
  );

  const handleChecked = () => {
    const callLocalChecked = (isCheck: boolean) => {
      setChecked(isCheck);
      setCount && setCount(count + (isCheck ? 1 : -1));
    };

    if (checked) {
      callLocalChecked(!checked);
      if (checkedChatList && setCheckedChatList) {
        checkedChatList.splice(checkedChatList.indexOf(originalMessage), 1);
        setCheckedChatList(checkedChatList);
      }
    } else {
      callLocalChecked(!checked);
      if (checkedChatList && setCheckedChatList) {
        setCheckedChatList([...checkedChatList, originalMessage]);
      }
    }
  };

  const onPressVideoBubble = useCallback(
    (videoUri) => {
      LogUtil.info('onPressVideoBubble');
      navigation.navigate('/chats/chat-room/video-player', { uri: videoUri });
    },
    [navigation],
  );

  const onPressLocationBubble = useCallback(
    (formattedAddress, latitude, longitude) => {
      LogUtil.info('onPressLocationBubble');
      navigation.navigate('/chats/chat-room/view-map', { locationInfo: { formattedAddress, latitude, longitude } });
    },
    [navigation],
  );

  // @ts-ignore
  // @ts-ignore
  return (
    <Menu
      style={
        Platform.OS === 'ios' && locationY < Dimensions.get('window').height / 2
          ? { position: 'absolute', left: locationX, top: locationY }
          : { position: 'absolute', left: locationX }
      }
      visible={visible}
      onRequestClose={hideMenu}
      anchor={
        <GestureHandlerRootView
          onTouchStart={(e) => {
            //@ts-ignore
            setChatRoomMode('normal');
            if (!visible) {
              LogUtil.info('event Y ', e.nativeEvent.pageY);
              setLocation(e.nativeEvent.pageX, e.nativeEvent.pageY, e.nativeEvent.locationX);
            }
          }}
        >
          <Row align={'center'} style={{ flex: 1, marginVertical: 5 }}>
            {isForward && (
              <>
                {messageType !== 'voice_talk' && messageType !== 'face_talk' ? (
                  <View style={{ marginRight: 5, marginLeft: 20 }}>
                    <Checkbox checked={checked} handleChecked={handleChecked} round={false} />
                  </View>
                ) : (
                  <>
                    <Space width={47} height={22}></Space>
                  </>
                )}
              </>
            )}

            <Column align={isMe ? 'flex-end' : 'flex-start'} style={{ flex: 10 }}>
              <Row align="flex-end">
                {!isMe && (
                  <ProfileImageBubble
                    isSystemAccount={isSystemAccount}
                    setCurrentProfileUid={setCurrentProfileUid}
                    uid={originalMessage?.user.uid}
                    profileImage={
                      isDeletedUser || isPrivacy(originalMessage?.user) ? null : originalMessage?.user.profile_image
                    }
                  />
                )}
                {isMe && (
                  <TimeStampBubble isMe={isMe} unreadCount={unreadCount} createdAt={originalMessage.createdAt} />
                )}
                <Column>
                  {!isMe && roomType === 'group' && (
                    // @ts-ignore
                    <NameText>{isDeletedUser ? 'Deleted Account' : userName}</NameText>
                  )}
                  {messageType === 'image' && (
                    <ImageBubble
                      isMe={isMe}
                      selectedItem={originalMessage}
                      room={room}
                      upload_urls={upload_urls}
                      showMenu={showMenu}
                      isLightbox={isLightbox}
                      userName={userName}
                    />
                  )}
                  {messageType === 'sticker' && upload_urls?.[0] && <StickerBubble upload_urls={upload_urls} />}
                  {messageType === 'video' && upload_urls?.[0] && upload_urls?.[1] && (
                    <VideoBubble
                      upload_urls={upload_urls}
                      onPressVideoBubble={onPressVideoBubble}
                      showMenu={showMenu}
                    />
                  )}
                  {messageType === 'profile' && (
                    <ProfileBubble uid={messageText} isMe={isMe} dark={dark} roomType={roomType} showMenu={showMenu} />
                  )}
                  {(messageType === 'chat' ||
                    messageType === 'file' ||
                    messageType === 'voice_talk' ||
                    messageType === 'face_talk' ||
                    messageType === 'record' ||
                    messageType === 'contact' ||
                    messageType === 'location' ||
                    messageType === 'login' ||
                    messageType === 'loginNoti') && (
                    <MultiBubble
                      upload_urls={upload_urls}
                      showMenu={showMenu}
                      onPressLocationBubble={onPressLocationBubble}
                      contactNumber={contactNumber}
                      isMe={isMe}
                      searchValue={searchValue}
                      showCallView={showCallView}
                      dark={dark}
                      contactName={contactName}
                      upload_urls_size={upload_urls_size}
                      isSearched={isSearched}
                      messageText={messageText}
                      messageType={messageType}
                      originalMessage={originalMessage}
                      room={room}
                      roomType={roomType}
                      t={t}
                      myUser={myUser}
                    />
                  )}
                </Column>
                {!isMe && (
                  <TimeStampBubble isMe={isMe} unreadCount={unreadCount} createdAt={originalMessage.createdAt} />
                )}
              </Row>
            </Column>
          </Row>
        </GestureHandlerRootView>
      }
    >
      <MenuItem
        style={{ height: 50, width: 200 }}
        textStyle={{ color: COLOR.BLACK }}
        onPress={onSaveMessage}
        pressColor={'#fcf2e8'}
      >
        {originalMessage?.is_saved ? t('chats-main.Unsave message') : t('chats-main.Save message')}
      </MenuItem>
      {originalMessage.type === 'image' && (
        <MenuItem
          style={{ height: 50, width: 200 }}
          textStyle={{ color: COLOR.BLACK }}
          onPress={onSaveMedia}
          pressColor={'#fcf2e8'}
        >
          {t('chats-main.Save media')}
        </MenuItem>
      )}
      <MenuItem
        style={{ height: 50, width: 200 }}
        textStyle={{ color: COLOR.BLACK }}
        onPress={onReplyMessage}
        pressColor={'#fcf2e8'}
      >
        {t('chats-main.Reply')}
      </MenuItem>
      <MenuItem
        style={{ height: 50, width: 200 }}
        textStyle={{ color: COLOR.BLACK }}
        onPress={onForwardMessage}
        pressColor={'#fcf2e8'}
      >
        {t('chats-main.Forward')}
      </MenuItem>
      <MenuItem
        style={{ height: 50, width: 200 }}
        textStyle={{ color: COLOR.BLACK }}
        onPress={onCopyMessage}
        pressColor={'#fcf2e8'}
      >
        {t('chats-main.Copy')}
      </MenuItem>
      <MenuItem
        style={{ height: 50, width: 200 }}
        textStyle={{ color: COLOR.BLACK }}
        onPress={onPinMessage}
        pressColor={'#fcf2e8'}
      >
        {t('chats-main.Pin')}
      </MenuItem>
      {isWithIn24Hours && (
        <MenuItem
          style={{ height: 50, width: 200 }}
          textStyle={{ color: COLOR.BLACK }}
          onPress={() => {
            hideMenu();
            confirm({
              title: t('chats-main.Are you sure you want to delete this message?'),
              description: t('chats-main.You can delete messages in 24 hours only'),
              ok: () => {
                originalMessage &&
                  ChatSocketUtil.instance.emitDeleteMessage(socketPrefix, room_id, originalMessage?._id, 'me');
              },
            });
          }}
          pressColor={'#fcf2e8'}
        >
          {t('chats-main.Delete for me')}
        </MenuItem>
      )}
      {isMe && isWithIn24Hours && (
        <MenuItem
          style={{ height: 50, width: 200 }}
          textStyle={{ color: COLOR.BLACK }}
          onPress={() => {
            hideMenu();
            confirm({
              title: t('chats-main.Are you sure you want to delete this message?'),
              description: t(
                'chats-main.If you delete both friends and me, the chat history will be deleted for you and all your friends',
              ),
              ok: () => {
                originalMessage &&
                  ChatSocketUtil.instance.emitDeleteMessage(socketPrefix, room_id, originalMessage?._id, 'all');
              },
            });
          }}
          pressColor={'#fcf2e8'}
        >
          {t('chats-main.Delete for everyone')}
        </MenuItem>
      )}
    </Menu>
  );
};

export default React.memo(ChatBubble);
