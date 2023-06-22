import MySetting from 'MySetting';
import { useEffect } from 'react';
import RNCallKeep from 'react-native-callkeep';
import uuid from 'react-native-uuid';
import LogUtil from 'utils/LogUtil';
import ChatSocketUtil from '../chats/ChatSocketUtil';
import FirebaseMessageUtil from '../chats/FirebaseMessageUtil';
import AmazonChimeUtil from './AmazonChimeUtil';

export function useEffectCallKeep() {
  useEffect(() => {
    if (MySetting.isIos) {
      CallManagerForIos.me.makeListeners();
      return () => {
        CallManagerForIos.me.removeListeners();
      };
    }
  }, []);
}

export default class CallManagerForIos {
  static readonly me = new CallManagerForIos();

  isHoldByUuid: any = {};
  targetContactByUuid: any = {};
  isMutedByUuid: any = {};

  setIsHoldByUuid(isHoldByUuid) {
    CallManagerForIos.me.isHoldByUuid = isHoldByUuid;
  }
  setTargetContactByUuid(targetContactByUuid) {
    CallManagerForIos.me.targetContactByUuid = targetContactByUuid;
  }
  setIsMutedByUuid(isMutedByUuid) {
    CallManagerForIos.me.isMutedByUuid = isMutedByUuid;
  }

  util = {
    makeUuid() {
      const uuidStr = uuid.v4().toString();
      LogUtil.info(`getNewUuid uuid:${uuidStr}`);
      return uuidStr;
    },
    setup() {
      if (MySetting.isIos) {
        RNCallKeep.setup({
          ios: {
            appName: MySetting.appName,
            supportsVideo: true,
            maximumCallsPerCallGroup: '1',
            maximumCallGroups: '1',
            imageName: 'logo.png',
          },
          android: {
            alertTitle: 'Permissions required',
            alertDescription: 'This application needs to access your phone accounts',
            cancelButton: 'Cancel',
            okButton: 'ok',
            imageName: 'phone_account_icon',
            additionalPermissions: [],
            // Required to get audio in background when using Android 11
            foregroundService: {
              channelId: 'com.company.my',
              channelName: 'Foreground service for my app',
              notificationTitle: 'My app is running on background',
              notificationIcon: 'Path to the resource icon of the notification',
            },
          },
        });
      }
    },
    showSystemCallUI(incomingPhoneNumber, incomingCallerName, isVideo) {
      RNCallKeep.displayIncomingCall(
        CallManagerForIos.me.util.makeUuid(),
        incomingPhoneNumber,
        incomingCallerName,
        'number',
        isVideo,
        {
          ios: {
            supportsDTMF: false, //키패드 활용여부
            supportsHolding: false, //통화 추가 버튼 비활성화 방법 https://stackoverflow.com/questions/40170810/disable-add-call-option-from-callkit
            supportsGrouping: false,
            supportsUngrouping: false,
          },
        },
      );
    },
    hangupAll() {
      const callUUIDList = Object.keys(CallManagerForIos.me.targetContactByUuid);
      LogUtil.info(`CallKeepManager hangup callUUIDList:${callUUIDList}`);
      RNCallKeep.endAllCalls();
    },
    addCall(callUUID, contact) {
      LogUtil.info('addCall', { callUUID, contact });
      const instance = CallManagerForIos.me;
      instance.setIsHoldByUuid({ ...instance.isHoldByUuid, [callUUID]: false });
      instance.setTargetContactByUuid({ ...instance.targetContactByUuid, [callUUID]: contact });
    },
    removeCall(callUUID: any) {
      LogUtil.info('removeCall', { callUUID });
      const instance = CallManagerForIos.me;
      const { [callUUID]: _, ...newContactByUuid } = instance.targetContactByUuid;
      const { [callUUID]: __, ...newIsHoldByUuid } = instance.isHoldByUuid;
      instance.setTargetContactByUuid(newContactByUuid);
      instance.setIsHoldByUuid(newIsHoldByUuid);
    },
    setCallHeld(callUUID, held) {
      LogUtil.info('removeCall', { callUUID, held });
      const instance = CallManagerForIos.me;
      instance.setIsHoldByUuid({ ...instance.isHoldByUuid, [callUUID]: held });
    },
    setCallMuted(callUUID, muted) {
      LogUtil.info('setCallMuted', { callUUID, muted });
      const instance = CallManagerForIos.me;
      instance.setIsMutedByUuid({ ...instance.isMutedByUuid, [callUUID]: muted });
    },
    async callOnIos(incomingPhoneNumber, incomingCallerName, remoteMessage) {
      LogUtil.info('callOnIos');
      await ChatSocketUtil.instance.easy.join('callOnIos');
      const isVideo = remoteMessage?.data?.call_type === 'face_talk';
      CallManagerForIos.me.util.showSystemCallUI(incomingPhoneNumber, incomingCallerName, isVideo);
    },
  };

  didDisplayIncomingCall({
    error,
    callUUID,
    handle: targetContact,
    localizedCallerName,
    hasVideo,
    fromPushKit,
    payload,
  }) {
    LogUtil.info('CallKeepManager didDisplayIncomingCall callUUID, targetContact ', { callUUID, targetContact });
    CallManagerForIos.me.util.addCall(callUUID, targetContact);
  }

