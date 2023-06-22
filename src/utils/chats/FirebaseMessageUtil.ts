import AsyncStorage from '@react-native-community/async-storage';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { RootNatigation } from 'navigations/RootNavigation';
import { get, post, rememberToken } from 'net/rest/api';
import { getUniqueId } from 'react-native-device-info';
import Room from 'types/chats/rooms/Room';
import Nullable from 'types/_common/Nullable';
import LogUtil from '../LogUtil';
import ChatSocketUtil from './ChatSocketUtil';
import AuthUtil from '../AuthUtil';
import { t } from 'i18next';
import Toast from 'react-native-toast-message';
import MySetting from '../../MySetting';
import NotificationSounds, { playSampleSound } from 'react-native-notification-sounds';
import { Vibration } from 'react-native';
import DateUtil from 'utils/DateUtil';
import CallManagerForIos from 'utils/calls/CallManagerForIos';
import CallManagerForAos from 'utils/calls/CallManagerForAos';
import notifee from '@notifee/react-native';
import Sound from 'react-native-sound';

class FirebaseMessageUtil {
  //----노티피케이션 블록일 때, (메시지)
  //--앱이 꺼져있을 때, 켜져있을 때,
  //[android:O,ios:O] 백그라운드 일 때 -> 노티가 떴음 -> 노티피케이션 클릭 대처 -> onNotificationOpenedApp
  //[android:O,ios:O] 앱이 꺼져있을 때 -> 노티가 떴음 -> 노티피케이션 클릭 대처 -> getInitialNotification

  //----데이터 블록일 때, (전화)
  // https://www.notion.so/studytryit/d6359d827c7a447180838ea586abae17

  static readonly useLog = true;
  static callRemoteMessage: FirebaseMessagingTypes.RemoteMessage | null = null;
  static badgeCount: number | null = null;

