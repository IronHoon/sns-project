import React from 'react';
import { Text, View } from 'react-native';
import styled from 'styled-components/native';

import { COLOR } from 'constants/COLOR';

import NoResultIc from 'assets/kokkokme/ic-no-result.svg';
import { t } from 'i18next';

const Container = styled.View`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: flex-start;
  padding-top: 120px;
`;

const Title = styled.Text<{ fontSize?: number }>`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize + 3}px` : '18px')};
  font-weight: 500;
  margin: 15px 0 7px;
`;
const Desc = styled.Text<{ fontSize?: number }>`
  color: ${COLOR.TEXT_GRAY};
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize - 1}px` : '14px')};
`;

interface Props {
  value: string;
  fontSize?: number;
}

const NoResult = ({ value, fontSize }: Props) => (
  <Container>
    <NoResultIc />
    <Title fontSize={fontSize}>{t('common.No Results')}</Title>
    <Desc fontSize={fontSize}>
      {t('common.There were no results for')} '{value}'
    </Desc>
  </Container>
);

export default NoResult;
