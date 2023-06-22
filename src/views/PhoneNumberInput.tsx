import { useNavigation, useRoute } from '@react-navigation/native';
import Button from 'components/atoms/MButton';
import MainLayout from 'components/layouts/MainLayout';
import { Row } from 'components/layouts/Row';
import SelectCountryModal from 'components/modal/SelectCountryModal';
import { COLOR } from 'constants/COLOR';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import styled from 'styled-components/native';
import tw from 'twrnc';
import parsePhoneNumber from 'libphonenumber-js';
import BackHeader from 'components/molecules/BackHeader';
import { Column } from 'components/layouts/Column';
import { ModalBase } from 'components/modal';
import { MainNavigationProp } from 'navigations/MainNavigator';
import CloseRoundIcon from '../assets/ic-close-round.svg';
import { post } from '../net/rest/api';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useAtomValue } from 'jotai';
import User from 'types/auth/User';
import userAtom from 'stores/userAtom';
import LogUtil from '../utils/LogUtil';
import { isDevAuth } from '../utils/isDevAuth';
import { appKeyAtom } from '../stores/appKeyAtom';

const Title = styled.Text`
  margin-top: 80px;
  font-size: 28px;
  font-weight: bold;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  padding-left: 15px;
`;
const Description = styled.Text<{ changeNumber: boolean }>`
  padding: 15px;
  padding-top: ${({ changeNumber }) => (changeNumber ? '40px' : '30px')};
  padding-bottom: ${({ changeNumber }) => (changeNumber ? '30px' : '45px')};
  color: ${({ changeNumber, theme }) => (changeNumber ? '#999999' : theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const SelectCountryButton = styled.Pressable`
  flex-direction: row;
  border-bottom-style: solid;
  border-bottom-color: ${COLOR.LIGHT_GRAY};
  border-bottom-width: 1px;
  width: 60px;
  padding-bottom: 10px;
  align-items: center;
`;
const Country = styled.Text`
  padding-left: 5px;
  padding-right: 5px;
  height: 19px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const Icon = styled.Image`
  width: 15px;
  height: 15px;
  tint-color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const PhoneNumberTextInput = styled.TextInput<{
  focus: boolean;
  isValid: boolean;
}>`
  padding: 0px;
  margin: 0px;
  height: 28.5px;
  padding-bottom: 10px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ isValid, focus, theme }) =>
    !isValid ? 'red' : focus ? (theme.dark ? COLOR.WHITE : COLOR.BLACK) : COLOR.LIGHT_GRAY};
  width: 80%;
  margin-left: 10px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const InvalidText = styled.Text`
  color: red;
  font-size: 13px;
  padding-top: 10px;
`;
const CheckBoxContainer = styled.TouchableOpacity`
  position: relative;
  width: 20px;
  height: 22px;
`;
const CheckBoxImage = styled.Image`
  position: absolute;
  width: 100%;
  height: 100%;
`;
const CheckBoxText = styled.Text`
  font-size: 13px;
  margin-top: 5px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const ModalTitle = styled.Text`
  color: black;
  padding: 10px;
`;
const PhoneNumber = styled.Text`
  font-weight: bold;
  color: black;
`;
const ModalText = styled.Text`
  color: #999999;
  padding: 10px;
  text-align: center;
`;
const CancelButton = styled.TouchableOpacity`
  background-color: #fff;
  width: 100px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: #ccc;
`;
const CancelLabel = styled.Text`
  color: #ccc;
  font-size: 13px;
  font-weight: 500;
`;
const ConfirmButton = styled.TouchableOpacity`
  background-color: ${COLOR.PRIMARY};
  width: 100px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${COLOR.PRIMARY};
`;
const ConfirmLabel = styled.Text`
  color: #fff;
  font-size: 13px;
  font-weight: 500;
