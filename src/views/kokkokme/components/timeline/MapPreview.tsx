import React, { useRef, useState } from 'react';
import { Alert, Dimensions, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Marker, MarkerDragStartEndEvent, PROVIDER_GOOGLE } from 'react-native-maps';
import styled from 'styled-components';

import Region from 'types/socials/posts/Region';

import Cancel from 'assets/images/icon/ic-close.svg';
import tw from 'twrnc';
import { COLOR } from '../../../../constants/COLOR';
import GeoCoderUtil from '../../../../utils/GeoCoderUtil';
import LogUtil from '../../../../utils/LogUtil';
import { t } from 'i18next';
import { ButtonInput } from '../../../more/components';

const Container = styled(View)`
  height: 220px;
  width: 100%;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
`;

const AddressContainer = styled(View)`
  padding-left: 10px;
  border-color: ${COLOR.GRAY};
  border-width: 1px;
  width: ${`${Dimensions.get('window').width * 0.8}px`};
  justify-content: center;
  padding-bottom: 10px;
  padding-top: 10px;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
`;

const Button = styled(ButtonInput)`
  border-color: black;
  flex: 1;
  height: 100px;
`;
const CancelIcon = styled(Cancel)`
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 0;
`;

const Address = styled(Text)`
  font-size: 15px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

interface Props {
  region: Region;
  address?: string;
  readOnly?: boolean;
  onPressCancel?: () => void;
  onRegionChange?: (e: any) => void;
}

const MapPreview = ({ address, readOnly, region, onPressCancel, onRegionChange }: Props) => {
  const geoCoderUtilRef = useRef(new GeoCoderUtil());

  if (!region.latitude || !region.longitude) {
    return <></>;
  }
  return (
    <Container>
      <View style={styles.container}>
        <AddressContainer>
          {address && <Address>{address?.length > 40 ? address?.substring(0, 37) + '...' : address}</Address>}
        </AddressContainer>
        <View style={tw`flex h-full w-full rounded-bl-lg rounded-br-lg`}>
          <MapView
            // provider={PROVIDER_GOOGLE}
            initialRegion={region}
            showsUserLocation={true}
            showsCompass={true}
            onRegionChange={onRegionChange}
            style={tw`flex h-full w-full`}
          >
            <Marker
              draggable
              coordinate={{
                latitude: region.latitude,
                longitude: region.longitude,
              }}
              onDragEnd={(e: MarkerDragStartEndEvent) => {
                if (onRegionChange) {
                  onRegionChange(e);
                }
              }}
            />
          </MapView>
        </View>
        {!readOnly && (
          <Pressable style={styles.cancelIc} onPress={onPressCancel}>
            <CancelIcon />
          </Pressable>
        )}
      </View>
    </Container>
  );
};

export default MapPreview;

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: Dimensions.get('window').width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  cancelIc: { position: 'absolute', right: -8, top: -25 },
});
