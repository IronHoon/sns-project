import MainLayout from 'components/layouts/MainLayout';
import { COLOR } from 'constants/COLOR';
import { t } from 'i18next';
import React, { useState } from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import styled from 'styled-components/native';
import BackHeader from '../../components/molecules/BackHeader';
import TopTitleItem from './components/TopTitleItem';
import StarButton from './components/StarButton';
import { Button } from 'components/atoms/button/Button';

const ItemWrap = styled.View`
  width: 100%;
  height: ${Dimensions.get('window').height};
  position: relative;
`;
const ReviewWrap = styled.View`
  align-items: center;
  padding: 20px;
  width: 100%;
`;
const StarTitle = styled.Text`
  align-items: center;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  max-width: 294px;
  text-align: center;
  padding-top: 60px;
  padding-bottom: 30px;
`;

const StarButtonWrap = styled.View``;
const CommentWrap = styled.View`
  text-align: left;
  width: 100%;
  margin-bottom: 30px;
  padding: 0 20px;
  position: absolute;
  bottom: 106px;
`;
const CommentTitle = styled.Text`
  font-size: 16px;
  font-weight: normal;
  color: ${(props) => (props.theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

const TextInputWrap = styled.View`
  width: 100%;
  padding: 10px;
  height: 150px;
  border: solid 1px ${COLOR.GRAY};
  margin-top: 10px;
  margin-bottom: 30px;
`;
const Input = styled.TextInput`
  padding-right: 70px;
  width: 100%;
  height: 100%;
`;

function Review({ username = 'buyerusername', sellername = 'sellername' }) {
  const [starCount, setStarCount] = useState(true);
  const [value, setValue] = useState('');

  const onChange = (event) => {
    setValue(event.nativeEvent.text);
  };

  return (
    <MainLayout>
      <BackHeader title={t('market.Review')} />

      <ItemWrap>
        {/* 상단 타이틀 상품 */}
        <TopTitleItem review sellerusername={'name'} />

        <ScrollView>
          <ReviewWrap>
            <StarTitle>
              {username}, {t('market.how was your deal with')} <Text style={{ color: '#f68722' }}>{sellername}</Text>?
            </StarTitle>

            <StarButtonWrap>
              <StarButton />
            </StarButtonWrap>
          </ReviewWrap>

          {starCount && (
            <CommentWrap>
              <CommentTitle>{t('market.Comment(optional)')}</CommentTitle>

              <TextInputWrap>
                <Input style={{ textAlignVertical: 'top' }} multiline={true} value={value} onChange={onChange} />
              </TextInputWrap>

              <Button label={t('market.SUBMIT')} height={60} borderRadius />
            </CommentWrap>
          )}
        </ScrollView>
      </ItemWrap>
    </MainLayout>
  );
}

export default Review;
