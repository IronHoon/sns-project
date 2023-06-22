import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler, Keyboard, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import showCallViewAtom, { CallViewType } from 'stores/showCallViewAtom';
import styled from 'styled-components/native';
import useSocket from 'hooks/useSocket';
import Room from 'types/chats/rooms/Room';
import ChatSocketUtil, { JoinCallAction } from 'utils/chats/ChatSocketUtil';
import User from 'types/auth/User';
import { MainNavigationProp } from 'navigations/MainNavigator';
import userAtom from 'stores/userAtom';
import Add from 'assets/chats/call/ic_add.svg';
import Max from 'assets/chats/call/ic_max.svg';
import MainLayout from 'components/layouts/MainLayout';
import PrevHeader from './PrevHeader';
import LogUtil from 'utils/LogUtil';
import InCallManager from 'react-native-incall-manager';
import { ChooseFriendsCallback, ChooseFriendsCloseCallback } from 'views/chats/ChooseFriends';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeFunction } from 'utils/calls/AmazonChimeNativeBridge';
import { useTranslation } from 'react-i18next';
import useRingtone from 'hooks/useRingtone';
import VideoViewWithProfileImage from './VideoViewWithProfileImage';
import TopContainer from './TopContainer';
import BottomContainer from './BottomContainer';
import useAppState from 'hooks/useAppState';
import { activateKeepAwake, deactivateKeepAwake } from '@sayem314/react-native-keep-awake';
import MySetting from 'MySetting';
import { showRoutePicker, useAvAudioSessionRoutes } from 'react-airplay';
import ClickUtil from 'utils/ClickUtil';
import AmazonChimeUtil from 'utils/calls/AmazonChimeUtil';
import { EventRegister } from 'react-native-event-listeners';
import FirebaseMessageUtil from 'utils/chats/FirebaseMessageUtil';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import CallManagerForAos from 'utils/calls/CallManagerForAos';
import Sound, { setCategory } from 'react-native-sound';

const util = {
  handleFlip(setFlipOn) {
    setFlipOn((flipOn) => {
      const nextFlipOn = !flipOn;
      ChatSocketUtil.instance.amazonChimeUtil.switchCamera();
      return nextFlipOn;
    });
  },
  handleSpeaker(setSpeakerOn) {
    setSpeakerOn((speakerOn) => {
      const nextSpeakerOn = !speakerOn;
      if (MySetting.isIos) {
        //ios는 스피커를 위해서 airplay를 활용해야 한다
        showRoutePicker({ prioritizesVideoDevices: true });
        return speakerOn;
      } else {
        if (nextSpeakerOn) {
          InCallManager.start({ media: 'video' });
          InCallManager.setSpeakerphoneOn(nextSpeakerOn);
        } else {
          InCallManager.setSpeakerphoneOn(nextSpeakerOn);
          InCallManager.stop();
        }
        return nextSpeakerOn;
      }
    });
  },
  handleVideo(setVideoOn, setSpeakerOn) {
    setVideoOn((videoOn) => {
      if (!videoOn) {
        setSpeakerOn(false);
      }
      const switchedVideoOn = !videoOn;
      ChatSocketUtil.instance.amazonChimeUtil.setVideoOn(switchedVideoOn);
      return switchedVideoOn;
    });
  },
  openCallView(open: boolean, viewType: CallViewType, showCallView) {
    showCallView((callViewStatus) => {
      return {
        ...callViewStatus,
        open: open,
        viewType: viewType,
      };
    });
  },
  async rejectCall() {
    try {
      AmazonChimeUtil.instance.stopMeeting();
    } catch (e) {
      LogUtil.info('rejectCall 에러', e);
    }

    try {
      await ChatSocketUtil.instance.easy.leaveCall('CallView');
    } catch (e) {
      LogUtil.info('rejectCall 에러', e);
    }
  },
  handleMute(setMuteOn) {
    setMuteOn((muteOn) => {
      const switchedMuteOn = !muteOn;
      ChatSocketUtil.instance.amazonChimeUtil.setMuteOn(switchedMuteOn);
      return switchedMuteOn;
    });
  },
  resetPage(callType, setVideoOn, setFlipOn, setSpeakerOn, setMuteOn, setUserListToWait) {
    if (!AmazonChimeUtil.instance.byCallkeep) {
      AmazonChimeUtil.instance.setter.setCallState('ringing');
    }
    setUserListToWait([]);
    setVideoOn(callType === 'video');
    setFlipOn(false);
    setSpeakerOn(false);
    setMuteOn(false);
    if (!AmazonChimeUtil.instance.byCallkeep) {
      AmazonChimeUtil.instance.setter.setUserWithAttendeeIdByContact(new Map());
      AmazonChimeUtil.instance.setter.setVideoIdByAttendeeId(new Map());
      AmazonChimeUtil.instance.setter.setCurrentSpeaker(null);
    }
  },
};

