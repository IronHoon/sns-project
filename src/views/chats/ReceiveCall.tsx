import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { Column } from 'components/layouts/Column';
import { Row } from 'components/layouts/Row';
import Space from 'components/utils/Space';
import { useAtomValue } from 'jotai';
import { useSetAtom } from 'jotai';
import { MainNavigationProp } from 'navigations/MainNavigator';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackHandler, Image, Keyboard, StyleProp, Text, TextStyle } from 'react-native';
import showCallViewAtom from 'stores/showCallViewAtom';
import userAtom from 'stores/userAtom';
import styled from 'styled-components/native';
import Room, { CallType } from 'types/chats/rooms/Room';
import ChatSocketUtil from 'utils/chats/ChatSocketUtil';
import friendListAtom from '../../stores/friendListAtom';
import useRingtone from 'hooks/useRingtone';
import CallManagerForIos from 'utils/calls/CallManagerForIos';
import { HangupCallback } from 'components/molecules/CallView';
import Sound from 'react-native-sound';

const Spacer = styled.View<{ flex?: number }>`
  flex: ${({ flex }) => (flex ? flex : 1)};
`;

const BodyColumn = styled(Column)<{ backgroundColor?: string }>`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: ${({ backgroundColor }) => (backgroundColor ? backgroundColor : undefined)};
`;
const ContentColumn = styled(Column)<{ flex?: number }>`
  flex: ${({ flex }) => (flex ? flex : 1)};
  justify-content: center;
  align-items: center;
  margin-left: 50px;
  margin-right: 50px;
`;
type MyTextProps = { children?; style?: StyleProp<TextStyle>; numberOfLines?: number };
const MyText = function ({ children, style, numberOfLines }: MyTextProps) {
  return (
    <Text
      style={[
        {
          fontSize: 20,
          color: '#262525',
          textAlign: 'center',
          overflow: 'hidden',
          fontWeight: '500',
        },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
};
const AvatarWrapper = styled(Row)`
  justify-content: center;
`;
const ButtonsWrapper = styled(Row)<{ flex?: number; backgroundColor?: string }>`
  flex: ${({ flex }) => (flex ? flex : 1)};
  background-color: ${({ backgroundColor }) => (backgroundColor ? backgroundColor : undefined)};
  padding-top: 30px;
  padding-right: 80px;
  padding-left: 80px;
  width: 100%;
`;

const CallHangUpImage = function () {
  return (
    <Image style={{ width: '100%', height: '100%' }} source={require('../../assets/chats/call/call_hang_up.png')} />
  );
};
const CallReceiveImage = function () {
  return (
    <Image style={{ width: '100%', height: '100%' }} source={require('../../assets/chats/call/call_receive.png')} />
  );
};

const MyButton = styled.View<{ size: number }>`
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
`;

const ProfilesImageBox = styled(Row)`
  width: 55px;
  height: 55px;
  border-radius: 70px;
  overflow: hidden;
  justify-content: center;
  margin: 4px;
`;
const ProfileImageBox = styled.View`
  width: 46px;
  height: 46px;
  border-radius: 70px;
  overflow: hidden;
  margin-right: 15px;
  margin-left: 5px;
`;

const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const ReceiveCall = function () {
  const showCallView = useSetAtom(showCallViewAtom);
  const navigation = useNavigation<MainNavigationProp>();
  const { params } = useRoute<any>();
  const room: Room = params.room;
  const callType: CallType = params.callType;
  const isVideo = callType === 'video';
  const me = useAtomValue(userAtom);
  const { t } = useTranslation();
  const friendList = useAtomValue(friendListAtom);
  const [profileImage, setProfileImage] = useState('');

  const { play, stop } = useRingtone();

  useEffect(() => {
    var listenerId = HangupCallback.add(() => {
      rejectCall();
    });

    return () => {
      HangupCallback.remove(listenerId);
    };
  }, []);

  const rejectCall = () => {
    CallManagerForIos.me.util.hangupAll();
    ChatSocketUtil.instance.emitExitCall('ReceiveCall', room._id);
    navigation.goBack();
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      rejectCall();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      Keyboard.dismiss();
    }, []),
  );
  useEffect(() => {
    Sound.setCategory('Ambient');
    play();

    return () => {
      stop();
    };
  }, []);

  const usersWithoutMe = useMemo(() => {
    return (room?.joined_users ?? []).filter((user) => user.id !== me?.id);
  }, [me?.id, room?.joined_users]);

  const defaultImage = (i: any) => {
    if (room?.joined_users?.[i]) {
      const isFriend = friendList?.filter((item) => item === room?.joined_users?.[i].id).length === 1;
      if (room?.joined_users?.[i].sc_profile_photo === 'friends' && isFriend) {
        if (room?.joined_users?.[i].profile_image === null || room?.joined_users?.[i].profile_image === 'private') {
          return require('assets/chats/img_profile.png');
        } else {
          return { uri: room?.joined_users?.[i].profile_image };
        }
      } else if (room?.joined_users?.[i].sc_profile_photo === 'public') {
        if (room?.joined_users?.[i].profile_image === null || room?.joined_users?.[i].profile_image === 'private') {
          return require('assets/chats/img_profile.png');
        } else {
          return { uri: room?.joined_users?.[i].profile_image };
        }
      } else {
        return require('assets/chats/img_profile.png');
      }
    } else {
      return undefined;
    }
  };

  useFocusEffect(
    useCallback(() => {
      const isFriend = friendList?.filter((item) => item === usersWithoutMe?.[0].id).length === 1;
      if (usersWithoutMe?.[0].sc_profile_photo === 'friends' && isFriend) {
        if (usersWithoutMe?.[0].profile_image === null || usersWithoutMe?.[0].profile_image === '') {
          setProfileImage(require('assets/chats/img_profile.png'));
        } else if (usersWithoutMe?.[0].profile_image) {
          //@ts-ignore
          setProfileImage({ uri: usersWithoutMe?.[0].profile_image });
        }
      } else if (usersWithoutMe?.[0].sc_profile_photo === 'public') {
        if (usersWithoutMe?.[0].profile_image === null || usersWithoutMe?.[0].profile_image === '') {
          setProfileImage(require('assets/chats/img_profile.png'));
        } else if (usersWithoutMe?.[0].profile_image) {
          //@ts-ignore
          setProfileImage({ uri: usersWithoutMe?.[0].profile_image });
        }
      } else {
        setProfileImage(require('assets/chats/img_profile.png'));
      }
      Keyboard.dismiss();
    }, []),
  );

  const usersWithoutMeLength = usersWithoutMe?.length ?? 0;

  const names =
    usersWithoutMeLength > 1
      ? usersWithoutMe.map((user) => `${user.first_name} ${user.last_name}`).join(', ')
      : `${usersWithoutMe?.[0]?.first_name ?? ''} ${usersWithoutMe?.[0]?.last_name ?? ''}`;
  const lengthStrOfNames = usersWithoutMeLength > 1 ? usersWithoutMeLength.toString() : '';
  return (
    <BodyColumn backgroundColor={!isVideo ? '#ffffff' : '##f8f8f8'}>
      <ContentColumn flex={835}>
        <Spacer flex={30} />
        <Row>
          <MyText numberOfLines={1}>{names} </MyText>
          <Space width={5} />
          <MyText style={{ color: '#f68722', fontWeight: 'bold' }}>{lengthStrOfNames}</MyText>
        </Row>
        <MyText>{t('chats-main.is calling you')}</MyText>
        <Spacer flex={10} />
        <AvatarWrapper>
          {usersWithoutMeLength > 1 ? (
            <Column align={'center'}>
              <Row justify={'center'}>
                <ProfilesImageBox>
                  <ProfileImage source={defaultImage(0)} />
                </ProfilesImageBox>
                <ProfilesImageBox>
                  <ProfileImage source={defaultImage(1)} />
                </ProfilesImageBox>
              </Row>
              <Row>
                <ProfilesImageBox>
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
        </AvatarWrapper>
        <Spacer flex={75} />
      </ContentColumn>
      <ButtonsWrapper flex={165} backgroundColor={isVideo ? '#ffffff' : undefined}>
        <MyButton size={70} onTouchStart={rejectCall}>
          <CallHangUpImage />
        </MyButton>
        <Spacer flex={1} />
        <MyButton
          size={70}
          onTouchStart={() => {
            if (ChatSocketUtil.instance.isOnAlreadyCalling()) return;

            navigation.goBack();
            showCallView({
              open: true,
              viewType: 'full',
              params: { room: room, callType: callType, action: 'join' },
            });
          }}
        >
          <CallReceiveImage />
        </MyButton>
      </ButtonsWrapper>
    </BodyColumn>
  );
};

export default ReceiveCall;
