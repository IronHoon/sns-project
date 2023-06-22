import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled, { ThemeContext } from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import { Pressable, View } from 'react-native';
import { Row } from 'components/layouts/Row';
import { Column } from 'components/layouts/Column';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import Pin from 'assets/chats/ic-pin.svg';
import { Checkbox } from 'components/atoms/input/Checkbox';
import Room from 'types/chats/rooms/Room';
import { useAtomValue } from 'jotai';
import userAtom from '../../../stores/userAtom';
import { t } from 'i18next';
import ChatDataUtil from 'utils/chats/ChatDataUtil';
import { useFetchWithType } from '../../../net/useFetch';
import User from '../../../types/auth/User';
import Toast from 'react-native-toast-message';
import DateUtil from 'utils/DateUtil';
import friendListAtom from '../../../stores/friendListAtom';

const MyChatContainer = styled.View`
  background-color: ${(props) => (props.theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  margin: auto 5px auto 0;
`;
const MyChat = styled.Text`
  color: ${(props) => (props.theme.dark ? COLOR.BLACK : COLOR.WHITE)};
  padding: 3px;
  padding-left: 5px;
  padding-right: 5px;
  font-size: 10px;
  font-weight: 500;
`;
const Time = styled.Text<{ fontSize: number }>`
  color: ${COLOR.POINT_GRAY};
  font-size: ${({ fontSize }) => fontSize - 3};
`;
const Badge = styled.View`
  background-color: #15979e;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
`;
const BadgeCount = styled.Text`
  color: #ffffff;
  padding: 3px;
  padding-left: 7px;
  padding-right: 7px;
  font-size: 11px;
  font-weight: bold;
`;
const Count = styled.Text`
  color: ${COLOR.PRIMARY};
  font-weight: bold;
  margin-left: 5px;
`;
const ProfileImageBox = styled.View`
  width: 46px;
  height: 46px;
  border-radius: 70px;
  overflow: hidden;
  margin-right: 15px;
  margin-left: 5px;
`;
const ProfilesImageBox = styled.View`
  width: 22px;
  height: 22px;
  border-radius: 70px;
  overflow: hidden;
  margin: 2px;
`;
const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`;
const NameText = styled.Text`
  color: ${(props) => (props.theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 5px;
  max-width: 85%;
`;
const ChatMessage = styled.Text<{ fontSize: number }>`
  color: #999999;
  font-size: ${({ fontSize }) => fontSize - 2};
  width: 90%;
`;

interface ChatListItemProps {
  room: Room;
  rowMap?: any;
  setOpenId?: (id) => void;
  onClose?: () => void;
  isEdit?: boolean;
  count?: number;
  setCount?: (count) => void;
  isDeselect?: boolean;
  checkedRoomList?: Room[];
  setCheckedRoomList?: (roomList: Room[]) => void;
  closeSwipe?: boolean;
}
function ChatListItem({
  room,
  rowMap,
  setOpenId,
  closeSwipe,
  onClose,
  isEdit = false,
  count = 0,
  setCount,
  isDeselect,
  checkedRoomList,
  setCheckedRoomList,
}: ChatListItemProps) {
  const navigation = useNavigation<MainNavigationProp>();
  const themeContext = useContext(ThemeContext);
  const [checked, setChecked] = useState<boolean>(false);
  const [isPress, setIsPress] = useState<boolean>(false);
  const me = useAtomValue(userAtom);
  const preview_message = useMemo(() => ChatDataUtil.simpleMessageVer(room), [room]);
  const userSetting = room.user_settings.filter((user) => user.user_id === me?.id);
  const targetUser = useMemo(() => room?.joined_users?.filter((user) => user.id !== me?.id)?.[0], [room]);

  const createdAt = DateUtil.getDateTimeForChatList(room.preview_message?.createdAt);
  const unreadCount = createdAt ? room.unread_count ?? 0 : 0;
  const { data: userData } = useFetchWithType<User>(targetUser?.uid ? `/auth/users/detail?uid=${targetUser?.uid}` : '');

  const friendList = useAtomValue(friendListAtom);
  const isMe = room?.joined_users?.filter((user) => user.id !== me?.id).length === 0;

  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [profileImage, setProfileImage] = useState();

  useFocusEffect(
    useCallback(() => {
      if (targetUser) {
        setIsFriend(friendList?.filter((item) => item === targetUser.id).length === 1);
        if (targetUser.sc_profile_photo === 'friends' && isFriend) {
          if (
            targetUser.profile_image === null ||
            targetUser.profile_image === 'private' ||
            targetUser.profile_image === ''
          ) {
            setProfileImage(require('assets/img-profile.png'));
          } else if (targetUser.profile_image) {
            //@ts-ignore
            setProfileImage({ uri: targetUser.profile_image + '?w=200&h=200' });
          }
        } else if (targetUser.sc_profile_photo === 'public') {
          if (
            isDeletedUser ||
            targetUser.profile_image === null ||
            targetUser.profile_image === 'private' ||
            targetUser.profile_image === ''
          ) {
            setProfileImage(require('assets/img-profile.png'));
          } else if (targetUser.profile_image) {
            //@ts-ignore
            setProfileImage({ uri: targetUser.profile_image + '?w=200&h=200' });
          }
        } else {
          setProfileImage(require('assets/img-profile.png'));
        }
      } else if (isMe) {
        if (me?.profile_image) {
          //@ts-ignore
          setProfileImage({ uri: me?.profile_image + '?w=200&h=200' });
        } else {
          setProfileImage(require('assets/img-profile.png'));
        }
      }
    }, [targetUser]),
  );

  const handleChecked = () => {
    const callLocalChecked = (isCheck: boolean) => {
      setChecked(isCheck);
      setCount && setCount(count + (isCheck ? 1 : -1));
    };

    if (checked) {
      callLocalChecked(!checked);
      if (checkedRoomList && setCheckedRoomList) {
        checkedRoomList.splice(checkedRoomList.indexOf(room), 1);
        setCheckedRoomList(checkedRoomList);
      }
    } else {
      if (count > 9) {
        Toast.show({
          text1: "You can't forward the message\nmore than 10 friends at once.",
        });
      } else {
        callLocalChecked(!checked);
        if (checkedRoomList && setCheckedRoomList) {
          setCheckedRoomList([...checkedRoomList, room]);
        }
      }
    }
  };

  const usersWithoutMe = useMemo(() => {
    return room.joined_users.filter((user) => user.id !== me?.id);
  }, [me?.id, room.joined_users]);

  const isDeletedUser =
    room?.joined_users?.length === 2 && usersWithoutMe[0].uid.split('_').pop() === `deleted${usersWithoutMe[0].id}`;

  useEffect(() => {
    if (!isEdit) {
      setChecked(false);
    }
  }, [isEdit]);

  useEffect(() => {
    setChecked(false);
  }, [isDeselect]);

  useEffect(() => {
    if (onClose) onClose();
  }, [closeSwipe]);

  const defaultImage = (i: any) => {
    if (room.joined_users?.[i]) {
      const isFriend = friendList?.filter((item) => item === room.joined_users?.[i].id).length === 1;
      if (room.joined_users?.[i].sc_profile_photo === 'friends' && isFriend) {
        if (room.joined_users?.[i].profile_image === null || room.joined_users?.[i].profile_image === 'private') {
          return require('assets/chats/img_profile.png');
        } else {
          return { uri: room.joined_users[i].profile_image + '?w=200&h=200' };
        }
      } else if (room.joined_users?.[i].sc_profile_photo === 'public') {
        if (room.joined_users?.[i].profile_image === null || room.joined_users?.[i].profile_image === 'private') {
          return require('assets/chats/img_profile.png');
        } else {
          return { uri: room.joined_users[i].profile_image + '?w=200&h=200' };
        }
      } else {
        return require('assets/chats/img_profile.png');
      }
    } else {
      return undefined;
    }
  };

  const profileIndex = useMemo(() => {
    if (usersWithoutMe.length === 1) {
      //  if(room.joined_users)
      return room.joined_users.findIndex((user) => user.id !== me?.id);
    } else {
      return 0;
    }
  }, [room]);

  return (
    <>
      {isEdit ? (
        <Pressable style={{ backgroundColor: themeContext.dark ? '#585858' : '#ffffff' }} onPress={handleChecked}>
          <Row
            style={[
              { alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16 },
              checked && (themeContext.dark ? { backgroundColor: '#88808f' } : { backgroundColor: '#fcf2e8' }),
            ]}
          >
            <View style={{ marginRight: 15, marginLeft: 5 }}>
              <Checkbox checked={checked} handleChecked={handleChecked} round={true} />
            </View>
            {usersWithoutMe.length > 1 ? (
              <Column style={{ paddingRight: 11 }}>
                <Row style={{ marginBottom: 5 }}>
                  <ProfilesImageBox style={{ marginRight: 5 }}>
                    <ProfileImage source={defaultImage(0)} />
                  </ProfilesImageBox>
                  <ProfilesImageBox>
                    <ProfileImage source={defaultImage(1)} />
                  </ProfilesImageBox>
                </Row>
                <Row>
                  <ProfilesImageBox style={{ marginRight: 5 }}>
                    <ProfileImage source={defaultImage(2)} />
                  </ProfilesImageBox>
                  <ProfilesImageBox>
                    <ProfileImage source={defaultImage(3)} />
                  </ProfilesImageBox>
                </Row>
              </Column>
            ) : (
              <ProfileImageBox>
                <ProfileImage
                  //@ts-ignore
                  source={profileImage}
                />
              </ProfileImageBox>
            )}
            <Column style={{ flex: 1 }}>
              <Row>
                {room.type === 'me' && (
                  <MyChatContainer>
                    <MyChat>ME</MyChat>
                  </MyChatContainer>
                )}
                <NameText numberOfLines={1} style={{ fontSize: me?.setting.ct_text_size }}>
                  {isDeletedUser
                    ? 'Deleted Account'
                    : usersWithoutMe.length === 0
                    ? `${me?.first_name} ${me?.last_name} `
                    : room.type === 'group'
                    ? room.name
                    : `${usersWithoutMe[0]?.first_name} ${usersWithoutMe[0]?.last_name} `}
                </NameText>
                {usersWithoutMe.length > 1 && (
                  <Count style={{ fontSize: me?.setting.ct_text_size }}>{room.joined_users.length}</Count>
                )}
                {userSetting[0]?.is_fixed && <Pin height={17} width={17} style={{ marginLeft: 5 }} />}
              </Row>
              <ChatMessage numberOfLines={2} fontSize={me?.setting.ct_text_size as number}>
                {room.preview_message?.type === 'file' ? `[${t('chats-main.File')} ]` : preview_message}
              </ChatMessage>
            </Column>
            <Column style={{ width: 74, alignItems: 'flex-end' }}>
              <Time fontSize={me?.setting.ct_text_size}>{createdAt}</Time>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                {unreadCount !== 0 && (
                  <Row style={{ width: '100%' }}>
                    <View style={{ flex: 1 }} />
                    <Badge>
                      <BadgeCount>{unreadCount > 999 ? '999+' : unreadCount}</BadgeCount>
                    </Badge>
                  </Row>
                )}
              </View>
            </Column>
          </Row>
        </Pressable>
      ) : (
        <Pressable
          style={[
            themeContext.dark ? { backgroundColor: '#585858' } : { backgroundColor: '#ffffff' },
            isPress && (themeContext.dark ? { backgroundColor: '#88808f' } : { backgroundColor: '#fcf2e8' }),
          ]}
          onTouchEnd={() => {
            setOpenId && setOpenId(room._id);
          }}
          onTouchStart={() => {
            setIsPress(true);
            setTimeout(() => {
              setIsPress(false);
            }, 500);
          }}
          onPress={() => {
            navigation.navigate('/chats/chat-room', { room: room });
          }}
        >
          <Row
            style={[
              { alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16 },
              checked && (themeContext.dark ? { backgroundColor: '#88808f' } : { backgroundColor: '#fcf2e8' }),
            ]}
          >
            {usersWithoutMe.length > 1 ? (
              <Column style={{ paddingRight: 11 }}>
                <Row style={{ marginBottom: 5 }}>
                  <ProfilesImageBox style={{ marginRight: 5 }}>
                    <ProfileImage source={defaultImage(0)} />
                  </ProfilesImageBox>
                  <ProfilesImageBox>
                    <ProfileImage source={defaultImage(1)} />
                  </ProfilesImageBox>
                </Row>
                <Row>
                  <ProfilesImageBox style={{ marginRight: 5 }}>
                    <ProfileImage source={defaultImage(2)} />
                  </ProfilesImageBox>
                  <ProfilesImageBox>
                    <ProfileImage source={defaultImage(3)} />
                  </ProfilesImageBox>
                </Row>
              </Column>
            ) : (
              <ProfileImageBox>
                <ProfileImage
                  //@ts-ignore
                  source={profileImage}
                />
              </ProfileImageBox>
            )}
            <Column style={{ flex: 1 }}>
              <Row>
                {room.type === 'me' && (
                  <MyChatContainer>
                    <MyChat>ME</MyChat>
                  </MyChatContainer>
                )}
                <NameText numberOfLines={1} style={{ fontSize: me?.setting.ct_text_size }}>
                  {isDeletedUser
                    ? 'Deleted Account'
                    : usersWithoutMe.length === 0
                    ? `${me?.first_name} ${me?.last_name} `
                    : room.type === 'group'
                    ? room.name
                    : `${usersWithoutMe[0]?.first_name} ${usersWithoutMe[0]?.last_name} `}
                </NameText>
                {room.type === 'group' && (
                  <Count style={{ fontSize: me?.setting.ct_text_size }}>{room.joined_users.length}</Count>
                )}
                {userSetting[0]?.is_fixed && <Pin height={17} width={17} style={{ marginLeft: 5 }} />}
              </Row>
              <ChatMessage numberOfLines={2} fontSize={me?.setting.ct_text_size as number}>
                {room.preview_message?.type === 'file' ? `[ ${t('chats-main.File')} ]` : preview_message}
              </ChatMessage>
            </Column>
            <Column style={{ width: 74, alignItems: 'flex-end' }}>
              <Time fontSize={me?.setting.ct_text_size}>{createdAt}</Time>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                {unreadCount !== 0 && !userData?.block && (
                  <Row style={{ width: '100%' }}>
                    <View style={{ flex: 1 }} />
                    <Badge>
                      <BadgeCount>{unreadCount > 999 ? '999+' : unreadCount}</BadgeCount>
                    </Badge>
                  </Row>
                )}
              </View>
            </Column>
          </Row>
        </Pressable>
      )}
    </>
  );
}

export default ChatListItem;
