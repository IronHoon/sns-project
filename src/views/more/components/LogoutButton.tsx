import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import AuthUtil from 'utils/AuthUtil';
import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import Logout from 'assets/ic-log-out.svg';
import LogoutW from 'assets/ic-log-out-w.svg';
import userAtom from 'stores/userAtom';
import { getUniqueId } from 'react-native-device-info';
import { useAtomValue, useSetAtom } from 'jotai';
import User from 'types/auth/User';

const LogoutButton = () => {
  const navigation = useNavigation<MainNavigationProp>();
  const { dark } = useContext(ThemeContext);
  const setMe = useSetAtom(userAtom);

  const me: User | null = useAtomValue(userAtom);
  const themeFont = me?.setting.ct_text_size as number;
  return (
    <>
      {dark ? (
        <Button
          height={60}
          fontSize={themeFont}
          borderRadius
          marginRight={25}
          marginLeft={25}
          variant={ButtonVariant.Outlined}
          whitelined
          textvariant={ButtonTextVariant.OutlinedText}
          whitelinedText
          label={'Logout'}
          onPress={() => {
            AuthUtil.logout(getUniqueId()).then(async () => {
              setMe(null);
              navigation.popToTop();
              navigation.replace('/landing');
            });
          }}
        >
          <LogoutW />
        </Button>
      ) : (
        <Button
          height={60}
          fontSize={themeFont}
          borderRadius
          marginRight={25}
          marginLeft={25}
          variant={ButtonVariant.Outlined}
          blacklined
          textvariant={ButtonTextVariant.OutlinedText}
          blacklinedText
          label={'Logout'}
          onPress={() => {
            AuthUtil.logout(getUniqueId()).then(async () => {
              setMe(null);
              navigation.popToTop();
              navigation.replace('/landing');
            });
          }}
        >
          <Logout />
        </Button>
      )}
    </>
  );
};

export default LogoutButton;
