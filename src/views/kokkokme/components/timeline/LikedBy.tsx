import React from 'react';
import { Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components';

import { COLOR } from 'constants/COLOR';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { t } from 'i18next';
import User from 'types/auth/User';

const Desc = styled(Text)`
  color: ${COLOR.TEXT_GRAY};
  font-size: 11px;
  margin-top: 3px;
`;
const Strong = styled(Text)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-weight: 500;
`;

interface Props {
  myUser: User;
  count: number;
  likedBy: string;
  postId: string;
}

const LikedBy = ({ myUser, count, likedBy, postId }: Props) => {
  const navigation = useNavigation<MainNavigationProp>();

  return (
    <Pressable onPress={() => navigation.navigate('/kokkokme/likes/:id', { id: postId })}>
      <Desc style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
        {t('kokkokme-main.Liked by')} <Strong>{likedBy}</Strong>
        {count > 1 && t('kokkokme-main.and others')}
      </Desc>
    </Pressable>
  );
};

export default LikedBy;
