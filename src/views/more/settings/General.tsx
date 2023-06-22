import React, { useContext, useState } from 'react';
import { View, ScrollView } from 'react-native';
import tw from 'twrnc';
import BackHeader from '../../../components/molecules/BackHeader';
import styled, { ThemeContext } from 'styled-components/native';
import MainLayout from 'components/layouts/MainLayout';
import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import { ModalBase } from 'components/modal';
import { Column } from 'components/layouts/Column';
import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';
import { useFetchWithType } from '../../../net/useFetch';
import SwrContainer from '../../../components/containers/SwrContainer';
import { remove } from 'net/rest/api';
import { t, i18n } from 'i18next';
import { getI18n } from 'react-i18next';
import { getUniqueId } from 'react-native-device-info';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { useAtomValue, useSetAtom } from 'jotai';
import userAtom from 'stores/userAtom';
import AuthUtil from 'utils/AuthUtil';
import User from 'types/auth/User';

const Container = styled.View`
  padding: 20px;
  flex: 1;
`;
const Label = styled.Text`
  font-weight: 500;
  padding-bottom: 10px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Description = styled.Text`
  font-size: 13px;
  padding-bottom: 15px;
  color: #999999;
`;
const DeviceListContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 10px;
  padding-bottom: 20px;
`;

const DeviceName = styled.Text`
  flex: 1;
  /* font-size: 13px; */
  margin-right: 15px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const ModalTitle = styled.Text`
  color: black;
  padding: 5px;
  font-size: 15px;
  font-weight: 500;
`;
const ModalText = styled.Text`
  color: #999999;
  padding-top: 5px;
  padding-bottom: 10px;
  text-align: center;
`;
const CancelButton = styled.TouchableOpacity`
  background-color: #fff;
  width: 110px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: #ccc;
`;
const CancelLabel = styled.Text`
  color: #ccc;
  font-weight: bold;
`;
const Deregister = styled.TouchableOpacity`
  background-color: ${COLOR.PRIMARY};
  width: 110px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${COLOR.PRIMARY};
`;
const DregisterLabel = styled.Text`
  color: #fff;
  font-weight: bold;
`;

const DeviceLogout = ({ device, onClick }) => {
  const lan = getI18n().language;
  const myUser: User | null = useAtomValue(userAtom);
  return (
    <DeviceListContainer>
      <DeviceName numberOfLines={1} style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
        {device}
      </DeviceName>
      <Button
        label={t('general.Logout')}
        width={lan === 'lo' ? 100 : 70}
        height={35}
        borderRadius
        fontSize={13}
        fontWeight={400}
        variant={ButtonVariant.Outlined}
        textvariant={ButtonTextVariant.OutlinedText}
        onPress={() => onClick()}
      />
    </DeviceListContainer>
  );
};

function General() {
  const themeContext = useContext(ThemeContext);
  const [isVisible, setIsVisible] = useState(false);
  const [deviceId, setDeviceId] = useState<string>();
  const setMe = useSetAtom(userAtom);
  const myUser: User | null = useAtomValue(userAtom);

  const lan = getI18n().language;

  const { data, error, mutate } = useFetchWithType<any>('/auth/devices', true);
  const [devices, setDevices] = useState(data);
  const navigation = useNavigation<MainNavigationProp>();

  return (
    <MainLayout>
      <BackHeader title={t('general.General')} />
      <Container>
        <SwrContainer data={devices} error={error}>
          <ScrollView>
            <Label style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
              {t('general.Device Management')}
            </Label>
            <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
              {t('general.You can manage your all devices including mobile and desktop')}
            </Description>
            <View style={tw`mb-5`}>
              {devices?.map((device) => (
                <DeviceLogout
                  key={device.id}
                  device={device.device_name}
                  onClick={() => {
                    setDeviceId(device.device_id);
                    setIsVisible(true);
                  }}
                />
              ))}
            </View>
            <Label style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
              {t('general.Deregister Device')}
            </Label>
            <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
              {t('general.You can reregister your current device if you change your device')}
            </Description>
            {themeContext.dark ? (
              <Button
                label="Deregister this device"
                width={160}
                height={35}
                borderRadius
                fontSize={13}
                fontWeight={400}
                variant={ButtonVariant.Outlined}
                textvariant={ButtonTextVariant.OutlinedText}
                whitelined
                whitelinedText
                onPress={() => {
                  setDeviceId(getUniqueId());
                  setIsVisible(true);
                }}
              />
            ) : (
              <Button
                label={t('general.Deregister this device')}
                width={lan === 'lo' ? 250 : 160}
                height={35}
                borderRadius
                fontSize={13}
                fontWeight={400}
                variant={ButtonVariant.Outlined}
                textvariant={ButtonTextVariant.OutlinedText}
                blacklined
                blacklinedText
                onPress={() => {
                  setDeviceId(getUniqueId());
                  setIsVisible(true);
                }}
              />
            )}
          </ScrollView>
        </SwrContainer>
      </Container>
      <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle>{t('general.Deregister device')}</ModalTitle>
          <ModalText>{t('general.You will be logged out if you deregsiter your current device')}</ModalText>
          <Row style={{ paddingTop: 15 }}>
            <CancelButton onPress={() => setIsVisible(false)}>
              <CancelLabel>{t('general.Cancel')}</CancelLabel>
            </CancelButton>
            <View style={{ padding: 10 }} />
            <Deregister
              onPress={() => {
                AuthUtil.logout(deviceId).then(async () => {
                  if (deviceId === getUniqueId()) {
                    await mutate();
                    setMe(null);
                    navigation.popToTop();
                    navigation.replace('/landing');
                  } else {
                    const newdevices = devices.filter((element, index) => {
                      return element.device_id != deviceId;
                    });
                    setDevices(newdevices);
                  }
                });
                setIsVisible(false);
              }}
            >
              <DregisterLabel>{t('general.Deregister')}</DregisterLabel>
            </Deregister>
          </Row>
        </Column>
      </ModalBase>
    </MainLayout>
  );
}

export default General;
