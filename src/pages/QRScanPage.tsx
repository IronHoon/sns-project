import React from 'react';
import { Dimensions, SafeAreaView, View } from 'react-native';
import BackHeader from '../components/molecules/BackHeader';
import QRScan from '../views/QRScan';

const QRScanPage = () => {
  return (
    <>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          margin: 0,
          height: Dimensions.get('window').height + 100,
          backgroundColor: '#Fff',
        }}
      >
        <SafeAreaView>
          <QRScan></QRScan>
        </SafeAreaView>
      </View>
    </>
  );
};

export default QRScanPage;
