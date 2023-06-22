import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';

import MainLayout from 'components/layouts/MainLayout';
import BackHeader from 'components/molecules/BackHeader';
import { COLOR } from 'constants/COLOR';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '../../../navigations/MainNavigator';
import parsePhoneNumber from 'libphonenumber-js';
import { Column } from '../../../components/layouts/Column';
import { Row } from '../../../components/layouts/Row';
import { View } from 'react-native';
import { ModalBase } from '../../../components/modal';
import Button from '../../../components/atoms/MButton';

const Container = styled.View`
  flex: 1;
  display: flex;

  padding: 30px 20px 0;
`;

const Description = styled.Text`
  margin-bottom: 20px;

  font-size: 14px;
  line-height: 22px;
  color: ${COLOR.TEXT_GRAY};
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
  border-bottom-color: ${({ isValid, focus }) => (!isValid ? 'red' : focus ? COLOR.BLACK : COLOR.LIGHT_GRAY)};
  width: 100%;
  color: black;
`;

const InvalidText = styled.Text`
  color: red;
  font-size: 13px;
  padding-top: 10px;
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
const CancleButton = styled.TouchableOpacity`
  background-color: #fff;
  width: 120px;
  height: 55px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: #ccc;
`;
const CancleLabel = styled.Text`
  color: #ccc;
  font-size: 18px;
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
  font-size: 18px;
  font-weight: bold;
`;

const NewEmail = () => {
  const [email, setEmail] = useState('');
  const [focus, setFocus] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState<boolean>(false);
  const navigation = useNavigation<MainNavigationProp>();

  // * PhoneNumber inValid
  const emailRegex =
    /^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

  const isValidEmail = email.length === 0 ? null : emailRegex.test(email);

  const submit = async () => {
    try {
      // server request
      navigation.navigate('/code', {
        route: 'change-email',
        data: '',
      });
    } catch (error) {
      // error
    }
  };

  return (
    <MainLayout>
      <BackHeader title="Change E-mail" />
      <Container>
        <Description>Enter your new E-mail to change E-mail.</Description>
        <EmailTextInput
          keyboardType="email-address"
          placeholder="E-mail"
          placeholderTextColor={COLOR.POINT_GRAY}
          value={email}
          onChangeText={(value) => setEmail(value)}
          focus={focus}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          isValid={email.length === 1 ? false : isValidEmail ?? true}
        />
        <InvalidText>{email === '' ? '' : isValidEmail ? ' ' : 'Please enter a valid email address'}</InvalidText>
      </Container>
      <Button disabled={!isValidEmail} onPress={() => setIsConfirmVisible(true)}>
        Next
      </Button>

      {/* Modal */}
      <ModalBase isVisible={isConfirmVisible} onBackdropPress={() => setIsConfirmVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle>Confirm E-mail</ModalTitle>
          <PhoneNumber>{email}</PhoneNumber>
          <ModalText>An activation code will be sent to this E-mail.</ModalText>
          <Row style={{ paddingTop: 15 }}>
            <CancleButton onPress={() => setIsConfirmVisible(false)}>
              <CancleLabel>Cancel</CancleLabel>
            </CancleButton>
            <View style={{ padding: 10 }} />
            <ConfirmButton
              onPress={() => {
                setIsConfirmVisible(false);
                submit();
              }}
            >
              <ConfirmLabel>Confirm</ConfirmLabel>
            </ConfirmButton>
          </Row>
        </Column>
      </ModalBase>
    </MainLayout>
  );
};

export default NewEmail;
