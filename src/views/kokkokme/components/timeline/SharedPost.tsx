import React from 'react';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components';

import { COLOR } from 'constants/COLOR';
import { MainNavigationProp } from 'navigations/MainNavigator';
import PostHeader from 'views/kokkokme/components/timeline/PostHeader';
import Images from 'views/kokkokme/components/timeline/Images';
import Content from 'views/kokkokme/components/timeline/Content';
import { useAtomValue } from 'jotai';
import userAtom from '../../../../stores/userAtom';

interface Props {
  data: any;

  searchValue?: string;
}

const Container = styled(View)``;
const Inner = styled(View)`
  border: 1px solid ${COLOR.GRAY};
  margin: 12px 0 3px;
  padding: 15px 15px -25px;
  font-size: 13px;
`;

const Desc = styled(Text)`
  color: ${COLOR.DARK_GRAY};
  font-size: 11px;
`;

const SharedPost = ({ data, searchValue }: Props) => {
  const { id, name, date } = data;
  const { images, content, isShared } = data?.post;
  const navigation = useNavigation<MainNavigationProp>();
  const user = useAtomValue(userAtom);

  const handlePress = () => navigation.navigate('/kokkokme/:id', { id });

  return (
    <Container>
      <Inner>
        <PostHeader name={name} date={date} user={user!} deletePost={() => {}} postId={id} profileImage={''} />
        {!!images?.length && <Images images={images} isShared={true} />}
        <Content content={content} isShared={isShared} searchValue={searchValue} onPress={handlePress} />
      </Inner>
      <Desc>Original post by {name}</Desc>
    </Container>
  );
};

export default SharedPost;
