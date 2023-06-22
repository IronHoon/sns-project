import { useNavigation } from '@react-navigation/native';
import { useSetAtom } from 'jotai';
import { MainNavigationProp } from 'navigations/MainNavigator';
import React, { useCallback } from 'react';
import { Button, SafeAreaView } from 'react-native';
import { getUniqueId } from 'react-native-device-info';
import tokenAtom from 'stores/tokenAtom';
import userAtom from 'stores/userAtom';
import AuthUtil from 'utils/AuthUtil';

function TestLoginPage() {
  const navigation = useNavigation<MainNavigationProp>();
  const setUser = useSetAtom(userAtom);
  const setToken = useSetAtom(tokenAtom);

  const login = useCallback(async () => {
    try {
      const data = await AuthUtil.loginWithTest();
      if (data) {
        setUser(data.user);
        setToken(data.token.token);
      }
      navigation.popToTop();
    } catch (error) {
      console.warn(error);
    }
  }, [navigation, setUser, setToken]);
  const logout = useCallback(async () => {
    try {
      setUser(null);
      setToken('');
      AuthUtil.logout(getUniqueId());
      navigation.popToTop();
    } catch (error) {
      console.warn(error);
    }
  }, [navigation, setUser, setToken]);
  return (
    <SafeAreaView>
      <Button title="로그인" onPress={login}></Button>
      <Button title="로그아웃" onPress={logout}></Button>
    </SafeAreaView>
  );
}

export default TestLoginPage;
