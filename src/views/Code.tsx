import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import tw from 'twrnc';
import { getDeviceName, getModel, getUniqueId } from 'react-native-device-info';
import BackHeader from '../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled, { ThemeContext } from 'styled-components/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from 'components/atoms/MButton';
import { ModalBase } from 'components/modal';
import { Column } from 'components/layouts/Column';
import { Row } from 'components/layouts/Row';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { COLOR } from 'constants/COLOR';
import ActivationImg from '../assets/img-activation.svg';
import WhiteActivationImg from '../assets/img-activation-white.svg';
import WhiteChangeNumImg from '../assets/img-change-num-white.svg';
import ChangeMailImg from '../assets/img-change-mail.svg';
import WhiteChangeMailImg from '../assets/img-change-mail-white.svg';
import RegisterImg from '../assets/img-register-email.svg';
import WhiteRegisterImg from '../assets/img-register-email-white.svg';
import { post, put } from '../net/rest/api';
import Certification from '../types/auth/Certification';
import CertificationPayload from '../types/auth/CertificationPayload';
import userAtom from '../stores/userAtom';
import tokenAtom from '../stores/tokenAtom';
import FirebaseMessageUtil from 'utils/chats/FirebaseMessageUtil';
import LogUtil from 'utils/LogUtil';
import { useSetAtom } from 'jotai';
import AuthUtil from '../utils/AuthUtil';
import { t } from 'i18next';
import { useAtom, useAtomValue } from 'jotai';
import { isDevAuth } from '../utils/isDevAuth';
import MySetting from 'MySetting';
import { appKeyAtom } from '../stores/appKeyAtom';
import activityAtom from '../stores/activityAtom';

const Space = styled.View<{ height?: number; width?: number }>`
  height: ${({ height }) => (height ? `${height}px` : 'auto')};
  width: ${({ width }) => (width ? `${width}px` : 'auto')};
`;
const ActivationText = styled.Text`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-weight: 500;
  text-align: center;
`;
const DataText = styled.Text`
  padding-top: 10px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-weight: 500;
  text-align: center;
`;
const Timeout = styled.Text`
  color: ${(props) => props.theme.colors.PRIMARY};
  padding: 4.5px;
  font-size: 14px;
`;
const Description = styled.Text`
  font-size: 13px;
  color: #999999;
`;
const Box = styled.TouchableOpacity`
  width: 48px;
  height: 58px;
  border: solid 1px ${COLOR.GRAY};
  justify-content: center;
  align-items: center;
  border-radius: 4px;
`;
const CodeChar = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const InvalidText = styled.Text`
  color: red;
  font-size: 13px;
  padding-top: 10px;
`;
const ResendButton = styled.TouchableOpacity``;
const ResendButtonLabel = styled.Text`
  color: #999999;
  font-size: 14px;
  text-decoration: underline;
  text-decoration-color: #999999;
`;
const ModalTitle = styled.Text`
  color: black;
  padding: 10px;
`;
const PhoneNumber = styled.Text`
  font-weight: bold;
  color: black;
`;
const ConfirmButton = styled.TouchableOpacity`
  background-color: ${(props) => props.theme.colors.PRIMARY};
  width: 100px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${(props) => props.theme.colors.PRIMARY};
`;
const ConfirmLabel = styled.Text`
  color: #fff;
  font-size: 13px;
  font-weight: 500;
`;

