import { COLOR } from 'constants/COLOR';
import React from 'react';
import styled from 'styled-components/native';

const Container = styled.View<TopTitleItemProps>`
  flex-direction: row;
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
  padding: 20px;
  ${({ sold }) => (sold ? `background-color: #f8f8f8;` : `${(props) => (props.theme.dark ? '#000' : '#fff')}`)}
`;
const ItemImage = styled.Image`
  border: 1px solid ${COLOR.GRAY};
  width: 40px;
  height: 40px;
  border-radius: 4px;
`;
const ItemInfo = styled.View`
  margin-left: 12px;
`;
const TitleWrap = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;
const SubTag = styled.Text<{ sale: boolean }>`
  font-size: 12px;
  font-weight: 500;
  font-stretch: normal;
  color: ${({ sale }) => (sale ? COLOR.PRIMARY : '#bbb')};
  margin-right: 7px;
`;
//TODO : 글넘침 이클립스 추가
const Title = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${(props) => (props.theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const PriceText = styled.Text`
  font-size: 14px;
  font-weight: normal;
  color: #999;
  padding-top: 3px;
`;
const SubText = styled.Text`
  font-size: 14px;
  font-weight: normal;
  color: #999;
  padding-top: 3px;
`;

type TopTitleItemProps = {
  sold?: boolean;
  sale?: boolean;
  review?: boolean;
  sellerusername?: string;
};

const TopTitleItem = ({ sold, sale, review, sellerusername }: TopTitleItemProps) => {
  return (
    <Container sold={sold}>
      <ItemImage source={require('assets/ic-no-result.svg')} />
      <ItemInfo>
        <TitleWrap>
          {sold && <SubTag sale={false}>Sold</SubTag>}
          {sale && <SubTag sale={true}>On sale</SubTag>}
          <Title>DTitle Lorem Ipsum</Title>
        </TitleWrap>
        {review ? <SubText>Deal made with {sellerusername}</SubText> : <PriceText>₭38000 LAK</PriceText>}
      </ItemInfo>
    </Container>
  );
};

export default TopTitleItem;