  answerCall({ callUUID }) {
    AmazonChimeUtil.instance.byCallkeep = true;
    const targetContact = CallManagerForIos.me.targetContactByUuid[callUUID];
    LogUtil.info('CallKeepManager answerCall callUUID, targetContact', { callUUID, targetContact });

    const hasVideo = true;
    RNCallKeep.startCall(callUUID, targetContact, targetContact, 'number', hasVideo);

    const remoteMessage = FirebaseMessageUtil.callRemoteMessage;
    const roomId = remoteMessage?.data?.room_id ?? '';
    if (!roomId) {
      LogUtil.error('CallKeepManager answerCall roomId is empty');
      return;
    }
    const serverCallType = remoteMessage?.data?.call_type;
    const clientCallType = serverCallType === 'face_talk' ? 'video' : 'audio';
    const videoOn = clientCallType === 'video';

    const instance = ChatSocketUtil.instance;

    const errorHandler = (error) => {
      ChatSocketUtil.instance.easy.leaveCall('CallManagerForIos');
    };

    var timer = setInterval(() => {
      LogUtil.info('통화거는중 인터벌 시작.');
      instance.easy
        .joinCall('CallKeepManager', roomId, clientCallType, 'join', () => {})
        .then(async ({ meeting, attendee }) => {
          LogUtil.info('통화거는중 인터벌 끝.');
          clearInterval(timer);

          try {
            await AmazonChimeUtil.instance.startMeeting(meeting, attendee);
          } catch (error) {
            errorHandler(error);
          }
        })
        .catch(errorHandler);
    }, 500);
  }

  async endCall({ callUUID }) {
    LogUtil.info('CallKeepManager [endCall] callUUID');
    const roomId = FirebaseMessageUtil.callRemoteMessage?.data?.room_id ?? '';
    FirebaseMessageUtil.callRemoteMessage = null;

    try {
      ChatSocketUtil.instance.amazonChimeUtil.stopMeeting();
    } catch (error) {
      LogUtil.error('CallKeepManager [endCall] stopMeeting error', error);
    }

    try {
      await ChatSocketUtil.instance.emitExitCall('CallKeepManager', roomId);
    } catch (error) {
      LogUtil.error('CallKeepManager [endCall] emitExitCall error', error);
    }
    const targetContact = CallManagerForIos.me.targetContactByUuid[callUUID];
    LogUtil.info(`CallKeepManager [endCall] ${callUUID}, targetContact: ${targetContact}`);

    CallManagerForIos.me.util.removeCall(callUUID);
  }

  didPerformDTMFAction({ callUUID, digits }) {
    LogUtil.info('CallKeepManager didPerformDTMFAction');

    const number = CallManagerForIos.me.targetContactByUuid[callUUID];
    LogUtil.info(`CallKeepManager [didPerformDTMFAction] ${callUUID}, number: ${number} (${digits})`);
  }

  didPerformSetMutedCallAction({ muted, callUUID }) {
    LogUtil.info('CallKeepManager didPerformSetMutedCallAction');

    const number = CallManagerForIos.me.targetContactByUuid[callUUID];
    LogUtil.info(`CallKeepManager [didPerformSetMutedCallAction] ${callUUID}, number: ${number} (${muted})`);

    CallManagerForIos.me.util.setCallMuted(callUUID, muted);
  }
  didChangeAudioRoute({ output }) {
    // LogUtil.info('CallKeepManager didChangeAudioRoute', { output });
  }

  didToggleHoldCallAction({ hold, callUUID }) {
    LogUtil.info('CallKeepManager didToggleHoldCallAction');

    const number = CallManagerForIos.me.targetContactByUuid[callUUID];
    LogUtil.info(`CallKeepManager [didToggleHoldCallAction] ${callUUID}, number: ${number} (${hold})`);

    CallManagerForIos.me.util.setCallHeld(callUUID, hold);
  }

  makeListeners() {
    //통화가 발생할 때 -> didDisplayIncomingCall응답 -> util.addCall요청(전화번호 기록)
    //통화를 거절할 때(노티,풀스크린)or통화를 종료시킬 때(hangUp함수,endCall요청) -> endCall응답 -> util.removeCall요청(전화번호 삭제)
    //통화를 수락할 때(노티,풀스크린) -> answerCall응답 -> startCall요청

    RNCallKeep.addEventListener('answerCall', CallManagerForIos.me.answerCall);
    RNCallKeep.addEventListener('endCall', CallManagerForIos.me.endCall);
    RNCallKeep.addEventListener('didDisplayIncomingCall', CallManagerForIos.me.didDisplayIncomingCall); //전화 통화가 시작될 때,
    RNCallKeep.addEventListener('didPerformDTMFAction', CallManagerForIos.me.didPerformDTMFAction); //번호 입력 감지
    RNCallKeep.addEventListener('didChangeAudioRoute', CallManagerForIos.me.didChangeAudioRoute); //spaeker 모드 감지
    RNCallKeep.addEventListener('didPerformSetMutedCallAction', CallManagerForIos.me.didPerformSetMutedCallAction); //음소거 감지
    RNCallKeep.addEventListener('didToggleHoldCallAction', CallManagerForIos.me.didToggleHoldCallAction); //보류 감지
  }
  removeListeners() {
    RNCallKeep.removeEventListener('answerCall');
    RNCallKeep.removeEventListener('didPerformDTMFAction');
    RNCallKeep.removeEventListener('didDisplayIncomingCall');
    RNCallKeep.removeEventListener('didChangeAudioRoute');
    RNCallKeep.removeEventListener('didPerformSetMutedCallAction');
    RNCallKeep.removeEventListener('didToggleHoldCallAction');
    RNCallKeep.removeEventListener('endCall');
  }
}
