import CloseHeader from 'components/molecules/CloseHeader';
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import AlphabetList from 'react-native-flatlist-alphabet';
import tw from 'twrnc';
import { COUNTRIES_DATA } from '../../data/countriesData';
import { COLOR } from 'constants/COLOR';
import Close from 'assets/images/icon/ic-close.svg';
import styled, { ThemeContext } from 'styled-components/native';
import { useTranslation } from 'react-i18next';
import getSectionData from 'react-native-flatlist-alphabet/dist/utilities/getSectionData';
import Search from 'assets/images/icon/ic-search.svg';
import SearchW from 'assets/images/icon/ic-search-w.svg';

interface Props {
  isVisible: boolean;
  setIsVisible: (props) => void;
  setCountryCode: (props) => void;
  setCountryCallingCode: (props) => void;
}
const Container = styled.View`
  position: absolute;
  left: 0;
  top: 0;
  background-color: ${({ theme }) => theme.colors.background};
  height: 100%;
  width: 100%;
`;
const IconContainer = styled(View)`
  height: 16px;
  width: 16px;
`;
const SearchIcon = styled(Search)`
  height: 100%;
  width: 100%;
`;
const SearchIconW = styled(SearchW)`
  height: 100%;
  width: 100%;
`;
const TouchIconContainer = styled(TouchableOpacity)`
  height: 16px;
  right: 0;
  position: absolute;
  width: 16px;
`;
const CloseIcon = styled(Close)`
  cursor: pointer;
  height: 100%;
  width: 100%;
`;
const data = COUNTRIES_DATA.map((country, index) => ({
  value: country.countryNameEn,
  key: index,
  countryCode: country.countryCode,
  countryCallingCode: country.countryCallingCode,
}));

function SelectCountryModal({ isVisible, setIsVisible, setCountryCode, setCountryCallingCode }: Props) {
  const [searchText, setSearchText] = useState('');
  const [result, setResult] = useState(true);
  const [focus, setFocus] = useState(false);
  const { t } = useTranslation();
  const themeContext = useContext(ThemeContext);

  useEffect(() => {
    const resultLength = data.filter((country) =>
      country.value.toLowerCase().includes(searchText.toLowerCase()),
    ).length;
    if (resultLength === 0) {
      setResult(false);
    } else {
      setResult(true);
    }
  }, [searchText]);

  return (
    <Modal isVisible={isVisible} backdropOpacity={1} backdropColor={themeContext.colors.background}>
      <Container>
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}
        >
          <SafeAreaView>
            <CloseHeader
              // themeColor={false}
              title={t('Select Country.Select Country')}
              border={false}
              onClick={() => {
                setIsVisible(false);
              }}
            />
            <View
              style={[
                tw`flex-row items-center mt-4 mb-9 border-b`,
                focus
                  ? { borderBottomColor: themeContext.colors.text }
                  : { borderBottomColor: themeContext.dark ? '#999999' : '#ededed' },
              ]}
            >
              {/* <Image source={require('../../assets/ic-search.png')} style={{ width: 20, height: 20 }} /> */}
              <IconContainer>{themeContext.dark ? <SearchIconW /> : <SearchIcon />}</IconContainer>
              <TextInput
                style={[tw`flex-1 h-12 p-3`, { color: themeContext.colors.text }]}
                value={searchText}
                placeholder={t('Select Country.Select Country')}
                placeholderTextColor={'#999999'}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                onChangeText={(text) => {
                  setSearchText(text);
                }}
              />
              {searchText !== '' && (
                <TouchIconContainer onPress={() => setSearchText('')}>
                  <CloseIcon />
                </TouchIconContainer>
              )}
            </View>
            {result ? (
              <>
                {
                  // ((searchText.startsWith('l') && !searchText.includes('lao')) || searchText === '') && (
                  searchText === '' && (
                    <>
                      <TouchableOpacity
                        onPress={() => {
                          setCountryCode('LA');
                          setCountryCallingCode(856);
                          setIsVisible(false);
                          setSearchText('');
                        }}
                      >
                        <View
                          style={{
                            padding: 10,
                            paddingVertical: 20,
                            flexDirection: 'row',
                          }}
                        >
                          <Text
                            style={{ flex: 1, color: themeContext.colors.text }}
                          >{`Lao People's Democratic Republic`}</Text>
                          <Text
                            style={{
                              color: COLOR.POINT_GRAY,
                              width: 50,
                              textAlign: 'right',
                            }}
                          >
                            + {856}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      {__DEV__ && (
                        <TouchableOpacity
                          onPress={() => {
                            setCountryCode('KR');
                            setCountryCallingCode(82);
                            setIsVisible(false);
                            setSearchText('');
                          }}
                        >
                          <View
                            style={{
                              padding: 10,
                              paddingVertical: 20,
                              flexDirection: 'row',
                            }}
                          >
                            <Text
                              style={{ flex: 1, color: themeContext.colors.text }}
                            >{`Test Only : Republic of Korea`}</Text>
                            <Text
                              style={{
                                color: COLOR.POINT_GRAY,
                                width: 50,
                                textAlign: 'right',
                              }}
                            >
                              + {82}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                    </>
                  )
                }
                <AlphabetList
                  containerStyle={{
                    position: 'absolute',
                    right: -25,
                    top: -60,
                  }}
                  style={{ height: '80%' }}
                  ListHeaderComponent={<></>}
                  ListFooterComponent={<>{Platform.OS === 'android' && <AndroidPadding />}</>}
                  //@ts-ignore
                  data={data.filter((country) => country.value.toLowerCase().includes(searchText.toLowerCase()))}
                  indexLetterColor={themeContext.colors.text}
                  indexLetterSize={10}
                  stickySectionHeadersEnabled={true}
                  onEndReachedThreshold={0.01}
                  renderItem={(item: any) => (
                    <TouchableOpacity
                      onPress={() => {
                        setCountryCode(item.countryCode);
                        setCountryCallingCode(item.countryCallingCode);
                        setIsVisible(false);
                        setSearchText('');
                      }}
                    >
                      <View
                        style={{
                          padding: 10,
                          paddingVertical: 20,
                          flexDirection: 'row',
                          borderBottomColor: COLOR.LIGHT_GRAY,
                          borderBottomWidth: 1,
                        }}
                      >
                        <Text style={{ flex: 1, color: themeContext.colors.text }}>{item.value}</Text>
                        <Text
                          style={{
                            color: COLOR.POINT_GRAY,
                            width: 50,
                            textAlign: 'right',
                          }}
                        >
                          + {item.countryCallingCode}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  renderSectionHeader={(section) => (
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        backgroundColor: COLOR.PRIMARY,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: 'bold',
                          color: '#ffffff',
                        }}
                      >
                        {section.title}
                      </Text>
                    </View>
                  )}
                  maxTorenderPerBatch={100}
                  updateCellsBatchingPeriod={5}
                  initialNumTorender={50}
                  windowSize={100}
                />
              </>
            ) : (
              <View style={{ marginLeft: 15 }}>
                <Text style={{ color: COLOR.POINT_GRAY }}>{t('common.No Results')}</Text>
              </View>
            )}
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </Container>
    </Modal>
  );
}

const AndroidPadding = styled.View`
  height: ${`${Dimensions.get('window').height / 17}px`};
`;

export default SelectCountryModal;
