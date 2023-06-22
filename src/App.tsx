/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './navigations/MainNavigator';
import { ThemeProvider } from 'styled-components';
import { dark, light } from 'theme';
import Toast from 'react-native-toast-message';
import { ToastConfig } from 'config/ToastConfig';
import { AppRegistry, Image, LogBox, StatusBar, StyleSheet, Text, TouchableOpacity, View, Button } from 'react-native';
import axios from 'axios';
import { useSetAtom } from 'jotai';
import userAtom from './stores/userAtom';
import tokenAtom from './stores/tokenAtom';
import AsyncStorage from '@react-native-community/async-storage';
import { get, getToken, post, rememberToken, removeToken } from './net/rest/api';
import MediaWebView from './views/MediaWebView';
import FirebaseMessageUtil from 'utils/chats/FirebaseMessageUtil';
// import MySetting from 'MySetting';
import AuthUtil from 'utils/AuthUtil';
import { useAtom, useAtomValue } from 'jotai';
import themeAtom from 'stores/themeAtom';
import LogUtil from 'utils/LogUtil';
import { preload } from './net/useFetch';
import tw from 'twrnc';
import { enableLatestRenderer } from 'react-native-maps';

import ConfirmView from './components/molecules/ConfirmView';
import useSocket from 'hooks/useSocket';
import { LockPage } from './pages';
import { CallAuthBiomatirc } from './utils/Biometric';
import addAutoUtil from './utils/AddAutoUtil';
import BackgroundFetch from 'react-native-background-fetch';
import CallView from 'components/molecules/CallView';
import { RootNatigation } from 'navigations/RootNavigation';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';
import { t } from 'i18next';
import Modal from 'react-native-modal';
import { COLOR } from './constants/COLOR';
import ChatSocketUtil from 'utils/chats/ChatSocketUtil';
import { useTranslation } from 'react-i18next';
import useAppState from 'hooks/useAppState';
import { useEffectCallKeep } from 'utils/calls/CallManagerForIos';
import friendListAtom from 'stores/friendListAtom';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffectDeepLink } from 'utils/chats/DeepLinkUtil';
import MySetting from './MySetting';
import { Debugger } from 'react-native-qa-debugger';
import hideSwitcherForDebuggerAtom from 'stores/hideSwitcherForDebuggerAtom';
import { appKeyAtom } from './stores/appKeyAtom';
import CallManagerForAos from 'utils/calls/CallManagerForAos';
import showCallViewAtom from 'stores/showCallViewAtom';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import { useEffectShareExtension } from 'utils/ShareExtensionUtill';
import chatHttpUtil from "./utils/chats/ChatHttpUtil";

enableLatestRenderer();

