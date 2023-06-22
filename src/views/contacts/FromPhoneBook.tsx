import React, { useCallback, useState } from 'react';
import BackHeader from '../../components/molecules/BackHeader';
import { useFocusEffect } from '@react-navigation/native';
import { useAtomValue } from 'jotai';
import localContactsAtom from '../../stores/localContactsAtom';
import useLocalContacts from '../../hooks/useLocalContacts';
import MainLayout from 'components/layouts/MainLayout';
import AlphabetList from 'react-native-flatlist-alphabet';
import styled from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import { Pressable, Text, View } from 'react-native';
import tw from 'twrnc';
import Space from 'components/utils/Space';
import { Row } from 'components/layouts/Row';
import { Avatar } from 'components/atoms/image';
import Add from 'assets/contacts/btn_add.svg';
import { post } from 'net/rest/api';
import User from 'types/auth/User';
import NoContacts from './molecules/NoContacts';
import { t } from 'i18next';
import AuthUtil from 'utils/AuthUtil';

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => (theme.dark ? '#69686a' : COLOR.WHITE)};
  margin-left: 12px;
  margin-right: 12px;
  margin-top: 5px;
  margin-bottom: 5px;
  border-radius: 10px;
  padding: 15px;
`;
const SectionHeaderWrap = styled.View`
  padding-left: 20px;
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
  height: 45px;
  justify-content: center;
`;
const SectionHeaderLabel = styled.Text`
  font-size: 13px;
  font-weight: 500;
  color: #bbbbbb;
`;
const Name = styled.Text`
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  margin-bottom: 5px;
`;
const UserId = styled.Text`
  font-size: 13px;
  color: #bcb3c5;
`;

function ContactItem({ user, addFriend }) {
  const [isFriend, setIsFriend] = useState<boolean>(user.friend.length === 0);

  const handleAddFriend = () => {
    addFriend(user.contact);
    setIsFriend(!isFriend);
  };

  return (
    <Container>
      <View style={tw`flex-row items-center flex-1`}>
        <Avatar size={40} src={user?.profile_image || ''} />
        <Space width={20} />
        <View style={{ flex: 1 }}>
          <Row>
            <Name numberOfLines={1}>{`${user?.first_name} ${user?.last_name}`}</Name>
          </Row>
          <UserId>@{user?.uid}</UserId>
        </View>
        {isFriend ? (
          <Pressable onPress={() => handleAddFriend()}>
            <Add />
          </Pressable>
        ) : (
          <Text style={{ color: '#bbbbbb', fontSize: 13 }}>{t('from-phonebook.Added')}</Text>
        )}
      </View>
    </Container>
  );
}

function FromPhoneBook() {
  const loadLocalContacts = useLocalContacts();
  const localContacts = useAtomValue(localContactsAtom);
  const [userData, setUserData] = useState<Array<User>>([]);
  const [contactList, setContactList] = useState<Array<string>>([]);
  const [isScroll, setIsScroll] = useState<boolean>(false);

  const getUsers = (contactList) => {
    post('/auth/contacts/search', { contacts: contactList }).then((res) => {
      // @ts-ignore
      setUserData(res);
    });
  };

  const addFriend = (contact) => {
    AuthUtil.requestAddFriend(contact).then(() => {
      getUsers(contactList);
    });
  };

  useFocusEffect(loadLocalContacts);

  useFocusEffect(
    useCallback(() => {
      let contactArr = [];
      localContacts.forEach((contact) => {
        let mobile = contact.phoneNumbers?.filter((number) => number.label == 'mobile');
        let number = mobile && mobile[0] !== undefined ? mobile[0].number : 'none';
        if (number !== 'none') {
          // @ts-ignore
          contactArr.push(number.replace(/[^0-9]/g, ''));
        }
      });
      setContactList(contactArr);
      getUsers(contactArr);
    }, [localContacts]),
  );

  const data = userData.map((contact, i) => ({
    value: contact.first_name,
    key: i,
    user: contact,
  }));

  return (
    <MainLayout>
      <BackHeader title={t('from-phonebook.From phonebook')} />
      {data.length === 0 ? (
        <NoContacts
          title={t('from-phonebook.No KokKok User')}
          text={t('from-phonebook.There is no Kok Kok user you can add')}
        />
      ) : (
        <AlphabetList
          //@ts-ignore
          onScrollBeginDrag={() => setIsScroll(true)}
          onScrollEndDrag={() => {
            setTimeout(() => {
              setIsScroll(false);
            }, 2000);
          }}
          containerStyle={{
            position: 'absolute',
            right: -15,
            top: -60,
          }}
          style={{}}
          // @ts-ignore
          data={data}
          indexLetterColor="#cccccc"
          indexLetterSize={10}
          renderItem={(data: any) => <ContactItem user={data.user} addFriend={addFriend} />}
          renderSectionHeader={(section) => (
            <SectionHeaderWrap>
              <SectionHeaderLabel>{section.title}</SectionHeaderLabel>
            </SectionHeaderWrap>
          )}
          stickySectionHeadersEnabled={false}
          letterIndexWidth={isScroll ? 40 : 0}
          alphabetContainer={{ width: 20 }}
        />
      )}
    </MainLayout>
  );
}

export default FromPhoneBook;
