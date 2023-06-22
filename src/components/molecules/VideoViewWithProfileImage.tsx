import React from 'react';
import { Text } from 'react-native';
import User from 'types/auth/User';
import VideoTileMuteOn from 'assets/chats/call/video-tile-mute-on.svg';
import RNVideoRenderView from 'views/chats/components/amazon-chime/RNVideoRenderView';
import { Row, RowAlignEnum } from 'components/layouts/Row';
import styled from 'styled-components/native';
import { Column } from 'components/layouts/Column';

export const ProfileContainer = styled.View<{
  width?: string;
  height?: string;
  borderRadius?: number;
  aspectRatio?: number;
}>`
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

type ProfileCircleImageProps = { user?: User; width?; height?; aspectRatio?; isRinging? };
const ProfileCircleImage = function ({ user, width, height, aspectRatio, isRinging }: ProfileCircleImageProps) {
  if (isRinging) {
    return (
      <Column justify="center" align="center">
        <ProfileContainer width={width} height={height} aspectRatio={aspectRatio} borderRadius={900}>
          <ProfileImage
            source={
              !user?.profile_image || user.profile_image === 'private'
                ? require('assets/chats/img_profile.png')
                : { uri: user.profile_image }
            }
          />
        </ProfileContainer>
        <Text style={{ color: 'white' }}>
          {user?.first_name ?? ''} {user?.last_name ?? ''}
        </Text>
      </Column>
    );
  }

  return (
    <ProfileContainer width={width} height={height} aspectRatio={aspectRatio} borderRadius={900}>
      <ProfileImage
        source={
          !user?.profile_image || user.profile_image === 'private'
            ? require('assets/chats/img_profile.png')
            : { uri: user.profile_image }
        }
      />
    </ProfileContainer>
  );
};

type VideoViewWithProfileImageProps = {
  imageWidth: number | string;
  imageHeight: number | string;
  imageAspectRatio?: number;
  viewWidth: number | string;
  viewHeight: number | string;
  isOnTop: boolean;
  user?: User;
  useMeCss: boolean;
  isMute: boolean;
  isMuteIconTop: boolean;
  isSpeaking: boolean;
  paddingTop?: number | string;
  tileId?: number;
  align?: RowAlignEnum;
  isRinging?: boolean;
};
const VideoViewWithProfileImage = ({
  imageWidth,
  imageHeight,
  imageAspectRatio,
  viewWidth,
  viewHeight,
  tileId,
  isOnTop,
  user,
  isSpeaking,
  isMute,
  isMuteIconTop,
  useMeCss,
  paddingTop,
  align = 'center',
  isRinging = false,
}: VideoViewWithProfileImageProps) => {
  const exitMyVideoId = typeof tileId === 'number';
  const zIndex = isOnTop ? 999 : undefined;

  return (
    <Row
      style={{
        width: viewWidth,
        height: viewHeight,
        borderWidth: 1,
        borderColor: '#999999',
        marginRight: 11,
        backgroundColor: '#262525',
        paddingTop: !exitMyVideoId && paddingTop ? paddingTop : undefined,
        zIndex,
      }}
      justify={'center'}
      align={align}
    >
      {isMute && (
        <VideoTileMuteOn
          style={{
            position: 'absolute',
            top: isMuteIconTop ? 18 : undefined,
            bottom: isMuteIconTop ? undefined : 11,
            right: 11,
            zIndex: 1002,
          }}
        />
      )}
      {useMeCss && (
        <Text
          style={{
            position: 'absolute',
            zIndex: 1001,
            top: 10,
            left: 10,
            paddingTop: 3,
            paddingBottom: 3,
            paddingLeft: 6,
            paddingRight: 6,
            borderRadius: 100,
            backgroundColor: '#F68722',
            color: 'white',
            fontSize: 10,
            fontWeight: '900',
          }}
        >
          ME
        </Text>
      )}
      {exitMyVideoId ? (
        <RNVideoRenderView
          key={tileId}
          tileId={tileId}
          isOnTop={isOnTop}
          width={viewWidth}
          height={viewHeight}
          mirror={true}
        />
      ) : (
        <ProfileCircleImage
          key={tileId}
          user={user}
          width={imageWidth}
          height={imageHeight}
          aspectRatio={imageAspectRatio}
          isRinging={isRinging}
        />
      )}
      {isRinging && (
        <Row
          style={{
            position: 'absolute',
            zIndex: 1000,
            backgroundColor: 'rgba(237, 237, 237, 0.2)',
            width: '100%',
            height: '100%',
          }}
          justify="center"
          align="center"
        >
          <Text style={{ color: 'white', fontSize: 11 }}>Ringing...</Text>
        </Row>
      )}
    </Row>
  );
};

export default VideoViewWithProfileImage;
