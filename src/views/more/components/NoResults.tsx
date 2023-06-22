import React from 'react';
import { Text, View } from 'react-native';
import styled from 'styled-components';

import Icon from 'assets/images/icon/ic-noResult.svg';
import { Column } from 'components/layouts/Column';
import { COLOR } from 'constants/COLOR';

interface NoResultsProps {
  searchValue: string;
}

const Wrapper = styled(Column)`
  padding-top: 150px;
`;
const IconContainer = styled(View)`
  height: 52px;
  width: 52px;
`;

const Title = styled(Text)`
  font-size: 18px;
  font-weight: 500;
  margin: 15px 0 7px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const Description = styled(Text)`
  font-size: 14px;
  color: ${COLOR.TEXT_GRAY};
`;
const NoResultsIc = styled(Icon)`
  height: 100%;
  width: 100%;
`;

const NoResults = ({ searchValue }: NoResultsProps) => {
  return (
    <Wrapper align="center" justify="center">
      <IconContainer>
        <NoResultsIc />
      </IconContainer>
      <Title>No Results</Title>
      <Description>There were no results for '{searchValue}'</Description>
    </Wrapper>
  );
};

export default NoResults;
