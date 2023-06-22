import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { COLOR } from 'constants/COLOR';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled, { css } from 'styled-components/native';
import tw from 'twrnc';
import Space from 'components/utils/Space';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { useFetchWithType } from '../../../../net/useFetch';
import User from '../../../../types/auth/User';
import { patch } from '../../../../net/rest/api';
import AsyncStorage from '@react-native-community/async-storage';
import { t } from 'i18next';

const LockImage = styled.Image`
  width: 36px;
  height: 36px;
  tint-color: ${(props) => (props.theme.dark ? '#ffffff' : COLOR.BLACK)};
`;

const EnterText = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${(props) => (props.theme.dark ? '#ffffff' : COLOR.BLACK)};
  margin: 15px 0 60px;
`;

const ErrorText = styled.Text`
  font-size: 13px;
  line-height: 18px;
  color: ${COLOR.RED};
  margin-top: 30px;
  text-align: center;
`;

const PassCodeInput = styled.TextInput`
  background-color: red;
  width: 100%;
  height: 16px;
  padding: 0;
  position: absolute;
  left: 0;
  z-index: 99;
  opacity: 0;
`;
const DotContainer = styled.View`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;
const Dot = styled.View<{ active: boolean }>`
  width: 16px;
  height: 16px;
  border: 3px solid ${COLOR.LIGHT_GRAY};
  border-radius: 8px;
  margin: 0 17.5px;
  ${({ active }) => {
    return (
      active &&
      css`
        border: ${(props) => (props.theme.dark ? '#ffffff' : COLOR.BLACK)}
        background-color: ${(props) => (props.theme.dark ? '#ffffff' : COLOR.BLACK)}
  };
      `
    );
  }}
`;
interface PassCodeProps {
  codeAuth?: boolean;
}

function SetPasscode(codeAuth: PassCodeProps) {
  const inputRef = useRef(null);
  const [status, setStatus] = useState<'enter' | 're-enter' | 'new'>('enter');
  const [oldPassCode, setOldPassCode] = useState('');
  const [passCode, setPassCode] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [passCodeAuth, setPassCodeAuth] = useState<boolean>();

  const { params } = useRoute();
  //@ts-ignore
  const routeName = params?.route ?? 'set-pass';
  const navigation = useNavigation<MainNavigationProp>();

  useEffect(() => {
    (async () => {
      const oldPassCode = await AsyncStorage.getItem('passCode');
      const passCodeAuth = await AsyncStorage.getItem('passCodeAuth');
      if (oldPassCode) {
        setOldPassCode(oldPassCode);
      }
      if (passCodeAuth === 'on') {
        setPassCodeAuth(true);
      } else {
        setPassCodeAuth(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      //@ts-ignore
      inputRef.current.focus();
    }
  }, [inputRef]);
  console.log(codeAuth);
  useEffect(() => {
    if (passCode.length === 4) {
      if (routeName === 'set-pass') {
        if (status === 'enter') {
          setCode(passCode);
          setPassCode('');
          setStatus('re-enter');
        }
        if (status === 're-enter') {
          if (code === passCode) {
            AsyncStorage.setItem('passCode', passCode).then(() => {
              console.log('성공');
            });
            AsyncStorage.setItem('passCodeAuth', 'on');
            console.log(passCode);
            navigation.navigate('/more/settings/privacy-and-security/passcode');
          } else {
            setPassCode('');
            setStatus('enter');
            setError(true);
          }
        }
      }
      if (routeName === 'change-pass') {
        if (status === 'enter') {
          // 기존 passcode 체크
          if (passCode === oldPassCode) {
            setPassCode('');
            setStatus('new');
          } else {
            setPassCode('');
            setError(true);
          }
        }
        if (status === 'new') {
          setCode(passCode);
          setPassCode('');
          setStatus('re-enter');
        }
        if (status === 're-enter') {
          if (code === passCode) {
            AsyncStorage.setItem('passCode', passCode);
            navigation.navigate('/more/settings/privacy-and-security/passcode');
          } else {
            setPassCode('');
            setStatus('new');
            setError(true);
          }
        }
      }
    } else {
      if (passCode.length > 0) {
        setError(false);
      }
    }
  }, [passCode]);

  const handlePassCode = (value) => {
    const clean = value.replace(/[^0-9]/g, '');
    if (clean.length > 4) {
      return;
    }
    setPassCode(clean);
  };

  return (
    <MainLayout>
      <BackHeader title={t('privacy.Passcode lock')} />
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={tw.style(`flex-1 justify-center items-center`)}
        >
          <LockImage source={require('../../../../assets/ic_lock.png')} />
          {routeName === 'set-pass' && (
            <EnterText>
              {status === 'enter' ? t('privacy.Enter a Passcode') : t('privacy.Re-enter your Passcode')}
            </EnterText>
          )}
          {routeName === 'change-pass' && (
            <EnterText>
              {status === 'enter'
                ? t('privacy.Enter a Passcode')
                : status === 'new'
                ? t('privacy.Enter a new Passcode')
                : t('privacy.Re-enter your Passcode')}
            </EnterText>
          )}
          <DotContainer>
            <PassCodeInput
              autoFocus={true}
              ref={inputRef}
              keyboardType="numeric"
              onChangeText={(value) => {
                handlePassCode(value);
              }}
              value={passCode}
            />
            <Dot active={passCode.length >= 1} />
            <Dot active={passCode.length >= 2} />
            <Dot active={passCode.length >= 3} />
            <Dot active={passCode.length === 4} />
          </DotContainer>
          {error ? (
            <ErrorText>
              {t('privacy.Passcode doesn’t match')}
              {'\n'}
              {t('privacy.Please try again')}
            </ErrorText>
          ) : (
            <Space height={66} />
          )}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </MainLayout>
  );
}

export default SetPasscode;
