import React, { useState } from 'react';
import { Dimensions, Image, Text, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { COLOR } from 'constants/COLOR';
import { useRoute } from '@react-navigation/native';
import { Column } from 'components/layouts/Column';
import MainLayout from 'components/layouts/MainLayout';
import PrevHeader from 'components/molecules/PrevHeader';

export default function ViewMapPage() {
  const route = useRoute();
  //@ts-ignore
  const locationInfo = route.params?.locationInfo;
  const LATITUDE_DELTA = 0.01; //확대정도
  const LONGITUDE_DELTA = 0.01; //확대정도

  const [formattedAddress] = useState<string>(locationInfo.formattedAddress);
  const [region] = useState<Region>({
    latitude: locationInfo.latitude,
    longitude: locationInfo.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  return (
    <MainLayout>
      <PrevHeader />
      {region && (
        <View>
          <MapView
            style={{
              height: Dimensions.get('window').height,
              width: Dimensions.get('window').width,
            }}
            provider="google"
            showsUserLocation
            initialRegion={{
              latitude: region.latitude,
              longitude: region.longitude,
              latitudeDelta: region.latitudeDelta,
              longitudeDelta: region.longitudeDelta,
            }}
            region={region}
          >
            {formattedAddress ? (
              <Marker
                key={`${region.latitude},${region.longitude}`}
                identifier={`${region.latitude},${region.longitude}`}
                coordinate={{ latitude: region.latitude, longitude: region.longitude }}
              >
                <Column justify="center" align="center">
                  <View
                    style={{
                      borderRadius: 30 / 2,
                      backgroundColor: COLOR.LIGHT_GRAY,
                      padding: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: 'black',
                        fontWeight: 'bold',
                        fontSize: 10,
                      }}
                    >
                      {formattedAddress}
                    </Text>
                  </View>
                  <Image
                    style={{ width: 30, height: 30 }}
                    source={require('assets/chats/chatroom/ic_red_location.png')}
                  />
                </Column>
              </Marker>
            ) : (
              <></>
            )}
          </MapView>
        </View>
      )}
    </MainLayout>
  );
}
