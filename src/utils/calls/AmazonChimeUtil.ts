import { Alert } from 'react-native';
import { OnResponse } from 'types/_common/OnReponse';
import { getSDKEventEmitter, MeetingError, MobileSDKEvent, NativeFunction } from './AmazonChimeNativeBridge';
import LogUtil from '../LogUtil';
import ChatSocketUtil from 'utils/chats/ChatSocketUtil';
import { UserWithAttendeeId } from 'components/molecules/CallView';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';

//데이터 처리까지 원하면 사용.
//NativeFunction.sendDataMessage(dataMessage.topic, str, 1000);

//RNVideoRenderView에 의해서 아래 비디오 처리를 자동으로 함.
//NativeFunction.bindVideoView(findNodeHandle(this), this.props.tileId);
//NativeFunction.unbindVideoView(this.props.tileId);

class AmazonChimeUtil {
  static readonly instance: AmazonChimeUtil = new AmazonChimeUtil();
  reserveHangUp: boolean = false;
  isConnected: boolean = false;
  byCallkeep: boolean = false;

  //start
  private onMeetingStartSubscription: any | undefined;
  private onMeetingEndSubscription: any | undefined;
  private onErrorSubscription: any | undefined;

  //prepare
  private onAttendeesJoinSubscription: any | undefined;
  private onAttendeesLeaveSubscription: any | undefined;
  private onAddVideoTileSubscription: any | undefined;
  private onRemoveVideoTileSubscription: any | undefined;
  private onAttendeesMuteSubscription: any | undefined;
  private onAttendeesUnmuteSubscription: any | undefined;
  private onActiveSpeakerSubscription: any | undefined;
  private onActiveSpeakerScoreSubscription: any | undefined;
  // onDataMessageReceivedSubscription: any | undefined;

  setter = {
    setCallState(callState: 'ringing' | 'calling', videoOn: boolean | null = null) {
      if (callState === 'calling' && videoOn != null) {
        AmazonChimeUtil.instance.setVideoOn(videoOn);
      }

      const chatSocketUtil = ChatSocketUtil.instance;
      chatSocketUtil.chatStatus.callState = callState;
      chatSocketUtil.forceUpdateForChatStatus();
    },
    setUserWithAttendeeIdByContact(callUserWithAttendeeIdByContact: Map<string, UserWithAttendeeId>) {
      const chatSocketUtil = ChatSocketUtil.instance;
      chatSocketUtil.chatStatus.callUserWithAttendeeIdByContact = callUserWithAttendeeIdByContact;
      chatSocketUtil.forceUpdateForChatStatus();
    },
    setVideoIdByAttendeeId(callVideoIdByAttendeeId: Map<string, number>) {
      const chatSocketUtil = ChatSocketUtil.instance;
      chatSocketUtil.chatStatus.callVideoIdByAttendeeId = callVideoIdByAttendeeId;
      chatSocketUtil.forceUpdateForChatStatus();
    },
    setAttendeeIdListForMute(callAttendeeIdListForMute: string[]) {
      const chatSocketUtil = ChatSocketUtil.instance;
      chatSocketUtil.chatStatus.callAttendeeIdListForMute = callAttendeeIdListForMute;
      chatSocketUtil.forceUpdateForChatStatus();
    },
    setAttendeeIdListForActiveSpeaker(callAttendeeIdListForActiveSpeaker: string[]) {
      const chatSocketUtil = ChatSocketUtil.instance;
      chatSocketUtil.chatStatus.callAttendeeIdListForActiveSpeaker = callAttendeeIdListForActiveSpeaker;
      chatSocketUtil.forceUpdateForChatStatus();
    },
    setCurrentSpeaker(callCurrentSpeaker: UserWithAttendeeId | null) {
      const chatSocketUtil = ChatSocketUtil.instance;
      chatSocketUtil.chatStatus.callCurrentSpeaker = callCurrentSpeaker;
      chatSocketUtil.forceUpdateForChatStatus();
    },
  };

