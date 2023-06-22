import React, { useState } from 'react';
import BackHeader from '../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import { StackActions, useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { Row } from 'components/layouts/Row';
import Button from 'components/atoms/MButton';

import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import { COLOR } from 'constants/COLOR';
import { ModalBase } from 'components/modal';
import { Column } from 'components/layouts/Column';
import Space from 'components/utils/Space';
import { Input } from '../components/Input';
import { remove } from 'net/rest/api';

const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
`;

const Description = styled.Text`
  font-size: 13px;
  padding-top: 5px;
  /* line-height: 18px; */
  color: #999999;
`;

const DeleteButton = styled.TouchableOpacity`
  margin-top: 20px;
  width: 50%;
  padding: 10px 20px;
  background: ${COLOR.DARK_GRAY};
`;
const DeleteLabel = styled.Text`
  color: ${COLOR.LIGHT_GRAY};
`;

const MainContainer = styled.View`
  display: flex;
  flex-direction: column;
`;

const DescriptionBox = styled.Text`
  font-size: 13px;
  padding: 10px;
  line-height: 18px;
  color: #999999;
  margin-bottom: 25px;
  background: ${COLOR.LIGHT_GRAY};
`;

const ModalTitle = styled(Text)`
  font-size: 15px;
  color: black;
  padding: 10px;
  font-weight: bold;
`;
const ModalText = styled(Text)`
  color: #999999;
  padding: 10px;
  text-align: center;
`;
const CancelButton = styled(TouchableOpacity)`
  background-color: #fff;
  width: 120px;
  height: 55px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: #ccc;
`;
const ConfirmButton = styled(TouchableOpacity)`
  background-color: ${COLOR.PRIMARY};
  width: 120px;
  height: 55px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${COLOR.PRIMARY};
  margin-bottom: 10px;
`;
const CancelLabel = styled(Text)`
  color: #ccc;
  font-size: 15px;
  font-weight: bold;
`;
const ConfirmLabel = styled(Text)`
  color: #fff;
  font-size: 15px;
  font-weight: bold;
`;

const IdInput = styled(Input)`
  padding: 10px;
  margin: 0 10px;
  box-sizing: border-box;
  width: 90%;
  margin-bottom: auto;
`;
function DeleteAccount() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const user = useAtomValue(userAtom);
  const navigation = useNavigation<MainNavigationProp>();

  const [inputId, setInputId] = useState<string>('');
  const [type, setType] = useState<string>('information'); //information || id-check

  const DeleteModal = () => {
    return (
      <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle style={{ fontSize: user?.setting?.ct_text_size as number }}>Delete account</ModalTitle>
          <ModalText style={{ fontSize: user?.setting?.ct_text_size as number }}>
            Are you sure you want to delete your account?
          </ModalText>
          <Row style={{ paddingTop: 15 }}>
            <CancelButton
              onPress={async () => {
                setIsVisible(false);
              }}
            >
              <CancelLabel>{t('common.Cancel')}</CancelLabel>
            </CancelButton>
            <Space width={10} />
            <ConfirmButton
              onPress={() => {
                setIsVisible(false);
                setType('id-check');
                // navigation.navigate('/more/settings/help/delete-account/confirm')
              }}
            >
              <ConfirmLabel>{t('common.Delete')}</ConfirmLabel>
            </ConfirmButton>
          </Row>
        </Column>
      </ModalBase>
    );
  };

  const IdCheckDeleteModal = () => {
    return (
      <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
        {user?.uid === inputId ? (
          <Column justify="center" align="center">
            <ModalTitle style={{ fontSize: user?.setting?.ct_text_size as number }}>Delete account</ModalTitle>
            <ModalText style={{ fontSize: user?.setting?.ct_text_size as number }}>
              Are you sure you want to delete your account? This behavior is irreversible.
            </ModalText>
            <Row style={{ paddingTop: 15 }}>
              <CancelButton
                onPress={async () => {
                  setIsVisible(false);
                }}
              >
                <CancelLabel>{t('common.Cancel')}</CancelLabel>
              </CancelButton>
              <Space width={10} />
              <ConfirmButton
                onPress={async () => {
                  setIsVisible(false);
                  // navigation.navigate('/more/settings/help/delete-account/confirm');

                  remove(`/auth/me/${user?.id}/withdrawal`)
                    .then(async () => {
                      navigation.dispatch(StackActions.popToTop());
                      navigation.replace('/more/settings/help/delete-account/confirm');
                    })
                    .catch((e) => {
                      Alert.alert('Error', 'Delete user failed');
                    });
                }}
              >
                <ConfirmLabel>{t('common.Delete')}</ConfirmLabel>
              </ConfirmButton>
            </Row>
          </Column>
        ) : (
          <Column justify="center" align="center">
            <ModalTitle style={{ fontSize: user?.setting?.ct_text_size as number }}>
              Please check your user id
            </ModalTitle>

            <Row style={{ paddingTop: 15 }}>
              <ConfirmButton
                onPress={async () => {
                  setIsVisible(false);
                  setInputId('');
                }}
              >
                <ConfirmLabel>{t('common.Confirm')}</ConfirmLabel>
              </ConfirmButton>
            </Row>
          </Column>
        )}
      </ModalBase>
    );
  };

  if (type === 'information') {
    return (
      <MainLayout>
        <BackHeader title={t('Delete my account')} />
        <DeleteModal />
        <MainContainer style={{ padding: 20 }}>
          <Title style={{ fontSize: user?.setting?.ct_text_size as number }}>Information</Title>
          <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>
            Deleting your account permanently removes all your messages and contacts. All data that you've created are
            orphaned and left without a creator but admins retain.
          </Description>
          <DeleteButton onPress={() => setIsVisible(true)}>
            <DeleteLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>Delete my account</DeleteLabel>
          </DeleteButton>
        </MainContainer>
      </MainLayout>
    );
  } else {
    return (
      <MainLayout>
        <BackHeader title={t('Kokkok ID Authentication')} />
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}
        >
          <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1 }}>
            <MainContainer style={{ marginBottom: 'auto' }}>
              <IdCheckDeleteModal />
              <DescriptionBox style={{ fontSize: user?.setting?.ct_text_size as number }}>
                Please enter your Kokkok ID to delete the service account.
              </DescriptionBox>
              <IdInput
                placeholder={t('Kokkok id')}
                value={inputId}
                autoCapitalize={'none'}
                onChangeText={(value) => {
                  setInputId(value);
                }}
              />
            </MainContainer>
            {Platform.OS === 'ios' && (
              <Button disabled={inputId.length === 0} onPress={() => setIsVisible(true)}>
                {t('sign-up.NEXT')}
              </Button>
            )}
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
        {Platform.OS === 'android' && (
          <Button disabled={inputId.length === 0} onPress={() => setIsVisible(true)}>
            {t('sign-up.NEXT')}
          </Button>
        )}
      </MainLayout>
    );
  }
}

export default DeleteAccount;
