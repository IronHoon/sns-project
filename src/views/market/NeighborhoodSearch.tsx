import React, { useState } from 'react';
import { SearchBar } from '../../components/molecules/search-bar';
import { t } from 'i18next';
import styled from 'styled-components';
import { Row } from '../../components/layouts/Row';
import ICTarget from 'assets/ic_target.svg';
import ICNoLocal from 'assets/ic_nolacal.svg';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Linking,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Space from '../../components/utils/Space';
import { COLOR } from '../../constants/COLOR';
import { ModalBase } from '../../components/modal';
import LogUtil from '../../utils/LogUtil';
import PermissionUtil from '../../utils/PermissionUtil';
import { PERMISSIONS } from 'react-native-permissions';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '../../navigations/MainNavigator';

const SearchBarContainer = styled(Row)`
  border-bottom-color: ${COLOR.GRAY};
  border-bottom-style: solid;
  border-bottom-width: 1px;
  height: 60px;
  padding: 0px 20px;
`;

const FindContainer = styled(View)`
  flex-direction: row;
  width: 90%;
  height: 42px;
  border-radius: 5px;
  border-width: 1px;
  justify-content: center;
  align-items: center;
`;

const FindText = styled(Text)`
  color: black;
  font-size: 14px;
`;

const Title = styled(Text)`
  font-size: 18px;
  font-weight: 600;
`;
const Content = styled(Text)`
  font-size: 14px;
  color: ${COLOR.TEXT_GRAY};
  text-align: center;
`;

const SelectContainer = styled(View)`
  width: 150px;
  height: 60px;
  color: white;
  font-weight: bold;
  background-color: ${COLOR.PRIMARY};
  border-radius: 10px;
  justify-content: center;
  align-items: center;
`;
const CancelButton = styled(TouchableOpacity)`
  background-color: #fff;
  width: 110px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: #ccc;
`;
const CancelLabel = styled(Text)`
  color: #999999;
  font-size: 13px;
`;
const ConfirmButton = styled(TouchableOpacity)`
  background-color: ${COLOR.PRIMARY};
  width: 110px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${COLOR.PRIMARY};
  margin-bottom: 10px;
`;
const ConfirmLabel = styled(Text)`
  color: #fff;
  font-size: 13px;
  font-weight: 700;
`;
const NeighborhoodSearch = () => {
  const [searchValue, setSearchValue] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleSetting, setIsVisibleSetting] = useState(false);

  const handleChange = (value: string) => {
    setSearchValue(value);
  };
  const searchData = [
    'All',
    'Vientiane Prefecture',
    'Vientiane Prefecture',
    'Vientiane Prefecture',
    'Vientiane Prefecture',
    'Vientiane Prefecture',
  ];

  return (
    <>
      <SearchBarContainer align="center" justify="space-between">
        <SearchBar
          placeholder={t('market.Search by district, province or select All')}
          value={searchValue}
          onChange={handleChange}
          withCancel
          neighbor={true}
        />
      </SearchBarContainer>
      <View style={{ alignItems: 'center' }}>
        <Space height={20} />
        <Pressable
          style={{ width: '100%', alignItems: 'center' }}
          onPress={async () => {
            const permission =
              Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
            const result = await PermissionUtil.checkPermission(permission);
            LogUtil.info('result', result);
            if (result !== 'granted') {
              setIsVisibleSetting(true);
            } else {
              setIsVisible(true);
            }
          }}
        >
          <FindContainer>
            <ICTarget />
            <Space width={7} />
            <FindText>{t(`market.Find nearby neighborhood`)}</FindText>
          </FindContainer>
        </Pressable>
        {!searchValue ? <NoResult /> : <SearchResult searchValue={searchValue} searchData={searchData} />}
      </View>
      <ModalBase isVisible={!!isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
        <View>
          <ActivityIndicator />
          <Space height={10} />
          <Text style={{ fontWeight: 'normal' }}>Searching for current location</Text>
        </View>
      </ModalBase>
      <ModalBase isVisible={!!isVisibleSetting} onBackdropPress={() => setIsVisibleSetting(false)} width={350}>
        <View>
          <Text style={{ textAlign: 'center', lineHeight: 25, fontWeight: '500' }}>
            {t(`market.KokKok requires location permissions to`)}
          </Text>
          <Space height={20} />
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <CancelButton
              onPress={() => {
                setIsVisibleSetting(false);
              }}
            >
              <CancelLabel>Cancel</CancelLabel>
            </CancelButton>
            <Space width={10} />
            <ConfirmButton
              onPress={async () => {
                Platform.OS === 'ios' ? await Linking.openURL('app-settings:') : await Linking.openSettings();
              }}
            >
              <ConfirmLabel>Go to Settings</ConfirmLabel>
            </ConfirmButton>
          </View>
        </View>
      </ModalBase>
    </>
  );
};

const NoResult = () => {
  const navigation = useNavigation<MainNavigationProp>();
  const [location, setLocation] = useState<Array<string>>([]);
  return (
    <>
      <Space height={95} />
      <ICNoLocal />
      <Space height={23} />
      <Title>{t(`market.No Results`)}</Title>
      <Space height={9} />
      <Content>{t(`market.Oops, we can't find your location`)}</Content>
      <Space height={19} />
      <Pressable
        onPress={() => {
          navigation.navigate('/market', {
            location: [...location, 'All'],
          });
        }}
      >
        <SelectContainer>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{t(`market.Select All`)}</Text>
        </SelectContainer>
      </Pressable>
    </>
  );
};

const SearchResult = ({ searchValue, searchData }) => {
  LogUtil.info('searchData', searchData);
  const navigation = useNavigation<MainNavigationProp>();
  const [location, setLocation] = useState<Array<string>>([]);
  return (
    <View style={{ width: '100%', paddingLeft: 30 }}>
      <Text style={{ fontSize: 13, paddingVertical: 11, marginVertical: 10, color: COLOR.TEXT_GRAY }}>
        {'"' + searchValue + '" search results'}
      </Text>
      <FlatList
        data={searchData}
        renderItem={(item) => {
          return (
            <>
              <Pressable
                onPress={() => {
                  setLocation([...location, item.item]);
                  navigation.navigate('/market', {
                    location: [...location, item.item],
                  });
                }}
              >
                <Text style={{ fontSize: 13, paddingVertical: 11, color: 'black' }}>{item.item}</Text>
              </Pressable>
            </>
          );
        }}
      />
    </View>
  );
};

export default NeighborhoodSearch;
