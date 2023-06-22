import React, { useCallback, useState } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { useFetchWithType } from '../../../../net/useFetch';
import User from '../../../../types/auth/User';
import { patch } from '../../../../net/rest/api';
import AsyncStorage from '@react-native-community/async-storage';
import SwrContainer from '../../../../components/containers/SwrContainer';
import { t } from 'i18next';
import userAtom from '../../../../stores/userAtom';
import { useAtom } from 'jotai';

const Description = styled.Text`
  font-size: 13px;
  /* line-height: 18px; */
  color: #999999;
  margin-right: 5px;
`;
const NavButtonContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding: 16px;
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

function PrivacyAndSecurity() {
  const navigation = useNavigation<MainNavigationProp>();
  const { data: meData, error: meError, mutate: mutateMe } = useFetchWithType<User>('/auth/me');
  const [passCodeAuth, setPassCodeAuth] = useState<boolean>();
  const [user, setUser] = useAtom(userAtom);

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
        if (passCodeAuth === 'on') {
          setPassCodeAuth(true);
        } else {
          setPassCodeAuth(false);
        }
      })();
    }, []),
  );

  return (
    <MainLayout>
      <BackHeader title={t('privacy.Privacy and Security')} />
      <SwrContainer data={meData} error={meError}>
        <>
          <NavButtonContainer onPress={() => navigation.navigate('/more/settings/privacy-and-security/recent-login')}>
            <NavLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>{t('privacy.Recent login')}</NavLabel>
            {user?.setting.sc_recent_login === 'public' && (
              <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>
                {t('privacy.Everybody')}
              </Description>
            )}
            {user?.setting.sc_recent_login === 'friends' && (
              <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>
                {t('privacy.My contacts')}
              </Description>
            )}
            {user?.setting.sc_recent_login === 'private' && (
              <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>
                {t('privacy.Nobody')}
              </Description>
            )}
            <Icon source={require('../../../../assets/ic-next.png')} />
          </NavButtonContainer>
          <NavButtonContainer onPress={() => navigation.navigate('/more/settings/privacy-and-security/profile-photo')}>
            <NavLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
              {t('privacy.Profile photo')}
            </NavLabel>
            {user?.setting.sc_profile_photo === 'public' && (
              <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>
                {t('privacy.Everybody')}
              </Description>
            )}
            {user?.setting.sc_profile_photo === 'friends' && (
              <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>
                {t('privacy.My contacts')}
              </Description>
            )}
            {user?.setting.sc_profile_photo === 'private' && (
              <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>
                {t('privacy.Nobody')}
              </Description>
            )}
            <Icon source={require('../../../../assets/ic-next.png')} />
          </NavButtonContainer>
        </>
      </SwrContainer>
      <NavButtonContainer onPress={() => navigation.navigate('/more/settings/privacy-and-security/call')}>
        <NavLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>{t('privacy.Call')}</NavLabel>
        <Icon source={require('../../../../assets/ic-next.png')} />
      </NavButtonContainer>
      <NavButtonContainer onPress={() => navigation.navigate('/more/settings/privacy-and-security/friends')}>
        <NavLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>{t('privacy.Friends')}</NavLabel>
        <Icon source={require('../../../../assets/ic-next.png')} />
      </NavButtonContainer>
      <NavButtonContainer onPress={() => navigation.navigate('/more/settings/privacy-and-security/passcode')}>
        <NavLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
          {t('privacy.Passcode and Face ID')}
        </NavLabel>
        {passCodeAuth ? (
          <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>{t('privacy.on')}</Description>
        ) : (
          <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>{t('privacy.off')}</Description>
        )}
        <Icon source={require('../../../../assets/ic-next.png')} />
      </NavButtonContainer>
      <NavButtonContainer onPress={() => navigation.navigate('/more/settings/privacy-and-security/kokkokme')}>
        <NavLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>Kok Kok Me</NavLabel>
        <Icon source={require('../../../../assets/ic-next.png')} />
      </NavButtonContainer>
      <NavButtonContainer onPress={() => navigation.navigate('/more/settings/privacy-and-security/birthday')}>
        <NavLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>{t('privacy.Birthday')}</NavLabel>
        <Icon source={require('../../../../assets/ic-next.png')} />
      </NavButtonContainer>
      <NavButtonContainer onPress={() => navigation.navigate('/more/settings/privacy-and-security/bolcked-users')}>
        <NavLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>{t('privacy.Blocked users')}</NavLabel>
        <Icon source={require('../../../../assets/ic-next.png')} />
      </NavButtonContainer>
    </MainLayout>
  );
}

export default PrivacyAndSecurity;
