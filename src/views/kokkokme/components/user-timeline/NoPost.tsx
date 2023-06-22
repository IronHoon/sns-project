import { t } from 'i18next';
import React from 'react';
import { Text, View } from 'react-native';
import styled from 'styled-components';

import { COLOR } from 'constants/COLOR';
import User from 'types/auth/User';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

const Container = styled(View)`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
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

const NoPost = ({ myUser }) => {
  return (
    <Container>
      <Title style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('user-timeline.No Post')}</Title>
      <Desc style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
        {t('user-timeline.There were no posts')}
      </Desc>
    </Container>
  );
};

export default NoPost;
