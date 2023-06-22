import { t } from 'i18next';
import MySetting from 'MySetting';
import LogUtil from 'utils/LogUtil';
import ChatSocketUtil from '../chats/ChatSocketUtil';
import FirebaseMessageUtil from '../chats/FirebaseMessageUtil';
import notifee, { AndroidCategory, AndroidImportance, AndroidVisibility, EventType } from '@notifee/react-native';
import { ringtoneName } from 'hooks/useRingtone';

export default class CallManagerForAos {
  static readonly me = new CallManagerForAos();

  static readonly local_call_notification_id = 'call';

  static setPressActionListenerForCallNotification() {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      const { pressAction } = detail;

      if (type === EventType.ACTION_PRESS) {
        if (pressAction?.id === 'reject') {
          LogUtil.info('CallManagerForAos press reject');
          const roomId = FirebaseMessageUtil.callRemoteMessage?.data?.room_id ?? '';
          FirebaseMessageUtil.callRemoteMessage = null;

          try {
            await ChatSocketUtil.instance.emitExitCall('CallManagerForAos', roomId);
          } catch (error) {
            LogUtil.error('CallManagerForAos emitExitCall error', error);
          }
        }
      }
    });
  }

  static openCallWhenAppIsOff() {
    if (MySetting.isIos) {
      return;
    }

    notifee.getInitialNotification().then(async (initialNotification) => {
      LogUtil.info('FirebaseMessageUtil openCallWhenAppIsOff', initialNotification);
      const localMessage = initialNotification?.notification;
      if (localMessage) {
        LogUtil.info('FirebaseMessageUtil openCallWhenAppIsOff localMessage');
        await FirebaseMessageUtil.navigatePageByMessage(localMessage);
        return;
      }
    });
  }

  static async deleteCallOnAndroid() {
    await notifee.deleteChannel(this.local_call_notification_id); //벨소리, 진동 꺼지도록 해당 노티 제거
  }

  static async deleteAllNotification() {
    await notifee.cancelAllNotifications();
  }

  static async callOnAndroid(incomingPhoneNumber, incomingCallerName, remoteMessage) {
    LogUtil.info('callOnAndroid');
    await ChatSocketUtil.instance.easy.join('callOnAndroid');

    const launchActivity = 'com.kokkoksole.kkchat.MainActivity';
    const data = remoteMessage?.data;

    const channelId = await notifee.createChannel({
      id: this.local_call_notification_id,
      name: 'Call',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      sound: ringtoneName,
      vibration: true,
      vibrationPattern: this.vibrationPattern,
    });
    await notifee.displayNotification({
      title: incomingPhoneNumber,
      body: t('common.Incoming call'),
      data,
      android: {
        channelId,
        smallIcon: 'ic_launcher_round',
        category: AndroidCategory.CALL,
        visibility: AndroidVisibility.PUBLIC,
        importance: AndroidImportance.HIGH,
        timestamp: Date.now(),
        sound: ringtoneName,
        vibrationPattern: this.vibrationPattern,
        showTimestamp: true,
        pressAction: {
          id: 'default',
          launchActivity: launchActivity,
        },
        actions: [
          {
            title: t('common.Accept'),
            pressAction: {
              id: 'accept',
              launchActivity: 'default',
            },
          },
          {
            title: t('common.Decline'),
            pressAction: {
              id: 'reject',
            },
          },
        ],
        fullScreenAction: {
          id: 'default',
          launchActivity: launchActivity,
        },
      },
    });
  }

  static readonly vibrationPattern = [
    1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000,
    2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000,
    1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000,
    2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000,
    1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000,
    2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000,
    1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000,
    2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000,
    1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000,
    2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000,
    1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000,
    2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000,
    1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000,
    2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000,
    1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000,
    2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000,
    1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000, 2000, 1000,
    2000, 1000, 2000, 1000, 2000,
  ];
}
