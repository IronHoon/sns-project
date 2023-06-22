import React, { useRef } from 'react';
import { Dimensions, View } from 'react-native';
import { useAtomValue } from 'jotai';
import User from 'types/auth/User';
import { Column } from 'components/layouts/Column';
import { Row } from 'components/layouts/Row';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import friendListAtom from '../../stores/friendListAtom';
import VideoViewWithProfileImage from './VideoViewWithProfileImage';
import { UserWithAttendeeId } from './CallView';
import styled, { css } from 'styled-components/native';
import { COLOR } from 'constants/COLOR';

type TopContainerProps = {
  users;
  usersWithoutMe;
  callState;
  videoOn;
  currentSpeaker?: UserWithAttendeeId | null;
  videoIdByAttendeeId: Map<string, number>;
  attendeeIdListForMute: string[];
};
const TopContainer = function ({
  users,
  usersWithoutMe,
  callState,
  videoOn,
  currentSpeaker,
  videoIdByAttendeeId,
  attendeeIdListForMute,
}: TopContainerProps) {
  const zoomableViewRef = useRef<ReactNativeZoomableView | null>(null);
  // const defaultImage = (users: User[], i: any) =>
  //   !users?.[i]?.profile_image || users?.[i]?.profile_image === 'private'
  //     ? require('assets/chats/img_profile.png')
  //     : { uri: users[i].profile_image };
  const isGroupUser = usersWithoutMe.length > 1;
  const friendList = useAtomValue(friendListAtom);

  const defaultImage = (users: User[], i: any) => {
    if (users?.[i]) {
      const isFriend = friendList?.filter((item) => item === users?.[i].id).length === 1;
      if (users?.[i].sc_profile_photo === 'friends' && isFriend) {
        if (users?.[i].profile_image === null || users?.[i].profile_image === 'private') {
          return require('assets/chats/img_profile.png');
        } else {
          return { uri: users?.[i].profile_image };
        }
      } else if (users?.[i].sc_profile_photo === 'public') {
        if (users?.[i].profile_image === null || users?.[i].profile_image === 'private') {
          return require('assets/chats/img_profile.png');
        } else {
          return { uri: users?.[i].profile_image };
        }
      } else {
        return require('assets/chats/img_profile.png');
      }
    } else {
      return undefined;
    }
  };

  if (callState === 'ringing') {
    return (
      <View
        style={{
          flex: 1,
          marginTop: Dimensions.get('window').height / 10,
          alignItems: 'center',
        }}
      >
        {!isGroupUser ? (
          <ProfileContainer>
            <ProfileImage source={defaultImage(usersWithoutMe, 0)} />
          </ProfileContainer>
        ) : (
          <>
            <Column>
              <Row>
                <ProfilesContainer>
                  <ProfileImage source={defaultImage(users, 0)} />
                </ProfilesContainer>
                <ProfilesContainer>
                  <ProfileImage source={defaultImage(users, 1)} />
                </ProfilesContainer>
              </Row>
              <Row>
                <ProfilesContainer>
                  <ProfileImage source={defaultImage(users, 2)} />
                </ProfilesContainer>
                <ProfilesContainer>
                  <ProfileImage source={defaultImage(users, 3)} />
                </ProfilesContainer>
              </Row>
            </Column>
          </>
        )}
        <Row style={{ paddingHorizontal: 50, alignItems: 'center' }}>
          <Name numberOfLines={1}>
            {usersWithoutMe.length > 1
              ? usersWithoutMe.map((user) => `${user.first_name} ${user.last_name}`).join(', ')
              : `${usersWithoutMe[0]?.first_name ?? ''} ${usersWithoutMe[0]?.last_name ?? ''}`}
          </Name>
          {isGroupUser && <Count>{users.length}</Count>}
        </Row>
        <State>{callState === 'ringing' && 'Ringing..'}</State>
      </View>
    );
  }

  const user = currentSpeaker?.user;
  const attendeeId = currentSpeaker?.attendeeId;
  const tileId = attendeeId ? videoIdByAttendeeId.get(attendeeId) : undefined;
  const isMute = attendeeId ? attendeeIdListForMute.includes(attendeeId) : false;
  // LogUtil.info('currentSpeaker, tileId', [currentSpeaker, tileId]);

  return (
    <ReactNativeZoomableView
      ref={zoomableViewRef}
      maxZoom={2}
      minZoom={1.03}
      zoomStep={0.5}
      initialZoom={1.03}
      bindToBorders={true}
      style={{
        flex: 1,
      }}
      onDoubleTapAfter={(event, zoomableViewEventObject) => {
        if (zoomableViewRef?.current) {
          zoomableViewRef.current.zoomTo(1);
        }
      }}
    >
      <VideoViewWithProfileImage
        key={user?.id}
        user={user}
        tileId={tileId}
        isSpeaking={false}
        isMute={isMute}
        viewWidth={'100%'}
        viewHeight={'100%'}
        imageWidth={'150px'}
        imageHeight={'150px'}
        paddingTop={120}
        isOnTop={false}
        align={'flex-start'}
        useMeCss={false}
        isMuteIconTop={true}
      />
    </ReactNativeZoomableView>
  );
};

const ProfileContainer = styled.View<{ width?: string; height?: string; borderRadius?: number; aspectRatio?: number }>`
  width: ${({ width }) => (width ? width : '120px')};
  height: ${({ height }) => (height ? height : '120px')};
  border-radius: ${({ borderRadius }) => (borderRadius ? borderRadius : 60)}px;
  ${({ aspectRatio }) => (aspectRatio ? `aspectRatio:${aspectRatio};` : '')};
  overflow: hidden;
  margin: 5px;
`;
const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`;
const ProfilesContainer = styled.View<{ border?: boolean }>`
  width: 57px;
  height: 57px;
  border-radius: 60px;
  overflow: hidden;
  margin: 5px;
  ${({ border }) =>
    border &&
    css`
      border-color: ${COLOR.PRIMARY};
      border-width: 3px;
    `}
`;
const Name = styled.Text`
  margin-top: 20px;
  font-size: 20px;
  font-weight: 500;
`;
const Count = styled.Text`
  font-size: 20px;
  color: ${COLOR.PRIMARY};
  margin-top: 20px;
  margin-left: 10px;
`;
const State = styled.Text`
  margin-top: 10px;
  font-size: 13px;
  color: #999999;
`;

export default TopContainer;