function Code() {
  const { params }: any = useRoute();
  const [user, setUser] = useAtom(userAtom);
  const setToken = useSetAtom(tokenAtom);
  const [code, setCode] = useState<string>('');
  const [isValidCode, setIsValidCode] = useState(true);
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState('');
  const [isResendVisible, setIsResendVisible] = useState<boolean>(false);
  const [isCert, setIsCert] = useState(false);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [issuanceTime, setIssuanceTime] = useState<number>(new Date().getTime());
  const [currentTime, setCurrentTime] = useState(new Date().getTime());
  const navigation = useNavigation<MainNavigationProp>();
  const device_id = getUniqueId();
  const routeName = params?.route ?? 'sign-up';
  const themeContext = useContext(ThemeContext);
  const [emailActivity, setEmailActivity] = useAtom(activityAtom);

  const {
    //@ts-ignore
    params: { update },
  } = useRoute();

  const emailCheck = (value) => {
    let emailRoute = ['register-email', 'change-email'];
    return emailRoute.includes(value);
  };

  const phoneNumber = useMemo(() => {
    return !emailCheck(routeName)
      ? params?.data
        ? params?.data.phoneNumber.split(' ')
        : ['+82', '10', '1234', '5678']
      : ['+82', '10', '1234', '5678'];
  }, [params?.data, routeName]);

  const input = useRef<TextInput>();

  const focus = () => {
    input.current?.blur();
    setTimeout(() => {
      input.current?.focus();
    }, 100);
  };

  const authCheck = (value) => {
    let authRoute = ['sign-up', 'sign-in'];
    return authRoute.includes(value);
  };

  const numCheck = (value) => {
    let numRoute = ['sign-up', 'sign-in', 'change-number'];
    return numRoute.includes(value);
  };

  const resend = () => {
    setIsResendVisible(true);
    setCode('');
    setIsValidCode(true);
  };

  const resetTime = () => {
    setIssuanceTime(new Date().getTime());
  };

  const historyBack = () => {
    // setIsCert(false);
    // setIsVisible(false);
    navigation.goBack();
  };

  const cert = useCallback(async () => {
    LogUtil.info('Code cert routeName ', [routeName]);
    if (emailCheck(routeName)) {
      try {
        const data: any = await put('/auth/me/email', { code });
        let myUserSetting = {
          ...user,
          ['email']: data.email,
        };
        // @ts-ignore
        setUser(myUserSetting);
        setIsCert(true);
        // update('email', data.email);
        setEmailActivity(true);
        navigation.navigate('/more/profile-edit');
      } catch (error) {
        // @ts-ignore
        const errorMessage = error.response.data.message;
        if (errorMessage === '인증코드가 일치 하지 않습니다.') {
          // setIsVisible(true);
          setIsValidCode(false);
          // @ts-ignore
        } else if (error?.response?.data?.message === '인증시간이 초과 되었습니다.') {
          setIsValidCode(false);
          Alert.alert('error', `Authentication timed out.`);
          setIsCert(true);
          historyBack();
        } else {
          console.warn(errorMessage);
        }
      }
    } else {
      if (routeName === 'change-number') {
        try {
          const data: any = await put('/auth/me/contact', {
            contact: formattedPhoneNumber,
            code: code,
          });
          // console.log(data);
          let myUserSetting = {
            ...user,
            ['contact']: data.contact,
          };
          // @ts-ignore
          setUser(myUserSetting);
          setIsCert(true);
          update('contact', formattedPhoneNumber);
          navigation.navigate('/more/profile-edit');
        } catch (error) {
          //@ts-ignore
          console.log(error.response.data.message);
          //@ts-ignore
          console.log(error.message);
          //@ts-ignore
          if (error?.response.data.message === '인증정보가 존재하지 않습니다. 인증번호를 신청해주세요.') {
            setIsValidCode(false);
            //@ts-ignore
          } else if (error?.response?.data?.message === '인증시간이 초과 되었습니다.') {
            setIsValidCode(false);
            Alert.alert('error', `Authentication timed out.`);
            setIsCert(true);
            historyBack();
          } else {
            Alert.alert('error', `${t('Code.not found verification code')}`);
          }
        }
      } else {
        //sign-in
        const _payload: any = {
          contact: params?.data.contact.replace(/\s/gi, ''),
          code,
          device_id,
          device_name: await getModel(),
          push_token: (await FirebaseMessageUtil.getFcmToken()) ?? '',
          type: MySetting.deviceType,
        };
        if (isDevAuth()) {
          _payload.mode = 'dev';
        }
        AuthUtil.login(_payload)
          .then(async (cert) => {
            LogUtil.info('Code cert login Success');
            setUser(cert.user);
            setToken(cert.token.token);
            setIsCert(true);

            navigation.popToTop();
            navigation.replace('/chats');
          })
          .catch((error) => {
            LogUtil.info('Code cert login error');
            LogUtil.error('/pub/auth/certification error', error);
            setCode('');
            console.log('error message', error?.response?.data?.message);
            if (
              error?.response?.data?.message === '번호 인증은 성공하였으나 존재하지 않는 계정입니다. (회원가입필요)'
            ) {
              if (routeName === 'sign-in') {
                Alert.alert('error', `An account does not exist with this number.`);
                setIsCert(true);
                navigation.navigate('/phone-number-input', {
                  route: 'sign-in',
                });
              } else if (routeName === 'sign-up') {
                setIsCert(true);
                setIssuanceTime(0);
                navigation.navigate('/sign-up/profile-enroll', {
                  route: routeName,
                  data: {
                    contact: params.data.contact.replace(/\s/gi, ''),
                  },
                });
              }
            } else if (error.response?.data?.message === '인증정보가 존재하지 않습니다. 인증번호를 신청해주세요.') {
              setIsValidCode(false);
            } else if (error.response?.data?.message === '인증시간이 초과 되었습니다.') {
              setIsValidCode(false);
              Alert.alert('error', `Authentication timed out.`);
              setIsCert(true);
              historyBack();
            } else {
              Alert.alert('error', `${t('Code.not found verification code')}`);
            }
          });
      }
    }
  }, [code, device_id, navigation, params.data.contact, routeName, setToken, setUser]);

  const appKey = useAtomValue(appKeyAtom);
  const certSMS = useCallback(async () => {
    const _params: any = {
      contact: params?.data.contact,
    };
    if (isDevAuth()) {
      _params.mode = 'dev';
    }
    if (appKey) {
      _params.app_key = appKey;
    }
    try {
      const data: any = await post('/pub/auth/sms-certification', _params);
      console.log(data.code);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.code ? t(error.response?.data?.code) : 'Error occurred');
    }
  }, [phoneNumber]);

  const certEmail = useCallback(async () => {
    const _params: any = {
      email: params.data,
    };
    if (isDevAuth()) {
      _params.mode = 'dev';
    }
    const data: any = await post('/auth/email-certification', _params);
    // Alert.alert(t('sign-up.Code'), data.code, [
    //   {
    //     text: t('sign-up.OK'),
    //   },
    // ]);
    console.log(data.code);
  }, [params]);

  const timeLimit = useMemo(() => {
    const time = 60 + Math.ceil((issuanceTime - currentTime) / 1000);
    return time === 60 ? '1:00' : time < 10 ? `0:0${time}` : `0:${time}`;
  }, [currentTime]);

  useEffect(() => {
    setIsValidCode(true);
  }, [code]);

  useEffect(() => {
    if (numCheck(routeName)) {
      let formattedNum = '';
      phoneNumber.forEach((num, i) => {
        if (i === 0) {
          formattedNum += `${num} `;
        } else if (i < phoneNumber.length - 1) {
          formattedNum += `${num}-`;
        } else {
          formattedNum += `${num}`;
        }
      });
      setFormattedPhoneNumber(formattedNum);
    }
    console.log(formattedPhoneNumber);
  }, [phoneNumber, routeName]);

  useEffect(() => {
    const countdown = setInterval(() => {
      const newTime = new Date().getTime();
      const time = 60 + Math.ceil((issuanceTime - newTime) / 1000);
      setCurrentTime(newTime);

      if (time < 1) {
        clearInterval(countdown);
        if (!isCert) {
          setIsExpired(true);
          setIsCert(true);
        }
      }
    }, 1000);

    return () => clearInterval(countdown);
  }, [issuanceTime]);

  return (
    <MainLayout>
      <BackHeader
        title={
          authCheck(routeName)
            ? t('Code.Enter activation code')
            : routeName === 'change-number'
            ? t('Code.Change Number')
            : routeName === 'register-email'
            ? t('Code.Register E-mail')
            : t('Code.Change E-mail')
        }
      />
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
          style={{ flex: 1 }}
        >
          <View style={tw`flex-1 justify-center items-center`}>
            {authCheck(routeName) ? (
              themeContext.dark ? (
                <WhiteActivationImg />
              ) : (
                <ActivationImg />
              )
            ) : routeName === 'change-number' ? (
              themeContext.dark ? (
                <WhiteChangeNumImg />
              ) : (
                <ActivationImg />
              )
            ) : routeName === 'register-email' ? (
              themeContext.dark ? (
                <WhiteRegisterImg />
              ) : (
                <RegisterImg />
              )
            ) : themeContext.dark ? (
              <WhiteChangeMailImg />
            ) : (
              <ChangeMailImg />
            )}
            <View style={{ paddingBottom: 10, paddingTop: 5 }}>
              <ActivationText>{t('Code.Activation code was sent to')}</ActivationText>
              <DataText>{numCheck(routeName) ? formattedPhoneNumber : params.data}</DataText>
            </View>
            <Description>{`${t('Code.Enter active code from')} ${numCheck(routeName) ? 'SMS' : 'e-mail'} ${t(
              'Code.you received',
            )}`}</Description>
            <Space height={15} />
            <Timeout>{timeLimit}</Timeout>
            <Space height={15} />
            <TextInput
              // @ts-ignore
              ref={input}
              style={[tw`absolute`, { top: -1000 }]}
              keyboardType="phone-pad"
              value={code}
              maxLength={4}
              onChangeText={setCode}
            />
            <View style={tw`flex-row justify-center`}>
              <Box onPress={focus}>
                <CodeChar>{code[0]}</CodeChar>
              </Box>
              <Space width={20} />
              <Box onPress={focus}>
                <CodeChar>{code[1]}</CodeChar>
              </Box>
              <Space width={20} />
              <Box onPress={focus}>
                <CodeChar>{code[2]}</CodeChar>
              </Box>
              <Space width={20} />
              <Box onPress={focus}>
                <CodeChar>{code[3]}</CodeChar>
              </Box>
            </View>
            <Space height={15} />
            {isValidCode ? (
              <InvalidText> </InvalidText>
            ) : (
              <InvalidText>Invalid activation code. Please check and try again.</InvalidText>
            )}
            <Space height={15} />
            <ResendButton onPress={() => resend()}>
              <ResendButtonLabel>{t('Code.Resend code')}</ResendButtonLabel>
            </ResendButton>
          </View>
          <Button
            disabled={!isValidCode || code[3] === undefined}
            onPress={() => {
              cert();
            }}
          >
            {t('Code.NEXT')}
          </Button>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      <ModalBase isVisible={isResendVisible} onBackdropPress={() => setIsResendVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle>{t('Code.Activate code is resend to')}</ModalTitle>
          <PhoneNumber>{numCheck(routeName) ? formattedPhoneNumber : params.data}</PhoneNumber>
          <Row style={{ paddingTop: 25 }}>
            <ConfirmButton
              onPress={() => {
                setIsResendVisible(false);
                resetTime();
                if (emailCheck(routeName)) {
                  certEmail();
                } else {
                  certSMS();
                }
              }}
            >
              <ConfirmLabel>{t('Code.Confirm')}</ConfirmLabel>
            </ConfirmButton>
          </Row>
        </Column>
      </ModalBase>
      <ModalBase isVisible={isExpired} onBackdropPress={() => {}} width={350}>
        <Column justify="center" align="center">
          <ModalTitle
            style={{ textAlign: 'center', fontWeight: '500' }}
          >{`The active code has expired.\nPlease resend the code.`}</ModalTitle>
          <Row style={{ paddingTop: 15 }}>
            <ConfirmButton onPress={historyBack}>
              <ConfirmLabel>{t('sign-up.OK')}</ConfirmLabel>
            </ConfirmButton>
          </Row>
        </Column>
      </ModalBase>
      <ModalBase isVisible={isVisible} onBackdropPress={() => {}} width={350}>
        <Column justify="center" align="center">
          <ModalTitle
            style={{ textAlign: 'center', fontWeight: '500' }}
          >{`Verification code does not match.\nPlease enter the correct verification code`}</ModalTitle>
          <Row style={{ paddingTop: 15 }}>
            <ConfirmButton onPress={() => setIsVisible(false)}>
              <ConfirmLabel>{t('sign-up.OK')}</ConfirmLabel>
            </ConfirmButton>
          </Row>
        </Column>
      </ModalBase>
    </MainLayout>
  );
}

export default Code;
