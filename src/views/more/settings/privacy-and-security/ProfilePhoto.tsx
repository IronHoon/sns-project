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
import userAtom from '../../../../stores/userAtom';
import { useAtom } from 'jotai';
import LogUtil from '../../../../utils/LogUtil';

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

function ProfilePhoto() {
  const [selected, setSelected] = useState<'everybody' | 'contacts' | 'nobody'>('everybody');
  const { data: meData, error: meError, mutate: mutateMe } = useFetchWithType<User>('/auth/me');
  const [user, setUser] = useAtom(userAtom);
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
      LogUtil.info(JSON.stringify(user?.setting));
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
      <BackHeader title={t('privacy.Profile photo')} />
      <SwrContainer data={meData} error={meError}>
        <>
          <Pressable onTouchStart={() => update('sc_profile_photo', 'public')}>
            <RadioContainer>
              <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                {t('privacy.Everybody')}
              </RadioLabel>
              <Radio
                // checked={'public' === meData?.setting?.sc_profile_photo}
                checked={user?.setting.sc_profile_photo === 'public'}
                handleChecked={() => {
                  update('sc_profile_photo', 'public');
                }}
              />
            </RadioContainer>
          </Pressable>
          <Pressable onTouchStart={() => update('sc_profile_photo', 'friends')}>
            <RadioContainer onPress={() => setSelected('contacts')}>
              <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                {t('privacy.My contacts')}
              </RadioLabel>
              <Radio
                checked={user?.setting.sc_profile_photo === 'friends'}
                handleChecked={() => update('sc_profile_photo', 'friends')}
              />
            </RadioContainer>
          </Pressable>
          <Pressable onTouchStart={() => update('sc_profile_photo', 'private')}>
            <RadioContainer onPress={() => setSelected('nobody')}>
              <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>{t('privacy.Nobody')}</RadioLabel>
              <Radio
                checked={user?.setting.sc_profile_photo === 'private'}
                handleChecked={() => update('sc_profile_photo', 'private')}
              />
            </RadioContainer>
          </Pressable>
          <View style={{ alignItems: 'center', paddingTop: 20 }}>
            <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>
              {t('privacy.You can restrict who can see your profile photo')}
            </Description>
          </View>
        </>
      </SwrContainer>
    </MainLayout>
  );
}

export default ProfilePhoto;
