import React from 'react';

import { Activity } from 'views/kokkokme';
import Screen from '../../components/containers/Screen';
import BackHeader from '../../components/molecules/BackHeader';
import { t } from 'i18next';

function ActivityPage() {
  return (
    <Screen>
      <BackHeader title={t('activity.Activity')} />
      <Activity />
    </Screen>
  );
}

export default ActivityPage;