  static async setBackgroundListener(): Promise<void> {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      LogUtil.info('FirebaseMessageUtil onBackgroundHandler', remoteMessage);

      await this.onChangeBadge(remoteMessage);
      await this.showReceiveCallUI(remoteMessage); //전화이면, 로컬 노티 띄우기 (화면이 꺼져있으면, 화면을 킨다.)
    });
    messaging().onNotificationOpenedApp((remoteMessage) => {
      LogUtil.info('FirebaseMessageUtil onNotificationOpenedApp');
      this.navigatePageByMessage(remoteMessage);
    });
  }

  static async init(): Promise<void> {
    this.useLog && LogUtil.info('FirebaseMessageUtil init', null);

    messaging()
      .getInitialNotification()
      .then(async (nullableRemoteMessage) => {
        if (nullableRemoteMessage) {
          const remoteMessage = nullableRemoteMessage!;
          LogUtil.info('FirebaseMessageUtil initialNotification', remoteMessage);
          await this.navigatePageByMessage(remoteMessage);
        }
      });

    messaging().onTokenRefresh(async (fcmToken) => {
      this.useLog && LogUtil.info('FirebaseMessageUtil onTokenRefresh fcmToken : ', fcmToken);

      await this.requestUpdatePushToken(fcmToken);
    });

    const enabled = await this.getPermission();
    if (enabled) {
      const fcmToken = await this.getFcmToken();
      if (fcmToken != null) {
        await this.requestUpdatePushToken(fcmToken);
      }
    }

    messaging().onMessage((remoteMessage) => {
      LogUtil.info('onMessage', remoteMessage);
      this.onChangeBadge(remoteMessage);
      this.showInAppMessage(remoteMessage);
    });
  }

  static showInAppMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage) {
    const savedRoomId = remoteMessage?.data?.room_id ?? '';
    const messageType = remoteMessage?.data?.messageType;

    if (messageType === 'message') {
      if (ChatSocketUtil.instance.chatStatus.currentRoomForChat?._id === savedRoomId) {
        return;
      }

      const notification = remoteMessage.notification;
      const author = notification?.title;
      const message = notification?.body;

      const isDoNotDisturb = AuthUtil.user.setting.nt_disturb;
      const isPreview = AuthUtil.user.setting.nt_preview;
      const disturb_begin = AuthUtil.user.setting.nt_disturb_begin;
      const disturb_end = AuthUtil.user.setting.nt_disturb_end;
      const currentTime = DateUtil.getTime(new Date()).split(' ')[0] + ':00';
      const inapp_sound = AuthUtil.user.setting.nt_inapp_sound;
      const inapp_vibration = AuthUtil.user.setting.nt_inapp_vibrate;
      const inaap_noti = AuthUtil.user.setting.nt_inapp_noti;
      const isDisturb = isDoNotDisturb && disturb_begin < currentTime && currentTime < disturb_end;
      const emptyStr = ' ';

      if (!isDisturb && inaap_noti) {
        if (inapp_sound) {
          if (MySetting.isAndroid) {
            Sound.setCategory('Ambient');
            const sound = new Sound('notification', Sound.MAIN_BUNDLE, (e) => {
              if (e) {
                LogUtil.info('android in app notification sound error', e);
              } else {
                sound && sound.play();
              }
            });
          } else {
            NotificationSounds.getNotifications('notification').then((soundsList) => {
              /*
              Play the notification sound.
              pass the complete sound object.
              This function can be used for playing the sample sound
              */
              Sound.setCategory('Ambient');
              LogUtil.info('soundList', soundsList);
              if (MySetting.isAndroid) {
                //@ts-ignore
                playSampleSound([]);
              } else {
                if (soundsList) {
                  if (soundsList.findIndex((sound) => sound.title === 'sms received1') !== -1) {
                    LogUtil.info(
                      'playSound',
                      soundsList[soundsList.findIndex((sound) => sound.title === 'sms received1')],
                    );
                    playSampleSound(soundsList[soundsList.findIndex((sound) => sound.title === 'sms received1')]);
                  } else {
                    playSampleSound(soundsList[1]);
                  }
                }
              }
              // if you want to stop any playing sound just call:
              // stopSampleSound();
            });
          }
        }
        if (inapp_vibration) {
          Vibration.vibrate();
        }

        if (remoteMessage?.data?.noti_type) {
          const noti_data = remoteMessage?.data;
          const noti_type = noti_data.noti_type;
          const target_id = noti_data.noti_target_id;
          const sender_id = noti_data.sender_user_id;
          const sender_uid = noti_data.sender_user_uid;
          const sender_contact = noti_data.sender_user_contact;

          const post_type = ['like', 'comment', 'tag'];
          const follow_type = ['applyfollow', 'denie', 'accept', 'follow', 'acceptfollow'];

          Toast.show({
            type: 'inApp',
            text1: author ?? emptyStr,
            text2: isPreview ? message ?? emptyStr : emptyStr,
            onPress: async () => {
              Toast.hide();
              if (post_type.includes(noti_type)) {
                RootNatigation.navigate('/kokkokme/:id', { id: target_id });
              }
              if (follow_type.includes(noti_type)) {
                RootNatigation.navigate('/kokkokme/user-timeline/:id', {
                  id: sender_id,
                  uid: sender_uid,
                  contact: sender_contact,
                });
              }
            },
          });
        } else {
          Toast.show({
            type: 'inApp',
            text1: author ?? emptyStr,
            text2: isPreview ? message ?? emptyStr : emptyStr,
            ...(savedRoomId
              ? {
                  onPress: async () => {
                    Toast.hide();
                    const room = await get<Room>(`/chats/rooms/${savedRoomId}`, undefined, undefined, true);
                    RootNatigation.navigate('/chats', {});
                    RootNatigation.navigate('/chats/chat-room', { room: room });
                  },
                }
              : {}),
          });
        }
      }
    }
  }

  static async onChangeBadge(remoteMessage) {
    const launchActivity = 'com.kokkoksole.kkchat.MainActivity';
    const countChannelId = 'count';
    this.badgeCount = Number(remoteMessage.data?.badgeCount ?? '0');

    if (this.badgeCount != null) {
      LogUtil.info(`badgeCount: ${this.badgeCount}`);
      if (MySetting.isIos) {
        await notifee.setBadgeCount(this.badgeCount >= 0 ? this.badgeCount : 0);
      } else {
        if (this.badgeCount <= 0) {
          await notifee.deleteChannel(countChannelId);
          return;
        }
        await notifee.requestPermission()

        let channelId;
        const oldChannel = await notifee.getChannel(countChannelId);
        if (!oldChannel) {
          channelId = await notifee.createChannel({
            id: countChannelId,
            name: 'Count',
            badge: true,
            vibration: false,
          });
        } else {
          channelId = oldChannel.id;
        }
        await notifee.displayNotification({
          body: t('common.you have synchronized {{badgeCount}} massage', { badgeCount: this.badgeCount }),
          android: {
            onlyAlertOnce: true,
            smallIcon: 'ic_launcher_round',
            channelId,
            badgeCount: this.badgeCount,
            pressAction: {
              id: 'default',
              launchActivity: launchActivity,
            },
          },
        });
      }
    }
  }

  static async navigatePageByMessage(message) {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      await rememberToken(token);
    }
    LogUtil.info('FirebaseMessageUtil navigatePageByMessage token, message', { token, message });

    const savedRoomId = message?.data?.room_id ?? '';
    const messageType = message?.data?.messageType;

    if (messageType === 'message' && savedRoomId) {
      const room = await get<Room>(`/chats/rooms/${savedRoomId}`, undefined, undefined, true);
      RootNatigation.navigate('/chats/chat-room', { room: room });
    }
  }

  static async getFcmToken(): Promise<Nullable<string>> {
    try {
      const fcmToken: string = await messaging().getToken();
      this.useLog && LogUtil.info('FirebaseMessageUtil _getFcmToken success : ', fcmToken);
      return fcmToken;
    } catch (e) {
      this.useLog && LogUtil.info('FirebaseMessageUtil _getFcmToken error :', e);
      return null;
    }
  }

  static async getPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      this.useLog && LogUtil.info('FirebaseMessageUtil getPermission Authorization status:', authStatus);
    }

    return enabled;
  }

  static async requestUpdatePushToken(fcmToken: string): Promise<void> {
    const accessToken = await AsyncStorage.getItem('token');
    this.useLog && LogUtil.info('FirebaseMessageUtil requestUpdatePushToken accessToken : ', accessToken);
    if (!!accessToken && !!fcmToken) {
      await post(
        '/auth/push-token/',
        {
          push_token: fcmToken,
          device_id: getUniqueId(),
        },
        null,
        (error) => {
          this.useLog && LogUtil.info('FirebaseMessageUtil requestUpdatePushToken fail : ', error);
        },
        true,
      );
    }
  }

  static async showReceiveCallUI(remoteMessage) {
    const messageType = remoteMessage.data?.messageType;
    if (messageType === 'call') {
      let sender;
      try {
        sender = JSON.parse(remoteMessage.data?.sender);
      } catch (e) {
        sender = '';
      }
      const phoneNumber = `${sender?.contact ?? '(21) 1234-1234'}`;
      const callerName = `${sender?.first_name ?? ''} ${sender?.last_name ?? ''}`.trim();
      LogUtil.info('showNotificationOrTurnOnScreenForCall [messageType,phoneNumber,callerName]', [
        messageType,
        phoneNumber,
        callerName,
      ]);

      FirebaseMessageUtil.callRemoteMessage = remoteMessage;
      const incomingPhoneNumber = phoneNumber;
      const incomingCallerName = callerName ?? phoneNumber;

      if (MySetting.isIos) {
        await CallManagerForIos.me.util.callOnIos(incomingPhoneNumber, incomingCallerName, remoteMessage);
        return;
      }

      if (MySetting.isAndroid) {
        await CallManagerForAos.callOnAndroid(incomingPhoneNumber, incomingCallerName, remoteMessage);
      }
    }
  }
}

export default FirebaseMessageUtil;
