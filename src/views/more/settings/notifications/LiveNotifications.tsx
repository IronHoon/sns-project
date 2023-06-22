import React, { useCallback } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import { Column } from 'components/layouts/Column';
import { SwitchButton } from 'components/atoms/switch/SwitchButton';
import styled from 'styled-components/native';
import { Row } from 'components/layouts/Row';
import { Radio } from 'components/atoms/input/Radio';
import { patch } from '../../../../net/rest/api';
import { useFetchWithType } from '../../../../net/useFetch';
import User from '../../../../types/auth/User';
import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

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
const RadioLabel = styled.Text`
  font-size: 13px;
  margin-left: 10px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Description = styled.Text`
  font-size: 13px;
  width: 85%;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
`;

function LiveNotifications() {
  const myUser: User | null = useAtomValue(userAtom);
  const { data: meData, error: meError, mutate: mutateMe } = useFetchWithType<User>('/auth/me');
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
      <BackHeader title={t('notifications.Live')} />
      <SwitchContainer>
        <Column style={{ flex: 1 }}>
          <Row style={{ alignItems: 'center' }}>
            <Column style={{ flex: 1 }}>
              <SwitchLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                {t('notifications.Live Start')}
              </SwitchLabel>
              <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                {t('notifications.{username}(@{kokkokname}) started a live video')}
              </Description>
            </Column>
            <SwitchButton
              isEnabled={!!meData?.setting?.nt_sns_live}
              setIsEnabled={() => update('nt_sns_live', meData?.setting?.nt_sns_live ? 0 : 1)}
            />
          </Row>
          {!!meData?.setting?.nt_sns_live && (
            <Column style={{ marginTop: 5 }}>
              <Row style={{ alignItems: 'center', marginVertical: 5 }}>
                <Radio
                  checked={meData?.setting?.nt_sns_live_target === 'everybody'}
                  handleChecked={() => update('nt_sns_live_target', 'everybody')}
                />
                <RadioLabel>{t('notifications.Everybody')}</RadioLabel>
              </Row>
              <Row style={{ alignItems: 'center', marginVertical: 5 }}>
                <Radio
                  checked={meData?.setting?.nt_sns_live_target === 'contacts'}
                  handleChecked={() => update('nt_sns_live_target', 'contacts')}
                />
                <RadioLabel>{t('notifications.My contacts')}</RadioLabel>
              </Row>
            </Column>
          )}
        </Column>
      </SwitchContainer>
      <SwitchContainer>
        <Column style={{ flex: 1 }}>
          <SwitchLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
            {t('notifications.Invitation from Live')}
          </SwitchLabel>
          <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
            {t('notifications.{username}(@{kokkokname}) tagged you on a post')}
          </Description>
        </Column>
        <SwitchButton
          isEnabled={!!meData?.setting?.nt_sns_live_invitation}
          setIsEnabled={() => update('nt_sns_live_invitation', meData?.setting?.nt_sns_live_invitation ? 0 : 1)}
        />
      </SwitchContainer>
    </MainLayout>
  );
}

export default LiveNotifications;
