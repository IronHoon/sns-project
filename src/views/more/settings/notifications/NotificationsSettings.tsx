import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled, { ThemeContext } from 'styled-components/native';
import { Column } from 'components/layouts/Column';
import { SwitchButton } from 'components/atoms/switch/SwitchButton';
import { ScrollView, Text, View, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import { Row } from 'components/layouts/Row';
import { ModalBase } from 'components/modal';
import { COLOR } from 'constants/COLOR';
import Modal from 'react-native-modal';
import tw from 'twrnc';
import TimePicker from 'react-native-wheel-time-picker';
import ReloadIcon from 'assets/ic-reload.svg';
import WhiteReloadIcon from 'assets/ic-reload-white.svg';
import { useFetchWithType } from '../../../../net/useFetch';
import SwrContainer from '../../../../components/containers/SwrContainer';
import { patch } from '../../../../net/rest/api';
import User from '../../../../types/auth/User';
import { t } from 'i18next';
import { getI18n } from 'react-i18next';
import { request, PERMISSIONS, RESULTS, checkNotifications } from 'react-native-permissions';
import PermissionUtil from 'utils/PermissionUtil';
import { Permission } from 'views/landing/components';
import AuthUtil from 'utils/AuthUtil';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import { WIDTH } from 'constants/WIDTH';

const SystemNoticeContainer = styled.View`
  background-color: ${(props) => (props.theme.dark ? '#69686A' : '#f8f8f8')};
  padding: 15px;
`;
const SystemNoticeLabel = styled.Text`
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
  margin-bottom: 5px;
`;
const SwitchContainer = styled.View`
  flex-direction: row;
  padding: 15px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #e3e3e3;
`;
const MarketContainer = styled.View`
  flex-direction: row;
  padding: 15px;
  align-items: center;
`;
const SwitchLabel = styled.Text`
  margin-bottom: 5px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Description = styled.Text`
  font-size: 13px;
  width: ${WIDTH - 50}px;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
  padding-right: 20px;
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
const ModalText = styled.Text`
  color: #000000;
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

const Confirm = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${(props) => (props.disabled ? '#ccc' : props.theme.colors.PRIMARY)};
  width: 110px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${(props) => (props.disabled ? '#ccc' : props.theme.colors.PRIMARY)};
`;
const ModalLabel = styled.Text`
  color: #fff;
  font-weight: bold;
`;

const PickerLabelCoantiner = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border-bottom-width: 2px;
  border-bottom-color: ${(props) => (props.active ? props.theme.colors.PRIMARY : props.theme.colors.GRAY)};
`;
const PickerLabel = styled.Text<{ active: boolean }>`
  font-weight: bold;
  color: ${(props) => (props.active ? props.theme.colors.PRIMARY : props.theme.colors.GRAY)};
`;

const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

function NotificationsSettings() {
  const { data: meData, error: meError, mutate: mutateMe } = useFetchWithType<User>('/auth/me');
  // const [settings, setSettings] = useState({
  //   nt_preview: 1,
  //   nt_group_chat: 1,
  // });
  const [systemNotice, setSystemNotice] = useState<boolean>(false);
  const [isDisturb, setIsDisturb] = useState<boolean>(false);
  const [isMarket, setIsMarket] = useState<boolean>(true);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState<boolean>(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState<boolean>(false);
  const [isPickerVisible, setIsPickerVisible] = useState<boolean>(false);
  const [pickerActive, setPickerActive] = useState<'from' | 'to'>('from');
  const [fromTime, setFromTime] = useState<any>('00:00');
  const [toTime, setToTime] = useState<any>('00:00');
  const lan = getI18n().language;
  const myUser: User | null = useAtomValue(userAtom);

  const navigation = useNavigation<MainNavigationProp>();
  const themeContext = useContext(ThemeContext);

  const date = Date.parse('2012-01-26T00:00:00.000-00:00');

  const [timeValue, setTimeValue] = useState(date % MILLISECONDS_PER_DAY);

  const [hour, min] = useMemo(() => {
    return [
      Math.floor(timeValue / MILLISECONDS_PER_HOUR),
      Math.floor((timeValue % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE),
      Math.floor((timeValue % MILLISECONDS_PER_MINUTE) / 1000),
    ];
  }, [timeValue]);

  const getTime = () => {
    return `${hour < 10 ? '0' : ''}${hour}:${min < 10 ? '0' : ''}${min}`;
  };

  const registeredCheck = () => {
    if (!meData?.setting?.nt_email) {
      if (meData?.email) {
        update('nt_email', 1);
      } else {
        setIsEmailModalVisible(true);
      }
    } else {
      update('nt_email', 0);
    }
  };

  const handlePickerModal = () => {
    if (isDisturb) {
      setTimeValue(date);
      setIsDisturb(false);
      setFromTime('00:00');
      setToTime('00:00');
    } else {
      setIsDisturb(true);
      setIsPickerVisible(true);
    }
  };

  const cancelPickerModal = () => {
    setIsPickerVisible(false);
    setIsDisturb(false);
    setTimeValue(date);
    setFromTime('00:00');
    setToTime('00:00');
    setPickerActive('from');
  };

  const checkDisabled = fromTime === toTime;

  const handleDisturb = useCallback(
    async (ft, tt) => {
      await patch('/auth/user-setting', {
        ...meData?.setting,
        nt_disturb: 1,
        nt_disturb_begin: ft + ':00',
        nt_disturb_end: tt + ':00',
      });
      await mutateMe();
      if (meData) {
        AuthUtil.setMe({
          ...meData,
          setting: {
            ...meData.setting,
            nt_disturb: 1,
            nt_disturb_begin: ft + ':00',
            nt_disturb_end: tt + ':00',
          },
        });
      }
      setIsPickerVisible(false);
      setPickerActive('from');
    },
    [mutateMe],
  );

  const handleDisturbReset = useCallback(async () => {
    await patch('/auth/user-setting', {
      ...meData?.setting,
      nt_disturb: 0,
      nt_disturb_begin: '00:00:00',
      nt_disturb_end: '00:00:00',
    });
    await mutateMe();
    if (meData) {
      AuthUtil.setMe({
        ...meData,
        setting: {
          ...meData.setting,
          nt_disturb: 0,
          nt_disturb_begin: '00:00:00',
          nt_disturb_end: '00:00:00',
        },
      });
    }
  }, [meData]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        checkNotifications().then(({ status }) => {
          if (status === 'granted') {
            setSystemNotice(true);
          } else {
            setSystemNotice(false);
          }
        });
        await mutateMe();
      })();
    }, [mutateMe]),
  );

  useEffect(() => {
    if (isDisturb && pickerActive === 'from') {
      setFromTime(getTime());
    }
    if (isDisturb && pickerActive === 'to') {
      setToTime(getTime());
    }
  }, [timeValue]);

  const handleReset = useCallback(async () => {
    setIsDisturb(false);
    setIsMarket(true);
    setIsResetModalVisible(false);
    await patch('/auth/user-setting', {
      ...meData?.setting,
      nt_preview: 1,
      nt_group_chat: 1,
      nt_inapp_noti: 1,
      nt_inapp_sound: 1,
      nt_inapp_vibrate: 1,
      nt_disturb: 0,
      nt_market: 1,
      nt_email: 0,
      nt_sns_likes: 1,
      nt_sns_comment: 1,
      nt_sns_tag: 1,
      nt_sns_followers: 1,
      nt_sns_live: 1,
      nt_sns_live_invitation: 1,
    });
    await mutateMe();
  }, [meData]);

  const update = useCallback(
    async (field: string, value: any) => {
      await patch('/auth/user-setting', {
        ...meData?.setting,
        [field]: value,
      });
      await mutateMe();
      if (meData) {
        AuthUtil.setMe({
          ...meData,
          setting: {
            ...meData.setting,
            [field]: value,
          },
        });
      }
    },
    [meData],
  );
  return (
    <MainLayout>
      <BackHeader title={t('notifications.Notifications')} />
      <ScrollView>
        <SwrContainer data={meData} error={meError}>
          <>
            {!systemNotice && (
              <SystemNoticeContainer>
                <SystemNoticeLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                  {t('notifications.Notifications disabled in your device settings')}
                </SystemNoticeLabel>
                <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                  {t('notifications.Please enable the device notifications in order to receive Kok Kok notifications')}
                </Description>
              </SystemNoticeContainer>
            )}
            <SwitchContainer>
              <Column style={{ flex: 1 }}>
                <SwitchLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                  {t('notifications.Preview')}
                </SwitchLabel>
                <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                  {t('notifications.When a push notification arrives, it shows a part of the message')}
                </Description>
              </Column>
              <SwitchButton
                isEnabled={!!meData?.setting?.nt_preview}
                setIsEnabled={() => update('nt_preview', meData?.setting?.nt_preview ? 0 : 1)}
              />
              {/*<SwitchButton*/}
              {/*  isEnabled={!!settings.nt_preview}*/}
              {/*  setIsEnabled={() => patch('nt_preview', settings.nt_preview ? 0 : 1)}*/}
              {/*/>*/}
            </SwitchContainer>
            <SwitchContainer>
              <Column style={{ flex: 1 }}>
                <SwitchLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                  {t('notifications.Group chats')}
                </SwitchLabel>
                <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                  {t('notifications.Receive notifications from groups')}
                </Description>
              </Column>
              <SwitchButton
                isEnabled={!!meData?.setting?.nt_group_chat}
                setIsEnabled={() => update('nt_group_chat', meData?.setting?.nt_group_chat ? 0 : 1)}
              />
            </SwitchContainer>
            <SwitchContainer>
              <View style={{ flex: 1 }}>
                <SwitchLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                  {t('notifications.In-app notification')}
                </SwitchLabel>
              </View>
              <SwitchButton
                isEnabled={!!meData?.setting?.nt_inapp_noti}
                setIsEnabled={() => update('nt_inapp_noti', meData?.setting?.nt_inapp_noti ? 0 : 1)}
              />
            </SwitchContainer>
            <SwitchContainer>
              <View style={{ flex: 1 }}>
                <SwitchLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                  {t('notifications.In-app sounds')}
                </SwitchLabel>
              </View>
              <SwitchButton
                isEnabled={!!meData?.setting?.nt_inapp_sound}
                setIsEnabled={() => update('nt_inapp_sound', meData?.setting?.nt_inapp_sound ? 0 : 1)}
              />
            </SwitchContainer>
            <SwitchContainer>
              <View style={{ flex: 1 }}>
                <SwitchLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                  {t('notifications.In-app vibrate')}
                </SwitchLabel>
              </View>
              <SwitchButton
                isEnabled={!!meData?.setting?.nt_inapp_vibrate}
                setIsEnabled={() => update('nt_inapp_vibrate', meData?.setting?.nt_inapp_vibrate ? 0 : 1)}
              />
            </SwitchContainer>
            <SwitchContainer>
              <View style={{ flex: 1 }}>
                <SwitchLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                  {t('notifications.Do not disturb')}
                </SwitchLabel>
              </View>
              <SwitchButton
                isEnabled={!!meData?.setting?.nt_disturb}
                setIsEnabled={async () => {
                  if (!meData?.setting?.nt_disturb) {
                    handlePickerModal();
                  } else {
                    handleDisturbReset();
                  }
                }}
              />
            </SwitchContainer>
            <NavButtonContainer onPress={() => navigation.navigate('/more/settings/notifications-settings/kokkokme')}>
              <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>Kok Kok me</NavLabel>
              <Icon source={require('../../../../assets/ic-next.png')} />
            </NavButtonContainer>
            <View style={{ borderBottomColor: '#e3e3e3', borderBottomWidth: 1 }}>
              <MarketContainer>
                <Column style={{ flex: 1 }}>
                  <SwitchLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                    {t('notifications.Market')} Kok Kok
                  </SwitchLabel>
                  <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                    {t('notifications.Price change, trade completion, suggestion and keyword alert')}
                  </Description>
                </Column>
                <SwitchButton isEnabled={isMarket} setIsEnabled={() => setIsMarket(!isMarket)} />
              </MarketContainer>
              <Row style={{ paddingHorizontal: 15, paddingBottom: 20, alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                    {t('notifications.Keyword alerts')}
                  </Description>
                </View>
                {themeContext.dark ? (
                  <Button
                    width={lan === 'lo' ? 100 : 75}
                    height={35}
                    borderRadius
                    fontSize={13}
                    fontWeight={400}
                    variant={ButtonVariant.Outlined}
                    textvariant={ButtonTextVariant.OutlinedText}
                    whitelined
                    whitelinedText
                    label={t('notifications.Manage')}
                    onPress={() => {}}
                  />
                ) : (
                  <Button
                    label={t('notifications.Manage')}
                    width={lan === 'lo' ? 100 : 75}
                    height={35}
                    borderRadius
                    fontSize={13}
                    fontWeight={400}
                    variant={ButtonVariant.Outlined}
                    textvariant={ButtonTextVariant.OutlinedText}
                    blacklined
                    blacklinedText
                    onPress={() => {}}
                  />
                )}
              </Row>
            </View>
            <SwitchContainer>
              <Column style={{ flex: 1 }}>
                <SwitchLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                  {t('notifications.E-mail notifications')}
                </SwitchLabel>
                <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                  {t('notifications.You can get notifications by e-mail as well')}
                </Description>
              </Column>
              <SwitchButton isEnabled={!!meData?.setting?.nt_email} setIsEnabled={() => registeredCheck()} />
            </SwitchContainer>
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: myUser?.setting?.ct_text_size as number, color: '#999999', marginBottom: 20 }}>
                {t('notifications.Undo all custom notifications settings')}
              </Text>
            </View>
            {themeContext.dark ? (
              <Button
                // imgUrl={require('../../../../assets//ic-reload.png')}
                height={60}
                fontSize={16}
                borderRadius
                // textMarginRight={10}
                marginRight={25}
                marginLeft={25}
                variant={ButtonVariant.Outlined}
                whitelined
                textvariant={ButtonTextVariant.OutlinedText}
                whitelinedText
                label={t('notifications.Reset All Notifications')}
                onPress={() => {
                  setIsResetModalVisible(true);
                }}
              >
                <WhiteReloadIcon />
              </Button>
            ) : (
              <Button
                // imgUrl={require('../../../../assets//ic-reload.png')}
                height={60}
                fontSize={16}
                borderRadius
                // textMarginRight={10}
                marginRight={25}
                marginLeft={25}
                variant={ButtonVariant.Outlined}
                blacklined
                textvariant={ButtonTextVariant.OutlinedText}
                blacklinedText
                label={t('notifications.Reset All Notifications')}
                onPress={() => {
                  setIsResetModalVisible(true);
                }}
              >
                <ReloadIcon />
              </Button>
            )}
            <View style={{ padding: 15 }} />
          </>
        </SwrContainer>
      </ScrollView>
      <ModalBase isVisible={isEmailModalVisible} onBackdropPress={() => setIsEmailModalVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalText>{t('notifications.You should register E-mail to get notifications by e-mail')}</ModalText>
          <Row style={{ paddingTop: 15 }}>
            <CancelButton onPress={() => setIsEmailModalVisible(false)}>
              <CancelLabel>{t('notifications.Cancel')}</CancelLabel>
            </CancelButton>
            <View style={{ padding: 10 }} />
            <Confirm
              onPress={() => {
                setIsEmailModalVisible(false);
                navigation.navigate('/more/profile-edit/email-input', { route: 'change-email' });
              }}
            >
              <ModalLabel>{t('notifications.Register')}</ModalLabel>
            </Confirm>
          </Row>
        </Column>
      </ModalBase>
      <ModalBase isVisible={isResetModalVisible} onBackdropPress={() => setIsResetModalVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
            {t('notifications.Are you sure you want to reset all notification settings to default?')}
          </ModalText>
          <Row style={{ paddingTop: 15 }}>
            <CancelButton onPress={() => setIsResetModalVisible(false)}>
              <CancelLabel>{t('notifications.Cancel')}</CancelLabel>
            </CancelButton>
            <View style={{ padding: 10 }} />
            <Confirm
              onPress={async () => {
                await handleReset();
              }}
            >
              <ModalLabel>{t('notifications.Confirm')}</ModalLabel>
            </Confirm>
          </Row>
        </Column>
      </ModalBase>
      <Modal
        isVisible={isPickerVisible}
        backdropOpacity={0.5}
        onBackButtonPress={() => setIsPickerVisible(false)}
        onBackdropPress={() => setIsPickerVisible(false)}
      >
        <View style={tw`bg-white w-full`}>
          <Row>
            <PickerLabelCoantiner active={pickerActive === 'from'} onPress={() => setPickerActive('from')}>
              <PickerLabel active={pickerActive === 'from'}>{t('notifications.From')}</PickerLabel>
            </PickerLabelCoantiner>
            <PickerLabelCoantiner active={pickerActive === 'to'} onPress={() => setPickerActive('to')}>
              <PickerLabel active={pickerActive === 'to'}>{t('notifications.To')}</PickerLabel>
            </PickerLabelCoantiner>
          </Row>
          <View style={{ paddingHorizontal: 20, paddingTop: 50, paddingBottom: 30 }}>
            <TimePicker
              value={timeValue}
              timeFormat={['hours12', 'min', 'am/pm']}
              wheelProps={{
                displayCount: 7,
                wheelHeight: 150,
                itemHeight: 50,
                disabledColor: COLOR.GRAY,
                containerStyle: {
                  flex: 1,
                },
                textStyle: {
                  fontWeight: 'bold',
                  fontSize: 24,
                },
              }}
              onChange={(newValue) => {
                console.log(newValue);
                setTimeValue(newValue);
                console.log(hour);
              }}
            />
            <Row style={{ paddingTop: 40, justifyContent: 'center' }}>
              <CancelButton onPress={() => cancelPickerModal()}>
                <CancelLabel>{t('notifications.Cancel')}</CancelLabel>
              </CancelButton>
              <View style={{ padding: 10 }} />
              <Confirm
                disabled={checkDisabled}
                onPress={async () => {
                  if (!checkDisabled) {
                    await handleDisturb(fromTime, toTime);
                  }
                }}
              >
                <ModalLabel>{t('notifications.OK')}</ModalLabel>
              </Confirm>
            </Row>
          </View>
        </View>
      </Modal>
    </MainLayout>
  );
}

export default NotificationsSettings;
