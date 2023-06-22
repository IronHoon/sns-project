import React, { useCallback, useEffect, useState } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import { SwitchButton } from 'components/atoms/switch/SwitchButton';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { Column } from 'components/layouts/Column';
import { View } from 'react-native';
import { useFetchWithType } from '../../../../net/useFetch';
import User from '../../../../types/auth/User';
import { patch } from '../../../../net/rest/api';
import AsyncStorage from '@react-native-community/async-storage';
import { t } from 'i18next';

const SwitchContainer = styled.View`
  flex-direction: row;
  padding: 15px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #e3e3e3;
`;
const SwitchLabel = styled.Text`
  flex: 1;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Description = styled.Text`
  font-size: 13px;
  /* line-height: 18px; */
  color: #999999;
`;
const NavButtonContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding: 15px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #e3e3e3;
`;
const Icon = styled.Image`
  width: 22px;
  height: 22px;
  tint-color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const NavLabel = styled.Text`
  flex: 1;
  font-size: 14px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;

function Passcode() {
  const [bioAuth, setBioAuth] = useState<boolean>();
  const [passCodeAuth, setPassCodeAuth] = useState<boolean>();

  const navigation = useNavigation<MainNavigationProp>();

  const { data: meData, error: meError, mutate: mutateMe } = useFetchWithType<User>('/auth/me');

  const update = useCallback(
    async (field: string, value: any) => {
      console.log({
        ...meData?.setting,
        [field]: value,
      });
      await patch('/auth/user-setting', {
        ...meData?.setting,
        [field]: value,
      });
      await mutateMe();
    },
    [meData],
  );

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const passCodeAuth = await AsyncStorage.getItem('passCodeAuth');
        const bioAuth = await AsyncStorage.getItem('bioAuth');
        if (passCodeAuth === 'on') {
          setPassCodeAuth(true);
        } else {
          setPassCodeAuth(false);
        }
        if (bioAuth === 'true') {
          setBioAuth(true);
        } else {
          setBioAuth(false);
        }
      })();
    }, [passCodeAuth]),
  );

  const handleSetPasscode = async () => {
    if (!passCodeAuth) {
      navigation.navigate('/more/settings/privacy-and-security/passcode/set-passcode', { route: 'set-pass' });
    } else {
      setPassCodeAuth(false);
      await update('sc_passcode_auth', 0);
      await AsyncStorage.setItem('passCodeAuth', 'off');
      await AsyncStorage.setItem('bioAuth', 'false');
    }
  };

  return (
    <MainLayout>
      <BackHeader title={t('privacy.Passcode lock')} />
      <SwitchContainer>
        <SwitchLabel style={{ fontSize: meData?.setting?.ct_text_size as number }}>
          {t('privacy.Passcode lock')}
        </SwitchLabel>
        <SwitchButton isEnabled={!!passCodeAuth} setIsEnabled={() => handleSetPasscode()} />
      </SwitchContainer>
      {passCodeAuth && (
        <>
          <SwitchContainer>
            <Column style={{ flex: 1, height: 40 }}>
              <SwitchLabel>{t('privacy.Biometric authentication')}</SwitchLabel>
              <Description>{t('privacy.Touch ID, Face ID')}</Description>
            </Column>
            <SwitchButton
              isEnabled={!!bioAuth}
              setIsEnabled={async () => {
                await AsyncStorage.setItem('bioAuth', bioAuth ? 'false' : 'true');
                setBioAuth(!bioAuth);
              }}
            />
          </SwitchContainer>
          <NavButtonContainer
            onPress={() =>
              navigation.navigate('/more/settings/privacy-and-security/passcode/set-passcode', { route: 'change-pass' })
            }
          >
            <NavLabel>{t('privacy.Change passcode')}</NavLabel>
            <Icon source={require('../../../../assets/ic-next.png')} />
          </NavButtonContainer>
        </>
      )}
      <Column style={{ padding: 15 }}>
        <Description style={{ fontSize: meData?.setting?.ct_text_size as number }}>
          {t('privacy.When you set up an additional passcode, a lock icon will appear on the chats page')}
          {t('privacy.Tap it to lock and unlock the app')}
        </Description>
        <View style={{ padding: 10 }} />
        <Description style={{ fontSize: meData?.setting?.ct_text_size as number }}>
          {t("privacy.If you forget the passcode, you'll need to delete and reinstall the app")}
          {t('privacy.All chats will be lost')}
        </Description>
      </Column>
    </MainLayout>
  );
}

export default Passcode;
