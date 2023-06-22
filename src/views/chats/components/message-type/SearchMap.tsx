import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import LogUtil from 'utils/LogUtil';
import PermissionUtil from 'utils/PermissionUtil';
import { PERMISSIONS } from 'react-native-permissions';
import Button from 'components/atoms/MButton';
import GeoCoderUtil from 'utils/GeoCoderUtil';
import { useTranslation } from 'react-i18next';
import { EventRegister } from 'react-native-event-listeners';
import { COLOR } from 'constants/COLOR';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { uploadS3ByFilePath } from 'lib/uploadS3';
import { Column } from 'components/layouts/Column';
import BackHeader from 'components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';

type CallbackType = { formattedAddress: string; region: Region; filePath: string };
type Callback = (data: CallbackType) => void;
export class SearchMapCallback {
  static listenerId?: string | boolean;
  eventName = 'search-map-callback';
  constructor(callback: Callback) {
    this.remove();
    this.add(callback);
  }

  add(callback: Callback) {
    if (!SearchMapCallback.listenerId) {
      SearchMapCallback.listenerId = EventRegister.addEventListener(this.eventName, callback);
    }
  }
  remove() {
    if (SearchMapCallback.listenerId && typeof SearchMapCallback.listenerId === 'string') {
      EventRegister.removeEventListener(SearchMapCallback.listenerId);
      SearchMapCallback.listenerId = undefined;
    }
  }

  emit({ formattedAddress, region, filePath }: CallbackType) {
    EventRegister.emit(this.eventName, { formattedAddress, region, filePath });
  }
}

export default function SearchMap() {
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute();
  //@ts-ignore
  const searchMapCallback = route.params?.callback as SearchMapCallback | undefined;

  const INIT_LATITUDE = 35.39673755350146;
  const INIT_LONGITUDE = 127.71844625473022;
  const LATITUDE_DELTA = 0.01; //확대정도
  const LONGITUDE_DELTA = 0.01; //확대정도

  const { t } = useTranslation();
  const [formattedAddress, setFormattedAddress] = useState<string>('');
  const [region, setRegion] = useState<Region>();

  useEffect(() => {
    PermissionUtil.requestPermission(
      Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_ALWAYS : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ).then(() => {
      Geolocation.getCurrentPosition(
        (pos) => {
          setRegion({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          });
          // setFormattedAddress(result.formatted_address);
        },
        (error) => {
          console.warn('error', error);
          Alert.alert('', 'Location permission is denied,\nplease allow location permission', [
            { onPress: () => navigation.goBack() },
          ]);
        },
        {
          enableHighAccuracy: true,
          timeout: 3600,
          maximumAge: 3600,
        },
      );
    });
  }, []);

  const [searchWord, setSearchWord] = useState('');
  const [showInfo, setShowInfo] = useState(true);
  const geoCoderUtilRef = useRef(new GeoCoderUtil());
  const mapRef = useRef(null);

  const onPressPoint = async () => {
    if (region) {
      try {
        setShowInfo(false);
        const uri = await captureRef(mapRef, {
          format: 'jpg',
          quality: 1,
        });
        searchMapCallback?.emit({ formattedAddress: formattedAddress, region: region, filePath: uri });
      } catch (error) {
        LogUtil.error('SearchMap captureRef error', error);
      }
    }
    navigation.goBack();
  };

  return (
    <MainLayout>
      <BackHeader />
      {region && (
        <View>
          <View>
            <TextInput
              style={{ height: 50, backgroundColor: '#d3d3d3', padding: 5 }}
              placeholder={t('search-map.Search')}
              onChangeText={(text): void => setSearchWord(text)}
            />
            <Button
              onPress={() => {
                // LogUtil.info('SearchMap request query', searchWord);
                geoCoderUtilRef.current
                  .addressToLocation(searchWord)
                  .then((res) => {
                    const results: Array<any> = res.results;
                    const result = results[0];

                    setRegion({
                      latitude: result.geometry.location.lat,
                      longitude: result.geometry.location.lng,
                      latitudeDelta: LATITUDE_DELTA,
                      longitudeDelta: LONGITUDE_DELTA,
                    });
                    setFormattedAddress(result.formatted_address);
                  })
                  .catch((error) => {
                    /*
NOT_INITIATED	0:	Module hasn't been initiated. Call init function, and pass it your app's api key as parameter.
INVALID_PARAMETERS	1:	Parameters are invalid.
FETCHING	2:	Error wile fetching to server. The error's 'origin' property contains the fetch error.
PARSING	3:	Error while parsing server response. The error's 'origin' property contains the response.
SERVER	4:	Error from the server. The error's 'origin' property contains the response's body.
                */
                    if (error.code === 4 && error.origin.status === 'ZERO_RESULTS') {
                      Alert.alert('', t('search-map.NotFound'));
                    } else {
                      LogUtil.error('SearchMap query error', error);
                    }
                  });
              }}
            >
              {t('search-map.Search')}
            </Button>
          </View>
          <View>
            <MapView
              ref={mapRef}
              style={{
                height: Dimensions.get('window').height,
                width: Dimensions.get('window').width,
              }}
              provider="google"
              showsUserLocation
              initialRegion={{
                latitude: INIT_LATITUDE,
                longitude: INIT_LONGITUDE,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
              }}
              region={region}
            >
              {formattedAddress ? (
                <Marker
                  key={`${region.latitude},${region.longitude}`}
                  identifier={`${region.latitude},${region.longitude}`}
                  coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                  // title={"title"}
                  // description={"description"}
                  onPress={onPressPoint}
                >
                  <Column justify="center" align="center">
                    {showInfo && (
                      <View
                        style={{
                          display: 'flex',
                          borderRadius: 30 / 2,
                          backgroundColor: COLOR.LIGHT_GRAY,
                          padding: 20,
                        }}
                      >
                        <Text
                          style={{
                            color: 'black',
                            fontWeight: 'bold',
                            fontSize: 20,
                            marginBottom: 10,
                          }}
                        >
                          {t('search-map.Send')}
                        </Text>
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
                    )}
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
        </View>
      )}
    </MainLayout>
  );
}
