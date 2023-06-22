import MainLayout from 'components/layouts/MainLayout';
import React from 'react';
import Listings from './Listings';

function SellerItems() {
  return (
    <MainLayout>
      <Listings isMe={false} />
    </MainLayout>
  );
}

export default SellerItems;
