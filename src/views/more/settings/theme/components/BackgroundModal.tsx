import React from 'react';
import { View, SafeAreaView, Dimensions, ScrollView, ImageBackground } from 'react-native';
import Modal from 'react-native-modal';
import { COLOR } from 'constants/COLOR';
import BackHeader from 'components/molecules/BackHeader';
import styled from 'styled-components/native';
import { Row } from 'components/layouts/Row';
import { BACKGROUND } from 'constants/BACKGROUND';
import { t } from 'i18next';

interface BackgroundColorType {
  type: 'color' | 'image' | 'album' | '0';
  background:
    | '#f8f8f8'
    | '#59636C'
    | '#C6D4DF'
    | '#6884B3'
    | '#14B1A2'
    | '#A4CEC0'
    | '#9BBF5F'
    | '#FFCD51'
    | '#FFAA85'
    | '#E47885'
    | '#EDAAB3'
    | '#7C6267'
    | '#CCCCCC'
    | '#9D9E9D'
    | '#3F438A'
    | '#002C41'
    | '#828B9C'
    | '#CBB4D1';
}

interface Props {
  isVisible: boolean;
  setIsVisible: (props) => void;
  type: string;
  selected: BackgroundColorType | { type: 'image'; background: number } | { type: 'album'; background: string };
  setSelected: (props) => void;
}

const colors = [
  '#f8f8f8',
  '#59636C',
  '#C6D4DF',
  '#6884B3',
  '#14B1A2',
  '#A4CEC0',
  '#9BBF5F',
  '#FFCD51',
  '#FFAA85',
  '#E47885',
  '#EDAAB3',
  '#7C6267',
  '#CCCCCC',
  '#9D9E9D',
  '#3F438A',
  '#002C41',
  '#828B9C',
  '#CBB4D1',
];

const Wrap = styled.TouchableOpacity<{ selected: boolean }>`
  padding: ${({ selected }) => (selected ? '0px' : '2px')};
  border-color: ${({ selected }) => (selected ? COLOR.PRIMARY : COLOR.WHITE)};
  border-width: ${({ selected }) => (selected ? '2px' : '0px')};
  border-style: solid;
`;
const ColorsBox = styled.View<{ color: string }>`
  background-color: ${({ color }) => color};
  width: ${`${Dimensions.get('window').width / 3.46}px`};
  height: ${`${Dimensions.get('window').width / 3.46}px`};
`;
const Checked = styled.Image`
  position: absolute;
  width: 22px;
  height: 22px;
  left: ${`${Dimensions.get('window').width / 7 - 11}px`};
  top: ${`${Dimensions.get('window').width / 7 - 11}px`};
`;

function BackgroundModal({ isVisible, setIsVisible, selected, setSelected, type }: Props) {
  return (
    <Modal isVisible={isVisible} backdropOpacity={1} backdropColor={'white'}>
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          backgroundColor: 'white',
          height: '100%',
          width: '100%',
        }}
      >
        <SafeAreaView style={{ paddingBottom: 50 }}>
          <BackHeader
            themeColor={false}
            title={
              type === 'color'
                ? t('theme.color')
                : type === 'image'
                ? t('theme.image')
                : type === 'album'
                ? t('theme.album')
                : ''
            }
            border={false}
            onClick={() => {
              setIsVisible(false);
            }}
          />
          <ScrollView>
            <Row style={{ flexWrap: 'wrap', alignItems: 'center' }}>
              {type === 'color' &&
                colors.map((color, i) => (
                  <Wrap
                    key={i}
                    selected={selected.type === 'color' ? selected.background === color : false}
                    onPress={() => {
                      setSelected({ type: 'color', background: color });
                      setIsVisible(false);
                    }}
                  >
                    <ColorsBox color={color}>
                      {selected.type === 'color' ? (
                        selected.background === color && (
                          <Checked source={require('assets/images/icon/check-round-on-22.png')} />
                        )
                      ) : (
                        <></>
                      )}
                    </ColorsBox>
                  </Wrap>
                ))}
              {type === 'image' &&
                BACKGROUND.map((src, i) => (
                  <Wrap
                    key={i}
                    selected={selected.background === i}
                    onPress={() => {
                      setSelected({ type: 'image', background: i });
                      setIsVisible(false);
                    }}
                  >
                    <ImageBackground
                      source={src}
                      style={{
                        width: Dimensions.get('window').width / 3.46,
                        height: Dimensions.get('window').width / 3.46,
                      }}
                      resizeMode={'stretch'}
                    >
                      {selected.background === src && (
                        <Checked source={require('assets/images/icon/check-round-on-22.png')} />
                      )}
                    </ImageBackground>
                  </Wrap>
                ))}
            </Row>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export default BackgroundModal;
