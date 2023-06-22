import MainLayout from 'components/layouts/MainLayout';
import { COLOR } from 'constants/COLOR';
import { t } from 'i18next';
import React from 'react';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import BackHeader from '../../components/molecules/BackHeader';
import Item from './components/list/Item';

const ListWrap = styled.View``;
const List = styled.View`
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
`;

function Saved() {
  return (
    <MainLayout>
      <BackHeader title={t('market.Saved')} />

      <ListWrap>
        <ScrollView>
          {/* // 데이터 받아온뒤 리스트위로 맵돌리기 */}
          <List>
            <Item like />
          </List>
        </ScrollView>
      </ListWrap>
    </MainLayout>
  );
}

export default Saved;
