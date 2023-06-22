import React from 'react';
import Screen from '../../components/containers/Screen';
import { H1 } from 'components/atoms/typography/Heading';
import { View } from 'react-native';
import tw from 'twrnc';
import BackHeader from '../../components/molecules/BackHeader';
import EditPost from 'views/kokkokme/EditPost';
import MainLayout from '../../components/layouts/MainLayout';

function KokKokMeEditPost() {
  return (
    <MainLayout>
      <EditPost></EditPost>
    </MainLayout>
  );
}

export default KokKokMeEditPost;
