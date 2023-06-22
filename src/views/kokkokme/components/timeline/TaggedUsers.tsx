import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import styled from 'styled-components';

import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';
import { RADIUS } from 'constants/RADIUS';
import TaggedUserIds from 'types/socials/posts/TaggedUserIds';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '../../../../navigations/MainNavigator';
import User from 'types/auth/User';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

const Container = styled(Row)`
  margin: 5px 0 5px;
  flex-wrap: wrap;
`;
const TextContainer = styled(View)<{ noMargin?: boolean }>`
  background: ${COLOR.GRAY};
  border-radius: ${RADIUS.MD}px;
  margin-right: ${({ noMargin }) => (noMargin ? 0 : 10)}px;
  padding: 1px 7px;
  margin-bottom: 6px;
`;

const Name = styled(Text)`
  color: ${COLOR.BLACK};
  font-size: 15px;
`;

interface Props {
  data: TaggedUserIds[];
}

const TaggedUsers = ({ data }: Props) => {
  const navigation = useNavigation<MainNavigationProp>();
  const myUser: User | null = useAtomValue(userAtom);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
      {data.map((user, i) => (
        <Pressable
          key={user.id}
          onPress={() => {
            navigation.navigate('/kokkokme/user-timeline/:id', {
              id: user.id,
              uid: user.uid,
            });
          }}
        >
          <TextContainer key={user.id} noMargin={i === data.length - 1}>
            <Name style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
              {user.first_name} {user.last_name}
            </Name>
          </TextContainer>
        </Pressable>
      ))}
    </ScrollView>
  );
};

export default TaggedUsers;
