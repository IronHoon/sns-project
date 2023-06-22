import { t } from 'i18next';
import React, { useState } from 'react';
import { Dimensions, Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components';

import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import { Avatar } from 'components/atoms/image';
import { Column } from 'components/layouts/Column';
import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';
import { MainNavigationProp } from 'navigations/MainNavigator';

import Check from 'assets/kokkokme/ic-check.svg';
import { useFetchWithType } from '../../../../net/useFetch';
import User from '../../../../types/auth/User';
import { post, remove } from '../../../../net/rest/api';
import { useAtom, useAtomValue } from 'jotai';
import userAtom from '../../../../stores/userAtom';
import { useSetAtom } from 'jotai';
import profileDetailUidAtom from 'stores/profileDetailUidAtom';
import { WIDTH } from 'constants/WIDTH';

const Container = styled(Row)`
  /* height: 60px; */
`;
const TextContainer = styled(Column)`
  margin-left: 15px;
  width: 165px;
  padding: 10px 0;
  text-overflow: ellipsis;
`;

const Name = styled(Text)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: 15px;
  font-weight: 500;
`;
const KokkokName = styled(Text)`
  color: ${COLOR.TEXT_LIGHT_GRAY};
  font-size: 13px;
`;

const PressableWrap = styled(Pressable)`
  width: ${`${Dimensions.get('window').width - 160}px`};
  text-overflow: ellipsis;
`;
type IFollowStatus = 'following' | 'followingBack' | 'requested';

interface Props {
  followStatus: IFollowStatus;
  name: string;
  profileImage: string;
  uid: string;
  me: boolean;
  followingId?: number;
  itemId?: number;
  onCancelFollow?: () => void;
  onCancelRequest?: (itemId: number, followingId: number) => void;
  onFollowBack?: () => void;
  onRequestFollow?: (itemId: number, followingId: number) => void;
}

const ResultBlock = ({
  me,
  followingId = 0,
  followStatus,
  itemId = 0,
  name,
  profileImage = '',
  uid,
  onCancelFollow,
  onCancelRequest,
  onFollowBack,
  onRequestFollow,
}: Props) => {
  const setCurrentProfileUid = useSetAtom(profileDetailUidAtom);
  const navigation = useNavigation<MainNavigationProp>();
  const user = useAtomValue(userAtom);
  const {
    data: userData,
    error: userError,
    mutate: userMutate,
  } = useFetchWithType<User>(uid ? `auth/users/detail?uid=${uid}` : '');
  return (
    <Container align="center" justify="space-between">
      <PressableWrap
        onPress={() => {
          setCurrentProfileUid(uid);
          navigation.navigate('/profile-detail');
        }}
      >
        <Row align="center">
          <Avatar src={profileImage} />
          <TextContainer>
            <Name style={{ fontSize: user?.setting?.ct_text_size as number }} numberOfLines={2}>
              {name}
            </Name>
            <KokkokName style={{ fontSize: user?.setting?.ct_text_size as number }} numberOfLines={1}>
              @{uid}
            </KokkokName>
          </TextContainer>
        </Row>
      </PressableWrap>
      {user?.id !== userData?.id && !userData?.following && (
        <Button
          borderRadius
          fontSize={13}
          height={32}
          label={me ? `${t('follower-list.Following Back')}` : `${t('follower-list.Follow')}`}
          width={120}
          onPress={() => {
            post('/socials/follows', {
              follower_id: userData?.id,
            }).then(async (res) => {
              await userMutate();
            });
          }}
        />
      )}
      {user?.id !== userData?.id && !!userData?.following && (
        <Button
          borderRadius
          fontSize={13}
          height={32}
          label={userData?.following.status === 'private' ? t('follower-list.Requested') : t('common.Following')}
          textvariant={ButtonTextVariant.OutlinedText}
          variant={ButtonVariant.Outlined}
          width={120}
          onPress={() => {
            remove(`/socials/follows/${userData?.id}`).then(async () => {
              console.log('성공');
              await userMutate();
            });
          }}
        >
          <Check />
        </Button>
      )}
    </Container>
  );
};

export default ResultBlock;