`;

function TermsLinkButton({ navigation }) {
  return (
    <TouchableOpacity
      style={{ marginBottom: -2 }}
      onPress={() => {
        navigation.navigate('/webview', { title: 'Terms of Service' });
      }}
    >
      <Text
        style={{
          color: COLOR.PRIMARY,
          textDecorationLine: 'underline',
          textDecorationColor: COLOR.PRIMARY,
          fontSize: 13,
        }}
      >
        Kok Kok
      </Text>
    </TouchableOpacity>
  );
}

function PhoneNumberInput() {
  const { params } = useRoute();
  const appKey = useAtomValue(appKeyAtom);
  const [checked, setChecked] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState('LA');
  const [countryCallingCode, setCountryCallingCode] = useState(856);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedNum, setFormattedNum] = useState('');
  const [focus, setFocus] = useState(false);
  const [isSignUp] = useState<boolean>(true);
  const navigation = useNavigation<MainNavigationProp>();
  const { t } = useTranslation();
  const [isExist, setIsExist] = useState<boolean>(false);
  const myUser = useAtomValue<User | null>(userAtom);
  //@ts-ignore
  const routeName = params.route ?? 'sign-up';
  const [disabled, setDisabled] = useState(true);

  // * Formatted PhoneNumber
  const formattedPhoneNumber = parsePhoneNumber(`+${countryCallingCode}` + `${phoneNumber}`)?.formatInternational();
  const regex = /[^0-9]/g;
  const isExisting =
    routeName === 'change-number' ? myUser?.contact === formattedPhoneNumber?.replace(regex, '') : false;
  const {
    //@ts-ignore
    params: { update },
  } = useRoute();
  // console.log('번호입력', update);
  const certSMS = useCallback(async () => {
    try {
      LogUtil.info('format', formattedPhoneNumber);
      await post('/pub/auth/sms-check', {
        contact: formattedPhoneNumber,
      })
        .then(async (result: any) => {
          LogUtil.info('결과', result);

          if (routeName === 'sign-in' && result?.code === 'api.contact ok') {
            setIsConfirmVisible(false);
            Alert.alert('Error', 'An account does not exist with this number');
            //@ts-ignore
          } else if (routeName === 'sign-up' && result.code === 'api.contact ok') {
            const _params: any = {
              contact: formattedPhoneNumber,
            };
            if (isDevAuth()) {
              _params.mode = 'dev';
            }
            if (formattedPhoneNumber === '+82 10 0000 0006') {
              _params.mode = 'dev';
            }
            if (appKey) {
              _params.app_key = appKey;
            }
            try {
              const data: any = await post('/pub/auth/sms-certification', _params);
              setIsConfirmVisible(false);

              if (formattedPhoneNumber === '+82 10 0000 0006') {
                Alert.alert(t('sign-up.Code'), data.code, [
                  {
                    text: t('sign-up.OK'),
                    onPress: () =>
                      navigation.navigate('/code', {
                        route: routeName,
                        data: { contact: formattedPhoneNumber, phoneNumber: formattedPhoneNumber },
                      }),
                  },
                ]);
              } else {
                console.log('CODE', data.code);
                navigation.navigate('/code', {
                  route: routeName,
                  data: { contact: formattedPhoneNumber, phoneNumber: formattedPhoneNumber },
                });
              }
            } catch (error: any) {
              console.warn(error);
              Alert.alert('Error', error.response?.data?.code ? t(error.response?.data?.code) : 'Error occurred');
            }
          }
        })
        .catch(async (error) => {
          if (error.response.status === 409) {
            LogUtil.info(error.response.data.user);
            const _params: any = {
              contact: formattedPhoneNumber,
            };
            if (isDevAuth()) {
              _params.mode = 'dev';
            }
            if (formattedPhoneNumber === '+82 10 0000 0006') {
              _params.mode = 'dev';
            }
            if (appKey) {
              _params.app_key = appKey;
            }
            try {
              console.log('2');
              const data: any = await post('/pub/auth/sms-certification', _params);
              setIsConfirmVisible(false);

              if (formattedPhoneNumber === '+82 10 0000 0006') {
                Alert.alert(t('sign-up.Code'), data.code, [
                  {
                    text: t('sign-up.OK'),
                    onPress: () =>
                      navigation.navigate('/code', {
                        route: routeName,
                        data: { contact: formattedPhoneNumber, phoneNumber: formattedPhoneNumber },
                      }),
                  },
                ]);
              } else {
                console.log('CODE', data.code);
                navigation.navigate('/code', {
                  route: routeName,
                  data: { contact: formattedPhoneNumber, phoneNumber: formattedPhoneNumber },
                });
              }
            } catch (error: any) {
              console.warn(error);
              Alert.alert('Error', error.response?.data?.code ? t(error.response?.data?.code) : 'Error occurred');
            }
          }
        });
    } catch (error) {
      console.warn(error);
    }
  }, [formattedPhoneNumber, navigation, phoneNumber, routeName]);

  const checkSMS = useCallback(async () => {
    try {
      await post('/pub/auth/sms-check', {
        contact: formattedPhoneNumber,
      })
        .then(async () => {
          await certSMS();
        })
        .catch((error) => {
          if (error.response.status === 409) {
            setPhoneNumber('');
            setChecked(false);
            setIsConfirmVisible(false);
            let userInfo = error.response.data.user;
            userInfo['contact'] = formattedPhoneNumber;
            navigation.navigate('/sign-up/registered', userInfo);
          }
        });
    } catch (error) {
      console.warn(error);
    }
  }, [certSMS, phoneNumber]);

  const changeNum = useCallback(async () => {
    try {
      await post('/pub/auth/sms-check', {
        contact: formattedPhoneNumber,
      })
        .then(async () => {
          const _params: any = {
            contact: formattedPhoneNumber,
          };
          if (isDevAuth()) {
            _params.mode = 'dev';
          }
          if (formattedPhoneNumber === '+82 10 0000 0006') {
            _params.mode = 'dev';
          }
          if (appKey) {
            _params.app_key = appKey;
          }
          console.log('3');
          const data: any = await post('/pub/auth/sms-certification', _params);
          setIsConfirmVisible(false);

          if (formattedPhoneNumber === '+82 10 0000 0006') {
            Alert.alert(t('sign-up.Code'), data.code, [
              {
                text: t('sign-up.OK'),
                onPress: () =>
                  navigation.navigate('/code', {
                    route: routeName,
                    update: update,
                    data: { contact: formattedPhoneNumber, phoneNumber: formattedPhoneNumber },
                  }),
              },
            ]);
          } else {
            console.log('CODE', data.code);
            navigation.navigate('/code', {
              route: routeName,
              update: update,
              data: { contact: formattedPhoneNumber, phoneNumber: formattedPhoneNumber },
            });
          }
        })
        .catch((error) => {
          if (error.response.status === 409) {
            setIsConfirmVisible(false);
            setIsExist(true);
            // console.log('test');
          }
        });
    } catch (error: any) {
      console.warn(error);
      Alert.alert('Error', error.response?.data?.code ? t(error.response?.data?.code) : 'Error occurred');
    }
  }, [phoneNumber]);

  // * PhoneNumber inValid
  const isValidPhoneNumber = parsePhoneNumber(`+${countryCallingCode}` + `${phoneNumber}`)?.isValid();

  const getDescription = (route) => {
    switch (route) {
      case 'sign-up':
        return t('sign-up.Enter your new phone number to register new account');
      case 'sign-in':
        return t('sign-in.You can log in with your mobile phone number');
      case 'change-number':
        return 'Enter your new phone number to change Number.';
      default:
        return '';
    }
  };

  const submit = () => {
    if (routeName === 'sign-up') {
      checkSMS();
    }
    if (routeName === 'sign-in') {
      certSMS();
    }
    if (routeName === 'change-number') {
      changeNum();
    }
  };

  useEffect(() => {
    let formattedNumber = '';
    let splicePhoneNumber = formattedPhoneNumber?.split(' ') ?? [];
    splicePhoneNumber.forEach((num, i) => {
      if (i === 0) {
        formattedNumber += `${num} `;
      } else if (i < splicePhoneNumber.length - 1) {
        formattedNumber += `${num}-`;
      } else {
        formattedNumber += `${num}`;
      }
    });
    setFormattedNum(formattedNumber);
  }, [isConfirmVisible]);

  useEffect(() => {
    if (routeName === 'sign-up') {
      if (checked && isValidPhoneNumber) {
        setDisabled(false);
      } else {
        setDisabled(true);
      }
    } else {
      if (isValidPhoneNumber) {
        if (isExisting) {
          setDisabled(true);
        } else {
          setDisabled(false);
        }
      } else {
        setDisabled(true);
      }
    }
  }, [checked, isValidPhoneNumber, isExisting]);

  return (
    <MainLayout>
      {navigation.canGoBack() && <BackHeader title={routeName === 'change-number' ? 'Change Number' : ''} />}
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1 }}>
          {routeName !== 'change-number' && (
            <Title>{routeName === 'sign-up' ? t('sign-up.Create Account') : t('sign-in.Login')}</Title>
          )}

          <Description changeNumber={routeName === 'change-number'}>{getDescription(routeName)}</Description>
          <View style={[tw`flex-1`, { padding: 15 }]}>
            <Row align="center">
              <SelectCountryButton
                onTouchStart={() => {
                  Keyboard.dismiss();
                  setIsVisible(true);
                }}
              >
                <Icon source={require('../assets/ic-phone-16.png')} />
                <Country>{countryCode}</Country>
                <Icon source={require('../assets/ic-down.png')} />
              </SelectCountryButton>
              <PhoneNumberTextInput
                keyboardType="phone-pad"
                placeholder={t('sign-in.Phone number')}
                placeholderTextColor={COLOR.POINT_GRAY}
                value={phoneNumber}
                onChangeText={(number) => {
                  setIsExist(false);
                  setPhoneNumber(number.replace(regex, ''));
                  console.log('routeName', routeName);
                }}
                focus={focus}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                isValid={phoneNumber.length === 1 && !focus ? false : focus ? true : isValidPhoneNumber ?? true}
              />
              {phoneNumber !== '' && (
                <TouchableOpacity
                  style={{ position: 'absolute', right: 10, top: 0 }}
                  onPress={() => {
                    setPhoneNumber('');
                  }}
                >
                  <CloseRoundIcon width={16} height={16} />
                </TouchableOpacity>
              )}
            </Row>
            <InvalidText>
              {phoneNumber === ''
                ? ''
                : isExisting
                ? 'You cannot use your existing Phone number.'
                : isExist
                ? 'This Phone number is not available.'
                : !isSignUp
                ? t('sign-up.Please check the information you entered')
                : focus
                ? ' '
                : isValidPhoneNumber
                ? ' '
                : t('sign-up.Please enter a valid phone number')}
            </InvalidText>
            {routeName === 'sign-up' && (Platform.OS === 'ios' ? true : !focus) && (
              <Row align="center">
                <CheckBoxContainer
                  onPress={() => {
                    setChecked(!checked);
                  }}
                >
                  <CheckBoxImage
                    source={checked ? require('../assets/ic-check-on.png') : require('../assets/ic-check-off.png')}
                  />
                </CheckBoxContainer>
                <Column style={{ marginLeft: 15, marginTop: 15 }}>
                  <CheckBoxText>{t('sign-up.By continuing,')}</CheckBoxText>
                  <Row align="center">
                    <CheckBoxText>{t('sign-up.you agree to ')}</CheckBoxText>
                    {i18n.language === 'en' && <TermsLinkButton navigation={navigation} />}
                    <CheckBoxText> {t('sign-up.Terms of Service')}</CheckBoxText>
                    {i18n.language === 'lo' && <TermsLinkButton navigation={navigation} />}
                  </Row>
                </Column>
              </Row>
            )}
          </View>
          {Platform.OS === 'ios' && (
            <Button disabled={disabled} onPress={() => setIsConfirmVisible(true)}>
              {t('sign-up.NEXT')}
            </Button>
          )}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      {Platform.OS === 'android' && (
        <Button
          disabled={disabled}
          onPress={() => {
            setIsConfirmVisible(true);
          }}
        >
          {t('sign-up.NEXT')}
        </Button>
      )}
      <SelectCountryModal
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setCountryCode={setCountryCode}
        setCountryCallingCode={setCountryCallingCode}
      />
      <ModalBase isVisible={isConfirmVisible} onBackdropPress={() => setIsConfirmVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle>{t('sign-up.Confirm phone number')}</ModalTitle>
          <PhoneNumber>{formattedNum}</PhoneNumber>
          <ModalText>{t('sign-up.An activation code will be sent to this phone number')}</ModalText>
          <Row style={{ paddingTop: 15 }}>
            <CancelButton onPress={() => setIsConfirmVisible(false)}>
              <CancelLabel>{t('sign-up.Cancel')}</CancelLabel>
            </CancelButton>
            <View style={{ padding: 5 }} />
            <ConfirmButton onPress={submit}>
              <ConfirmLabel>{t('sign-up.Confirm')}</ConfirmLabel>
            </ConfirmButton>
          </Row>
        </Column>
      </ModalBase>
    </MainLayout>
  );
}

export default PhoneNumberInput;
