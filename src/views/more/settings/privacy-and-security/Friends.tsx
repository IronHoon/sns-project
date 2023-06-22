import React, { useCallback, useState } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { useFetchWithType } from '../../../../net/useFetch';
import User from '../../../../types/auth/User';
import { patch } from '../../../../net/rest/api';
import SwrContainer from '../../../../components/containers/SwrContainer';
import { t } from 'i18next';
import AsyncStorage from '@react-native-community/async-storage';

const Description = styled.Text`
  font-size: 13px;
  /* line-height: 18px; */
  color: #999999;
  margin-right: 5px;
`;
const NavButtonContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding: 16px;
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

function Friends() {
  const navigation = useNavigation<MainNavigationProp>();
  const { data: meData, error: meError, mutate: mutateMe } = useFetchWithType<User>('/auth/me');
  const [isAdd, setIsAdd] = useState<boolean>();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const isAdd = await AsyncStorage.getItem('isAddAuto');
        if (isAdd === 'true') {
          setIsAdd(true);
        } else {
          setIsAdd(false);
        }
      })();
    }, []),
  );
  const update = useCallback(
    async (field: string, value: any) => {
      console.log({
        ...meData?.setting,
        [field]: value,
      });
      await patch('/auth/user-setting', {
        ...meData?.setting,
        [field]: value,
      });
      await mutateMe();
    },
    [meData],
  );

  return (
    <MainLayout>
      <BackHeader title={t('privacy.Friends')} />
      <NavButtonContainer onPress={() => navigation.navigate('/more/settings/privacy-and-security/friends/add-users')}>
        <NavLabel style={{ fontSize: meData?.setting?.ct_text_size as number }}>{t('privacy.Add users')}</NavLabel>
        <SwrContainer data={meData} error={meError}>
          {isAdd ? (
            <Description style={{ fontSize: meData?.setting?.ct_text_size as number }}>{t('privacy.on')}</Description>
          ) : (
            <Description style={{ fontSize: meData?.setting?.ct_text_size as number }}>{t('privacy.off')}</Description>
          )}
        </SwrContainer>
        <Icon source={require('../../../../assets/ic-next.png')} />
      </NavButtonContainer>
    </MainLayout>
  );
}

export default Friends;
