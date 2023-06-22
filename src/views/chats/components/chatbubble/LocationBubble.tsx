import React from 'react';
import { Column } from '../../../../components/layouts/Column';
import GoogleMapUtil from '../../../../utils/GoogleMapUtil';
import MySetting from '../../../../MySetting';
import { Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import FastImage from 'react-native-fast-image';
import LogUtil from '../../../../utils/LogUtil';
import Padding from 'components/containers/Padding';

const Img = styled(FastImage)<{ open: boolean }>`
  width: 100%;
  height: 100%;
  /* aspect-ratio: 1; */
  border-radius: ${({ open }) => (open ? '0px' : '11px')};
`;

const LocationBubble = ({ onPressLocationBubble, formattedAddress, latitude, longitude }) => {
  LogUtil.info('LocationBubble rerender');

  return (
    <TouchableOpacity onPress={() => onPressLocationBubble(formattedAddress, latitude, longitude)}>
      <Column align="center">
        <Img
          style={{
            //@ts-ignore
            resizeMode: 'cover',
            width: 200,
            height: 200,
            marginBottom: 5,
          }}
          source={{
            uri: GoogleMapUtil.image(latitude, longitude, 16, MySetting.googleApiKey),
          }}
        />
        <Text style={{ fontSize: 15 }}>{formattedAddress}</Text>
      </Column>
    </TouchableOpacity>
  );
};

export default React.memo(LocationBubble);
