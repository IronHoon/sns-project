import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import BackHeader from '../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import CloseHeader from 'components/molecules/CloseHeader';
import ChatListItem from './components/ChatListItem';
import styled, { ThemeContext } from 'styled-components/native';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { Row } from 'components/layouts/Row';
import { Checkbox } from 'components/atoms/input/Checkbox';
import { Column } from 'components/layouts/Column';
import { COLOR } from 'constants/COLOR';
import { ModalBase, ModalTitle } from 'components/modal';
import Room, { OnRoomsType, roomSort } from 'types/chats/rooms/Room';
import LogUtil from 'utils/LogUtil';
import { useFocusEffect } from '@react-navigation/native';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import { t } from 'i18next';
import CopyUtil from 'utils/CopyUtil';
import useSocket from 'hooks/useSocket';
import { useAtom, useAtomValue } from 'jotai';
import chatStatusAtom from 'stores/chatStatusAtom';
import friendListAtom from '../../stores/friendListAtom';
import userAtom from '../../stores/userAtom';
import DateUtil from 'utils/DateUtil';

const ChatContainer = styled.ScrollView`
  flex: 1;
`;
const ButtonLabel = styled.Text`
  color: #999999;
`;
const Count = styled.Text`
  color: ${COLOR.PRIMARY};
  font-weight: bold;
`;
const SelectButtonLabel = styled.Text`
  color: #999999;
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
`;
const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`;
const NameText = styled.Text`
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 5px;
  width: 85%;
`;
const ChatText = styled.Text`
  color: #999999;
  font-size: 13px;
  width: 90%;
`;
const Time = styled.Text`
  color: ${COLOR.POINT_GRAY};
  font-size: 12px;
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
const CancelButton = styled.TouchableOpacity`
  background-color: #fff;
  width: 100px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: #ccc;
`;
const CancelLabel = styled.Text`
  color: #ccc;
  font-size: 13px;
  font-weight: 500;
`;
const DeleteButton = styled.TouchableOpacity`
  background-color: ${COLOR.PRIMARY};
  width: 100px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${COLOR.PRIMARY};
`;
const DeleteLabel = styled.Text`
  color: #fff;
  font-size: 13px;
  font-weight: 500;
`;
const Footer = styled.View`
  height: 55px;
  justify-content: center;
  align-items: flex-end;
  background-color: ${({ theme }) => (theme.dark ? '#585858' : '#ffffff')};
`;
const FooterButton = styled.TouchableOpacity`
  padding: 15px;
  width: 50%;
  align-items: center;
`;
const FooterButtonLabel = styled.Text<{ selected: boolean }>`
  color: ${({ selected }) => (selected ? COLOR.PRIMARY : '#999999')};
  font-size: 13px;
  font-weight: 500;
`;

function getMonth(m: any) {
  let month = '';

  if (m < 10) {
    month = `0${m}`;
  } else {
    month = `${m}`;
  }

  switch (month) {
    case '01':
      return `Jan`;
    case '02':
      return `Feb`;
    case '03':
      return `Mar`;
    case '04':
      return `Apr`;
    case '05':
      return `May`;
    case '06':
      return `Jun`;
    case '07':
      return `Jul`;
    case '08':
      return `Aug`;
    case '09':
      return `Sep`;
    case '10':
      return `Oct`;
    case '11':
      return `Nov`;
    case '12':
      return `Dec`;
    default:
      return '';
  }
}

