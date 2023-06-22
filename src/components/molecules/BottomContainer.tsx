import React, { useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import User from 'types/auth/User';
import Nullable from 'types/_common/Nullable';
import SpeakerOn from 'assets/chats/call/speaker_on.svg';
import SpeakerOff from 'assets/chats/call/speaker_off.svg';
import VideoOn from 'assets/chats/call/video_on.svg';
import VideoOff from 'assets/chats/call/video_off.svg';
import VoiceOn from 'assets/chats/call/voice_on.svg';
import VoiceOff from 'assets/chats/call/voice_off.svg';
import FlipOn from 'assets/chats/call/flip_on.svg';
import FlipOff from 'assets/chats/call/flip_off.svg';
import CallOn from 'assets/chats/call/call_on.svg';
import VideoViewWithProfileImage from './VideoViewWithProfileImage';
import { UserWithAttendeeId } from './CallView';
import LogUtil from 'utils/LogUtil';
import AmazonChimeUtil from 'utils/calls/AmazonChimeUtil';

type BottomContainerProps = {
  flipOn: boolean;
  speakerOn: boolean;
  videoOn: boolean;
  muteOn: boolean;
  videoIdByAttendeeId: Map<any, any>;
  callState;
  handleFlip;
  handleSpeaker;
  handleMute;
  handleHangUp;
  handleVideo;
  attendeeIdListForActiveSpeaker: string[];
  attendeeIdListForMute: string[];
  me?: Nullable<User>;
  userWithAttendeeIdByContact: Map<string, UserWithAttendeeId>;
  currentSpeaker: UserWithAttendeeId | null;
  userListToWait: User[];
};
const BottomContainer = function ({
  flipOn,
  speakerOn,
  videoOn,
  muteOn,
  videoIdByAttendeeId,
  callState,
  handleFlip,
  handleSpeaker,
  handleMute,
  handleHangUp,
  handleVideo,
  attendeeIdListForActiveSpeaker,
  attendeeIdListForMute,
  me,
  userWithAttendeeIdByContact,
  currentSpeaker,
  userListToWait,
}: BottomContainerProps) {
  useEffect(() => {
    LogUtil.info('BottomContainer userWithAttendeeIdByContact', [...userWithAttendeeIdByContact.entries()]);
  }, [userWithAttendeeIdByContact]);
  const ringing = callState === 'ringing';
  const opacityWhenRinging = { opacity: ringing ? 0.5 : undefined };
  const width = 100;
  const height = 180;

  return (
    <View>
      <ButtonContainer>
        <Button onPress={ringing ? () => {} : handleSpeaker}>
          {speakerOn ? <SpeakerOn style={opacityWhenRinging} /> : <SpeakerOff style={opacityWhenRinging} />}
          <ButtonLabel>Speaker</ButtonLabel>
        </Button>
        {videoOn && (
          <Button onPress={ringing ? () => {} : handleFlip}>
            {flipOn ? <FlipOn style={opacityWhenRinging} /> : <FlipOff style={opacityWhenRinging} />}
            <ButtonLabel>Flip</ButtonLabel>
          </Button>
        )}
        <Button onPress={ringing ? () => {} : handleVideo}>
          {videoOn ? <VideoOn style={opacityWhenRinging} /> : <VideoOff style={opacityWhenRinging} />}
          <ButtonLabel>Video</ButtonLabel>
        </Button>
        <Button onPress={ringing ? () => {} : handleMute}>
          {muteOn ? <VoiceOn style={opacityWhenRinging} /> : <VoiceOff style={opacityWhenRinging} />}
          <ButtonLabel>Mute</ButtonLabel>
        </Button>
        <Button onPress={handleHangUp}>
          <CallOn />
          <EndCall>End call</EndCall>
        </Button>
      </ButtonContainer>
      {callState === 'calling' && (userWithAttendeeIdByContact.size > 0 || userListToWait.length > 0) && (
        <ScrollView
          style={{
            maxHeight: 180,
            marginLeft: 30,
            position: 'absolute',
            bottom: 150,
            zIndex: 999,
          }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        >
          {Array.from(userWithAttendeeIdByContact.keys())
            .filter((contact) => contact !== currentSpeaker?.user.contact)
            .sort((aContact, bContact) => {
              if (aContact === me?.contact) {
                return -1;
              }

              if (bContact === me?.contact) {
                return 1;
              }

              return 0;
            })
            .map((contact) => {
              const userWithAttendeeId = userWithAttendeeIdByContact.get(contact)!;
              const attendeeId = userWithAttendeeId.attendeeId;
              const user = userWithAttendeeId.user;

              const tileId = attendeeId && videoIdByAttendeeId.get(attendeeId);
              const isMute = attendeeId ? attendeeIdListForMute.includes(attendeeId) : false;
              const isSpeaking = attendeeId ? attendeeIdListForActiveSpeaker.includes(attendeeId) : false;

              if (user) {
                return (
                  <TouchableOpacity
                    key={user.id}
                    onPress={() => {
                      if (user.id !== me?.id) {
                        AmazonChimeUtil.instance.setter.setCurrentSpeaker(userWithAttendeeId);
                      }
                    }}
                  >
                    <VideoViewWithProfileImage
                      user={user}
                      tileId={tileId}
                      viewWidth={width}
                      viewHeight={height}
                      imageWidth={'57px'}
                      imageHeight={'57px'}
                      isOnTop={true}
                      useMeCss={user.id === me?.id}
                      isSpeaking={isSpeaking}
                      isMute={isMute}
                      isMuteIconTop={false}
                    />
                  </TouchableOpacity>
                );
              }
              return <Text> </Text>;
            })}
          {userListToWait.map((user) => (
            <VideoViewWithProfileImage
              user={user}
              viewWidth={width}
              viewHeight={height}
              imageWidth={'57px'}
              imageHeight={'57px'}
              isOnTop={true}
              useMeCss={false}
              isSpeaking={false}
              isMute={false}
              isMuteIconTop={false}
              isRinging={true}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default BottomContainer;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  height: 130px;
`;
const Button = styled.Pressable`
  justify-content: center;
  align-items: center;
`;
const ButtonLabel = styled.Text`
  font-size: 13px;
  color: #bcb3c5;
  margin-top: 5px;
`;
const EndCall = styled.Text`
  font-size: 13px;
  color: #ff0000;
  margin-top: 5px;
`;
