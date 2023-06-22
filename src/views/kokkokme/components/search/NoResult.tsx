import { t } from 'i18next';
import React from 'react';
import { Text, View } from 'react-native';
import styled from 'styled-components';

import { COLOR } from 'constants/COLOR';

import NoResultIc from 'assets/kokkokme/ic-no-result.svg';
import User from 'types/auth/User';
import userAtom from 'stores/userAtom';
import { useAtomValue } from 'jotai';

const Container = styled(View)`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: flex-start;
  padding-top: 120px;
`;

const Title = styled(Text)`
  color: ${COLOR.BLACK};
  font-size: 18px;
  font-weight: 500;
  margin: 15px 0 7px;
`;
const Desc = styled(Text)`
  color: ${COLOR.TEXT_GRAY};
  font-size: 14px;
`;

interface Props {
  value: string;
}

const NoResult = ({ value }: Props) => {
  const myUser: User | null = useAtomValue(userAtom);

  return (
    <Container>
      <NoResultIc />
      <Title style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('common.No Results')}</Title>
      <Desc style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
        {t('common.There were no results for')} '{value}'
      </Desc>
    </Container>
  );
};

export default NoResult;
