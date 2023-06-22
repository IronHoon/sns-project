import React from 'react';
import BackHeader from '../components/molecules/BackHeader';
import { useRoute } from '@react-navigation/native';
import MainLayout from 'components/layouts/MainLayout';
import WebView from 'react-native-webview';
import userAtom from 'stores/userAtom';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

function getURI(title) {
  switch (title) {
    case 'Terms of Service':
      return 'https://docs.google.com/document/d/1z4jC7RB7MaHSaMu_gYk-TaJBDNdwM0y8VJi-z0-uICI/edit?usp=sharing';
    case 'ເງື່ອນໄຂການໃຫ້ບໍລິການ':
      return 'https://docs.google.com/document/d/1Sv3liTw1398gA5xNfexWJYts6emPOvKEEpdkkt_4cyI/edit?usp=sharing';
    case 'Support Center':
      return 'https://living-bowl-f8a.notion.site/Support-Center-5be37da7fcf14ad1b0a66523a6b7f2bc';
    case 'Licenses':
      return 'https://living-bowl-f8a.notion.site/Licenses-6885340530764fa5a8a27d95fda8ef92';
    default:
      return 'https://living-bowl-f8a.notion.site/Terms-of-Service-4519e155aa0c416cb18e9f15bb7f57a1';
  }
}
// TODO: 실제 노션 주소로 교체 필요

function Webview() {
  const { params } = useRoute();
  const { i18n } = useTranslation();

  //@ts-ignore
  const title = params.title ?? 'Terms of Service';
  return (
    <MainLayout>
      <BackHeader title={title} />
      <WebView source={{ uri: getURI(title) }} />
    </MainLayout>
  );
}

export default Webview;
