import React, { useState } from 'react';
import { Dimensions, ScrollView, Text, View } from 'react-native';
import styled, { css } from 'styled-components/native';
import Space from '../../components/utils/Space';
import { COLOR } from '../../constants/COLOR';
import { useNavigation, useRoute } from '@react-navigation/native';
import ICFilter from 'assets/ic_filter_22.svg';
import ICCheck from 'assets/ic_check_12.svg';
import ICFloating from 'assets/ic_floating_button.svg';
import { t } from 'i18next';
import MainLayout from 'components/layouts/MainLayout';
import Item from './components/list/Item';
import LogUtil from 'utils/LogUtil';
import MarketHeader from './components/header/MarketHeader';
import { MainNavigationProp } from 'navigations/MainNavigator';
import NavbarLayout from 'components/layouts/NavbarLayout';

const FilterContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 42px;
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
  padding: 5px 20px;
`;

const PostButtonWrap = styled.Pressable`
  position: absolute;
  width: 48px;
  height: 48px;
  right: 40px;
  bottom: 80px;
  border-radius: 48px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
`;

const List = styled.Pressable`
  padding: 20px;
  width: 100%;
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
`;

function MarketMain() {
  const navigation = useNavigation<MainNavigationProp>();
  const { params }: any = useRoute();
  const location = params?.location;
  LogUtil.info('location', location);

  return (
    <NavbarLayout>
      <ScrollView>
        <View style={{ height: Dimensions.get('window').height - 100 }}>
          <MarketHeader location={location} />
          <FilterContainer>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ICFilter />
              <Space width={10} />
              <Text style={{ fontSize: 13, color: '#999999' }}>{t('market.Filter')}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ICCheck />
              <Space width={3} />
              <Text style={{ fontSize: 12, color: '#bbbbbb' }}>{t("market.Don't show sold items")}</Text>
            </View>
          </FilterContainer>

          <View style={{ flex: 1 }}>
            {}
            <List onPress={() => navigation.navigate('/market/item-detail')}>
              <Item />
            </List>

            <PostButtonWrap onPress={() => navigation.navigate('/market/market-post')}>
              <ICFloating />
            </PostButtonWrap>
          </View>
        </View>
      </ScrollView>
    </NavbarLayout>
  );
}

export default MarketMain;
