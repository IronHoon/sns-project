import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import styled from 'styled-components';

import SwrContainer from 'components/containers/SwrContainer';
import { Row } from 'components/layouts/Row';
import { SearchBar } from 'components/molecules/search-bar';
import useFetch from 'net/useFetch';
import Results from 'views/kokkokme/components/search/Results';
import { NoResult } from 'views/kokkokme/components/search';
import { t } from 'i18next';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import useSWRInfinite from 'swr/infinite';
import axios from 'axios';
import { COLOR } from 'constants/COLOR';
import User from 'types/auth/User';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

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

const Search = () => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [type, setType] = useState<string>('users');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [initialTab, setInitialTab] = useState<string>('accounts');
  const [isFocus, setIsFocus] = useState(false);
  // const { data, error, mutate } = useFetch(`/socials/search?type=${type}&contents=${searchValue}&page=1&limit=10`);

  const options = {
    initialSize: 1,
    revalidateAll: false,
    revalidateFirstPage: true,
  };

  const {
    data: searchData,
    error: searchError,
    mutate: searchMutate,
    size,
    setSize,
  } = useSWRInfinite(
    (index) => `/socials/search?type=${type}&contents=${searchValue}&page=${index + 1}&limit=10`,
    fetcher,
    options,
  );

  useFocusEffect(
    useCallback(() => {
      (async () => await searchMutate())();
    }, [searchMutate]),
  );

  const search = searchData ? [].concat(...searchData) : [];

  function fetcher(url: string) {
    return axios.get(url).then((response) => response.data);
  }

  const handleChange = (value: string) => {
    setSearchValue(value);
    setIsSearching(true);
    // setType('users');
    // setInitialTab('accounts');
  };

  const selectTab = (value: string) => {
    setInitialTab(value);
    if (value === 'accounts') setType('users');
    else setType('keyword');
  };

  console.log('isFocus', isFocus);

  return (
    <Container behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SearchBarContainer align="center" justify="space-between">
        <SearchBar
          placeholder={t('Kok Kok-search.Name, keywords and #hashtags')}
          value={searchValue}
          withCancel
          onChange={handleChange}
          setIsFocus={setIsFocus}
          onEndEditing={() => setIsSearching(false)}
        />
      </SearchBarContainer>
      {!!searchValue.length && (
        <Results
          size={size}
          setSize={setSize}
          setIsSearching={setIsSearching}
          data={search}
          swrData={searchData}
          swrError={searchError}
          mutate={searchMutate}
          initialTab={initialTab}
          isSearching={isSearching}
          searchValue={searchValue}
          type={type}
          onPress={selectTab}
          isFocus={isFocus}
        />
      )}
    </Container>
  );
};

export default Search;
