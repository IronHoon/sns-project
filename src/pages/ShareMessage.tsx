import React from 'react';
import Screen from '../components/containers/Screen';
import { H1 } from 'components/atoms/typography/Heading';
import { View } from 'react-native';
import tw from 'twrnc';
import BackHeader from '../components/molecules/BackHeader';

function ShareMessage() {
  return (
    <Screen>
      <BackHeader />
      <View style={tw`flex-1 justify-center items-center`}>
        <H1>ShareMessage</H1>
      </View>
    </Screen>
  );
}

export default ShareMessage;