  startMeeting(meeting, attendee, videoOn: boolean | null = null): Promise<void> {
    LogUtil.info(`AmazonChimeUtil startMeeting`);
    return new Promise(async (resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      this.setOnAttendeesJoinSubscription(async (attendee) => {
        const chatSocketUtil = ChatSocketUtil.instance;
        const room = chatSocketUtil.chatStatus.currentRoomForCall;
        if (!room) {
          return;
        }

        const { attendeeId, externalUserId: contact } = attendee;
        const user = await ChatHttpUtil.requestGetUserByContact(contact);
        if (!user) {
          LogUtil.info('setOnAttendeesJoinSubscription user is null');
          return;
        }
        LogUtil.info('setOnAttendeesJoinSubscription user', { user });
        const userWithAttendeeId: UserWithAttendeeId = { user, attendeeId };

        const callUserWithAttendeeIdByContact = chatSocketUtil.chatStatus.callUserWithAttendeeIdByContact;
        const newVal = new Map([...callUserWithAttendeeIdByContact, [contact, userWithAttendeeId]]);
        this.setter.setUserWithAttendeeIdByContact(newVal);
      });
      this.setOnAttendeesLeaveSubscription((attendee) => {
        const chatSocketUtil = ChatSocketUtil.instance;
        const { attendeeId, externalUserId: contact } = attendee;
        const callUserWithAttendeeIdByContact = chatSocketUtil.chatStatus.callUserWithAttendeeIdByContact;
        const newVal = new Map(callUserWithAttendeeIdByContact);
        newVal.delete(contact);
        this.setter.setUserWithAttendeeIdByContact(newVal);

        const callVideoIdByAttendeeId = chatSocketUtil.chatStatus.callVideoIdByAttendeeId;
        const newVal2 = new Map(callVideoIdByAttendeeId);
        newVal2.delete(attendeeId);
        this.setter.setVideoIdByAttendeeId(newVal2);
      });
      this.setOnAddVideoTileSubscription((callState) => {
        const chatSocketUtil = ChatSocketUtil.instance;
        const callVideoIdByAttendeeId = chatSocketUtil.chatStatus.callVideoIdByAttendeeId;
        const newVal = new Map([...callVideoIdByAttendeeId, [callState.attendeeId, callState.tileId]]);
        this.setter.setVideoIdByAttendeeId(newVal);
      });
      this.setOnRemoveVideoTileSubscription((callState) => {
        const chatSocketUtil = ChatSocketUtil.instance;
        const callVideoIdByAttendeeId = chatSocketUtil.chatStatus.callVideoIdByAttendeeId;
        const newVal = new Map(callVideoIdByAttendeeId);
        newVal.delete(callState.attendeeId);
        this.setter.setVideoIdByAttendeeId(newVal);
      });

      this.setOnAttendeesMuteSubscription((attendeeId) => {
        const chatSocketUtil = ChatSocketUtil.instance;
        const attendeeListForMute = chatSocketUtil.chatStatus.callAttendeeIdListForMute;
        const newVal = [...attendeeListForMute, attendeeId];
        this.setter.setAttendeeIdListForMute(newVal);
      });
      this.setOnAttendeesUnmuteSubscription((attendeeId) => {
        const chatSocketUtil = ChatSocketUtil.instance;
        const attendeeIdListForMute = chatSocketUtil.chatStatus.callAttendeeIdListForMute;
        const newVal = attendeeIdListForMute.filter((eachAttendeeId) => eachAttendeeId !== attendeeId);
        this.setter.setAttendeeIdListForMute(newVal);
      });
      this.setOnActiveSpeakerSubscription((attendeeId) => {
        const chatSocketUtil = ChatSocketUtil.instance;
        const attendeeIdListForActiveSpeaker = chatSocketUtil.chatStatus.callAttendeeIdListForActiveSpeaker;
        const newVal = [...attendeeIdListForActiveSpeaker, attendeeId];
        this.setter.setAttendeeIdListForActiveSpeaker(newVal);
      });
      this.setOnActiveSpeakerScoreSubscription(() => {});

      // 연결시작을알려줌.
      if (!this.onMeetingStartSubscription) {
        this.onMeetingStartSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnMeetingStart, () => {
          this.isConnected = true;
          LogUtil.info(`AmazonChimeUtil onMeetingStartSubscription`); //권한 설정을 여기에서 유도하는데, 맨 앞단에서 해도될듯?

          resolve();
        });
      }

      // 연결끝을알려줌.
      if (!this.onMeetingEndSubscription) {
        this.onMeetingEndSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnMeetingEnd, () => {
          this.isConnected = false;
          LogUtil.info(`AmazonChimeUtil onMeetingEndSubscription`);
          reject('AmazonChimeUtil onMeetingEndSubscription');
        });
      }

      // 에러를알려줌.
      if (!this.onErrorSubscription) {
        this.onErrorSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnError, (res) => {
          this.isConnected = false;
          LogUtil.info(`AmazonChimeUtil onErrorSubscription`, res);
          reject('SDK Error');
        });
      }

