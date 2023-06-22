import React, { useCallback } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { Column } from 'components/layouts/Column';
import { SwitchButton } from 'components/atoms/switch/SwitchButton';
import { patch } from '../../../../net/rest/api';
import { useFetchWithType } from '../../../../net/useFetch';
import User from '../../../../types/auth/User';
import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

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
const SwitchContainer = styled.View`
  flex-direction: row;
  padding: 15px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #e3e3e3;
`;
const SwitchLabel = styled.Text`
  margin-bottom: 5px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Description = styled.Text`
  font-size: 13px;
  width: 90%;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
`;

function KokKokMeNotifications() {
  const navigation = useNavigation<MainNavigationProp>();
  const { data: meData, error: meError, mutate: mutateMe } = useFetchWithType<User>('/auth/me');
  const myUser: User | null = useAtomValue(userAtom);

  const update = useCallback(
    async (field: string, value: any) => {
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
      <BackHeader title="Kok Kok Me" />
      <NavButtonContainer
        onPress={() => navigation.navigate('/more/settings/notifications-settings/kokkokme/live-notifications')}
      >
        <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('notifications.Live')}</NavLabel>
        <Icon source={require('../../../../assets/ic-next.png')} />
      </NavButtonContainer>
      <SwitchContainer>
        <Column style={{ flex: 1 }}>
          <SwitchLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
            {t('notifications.Likes')}
          </SwitchLabel>
          <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
            {t('notifications.{username}(@{kokkokname}) liked your post')}
          </Description>
        </Column>
        <SwitchButton
          isEnabled={!!meData?.setting?.nt_sns_likes}
          setIsEnabled={() => update('nt_sns_likes', meData?.setting?.nt_sns_likes ? 0 : 1)}
        />
      </SwitchContainer>
      <SwitchContainer>
        <Column style={{ flex: 1 }}>
          <SwitchLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
            {t('notifications.Comments')}
          </SwitchLabel>
          <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
            {t('notifications.{username}(@{kokkokname}) commented on your post')}
          </Description>
        </Column>
        <SwitchButton
          isEnabled={!!meData?.setting?.nt_sns_comment}
          setIsEnabled={() => update('nt_sns_comment', meData?.setting?.nt_sns_comment ? 0 : 1)}
        />
      </SwitchContainer>
      <SwitchContainer>
        <Column style={{ flex: 1 }}>
          <SwitchLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
            {t('notifications.Tags')}
          </SwitchLabel>
          <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
            {t('notifications.{username}(@{kokkokname}) tagged you on a post')}
          </Description>
        </Column>
        <SwitchButton
          isEnabled={!!meData?.setting?.nt_sns_tag}
          setIsEnabled={() => update('nt_sns_tag', meData?.setting?.nt_sns_tag ? 0 : 1)}
        />
      </SwitchContainer>
      {meData?.setting?.sc_sns_post === 'friends' && (
        <SwitchContainer>
          <Column style={{ flex: 1 }}>
            <SwitchLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>Follow Requests</SwitchLabel>
            <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
              {
                '{username}(@{kokkokname}) requested to follow you.\n{username}(@{kokkokname}) accepted your follow request.'
              }
            </Description>
          </Column>
          <SwitchButton
            isEnabled={!!meData?.setting?.nt_sns_followers}
            setIsEnabled={() => update('nt_sns_followers', meData?.setting?.nt_sns_followers ? 0 : 1)}
          />
        </SwitchContainer>
      )}
    </MainLayout>
  );
}

export default KokKokMeNotifications;
