import { useNavigation } from '@react-navigation/native';
import MainLayout from 'components/layouts/MainLayout';
import { COLOR } from 'constants/COLOR';
import { t } from 'i18next';
import { MainNavigationProp } from 'navigations/MainNavigator';
import React from 'react';
import { ScrollView } from 'react-native';
import styled from 'styled-components/native';
import BackHeader from '../../components/molecules/BackHeader';
import Item from './components/list/Item';
import ListButtons from './components/list/ListButtons';

const ListWrap = styled.View``;
const List = styled.View`
  padding: 20px;
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
`;
const ButtonWrap = styled.View`
  padding-top: 20px;
  flex-direction: row;
  justify-content: space-between;
`;

function Purchases() {
  const navigation = useNavigation<MainNavigationProp>();

  return (
    <MainLayout>
      <BackHeader title={t('market.Purchases')} />

      <ListWrap>
        <ScrollView>
          <List>
            {/* // 데이터 받아온뒤 리스트위로 맵돌리기 */}
            <Item sold />
            <ButtonWrap>
              <ListButtons
                width={'100%'}
                label={t('market.Submit Review')}
                borderColorPrimary
                onPress={() => navigation.navigate('/market/purchases/review')}
              />
            </ButtonWrap>
          </List>
        </ScrollView>
      </ListWrap>
    </MainLayout>
  );
}

export default Purchases;
