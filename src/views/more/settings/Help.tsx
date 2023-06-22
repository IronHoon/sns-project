import React from 'react';
import BackHeader from '../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { Row } from 'components/layouts/Row';
import { Linking, TouchableOpacity } from 'react-native';
import deviceInfoModule from 'react-native-device-info';
import { t } from 'i18next';
import { useState } from 'react';
import hideSwitcherForDebuggerAtom from 'stores/hideSwitcherForDebuggerAtom';
import { useAtom, useAtomValue } from 'jotai';
import User from 'types/auth/User';
import userAtom from 'stores/userAtom';

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
const Divider = styled.View`
  height: 8px;
  background-color: #f8f8f8;
`;
const VersionContainer = styled.View`
  padding: 15px;
`;
const Version = styled.Text`
  font-size: 14px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Description = styled.Text`
  font-size: 13px;
  padding-top: 5px;
  line-height: 18px;
  color: #999999;
`;

function Help() {
  const [hideSwitcher, setHideSwitcher] = useAtom(hideSwitcherForDebuggerAtom);
  const [count, setCount] = useState(0);
  const navigation = useNavigation<MainNavigationProp>();
  const myUser: User | null = useAtomValue(userAtom);

  const email = 'contact@kokkok.com';
  // TODO: 실제 메일 주소로 교체 필요

  const mailTo = () => {
    Linking.openURL(`mailto:${email}`);
  };
  const version = deviceInfoModule.getVersion();
  // TODO: 앱스토어 등록 시 앱스토어 버전과 비교하는 코드 필요;

  return (
    <MainLayout>
      <BackHeader title={t('chatting.Help')} />
      <NavButtonContainer onPress={() => mailTo()}>
        <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
          {t('chatting.Support Center')}
        </NavLabel>
        <Icon source={require('assets/ic-next.png')} />
      </NavButtonContainer>
      <NavButtonContainer onPress={() => mailTo()}>
        <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('chatting.Contact us')}</NavLabel>
        <Icon source={require('assets/ic-next.png')} />
      </NavButtonContainer>
      <NavButtonContainer onPress={() => navigation.navigate('/webview', { title: t('chatting.Terms of Service') })}>
        <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
          {t('chatting.Terms of Service')}
        </NavLabel>
        <Icon source={require('assets/ic-next.png')} />
      </NavButtonContainer>
      <NavButtonContainer onPress={() => navigation.navigate('/more/settings/help/license')}>
        <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('chatting.Licenses')}</NavLabel>
        <Icon source={require('assets/ic-next.png')} />
      </NavButtonContainer>
      <NavButtonContainer onPress={() => navigation.navigate('/more/settings/help/delete-account')}>
        <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
          {t('chatting.Delete my account')}
        </NavLabel>
        <Icon source={require('assets/ic-next.png')} />
      </NavButtonContainer>
      <Divider />
      <TouchableOpacity
        onPress={() => {
          setCount((localCount) => localCount + 1);
          if (count === 10) {
            setHideSwitcher(!hideSwitcher);
          }
        }}
      >
        <VersionContainer>
          <Row>
            <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
              {t('chatting.Current version')}
            </NavLabel>
            <Version style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{version}</Version>
          </Row>
          <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
            {t('chatting.You are using the latest version')}
          </Description>
        </VersionContainer>
      </TouchableOpacity>
    </MainLayout>
  );
}

export default Help;
