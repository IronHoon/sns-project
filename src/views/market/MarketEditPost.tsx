import MainLayout from 'components/layouts/MainLayout';
import { t } from 'i18next';
import React from 'react';
import BackHeader from '../../components/molecules/BackHeader';

function MarketEditPost() {
  return (
    <MainLayout>
      <BackHeader title={t('market.Post For Sale')} />
    </MainLayout>
  );
}

export default MarketEditPost;
