import React, { useCallback, useContext, useEffect, useState } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled, { ThemeContext } from 'styled-components/native';
import { TouchableOpacity, TextInput, View } from 'react-native';
import { Column } from 'components/layouts/Column';
import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import { Center } from 'components/layouts/Center';
import Space from 'components/utils/Space';
import { Row } from 'components/layouts/Row';
import tw from 'twrnc';
import { COLOR } from 'constants/COLOR';
import Close from 'assets/images/icon/ic-close.svg';
import { useFetchWithType } from '../../../../net/useFetch';
import { useAtom, useAtomValue } from 'jotai';
import userAtom from '../../../../stores/userAtom';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { post } from '../../../../net/rest/api';
import { mutate } from 'swr';
import { MainNavigationProp } from '../../../../navigations/MainNavigator';
import SwrContainer from '../../../../components/containers/SwrContainer';
// import Avatar from '../../../../components/atoms/image/Avatar';
import { t } from 'i18next';
import { FollowerList, FollowingList } from '../../../../types/socials';
import useSWRInfinite from 'swr/infinite';
import axios from 'axios';
import LogUtil from '../../../../utils/LogUtil';
import User from 'types/auth/User';
import { Avatar } from 'components/atoms/image';

const Icon = styled.Image`
  width: 52px;
  height: 52px;
`;
const Text = styled.Text`
  font-size: 18px;
  font-weight: 500;
  padding-top: 15px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Description = styled.Text`
  text-align: center;
  padding-top: 10px;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
`;
const SearchIcon = styled.Image`
  width: 20px;
  height: 20px;
  tint-color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const ContactContainer = styled.ScrollView`
  padding: 20px;
`;
const ProfileImageBox = styled.View`
  width: 40px;
  /* height: 40px; */
  border-radius: 70px;
  overflow: hidden;
  margin-right: 15px;
`;
const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`;
const NameText = styled.Text`
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
  font-size: 15px;
  font-weight: 500;
`;
const IDText = styled.Text`
  color: #999999;
  font-size: 13px;
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
const DescText = styled(Text)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

