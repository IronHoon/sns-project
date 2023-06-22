import { useNavigation, useRoute } from '@react-navigation/native';
import Button from 'components/atoms/MButton';
import MainLayout from 'components/layouts/MainLayout';
import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';
import React, { useCallback, useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Alert,
} from 'react-native';
import styled from 'styled-components/native';
import tw from 'twrnc';
import BackHeader from 'components/molecules/BackHeader';
import { Column } from 'components/layouts/Column';
import { ModalBase } from 'components/modal';
import { MainNavigationProp } from 'navigations/MainNavigator';
import CloseRoundIcon from '../../../assets/ic-close-round.svg';
import { post } from 'net/rest/api';
import { t } from 'i18next';
import { isDevAuth } from '../../../utils/isDevAuth';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

const Description = styled.Text`
  padding: 40px 15px 30px;
  color: #999999;
`;
const EmailTextInput = styled.TextInput<{
  focus: boolean;
  isValid: boolean;
}>`
  padding: 0 0 10px;
  margin: 0 0 0 10px;
  height: 28.5px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ isValid, focus, theme }) =>
    !isValid ? 'red' : focus ? (theme.dark ? COLOR.WHITE : COLOR.BLACK) : COLOR.LIGHT_GRAY};
  width: 95%;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const InvalidText = styled.Text`
  color: red;
  font-size: 13px;
  padding-top: 10px;
  margin-left: 10px;
`;
const ModalTitle = styled.Text`
  color: black;
  padding: 10px;
`;
const Email = styled.Text`
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
  font-weight: bold;
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
  font-weight: bold;
`;

function EmailInput() {
  const { params } = useRoute();
  const [isConfirmVisible, setIsConfirmVisible] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [focus, setFocus] = useState(false);
  const navigation = useNavigation<MainNavigationProp>();
  const [isExist, setIsExist] = useState(false);
  const me = useAtomValue(userAtom);

  const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  //@ts-ignore
  const routeName = params.route ?? 'register-email';
  const {
    //@ts-ignore
    params: { update },
  } = useRoute();

  const getDescription = (route) => {
    switch (route) {
      case 'register-email':
        return 'Enter your E-mail to register E-mail.';
      case 'change-email':
        return 'Enter your new E-mail to change E-mail.';
      default:
        return '';
    }
  };

  const certEmail = useCallback(async () => {
    try {
      const _params: any = { email };
      if (isDevAuth()) {
        _params.mode = 'dev';
      }
      const data: any = await post('/auth/email-certification', _params);
      console.log('CODE', data.code);
      submit();
      // Alert.alert(t('sign-up.Code'), data.code, [
      //   {
      //     text: t('sign-up.OK'),
      //     onPress: () => submit(),
      //   },
      // ]);
    } catch (error: any) {
      if (error.response.status === 409) {
        setIsConfirmVisible(false);
        setIsExist(true);
      } else {
        console.warn(error);
      }
    }
  }, [email]);

  const submit = () => {
    setIsConfirmVisible(false);
    //@ts-ignore
    navigation.navigate('/code', { route: routeName, data: email, update: update });
  };

  const isValid = regex.test(email);
  const isSameEmail = me?.email === email;
  return (
    <MainLayout>
      <BackHeader title={routeName === 'register-email' ? 'Register E-mail' : 'Change E-mail'} />
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1 }}>
          <Description>{getDescription(routeName)}</Description>
          <View style={[tw`flex-1`, { padding: 6 }]}>
            <Row align="center">
              <EmailTextInput
                placeholder="E-mail"
                placeholderTextColor={COLOR.POINT_GRAY}
                value={email}
                onChangeText={(number) => {
                  setIsExist(false);
                  setEmail(number);
                }}
                focus={focus}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                isValid={email.length === 1 ? false : true ?? true}
              />
              {email !== '' && (
                <TouchableOpacity
                  style={{ position: 'absolute', right: 10, top: 0 }}
                  onPress={() => {
                    setEmail('');
                  }}
                >
                  <CloseRoundIcon width={16} height={16} />
                </TouchableOpacity>
              )}
            </Row>
            <InvalidText>
              {email === ''
                ? ''
                : isSameEmail
                ? 'You cannot use your existing E-mail address.'
                : isExist
                ? 'This E-mail is not available.'
                : isValid
                ? ''
                : 'Please enter a valid email address.'}
            </InvalidText>
          </View>
          {Platform.OS === 'ios' && (
            <Button
              disabled={email === '' || isSameEmail || !isValid || isExist ? true : false}
              onPress={() => setIsConfirmVisible(true)}
            >
              NEXT
            </Button>
          )}
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      {Platform.OS === 'android' && (
        <Button
          disabled={email === '' || isSameEmail || !isValid || isExist ? true : false}
          onPress={() => {
            setIsConfirmVisible(true);
          }}
        >
          NEXT
        </Button>
      )}
      <ModalBase isVisible={isConfirmVisible} onBackdropPress={() => setIsConfirmVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle>Confirm E-mail</ModalTitle>
          <Email>{email}</Email>
          <ModalText>An activation code will be sent to this E-mail.</ModalText>
          <Row style={{ paddingTop: 15 }}>
            <CancelButton onPress={() => setIsConfirmVisible(false)}>
              <CancelLabel>Cancel</CancelLabel>
            </CancelButton>
            <View style={{ padding: 10 }} />
            <ConfirmButton onPress={certEmail}>
              <ConfirmLabel>Confirm</ConfirmLabel>
            </ConfirmButton>
          </Row>
        </Column>
      </ModalBase>
    </MainLayout>
  );
}

export default EmailInput;
