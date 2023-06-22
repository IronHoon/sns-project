import MainLayout from 'components/layouts/MainLayout';
import React from 'react';
import BackHeader from '../../components/molecules/BackHeader';
import { SavedMessages } from '../../views/more';

function SavedMessagesPage() {
  return (
    <MainLayout>
      <BackHeader title="Saved Messages" />
      <SavedMessages />
    </MainLayout>
  );
}

export default SavedMessagesPage;
