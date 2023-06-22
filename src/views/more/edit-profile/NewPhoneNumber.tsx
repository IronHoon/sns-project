import React, { useEffect, useState } from 'react';
import styled from 'styled-components/native';
import MainLayout from 'components/layouts/MainLayout';
import BackHeader from 'components/molecules/BackHeader';
import Button from 'components/atoms/MButton';
import { COLOR } from 'constants/COLOR';
import { Keyboard, View } from 'react-native';
import { Row } from 'components/layouts/Row';
import parsePhoneNumber from 'libphonenumber-js';
import SelectCountryModal from 'components/modal/SelectCountryModal';
import { Column } from 'components/layouts/Column';
import { ModalBase } from 'components/modal';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';

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

const SelectCountryButton = styled.TouchableOpacity`
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
  color: black;
`;

const Icon = styled.Image`
  width: 15px;
  height: 15px;
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
  border-bottom-color: ${({ isValid, focus }) => (!isValid ? 'red' : focus ? COLOR.BLACK : COLOR.LIGHT_GRAY)};
  width: 80%;
  margin-left: 10px;
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

export const NewPhoneNumber = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState('LA');
  const [countryCallingCode, setCountryCallingCode] = useState(856);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formattedNum, setFormattedNum] = useState('');
  const [focus, setFocus] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState<boolean>(false);
  const navigation = useNavigation<MainNavigationProp>();

  // * PhoneNumber inValid
  const isValidPhoneNumber = parsePhoneNumber(`+${countryCallingCode}` + `${phoneNumber}`)?.isValid();

  // * Formatted PhoneNumber
  const formattedPhoneNumber = parsePhoneNumber(`+${countryCallingCode}` + `${phoneNumber}`)?.formatInternational();

  const submit = async () => {
    try {
      // server request

      navigation.navigate('/code', {
        route: 'change-number',
        data: { phoneNumber: formattedPhoneNumber },
      });
    } catch (error) {
      // error
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

  return (
    <MainLayout>
      <BackHeader title="Change Number" />
      <Container>
        <Description>Enter your new phone number to change Number.</Description>
        <Row align="center">
          <SelectCountryButton
            onPress={() => {
              Keyboard.dismiss();
              setIsVisible(true);
            }}
          >
            <Icon source={require('../../../assets/ic-phone-16.png')} />
            <Country>{countryCode}</Country>
            <Icon source={require('../../../assets/ic-down.png')} />
          </SelectCountryButton>
          <PhoneNumberTextInput
            keyboardType="phone-pad"
            placeholder="Phone number"
            placeholderTextColor={COLOR.POINT_GRAY}
            value={phoneNumber}
            onChangeText={(number) => setPhoneNumber(number)}
            focus={focus}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            isValid={phoneNumber.length === 1 ? false : isValidPhoneNumber ?? true}
          />
        </Row>
        <InvalidText>
          {phoneNumber === '' ? '' : isValidPhoneNumber ? ' ' : 'Please enter a valid phone number.'}
        </InvalidText>
      </Container>
      <Button disabled={phoneNumber === '' ? true : false} onPress={() => setIsConfirmVisible(true)}>
        Next
      </Button>

      {/* Modal */}
      <SelectCountryModal
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setCountryCode={setCountryCode}
        setCountryCallingCode={setCountryCallingCode}
      />

      <ModalBase isVisible={isConfirmVisible} onBackdropPress={() => setIsConfirmVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle>Confirm phone number</ModalTitle>
          <PhoneNumber>{formattedNum}</PhoneNumber>
          <ModalText>An activation code will be sent to this phone number</ModalText>
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
