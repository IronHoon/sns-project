import React from 'react';
import Search from 'views/kokkokme/Search';
import Screen from '../../components/containers/Screen';
import HashResult from '../../views/kokkokme/components/search/HashResult';
import BackHeader from '../../components/molecules/BackHeader';
import { useRoute } from '@react-navigation/native';

function KokKokMeSearchHash() {
  return <HashResult />;
}

export default KokKokMeSearchHash;