const useEffectForSocket = () => {
  const { chatSocketUtil } = useSocket();
  const [needInitSocket, _setNeedInitSocket] = useState<boolean | null>(null);
  const invokeInitSocket = () => {
    _setNeedInitSocket((_needInitSocket) => !_needInitSocket);
  };

  useEffect(() => {
    (async () => {
      if (needInitSocket === null) {
        return;
      }
      if (!chatSocketUtil.socket?.connected) {
        ChatSocketUtil.instance.easy.join('useEffectForSocket needInitSocket');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needInitSocket]);

  useEffect(() => {
    (async () => {
      if (chatSocketUtil.socket && !chatSocketUtil.socket.connected) {
        chatSocketUtil.easy.join('useEffectForSocket reconnected');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatSocketUtil.socket?.connected]);

  return { invokeInitSocket };
};

const useEffectChangeLanguage = () => {
  const user = useAtomValue(userAtom);
  const { i18n } = useTranslation();
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) {
        return;
      }

      const lang = i18n.language;
      if (!lang) {
        return;
      }

      AsyncStorage.setItem('lang', lang);
      AuthUtil.requestUpdateMyLanguage(lang);
    })();
  }, [i18n.language, user]);
};

const App = () => {
  LogBox.ignoreLogs(["exported from 'deprecated-react-native-prop-types'."]);
  LogBox.ignoreLogs(['`new NativeEventEmitter()` was called with a non-null argument without the required']);
  LogBox.ignoreLogs(['Sending `OnActiveSpeakerScore`']);
  LogBox.ignoreLogs(['Sending `OnMeetingEnd`']);
  LogBox.ignoreLogs(['Failed prop type: Invalid prop `source`']);

  useEffectDeepLink();
  // for android
  useEffectShareExtension();
  const { invokeInitSocket } = useEffectForSocket();
  useEffectChangeLanguage();
  useEffectCallKeep();

  const { i18n } = useTranslation();
  const [theme, setTheme] = useAtom(themeAtom);
  const [loaded, setLoaded] = useState<boolean | null>(null);
  const [user, setUser] = useAtom(userAtom);
  const setToken = useSetAtom(tokenAtom);
  const setFriendList = useSetAtom(friendListAtom);
  const [passCode, setPassCode] = useState(false);
  const [bioMatricModal, setBioMatricModal] = useState(false);
  const [bioauth, setBioAuth] = useState(false);
  const hideSwitcher = useAtomValue(hideSwitcherForDebuggerAtom);

  //인터넷 감지 상태들
  const [isOffline, setIsOffline] = useState(false);
  const netInfo = useNetInfo();

  useAppState({
    onForeground: () => {
      MySetting.isBackground = false;
      const instance = ChatSocketUtil.instance;
      (async () => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          await rememberToken(token);
        }

        await instance.easy.join('onForeground in App.tsx');
      })();
    },
    onBackground: () => {
      MySetting.isBackground = true;
      (async()=>{
        await chatHttpUtil.syncBadgeUnreadCount();
      })();
      (async () => {
        const passCodeAuth = await AsyncStorage.getItem('passCodeAuth');
        if (passCodeAuth === 'on') {
          setPassCode(true);
        }
        // LogUtil.info('passcodeAuth', passCodeAuth);
        const bioAuth = await AsyncStorage.getItem('bioAuth');
        if (bioAuth === 'true') {
          setBioAuth(true);
          setBioMatricModal(true);
          // LogUtil.info('bioAuth', bioAuth);
        }
      })();
    },
  });

  const Button = ({ children, ...props }) => (
    <TouchableOpacity style={styles.button} {...props}>
      <Text style={styles.buttonText}>{children}</Text>
    </TouchableOpacity>
  );

  const NoInternetModal = ({ show, onRetry }) => (
    <Modal isVisible={show} style={styles.modal} animationInTiming={600}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{t('common.Connection Error')}</Text>
        <Text style={styles.modalText}>{t('common.Unstable network connection')}</Text>
        <Button onPress={onRetry}>{t('common.Try Again')}</Button>
      </View>
    </Modal>
  );

  // Unsubscribe

  useEffect(() => {
    setIsOffline(!netInfo.isConnected);
    if (!netInfo.isConnected) {
      return;
    }

    //true, false일때만 연결.
    (async () => {
      //로딩전, 로그인된 유저에 대한 설정
      const token = await AsyncStorage.getItem('token');

      LogUtil.info('App token', [token]);
      if (token) {
        setToken(token);
        await rememberToken(token);

        const me = await AuthUtil.getMe();
        if (me) {
          setUser(me);
          if (me.setting?.ct_chat_theme !== 'system') {
            // @ts-ignore
            setTheme(me.setting?.ct_chat_theme);
            // 내연락처를 추가한 유저의 아이디
            get('auth/contacts/suggestion')
              .then((result) => {
                console.log('내연락처를 추가한 유저의 아이디', result);
                //@ts-ignore
                setFriendList(result);
              })
              .catch((error) => {
                console.log('friendList Error', error);
              });
          }
        }
      }

      FirebaseMessageUtil.init();

      invokeInitSocket();

      // 언어 설정
      const lang = (await AsyncStorage.getItem('lang')) || 'en';
      if (lang) {
        await i18n.changeLanguage(lang);
      }

      setLoaded(true);

      //로딩후, 로그인된 유저에 대한 설정 (preload)
      if (token) {
        preload('/auth/me')
          .then(() => preload('/auth/contacts'))
          .then(() => preload('/auth/contacts/birthday'))
          .then(() => preload('/auth/contacts/favorites'))
          .then(() => preload('/socials/timeline?page=1&limit=10'))

          .catch((error) => {
            LogUtil.error('preload error', error);
          });
      }
    })();
  }, [netInfo.isConnected]);

  useEffect(() => {
    return () => {
      LogUtil.info('앱을 종료하겠습니다.');
      ChatSocketUtil.instance.easy.leave('App');
    };
  }, []);

  useEffect(() => {
    (async () => {
      const passCodeAuth = await AsyncStorage.getItem('passCodeAuth');
      if (passCodeAuth === 'on') {
        setPassCode(true);
      }
      const bioAuth = await AsyncStorage.getItem('bioAuth');
      if (bioAuth === 'true') {
        setBioAuth(true);
        setBioMatricModal(true);
      }
    })();
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
        // LogUtil.error('App error', error);
        // 401 오류 수신시
        if (error.response.status === 401) {
          removeToken();
          setToken('');
          RootNatigation.popToTop();
          RootNatigation.replace('/phone-number-input', { route: 'sign-in' });
          return Promise.reject(error);
        } else {
          return Promise.reject(error);
        }
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [setToken]);

  useEffect(() => {
    (async () => {
      await initBackgroundFetch();
    })();
  }, []);

  useEffect(() => {
    if (!user?.setting.ct_text_size) {
      setUser({ ...user, setting: { ...user?.setting, ct_text_size: 16 } });
    }
  }, [user]);

  // addAutoUtil.getContactList();
  // Start the background worker
  const initBackgroundFetch = async () => {
    const status = await BackgroundFetch.configure(
      {
        minimumFetchInterval: 60 * 24 * 5, // 60*24*5 minutes
        stopOnTerminate: false,
        enableHeadless: true,
        requiresCharging: false,
        // ADDITIONAL CONFIG HERE
      },
      async (taskId) => {
        switch (taskId) {
          case 'com.transistorsoft.addauto':
            console.log('Received custom task');
            const isAddAuto = await AsyncStorage.getItem('isAddAuto');
            if (isAddAuto === 'true') {
              addAutoUtil.getContactList().then(async (contact) => {
                post('/auth/contacts', {
                  contacts: [...contact, { number: '02023', name: 'dff' }],
                })
                  .then(() => {
                    console.log('성공');
                  })
                  .catch((e) => {
                    if (e.response.data.message === '가입되어있지 않은 연락처입니다.') {
                      LogUtil.info('There is no KokKokUser in your contact');
                    }
                  });
              });
            } else {
              console.log('Add Automatically friends is not set');
            }

            break;
          default:
            console.log('Default fetch task');
        }
        BackgroundFetch.finish(taskId);
      },
      (taskId) => {
        console.log(taskId);
        BackgroundFetch.finish(taskId);
      },
    );

    console.log('[ RNBF STATUS ]', status);
  };

  BackgroundFetch.scheduleTask({
    taskId: 'com.transistorsoft.addauto',
    forceAlarmManager: true,
    delay: 10000,
    periodic: true,
  });

  const setAppKey = useSetAtom(appKeyAtom);
  // get site meta from api server
  useEffect(() => {
    get<any>('/pub/site-metas?key=appKey')
      .then((meta) => {
        if (meta) {
          setAppKey(meta.value);
        } else {
          console.log('no meta');
        }
      })
      .catch((error) => {
        console.warn(error);
      });
  }, []);

  if (!loaded) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Image style={{ width: 131, resizeMode: 'contain' }} source={require('./assets/app-icons/kokFinal.png')} />

        <NoInternetModal
          show={isOffline}
          onRetry={() => {
            NetInfo.fetch().then(async (state) => {
              setIsOffline(!state.isConnected);
            });
          }}
        />
      </View>
    );
  }
  const CallBack = async (data) => {
    // console.info(data);
    setBioMatricModal(false);
    if (data === true) {
      let sign = await CallAuthBiomatirc();
      LogUtil.info('callback', sign);
      if (sign) {
        console.log('인증 성공!!!', JSON.stringify(sign));
        setPassCode(false);
        setBioAuth(false);
      } else if (sign === null) {
        setBioAuth(false);
      } else {
        await CallBack(true);
      }
    }
  };

  if (MySetting.isAndroid) {
    StatusBar.setBackgroundColor(theme === 'dark' ? '#585858' : '#ffffff');
  }
  StatusBar.setBarStyle(theme === 'dark' ? 'light-content' : 'dark-content');

  return (
    <>
      <SafeAreaProvider>
        <ThemeProvider theme={theme === 'dark' ? dark : light}>
          <NavigationContainer ref={RootNatigation.navigationRef}>
            {passCode && <LockPage setPassCode={setPassCode} bioauth={bioauth} setBioAuth={setBioAuth} />}
            <MainNavigator />
            <CallView />
          </NavigationContainer>
          <ConfirmView />
          <Debugger hideSwitcher={hideSwitcher} />
        </ThemeProvider>
        <Toast config={ToastConfig} />
        <MediaWebView />
        <NoInternetModal
          show={isOffline}
          onRetry={() => {
            NetInfo.fetch().then(async (state) => {
              setIsOffline(!state.isConnected);
            });
          }}
        />
      </SafeAreaProvider>
    </>
  );
};

const styles = StyleSheet.create({
  // ...
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#000000',
    fontSize: 22,
    fontWeight: '600',
  },
  modalText: {
    fontSize: 18,
    color: '#000000',
    marginTop: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: COLOR.PRIMARY,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
  },
});

export default App;