const useEffectEtcCall = (chatSocketUtil: ChatSocketUtil, showCallView, stop, videoIdByAttendeeId, open, viewType) => {
  const backHandler = useRef<any>();
  useEffect(() => {
    const removeBackHandler = () => {
      if (backHandler.current) {
        backHandler.current.remove();
        backHandler.current = null;
      }
    };

    try {
      if (!open) {
        removeBackHandler();
        return;
      }

      if (viewType === 'invite-friends') {
        removeBackHandler();
        return;
      }

      backHandler.current = BackHandler.addEventListener('hardwareBackPress', () => {
        util.rejectCall();
        return true;
      });
    } catch (e) {
      removeBackHandler();
    }
  }, [open, viewType]);

  //-------차임에 의해 해당 페이지가 꺼지도록 하는 코드
  //아마존 차임 연결이 끊기면, 화면 종료하는 코드 추가
  // useAppState({
  //   onBackground: () => {
  //   },
  //   onForeground: () => {
  //     if (!chatSocketUtil.amazonChimeUtil.isConnected) {
  //       util.openCallView(false, 'full', showCallView);
  //     }
  //   },
  // });
  useEffect(() => {
    if (!chatSocketUtil.amazonChimeUtil.isConnected) {
      util.openCallView(false, 'full', showCallView);
    }
  }, [chatSocketUtil.amazonChimeUtil.isConnected]);

  useFocusEffect(
    useCallback(() => {
      var listenerId = HangupCallback.add(() => {
        LogUtil.info('전화 끊기 예약이 실행합니다.');

        stop();
        util.openCallView(false, 'full', showCallView);

        for (const videoId of Array.from(videoIdByAttendeeId.values())) {
          try {
            NativeFunction.unbindVideoView(videoId);
          } catch (e) {
            LogUtil.info('전화 끊기 예약 unbindVideoView 에러', e);
          }
        }

        (async () => {
          util.rejectCall();
        })();
      });

      return () => {
        HangupCallback.remove(listenerId);
      };
    }, [videoIdByAttendeeId]),
  );
};
const useRingtoneForCallView = (show, action, callState) => {
  const { play, stop } = useRingtone();
  useEffect(() => {
    if (!show) {
      return;
    }
    if (action !== 'create') {
      return;
    }
    if (callState === 'ringing') {
      Sound.setCategory('Playback');
      play();
    } else {
      stop();
    }

    return () => {
      stop();
    };
  }, [action, show, callState]);

  return { play, stop };
};

export interface UserWithAttendeeId {
  user: User;
  attendeeId: string;
}

const useEffectToShowCallViewWhenAppIsForeground = () => {
  const showCallView = useSetAtom(showCallViewAtom);

  const [isForeground, setForeground] = useState(false);

  useAppState({
    onForeground: () => {
      setForeground(true);
    },
    onBackground: () => {
      setForeground(false);
    },
  });

  useEffect(() => {
    LogUtil.info('useEffectToShowCallViewWhenAppIsForeground isForeground', [isForeground]);
    const remoteMessage = FirebaseMessageUtil.callRemoteMessage;
    if (isForeground && remoteMessage) {
      if (MySetting.isAndroid) {
        CallManagerForAos.deleteCallOnAndroid();
      }
      FirebaseMessageUtil.callRemoteMessage = null;
      const roomId = remoteMessage?.data?.room_id ?? '';
      const serverCallType = remoteMessage?.data?.call_type;
      const clientCallType = serverCallType === 'face_talk' ? 'video' : 'audio';

      if (!roomId) {
        LogUtil.error('onForeground roomId is empty');
        return;
      }

      ChatHttpUtil.requestGetRoom(roomId).then((room) => {
        if (room) {
          showCallView({
            open: true,
            viewType: 'full',
            params: {
              room,
              callType: clientCallType,
              action: 'join',
            },
          });
        }
      });
    }
  }, [ChatSocketUtil.instance.amazonChimeUtil.isConnected, isForeground, FirebaseMessageUtil.callRemoteMessage]);
};

