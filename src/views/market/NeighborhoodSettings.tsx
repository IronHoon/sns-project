import React, { useState } from 'react';
import Screen from '../../components/containers/Screen';
import { H1 } from 'components/atoms/typography/Heading';
import { View, Text, Pressable, Dimensions, Platform, Linking, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import BackHeader from '../../components/molecules/BackHeader';
import { t } from 'i18next';
import styled from 'styled-components/native';
import { COLOR } from '../../constants/COLOR';
import { useNavigation, useRoute } from '@react-navigation/native';
import Space from '../../components/utils/Space';
import Slider from '@react-native-community/slider';
import LogUtil from '../../utils/LogUtil';
import ICCloseWhite from 'assets/ic_close_round_white.svg';
import ICCloseGray from 'assets/ic_close_round_gray.svg';
import ICPlus from 'assets/ic_plus.svg';
import { MainNavigationProp } from '../../navigations/MainNavigator';
import { ModalBase } from '../../components/modal';

interface Props {
  checkedIndex: boolean;
}

const LocationBox = styled.View<Props>`
  background-color: ${(props) => (props.checkedIndex ? COLOR.PRIMARY : COLOR.WHITE)};
  border-color: ${(props) => (props.checkedIndex ? 'transparent' : '#ededed')};
  border-width: 1px;
  justify-content: space-between;
  height: 42px;
  padding: 0 10px;
  width: 100%;
  flex-direction: row;
  align-items: center;
`;
const TopContainer = styled.View`
  height: 30%;
`;

const BottomContainer = styled.View`
  flex: 1;
  background-color: #f8f8f8;
`;

const PlusBox = styled.View`
  border: 1px;
  border-color: ${COLOR.GRAY};
  width: 100%;
  height: 42px;
  justify-content: center;
  align-items: center;
`;

const LocationLabel = styled.Text<Props>`
  font-size: 13px;
  color: ${(props) => (props.checkedIndex ? COLOR.WHITE : COLOR.BLACK)};
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

function NeighborhoodSettings() {
  const { params }: any = useRoute();
  const location = params?.location;
  const [checkedIndex, setCheckedIndex] = useState(0);
  const navigation = useNavigation<MainNavigationProp>();
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleDel, setIsVisibleDel] = useState(false);

  return (
    <Screen>
      <BackHeader title={t('market.Neighborhood Settings')} />
      <View style={{ height: '25%', paddingHorizontal: 20 }}>
        <TopContainer>
          <Space height={32} />
          <Text style={{ fontSize: 16, fontWeight: '500' }}>{t(`market.Select neighborhood`)}</Text>
          <Space height={9} />
          <Text style={{ fontSize: 14, color: '#999999' }}>{t('market.You can choose up to 2 neighborhoods')}</Text>
          <Space height={20} />
          <View
            style={{
              width: Dimensions.get('window').width - 40,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            {!location ? (
              <Pressable
                style={{ width: Dimensions.get('window').width * 0.43 }}
                onPress={() => {
                  navigation.navigate('/market/neighborhood-search');
                }}
              >
                <PlusBox>
                  <ICPlus />
                </PlusBox>
              </Pressable>
            ) : location.length === 2 ? (
              location.map((item, index) => {
                return (
                  <Pressable
                    style={{ width: Dimensions.get('window').width * 0.43 }}
                    onPress={() => {
                      setCheckedIndex(index);
                    }}
                  >
                    <LocationBox checkedIndex={checkedIndex === index}>
                      <LocationLabel checkedIndex={checkedIndex === index}>{item}</LocationLabel>
                      {checkedIndex === index ? (
                        <Pressable onPress={() => setIsVisibleDel(true)}>
                          <ICCloseWhite />
                        </Pressable>
                      ) : (
                        <Pressable onPress={() => setIsVisibleDel(true)}>
                          <ICCloseGray />
                        </Pressable>
                      )}
                    </LocationBox>
                  </Pressable>
                );
              })
            ) : (
              <View
                style={{
                  width: Dimensions.get('window').width - 40,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Pressable style={{ width: Dimensions.get('window').width * 0.43 }} onPress={() => {}}>
                  <LocationBox checkedIndex={true}>
                    <LocationLabel checkedIndex={true}>{location[0]}</LocationLabel>
                    <Pressable onPress={() => setIsVisible(true)}>
                      <ICCloseWhite />
                    </Pressable>
                  </LocationBox>
                </Pressable>
                <Pressable
                  style={{ width: Dimensions.get('window').width * 0.43 }}
                  onPress={() => {
                    navigation.navigate('/market/neighborhood-search');
                  }}
                >
                  <PlusBox>
                    <ICPlus />
                  </PlusBox>
                </Pressable>
              </View>
            )}
          </View>
        </TopContainer>
      </View>
      {location && location[checkedIndex] !== 'All' && (
        <BottomContainer>
          <View style={{ alignItems: 'center' }}>
            <Space height={69} />
            <Text style={{ fontSize: 14 }}>{t('market.Only listings within the range will be shown')}</Text>
            <Space height={29} />
            <Slider
              style={{ width: '60%', height: 100 }}
              onSlidingComplete={(result) => {
                LogUtil.info('result', result);
              }}
              tapToSeek={true}
              step={1}
              minimumValue={0}
              maximumValue={14}
              minimumTrackTintColor={COLOR.PRIMARY}
              maximumTrackTintColor={'#ededed'}
              // thumbImage={
              //     Platform.OS === 'ios' ? require('assets/white-circle20.png') : require('assets/white-circle60.png')
              // }
            />
            <View style={{ width: '85%', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, color: '#999999' }}>{location[checkedIndex] + ' Only'}</Text>
              <Text style={{ fontSize: 12, color: '#999999' }}>{'14 ' + t('market.nearby districts')}</Text>
            </View>
          </View>
        </BottomContainer>
      )}
      <ModalBase isVisible={!!isVisibleDel} onBackdropPress={() => setIsVisibleDel(false)} width={350}>
        <View>
          <Text style={{ textAlign: 'center', lineHeight: 25, fontWeight: '500' }}>
            {t(`market.Delete neighborhood?`)}
          </Text>
          <Space height={20} />
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <CancelButton
              onPress={() => {
                setIsVisibleDel(false);
              }}
            >
              <CancelLabel>Cancel</CancelLabel>
            </CancelButton>
            <Space width={10} />
            <ConfirmButton
              onPress={() => {
                setIsVisibleDel(false);
                location.remove();
              }}
            >
              <ConfirmLabel>Yes, change</ConfirmLabel>
            </ConfirmButton>
          </View>
        </View>
      </ModalBase>
      <ModalBase isVisible={!!isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
        <View>
          <Text style={{ textAlign: 'center', lineHeight: 25, fontWeight: '500' }}>
            {t(`market.At least one neighborhood must be selected`)}
          </Text>
          <Space height={20} />
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <CancelButton
              onPress={() => {
                setIsVisible(false);
              }}
            >
              <CancelLabel>Cancel</CancelLabel>
            </CancelButton>
            <Space width={10} />
            <ConfirmButton
              onPress={() => {
                setIsVisible(false);
                navigation.navigate('/market/neighborhood-search');
              }}
            >
              <ConfirmLabel>Yes, change</ConfirmLabel>
            </ConfirmButton>
          </View>
        </View>
      </ModalBase>
    </Screen>
  );
}

export default NeighborhoodSettings;