type ArchiveChatListItemProps = {
  room: Room;
  count: number;
  setCount: Function;
  unArchive;
  setUnArchive;
  checkedRoomList?: Room[];
  setCheckedRoomList?: (roomList: Room[]) => void;
};
const ArchiveChatListItem = ({
  room,
  count,
  setCount,
  unArchive,
  setUnArchive,
  checkedRoomList,
  setCheckedRoomList,
}: ArchiveChatListItemProps) => {
  const themeContext = useContext(ThemeContext);
  const [checked, setChecked] = useState<boolean>(false);
  const friendList = useAtomValue(friendListAtom);
  const me = useAtomValue(userAtom);
  const isMe = room?.joined_users?.filter((user) => user.id !== me?.id).length === 0;
  const [isFriend, setIsFriend] = useState<boolean>(false);
  const [profileImage, setProfileImage] = useState();
  const targetUser = useMemo(() => room?.joined_users?.filter((user) => user.id !== me?.id)?.[0], [room]);
  const createdAt = DateUtil.getDateTimeForChatList(room.preview_message?.createdAt);
  const unreadCount = createdAt ? room.unread_count ?? 0 : 0;

  const getTime = (createdAt) => {
    const currentDate = new Date();
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (currentDate.getFullYear() !== year) {
      return `${getMonth(month)} ${day < 10 ? `0${day}` : `${day}`}. ${year}`;
    } else {
      if (currentDate.getMonth() + 1 !== month || currentDate.getDate() !== day) {
        return `${getMonth(month)} ${day < 10 ? `0${day}` : `${day}`}`;
      } else {
        return `${hours < 10 ? `0${hours}` : `${hours}`}:${minutes < 10 ? `0${minutes}` : `${minutes}`} ${
          hours < 13 ? 'AM' : 'PM'
        }`;
      }
    }
  };

  useEffect(() => {
    if (unArchive) {
      setChecked(false);
      setUnArchive(false);
    }
  }, [unArchive]);

  useFocusEffect(
    useCallback(() => {
      if (targetUser) {
        setIsFriend(friendList?.filter((item) => item === targetUser.id).length === 1);
        if (targetUser.sc_profile_photo === 'friends' && isFriend) {
          LogUtil.info('profile_image', targetUser.profile_image);
          if (
            targetUser.profile_image === null ||
            targetUser.profile_image === 'private' ||
            targetUser.profile_image === ''
          ) {
            setProfileImage(require('assets/img-profile.png'));
          } else if (targetUser.profile_image) {
            //@ts-ignore
            setProfileImage({ uri: targetUser.profile_image });
          }
        } else if (targetUser.sc_profile_photo === 'public') {
          LogUtil.info('profile_image', targetUser.profile_image);
          if (
            targetUser.profile_image === null ||
            targetUser.profile_image === 'private' ||
            targetUser.profile_image === ''
          ) {
            setProfileImage(require('assets/img-profile.png'));
          } else if (targetUser.profile_image) {
            //@ts-ignore
            setProfileImage({ uri: targetUser.profile_image });
          }
        } else {
          setProfileImage(require('assets/img-profile.png'));
        }
      } else if (isMe) {
        if (me?.profile_image) {
          //@ts-ignore
          setProfileImage({ uri: me?.profile_image });
        } else {
          setProfileImage(require('assets/img-profile.png'));
        }
      }
    }, [targetUser]),
  );
  const defaultImage = (i: any) => {
    if (room.joined_users?.[i]) {
      const isFriend = friendList?.filter((item) => item === room.joined_users?.[i].id).length === 1;
      if (room.joined_users?.[i].sc_profile_photo === 'friends' && isFriend) {
        if (room.joined_users?.[i].profile_image === null || room.joined_users?.[i].profile_image === 'private') {
          return require('assets/chats/img_profile.png');
        } else {
          return { uri: room.joined_users[i].profile_image };
        }
      } else if (room.joined_users?.[i].sc_profile_photo === 'public') {
        if (room.joined_users?.[i].profile_image === null || room.joined_users?.[i].profile_image === 'private') {
          return require('assets/chats/img_profile.png');
        } else {
          return { uri: room.joined_users[i].profile_image };
        }
      } else {
        return require('assets/chats/img_profile.png');
      }
    } else {
      return undefined;
    }
  };

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
      callLocalChecked(!checked);
      if (checkedRoomList && setCheckedRoomList) {
        setCheckedRoomList([...checkedRoomList, room]);
      }
    }
  };

  const usersWithoutMe = useMemo(() => {
    return room.joined_users.filter((user) => user.id !== me?.id);
  }, [me?.id, room.joined_users]);

  const isDeletedUser =
    room?.joined_users?.length === 2 && usersWithoutMe[0].uid.split('_').pop() === `deleted${usersWithoutMe[0].id}`;

  return (
    <Pressable style={{ backgroundColor: themeContext.dark ? '#585858' : '#ffffff' }} onPress={handleChecked}>
      <Row
        style={[
          { alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16 },
          checked && (themeContext.dark ? { backgroundColor: '#88808f' } : { backgroundColor: '#fcf2e8' }),
        ]}
      >
        <View style={{ marginRight: 15, marginLeft: 5 }}>
          <Checkbox round checked={checked} handleChecked={handleChecked} />
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
            <NameText numberOfLines={1}>
              {isDeletedUser
                ? 'Deleted Account'
                : usersWithoutMe.length === 0
                ? `${me?.first_name} ${me?.last_name} `
                : usersWithoutMe.length > 1
                ? room.name
                : `${usersWithoutMe[0]?.first_name} ${usersWithoutMe[0]?.last_name}`}
            </NameText>
            {usersWithoutMe.length > 1 && <Count>{room.joined_users.length}</Count>}
          </Row>
          <ChatText numberOfLines={2}>
            {room.preview_message?.type === 'file'
              ? `[ ${t('chats-main.File')} ]`
              : room.preview_message?.content ?? ''}
          </ChatText>
        </Column>
        <Column style={{ width: 74, alignItems: 'flex-end' }}>
          <Time>{getTime(room.preview_message?.createdAt)}</Time>
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
  );
};

