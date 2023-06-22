import React from 'react';

import { Likes } from 'views/kokkokme';
import Screen from '../../components/containers/Screen';
import BackHeader from '../../components/molecules/BackHeader';
import { t } from 'i18next';

function LikesPage({ route }) {
  const {
    params: { id },
  } = route;
  return (
    <Screen>
      <BackHeader title={t('post-detail.Likes')} />
      <Likes id={id} />
    </Screen>
  );
}

export default LikesPage;
