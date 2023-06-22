import React from 'react';
import { H1 } from 'components/atoms/typography/Heading';
import { View } from 'react-native';
import tw from 'twrnc';
import BackHeader from '../../components/molecules/BackHeader';
import NavbarLayout from 'components/layouts/NavbarLayout';

function MediaMain() {
  return (
    <NavbarLayout>
      <View style={tw`flex-1 justify-center items-center`}>
        <H1>MediaMain</H1>
      </View>
    </NavbarLayout>
  );
}

export default MediaMain;
