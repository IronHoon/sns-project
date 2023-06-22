import MainLayout from 'components/layouts/MainLayout';
import BackHeader from 'components/molecules/BackHeader';
import { t } from 'i18next';
import React from 'react';

function SellerProfile() {
  return (
    <MainLayout>
      <BackHeader title={t('market.Profile')} />
    </MainLayout>
  );
}

export default SellerProfile;
