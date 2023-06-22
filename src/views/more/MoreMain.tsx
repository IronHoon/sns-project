import React, { useState } from 'react';
import Modal from 'react-native-modal';
import NavbarLayout from 'components/layouts/NavbarLayout';
import TitleHeader from 'components/molecules/TitleHeader';
import IconButton from 'components/atoms/MIconButton';
import styled from 'styled-components/native';
import tw from 'twrnc';
import { Row } from 'components/layouts/Row';
import {
  Dimensions,
  Image,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLOR } from 'constants/COLOR';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { QrCodeModal } from './components';
import { SafeAreaView } from 'react-native-safe-area-context';
import Lightbox from 'react-native-lightbox-v2';
import { useAtom, useAtomValue } from 'jotai';
import userAtom from '../../stores/userAtom';
import AuthUtil from '../../utils/AuthUtil';
import { useSetAtom } from 'jotai';
import tokenAtom from '../../stores/tokenAtom';
import Space from '../../components/utils/Space';
import { t } from 'i18next';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import MySetting from 'MySetting';
import { useTranslation } from 'react-i18next';
import { isDev } from '../../utils/isDev';
import { getUniqueId } from 'react-native-device-info';

interface MenuButtonProps {
  icon: ImageSourcePropType;
  label: string;
  onClick: () => void;
}

const ProfileContainer = styled(Lightbox)`
  width: 120px;
  height: 120px;
  border-radius: 70px;
  overflow: hidden;
  margin: 15px;
`;
const ProfileImage = styled.Image<{ open: boolean }>`
  width: 100%;
  height: 100%;
  max-height: 300px;
  border-radius: ${({ open }) => (open ? '0px' : '70px')};
`;
const Name = styled.Text`
  font-size: 18px;
  font-weight: 500;
  margin: 5px;
  text-align: center;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const ID = styled.Text`
  color: ${(props) => props.theme.colors.POINT_GRAY};
`;
const PhoneNumber = styled.Text`
  margin: 5px;
  color: #999999;
`;
const MenuButtonLabel = styled.Text`
  text-align: center;
  font-size: 12px;
  margin: 5px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;

const EditButton = ({ onClick }) => {
  return (
    <TouchableOpacity style={{ flexDirection: 'row', padding: 20 }} onPress={() => onClick()}>
      <Image source={require('../../assets/ic-edit.png')} style={{ width: 13, height: 13 }} />
      <Text style={{ fontSize: 12, color: '#999999' }}>{t('more-main.Edit')}</Text>
    </TouchableOpacity>
  );
};
const MenuButton = ({ icon, label, onClick }: MenuButtonProps) => {
  return (
    <TouchableOpacity
      style={{
        borderColor: COLOR.POINT_GRAY,
        borderWidth: 1,
        borderRadius: 10,
        width: 80,
        height: 90,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={() => onClick()}
    >
      <Image source={icon} style={{ width: 24, height: 24, margin: 5 }} />
      <MenuButtonLabel>{label}</MenuButtonLabel>
    </TouchableOpacity>
  );
};

function MoreMain() {
  const { i18n } = useTranslation();
  const navigation = useNavigation<MainNavigationProp>();
  const setUser = useSetAtom(userAtom);
  const setToken = useSetAtom(tokenAtom);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const me = useAtomValue(userAtom);

  const Buttons = [
    <IconButton
      key={0}
      themeColor={true}
      source={require('../../assets/ic-qr.png')}
      onClick={() => {
        navigation.navigate('/qr-scan');
      }}
    />,
    <IconButton
      key={1}
      themeColor={true}
      source={require('../../assets/ic-set.png')}
      onClick={() => navigation.navigate('/more/settings')}
    />,
  ];

  return (
    <>
      <NavbarLayout>
        <TitleHeader title={t('more-main.More')} justify="flex-start" button={Buttons} />
        <ScrollView>
          <View style={tw`w-full items-end`}>
            <EditButton onClick={() => navigation.navigate('/more/profile-edit')} />
          </View>
          {/* {me?.profile_background ? (
            <ImageBackground
              source={{ uri: me?.profile_background || undefined }}
              style={[tw`w-full items-center justify-center`, { height: 280 }]}
            >
              <ProfileContainer onOpen={() => setIsLightboxOpen(true)} willClose={() => setIsLightboxOpen(false)}>
                <ProfileImage
                  open={isLightboxOpen}
                  source={!me?.profile_image ? require('assets/chats/img_profile.png') : { uri: me?.profile_image }}
                />
              </ProfileContainer>
              <Name>{`${me?.first_name} ${me?.last_name}`}</Name>
              <ID>{`@${me?.uid}`}</ID>
              <PhoneNumber>{me?.contact}</PhoneNumber>
            </ImageBackground>
          ) : ( */}
          <View style={[tw`w-full items-center justify-center`, { height: 280 }]}>
            <ProfileContainer onOpen={() => setIsLightboxOpen(true)} willClose={() => setIsLightboxOpen(false)}>
              <ProfileImage
                open={isLightboxOpen}
                source={!me?.profile_image ? require('assets/chats/img_profile.png') : { uri: me?.profile_image }}
              />
            </ProfileContainer>
            <Name
              style={{ fontSize: me?.setting?.ct_text_size as number }}
            >{`${me?.first_name} ${me?.last_name}`}</Name>
            <ID style={{ fontSize: me?.setting?.ct_text_size as number }}>{`@${me?.uid}`}</ID>
            <PhoneNumber style={{ fontSize: me?.setting?.ct_text_size as number }}>{me?.contact}</PhoneNumber>
          </View>
          {/* )} */}
          <Space height={20} />
          <Row justify="space-evenly" style={{ paddingHorizontal: 20 }}>
            <View style={tw`opacity-30`}>
              <MenuButton
                icon={require('../../assets/ic-market.png')}
                label={t('more-main.Market')}
                //TODO : 위치설정이 되있을 경우(메인페이지로)와 안되있을경우(neighborhood setting페이지로 이동)
                onClick={() => isDev() && navigation.navigate('/market/neighborhood-settings', {})}
              />
            </View>
            <MenuButton
              icon={require('../../assets/ic-wallet.png')}
              label={t('more-main.QR wallet')}
              onClick={() => me && ChatHttpUtil.requestGoQRWallet(navigation, me?.id)}
            />
            <MenuButton
              icon={require('../../assets/ic-saved.png')}
              label={t('more-main.Saved messages')}
              onClick={() => navigation.navigate('/more/saved-messages')}
            />
          </Row>
          {isDev() && (
            <View style={tw`items-center m-8`}>
              <Text>버전 : {MySetting.appVersion}</Text>
              <Pressable
                onPress={() => {
                  navigation.navigate('/__dev__/page-list');
                }}
                style={tw`mb-6`}
              >
                <Text>테스트 전용 : 페이지 목록</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  AuthUtil.logout(getUniqueId()).then(async () => {
                    navigation.popToTop();
                    navigation.replace('/landing');
                  });
                }}
              >
                <Text>테스트 전용 : 로그아웃</Text>
              </Pressable>
            </View>
          )}

          {isDev() && (
            <View style={tw`items-center`}>
              <Pressable
                onPress={() => {
                  navigation.navigate('/market/listings');
                }}
                style={tw`mb-6`}
              >
                <Text>테스트 전용 : 페이지 미리보기</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </NavbarLayout>
    </>
  );
}

export default MoreMain;
