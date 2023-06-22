import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import PermissionUtil from 'utils/PermissionUtil';
import { PERMISSIONS, RESULTS } from 'react-native-permissions';
import LogUtil from 'utils/LogUtil';
import { PermissionsCallback } from './landing/Permissions';
import Modal from 'react-native-modal';
import { t } from 'i18next';
import { COLOR } from '../constants/COLOR';
import NetInfo, { useNetInfo } from '@react-native-community/netinfo';

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

export default function Splash({ navigation }) {
  const goNextPage = useCallback(async (navigation) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      navigation.replace('/chats');
    } else {
      // navigation.replace('/phone-number-input', { route: 'sign-in' });
      navigation.replace('/landing');
    }
  }, []);

  const netInfo = useNetInfo();
  const [isOffline, setIsOffline] = useState(false);

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

  useEffect(() => {
    // LogUtil.info('splash isconnected', netInfo.isConnected);
    setIsOffline(!netInfo.isConnected);
  }, [netInfo]);

  useFocusEffect(
    useCallback(() => {
      PermissionUtil.checkMultiplePermissions([
        Platform.OS === 'ios' ? PERMISSIONS.IOS.MEDIA_LIBRARY : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      ]).then((grants) => {
        const permissionStatusList = Object.values(grants);
        const someDenied = permissionStatusList.some((permissionStatus) => permissionStatus === RESULTS.DENIED);
        if (someDenied) {
          navigation.replace('/landing/permissions', {
            callback: new PermissionsCallback((navigation) => {
              goNextPage(navigation);
            }),
          });
        } else {
          goNextPage(navigation);
        }
      });
    }, [navigation]),
  );

  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <Image style={{ width: 131, resizeMode: 'contain' }} source={require('../assets/app-icons/kokFinal.png')} />

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
