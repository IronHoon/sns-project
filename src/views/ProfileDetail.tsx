import CloseHeader from 'components/molecules/CloseHeader';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Dimensions, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { COLOR } from 'constants/COLOR';
import styled, { ThemeContext } from 'styled-components/native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import Lightbox from 'react-native-lightbox-v2';
import Saved from 'assets/profile-detail/ic-saved.svg';
import FavoriteOn from 'assets/profile-detail/ic-favorite-on.svg';
import FavoriteOff from 'assets/profile-detail/ic-favorite-off.svg';
import AlarmOn from 'assets/profile-detail/ic-alarm-on.svg';
import AlarmOff from 'assets/profile-detail/ic-alarm-off.svg';
import Chat from 'assets/profile-detail/ic-chat.svg';
import Edit from 'assets/profile-detail/ic-edit.svg';
import Call from 'assets/profile-detail/ic-call.svg';
import Kok from 'assets/profile-detail/ic-kok.svg';
import AddFriend from 'assets/profile-detail/ic-add.svg';
import Block from 'assets/profile-detail/ic-block.svg';
import Options from './chats/components/chatroom-detail/Options';
import User from 'types/auth/User';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import { get, patch, post, remove } from 'net/rest/api';
import { useFetchWithType } from 'net/useFetch';
import SwrContainer from 'components/containers/SwrContainer';
import LogUtil from 'utils/LogUtil';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import { t } from 'i18next';
import AuthUtil from 'utils/AuthUtil';
import Room, { CallType } from 'types/chats/rooms/Room';
import profileDetailUidAtom from 'stores/profileDetailUidAtom';
import { useSetAtom } from 'jotai';
import showCallViewAtom, { CallViewStatus } from 'stores/showCallViewAtom';
import ChatSocketUtil from 'utils/chats/ChatSocketUtil';
import friendListAtom from '../stores/friendListAtom';
import { rgba } from 'react-native-image-filter-kit';
import { rgbaColor } from 'react-native-reanimated/lib/types';

const Container = styled.View`
  flex: 1;
  background-color: #999999;
`;
const ImageContainer = styled.ImageBackground`
  flex: 1;
`;
const UserInfo = styled.View`
  flex: 1;
  justify-content: flex-end;
  align-items: center;
`;
const ProfileContainer = styled(Lightbox)<{ open: boolean }>`
  width: ${({ open }) => (open ? '100%' : '120px')};
  height: ${({ open }) => (open ? '100%' : '120px')};
  border-radius: 60px;
  overflow: hidden;
  margin: 5px;
`;
const ProfileImage = styled.Image<{ open: boolean }>`
  width: 100%;
  height: 100%;
  max-height: ${({ open }) => (open ? '100%' : '300px')};
  border-radius: ${({ open }) => (open ? '0px' : '70px')};
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
const NameText = styled.Text<{ fontSize?: number }>`
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize + 7}px` : '22px')};
  font-weight: 500;
  margin: 5px;
  color: ${COLOR.WHITE};
`;
const ID = styled.Text<{ fontSize?: number }>`
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize - 2}px` : '13px')};
  color: ${COLOR.GRAY};
`;
const Birthday = styled.Text<{ fontSize?: number }>`
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize - 2}px` : '13px')};
  margin: 5px;
  color: #bcb3c5;
  margin-bottom: 20px;
`;
const ButtonNav = styled.View`
  height: 150px;
  border-top-width: 1px;
  border-top-color: #ffffff;
  flex-direction: row;
  justify-content: space-evenly;
  padding-top: 25px;
  /* align-items: center; */
`;
const Button = styled.TouchableOpacity`
  align-items: center;
  width: 30%;
`;
const ButtonLabel = styled.Text<{ fontSize?: number }>`
  margin-top: 5px;
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize - 2}px` : '13px')};
  color: #e0dde5;
  text-align: center;
  padding: 8px;
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
      return 'Jan';
    case '02':
      return 'Feb';
    case '03':
      return 'Mar';
    case '04':
      return 'Apr';
    case '05':
      return 'May';
    case '06':
      return 'Jun';
    case '07':
      return 'Jul';
    case '08':
      return 'Aug';
    case '09':
      return 'Sep';
    case '10':
      return 'Oct';
    case '11':
      return 'Nov';
    case '12':
      return 'Dec';
    default:
      return '';
  }
}

