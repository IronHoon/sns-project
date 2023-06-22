import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled, { ThemeContext } from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import { Column } from 'components/layouts/Column';
import Owner from 'assets/chats/chatroom-detail/ic-owner.svg';
import KokKok from 'assets/chats/chatroom-detail/ic-kok.svg';
import AddFriend from 'assets/chats/chatroom-detail/btn-add-friend.svg';
import AddMember from 'assets/chats/chatroom-detail/ic-add-member.svg';
import Block from 'assets/chats/chatroom-detail/ic-block.svg';
import { Row } from 'components/layouts/Row';
import { Dimensions, ImageBackground, Platform, Pressable, TouchableOpacity, View } from 'react-native';
import { Menu, MenuItem } from 'react-native-material-menu';
import Remove from 'assets/profile-detail/ic-remove.svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { ModalBase } from 'components/modal';
import { use } from 'i18next';
import useFetch, { useFetchWithType } from '../../../../net/useFetch';
import User from '../../../../types/auth/User';
import chatHttpUtil from '../../../../utils/chats/ChatHttpUtil';
import Room from '../../../../types/chats/rooms/Room';
import { get, post } from '../../../../net/rest/api';
import LogUtil from '../../../../utils/LogUtil';
import { useAtomValue } from 'jotai';
import userAtom from '../../../../stores/userAtom';
import SwrContainer from '../../../../components/containers/SwrContainer';
import { Avatar } from '../../../../components/atoms/image';

const Container = styled.View`
  flex: 1;
`;
const MemberCountContainer = styled(Row)`
  flex-direction: row;
  padding: 20px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
`;
const MembersText = styled.Text<{ fontSize: number }>`
  flex: 1;
  font-size: ${({ fontSize }) => fontSize - 2};
  font-weight: 500;
  color: #aaaaaa;
`;
const Count = styled.Text<{ fontSize: number }>`
  font-size: ${({ fontSize }) => fontSize - 2};
  font-weight: 500;
  color: ${COLOR.PRIMARY};
`;
const AddMemberButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
`;
const AddMemberText = styled.Text<{ fontSize: number }>`
  font-size: ${({ fontSize }) => fontSize - 2};
  color: #bcb3c5;
`;
const ParticipantsList = styled.ScrollView`
  flex: 1;
`;
const ProfileImageBox = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 70px;
  overflow: hidden;
  margin-left: 16px;
  margin-right: 16px;
`;

const NameContainer = styled.View`
  height: auto;
  justify-content: center;
`;
const Name = styled.View`
  /* justify-content: center; */
  flex-direction: row;
  flex-wrap: wrap;
`;
const NameText = styled.Text<{ fontSize: number }>`
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
  font-size: ${({ fontSize }) => fontSize};
  font-weight: 500;
  margin-bottom: 5px;
`;
const IDText = styled.Text<{ fontSize: number }>`
  color: #bcb3c5;
  font-size: ${({ fontSize }) => fontSize - 2};
`;
const NotFriend = styled.Text`
  position: absolute;
  left: ${`${40 / 2 - 3.5}px`};
  top: ${`${40 / 2 - 10}px`};
  font-size: 15px;
  font-weight: 500;
  color: ${COLOR.WHITE};
`;
const ModalTitle = styled.Text`
  font-size: 15px;
  font-weight: 500;
  color: black;
  padding: 10px;
  text-align: center;
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
const ConfirmButton = styled.TouchableOpacity`
  background-color: ${COLOR.PRIMARY};
  width: 100px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${COLOR.PRIMARY};
`;
const ConfirmLabel = styled.Text`
  color: #fff;
  font-size: 13px;
  font-weight: 500;
`;

const IcContainer = styled(View)<{ size?: number }>`
  ${({ size }) => (size ? `height: ${size}px; width: ${size}px;` : '')}
