import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components';

import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';

import Comment from 'assets/kokkokme/ic-comment-off.svg';
import LikeOff from 'assets/kokkokme/ic-like-off.svg';
import ViewIcon from 'assets/ic-view-22.svg';

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

  itemDetail?: boolean;
  view?: number;
  pressComment?: () => void;
  pressLike?: () => void;
}

const MetaInfoButtons = ({ likes, comments, pressComment, pressLike = () => {}, itemDetail, view }: Props) => (
  <Row>
    {itemDetail ? (
      <>
        <IcContainer marginRight={10} onPress={pressComment}>
          <Comment />
          <TextContainer>
            <IcText>{comments}</IcText>
          </TextContainer>
        </IcContainer>
        <IcContainer marginRight={10} onTouchStart={pressLike}>
          <LikeOff />
          <TextContainer>
            <IcText>{likes}</IcText>
          </TextContainer>
        </IcContainer>
        <IcContainer onPress={() => {}}>
          <ViewIcon />
          <TextContainer>
            <IcText>{view}</IcText>
          </TextContainer>
        </IcContainer>
      </>
    ) : (
      <>
        <IcContainer marginRight={10} onTouchStart={pressLike}>
          <LikeOff />
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
      </>
    )}
  </Row>
);

export default MetaInfoButtons;
