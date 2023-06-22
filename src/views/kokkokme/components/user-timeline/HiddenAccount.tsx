import { t } from 'i18next';
import React from 'react';
import { Text } from 'react-native';
import styled from 'styled-components';

import { Column } from 'components/layouts/Column';
import { COLOR } from 'constants/COLOR';

import Hidden from 'assets/kokkokme/ic-hidden.svg';

const Container = styled(Column)`
  flex: 1;
  padding-top: 80px;
`;

const Title = styled(Text)`
  color: ${COLOR.BLACK};
  font-size: 18px;
  font-weight: 500;
  margin-top: 11px;
`;

const PrivateAccount = ({ myUser }) => (
  <Container align="center">
    <Hidden />
    <Title style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
      {t('user-timeline.All activities are hidden')}
    </Title>
  </Container>
);

export default PrivateAccount;
