import React from 'react';
import Screen from '../../components/containers/Screen';
import { View } from 'react-native';
import tw from 'twrnc';
import BackHeader from '../../components/molecules/BackHeader';
import Registered from '../../views/auth/Registered';
import { t } from 'i18next';

function RegisteredPage() {
  return (
    <Screen>
      <BackHeader title={t('sign-up.Verification Account')} />
      <View style={tw`flex-1 items-center`}>
        <Registered />
      </View>
    </Screen>
  );
}

export default RegisteredPage;
