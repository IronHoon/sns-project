import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { GooglePlacesAutocomplete, Language } from 'react-native-google-places-autocomplete';
import MySetting from '../../MySetting';
import { StyleSheet, View, Text, Platform, ActionSheetIOS, ActivityIndicator, LogBox } from 'react-native';
import tw from 'twrnc';
import styled, { ThemeContext } from 'styled-components';
import style from 'styled-components/native';

import Geolocation from 'react-native-geolocation-service';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import PermissionUtil from '../../utils/PermissionUtil';
import { PERMISSIONS } from 'react-native-permissions';
import Location from '../../types/socials/posts/Location';
import Region from '../../types/socials/posts/Region';
import GeoCoderUtil from '../../utils/GeoCoderUtil';
import { COLOR } from '../../constants/COLOR';
import { MainNavigationProp } from '../../navigations/MainNavigator';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

interface ILocation {
  latitude: number;
  longitude: number;
}

const GooglePlacesInput = () => {
  const user = useAtomValue(userAtom);
  const {
    //@ts-ignore
    params: { setRegion, region, setAddress, setIsTagLocation },
  } = useRoute();
  const navigation = useNavigation<MainNavigationProp>();
  const [location, setLocation] = useState<ILocation | undefined>(undefined);
  const theme = useContext(ThemeContext);
  LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

  useEffect(
    useCallback(() => {
      console.log(region);
      console.log(setRegion);
      PermissionUtil.requestPermission(
        Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_ALWAYS : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ).then((result) => {
        if (result === 'granted') {
          Geolocation.getCurrentPosition(
            (pos) => {
              setRegion({
                ...region,
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
            },
            (error) => {
              console.warn('error', error);
            },
            {
              enableHighAccuracy: true,
              timeout: 3600,
              maximumAge: 3600,
            },
          );
        }
      });
    }, []),
  );

  return (
    <GooglePlacesAutocomplete
      // ref={ref}
      placeholder="Search"
      onPress={(data, details = null) => {
        // 'details' is provided when fetchDetails = true
        // console.log(data, details);
        console.log(details);
        console.log(data.structured_formatting.main_text, details?.geometry);
        setRegion({
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
          latitude: details?.geometry.location.lat ?? 0,
          longitude: details?.geometry.location.lng ?? 0,
        });
        setAddress(data.structured_formatting.main_text);
        setIsTagLocation(true);
        navigation.goBack();
      }}
      keepResultsAfterBlur={true}
      minLength={2}
      listViewDisplayed="auto"
      fetchDetails={true}
      query={{
        key: MySetting.googleApiKey,
        language: 'en',
      }}
      styles={styles(theme)}
      debounce={300}
      GooglePlacesDetailsQuery={{ fields: 'geometry' }}
      // currentLocation={true}
      nearbyPlacesAPI="GooglePlacesSearch"
      renderRow={(rowData) => {
        const title = rowData.structured_formatting.main_text;
        const address = rowData.structured_formatting.secondary_text;
        return (
          <>
            {title ? (
              <View>
                <Text
                  style={{
                    // fontSize: 14,
                    fontSize: user?.setting?.ct_text_size as number,
                    color: theme.dark ? `${COLOR.WHITE}` : `${COLOR.BLACK}`,
                  }}
                >
                  {title}
                </Text>

                <Text
                  style={{
                    // fontSize: 14,
                    fontSize: user?.setting?.ct_text_size as number,
                    color: theme.dark ? `${COLOR.WHITE}` : `${COLOR.BLACK}`,
                  }}
                >
                  {address}
                </Text>
              </View>
            ) : (
              <ActivityIndicator />
            )}
          </>
        );
      }}
    />
  );
};

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    textInputContainer: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    textInput: {
      backgroundColor: theme.dark ? `#484848` : `${COLOR.GRAY}`,
      color: theme.dark ? `${COLOR.WHITE}` : `${COLOR.TEXT_GRAY}`,
      height: 44,
      borderRadius: 5,
      paddingVertical: 5,
      paddingHorizontal: 15,
      fontSize: 15,
      flex: 1,
    },
    poweredContainer: {
      display: 'none',
    },
    powered: {},
    row: {
      backgroundColor: theme.dark ? `#585858` : '#FFFFFF',
      padding: 13,
      paddingBottom: 0,
      // height: 44,
      flexDirection: 'row',
    },
    separator: {
      marginBottom: 5,
      marginTop: 10,
      borderColor: theme.dark ? `#ffffff` : `${COLOR.GRAY}`,
    },
    description: {
      color: `#ffffff`,
    },
    predefinedPlacesDescription: {
      color: theme.dark ? `#ffffff` : `#000000`,
    },
    loader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      height: 20,
    },
  });

export default GooglePlacesInput;
