import MainLayout from 'components/layouts/MainLayout';
import { COLOR } from 'constants/COLOR';
import { t } from 'i18next';
import React from 'react';
import styled from 'styled-components/native';
import BackHeader from '../../components/molecules/BackHeader';
import UserListItem from './components/list/UserListItem';
import TopTitleItem from './components/TopTitleItem';

const ListWrap = styled.View``;
const List = styled.View`
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
`;

function SelectBuyer() {
  return (
    <MainLayout>
      <BackHeader title={t('market.Select buyer')} />

      <ListWrap>
        {/* 상단 타이틀 상품 */}
        <TopTitleItem sold />

        {/* // 데이터 받아온뒤 리스트위로 맵돌리기 */}
        <List>
          <UserListItem />
        </List>
      </ListWrap>
    </MainLayout>
  );
}

export default SelectBuyer;
