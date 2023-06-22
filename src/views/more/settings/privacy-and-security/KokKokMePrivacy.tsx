import React, { useCallback, useState } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { Column } from 'components/layouts/Column';
import { SwitchButton } from 'components/atoms/switch/SwitchButton';
import { ModalBase } from 'components/modal';
import { COLOR } from 'constants/COLOR';
import { Row } from 'components/layouts/Row';
import { View } from 'react-native';
import { useFetchWithType } from '../../../../net/useFetch';
import { patch } from '../../../../net/rest/api';
import SwrContainer from '../../../../components/containers/SwrContainer';
import User from '../../../../types/auth/User';
import { t } from 'i18next';
import userAtom from 'stores/userAtom';
import { useAtom } from 'jotai';

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
const SwitchContainer = styled.View`
  flex-direction: row;
  padding: 15px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #e3e3e3;
`;
const SwitchLabel = styled.Text`
  margin-bottom: 5px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Description = styled.Text`
  font-size: 13px;
  width: 90%;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
`;
const ModalTitle = styled.Text`
  font-size: 15px;
  color: black;
  padding: 10px;
  font-weight: bold;
`;
const ModalText = styled.Text`
  color: #999999;
  padding: 2.5px;
`;
const CancelButton = styled.TouchableOpacity`
  background-color: #fff;
  width: 120px;
  height: 55px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: #ccc;
`;
const CancelLabel = styled.Text`
  color: #ccc;
  font-size: 15px;
  font-weight: bold;
`;
const ConfirmButton = styled.TouchableOpacity`
  background-color: ${COLOR.PRIMARY};
  width: 120px;
  height: 55px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${COLOR.PRIMARY};
`;
const ConfirmLabel = styled.Text`
  color: #fff;
  font-size: 15px;
  font-weight: bold;