const SelectButton = ({ count }) => {
  return (
    <View style={{ flexDirection: 'row', marginRight: 5 }}>
      <Count>{count}</Count>
      <SelectButtonLabel>{t('archive-chats.Select')}</SelectButtonLabel>
    </View>
  );
};
const LeaveModal = ({ isVisible, setIsVisible, onDelete }) => {
  return (
    <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
      <Column justify="center" align="center">
        <ModalTitle>
          <Text style={{ textAlign: 'center' }}>
            {t('archive-chats.Are you sure you want to unarchive the chatroom?')}
          </Text>
        </ModalTitle>
        <Row style={{ paddingTop: 15 }}>
          <CancelButton onPress={() => setIsVisible(false)}>
            <CancelLabel>{t('archive-chats.Cancel')}</CancelLabel>
          </CancelButton>
          <View style={{ padding: 10 }} />
          <DeleteButton
            onPress={() => {
              setIsVisible(false);
              onDelete();
            }}
          >
            <DeleteLabel>{t('archive-chats.Delete')}</DeleteLabel>
          </DeleteButton>
        </Row>
      </Column>
    </ModalBase>
  );
};

const ArchiveChat = function () {
  const { chatStatus, chatSocketUtil } = useSocket();
  const [checkedRoomList, setCheckedRoomList] = useState<Room[]>([]);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [count, setCount] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [unArchive, setUnArchive] = useState<boolean>(false);
  const onRoomsData = chatStatus.rooms;
  const archivedRoomList: Room[] = (onRoomsData?.archivedRooms ?? []).sort(roomSort);
  const socketPrefix = '아카이브채팅목록';

  const onUnarchive = async () => {
    LogUtil.info('ArchiveChats onUnarchive');
    for (const checkedRoom of checkedRoomList) {
      await ChatHttpUtil.requestUnarchiveRoom(checkedRoom);
    }

    setUnArchive(true);
    setCheckedRoomList([]);
    setCount(0);

    await chatSocketUtil.easy.getRooms(socketPrefix);
  };

  const closeEdit = () => {
    setCheckedRoomList([]);
    setCount(0);
    setIsEdit(false);
  };

  const onExit = async () => {
    const room_ids = checkedRoomList.map((checkedRoom) => checkedRoom._id);
    LogUtil.info('ArchiveChats onExit ,', room_ids);
    await ChatHttpUtil.requestLeaveRoom(room_ids);
    onUnarchive();
    setIsEdit(false);
  };

  return (
    <MainLayout>
      {isEdit ? (
        <>
          <CloseHeader
            position="left"
            title={t('archive-chats.Archive chats')}
            onClick={() => closeEdit()}
            button={[<SelectButton key={0} count={count} />]}
          />
          <ChatContainer>
            {(archivedRoomList ?? []).map((archiveRoom, i) => (
              <ArchiveChatListItem
                key={i}
                room={archiveRoom}
                count={count}
                setCount={setCount}
                unArchive={unArchive}
                setUnArchive={setUnArchive}
                checkedRoomList={checkedRoomList}
                setCheckedRoomList={setCheckedRoomList}
              />
            ))}
          </ChatContainer>
          <Footer
            style={{
              justifyContent: 'center',
              alignItems: 'flex-end',
              shadowColor: COLOR.BLACK,
              shadowOpacity: 0.1,
              shadowOffset: {
                width: 0,
                height: -15,
              },
              shadowRadius: 10,
            }}
          >
            <Row>
              <FooterButton onPress={() => count !== 0 && onUnarchive()}>
                <FooterButtonLabel selected={count !== 0}>{t('archive-chats.Unarchive')}</FooterButtonLabel>
              </FooterButton>
              <FooterButton onPress={() => count !== 0 && setIsVisible(true)}>
                <FooterButtonLabel selected={count !== 0}>{t('archive-chats.Leave')}</FooterButtonLabel>
              </FooterButton>
            </Row>
          </Footer>
        </>
      ) : (
        <>
          <BackHeader
            title={t('archive-chats.Archive chats')}
            button={[
              <TouchableOpacity key={0} onPress={() => setIsEdit(true)}>
                <ButtonLabel>{t('archive-chats.Edit')}</ButtonLabel>
              </TouchableOpacity>,
            ]}
          />
          <ChatContainer>
            {(archivedRoomList ?? []).map((data, i) => {
              return <ChatListItem key={i} room={data} />;
            })}
          </ChatContainer>
        </>
      )}
      <LeaveModal isVisible={isVisible} setIsVisible={setIsVisible} onDelete={onExit} />
    </MainLayout>
  );
};

export default ArchiveChat;
