import React, { useCallback, useState } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import { Radio } from 'components/atoms/input/Radio';
import { Pressable, View } from 'react-native';
import { useFetchWithType } from '../../../../net/useFetch';
import User from '../../../../types/auth/User';
import { patch } from '../../../../net/rest/api';
import SwrContainer from '../../../../components/containers/SwrContainer';
import { t } from 'i18next';
import UserAtom from '../../../../stores/userAtom';
import { useAtom } from 'jotai';
import logUtil from '../../../../utils/LogUtil';

const RadioContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding: 15px;
  padding-right: 20px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #e3e3e3;
`;
const RadioLabel = styled.Text`
  flex: 1;
  font-size: 14px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Description = styled.Text`
  font-size: 13px;
  width: 90%;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
`;

function RecentLogin() {
  const [selected, setSelected] = useState<'public' | 'friends' | 'private'>('public');
  const { data: meData, error: meError, mutate: mutateMe } = useFetchWithType<User>('/auth/me');
  const [user, setUser] = useAtom(UserAtom);
  const update = useCallback(
    async (field: string, value: any) => {
      let myUserSetting = {
        ...user,
        ['setting']: {
          ...user?.setting,
          [field]: value,
        },
      };
      //@ts-ignore
      setUser(myUserSetting);
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

  logUtil.info('user_setting', user?.setting);
  return (
    <MainLayout>
      <BackHeader title={t('privacy.Recent login')} />
      <SwrContainer data={meData} error={meError}>
        <>
          <Pressable onTouchStart={() => update('sc_recent_login', 'public')}>
            <RadioContainer>
              <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                {t('privacy.Everybody')}
              </RadioLabel>
              <Radio
                // checked={'public' === meData?.setting?.sc_recent_login}
                checked={user?.setting.sc_recent_login === 'public'}
                handleChecked={() => {
                  update('sc_recent_login', 'public');
                }}
              />
            </RadioContainer>
          </Pressable>
          <Pressable onTouchStart={() => update('sc_recent_login', 'friends')}>
            <RadioContainer>
              <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                {t('privacy.My contacts')}
              </RadioLabel>
              <Radio
                // checked={'friends' === meData?.setting?.sc_recent_login}
                checked={user?.setting.sc_recent_login === 'friends'}
                handleChecked={() => {
                  update('sc_recent_login', 'friends');
                }}
              />
            </RadioContainer>
          </Pressable>
          <Pressable onTouchStart={() => update('sc_recent_login', 'private')}>
            <RadioContainer>
              <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>{t('privacy.Nobody')}</RadioLabel>
              <Radio
                checked={user?.setting.sc_recent_login === 'private'}
                handleChecked={() => {
                  update('sc_recent_login', 'private');
                }}
              />
            </RadioContainer>
          </Pressable>
        </>
      </SwrContainer>

      <View style={{ alignItems: 'center', paddingTop: 20 }}>
        <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>
          {t("privacy.You won't see last seen and online statuses for people with whom you don't share yours")}
          {t('privacy.Approximate last seen will be shown instead(recently, within a week, within a month)')}
        </Description>
      </View>
    </MainLayout>
  );
}

export default RecentLogin;