      NativeFunction.startMeeting(meeting, attendee);
      AmazonChimeUtil.instance.setter.setCallState('calling', videoOn);
    });
  }

  setOnAttendeesJoinSubscription(onResponse: OnResponse) {
    if (!this.onAttendeesJoinSubscription) {
      // MobileSDKEvent.OnAttendeesJoin 이벤트가 발생하면, 참석자가 들어온것이다.
      this.onAttendeesJoinSubscription = getSDKEventEmitter().addListener(
        MobileSDKEvent.OnAttendeesJoin,
        (attendee) => {
          LogUtil.info(`AmazonChimeUtil onAttendeesJoinSubscription attendee`, attendee);
          onResponse(attendee);
        },
      );
    }
  }
  setOnAttendeesLeaveSubscription(onResponse: OnResponse) {
    if (!this.onAttendeesLeaveSubscription) {
      // MobileSDKEvent.OnAttendeesLeave 이벤트가 발생하면, 참석자가 나간것이다.
      this.onAttendeesLeaveSubscription = getSDKEventEmitter().addListener(
        MobileSDKEvent.OnAttendeesLeave,
        (attendee) => {
          LogUtil.info(`AmazonChimeUtil onAttendeesLeaveSubscription attendee`, attendee);
          onResponse(attendee);
        },
      );
    }
  }

  setOnAddVideoTileSubscription(onResponse: OnResponse) {
    if (!this.onAddVideoTileSubscription) {
      /**
       * Video tile Add & Remove Handler
       */
      // MobileSDKEvent.OnAddVideoTile 이벤트가 발생하면, 카메라 On인 유저 추가될때,
      this.onAddVideoTileSubscription = getSDKEventEmitter().addListener(MobileSDKEvent.OnAddVideoTile, (response) => {
        /*
        {
          "videoStreamContentWidth": 720,
          "videoStreamContentHeight": 960,
          "pauseState": 0,
          "isLocal": true,
          "isScreenShare": false,
          "attendeeId": "d7cc6426-0f56-e2f5-4640-70297a146d3c",
          "tileId": 0
        }*/
        LogUtil.info(`AmazonChimeUtil onAddVideoTileSubscription res`, response);
        onResponse(response);
      });
    }
  }

  setOnAttendeesMuteSubscription(onResponse: OnResponse) {
    if (!this.onAttendeesMuteSubscription) {
      this.onAttendeesMuteSubscription = getSDKEventEmitter().addListener(
        MobileSDKEvent.OnAttendeesMute,
        (response) => {
          LogUtil.info(`AmazonChimeUtil onAttendeesMuteSubscription res`, response);
          onResponse(response);
        },
      );
    }
  }
  setOnAttendeesUnmuteSubscription(onResponse: OnResponse) {
    if (!this.onAttendeesUnmuteSubscription) {
      this.onAttendeesUnmuteSubscription = getSDKEventEmitter().addListener(
        MobileSDKEvent.OnAttendeesUnmute,
        (response) => {
          LogUtil.info(`AmazonChimeUtil onAttendeesUnmuteSubscription res`, response);
          onResponse(response);
        },
      );
    }
  }
  setOnActiveSpeakerSubscription(onResponse: OnResponse) {
    if (!this.onActiveSpeakerSubscription) {
      this.onActiveSpeakerSubscription = getSDKEventEmitter().addListener(
        MobileSDKEvent.OnActiveSpeaker,
        (response) => {
          // LogUtil.info(`AmazonChimeUtil onActiveSpeakerSubscription res`, response);
          onResponse(response);
        },
      );
    }
  }
  setOnActiveSpeakerScoreSubscription(onResponse: OnResponse) {
    if (!this.onActiveSpeakerScoreSubscription) {
      this.onActiveSpeakerScoreSubscription = getSDKEventEmitter().addListener(
        MobileSDKEvent.OnActiveSpeakerScore,
        (response) => {
          // LogUtil.info(`AmazonChimeUtil onActiveSpeakerScoreSubscription res`, response);
          onResponse(response);
        },
      );
    }
  }
  setOnRemoveVideoTileSubscription(onResponse: OnResponse) {
    if (!this.onRemoveVideoTileSubscription) {
      // MobileSDKEvent.OnRemoveVideoTile 이벤트가 발생하면, 카메라 On인 유저 삭제될때,
      this.onRemoveVideoTileSubscription = getSDKEventEmitter().addListener(
        MobileSDKEvent.OnRemoveVideoTile,
        (response) => {
          /*
          {
            "videoStreamContentWidth": 720,
            "videoStreamContentHeight": 960,
            "pauseState": 0,
            "isLocal": true,
            "isScreenShare": false,
            "attendeeId": "d7cc6426-0f56-e2f5-4640-70297a146d3c",
            "tileId": 0
          }
          */
          LogUtil.info(`AmazonChimeUtil onRemoveVideoTileSubscription res`, response);
          onResponse(response);
        },
      );
    }
  }
  stopMeeting() {
    if (!this.isConnected) {
      return;
    }

    this.isConnected = false;
    LogUtil.info(`AmazonChimeUtil stopMeeting`);
    NativeFunction.stopMeeting();

    if (this.onAttendeesJoinSubscription) {
      this.onAttendeesJoinSubscription.remove();
      this.onAttendeesJoinSubscription = null;
    }
    if (this.onAttendeesLeaveSubscription) {
      this.onAttendeesLeaveSubscription.remove();
      this.onAttendeesLeaveSubscription = null;
    }

    if (this.onAddVideoTileSubscription) {
      this.onAddVideoTileSubscription.remove();
      this.onAddVideoTileSubscription = null;
    }
    if (this.onRemoveVideoTileSubscription) {
      this.onRemoveVideoTileSubscription.remove();
      this.onRemoveVideoTileSubscription = null;
    }
    if (this.onAttendeesMuteSubscription) {
      this.onAttendeesMuteSubscription.remove();
      this.onAttendeesMuteSubscription = null;
    }
    if (this.onAttendeesUnmuteSubscription) {
      this.onAttendeesUnmuteSubscription.remove();
      this.onAttendeesUnmuteSubscription = null;
    }
    if (this.onActiveSpeakerSubscription) {
      this.onActiveSpeakerSubscription.remove();
      this.onActiveSpeakerSubscription = null;
    }
    if (this.onActiveSpeakerScoreSubscription) {
      this.onActiveSpeakerScoreSubscription.remove();
      this.onActiveSpeakerScoreSubscription = null;
    }
    // if (this.onDataMessageReceivedSubscription) {
    //   this.onDataMessageReceivedSubscription.remove();
    // this.onDataMessageReceivedSubscription = null;
    // }
    if (this.onErrorSubscription) {
      this.onErrorSubscription.remove();
      this.onErrorSubscription = null;
    }

    if (this.onMeetingEndSubscription) {
      this.onMeetingEndSubscription.remove();
      this.onMeetingEndSubscription = null;
    }
    if (this.onMeetingStartSubscription) {
      this.onMeetingStartSubscription.remove();
      this.onMeetingStartSubscription = null;
    }
    if (this.onErrorSubscription) {
      this.onErrorSubscription.remove();
      this.onErrorSubscription = null;
    }
  }

  setMuteOn(isMute: boolean) {
    LogUtil.info('AmazonChimeUtil setMuteOn', [isMute]);
    try {
      NativeFunction.setMute(isMute);
    } catch (e) {}
  }

  setVideoOn(videoOn: boolean) {
    LogUtil.info('AmazonChimeUtil setVideoOn', [videoOn]);
    try {
      NativeFunction.setCameraOn(videoOn);
    } catch (e) {}
  }

  switchCamera() {
    LogUtil.info('AmazonChimeUtil switchCamera');
    try {
      NativeFunction.switchCamera();
    } catch (e) {}
  }

  setSpeakerOn(speakerOn: boolean) {
    LogUtil.info('AmazonChimeUtil setSpeakerOn');
    try {
      NativeFunction.setSpeakerOn(speakerOn);
    } catch (e) {}
  }
}

