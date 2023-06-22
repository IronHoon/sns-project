import React from 'react';

import BackHeader from 'components/molecules/BackHeader';
import Screen from 'components/containers/Screen';
import { PostDetail } from 'views/kokkokme';
import { Text } from 'react-native';

function KokKokMeDetailPage({ route }) {
  const {
    params: { id },
  } = route;

  return (
    <Screen>
      <BackHeader />
      <PostDetail id={id} />
    </Screen>
  );
}

export default KokKokMeDetailPage;
