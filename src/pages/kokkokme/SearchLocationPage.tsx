import React from 'react';
import SearchLocation from '../../views/kokkokme/SearchLocation';
import Screen from '../../components/containers/Screen';
import BackHeader from '../../components/molecules/BackHeader';
import { t } from 'i18next';
import { Likes } from '../../views/kokkokme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp } from '../../navigations/MainNavigator';

const SearchLocationPage = () => {
  const {
    //@ts-ignore
    params: { setIsTagLocation },
  } = useRoute();
  const navigation = useNavigation<MainNavigationProp>();
  return (
    <Screen>
      <BackHeader title={t('common.Location')} />
      <SearchLocation></SearchLocation>
    </Screen>
  );
};

export default SearchLocationPage;
