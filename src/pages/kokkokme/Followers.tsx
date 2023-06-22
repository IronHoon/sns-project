import React from 'react';
import Screen from '../../components/containers/Screen';
import { H1 } from 'components/atoms/typography/Heading';
import { View } from 'react-native';
import tw from 'twrnc';
import BackHeader from '../../components/molecules/BackHeader';
import FollowersList from 'views/kokkokme/FollowersList';
import { useRoute } from '@react-navigation/native';

function Followers() {
  const {
    // @ts-ignore
    params: { name },
  } = useRoute();
  return (
    <Screen>
      <BackHeader name={name} />
      <View style={tw`flex-1 justify-center items-center`}>
        <FollowersList></FollowersList>
      </View>
    </Screen>
  );
}

export default Followers;
