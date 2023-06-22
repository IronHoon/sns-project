import React, { useCallback, useContext, useState } from 'react';
import tw from 'twrnc';
import BackHeader from '../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import {
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import styled, { ThemeContext } from 'styled-components/native';
import { Row } from 'components/layouts/Row';
import Verify from 'assets/ic-verify.svg';
import VerifyB from 'assets/ic-verify-black.svg';
import VerifyW from 'assets/ic-verify-white.svg';
import { COLOR } from 'constants/COLOR';
import CloseRoundIcon from '../../../assets/ic-close-round.svg';
import SendMailW from 'assets/img-send-mail-white.svg';
import SendMail from 'assets/img-send-mail.svg';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import User from 'types/auth/User';
import { Avatar } from 'components/atoms/image';
import { get, post } from 'net/rest/api';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ModalBase, ModalText, ModalTitle } from 'components/modal';
import { Column } from 'components/layouts/Column';
import { t } from 'i18next';

const UserName = styled.Text`
  color: ${({ theme }) => (theme.dark ? theme.colors.WHITE : theme.colors.BLACK)};
  font-size: 18px;
  font-weight: bold;
`;

const NameContainer = styled.View`
  height: auto;
  justify-content: center;
  width: 80%;
`;
const Name = styled.View`
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
`;
const NameText = styled.Text`
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 5px;
`;
const Tag = styled.Text`
  margin-top: 10px;
  color: #bcb3c5;
  font-size: 13px;
`;
const Description = styled.Text`
  font-size: 13px;
  color: #999999;
  text-align: center;
`;
const AnotherPhoneButton = styled.TouchableOpacity`
  display: flex;
  flex: none;
  flex-direction: row;
  justify-content: center;
  align-item: center;
  height: 60px;
  border: ${({ theme }) => (theme.dark ? '1px solid white' : '1px solid black')};
  border-radius: 10px;
  margin: 20px;
`;
const ButtonLabel = styled.Text`
  color: ${({ theme }) => (theme.dark ? theme.colors.WHITE : theme.colors.BLACK)};
  font-size: 16px;
  font-weight: 500;
`;
const Desc = styled.Text`
  font-size: 14px;
  padding: 6px;
  padding-bottom: 20px;
  color: ${({ theme }) => (theme.dark ? theme.colors.WHITE : theme.colors.BLACK)};
`;
const EmailTextInput = styled.TextInput<{
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
  width: 95%;
  margin-left: 8px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const InvalidText = styled.Text`
  color: red;
  font-size: 13px;
  padding-top: 10px;
  padding-left: 8px;
`;
const Container = styled.View`
  flex: 1;
  display: flex;
  align-items: center;
  padding-top: 100px;
`;
const Title = styled.Text`
  margin: 10px 0 7px;
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  color: ${(props) => (props.theme.dark ? props.theme.colors.WHITE : props.theme.colors.BLACK)};
`;
const DescSentEmail = styled.Text`
  font-size: 14px;
  line-height: 20px;
  color: ${COLOR.TEXT_GRAY};
  text-align: center;
`;
const TextButton = styled.TouchableOpacity`
  margin-top: 50px;
`;
const TextButtonLabel = styled.Text`
  color: #999999;
  text-decoration: underline;
  text-decoration-color: #999999;
`;

const VerifiedButton = styled.TouchableOpacity`
  background-color: ${COLOR.PRIMARY};
  width: 110px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${COLOR.PRIMARY};
`;
const VerifiedLabel = styled.Text`
  color: #fff;
  font-weight: bold;
`;

function OfficialAccount() {
  const themeContext = useContext(ThemeContext);
  const me = useAtomValue<User | null>(userAtom);
  const name = `${me?.first_name} ${me?.last_name}`;
  const uid = me?.uid;
  const profileImage = me?.profile_image;

  const [email, setEmail] = useState('');
  const [focus, setFocus] = useState(false);
  const regex = /[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]$/i;
  const [state, setState] = useState<'request' | 'sent'>('request');
  const navigation = useNavigation();

  const request = useCallback(async () => {
    try {
      const data: any = await post('auth/officialAccount', { email: email });
      if (data.status === 'apply') {
        setState('sent');
      }
    } catch (error: any) {
      console.warn(error);
    }
  }, [email]);

  const getStatus = async () => {
    try {
      const data = await get('auth/officialAccount');
      if (data) {
        if (data?.status === 'approved') {
          setState('approved');
          return;
        }
        if (data?.status === 'reject') {
          setState('request');
          return;
        }
        setState('sent');
      }
    } catch (error) {
      console.warn(error);
    }
  };

  const mailTo = () => {
    Linking.openURL(`mailto:contact@kokkok.com`);
  };

  useFocusEffect(
    useCallback(() => {
      getStatus();
    }, []),
  );

  return (
    <MainLayout>
      <BackHeader title="Verify official account" />
      {state === 'request' ? (
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}
        >
          <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1 }}>
            <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, focus && { display: 'none' }]}>
              <Avatar size={120} src={profileImage} />
              <View style={tw`items-center my-3`}>
                <Row style={{ alignItems: 'center' }}>
                  <NameContainer>
                    <Name>
                      {`${me?.first_name} ${me?.last_name}`.split(' ').map((word) => (
                        <NameText>{word}</NameText>
                      ))}
                      <Verify style={{ width: 18, height: 18, marginLeft: 5, marginTop: -2 }} />
                    </Name>
                  </NameContainer>
                </Row>
                <Tag>@{uid}</Tag>
              </View>
              <View style={tw`items-center`}>
                <Description>
                  {
                    'Get a verified badge to make people more\neasily find and recognize\nthe public figures, celebrities and brands!'
                  }
                </Description>
              </View>
            </View>
            <View style={[{ paddingHorizontal: 15 }, focus && { paddingTop: 30 }]}>
              <Desc>{'Please enter e-mail address to contact you\nfor verification.'}</Desc>
              <Row align="center">
                <EmailTextInput
                  placeholder="mail@mail.com"
                  placeholderTextColor={COLOR.POINT_GRAY}
                  value={email}
                  onChangeText={(number) => setEmail(number)}
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
                {email === '' ? '' : regex.test(email) ? ' ' : 'Please enter a valid email address.'}
              </InvalidText>
            </View>
            <AnotherPhoneButton
              onPress={() => {
                request();
              }}
            >
              <Row align="center">
                {themeContext.dark ? (
                  <VerifyW style={{ width: 18, height: 18, marginRight: 7 }} />
                ) : (
                  <VerifyB style={{ width: 18, height: 18, marginRight: 7 }} />
                )}
                <ButtonLabel>Request for official account</ButtonLabel>
              </Row>
            </AnotherPhoneButton>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      ) : (
        <Container>
          <ModalBase isVisible={state === 'approved'} onBackdropPress={() => console.log(123)} width={350}>
            <Column justify="center" align="center">
              <ModalTitle>{t(`Profile Info.Congrats!`)}</ModalTitle>
              <ModalText>
                {t(`Profile Info.You got a verified badge of \n official account. Enjoy your Kok Kok!`)}
              </ModalText>

              <View style={{ padding: 10 }} />
              <VerifiedButton
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <VerifiedLabel>{t('sign-up.OK')}</VerifiedLabel>
              </VerifiedButton>
            </Column>
          </ModalBase>
          {themeContext.dark ? <SendMailW width={92} height={92} /> : <SendMail width={92} height={92} />}
          <Title>Request Sent!</Title>
          <DescSentEmail>
            Kok Kok manager will contact you by e-mail{'\n'}
            and ask you for documents in needed.
          </DescSentEmail>
          <TextButton onPress={() => mailTo()}>
            <TextButtonLabel>haven’t received any response?</TextButtonLabel>
          </TextButton>
        </Container>
      )}
    </MainLayout>
  );
}

export default OfficialAccount;