`;

function KokKokMePrivacy() {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const navigation = useNavigation<MainNavigationProp>();

  const { data: meData, error: meError, mutate: mutateMe } = useFetchWithType<User>('/auth/me');
  const [user, setUser] = useAtom(userAtom);

  const update = useCallback(
    async (field: string, value: any) => {
      console.log('patch data', field, value, {
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

  const handlePrivate = () => {
    setIsVisible(true);
  };

  return (
    <MainLayout>
      <BackHeader title="Kok Kok Me" />
      <SwrContainer data={meData} error={meError}>
        {meData && (
          <>
            <SwitchContainer>
              <Column style={{ flex: 1 }}>
                <SwitchLabel style={{ fontSize: meData?.setting?.ct_text_size as number }}>
                  {t('common.Private Account')}
                </SwitchLabel>
                <Description style={{ fontSize: meData?.setting?.ct_text_size as number }}>
                  {t(
                    'privacy.You can restrict people who can see and follow your Kok Kok Me by turning On/Off of Private account',
                  )}
                </Description>
              </Column>
              <SwitchButton
                isEnabled={meData.setting.sc_sns_account === 'private'}
                setIsEnabled={async () => {
                  handlePrivate();
                }}
              />
            </SwitchContainer>
            <NavButtonContainer
              onPress={() =>
                navigation.navigate('/more/settings/privacy-and-security/kokkokme/privacy-settings', {
                  route: 'post',
                  private: meData.setting.sc_sns_account === 'private',
                })
              }
            >
              <NavLabel style={{ fontSize: meData?.setting?.ct_text_size as number }}>{t('privacy.Post')}</NavLabel>
              <Icon source={require('../../../../assets/ic-next.png')} />
            </NavButtonContainer>
            <NavButtonContainer
              onPress={() =>
                navigation.navigate('/more/settings/privacy-and-security/kokkokme/privacy-settings', {
                  route: 'live',
                  private: meData.setting.sc_sns_account === 'private',
                })
              }
            >
              <NavLabel style={{ fontSize: meData?.setting?.ct_text_size as number }}>{t('privacy.Live')}</NavLabel>
              <Icon source={require('../../../../assets/ic-next.png')} />
            </NavButtonContainer>
            <NavButtonContainer
              onPress={() =>
                navigation.navigate('/more/settings/privacy-and-security/kokkokme/privacy-settings', {
                  route: 'tag',
                  private: meData.setting.sc_sns_account === 'private',
                })
              }
            >
              <NavLabel style={{ fontSize: meData?.setting?.ct_text_size as number }}>{t('privacy.Tag')}</NavLabel>
              <Icon source={require('../../../../assets/ic-next.png')} />
            </NavButtonContainer>
            <NavButtonContainer
              onPress={() => navigation.navigate('/more/settings/privacy-and-security/kokkokme/hide-all-activities')}
            >
              <NavLabel style={{ fontSize: meData?.setting?.ct_text_size as number }}>
                {t('privacy.Hide all activities')}
              </NavLabel>
              <Icon source={require('../../../../assets/ic-next.png')} />
            </NavButtonContainer>
          </>
        )}
      </SwrContainer>
      <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
        <SwrContainer data={meData} error={meError}>
          <Column justify="center" align="center">
            <ModalTitle style={{ fontSize: meData?.setting?.ct_text_size as number }}>
              {meData?.setting.sc_sns_account === 'public'
                ? t('privacy.Switch to Private Account')
                : t('privacy.Switch to Public Account')}
            </ModalTitle>
            {meData?.setting.sc_sns_account === 'public' ? (
              <Column style={{ padding: 10 }}>
                <Row>
                  <ModalText style={{ fontSize: meData?.setting?.ct_text_size as number }}>• </ModalText>
                  <ModalText style={{ fontSize: meData?.setting?.ct_text_size as number }}>
                    {t('privacy.With private account, only your followers can see your all activities on Kok Kok Me')}
                  </ModalText>
                </Row>
                <ModalText />
                <Row>
                  <ModalText style={{ fontSize: meData?.setting?.ct_text_size as number }}>• </ModalText>
                  <ModalText style={{ fontSize: meData?.setting?.ct_text_size as number }}>
                    {t('privacy.People should send you follow requests to follow you')}
                  </ModalText>
                </Row>
              </Column>
            ) : (
              <Row style={{ padding: 10 }}>
                <ModalText style={{ fontSize: meData?.setting?.ct_text_size as number }}>• </ModalText>
                <ModalText style={{ fontSize: meData?.setting?.ct_text_size as number }}>
                  {t('privacy.Anyone can see your all activities on Kok Kok Me and follow you without your acceptance')}
                </ModalText>
              </Row>
            )}
            <Row style={{ paddingTop: 15 }}>
              <CancelButton
                onPress={() => {
                  setIsVisible(false);
                }}
              >
                <CancelLabel>{t('privacy.Cancel')}</CancelLabel>
              </CancelButton>
              <View style={{ padding: 10 }} />
              <ConfirmButton
                onPress={async () => {
                  setIsVisible(false);
                  await patch('/auth/user-setting', {
                    ...meData?.setting,
                    sc_sns_account: meData?.setting.sc_sns_account === 'public' ? 'private' : 'public',
                    sc_sns_post: meData?.setting.sc_sns_account === 'public' ? 'friends' : 'public',
                    sc_sns_live: meData?.setting.sc_sns_account === 'public' ? 'friends' : 'public',
                    sc_sns_tag: meData?.setting.sc_sns_account === 'public' ? 'friends' : 'public',
                  });

                  let myUserSetting = {
                    ...user,
                    ['setting']: {
                      ...user?.setting,
                      sc_sns_account: meData?.setting.sc_sns_account === 'public' ? 'private' : 'public',
                      sc_sns_post: meData?.setting.sc_sns_account === 'public' ? 'friends' : 'public',
                      sc_sns_live: meData?.setting.sc_sns_account === 'public' ? 'friends' : 'public',
                      sc_sns_tag: meData?.setting.sc_sns_account === 'public' ? 'friends' : 'public',
                    },
                  };
                  //@ts-ignore
                  setUser(myUserSetting);
                  await mutateMe();
                }}
              >
                <ConfirmLabel>{t('privacy.Confirm')}</ConfirmLabel>
              </ConfirmButton>
            </Row>
          </Column>
        </SwrContainer>
      </ModalBase>
    </MainLayout>
  );
}

export default KokKokMePrivacy;
