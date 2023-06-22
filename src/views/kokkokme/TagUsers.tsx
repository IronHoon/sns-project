import React, { useState, useCallback } from 'react';
import { FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import styled from 'styled-components';

import SwrContainer from 'components/containers/SwrContainer';
import { Row } from 'components/layouts/Row';
import { SearchBar } from 'components/molecules/search-bar';
import useFetch from 'net/useFetch';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import TagUsersResults from './components/search/TagUsersResults';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { t } from 'i18next';
import { NoResult } from './components/search';
import { COLOR } from 'constants/COLOR';

const Container = styled(KeyboardAvoidingView)`
  flex: 1;
`;
const SearchBarContainer = styled(Row)`
  border-bottom-color: ${COLOR.GRAY};
  border-bottom-style: solid;
  border-bottom-width: 1px;
  height: 60px;
  padding: 0 20px;
`;

interface Props {
  tagUsers: any[];
  setTagedUsers: (data: any) => void;
}

const TagUsers = ({ tagUsers, setTagedUsers }: Props) => {
  const [searchValue, setSearchValue] = useState('');
  const [result, setResult] = useState([]);
  const {
    data: userData,
    error: userError,
    mutate: searchMutate,
  } = useFetch(`/socials/follows/tag?search_word=${searchValue}&page=10&limit=0`);

  const navigation = useNavigation<MainNavigationProp>();

  useFocusEffect(
    useCallback(() => {
      if (userData) {
        setResult(userData.items);
      }
    }, [userData]),
  );

  const handleChange = (value: string) => {
    setSearchValue(value);
    (async () => {
      await searchMutate();
    })();
  };

  const onPress = (data: any) => {
    if (
      tagUsers
        .map((item) => {
          return item.uid === data.uid;
        })
        .includes(true)
    ) {
      navigation.goBack();
    } else {
      console.log('tag data', data);
      setTagedUsers([...tagUsers, data]);
      navigation.goBack();
    }
  };

  return (
    <>
      <Container behavior="padding">
        <SearchBarContainer align="center" justify="space-between">
          <SearchBar
            placeholder={t('common.Name and KokKok ID')}
            value={searchValue}
            withCancel
            onChange={handleChange}
          />
        </SearchBarContainer>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {!!searchValue.length && (
            <SwrContainer data={userData} error={userError}>
              {!result?.length ? (
                <NoResult value={searchValue} />
              ) : (
                <FlatList
                  data={result}
                  renderItem={({ item, index }) => (
                    <TagUsersResults key={index} searchValue={searchValue} data={item} onPress={onPress} />
                  )}
                />
              )}
            </SwrContainer>
          )}
        </KeyboardAvoidingView>
      </Container>
    </>
  );
};

export default TagUsers;
