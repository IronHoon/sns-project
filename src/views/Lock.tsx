import React, { useState, useRef, useEffect, Dispatch, SetStateAction, useCallback } from 'react';
import { AppState, Keyboard, KeyboardAvoidingView, Modal, Platform, TouchableWithoutFeedback } from 'react-native';
import { COLOR } from 'constants/COLOR';
import styled, { css } from 'styled-components/native';
import tw from 'twrnc';
import Space from 'components/utils/Space';
import AsyncStorage from '@react-native-community/async-storage';
import BiomatricModal from '../BiomatricModal';
import { CallAuthBiomatirc } from '../utils/Biometric';
import LogUtil from '../utils/LogUtil';
import { useFocusEffect } from '@react-navigation/native';

const LockImage = styled.Image`
  width: 36px;
  height: 36px;
`;

const EnterText = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${COLOR.BLACK};
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
        border: 3px solid ${COLOR.BLACK};
        background-color: ${COLOR.BLACK};
      `
    );
  }}
`;
interface PassCodeProps {
  setPassAuth: Dispatch<SetStateAction<boolean>>;
  bioauth: boolean;
  setBioAuth: Dispatch<SetStateAction<boolean>>;
}

export default function PassCode({ setPassAuth, bioauth, setBioAuth }: PassCodeProps) {
  const inputRef = useRef(null);
  const [passCode, setPassCode] = useState('');
  const [error, setError] = useState(false);
  const [pass, setPass] = useState('');
  const [bioMatricModal, setBioMatricModal] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (inputRef.current) {
      //@ts-ignore
      inputRef.current.focus();
    }
    if (bioauth) setBioMatricModal(true);
  }, [inputRef, bioauth]);
  // console.log(pass);

  useEffect(() => {
    (async () => {
      const pass = await AsyncStorage.getItem('passCode');
      //@ts-ignore
      setPass(pass);
    })();
  }, []);

  useEffect(() => {
    if (passCode.length === 4 && passCode !== pass) {
      setError(true);
      setPassCode('');
    } else if (passCode.length === 4 && passCode === pass) {
      setError(false);
      setPassCode('');
      setPassAuth(false);
      console.log('정답');
    }
  }, [passCode]);

  const handlePassCode = async (value) => {
    const clean = value.replace(/[^0-9]/g, '');
    if (clean.length > 4) {
      return;
    }
    setPassCode(clean);
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const bioAuth = await AsyncStorage.getItem('bioAuth');
        if (bioAuth === 'true') {
          await CallBack(true);
        }
      })();
    }, [AppState.currentState]),
  );

  const CallBack = async (data) => {
    // console.info(data);
    setBioMatricModal(false);
    console.log('AppState.currentState', AppState.currentState);
    if (data === true && AppState.currentState === 'active') {
      let sign = await CallAuthBiomatirc();
      LogUtil.info('callback', sign);
      if (sign) {
        console.log('인증 성공!!!', JSON.stringify(sign));
        setPassAuth(false);
        setBioAuth(false);
      } else if (sign === null) {
        setBioAuth(false);
      } else {
        await CallBack(true);
      }
    }
  };

  return (
    <Modal visible={true}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={tw.style(`flex-1 justify-center items-center bg-[#fff]`)}
        >
          <LockImage source={require('../assets/ic_lock.png')} />
          <EnterText>Enter a Passcode</EnterText>
          <DotContainer>
            <PassCodeInput
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
          {error ? <ErrorText>Passcodes don’t match.{'\n'}Please try again.</ErrorText> : <Space height={66} />}
          {/*<BiomatricModal open={bioMatricModal} CallBack={CallBack}></BiomatricModal>*/}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
