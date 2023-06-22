import React from 'react';
import styled from 'styled-components';
import { View, Text, Pressable } from 'react-native';
import LocationIcon from 'assets/kokkokme/new-post/ic_location.svg';
import { COLOR } from '../../../../constants/COLOR';

const LocationContainer = styled(View)`
  flex-direction: row;
  align-items: center;
  padding-top: 5px;
  padding-bottom: 5px;
`;

const Region = styled(Text)`
  color: ${COLOR.PRIMARY};
`;

const Location = ({ region, onPress, isMap }) => {
  return (
    <Pressable
      onPress={() => {
        onPress(!isMap);
      }}
    >
      <LocationContainer>
        <LocationIcon></LocationIcon>
        <Region>{region.length > 45 ? region.substring(0, 42) + '...' : region}</Region>
      </LocationContainer>
    </Pressable>
  );
};

export default Location;
