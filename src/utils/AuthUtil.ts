import { get, post, rememberToken, remove, removeToken } from 'net/rest/api';
import Certification from 'types/auth/Certification';
import CertificationPayload from 'types/auth/CertificationPayload';
import Nullable from 'types/_common/Nullable';
import FirebaseMessageUtil from './chats/FirebaseMessageUtil';
import { getDeviceName, getUniqueId } from 'react-native-device-info';
import User from '../types/auth/User';
import LogUtil from './LogUtil';
import CertificationForDesktopPayload from 'types/auth/CertificationForDesktopPayload';
import ChatSocketUtil from './chats/ChatSocketUtil';
import { isDevAuth } from './isDevAuth';
import MySetting from 'MySetting';
import AsyncStorage from '@react-native-community/async-storage';
import CallManagerForAos from './calls/CallManagerForAos';

class AuthUtil {
  static user: User;

  static async logout(deviceId?) {
    LogUtil.info('로그아웃을 진행하겠습니다.!!!');
    try {
      if (deviceId) {
        await remove(`/auth/devices/${deviceId}/logout`, null, undefined, true);
      }
    } catch (error: any) {
      console.warn(error);
    }
    if (getUniqueId() === deviceId) {
      // 내 디바이스 로그아웃일때만 로그아웃 처리
      try {
        removeToken();
      } catch (error: any) {
        console.warn(error);
      }

      // Empty the list of locally saved chats when logging out
      // 로그아웃시 로컬에 저장된 채팅 목록을 비운다
      LogUtil.info("await AsyncStorage.removeItem('rooms');");
      await AsyncStorage.removeItem('rooms');

      try {
        const chatSocketUtil = ChatSocketUtil.instance;
        await chatSocketUtil.easy.leave('AuthUtil');
      } catch (error: any) {
        console.warn(error);
      }

      if (MySetting.isAndroid) {
        try {
          await CallManagerForAos.deleteAllNotification();
        } catch (error: any) {}
      }
    }
  }

  static async loginWithTest(): Promise<Certification | undefined> {
    const _params: any = {
      contact: '+821012345678',
      code: '646384',
      device_name: await getDeviceName(),
      device_id: getUniqueId(),
      push_token: (await FirebaseMessageUtil.getFcmToken()) ?? '',
      type: MySetting.deviceType,
    };
    if (isDevAuth()) {
      _params.mode = 'dev';
    }
    const certification = await post<Certification, CertificationPayload>(
      '/pub/auth/certification',
      _params,
      null,
      (error) => {
        console.log(`loginWithTest error : ${JSON.stringify(error)}`);
      },
    );

    if (certification) {
      AuthUtil.user = certification.user;
      await rememberToken(certification.token.token);
    }

    return certification;
  }

  static login(payload: CertificationPayload): Promise<Certification> {
    return new Promise(async (resolve, reject) => {
      try {
        const certification = await post<Certification, CertificationPayload>(
          '/pub/auth/certification',
          payload,
          null,
          (error) => {
            reject(error);
          },
          true,
        );
        if (certification) {
          // LogUtil.info('AuthUtil login certification', certification);
          AuthUtil.user = certification.user;
          await rememberToken(certification.token.token);
          resolve(certification);
        } else {
          reject('certification is empty at login');
        }
      } catch (error: any) {
        reject(error);
      }
    });
  }
  static loginForDesktop(payload: CertificationForDesktopPayload): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await post<Certification, CertificationForDesktopPayload>(
          '/auth/qr-scan',
          payload,
          null,
          (error) => {
            reject(error);
          },
          true,
        );
        resolve();
      } catch (error: any) {
        reject(error);
      }
    });
  }

  static async requestAddFriend(contact: String): Promise<void> {
    return new Promise((resolve, reject) => {
      post('/auth/contacts', { contacts: [{ number: contact }] })
        .then(() => {
          LogUtil.info(`[${contact}] requestAddFriend res`);
          resolve();
        })
        .catch((error) => {
          LogUtil.info(`[${contact}] requestAddFriend res`, null);
          reject(error);
        });
    });
  }

  static async requestBlockUser(type: string, target_id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      post('/auth/block', { type: type, target_id: target_id })
        .then(() => {
          LogUtil.info(`[${target_id}] requestBlock res`);
          resolve();
        })
        .catch((error) => {
          LogUtil.info(`[${target_id}] requestBlock res`, null);
          reject(error);
        });
    });
  }

  static async requestUpdateMyLanguage(lang: string): Promise<void> {
    return new Promise((resolve, reject) => {
      post('/auth/me/language', {
        language: lang,
        device_id: getUniqueId(),
      })
        .then((res) => {
          LogUtil.info('서버와 언어 동기화 성공', [res]);
          resolve();
        })
        .catch((e) => {
          LogUtil.info('서버와 언어 동기화 실패', [e?.response?.data]);
        });
    });
  }

  static async requestGetDuplicateId(uid: string): Promise<void> {
    return new Promise((resolve, reject) => {
      post('/pub/auth/duplicate-id', { uid: uid })
        .then(() => {
          LogUtil.info(`[${uid}] requestGetDuplicateId res`);
          resolve();
        })
        .catch((error) => {
          LogUtil.info(`[${uid}] requestGetDuplicateId res`, null);
          reject(error);
        });
    });
  }

  static async getMe(): Promise<User | undefined> {
    const user = await get<User>(
      '/auth/me',
      null,
      (error) => {
        console.warn(error);
      },
      false,
    );
    if (user) {
      AuthUtil.user = user;
    }

    return user;
  }

  static setMe(user: User) {
    AuthUtil.user = user;
  }

  static getUserId(): Nullable<number> {
    const userId = AuthUtil.user?.id;
    // LogUtil.info('AuthUtil getUserId', userId);
    return userId;
  }
  static getUserName(): string {
    return `${AuthUtil.user?.first_name ?? ''} ${AuthUtil.user?.last_name ?? ''}`;
  }
  static getProfileImageUrl(): Nullable<string> {
    return AuthUtil.user?.profile_image;
  }
}

export default AuthUtil;
