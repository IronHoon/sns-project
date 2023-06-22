import React from 'react';
import styled from 'styled-components/native';
import NoResult from 'assets/ic-no-result.svg';
import { COLOR } from 'constants/COLOR';
import { t } from 'i18next';

const Container = styled.View`
  flex: 1;
  display: flex;
  align-items: center;
  padding-top: 100px;
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

function NoResults({ searchText }) {
  return (
    <Container>
      <NoResult width={52} height={52} />
      <Title>{t('common.No Results')}</Title>
      <Desc>
        {t('common.There were no results for')} '{searchText}'
      </Desc>
    </Container>
  );
}

export default NoResults;
