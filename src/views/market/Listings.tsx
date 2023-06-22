import React, { useState } from 'react';
import BackHeader from '../../components/molecules/BackHeader';
import { TabMenu } from 'components/molecules/tab-menu';
import { LISTINGS } from 'constants/MENU';
import { t } from 'i18next';
import MainLayout from 'components/layouts/MainLayout';
import Item from './components/list/Item';
import styled from 'styled-components/native';
import ListButtons from './components/list/ListButtons';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { useNavigation } from '@react-navigation/native';
import { COLOR } from 'constants/COLOR';
import { ScrollView } from 'react-native';

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

type Props = {
  isMe?: boolean;
};

function Listings({ isMe = true }: Props) {
  const navigation = useNavigation<MainNavigationProp>();
  const [value, setValue] = useState<string>('On sale');

  return (
    <MainLayout>
      {isMe ? (
        <BackHeader title={t('market.Listings')} />
      ) : (
        <BackHeader title={t(`market.View {sellerusername}’s items`)} />
      )}

      <TabMenu menu={LISTINGS} initialValue="On sale" onPress={setValue} />

      <ListWrap>
        {value === 'On sale' && (
          <ScrollView>
            <List>
              {/* // 데이터 받아온뒤 리스트위로 맵돌리기 */}
              <Item more />
              <ButtonWrap>
                <ListButtons width={'49%'} label={t('market.Boost')} borderColorPrimary onPress={() => {}} />
                <ListButtons
                  width={'49%'}
                  label={t('market.Change to Sold')}
                  onPress={() => navigation.navigate('/market/listings/select-buyer')}
                />
              </ButtonWrap>
            </List>
          </ScrollView>
        )}
        {value === 'Sold' && (
          <ScrollView>
            <List>
              <Item sold more />
            </List>
          </ScrollView>
        )}
        {value === 'Hidden' && (
          <ScrollView>
            <List>
              <Item more />
              <ButtonWrap>
                <ListButtons width={'100%'} label={t('market.Unhide')} onPress={() => {}} />
              </ButtonWrap>
            </List>
          </ScrollView>
        )}
      </ListWrap>
    </MainLayout>
  );
}

export default Listings;
