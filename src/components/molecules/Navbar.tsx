import { useNavigation, useRoute } from '@react-navigation/native';
import { COLOR } from 'constants/COLOR';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import styled from 'styled-components/native';
import tw from 'twrnc';
import { useAtom } from 'jotai';
import showMediaAtom from '../../stores/showMediaAtom';
import { Row } from '../layouts/Row';
import useSocket from 'hooks/useSocket';

function getImage(type, routeName) {
  switch (type) {
    case 'contacts':
      return type === routeName
        ? require('../../assets/ic-contacts-on.png')
        : require('../../assets/ic-contacts-off.png');
    case 'chats':
      return type === routeName ? require('../../assets/ic-chats-on.png') : require('../../assets/ic-chats-off.png');
    case 'kokkokme':
      return type === routeName
        ? require('../../assets/ic-kokkokme-on.png')
        : require('../../assets/ic-kokkokme-off.png');
    case 'media':
      return type === routeName ? require('../../assets/ic-media-on.png') : require('../../assets/ic-media-off.png');
    case 'more':
      return type === routeName ? require('../../assets/ic-more-on.png') : require('../../assets/ic-more-off.png');
  }
}

function NavButton({ navigation, type, routeName }) {
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  const [, setShow] = useAtom(showMediaAtom);
  const { chatStatus } = useSocket();
  const myUnreadCount: number = chatStatus.myUnreadCount;

  return (
    <Pressable
      style={{ alignItems: 'center', justifyContent: 'center' }}
      onTouchStart={() => {
        if (type === 'media') {
          setShow(true);
          return;
        }
        navigation.navigate(`/${type}`);
      }}
    >
      <NavIcon source={getImage(type, routeName)} />
      {type === 'chats' && (
        <View style={{ position: 'absolute', flex: 1, width: 50, justifyContent: 'center' }}>
          {myUnreadCount > 0 && (
            <Row
              style={{
                width: '100%',
                right: myUnreadCount > 999 ? -18 : myUnreadCount > 99 ? -10 : myUnreadCount > 9 ? -5 : 0,
                top: routeName === 'chats' ? -20 : -10,
              }}
            >
              <View style={{ flex: 1 }} />
              <Badge>
                <BadgeCount>{myUnreadCount > 999 ? '999+' : myUnreadCount}</BadgeCount>
              </Badge>
            </Row>
          )}
        </View>
      )}
      {type === routeName && <Text style={{ color: COLOR.PRIMARY }}>{label}</Text>}
    </Pressable>
  );
}

function Navbar() {
  const route = useRoute();
  const navigation = useNavigation();
  const routeName = route.name.split('/')[1];

  return (
    <NavbarContainer style={tw`h-2/17`}>
      <NavButton navigation={navigation} type={'contacts'} routeName={routeName} />
      <NavButton navigation={navigation} type={'chats'} routeName={routeName} />
      <NavButton navigation={navigation} type={'kokkokme'} routeName={routeName} />
      <NavButton navigation={navigation} type={'media'} routeName={routeName} />
      <NavButton navigation={navigation} type={'more'} routeName={routeName} />
    </NavbarContainer>
  );
}

export default Navbar;

const NavbarContainer = styled.View`
  flex-direction: row;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 30px;
  padding-right: 30px;
  position: absolute;
  bottom: 0;
  background-color: ${(props) => (props.theme.dark ? '#464646' : props.theme.colors.LIGHT_GRAY)};
  width: 100%;
  justify-content: space-between;
`;
const NavIcon = styled.Image`
  width: 30px;
  height: 30px;
`;

const Badge = styled.View`
  background-color: #15979e;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
`;
const BadgeCount = styled.Text`
  color: #ffffff;
  padding: 3px;
  padding-left: 7px;
  padding-right: 7px;
  font-size: 11px;
  font-weight: bold;
`;
