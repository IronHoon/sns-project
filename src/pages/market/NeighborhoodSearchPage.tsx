import React from 'react';
import Screen from '../../components/containers/Screen';
import { H1 } from 'components/atoms/typography/Heading';
import { View } from 'react-native';
import tw from 'twrnc';
import BackHeader from '../../components/molecules/BackHeader';
import NeighborhoodSearch from '../../views/market/NeighborhoodSearch';

function NeighborhoodSearchPage() {
  return (
    <Screen>
      <NeighborhoodSearch />
    </Screen>
  );
}

export default NeighborhoodSearchPage;
