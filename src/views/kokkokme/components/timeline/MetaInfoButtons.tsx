import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components';

import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';

import Comment from 'assets/kokkokme/ic-comment-on.svg';
import LikeOff from 'assets/kokkokme/ic-like-off.svg';
import LikeON from 'assets/kokkokme/ic-like-on.svg';

const IcContainer = styled(Pressable)<{ marginRight?: number }>`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-right: ${({ marginRight }) => marginRight || 0}px;
`;
const TextContainer = styled(View)`
  margin-left: 3px;
`;

const IcText = styled(Text)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: 13px;
  font-weight: 500;
`;

interface Props {
  likes: number;
  comments: number;

  pressComment?: () => void;
  pressLike?: () => void;
  isLiked?: boolean;
}

const MetaInfoButtons = ({ likes, comments, isLiked, pressComment, pressLike = () => {} }: Props) => (
  <Row justify="flex-start">
    <IcContainer marginRight={10} onTouchStart={pressLike}>
      {isLiked ? <LikeON /> : <LikeOff />}
      <TextContainer>
        <IcText>{likes}</IcText>
      </TextContainer>
    </IcContainer>
    <IcContainer onPress={pressComment}>
      <Comment />
      <TextContainer>
        <IcText>{comments}</IcText>
      </TextContainer>
    </IcContainer>
  </Row>
);

export default MetaInfoButtons;
