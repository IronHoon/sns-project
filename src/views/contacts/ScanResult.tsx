import React, { useCallback, useState } from 'react';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import MainLayout from 'components/layouts/MainLayout';
import CloseHeader from 'components/molecules/CloseHeader';
import { useAtomValue } from 'jotai';
import contactsAtom from 'stores/contactsAtom';
import styled from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import Contact from 'types/contacts/Contact';
import { Dimensions } from 'react-native';
import AddFriend from 'assets/contacts/scan-result/ic_add_friend.svg';
import AddChat from 'assets/contacts/scan-result/ic_add_chat.svg';
import { get, post } from 'net/rest/api';
import User from 'types/auth/User';
import userAtom from 'stores/userAtom';
import LogUtil from 'utils/LogUtil';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import { t } from 'i18next';
import AuthUtil from 'utils/AuthUtil';
import friendListAtom from '../../stores/friendListAtom';

const UserInfo = styled.View`
  margin-top: ${`${Dimensions.get('window').height / 7}px`};
  flex: 1;
  align-items: center;
`;
const AlreadyFriend = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  position: absolute;
  top: ${`-${Dimensions.get('window').height / 13}px`};
`;
const ProfileContainer = styled.View`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  overflow: hidden;
  margin-bottom: 12px;
`;
const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const NameContainer = styled.View`
  height: auto;
  justify-content: center;
`;
const Name = styled.View`
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
`;
const NameText = styled.Text`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 3px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};

  line-height: 22;
`;
// const Name = styled.Text`
//   font-size: 18px;
//   font-weight: 500;
//   margin-bottom: 3px;
// `;
const ID = styled.Text`
  font-size: 13px;
  color: #bcb3c5;
  margin-bottom: 7px;
`;
const ProfileMessage = styled.Text`
  font-size: 13px;
  color: #999999;
  margin-bottom: 50px;
`;
const Button = styled.TouchableOpacity`
  width: 200px;
  height: 60px;
  background-color: ${COLOR.PRIMARY};
  border-radius: 10px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;
const ButtonLabel = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${COLOR.WHITE};
  margin-left: 10px;
`;

function ScanResult({ navigation }) {
  // @ts-ignore
  const profileUser = useRoute<User>().params.result;
  //@ts-ignore
  const contactList = useAtomValue<Contact[] | null>(contactsAtom);
  // @ts-ignore
  const isFriend = !!profileUser.friend;
  // contactList && contactList?.filter((contact) => contact.friend.contact === profileUser.contact).length > 0;
  const myUser: User | null = useAtomValue(userAtom);
  // @ts-ignore
  const setResult = useRoute().params.setResult;
  const isMe = profileUser?.id === myUser?.id;
  const [profileImage, setProfileImage] = useState();
  const friendList = useAtomValue(friendListAtom);

  useFocusEffect(
    useCallback(() => {
      const isFriend = friendList?.filter((item) => item === profileUser?.id).length === 1;
      if (!isMe) {
        if (profileUser?.sc_profile_photo === 'friends' && isFriend) {
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

  const addFriend = useCallback(() => {
    AuthUtil.requestAddFriend(profileUser.contact).then(() => {
      navigation.navigate('/contacts');
    });
  }, [navigation]);

  return (
    <MainLayout>
      <CloseHeader
        title={t('scan-result.Scan result')}
        onClick={() => {
          navigation.goBack();
          if (setResult) {
            setResult(false);
          }
        }}
      />
      <UserInfo>
        {isFriend && <AlreadyFriend>This account is already registered.</AlreadyFriend>}
        <ProfileContainer>
          <ProfileImage
            //@ts-ignore
            source={profileImage}
          />
        </ProfileContainer>

        <NameContainer>
          <Name>
            {`${profileUser?.first_name} ${profileUser?.last_name !== null && profileUser?.last_name}`
              .split(' ')
              .map((word) => (
                <NameText>{word}</NameText>
              ))}
          </Name>
        </NameContainer>
        {/* <Name>{`${profileUser?.first_name} ${profileUser?.last_name !== null && `${profileUser?.last_name}`}`}</Name> */}
        <ID>@{profileUser.uid}</ID>
        <ProfileMessage>{profileUser.profile_message !== null ? profileUser.profile_message : ' '}</ProfileMessage>
        {isFriend ? (
          <Button
            onPress={() =>
              myUser && profileUser
                ? ChatHttpUtil.requestGoChatRoomWithFriends(navigation, [profileUser.id], myUser.id)
                : undefined
            }
          >
            <AddChat />
            <ButtonLabel>1:1 Chat</ButtonLabel>
          </Button>
        ) : (
          <>
            {myUser?.id === profileUser.id ? (
              <Button
                onPress={() =>
                  myUser && profileUser
                    ? ChatHttpUtil.requestGoChatRoomWithFriends(navigation, [profileUser.id], myUser.id)
                    : undefined
                }
              >
                <AddChat />
                <ButtonLabel>{t('scan-result.My Chatroom')}</ButtonLabel>
              </Button>
            ) : (
              <Button onPress={() => addFriend()}>
                <AddFriend />
                <ButtonLabel>{t('scan-result.Add Friend')}</ButtonLabel>
              </Button>
            )}
          </>
        )}
      </UserInfo>
    </MainLayout>
  );
}

export default ScanResult;
