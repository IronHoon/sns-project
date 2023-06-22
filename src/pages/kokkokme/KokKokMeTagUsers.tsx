import React from 'react';
import Screen from '../../components/containers/Screen';
import { H1 } from 'components/atoms/typography/Heading';
import { View } from 'react-native';
import tw from 'twrnc';
import BackHeader from '../../components/molecules/BackHeader';
import TagUsers from 'views/kokkokme/TagUsers';

function KokKokMeTagUsers({ route }) {
  const {
    params: { tagUsers },
    params: { setTagedUsers },
  } = route;

  return (
    <Screen>
      <View style={tw`flex-1 justify-center items-center`}>
        <TagUsers tagUsers={tagUsers} setTagedUsers={setTagedUsers}></TagUsers>
      </View>
    </Screen>
  );
}

export default KokKokMeTagUsers;
