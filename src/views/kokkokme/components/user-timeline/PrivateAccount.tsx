import { t } from 'i18next';
import React from 'react';
import { Text } from 'react-native';
import styled from 'styled-components';

import { Column } from 'components/layouts/Column';
import { COLOR } from 'constants/COLOR';

import Private from 'assets/kokkokme/ic-private.svg';
import { ScrollView } from 'react-native-gesture-handler';

const Container = styled(Column)`
  flex: 1;
  padding-top: 80px;
`;

const Title = styled(Text)`
  color: ${COLOR.BLACK};
  font-size: 18px;
  font-weight: 500;
  margin-top: 7px;
`;
const Desc = styled(Text)`
  color: ${COLOR.TEXT_GRAY};
  font-size: 14px;
  margin-top: 9px;
  padding-bottom: 80px;
`;

const PrivateAccount = ({ myUser }) => (
  <Container align="center">
    <Private />
    <Title style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('common.Private Account')}</Title>
    <Desc style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
      {t('user-timeline.Follow this account to see all activities')}
    </Desc>
  </Container>
);

export default PrivateAccount;