export default AmazonChimeUtil;

//기타.
// if (!this.onAttendeesMuteSubscription) {
//   /**
//    * Attendee Mute & Unmute handler
//    */
//   // MobileSDKEvent.OnAttendeesMute 이벤트가 발생하면, 참석자가 음소거 O.
//   this.onAttendeesMuteSubscription = getSDKEventEmitter().addListener(
//     MobileSDKEvent.OnAttendeesMute,
//     (attendeeId) => {
//       LogUtil.info(`onAttendeesMuteSubscription res`, attendeeId);
//       // this.setState((oldState) => ({
//       //   ...oldState,
//       //   mutedAttendee: oldState.mutedAttendee.concat([attendeeId])
//       // }));
//     },
//   );
// }
// if (!this.onAttendeesUnmuteSubscription) {
//   // MobileSDKEvent.OnAttendeesUnmute 이벤트가 발생하면, 참석자가 음소거 X.
//   this.onAttendeesUnmuteSubscription = getSDKEventEmitter().addListener(
//     MobileSDKEvent.OnAttendeesUnmute,
//     (attendeeId) => {
//       LogUtil.info(`onAttendeesUnmuteSubscription res`, attendeeId);
//       // this.setState((oldState) => ({
//       //   ...oldState,
//       //   mutedAttendee: oldState.mutedAttendee.filter((attendeeToCompare => attendeeId != attendeeToCompare))
//       // }));
//     },
//   );
// }

// if (!this.onDataMessageReceivedSubscription) {
//   /**
//    * Data message handler
//    */
//   // MobileSDKEvent.OnDataMessageReceive 이벤트가 발생하면, 데이터 메시지를 받은 것이다.
//   this.onDataMessageReceivedSubscription = getSDKEventEmitter().addListener(
//     MobileSDKEvent.OnDataMessageReceive,
//     (dataMessage) => {
//       // const str = `Received Data message (topic: ${dataMessage.topic}) ${dataMessage.data} from ${dataMessage.senderAttendeeId}:${dataMessage.senderExternalUserId} at ${dataMessage.timestampMs} throttled: ${dataMessage.throttled}`;
//       // console.log(str);
//       // NativeFunction.sendDataMessage(dataMessage.topic, str, 1000);
//     },
//   );
// }
