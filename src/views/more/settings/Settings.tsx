import React from 'react';
import BackHeader from '../../../components/molecules/BackHeader';
import styled from 'styled-components/native';
import MainLayout from 'components/layouts/MainLayout';
import { ImageSourcePropType, Share, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { t } from 'i18next';
import { getUniqueId } from 'react-native-device-info';
import langAtom from 'stores/langAtom';
import { useAtom, useAtomValue } from 'jotai';
import LogUtil from 'utils/LogUtil';
import { useTranslation } from 'react-i18next';
import User from 'types/auth/User';
import userAtom from 'stores/userAtom';

interface NavButtonProps {
  icon: ImageSourcePropType;
  children?: any;
  onClick: () => void;
}

const Conatiner = styled.ScrollView`
  flex: 1;
`;
const NavButtonContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding: 20px;
  align-items: center;
`;
const Icon = styled.Image`
  width: 22px;
  height: 22px;
  tint-color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Label = styled.Text`
  flex: 1;
  margin-left: 15px;
  font-size: 14px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;

const NavButton = ({ icon, onClick, children }: NavButtonProps) => {
  console.log(getUniqueId());

  return (
    <NavButtonContainer onPress={() => onClick()}>
      <Icon source={icon} />
      <Label>{children}</Label>
      <Icon source={require('../../../assets/ic-next.png')} />
    </NavButtonContainer>
  );
};
function Settings() {
  const { i18n } = useTranslation();
  const navigation = useNavigation<MainNavigationProp>();
  const appLink = 'https://share.kokkokchat.link/download';
  const myUser: User | null = useAtomValue(userAtom);

  return (
    <MainLayout>
      <BackHeader title={t('setting.Settings')} />
      <Conatiner>
        <NavButton
          icon={require('../../../assets/ic-general.png')}
          onClick={() => navigation.navigate('/more/settings/general')}
        >
          <Text style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('setting.General')}</Text>
        </NavButton>
        <NavButton
          icon={require('../../../assets/ic-notice.png')}
          onClick={() => navigation.navigate('/more/settings/notifications-settings')}
        >
          <Text style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('setting.Notifications')}</Text>
        </NavButton>
        <NavButton
          icon={require('../../../assets/ic-lock.png')}
          onClick={() => navigation.navigate('/more/settings/privacy-and-security')}
        >
          <Text style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('setting.Privacy and Security')}</Text>
        </NavButton>
        <NavButton
          icon={require('../../../assets/ic-background.png')}
          onClick={() => navigation.navigate('/more/settings/theme')}
        >
          <Text style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('setting.Theme')}</Text>
        </NavButton>
        <NavButton
          icon={require('../../../assets/ic-language.png')}
          onClick={() => navigation.navigate('/more/settings/language')}
        >
          <Text style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('setting.Language')}</Text>
        </NavButton>
        <NavButton
          icon={require('../../../assets/ic-message.png')}
          onClick={() => navigation.navigate('/more/settings/chatting')}
        >
          <Text style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('setting.Chatting')}</Text>
        </NavButton>
        <NavButton
          icon={require('../../../assets/ic-storage-setting.png')}
          onClick={() => navigation.navigate('/more/settings/storage')}
        >
          <Text style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('setting.Storage')}</Text>
        </NavButton>
        <NavButton
          icon={require('../../../assets/ic-help.png')}
          onClick={() => navigation.navigate('/more/settings/help')}
        >
          <Text style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('setting.Help')}</Text>
        </NavButton>
        <NavButton
          icon={require('../../../assets/ic-share.png')}
          onClick={() => {
            Share.share({
              message: appLink,
            });
          }}
        >
          <Text style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('setting.Share to friends')}</Text>
        </NavButton>
      </Conatiner>
    </MainLayout>
  );
}

export default Settings;