const useEffectResetByOpen = (
  open,
  setIsJoinCallNeeded,
  callType,
  setVideoOn,
  setFlipOn,
  setSpeakerOn,
  setMuteOn,
  setUserListToWait,
) => {
  useEffect(() => {
    if (open) {
      activateKeepAwake();
      util.resetPage(callType, setVideoOn, setFlipOn, setSpeakerOn, setMuteOn, setUserListToWait);
      setIsJoinCallNeeded(true);
    } else {
      AmazonChimeUtil.instance.byCallkeep = false;
      AmazonChimeUtil.instance.stopMeeting();
      deactivateKeepAwake();
      setIsJoinCallNeeded(false);
      util.resetPage(callType, setVideoOn, setFlipOn, setSpeakerOn, setMuteOn, setUserListToWait);
    }
  }, [open]);
};
const useEffectJoinCall = (room, roomId, action, videoOn, isJoinCallNeeded, callType, setUserListToWait, isGroup) => {
  useEffect(() => {
    if (AmazonChimeUtil.instance.byCallkeep) {
      AmazonChimeUtil.instance.setter.setCallState('calling', videoOn);
      return;
    }
    if (!isJoinCallNeeded) {
      return;
    }

    const errorHandler = (error) => {
      // let errorStr = error?.response?.data?.code ? error?.response?.data?.code : JSON.stringify(error);
      // Alert.alert(
      //   'Error',
      //   `${t('chats-main.The call was terminated by the server. please try again later')} [code:${errorStr}]`,
      // );
      util.rejectCall();
    };

    const onEnterCallCallback = async ({ user, meeting, attendee }) => {
      LogUtil.info(`CallView onEnterCall`);
      if (!isGroup) {
        await AmazonChimeUtil.instance.startMeeting(meeting, attendee, videoOn);
      }

      setUserListToWait((userListToWait) => userListToWait.filter((localUser) => localUser.id !== user.id));
    };
    ChatSocketUtil.instance.easy
      .joinCall('CallView', roomId, callType, action, onEnterCallCallback)
      .then(async ({ meeting, attendee }) => {
        try {
          if (isGroup) {
            await AmazonChimeUtil.instance.startMeeting(meeting, attendee, videoOn);
          }
        } catch (error) {
          errorHandler(error);
        }
      })
      .catch(errorHandler);
  }, [isJoinCallNeeded, callType, action, room]);
};

