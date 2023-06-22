import React, { useCallback, useState } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import { Radio } from 'components/atoms/input/Radio';
import { useFetchWithType } from '../../../../net/useFetch';
import User from '../../../../types/auth/User';
import { patch } from '../../../../net/rest/api';
import SwrContainer from '../../../../components/containers/SwrContainer';
import { t } from 'i18next';
import LogUtil from '../../../../utils/LogUtil';
import userAtom from '../../../../stores/userAtom';
import { useAtom } from 'jotai';
import { Pressable } from 'react-native';
import { WIDTH } from 'constants/WIDTH';
import { ScrollView } from 'react-native-gesture-handler';

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
  width: ${WIDTH - 30};
  padding-top: 10px;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
`;

function CallSettings() {
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
      console.log({
        ...meData?.setting,
        [field]: value,
      });
      await patch('/auth/user-setting', {
        ...meData?.setting,
        [field]: value,
      }).then(() => {
        console.log('성공');
      });
      await mutateMe();
    },
    [meData],
  );

  return (
    <MainLayout>
      <BackHeader title={t('privacy.Call')} />
      <ScrollView>
        <TypeContainer>
          <TypeLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>{t('privacy.Voice Call')}</TypeLabel>
          <SwrContainer data={meData} error={meError}>
            <>
              <Pressable onTouchStart={() => update('sc_voice_call', 'public')}>
                <RadioContainer>
                  <Radio
                    checked={user?.setting.sc_voice_call === 'public'}
                    handleChecked={() => update('sc_voice_call', 'public')}
                  />
                  <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                    {t('privacy.Everybody')}
                  </RadioLabel>
                </RadioContainer>
              </Pressable>
              <Pressable onTouchStart={() => update('sc_voice_call', 'friends')}>
                <RadioContainer>
                  <Radio
                    checked={user?.setting.sc_voice_call === 'friends'}
                    handleChecked={() => update('sc_voice_call', 'friends')}
                  />
                  <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                    {t('privacy.My contacts')}
                  </RadioLabel>
                </RadioContainer>
              </Pressable>
              <Pressable onTouchStart={() => update('sc_voice_call', 'private')}>
                <RadioContainer>
                  <Radio
                    checked={user?.setting.sc_voice_call === 'private'}
                    handleChecked={() => update('sc_voice_call', 'private')}
                  />
                  <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                    {t('privacy.Nobody')}
                  </RadioLabel>
                </RadioContainer>
              </Pressable>
            </>
          </SwrContainer>
          <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>
            {t('privacy.You can restrict who can call you by voice call')}
          </Description>
        </TypeContainer>
        <TypeContainer>
          <TypeLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>{t('privacy.Video Call')}</TypeLabel>
          <SwrContainer data={meData} error={meError}>
            <>
              <Pressable onTouchStart={() => update('sc_video_call', 'public')}>
                <RadioContainer>
                  <Radio
                    checked={user?.setting.sc_video_call === 'public'}
                    handleChecked={() => update('sc_video_call', 'public')}
                  />
                  <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                    {t('privacy.Everybody')}
                  </RadioLabel>
                </RadioContainer>
              </Pressable>
              <Pressable onTouchStart={() => update('sc_video_call', 'friends')}>
                <RadioContainer>
                  <Radio
                    checked={user?.setting.sc_video_call === 'friends'}
                    handleChecked={() => update('sc_video_call', 'friends')}
                  />
                  <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                    {t('privacy.My contacts')}
                  </RadioLabel>
                </RadioContainer>
              </Pressable>
              <Pressable onTouchStart={() => update('sc_video_call', 'private')}>
                <RadioContainer>
                  <Radio
                    checked={user?.setting.sc_video_call === 'private'}
                    handleChecked={() => update('sc_video_call', 'private')}
                  />
                  <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                    {t('privacy.Nobody')}
                  </RadioLabel>
                </RadioContainer>
              </Pressable>
            </>
          </SwrContainer>

          <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>
            {t('privacy.You can restrict who call you by video call')}
          </Description>
        </TypeContainer>
        <TypeContainer>
          <TypeLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>{t('privacy.Group Call')}</TypeLabel>
          <SwrContainer data={meData} error={meError}>
            <>
              <Pressable onTouchStart={() => update('sc_group_call', 'public')}>
                <RadioContainer>
                  <Radio
                    checked={user?.setting.sc_group_call === 'public'}
                    handleChecked={() => update('sc_group_call', 'public')}
                  />
                  <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                    {t('privacy.Everybody')}
                  </RadioLabel>
                </RadioContainer>
              </Pressable>
              <Pressable onTouchStart={() => update('sc_group_call', 'friends')}>
                <RadioContainer>
                  <Radio
                    checked={user?.setting.sc_group_call === 'friends'}
                    handleChecked={() => update('sc_group_call', 'friends')}
                  />
                  <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                    {t('privacy.My contacts')}
                  </RadioLabel>
                </RadioContainer>
              </Pressable>
              <Pressable onTouchStart={() => update('sc_group_call', 'private')}>
                <RadioContainer>
                  <Radio
                    checked={user?.setting.sc_group_call === 'private'}
                    handleChecked={() => update('sc_group_call', 'private')}
                  />
                  <RadioLabel style={{ fontSize: user?.setting?.ct_text_size as number }}>
                    {t('privacy.Nobody')}
                  </RadioLabel>
                </RadioContainer>
              </Pressable>
            </>
          </SwrContainer>
          <Description style={{ fontSize: user?.setting?.ct_text_size as number }}>
            {t('privacy.You can restrict who can add you to group call')}
          </Description>
        </TypeContainer>
      </ScrollView>
    </MainLayout>
  );
}

export default CallSettings;
