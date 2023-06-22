import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
import ContactList from '../../../../types/contacts/ContactList';
import SwrContainer from '../../../../components/containers/SwrContainer';
import contactList from '../../../../types/contacts/ContactList';
import { post } from '../../../../net/rest/api';
import { useFocusEffect } from '@react-navigation/native';
import { t } from 'i18next';
import AuthUtil from 'utils/AuthUtil';
import { useAtomValue } from 'jotai';
import friendListAtom from 'stores/friendListAtom';
import { Avatar } from 'components/atoms/image';
import User from 'types/auth/User';
import userAtom from 'stores/userAtom';

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
  line-height: 18px;
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
  height: 40px;
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

function AddBlockedUser() {
  const url = ' ';
  const themeContext = useContext(ThemeContext);
  const [focus, setFocus] = useState(false);
  const [result, setResult] = useState<ContactList>();
  const [searchText, setSearchText] = useState('');
  const {
    data: contactsData,
    error: contactsError,
    mutate: contactsMutate,
  } = useFetchWithType<ContactList>('auth/contacts');
  const myUser: User | null = useAtomValue(userAtom);
  //나를 추가한 유저 리스트
  const addedMeList = useAtomValue(friendListAtom);

  const isPrivacy = (data) => {
    if (data.sc_profile_photo === 'public' || (data.sc_profile_photo === 'friends' && addedMeList?.includes(data.id))) {
      return false;
    } else {
      return true;
    }
  };

  useEffect(() => {
    const searchResult = contactsData;
    if (searchResult?.length === 0) {
      setResult(searchResult);
    } else {
      setResult(searchResult);
    }
  }, [searchText]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await contactsMutate();
      })();
    }, [contactsMutate]),
  );

  const searchResult = contactsData?.filter(
    (contact) =>
      contact.friend.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
      contact.friend.last_name.toLowerCase().includes(searchText.toLowerCase()) ||
      contact.friend.uid.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <MainLayout>
      <BackHeader title={t('privacy.Add block users')} />
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
      </Column>

      {searchText.length !== 0 ? (
        searchResult?.length !== 0 ? (
          <SwrContainer data={contactsData} error={contactsError}>
            <ContactContainer>
              {searchResult?.map((user, index) => (
                <Row key={index} style={{ alignItems: 'center', marginBottom: 20 }}>
                  <Avatar size={40} src={isPrivacy(user.friend) ? '' : user.friend.profile_image} />
                  <Column style={{ flex: 1, marginLeft: 15 }}>
                    <NameText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                      {user.friend.first_name} {user.friend.last_name}
                    </NameText>
                    <IDText
                      style={{ fontSize: myUser?.setting?.ct_text_size as number }}
                    >{`@${user.friend.uid}`}</IDText>
                  </Column>
                  <Button
                    label={t('privacy.Block')}
                    width={75}
                    height={35}
                    borderRadius
                    fontSize={13}
                    fontWeight={400}
                    variant={ButtonVariant.Outlined}
                    textvariant={ButtonTextVariant.Text}
                    redlined
                    redText
                    onPress={() => {
                      AuthUtil.requestBlockUser('sns', user.friend.id).then(async () => {
                        await contactsMutate();
                      });
                    }}
                  />
                </Row>
              ))}
            </ContactContainer>
          </SwrContainer>
        ) : (
          <>
            <Space height={60} />
            <Center>
              <Icon source={require('../../../../assets/ic-nocontract.png')} />
              <Text style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('privacy.No Results')}</Text>
              <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{`${t(
                'privacy.There were no results for',
              )} '${searchText}'`}</Description>
            </Center>
          </>
        )
      ) : searchResult?.length !== 0 ? (
        <SwrContainer data={contactsData} error={contactsError}>
          <ContactContainer>
            {searchResult?.map((user, index) => (
              <Row key={index} style={{ alignItems: 'center', marginBottom: 20 }}>
                <Avatar size={40} src={isPrivacy(user.friend) ? '' : user.friend.profile_image} />
                <Column style={{ flex: 1, marginLeft: 15 }}>
                  <NameText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                    {user.friend.first_name} {user.friend.last_name}
                  </NameText>
                  <IDText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{`@${user.friend.uid}`}</IDText>
                </Column>
                <Button
                  label={t('privacy.Block')}
                  width={75}
                  height={35}
                  borderRadius
                  fontSize={13}
                  fontWeight={400}
                  variant={ButtonVariant.Outlined}
                  textvariant={ButtonTextVariant.Text}
                  redlined
                  redText
                  onPress={() => {
                    AuthUtil.requestBlockUser('sns', user.friend.id).then(async () => {
                      await contactsMutate();
                    });
                  }}
                />
              </Row>
            ))}
          </ContactContainer>
        </SwrContainer>
      ) : (
        <>
          <Space height={60} />
          <Center>
            <Icon source={require('../../../../assets/ic-nocontract.png')} />
            <Text style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('privacy.No Contacts')}</Text>
            <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
              {t('privacy.Add friends to chat with them')}
            </Description>
          </Center>
        </>
      )}
    </MainLayout>
  );
}

export default AddBlockedUser;
