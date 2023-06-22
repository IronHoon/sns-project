import MainLayout from 'components/layouts/MainLayout';
import { COLOR } from 'constants/COLOR';
import { t } from 'i18next';
import React from 'react';
import { Text, View } from 'react-native';
import styled from 'styled-components/native';
import BackHeader from '../../components/molecules/BackHeader';
import UserListItem from './components/list/UserListItem';

const ReviewList = styled.View`
  padding: 20px;
`;
const ReviewTitle = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  padding-bottom: 10px;
`;
const Border = styled.View`
  width: 100%;
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
`;
const List = styled.View`
  padding: 20px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
`;
const UserReview = styled.Text`
  text-align: left;
  color: #999;
  font-size: 14px;
  font-weight: normal;
  padding-top: 6px;
  margin-left: 50px;
`;

function MyReviews() {
  return (
    <MainLayout>
      <BackHeader title={t('market.Reviews')} />

      <ReviewList>
        <Border>
          <ReviewTitle>
            <Text style={{ color: COLOR.PRIMARY }}>2</Text> Reviews
          </ReviewTitle>
        </Border>

        {/* 리스트위로 맵돌리기 */}
        <List>
          <UserListItem iconSize={40} location topButton count={4} />
          <UserReview>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque viverra lorem libero, vitae semper justo
            congue ac. Phasellus et congue augue.
          </UserReview>
        </List>
      </ReviewList>
    </MainLayout>
  );
}

export default MyReviews;
