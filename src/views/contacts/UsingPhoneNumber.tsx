import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, View } from 'react-native';
import tw from 'twrnc';
import BackHeader from '../../components/molecules/BackHeader';
import { get } from '../../net/rest/api';
import PhoneInput from '../../components/molecules/PhoneInput';
import parsePhoneNumber from 'libphonenumber-js';
import Button from '../../components/atoms/MButton';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import MainLayout from 'components/layouts/MainLayout';
import { ModalBase } from 'components/modal';
import { Column } from 'components/layouts/Column';
import styled from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import { Row } from 'components/layouts/Row';
import { t } from 'i18next';

const ModalTitle = styled.Text`
  color: black;
  padding: 10px;
`;
const PhoneNumber = styled.Text`
  font-weight: bold;
  color: black;
  margin-bottom: 10px;
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
const InvalidText = styled.Text`
  color: red;
  font-size: 13px;
  padding-top: 10px;
  margin-left: 70px;
`;

function UsingPhoneNumber({ navigation }) {
  const [contact, setContact] = useState('');
  const [isConfirmVisible, setIsConfirmVisible] = useState<boolean>(false);
  const [formattedNum, setFormattedNum] = useState('');
  const [notFound, setNotFound] = useState<boolean>(false);

  const user = useAtomValue(userAtom);

  const isValid = useMemo(() => {
    setNotFound(false);
    if (contact) {
      const parsed = parsePhoneNumber(contact);
      if (parsed?.nationalNumber === user?.contact.substring(1, user.contact.length)) {
        return false;
      } else {
        return parsed?.isValid();
      }
    } else {
      return false;
    }
  }, [contact]);

  const submit = useCallback(() => {
    setIsConfirmVisible(false);
    get(`/auth/users/detail?contact=${parsePhoneNumber(contact)?.formatInternational()}`)
      .then((res) => {
        // @ts-ignore
        if (res.block === null) {
          navigation.navigate('/contacts/contacts-search/result', { result: res });
        } else {
          setNotFound(true);
        }
      })
      .catch((error) => {
        if (error.response.status === 404) {
          setNotFound(true);
        }
      });
  }, [contact, navigation]);

  useEffect(() => {
    let formattedNumber = '';
    let splicePhoneNumber = parsePhoneNumber(contact)?.formatInternational()?.split(' ') ?? [];
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
      <BackHeader title={t('using-phone-number.Add friends')} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <>
            <View style={tw`flex-1 p-5`}>
              <View style={{ paddingTop: 13 }}>
                <PhoneInput invalid={notFound} onChange={(value) => setContact(value)} />
                {notFound && <InvalidText>{t('using-phone-number.This user cannot be found')}</InvalidText>}
              </View>
            </View>
            <Button onPress={() => setIsConfirmVisible(true)} disabled={!isValid || notFound}>
              {t('using-phone-number.NEXT')}
            </Button>
          </>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <ModalBase isVisible={isConfirmVisible} onBackdropPress={() => setIsConfirmVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle>{t('using-phone-number.Confirm phone number')}</ModalTitle>
          <PhoneNumber>{formattedNum}</PhoneNumber>
          <Row style={{ paddingTop: 15 }}>
            <CancelButton onPress={() => setIsConfirmVisible(false)}>
              <CancelLabel>{t('using-phone-number.Cancel')}</CancelLabel>
            </CancelButton>
            <View style={{ padding: 5 }} />
            <ConfirmButton onPress={submit}>
              <ConfirmLabel>{t('using-phone-number.Confirm')}</ConfirmLabel>
            </ConfirmButton>
          </Row>
        </Column>
      </ModalBase>
    </MainLayout>
  );
}

export default UsingPhoneNumber;
