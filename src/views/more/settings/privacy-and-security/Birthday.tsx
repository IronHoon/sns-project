import React, { useCallback, useState } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import { Radio } from 'components/atoms/input/Radio';
import { useFetchWithType } from '../../../../net/useFetch';
import SwrContainer from '../../../../components/containers/SwrContainer';
import { patch } from '../../../../net/rest/api';
import User from '../../../../types/auth/User';
import { t } from 'i18next';
import LogUtil from '../../../../utils/LogUtil';
import userAtom from '../../../../stores/userAtom';
import { useAtom } from 'jotai';
import { Pressable } from 'react-native';

const TypeContainer = styled.View`
  padding: 15px;
  border-bottom-width: 1px;
  border-bottom-color: #e3e3e3;
`;
const TypeLabel = styled.Text`
  font-weight: 500;
  padding-top: 5px;
  padding-bottom: 10px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const RadioContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding-top: 5px;
  padding-bottom: 5px;
  align-items: center;
`;
const RadioLabel = styled.Text`
  font-size: 13px;
  margin-left: 10px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Description = styled.Text`
  font-size: 13px;
  padding-top: 10px;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
`;

function Birthday() {
  const [birthDayRadio, setBirthDayRadio] = useState<'everybody' | 'contacts' | 'nobody'>('everybody');
  const [showBirthDayRadio, setShowBirthDayRadio] = useState<'full' | 'day_and_month'>('full');
  const { data, error, mutate } = useFetchWithType<User>('/auth/me');
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
      console.log({
        ...data?.setting,
        [field]: value,
      });
      await patch('/auth/user-setting', {
        ...data?.setting,
        [field]: value,
      });
      await mutate();
    },
    [data],
  );

  return (
    <MainLayout>
      <BackHeader title={t('privacy.Birthday')} />
      <SwrContainer data={data} error={error}>
        <>
          <TypeContainer>
            <TypeLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>{t('privacy.Birthday')}</TypeLabel>
            <Pressable onTouchStart={() => update('sc_birthday', 'public')}>
              <RadioContainer>
                <Radio
                  checked={user?.setting.sc_birthday === 'public'}
                  handleChecked={() => update('sc_birthday', 'public')}
                />
                <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                  {t('privacy.Everybody')}
                </RadioLabel>
              </RadioContainer>
            </Pressable>
            <Pressable onTouchStart={() => update('sc_birthday', 'friends')}>
              <RadioContainer>
                <Radio
                  checked={user?.setting.sc_birthday === 'friends'}
                  handleChecked={() => update('sc_birthday', 'friends')}
                />
                <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                  {t('privacy.My contacts')}
                </RadioLabel>
              </RadioContainer>
            </Pressable>
            <Pressable onTouchStart={() => update('sc_birthday', 'private')}>
              <RadioContainer>
                <Radio
                  checked={user?.setting.sc_birthday === 'private'}
                  handleChecked={() => update('sc_birthday', 'private')}
                />
                <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                  {t('privacy.Nobody')}
                </RadioLabel>
              </RadioContainer>
            </Pressable>
            <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>
              {t('privacy.You can restrict who can see your birthday')}
            </Description>
          </TypeContainer>
          <TypeContainer>
            <TypeLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
              {t('privacy.Show BirthDay')}
            </TypeLabel>
            <Pressable onTouchStart={() => update('sc_show_full_birthday', 1)}>
              <RadioContainer>
                <Radio
                  checked={!!user?.setting.sc_show_full_birthday}
                  handleChecked={() => update('sc_show_full_birthday', 1)}
                />
                <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                  {t('privacy.Show full birthday')}
                </RadioLabel>
              </RadioContainer>
            </Pressable>
            <Pressable onTouchStart={() => update('sc_show_full_birthday', 0)}>
              <RadioContainer>
                <Radio
                  checked={!user?.setting.sc_show_full_birthday}
                  handleChecked={() => update('sc_show_full_birthday', 0)}
                />
                <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                  {t('privacy.Show day and month only')}
                </RadioLabel>
              </RadioContainer>
            </Pressable>
            <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>
              {t('privacy.You can restrict what to show your birthday on the profile')}
            </Description>
          </TypeContainer>
        </>
      </SwrContainer>
    </MainLayout>
  );
}

export default Birthday;
