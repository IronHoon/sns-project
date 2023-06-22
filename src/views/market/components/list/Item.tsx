import { COLOR } from 'constants/COLOR';
import React, { useState } from 'react';
import styled from 'styled-components/native';
import More from 'assets/kokkokme/ic-more.svg';
import MetaInfoButtons from './MetaInfoButtons';
import { Options } from 'components/modal';
import { EDIT_HIDE_DEL } from 'constants/MENU';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { useNavigation } from '@react-navigation/native';
import { t } from 'i18next';

import LikeOff from 'assets/kokkokme/ic-like-off.svg';
import LikeON from 'assets/kokkokme/ic-like-on.svg';

const Container = styled.View`
  flex-direction: row;
`;
const ItemImage = styled.Image`
  border: 1px solid ${COLOR.GRAY};
  width: 102px;
  height: 102px;
  border-radius: 10px;
`;
const TextWrap = styled.View`
  padding-left: 15px;
  padding-top: 5px;
  flex: 1;
`;
const TitleWrap = styled.View`
  position: relative;
`;
const Title = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const DateText = styled.Text`
  font-size: 12px;
  font-weight: normal;
  color: #bbb;
  padding-top: 2px;
`;
const PriceText = styled.Text`
  font-size: 13px;
  font-weight: bold;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const ButtonWrap = styled.View`
  padding-top: 12px;
  flex-direction: row-reverse;
`;
const MoreButton = styled.Pressable`
  position: absolute;
  right: 0px;
  width: 22px;
`;
const LikeButton = styled.Pressable`
  position: absolute;
  right: 0px;
  width: 22px;
`;
const MoreIc = styled(More)`
  fill: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  transform: rotate(90deg);
`;
const SoldTag = styled.View`
  border-radius: 3px;
  background-color: #bbb;
  width: 36px;
  height: 18px;
  align-items: center;
  justify-content: center;
  margin-right: 5px;
`;
const SoldTagText = styled.Text`
  color: #fff;
  font-size: 12px;
`;
const SoldTagTextWrap = styled.View`
  flex-direction: row;
  align-items: center;
  padding-top: 7px;
`;

type ItemProps = {
  sold?: boolean;
  like?: boolean;
  more?: boolean;
  isLiked?: boolean;
};

function Item({ isLiked = true, more, sold, like }: ItemProps) {
  const navigation = useNavigation<MainNavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [soldModalVisible, setSoldModalVisible] = useState(false);
  const openOptions = (bool: boolean) => setModalVisible(bool);
  const openSoldOptions = (bool: boolean) => setSoldModalVisible(bool);

  const handleMenuPress = async (value?: string) => {
    if (value === 'Edit') {
      // navigation.navigate('');
    }
    if (value === 'Hide') {
      // navigation.navigate('');
    }
    if (value === 'Delete') {
      // navigation.navigate('');
    }
  };

  const handleSoldMenuPress = async (value?: string) => {
    if (value === 'Edit') {
      // navigation.navigate('');
    }
    if (value === 'Hide') {
      // navigation.navigate('');
    }
    if (value === 'Delete') {
      // navigation.navigate('');
    }
  };
  return (
    <>
      <Container>
        <ItemImage source={require('assets/ic-no-result.svg')} />
        <TextWrap>
          <TitleWrap>
            <Title>Title</Title>
            {like && <LikeButton>{isLiked ? <LikeON /> : <LikeOff />}</LikeButton>}
            {more && (
              <MoreButton onPress={() => (sold ? openSoldOptions(true) : openOptions(true))}>
                <MoreIc />
              </MoreButton>
            )}
          </TitleWrap>
          <DateText>1day ago</DateText>

          <SoldTagTextWrap>
            {sold && (
              <SoldTag>
                <SoldTagText>Sold</SoldTagText>
              </SoldTag>
            )}
            <PriceText>₭38000 LAK</PriceText>
          </SoldTagTextWrap>
          <ButtonWrap>
            <MetaInfoButtons likes={0} comments={0} />
          </ButtonWrap>
        </TextWrap>
      </Container>

      <Options
        menu={EDIT_HIDE_DEL}
        modalVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onMenuPress={handleMenuPress}
        onPress={openOptions}
      />
      <Options
        menuTitle={t('market.Change to On sale')}
        menu={EDIT_HIDE_DEL}
        modalVisible={soldModalVisible}
        onBackdropPress={() => setSoldModalVisible(false)}
        onMenuPress={handleSoldMenuPress}
        onPress={openSoldOptions}
      />
    </>
  );
}

export default Item;
