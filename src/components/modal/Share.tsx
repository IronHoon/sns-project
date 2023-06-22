import React from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import styled from 'styled-components';

import { COLOR } from 'constants/COLOR';
import { Row } from 'components/layouts/Row';
import { t } from 'i18next';

const Container = styled(View)`
  background: #fafafa;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  bottom: 0;
  padding: 30px 0;
  position: absolute;
  left: 0;
  width: 100%;
`;
const Header = styled(View)`
  align-items: center;
  border-bottom-color: ${COLOR.GRAY};
  border-bottom-style: solid;
  border-bottom-width: 1px;
  margin-bottom: 25px;
  padding-bottom: 30px;
`;
const IconsContainer = styled(Row)<{ marginTop?: boolean }>`
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: ${({ marginTop }) => (marginTop ? 30 : 0)}px;
  padding: 0 20px;
`;

const Icon = styled(Image)<{ height?: number; width?: number }>`
  height: ${({ height }) => height || 42}px;
  width: ${({ width }) => width || 42}px;
`;
const BtnCopy = styled(TouchableOpacity)`
  align-items: center;
  background: ${COLOR.GRAY};
  border-radius: 30px;
  color: ${COLOR.BLACK};
  font-size: 14px;
  font-weight: 500;
  height: 35px;
  justify-content: center;
  margin-top: 20px;
  width: 135px;
`;
const BtnPlatform = styled(TouchableOpacity)<{ noMargin?: boolean }>`
  align-items: center;
  width: 70px;
`;
const Name = styled(Text)`
  color: ${COLOR.BLACK};
  font-size: 13px;
  margin-top: 12px;
  text-align: center;
`;

interface Props {
  modalVisible: boolean;
  copyLink: () => void;
  onBackdropPress: () => void;
}

export const Share = ({ modalVisible, copyLink, onBackdropPress }: Props) => {
  const PLATFORMS = [
    [
      {
        src: require('assets/kokkokme/ic-sns-kokkok.png'),
        name: 'Kok Kok',
      },
      {
        src: require('assets/kokkokme/ic-sns-whatsapp.png'),
        name: 'Whatsapp',
      },
      {
        src: require('assets/kokkokme/ic-sns-zalo.png'),
        name: 'Zalo',
      },
      {
        src: require('assets/kokkokme/ic-sns-kakaotalk.png'),
        name: 'Kakao talk',
      },
    ],
    [
      {
        src: require('assets/kokkokme/ic-sns-fbmssger.png'),
        name: 'Facebook\nMessenger',
      },
      {
        src: require('assets/kokkokme/ic-sms-text.png'),
        name: 'Text\nMessages',
      },
      {
        src: require('assets/kokkokme/ic-sns-facebook.png'),
        name: 'Facebook',
      },
      {
        src: require('assets/kokkokme/ic-sns-instagram.png'),
        name: 'Instagram',
      },
    ],
  ];
  return (
    <Modal transparent={true} visible={modalVisible}>
      <TouchableWithoutFeedback onPress={onBackdropPress}>
        <View style={styles.centeredView} />
      </TouchableWithoutFeedback>
      <Container>
        <Header>
          <Icon height={57} source={require('assets/kokkokme/ic-share.png')} width={57} />
          <BtnCopy onPress={copyLink}>
            <Text>{t('kokkokme-main.URL Copy')}</Text>
          </BtnCopy>
        </Header>
        {PLATFORMS.map((row, i) => (
          <IconsContainer marginTop={(i + 1) % 2 === 0} key={i}>
            {row.map(({ name, src }) => (
              <BtnPlatform key={name}>
                <Icon source={src} />
                <Name>{name}</Name>
              </BtnPlatform>
            ))}
          </IconsContainer>
        ))}
      </Container>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    zIndex: -999,
  },
});