`;

import ProfileImage from 'assets/images/profile-edit/img-profile.svg';
import { ChooseFriendsCallback } from 'views/chats/ChooseFriends';
import ChatHttpUtil from '../../../../utils/chats/ChatHttpUtil';
import { useSetAtom } from 'jotai';
import profileDetailUidAtom from 'stores/profileDetailUidAtom';
import friendListAtom from '../../../../stores/friendListAtom';

function Profile({ admin_id, user, user_id, setIsVisible, selectedUser, setSelectedUser, setSelectedId, roomId }) {
  const setCurrentProfileUid = useSetAtom(profileDetailUidAtom);
  const navigation = useNavigation<MainNavigationProp>();
  const themeContext = useContext(ThemeContext);
  const { data: profileUser, error, mutate } = useFetchWithType<User>(`/auth/users/detail?&uid=${user.uid}`);
  const [visible, setVisible] = useState<boolean>(false);
  const me = useAtomValue(userAtom);
  const isMe = profileUser?.id === me?.id;
  const isDeletedUser = !isMe && user?.uid.split('_').pop() === `deleted${user?.id}`;

  const [profileImage, setProfileImage] = useState();
  const friendList = useAtomValue(friendListAtom);

  LogUtil.info('friendList', friendList);

  const hideMenu = () => setVisible(false);
  const showMenu = () => {
    if (user.id !== admin_id) {
      setVisible(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const isFriend = friendList?.filter((item) => item === profileUser?.id).length === 1;
      LogUtil.info('id && isFriend', profileUser?.id);
      LogUtil.info('id && isFriend', isFriend);
      if (!isMe) {
        if (profileUser?.sc_profile_photo === 'friends' && isFriend) {
          LogUtil.info('here is right');
          if (profileUser?.profile_image === null || profileUser?.profile_image === '') {
            setProfileImage(require('assets/img-profile.png'));
          } else if (profileUser?.profile_image) {
            LogUtil.info('here is right', profileUser?.profile_image);
            //@ts-ignore
            setProfileImage({ uri: profileUser?.profile_image });
          }
        } else if (profileUser?.sc_profile_photo === 'public') {
          if (
            profileUser?.profile_image === null ||
            profileUser?.profile_image === 'private' ||
            profileUser?.profile_image === ''
          ) {
            setProfileImage(require('assets/img-profile.png'));
          } else if (profileUser?.profile_image) {
            //@ts-ignore
            setProfileImage({ uri: profileUser?.profile_image });
          }
        } else {
          setProfileImage(require('assets/img-profile.png'));
        }
      } else {
        if (profileUser?.profile_image) {
          //@ts-ignore
          setProfileImage({ uri: profileUser?.profile_image });
        } else {
          setProfileImage(require('assets/img-profile.png'));
        }
      }
    }, []),
  );

  const removeUser = () => {
    hideMenu();
    let userName = `${user.first_name}${user.last_name !== '' && ` ${user.last_name}`}`;
    setSelectedUser(userName);
    setSelectedId(user.id);
  };

  useEffect(() => {
    if (selectedUser !== '' && !visible) {
      setTimeout(() => {
        setIsVisible(true);
      }, 400);
    }
  }, [visible]);

  return (
    <Menu
      style={{ marginLeft: Dimensions.get('window').width / 3, marginTop: 35 }}
      visible={visible}
      onRequestClose={hideMenu}
      anchor={
        <Pressable
          onPress={() => {
            setCurrentProfileUid(user.uid);
            navigation.navigate('/profile-detail');
          }}
          onLongPress={admin_id === user_id ? showMenu : undefined}
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
        >
          <Row style={{ alignItems: 'center', paddingVertical: 15, paddingHorizontal: 5, paddingRight: 20 }}>
            <ProfileImageBox>
              {user.profile_image ? (
                <ImageBackground
                  style={{ width: '100%', height: '100%' }}
                  //@ts-ignore
                  source={profileImage}
                >
                  {user_id !== user.id && (!profileUser?.friend || user.is_block) && (
                    <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', flex: 1 }} />
                  )}
                </ImageBackground>
              ) : user_id !== user.id && user.is_block ? (
                <IcContainer size={40} style={{ backgroundColor: 'rgba(0,0,0,0.5)', flex: 1 }}>
                  <ProfileImage width={40} height={40} />
                </IcContainer>
              ) : (
                <IcContainer size={40}>
                  <ProfileImage width={40} height={40} />
                </IcContainer>
              )}
              {!profileUser?.friend && !user.is_block && user_id !== user.id && <NotFriend>?</NotFriend>}
              {user.is_block && (
                <Block width={22} height={22} style={{ position: 'absolute', left: 40 / 2 - 11, top: 40 / 2 - 11 }} />
              )}
            </ProfileImageBox>
            <Column style={{ flex: 1 }}>
              <Row>
                <NameContainer>
                  <Name>
                    {isDeletedUser ? (
                      <NameText fontSize={me?.setting.ct_text_size as number}>Deleted Account</NameText>
                    ) : (
                      `${user.first_name} ${user?.last_name !== null && user?.last_name}`
                        .split(' ')
                        .map((word) => <NameText fontSize={me?.setting.ct_text_size as number}>{word}</NameText>)
                    )}
                    {user.id === admin_id && <Owner height={16} width={16} style={{ marginLeft: 5 }} />}
                  </Name>
                </NameContainer>
              </Row>
              {!isDeletedUser && <IDText fontSize={me?.setting.ct_text_size as number}>@{user.uid}</IDText>}
            </Column>
            {user.id === user_id || user.is_block || isDeletedUser ? (
              <></>
            ) : profileUser?.friend ? (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('/kokkokme/user-timeline/:id', {
                    id: user.id,
                    uid: user.uid,
                  });
                }}
              >
                <KokKok width={24} height={24} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  post('/auth/contacts', {
                    contacts: [{ number: user.contact }],
                  }).then(() => {
                    mutate();
                    console.log('연락처 추가 성공!');
                  });
                }}
              >
                <AddFriend width={32} height={32} />
              </TouchableOpacity>
            )}
          </Row>
        </Pressable>
      }
    >
      <MenuItem
        style={Platform.OS === 'ios' && { paddingLeft: 15 }}
        textStyle={{ color: COLOR.BLACK }}
        onPress={removeUser}
        pressColor={themeContext.dark ? '#88808f' : '#fcf2e8'}
      >
        <Remove style={Platform.OS === 'ios' && { marginRight: -10 }} height={13} width={13} /> Remove {user.first_name}
        {user.lastName !== '' && ` ${user.last_name}`}
      </MenuItem>
    </Menu>
  );
}

const RemoveModal = ({ isVisible, setIsVisible, userName, handleRemove }) => {
  return (
    <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
      <Column justify="center" align="center">
        <ModalTitle>Remove {userName} from group?</ModalTitle>
        <Row style={{ paddingTop: 15 }}>
          <CancelButton
            onPress={() => {
              setIsVisible(false);
            }}
          >
            <CancelLabel>Cancel</CancelLabel>
          </CancelButton>
          <View style={{ padding: 10 }} />
          <ConfirmButton onPress={() => handleRemove()}>
            <ConfirmLabel>OK</ConfirmLabel>
          </ConfirmButton>
        </Row>
      </Column>
    </ModalBase>
  );
};

function MemberList({ room, user_id }) {
  const { admin_id, joined_users, _id } = room;
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedId, setSelectedId] = useState<number>(0);
  const navigation = useNavigation<MainNavigationProp>();
  const [joined, setJoined] = useState<Room>();
  const myUser = useAtomValue(userAtom);
  const { data: roomData, error: roomError, mutate: roomMutate } = useFetchWithType<Room>(`/chats/rooms/${_id}`);

  useFocusEffect(
    useCallback(() => {
      setJoined(roomData);
      roomMutate();
    }, [roomData, roomMutate]),
  );

  const closeModal = () => {
    setIsVisible(false);
    setSelectedUser('');
  };
  const handleRemove = async () => {
    post(`/chats/rooms/${_id}/remove`, {
      admin_id: user_id,
      remove_user_id: selectedId,
    }).then(() => {
      console.log('내보내기 성공!');
      roomMutate();
    });
    // await chatHttpUtil.requestRemoveUser(user_id,selectedId,_id);
    setIsVisible(false);
    setSelectedUser('');
    setSelectedId(0);
  };

  return (
    <Container>
      <MemberCountContainer>
        <MembersText fontSize={myUser?.setting.ct_text_size as number}>
          Mebers<Count fontSize={myUser?.setting.ct_text_size as number}> {joined_users.length}</Count>
        </MembersText>
        <AddMemberButton
          onPress={() =>
            navigation.navigate('/chats/new-chat/choose-friends', {
              chatRoomType: 'chat',
              roomId: _id,
              joinedUsers: joined?.joined_users,
              callback: new ChooseFriendsCallback(async ({ roomId, selectedFriendList, navigation }) => {
                const selectedFriendIdList: number[] = selectedFriendList.map((selectedFriend, i) => selectedFriend.id);
                await ChatHttpUtil.requestInviteFriends(navigation, selectedFriendIdList, roomId);
              }),
            })
          }
        >
          <AddMember
            width={myUser?.setting.ct_text_size as number}
            height={myUser?.setting.ct_text_size as number}
            style={{ marginRight: 5 }}
          />
          <AddMemberText fontSize={myUser?.setting.ct_text_size as number}> Add member</AddMemberText>
        </AddMemberButton>
      </MemberCountContainer>
      <ParticipantsList>
        <SwrContainer data={roomData} error={roomError}>
          <>
            {joined?.joined_users.map((user, i) => (
              <Profile
                key={i}
                admin_id={admin_id}
                user={user}
                user_id={user_id}
                selectedUser={selectedUser}
                setIsVisible={setIsVisible}
                setSelectedId={setSelectedId}
                setSelectedUser={setSelectedUser}
                roomId={_id}
              />
            ))}
          </>
        </SwrContainer>
      </ParticipantsList>
      <RemoveModal
        isVisible={isVisible}
        setIsVisible={closeModal}
        userName={selectedUser}
        handleRemove={handleRemove}
      />
    </Container>
  );
}

export default MemberList;
