import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import tw from 'twrnc';
import { SearchBar } from '../../components/molecules/search-bar';
import useFetch from '../../net/useFetch';
import SwrContainer from '../../components/containers/SwrContainer';
import ContactItem from './molecules/ContactItem';
import { useFocusEffect } from '@react-navigation/native';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import NoResult from './molecules/NoResult';
import { t } from 'i18next';
import { COLOR } from 'constants/COLOR';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

const SearchBarContainer = styled.View`
  height: 60px;
  border-bottom-color: ${COLOR.GRAY};
  border-bottom-width: 1px;
  padding: 20px;
  justify-content: center;
`;
const LabelContainer = styled.View`
  /* height: 45px; */
  padding: 15px 0px 15px 20px;
  border-bottom-color: ${COLOR.GRAY};
  border-bottom-width: 1px;
`;
const Contact = styled.Text<{ fontSize: number }>`
  font-size: ${({ fontSize }) => `${fontSize - 2}px`};
  font-weight: 500;
  color: #bbbbbb;
`;

function ContactsSearch({ navigation }) {
  const [keyword, setKeyword] = useState<string>('');
  const [touch, setTouch] = useState(false);
  const { data: contactsList, error: contactsError } = useFetch('/auth/contacts');

  const user = useAtomValue(userAtom);
  const themeFont = user?.setting.ct_text_size as number;

  useFocusEffect(
    useCallback(() => {
      setTouch(false);
      setKeyword('');
    }, []),
  );

  const systemAccountUserId = 5;
  const filter = useCallback(
    (contact) => {
      const { friend } = contact;
      if (friend.id === systemAccountUserId) {
        return false;
      }

      if (friend.email !== null && keyword !== '') {
        if (friend.email.toLowerCase().includes(keyword.toLowerCase())) {
          return true;
        }
      }
      if (friend.contact.includes(keyword)) {
        return true;
      }
      if (friend.first_name.toLowerCase().includes(keyword.toLowerCase())) {
        return true;
      }
      if (friend.last_name.toLowerCase().includes(keyword.toLowerCase())) {
        return true;
      }
      if (friend.uid.toLowerCase().includes(keyword.toLowerCase())) {
        return true;
      }

      return false;
    },
    [keyword],
  );

  const filtered = useMemo(() => {
    return contactsList.filter((contact) => filter(contact));
  }, [contactsList, filter]);

  useEffect(() => {
    if (keyword && !touch) {
      setTouch(true);
    }
  }, [keyword, touch]);

  return (
    <MainLayout>
      <SearchBarContainer>
        <SearchBar
          onChange={setKeyword}
          value={keyword}
          placeholder={t('contacts-search.Search within your contact list')}
          withCancel={true}
          autoFocus={true}
          fontSize={themeFont}
        />
      </SearchBarContainer>
      <View style={tw`flex-1`}>
        <SwrContainer data={contactsList} error={contactsError}>
          <>
            {touch && keyword.length ? (
              filtered.length ? (
                <>
                  <LabelContainer>
                    <Contact fontSize={themeFont}>{t('contacts-search.Contacts')}</Contact>
                  </LabelContainer>
                  {filtered.map((item, i) => (
                    <ContactItem key={i} user={item?.friend} highlight={true} searchValue={keyword} />
                  ))}
                </>
              ) : (
                <NoResult value={keyword} fontSize={themeFont} />
              )
            ) : (
              <></>
            )}
          </>
        </SwrContainer>
      </View>
    </MainLayout>
  );
}

export default ContactsSearch;