function AddExcept() {
  const themeContext = useContext(ThemeContext);
  const [focus, setFocus] = useState(false);
  const [result] = useState<Array<any>>();
  const [searchText, setSearchText] = useState('');
  const [items] = useState<Array<any>>();
  const { params } = useRoute();
  const myUser: User | null = useAtomValue(userAtom);
  //@ts-ignore
  const routeName = params?.route ?? 'post';
  //@ts-ignore
  const privateEnabled = params.private;

  const options = {
    initialSize: 1,
    revalidateAll: false,
    revalidateFirstPage: true,
  };

  const {
    data: followingData,
    error: followingError,
    mutate: followingMutate,
  } = useSWRInfinite(
    (index) => `/socials/follows/following/except/${routeName}?page=${index + 1}&limit=100&search_word=${searchText}`,
    fetcher,
    options,
  );
  const {
    data: followerData,
    error: followerError,
    mutate: followerMutate,
  } = useSWRInfinite(
    (index) => `/socials/follows/follower/except/${routeName}?page=${index + 1}&limit=100&search_word=${searchText}`,
    fetcher,
    options,
  );

  const navigation = useNavigation<MainNavigationProp>();

  const followers = followerData ? [].concat(...followerData) : [];
  const followings = followingData ? [].concat(...followingData) : [];

  function fetcher(url: string) {
    return axios.get(url).then((response) => response.data);
  }

  useFocusEffect(
    useCallback(() => {
      console.log('useFocusEffect');
      (async () => {
        console.log('privateEnabled', privateEnabled);
        if (privateEnabled) {
          await followerMutate();
        } else {
          await followingMutate();
        }
      })();
    }, [followingMutate, followerMutate]),
  );

  LogUtil.info('followers', followers);
  LogUtil.info('followings', followings);
  const handleChange = (value: string) => {
    setSearchText(value);
    console.log(searchText);
  };

  return (
    <MainLayout>
      <BackHeader title={t('privacy.Add excepted users')} />
      <Column style={{ alignItems: 'center', paddingHorizontal: 20 }}>
        <View
          style={[
            tw`flex-row items-center my-5 border-b`,
            focus
              ? themeContext.dark
                ? { borderBottomColor: '#ffffff' }
                : { borderBottomColor: 'black' }
              : { borderBottomColor: COLOR.LIGHT_GRAY },
          ]}
        >
          <SearchIcon source={require('../../../../assets/ic-search.png')} />
          <TextInput
            style={[
              tw`flex-1 h-12 p-3`,
              themeContext.dark ? tw`text-white` : tw`text-black`,
              { fontSize: myUser?.setting?.ct_text_size as number },
            ]}
            value={searchText}
            placeholder={t('privacy.Search by name')}
            placeholderTextColor={'#999999'}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            onChangeText={handleChange}
          />
          {searchText !== '' && (
            <TouchIconContainer onPress={() => setSearchText('')}>
              <CloseIcon />
            </TouchIconContainer>
          )}
        </View>
      </Column>
      <ContactContainer>
        {privateEnabled ? (
          <SwrContainer data={followerData} error={followerError}>
            {/* @ts-ignore  */}
            {followers[0]?.items.length !== 0 ? (
              <>
                {/* @ts-ignore  */}
                {followers[0]?.items.map((user, index) => (
                  <Row key={index} style={{ alignItems: 'center', marginBottom: 20 }}>
                    <Avatar size={40} src={user.follower?.profile_image} />
                    <Space width={15} />
                    <Column style={{ flex: 1 }}>
                      <NameText>
                        {user.follower?.first_name}
                        {user.follower?.last_name}
                      </NameText>
                      <IDText>{`@${user.follower?.uid}`}</IDText>
                    </Column>
                    <Button
                      width={75}
                      height={35}
                      borderRadius
                      fontSize={13}
                      fontWeight={400}
                      variant={ButtonVariant.Outlined}
                      textvariant={ButtonTextVariant.Text}
                      redlined
                      redText
                      label={t('privacy.Except')}
                      onPress={() => {
                        post(`/auth/user-setting/${routeName}/except/${user.follower?.id}`, {}).then(async () => {
                          console.log('성공');
                          await followerMutate();
                          navigation.goBack();
                        });
                      }}
                    />
                  </Row>
                ))}
              </>
            ) : // @ts-ignore
            searchText.length !== 0 && followers[0]?.items.length === 0 ? (
              <>
                <Space height={60} />
                <Center>
                  <Icon source={require('../../../../assets/ic-nocontract.png')} />
                  <DescText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                    {t('privacy.No Results')}
                  </DescText>
                  <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{`${t(
                    'privacy.There were no results for',
                  )} '${searchText}'`}</Description>
                </Center>
              </>
            ) : (
              <>
                <Space height={60} />
                <Center>
                  <Icon source={require('../../../../assets/ic-nocontract.png')} />
                  <DescText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                    {t('privacy.No Followers')}
                  </DescText>
                  <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                    {t('privacy.Make Followers to enjoy Kok Kok Me')}
                  </Description>
                </Center>
              </>
            )}
          </SwrContainer>
        ) : (
          <SwrContainer data={followingData} error={followingError}>
            {/* @ts-ignore */}
            {followings[0]?.items.length !== 0 ? (
              <>
                {/* @ts-ignore */}
                {followings[0]?.items.map((user, index) => (
                  <Row key={index} style={{ alignItems: 'center', marginBottom: 20 }}>
                    <Avatar size={40} src={user.following?.profile_image} />
                    <Space width={15} />
                    <Column style={{ flex: 1 }}>
                      <NameText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                        {user.following?.first_name}
                        {user.following?.last_name}
                      </NameText>
                      <IDText
                        style={{ fontSize: myUser?.setting?.ct_text_size as number }}
                      >{`@${user.following?.uid}`}</IDText>
                    </Column>
                    <Button
                      width={75}
                      height={35}
                      borderRadius
                      fontSize={13}
                      fontWeight={400}
                      variant={ButtonVariant.Outlined}
                      textvariant={ButtonTextVariant.Text}
                      redlined
                      redText
                      label={t('privacy.Except')}
                      onPress={() => {
                        post(`/auth/user-setting/${routeName}/except/${user.following?.id}`, {}).then(async () => {
                          console.log('성공');
                          await followerMutate();
                          navigation.goBack();
                        });
                      }}
                    />
                  </Row>
                ))}
              </>
            ) : // @ts-ignore
            searchText.length !== 0 && followings[0]?.items.length === 0 ? (
              <>
                <Space height={60} />
                <Center>
                  <Icon source={require('../../../../assets/ic-nocontract.png')} />
                  <DescText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                    {t('privacy.No Results')}
                  </DescText>
                  <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{`${t(
                    'privacy.There were no results for',
                  )} '${searchText}'`}</Description>
                </Center>
              </>
            ) : (
              <>
                <Space height={60} />
                <Center>
                  <Icon source={require('../../../../assets/ic-nocontract.png')} />
                  <DescText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                    {t('privacy.No Followings')}
                  </DescText>
                  <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                    {t('privacy.Follow users to enjoy Kok Kok Me')}
                  </Description>
                </Center>
              </>
            )}
          </SwrContainer>
        )}
      </ContactContainer>
    </MainLayout>
  );
}

export default AddExcept;
