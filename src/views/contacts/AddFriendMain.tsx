import React, { useState } from 'react';
import { Dimensions, Share } from 'react-native';
import tw from 'twrnc';
import BackHeader from '../../components/molecules/BackHeader';
import { useAtomValue } from 'jotai';
import userAtom from '../../stores/userAtom';
import MainLayout from 'components/layouts/MainLayout';
import { Row } from 'components/layouts/Row';
import styled from 'styled-components/native';
import PhoneNumber from 'assets/contacts/add-friend/ic_number.svg';
import QR from 'assets/contacts/add-friend/ic_code.svg';
import Invite from 'assets/contacts/add-friend/ic_invite.svg';
import PhoneBook from 'assets/contacts/add-friend/ic_book.svg';
import ShareOther from 'assets/contacts/add-friend/ic_share.svg';
import Link from 'assets/contacts/add-friend/ic_app.svg';
import { COLOR } from 'constants/COLOR';
import { Column } from 'components/layouts/Column';
import { QrCodeModal } from 'views/more/components';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import { t } from 'i18next';

const IconButton = styled.Pressable`
  width: ${`${Dimensions.get('window').width / 3.1}px`};
  padding: 15px;
`;
const IconButtonLabel = styled.Text<{ fontSize: number }>`
  margin-top: 5px;
  text-align: center;
  font-size: ${({ fontSize }) => fontSize - 3};
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

function AddFriendMain({ navigation }) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const appLink = 'https://share.kokkokchat.link/download';
  const user = useAtomValue(userAtom);
  const themeFont = user?.setting.ct_text_size as number;

  const copyAppLink = () => {
    Clipboard.setString(appLink);
    Toast.show({
      type: 'success',
      text1: t('add-friend-main.Link Copied'),
    });
  };

  return (
    <MainLayout>
      <BackHeader title={t('add-friend-main.Add friends')} />
      <Column align="center" style={{ marginTop: 15 }}>
        <Row style={{ justifyContent: 'space-around' }}>
          <IconButton
            style={tw`items-center`}
            onPress={() => {
              navigation.navigate('/contacts/contacts-add-friend/using-phone-number');
            }}
          >
            <PhoneNumber />
            <IconButtonLabel fontSize={themeFont}>{t('add-friend-main.Using phone number')}</IconButtonLabel>
          </IconButton>
          <IconButton
            style={tw`items-center`}
            onPress={() => {
              navigation.navigate('/qr-scan');
            }}
          >
            <QR style={{ padding: 10 }} />
            <IconButtonLabel fontSize={themeFont}>{t('add-friend-main.Scan QR code')}</IconButtonLabel>
          </IconButton>
          <IconButton
            style={tw`items-center`}
            onPress={() => {
              navigation.navigate('/contacts/contacts-add-friend/invite-friends');
            }}
          >
            <Invite />
            <IconButtonLabel fontSize={themeFont}>{t('add-friend-main.Invite friends')}</IconButtonLabel>
          </IconButton>
        </Row>
        <Row style={{ justifyContent: 'space-around' }}>
          <IconButton
            style={tw`items-center`}
            onPress={() => {
              navigation.navigate('/contacts/contacts-add-friend/from-phonebook');
            }}
          >
            <PhoneBook />
            <IconButtonLabel fontSize={themeFont}>{t('add-friend-main.From phonebook')}</IconButtonLabel>
          </IconButton>
          <IconButton
            style={tw`items-center`}
            onPress={() => {
              Share.share({
                message: appLink,
              });
            }}
          >
            <ShareOther />
            <IconButtonLabel fontSize={themeFont}>{t('add-friend-main.Share other apps')}</IconButtonLabel>
          </IconButton>
          <IconButton style={tw`items-center`} onPress={() => copyAppLink()}>
            <Link />
            <IconButtonLabel fontSize={themeFont}>{t('add-friend-main.Copy app link')}</IconButtonLabel>
          </IconButton>
        </Row>
      </Column>
      <Modal
        isVisible={isVisible}
        coverScreen={true}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          margin: 0,
          height: Dimensions.get('window').height + 100,
          backgroundColor: '#Fff',
        }}
      >
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <QrCodeModal setIsModalVisible={setIsVisible} />
        </SafeAreaView>
      </Modal>
    </MainLayout>
  );
}

export default AddFriendMain;
