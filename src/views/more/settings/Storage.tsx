import React, { useEffect, useState } from 'react';
import MainLayout from 'components/layouts/MainLayout';
import BackHeader from 'components/molecules/BackHeader';
import styled from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import RNFS from 'react-native-fs';
import { Row } from 'components/layouts/Row';
import { ModalBase } from 'components/modal';
import { Column } from 'components/layouts/Column';
import { View } from 'react-native';
import Toast from 'react-native-toast-message';
import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import User from 'types/auth/User';

const NavButtonContainer = styled.TouchableOpacity`
  padding: 15px;
  padding-top: 20px;
  padding-bottom: 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
`;
const NavLabel = styled.Text<{ cache: boolean }>`
  flex: 1;
  font-size: 14px;
  color: ${(props) =>
    props.cache
      ? props.theme.dark
        ? props.theme.colors.WHITE
        : props.theme.colors.BLACK
      : props.theme.colors.TEXT_GRAY};
`;
const Size = styled.Text<{ cache: boolean }>`
  font-size: 14px;
  color: ${(props) =>
    props.cache
      ? props.theme.dark
        ? props.theme.colors.WHITE
        : props.theme.colors.BLACK
      : props.theme.colors.TEXT_GRAY};
`;
const Description = styled.Text`
  font-size: 12px;
  padding-top: 10px;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
`;
const ModalTitle = styled.Text`
  color: black;
  padding: 5px;
  font-size: 15px;
  font-weight: 500;
`;
const ModalText = styled.Text`
  color: #999999;
  padding-top: 5px;
  padding-bottom: 10px;
`;
const CancelButton = styled.TouchableOpacity`
  background-color: #fff;
  width: 110px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: #ccc;
`;
const CancelLabel = styled.Text`
  color: #ccc;
  font-weight: bold;
`;
const Clear = styled.TouchableOpacity`
  background-color: ${COLOR.PRIMARY};
  width: 110px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${COLOR.PRIMARY};
`;
const ClearLabel = styled.Text`
  color: #fff;
  font-weight: bold;
`;

function Storage() {
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const myUser: User | null = useAtomValue(userAtom);
  const cache = Math.ceil((cacheSize / 1024 / 1024) * 100) / 100;

  const getCacheDate = () => {
    //@ts-ignore
    RNFS.readDir(RNFS.CachesDirectoryPath).then((result) => {
      let size = 0;
      result.forEach((r) => (size += r.size));
      setCacheSize(size);
    });
  };

  const handleClearCache = () => {
    RNFS.readDir(RNFS.CachesDirectoryPath).then((result) => {
      result.forEach((r) => {
        RNFS.unlink(r.path);
      });
      Toast.show({
        type: 'success',
        text1: 'Cleared cached data successfully.',
      });
      getCacheDate();
    });
  };

  useEffect(() => {
    getCacheDate();
  }, []);

  return (
    <MainLayout>
      <BackHeader title={t('chatting.Storage')} />
      <NavButtonContainer onPress={cache !== 0 ? () => setIsVisible(true) : undefined}>
        <Row>
          <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }} cache={cache !== 0}>
            {t('chatting.Clear Cached Data')}
          </NavLabel>
          <Size style={{ fontSize: myUser?.setting?.ct_text_size as number }} cache={cache !== 0}>
            {cache} MB
          </Size>
        </Row>
        <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
          {t('chatting.Cached data is temporary data generated when using Kok Kok')}
        </Description>
      </NavButtonContainer>
      <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle>{t('chatting.Are you sure you want to clear cached data?')}</ModalTitle>
          <ModalText>
            {t('chatting.Media files including Photos, Videos, and Voice messages in chatrooms will be maintained')}
          </ModalText>
          <Row style={{ paddingTop: 15 }}>
            <CancelButton onPress={() => setIsVisible(false)}>
              <CancelLabel>{t('chatting.Cancel')}</CancelLabel>
            </CancelButton>
            <View style={{ padding: 10 }} />
            <Clear
              onPress={() => {
                setIsVisible(false);
                handleClearCache();
              }}
            >
              <ClearLabel>{t('chatting.Clear')}</ClearLabel>
            </Clear>
          </Row>
        </Column>
      </ModalBase>
    </MainLayout>
  );
}

export default Storage;
