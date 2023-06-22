import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';
import styled from 'styled-components/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { Row } from 'components/layouts/Row';
import { t } from 'i18next';
import Highlighter from 'react-native-highlight-words';
import { Avatar } from 'components/atoms/image';

interface UserInfo {
  uid: string;
  contact: string;
  first_name: string;
  last_name: string;
  profile_image: string | null;
}
export default function Registered() {
  // @ts-ignore
  const { params: userInfo }: UserInfo = useRoute();
  const navigation = useNavigation<MainNavigationProp>();
  const name = `${userInfo.first_name} ${userInfo.last_name}`;
  return (
    <ScrollView contentContainerStyle={tw`flex-1`}>
      <View style={tw`flex min-w-full min-h-full`}>
        <View style={tw`flex-auto items-center`}>
          <Already>{t('sign-up.This account is already registered')}</Already>
          <Avatar size={120} src={userInfo.profile_image} />
          <View style={tw`items-center my-3`}>
            <UserName>{name}</UserName>
            <Tag>@{userInfo.uid}</Tag>
            <Telephone>{userInfo.contact}</Telephone>
          </View>
          <View style={tw`items-center my-5`}>
            <SignInText>
              {/* If <SignInFirstNameText>{name}</SignInFirstNameText> is your
              account, {'\n '} */}
              <Highlighter
                highlightStyle={tw`font-bold`}
                searchWords={[`${name}`]}
                textToHighlight={t('sign-up.If userName is your account', { name: name })}
              />
            </SignInText>
            <SignInLink
              onPress={() => {
                navigation.navigate('/phone-number-input', {
                  route: 'sign-in',
                });
              }}
            >
              {t('sign-up.Sign in here')}
            </SignInLink>
          </View>
        </View>
        <AnotherPhoneButton
          onPress={() => {
            navigation.navigate('/phone-number-input', { route: 'sign-up' });
          }}
        >
          <Row align="center">
            <Image style={tw`w-6 h-6 mx-1`} source={require('../../assets/ic-phone-16.png')} />
            <Text style={tw`text-black font-bold`}>{t('sign-up.Use another phone number')}</Text>
          </Row>
        </AnotherPhoneButton>
      </View>
    </ScrollView>
  );
}
const Already = styled.Text`
  margin-top: 80px;
  margin-bottom: 60px;
  color: #262525;
  font-size: 16px;
  font-weight: bold;
`;

const UserName = styled.Text`
  color: #262525;
  font-size: 18px;
  font-weight: bold;
`;

const Tag = styled.Text`
  margin-top: 3px;
  color: #bcb3c5;
  font-size: 13px;
`;

const Telephone = styled.Text`
  margin-top: 7px;
  font-size: 14px;
  color: #999999;
  font-weight: bold;
`;
const SignInText = styled.Text`
  font-size: 13px;
  color: #999999;
  text-align: center;
`;

const SignInLink = styled.Text`
  font-size: 13px;
  text-align: center;
  text-decoration: underline;
  color: #f68722;
  text-decoration-color: #f68722;
`;

const AnotherPhoneButton = styled.TouchableOpacity`
  display: flex;
  flex: none;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 60px;
  border: 1px solid black;
  border-radius: 10px;
  margin: 20px;
`;