export default function CallView() {
  const { t } = useTranslation();
  const navigation = useNavigation<MainNavigationProp>();
  const { chatSocketUtil, chatStatus, forceUpdateForChatStatus } = useSocket();
  const [{ open, viewType, params }, showCallView] = useAtom(showCallViewAtom);

  const callType = params?.callType ?? 'audio';
  const action: JoinCallAction = params?.action ?? 'create';
  const room: Room = params.room;

  const users: User[] = room.joined_users ?? [];
  const roomId = room._id;
  const isGroup: boolean = room.type === 'group'; //1:1인지, 그룹인지.
  const me = useAtomValue(userAtom);
  const usersWithoutMe: User[] = useMemo(() => {
    return users.filter((user) => user.id !== me?.id);
  }, [me?.id, users]);

  const [videoOn, setVideoOn] = useState<boolean>(callType === 'video');
  const [flipOn, setFlipOn] = useState<boolean>(false);
  const [speakerOn, setSpeakerOn] = useState<boolean>(false);
  const [muteOn, setMuteOn] = useState<boolean>(false);
  const [userListToWait, setUserListToWait] = useState<User[]>([]);

  const routes = useAvAudioSessionRoutes();
  const isSpeakerPhoneForIos =
    routes.length > 0 && routes[0].portType.toLocaleLowerCase().includes('speaker') ? true : false;
  useEffect(() => {
    setSpeakerOn(isSpeakerPhoneForIos);
  }, [isSpeakerPhoneForIos]);

  const [show, setShow] = useState(false);
  const [isJoinCallNeeded, _setIsJoinCallNeeded] = useState(false);
  const setIsJoinCallNeeded = (isJoinCallNeeded: boolean) => {
    setShow(isJoinCallNeeded);
    _setIsJoinCallNeeded(isJoinCallNeeded);
  };

  const callState = chatSocketUtil.chatStatus.callState;
  const userWithAttendeeIdByContact = chatSocketUtil.chatStatus.callUserWithAttendeeIdByContact;
  const currentSpeaker = chatSocketUtil.chatStatus.callCurrentSpeaker;
  useEffect(() => {
    const speaker = Array.from(userWithAttendeeIdByContact.values()).filter(
      (userWithAttendeeId) => userWithAttendeeId.user.contact !== me?.contact,
    )?.[0];
    if (speaker) {
      AmazonChimeUtil.instance.setter.setCurrentSpeaker(speaker);
    }
  }, [userWithAttendeeIdByContact.size, me]);
  const videoIdByAttendeeId = chatSocketUtil.chatStatus.callVideoIdByAttendeeId;
  const attendeeIdListForActiveSpeaker = chatSocketUtil.chatStatus.callAttendeeIdListForActiveSpeaker;
  const attendeeIdListForMute = chatSocketUtil.chatStatus.callAttendeeIdListForMute;

  const { play, stop } = useRingtoneForCallView(show, action, callState);
  useEffectToShowCallViewWhenAppIsForeground();
  useEffectResetByOpen(
    open,
    setIsJoinCallNeeded,
    callType,
    setVideoOn,
    setFlipOn,
    setSpeakerOn,
    setMuteOn,
    setUserListToWait,
  );
  useEffectJoinCall(room, roomId, action, videoOn, isJoinCallNeeded, callType, setUserListToWait, isGroup);
  useEffectEtcCall(chatSocketUtil, showCallView, stop, videoIdByAttendeeId, open, viewType);

  /*
    전화가 오면 키보드 비활성화
    Dismiss keyboard when call view show
   */
  useEffect(() => {
    if (show) {
      Keyboard.dismiss();
    }
  }, [show]);

  if (!show) {
    return <></>;
  }

  if (viewType === 'invite-friends') {
    return <></>;
  }

  if (viewType === 'pip') {
    const user = currentSpeaker?.user;
    const attendeeId = currentSpeaker?.attendeeId;
    const tileId = attendeeId ? videoIdByAttendeeId.get(attendeeId) : undefined;
    const isMute = attendeeId ? attendeeIdListForMute.includes(attendeeId) : false;

    return (
      <View
        style={[
          tw`shadow-lg`,
          {
            width: 100,
            height: 180,
            position: 'absolute',
            bottom: 75,
            right: 20,
          },
        ]}
      >
        {user && (
          <VideoViewWithProfileImage
            key={user?.id}
            user={user}
            tileId={tileId}
            isMute={isMute}
            viewWidth={'100%'}
            viewHeight={'100%'}
            imageWidth={'57px'}
            imageHeight={'57px'}
            isOnTop={true}
            useMeCss={false}
            isSpeaking={false}
            isMuteIconTop={false}
          />
        )}
        <Max
          style={{ position: 'absolute', top: 6, right: 6, zIndex: 1000 }}
          onTouchStart={() => util.openCallView(true, 'full', showCallView)}
        />
      </View>
    );
  }

  return (
    <AbsoluteLayout>
      <MainLayout>
        <PrevHeader
          border={false}
          button={
            callState === 'calling'
              ? [
                  <TouchableOpacity
                    key={0}
                    onPress={() => {
                      navigation.navigate('/chats/new-chat/choose-friends', {
                        chatRoomType: 'chat',
                        roomId: roomId,
                        joinedUsers: room?.joined_users,
                        byCallView: true,
                        callback: new ChooseFriendsCallback(
                          async ({
                            navigation,
                            selectedFriendList,
                            roomId,
                            roomTypeOfClient,
                            userId,
                          }: {
                            navigation;
                            selectedFriendList: User[];
                            roomId;
                            roomTypeOfClient;
                            userId;
                          }) => {
                            try {
                              for (const selectedFriend of selectedFriendList) {
                                if (!room.joined_users.some((user) => user.id === selectedFriend.id)) {
                                  room.joined_users.push(selectedFriend);
                                }
                              }

                              chatStatus.currentRoomForCall = room;
                              forceUpdateForChatStatus();
                            } catch (error: any) {}

                            try {
                              const selectedFriendIdList: string[] = selectedFriendList.map((selectedFriend, i) =>
                                String(selectedFriend.id),
                              );
                              await chatSocketUtil.easy.inviteUserInCall('Call', selectedFriendIdList);
                              util.openCallView(true, 'full', showCallView);
                              navigation.goBack();
                            } catch (error: any) {
                              if (error?.response?.data?.code) {
                                Alert.alert('Error', t(error?.response?.data?.code));
                              } else {
                                Alert.alert('Error', JSON.stringify(error));
                              }
                            }

                            try {
                              for (const selectedFriend of selectedFriendList) {
                                if (!userListToWait.some((user) => user.id === selectedFriend.id)) {
                                  setUserListToWait([...userListToWait, selectedFriend]);
                                  setTimeout(() => {
                                    setUserListToWait((userListToWait) =>
                                      userListToWait.filter((user) => user.id !== selectedFriend.id),
                                    );
                                  }, 60 * 1000);
                                }
                              }
                            } catch (error: any) {}
                          },
                        ),
                        closeCallback: new ChooseFriendsCloseCallback(async ({ navigation }) => {
                          util.openCallView(true, 'full', showCallView);
                          navigation.goBack();
                        }),
                      });
                      setTimeout(() => {
                        util.openCallView(true, 'invite-friends', showCallView);
                      }, 500);
                    }}
                  >
                    <Add />
                  </TouchableOpacity>,
                ]
              : []
          }
          onClick={callState === 'ringing' ? () => {} : () => util.openCallView(true, 'pip', showCallView)}
        />
        <TopContainer
          users={users}
          usersWithoutMe={usersWithoutMe}
          callState={callState}
          videoIdByAttendeeId={videoIdByAttendeeId}
          videoOn={videoOn}
          currentSpeaker={currentSpeaker}
          attendeeIdListForMute={attendeeIdListForMute}
        />
        <BottomContainer
          callState={callState}
          videoOn={videoOn}
          flipOn={flipOn}
          speakerOn={speakerOn}
          muteOn={muteOn}
          handleFlip={() => ClickUtil.clickSafely(() => util.handleFlip(setFlipOn))}
          handleSpeaker={() => ClickUtil.clickSafely(() => util.handleSpeaker(setSpeakerOn))}
          handleMute={() => ClickUtil.clickSafely(() => util.handleMute(setMuteOn))}
          handleHangUp={() =>
            ClickUtil.clickSafely(() => {
              util.rejectCall();
            })
          }
          handleVideo={() => ClickUtil.clickSafely(() => util.handleVideo(setVideoOn, setSpeakerOn))}
          userWithAttendeeIdByContact={userWithAttendeeIdByContact}
          videoIdByAttendeeId={videoIdByAttendeeId}
          attendeeIdListForActiveSpeaker={attendeeIdListForActiveSpeaker}
          attendeeIdListForMute={attendeeIdListForMute}
          currentSpeaker={currentSpeaker}
          me={me}
          userListToWait={userListToWait}
        />
      </MainLayout>
    </AbsoluteLayout>
  );
}

const AbsoluteLayout = styled.View`
  position: absolute;
  width: 100%;
  height: 100%;
`;

type Callback = (data: string) => void;
export class HangupCallback {
  static readonly eventName = 'hangup-callback';

  static add(callback: Callback) {
    return EventRegister.on(this.eventName, callback);
  }
  static remove(listenerId) {
    EventRegister.rm(listenerId);
  }

  static emit() {
    EventRegister.emit(this.eventName);
  }
}
