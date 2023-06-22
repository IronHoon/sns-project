import { useNavigation } from '@react-navigation/native';
import { COLOR } from 'constants/COLOR';
import { MainNavigationProp } from 'navigations/MainNavigator';
import React, { useState } from 'react';
import { Menu, MenuItem } from 'react-native-material-menu';
import styled, { css } from 'styled-components/native';
import { Text, View } from 'react-native';
import Padding from 'components/containers/Padding';
import { Row } from 'components/layouts/Row';
import Space from 'components/utils/Space';
import ICDropDown from 'assets/ic_open_12.svg';
import ICSearch from 'assets/ic_search_22.svg';
import ICMore from 'assets/ic_more_22.svg';
import ICNotice from 'assets/ic_notice_22.svg';
import { t } from 'i18next';

const HeaderContainer = styled.View<{ border?: boolean }>`
  height: 50px;
  ${(props) =>
    !props.border && props.theme.dark
      ? css``
      : css`
          border-bottom-width: 1px;
          border-color: ${COLOR.GRAY};
        `}
`;
const ButtonWrap = styled.View`
  width: 100px;
  flex-direction: row;
  justify-content: space-between;
`;
const IconButton = styled.Pressable`
  width: 22px;
  position: relative;
`;

const MarketHeader = ({ location }) => {
  const navigation = useNavigation<MainNavigationProp>();
  const [selecetedAssetType, _setSelecetedAssetType] = useState('All');
  const setSelecetedAssetType = (selecetedAssetType) => {
    setShowMenu(false);
    _setSelecetedAssetType(selecetedAssetType);
  };
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);

  return (
    <HeaderContainer border={false}>
      <Padding>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Menu
            style={{ position: 'absolute', top: 90, left: 20 }}
            visible={showMenu}
            onRequestClose={() => {
              setShowMenu(false);
            }}
            anchor={
              <View
                style={{ width: 120 }}
                onTouchStart={() => {
                  setShowMenu(true);
                }}
              >
                <Row style={{ alignItems: 'center', width: 120, justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 16 }}>{location[0]}</Text>
                  <Space width={5} />
                  <ICDropDown />
                </Row>
              </View>
            }
          >
            {location?.map((item) => {
              return (
                <MenuItem
                  style={{ height: 50, width: 200 }}
                  textStyle={{ color: COLOR.BLACK }}
                  onTouchStart={() => setSelecetedAssetType(item)}
                  pressColor={'#fcf2e8'}
                >
                  {item}
                </MenuItem>
              );
            })}
            <MenuItem
              style={{ height: 50, width: 200 }}
              textStyle={{ color: COLOR.BLACK }}
              onTouchStart={() => {
                setShowMenu(false);
                navigation.navigate('/market/neighborhood-settings', {
                  location: location,
                });
              }}
              pressColor={'#fcf2e8'}
            >
              neighborhood settings
            </MenuItem>
          </Menu>

          <ButtonWrap>
            <IconButton onPress={() => {}}>
              <ICSearch />
            </IconButton>
            <IconButton onPress={() => {}}>
              <ICNotice />
            </IconButton>
            <IconButton onPress={() => {}}>
              <Menu
                style={{ position: 'absolute', top: 90, right: 20, width: 220 }}
                visible={showMoreMenu}
                onRequestClose={() => {
                  setShowMoreMenu(false);
                }}
                anchor={
                  <View
                    style={{ width: 220 }}
                    onTouchStart={() => {
                      setShowMoreMenu(true);
                    }}
                  >
                    <Row style={{ alignItems: 'center', width: 22, justifyContent: 'space-between' }}>
                      <ICMore />
                    </Row>
                  </View>
                }
              >
                <MenuItem
                  style={{ height: 50 }}
                  textStyle={{ color: COLOR.BLACK }}
                  onTouchStart={() => {
                    setShowMoreMenu(false);
                    navigation.navigate('/market/listings');
                  }}
                  pressColor={'#fcf2e8'}
                >
                  {t('market.Listings')}
                </MenuItem>
                <MenuItem
                  style={{ height: 50 }}
                  textStyle={{ color: COLOR.BLACK }}
                  onTouchStart={() => {
                    setShowMoreMenu(false);
                    navigation.navigate('/market/purchases');
                  }}
                  pressColor={'#fcf2e8'}
                >
                  {t('market.Purchases')}
                </MenuItem>
                <MenuItem
                  style={{ height: 50 }}
                  textStyle={{ color: COLOR.BLACK }}
                  onTouchStart={() => {
                    setShowMoreMenu(false);
                    navigation.navigate('/market/saved');
                  }}
                  pressColor={'#fcf2e8'}
                >
                  {t('market.Saved')}
                </MenuItem>
                <MenuItem
                  style={{ height: 50 }}
                  textStyle={{ color: COLOR.BLACK }}
                  onTouchStart={() => {
                    setShowMoreMenu(false);
                    navigation.navigate('/market/my-reviews');
                  }}
                  pressColor={'#fcf2e8'}
                >
                  {t('market.Reviews')}
                </MenuItem>
              </Menu>
            </IconButton>
          </ButtonWrap>
        </View>
      </Padding>
    </HeaderContainer>
  );
};

export default MarketHeader;
