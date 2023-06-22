import MainLayout from 'components/layouts/MainLayout';
import BackHeader from 'components/molecules/BackHeader';
import { COLOR } from 'constants/COLOR';
import { t } from 'i18next';
import React from 'react';
import styled from 'styled-components/native';

import NoResultIc from 'assets/kokkokme/ic-no-result.svg';
import User from 'types/auth/User';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
const Container = styled.View`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: flex-start;
  padding-top: 120px;
`;

const Title = styled.Text`
  color: ${(props) => (props.theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: 18px;
  font-weight: 500;
  margin: 15px 0 7px;
`;
const Desc = styled.Text`
  color: ${COLOR.TEXT_GRAY};
  font-size: 14px;
`;

type NoResultPostType = {
  type?: number;
};

const NoResultPost = ({ type }: NoResultPostType) => {
  const myUser: User | null = useAtomValue(userAtom);
  return (
    <Container>
      <NoResultIc />
      <Title style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
        {type === 403 ? t('common.Private Account') : t('common.No Results')}
      </Title>
      <Desc style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
        {type === 403
          ? t('user-timeline.Follow this account to see all activities')
          : t('common.The posting has been deleted or does not exist')}
      </Desc>
    </Container>
  );
};

export default NoResultPost;
