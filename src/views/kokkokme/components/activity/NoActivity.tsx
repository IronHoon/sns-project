import React from 'react';
import styled from 'styled-components/native';
import Activity from 'assets/kokkokme/ic_no_activity.svg';
import { COLOR } from 'constants/COLOR';
import { t } from 'i18next';

const Container = styled.View`
  flex: 1;
  display: flex;
  align-items: center;
  padding-top: 120px;
`;
const Title = styled.Text`
  margin: 20px 0 10px;
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  color: ${(props) => (props.theme.dark ? props.theme.colors.WHITE : props.theme.colors.BLACK)};
`;

const Desc = styled.Text`
  font-size: 14px;
  line-height: 20px;
  color: ${COLOR.TEXT_GRAY};
  text-align: center;
`;

function NoActivity({ me }) {
  return (
    <Container>
      <Activity width={52} height={52} />
      <Title style={{ fontSize: me?.setting?.ct_text_size as number }}>{t('activity.No Activity')}</Title>
      <Desc>{t('activity.There is no activity history')}</Desc>
    </Container>
  );
}

export default NoActivity;
