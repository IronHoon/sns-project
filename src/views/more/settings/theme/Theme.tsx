import React from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import { t } from 'i18next';

const Description = styled.Text`
  font-size: 13px;
  /* line-height: 18px; */
  color: #999999;
  margin-right: 5px;
`;
const NavButtonContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding: 15px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #e3e3e3;
`;
const Icon = styled.Image`
  width: 22px;
  height: 22px;
  tint-color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const NavLabel = styled.Text`
  flex: 1;
  font-size: 14px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;

function Theme() {
  const navigation = useNavigation<MainNavigationProp>();
  const myUser = useAtomValue(userAtom);

  const getChatThemes = (setting) => {
    switch (setting) {
      case 'system':
        return t('theme.System Mode');
      case 'light':
        return t('theme.Light Mode');
      case 'dark':
        return t('theme.Dark Mode');
      default:
        return t('theme.Light Mode');
    }
  };

  return (
    <MainLayout>
      <BackHeader title={t('theme.Theme')} />
      <NavButtonContainer onPress={() => navigation.navigate('/more/settings/theme/chat')}>
        <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('theme.Chat Themes')}</NavLabel>
        <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
          {getChatThemes(myUser?.setting?.ct_chat_theme)}
        </Description>
        <Icon source={require('../../../../assets/ic-next.png')} />
      </NavButtonContainer>
      <NavButtonContainer onPress={() => navigation.navigate('/more/settings/theme/chat-background')}>
        <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('theme.Chat Background')}</NavLabel>
        <Icon source={require('../../../../assets/ic-next.png')} />
      </NavButtonContainer>
      <NavButtonContainer onPress={() => navigation.navigate('/more/settings/theme/text-size')}>
        <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('theme.Text Size')}</NavLabel>
        <Icon source={require('../../../../assets/ic-next.png')} />
      </NavButtonContainer>
    </MainLayout>
  );
}

export default Theme;