function ProfileDetail() {
  const showCallView = useSetAtom(showCallViewAtom);
  const me: User | null = useAtomValue(userAtom);
  const profileDetailUid: string | null = useAtomValue(profileDetailUidAtom);
  const user_id = me && me?.id;
  const { data: profileUser, error, mutate } = useFetchWithType<User>(`/auth/users/detail?&uid=${profileDetailUid}`);
  const addedMeList = useAtomValue(friendListAtom);
  const themeFont = me?.setting.ct_text_size as number;

  const birth = useMemo(() => {
    if (profileUser?.birth) {
      const birthDate = new Date(profileUser?.birth);
      const year = birthDate.getFullYear();
      const month = birthDate.getMonth() + 1;
      const day = birthDate.getDate();
      const formattedBirth =
        profileUser?.setting.sc_show_full_birthday === 1
          ? `${getMonth(month)} ${day}, ${year}`
          : `${getMonth(month)} ${day}`;
      const isAddedMe = addedMeList?.includes(profileUser.id);
      const sc_birth = profileUser?.setting.sc_birthday;
      if (sc_birth === 'public' || (sc_birth === 'friends' && isAddedMe)) {
        return formattedBirth;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }, [profileUser]);

  const navigation = useNavigation<MainNavigationProp>();
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  // const [isMuted, setIsMuted] = useState<boolean>(false);
  // const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isCallVisible, setIsCallVisible] = useState<boolean>(false);
  const isMe = profileUser?.id === me?.id;
  const [profileImage, setProfileImage] = useState();
  const isAddedMe = profileUser && addedMeList?.includes(profileUser.id);

  useFocusEffect(
    useCallback(() => {
      if (!isMe) {
        if (profileUser?.sc_profile_photo === 'friends' && isAddedMe) {
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
        setProfileImage(
          profileUser?.profile_image ? { uri: profileUser?.profile_image } : require('assets/img-profile.png'),
        );
      }
    }, [profileUser]),
  );

  const isVoiceCallAble = useMemo(() => {
    if (
      profileUser?.setting.sc_voice_call === 'public' ||
      (profileUser?.setting.sc_voice_call === 'friends' && isAddedMe)
    ) {
      return true;
    } else {
      return false;
    }
  }, [profileUser]);

  const isVideoCallAble = useMemo(() => {
    if (
      profileUser?.setting.sc_video_call === 'public' ||
      (profileUser?.setting.sc_video_call === 'friends' && isAddedMe)
    ) {
      return true;
    } else {
      return false;
    }
  }, [profileUser]);

  const isFavorite = useMemo(() => {
    if (profileUser?.friend?.is_favorite) {
      return true;
    } else {
      return false;
    }
  }, [profileUser]);

  const isMuted = useMemo(() => {
    if (profileUser?.friend?.is_mute) {
      return true;
    } else {
      return false;
    }
  }, [profileUser]);

  const handleFavorite = () => {
    if (isFavorite) {
      patch(`/auth/contacts/target/${profileUser?.id}`, { is_favorite: 0 }).then(() => {
        mutate();
      });
    } else {
      patch(`/auth/contacts/target/${profileUser?.id}`, { is_favorite: 1 }).then(() => {
        mutate();
      });
    }
  };

  const handleMuted = () => {
    if (isMuted) {
      patch(`/auth/contacts/target/${profileUser?.id}`, { is_mute: 0 }).then(() => {
        mutate();
      });
    } else {
      patch(`/auth/contacts/target/${profileUser?.id}`, { is_mute: 1 }).then(() => {
        mutate();
      });
    }
  };

  const goKokKok = () => {
    if (!profileDetailUid) {
      return;
    }

    navigation.navigate('/kokkokme/user-timeline/:id', {
      id: profileUser?.id,
      uid: profileDetailUid,
      contact: profileUser?.contact,
    });
  };

  const addFriend = () => {
    if (!profileUser?.contact) {
      LogUtil.error('addFriend !profileUser?.contact');
      return;
    }

    AuthUtil.requestAddFriend(profileUser?.contact).then(() => {
      mutate();
    });
  };

  const block = () => {
    if (!profileUser?.id) {
      LogUtil.error('block !profileUser?.id');
      return;
    }

    AuthUtil.requestBlockUser('contact', profileUser?.id).then(() => {
      mutate();
    });
  };

  const unBlock = () => {
    remove(`/auth/block/${profileUser?.id}`).then(() => {
      mutate();
    });
  };

  // useFocusEffect(
  //   useCallback(() => {
  //     mutate();
  //     if (profileUser) {
  //       //@ts-ignore
  //       let is_favorite = profileUser.friend === null ? false : profileUser.friend.is_favorite === 0 ? false : true;
  //       setIsFavorite(is_favorite);
  //       //@ts-ignore
  //       let is_mute = profileUser.friend === null ? false : profileUser.friend.is_mute === 0 ? false : true;
  //       setIsMuted(is_mute);
  //     }
  //   }, [mutate]),
  // );

  const buttonList =
    profileUser?.id === user_id
      ? [
          {
            icon: <Saved height={22} width={22} />,
            onClick: () => {
              navigation.navigate('/more/saved-messages');
            },
          },
        ]
      : !profileUser?.friend
      ? []
      : [
          {
            icon: isFavorite ? (
              <FavoriteOn height={22} width={22} style={{ marginRight: 15 }} />
            ) : (
              <FavoriteOff height={22} width={22} style={{ marginRight: 15 }} />
            ),
            onClick: () => handleFavorite(),
          },
          {
            icon: isMuted ? <AlarmOff height={22} width={22} /> : <AlarmOn height={22} width={22} />,
            onClick: () => handleMuted(),
          },
        ];

  const callMenuList = [
    {
      value: 'audio',
      label: 'Voice call',
    },
    {
      value: 'video',
      label: 'Video call',
    },
    {
      value: 'cancel',
      label: 'Cancel',
    },
  ];

  const callMenu = callMenuList.filter(
    (menu) =>
      (menu.value === 'audio' && isVoiceCallAble) ||
      (menu.value === 'video' && isVideoCallAble) ||
      menu.value === 'cancel',
  );

  const handleCallButtonPress = (value, isVisible) => {
    if (value === 'audio' || value === 'video') {
      setIsCallVisible(isVisible);
      const callType = value as CallType;
      if (profileUser && me) {
        ChatHttpUtil.requestGoCallRoomWithFriends(
          navigation,
          [profileUser.id],
          me?.id,
          callType,
          (navigation, room: Room, callType: CallType) => {
            if (ChatSocketUtil.instance.isOnAlreadyCalling()) {
              return;
            }

            navigation.goBack();
            navigation.goBack();
            showCallView({
              open: true,
              viewType: 'full',
              params: { room: room, callType: callType, action: 'create' },
            });
          },
        );
      }
    } else if (value === 'cancel') {
      setIsCallVisible(false);
    }
  };

  if (error) {
    return (
      <Container>
        {/* @ts-ignore */}
        {/* <ImageContainer> */}
        <SafeAreaView style={{ flex: 1 }}>
          <CloseHeader
            position="left"
            border={false}
            white={true}
            button={buttonList.map((button, i) => (
              <TouchableOpacity key={i} onPress={() => button.onClick()}>
                {button.icon}
              </TouchableOpacity>
            ))}
          />
          <UserInfo style={{ justifyContent: 'flex-start' }}>
            <ProfileContainer
              open={isLightboxOpen}
              onOpen={() => setIsLightboxOpen(true)}
              willClose={() => setIsLightboxOpen(false)}
            >
              <ProfileImage
                open={isLightboxOpen}
                style={{
                  resizeMode: !isLightboxOpen ? undefined : 'contain',
                }}
                //@ts-ignore
                source={profileImage}
              />
            </ProfileContainer>
            <NameContainer>
              <Name>
                <NameText fontSize={themeFont}>Deleted Account</NameText>
              </Name>
            </NameContainer>
            {profileUser?.birth !== 'private' ? <Birthday fontSize={themeFont}>{birth}</Birthday> : <Birthday />}
          </UserInfo>
        </SafeAreaView>
        {/* </ImageContainer> */}
      </Container>
    );
  }

  return (
    <Container>
      <SwrContainer data={profileUser} error={error}>
        {/* @ts-ignore */}
        <ImageContainer source={{ uri: profileUser?.profile_background + '?w=1280&h=1280' }}>
          <View
            style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              height: Dimensions.get('window').height,
              width: Dimensions.get('window').width,
              position: 'absolute',
              zIndex: 0,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <SafeAreaView style={{ flex: 1 }}>
            <CloseHeader
              position="left"
              border={false}
              white={true}
              button={buttonList.map((button, i) => (
                <TouchableOpacity key={i} onPress={() => button.onClick()}>
                  {button.icon}
                </TouchableOpacity>
              ))}
            />
            <UserInfo>
              <ProfileContainer
                open={isLightboxOpen}
                onOpen={() => setIsLightboxOpen(true)}
                willClose={() => setIsLightboxOpen(false)}
              >
                <ProfileImage
                  open={isLightboxOpen}
                  style={{
                    resizeMode: !isLightboxOpen ? undefined : 'contain',
                  }}
                  //@ts-ignore
                  source={profileImage}
                />
              </ProfileContainer>
              <NameContainer>
                <Name>
                  {`${profileUser?.first_name} ${profileUser?.last_name !== null && profileUser?.last_name}`
                    .split(' ')
                    .map((word) => (
                      <NameText fontSize={themeFont}>{word}</NameText>
                    ))}
                </Name>
              </NameContainer>
              <ID fontSize={themeFont}>@{profileUser?.uid}</ID>
              {profileUser?.birth !== 'private' ? <Birthday fontSize={themeFont}>{birth}</Birthday> : <Birthday />}
            </UserInfo>
            {profileUser?.id !== user_id &&
            profileUser?.setting.sc_sns_account === 'private' &&
            profileUser?.friend === null &&
            profileUser?.follower === null ? (
              <ButtonNav>
                <Button onPress={() => goKokKok()}>
                  <Kok height={49} width={49} />
                  <ButtonLabel fontSize={themeFont}>Kok Kok me</ButtonLabel>
                </Button>
              </ButtonNav>
            ) : (
              <>
                {profileUser?.friend !== null || profileUser.id === user_id ? (
                  <ButtonNav>
                    <Button
                      onPress={() =>
                        me && profileUser
                          ? ChatHttpUtil.requestGoChatRoomWithFriends(navigation, [profileUser.id], me?.id) //이부분에서 에러나기도해요. me?.id로 나둬주세요.
                          : undefined
                      }
                    >
                      <Chat height={49} width={49} />
                      <ButtonLabel fontSize={themeFont}>
                        {profileUser?.id === user_id ? t('profile-detail.My Chatroom') : t('profile-detail.Chat')}
                      </ButtonLabel>
                    </Button>
                    {profileUser?.id === user_id ? (
                      <Button onPress={() => navigation.navigate('/more/profile-edit')}>
                        <Edit height={49} width={49} />
                        <ButtonLabel fontSize={themeFont}>{t('profile-detail.Profile Edit')}</ButtonLabel>
                      </Button>
                    ) : (
                      (isVideoCallAble || isVoiceCallAble) && (
                        <Button onPress={() => setIsCallVisible(true)}>
                          <Call height={49} width={49} />
                          <ButtonLabel fontSize={themeFont}>{t('profile-detail.Call')}</ButtonLabel>
                        </Button>
                      )
                    )}
                    <Button onPress={() => goKokKok()}>
                      <Kok height={49} width={49} />
                      <ButtonLabel fontSize={themeFont}>Kok Kok me</ButtonLabel>
                    </Button>
                  </ButtonNav>
                ) : profileUser?.block !== null ? (
                  <ButtonNav>
                    <Button onPress={() => unBlock()}>
                      <Block height={49} width={49} />
                      <ButtonLabel fontSize={themeFont}>{t('profile-detail.Unblock')}</ButtonLabel>
                    </Button>
                  </ButtonNav>
                ) : (
                  <ButtonNav>
                    <Button onPress={() => addFriend()}>
                      <AddFriend height={49} width={49} />
                      <ButtonLabel fontSize={themeFont}>{t('profile-detail.Add friend')}</ButtonLabel>
                    </Button>
                    <Button onPress={() => block()}>
                      <Block height={49} width={49} />
                      <ButtonLabel fontSize={themeFont}>{t('profile-detail.Block')}</ButtonLabel>
                    </Button>
                  </ButtonNav>
                )}
              </>
            )}
          </SafeAreaView>
        </ImageContainer>
      </SwrContainer>

      <Options menu={callMenu} modalVisible={isCallVisible} onMenuPress={handleCallButtonPress} />
    </Container>
  );
}

export default ProfileDetail;
