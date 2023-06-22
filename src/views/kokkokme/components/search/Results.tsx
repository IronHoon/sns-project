import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Platform, Pressable, View, Text, ScrollView, LogBox } from 'react-native';
import styled from 'styled-components';

import { TabMenu } from 'components/molecules/tab-menu';
import { SEARCH } from 'constants/MENU';
import AccountResult from 'views/kokkokme/components/search/AccountResult';
import PostItem from 'views/kokkokme/components/timeline/PostItem';
import Searching from 'views/kokkokme/components/search/Searching';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp } from '../../../../navigations/MainNavigator';
import { NoResult } from './index';
import { useFetchWithType } from '../../../../net/useFetch';
import SwrContainer from '../../../../components/containers/SwrContainer';
import { hasHms } from 'react-native-device-info';
import { isUndefined } from 'swr/dist/utils/helper';
import useSWRInfinite from 'swr/infinite';
import axios from 'axios';
import { COLOR } from '../../../../constants/COLOR';
import ChatWebView from '../../../chats/components/chatbubble/ChatWebView';

const Container = styled(View)`
  padding: 0 20px;
`;

const ShowResult = styled(View)`
  height: 40px;
  justify-content: center;
  align-items: center;
`;

interface Props {
  data: any;
  initialTab: string;
  isSearching: boolean;
  searchValue: string;
  type: string;
  onPress: (value: string) => void;
  mutate: () => void;
  setSize: (number) => void;
  size: number;
  setIsSearching: (boolean) => void;
  isFocus: boolean;
  swrData: any;
  swrError: any;
}

const Results = ({
  setIsSearching,
  data,
  mutate,
  initialTab,
  isSearching,
  searchValue,
  type,
  onPress,
  setSize,
  size,
  swrData,
  swrError,
  isFocus,
}: Props) => {
  const navigation = useNavigation<MainNavigationProp>();
  const [isVisible, setIsVisible] = useState(false);
  const [isUrl, setIsUrl] = useState('');
  LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);
  if (searchValue[0] === '#') {
    const match = searchValue.match(/[\uac00-\ud7af]|[\u1100-\u11ff]|[\u3130-\u318f]|[\ua960-\ua97f]|[\ud7b0-\ud7ff]/g);
    const options = {
      initialSize: 1,
      revalidateAll: false,
      revalidateFirstPage: true,
    };

    const {
      data: hashData,
      error: hashError,
      mutate: hashMutate,
      size,
      setSize,
    } = useSWRInfinite(
      (index) =>
        Platform.OS === 'ios' && match?.length! > 0
          ? `/socials/search?type=hash&contents=${searchValue}&page=${index + 1}&limit=10`
          : `/socials/search?type=hash&contents=%23${searchValue.slice(1, searchValue.length)}&page=${
              index + 1
            }&limit=10`,
      fetcher,
      options,
    );

    useFocusEffect(
      useCallback(() => {
        (async () => {
          await hashMutate();
        })();
      }, [hashMutate]),
    );
    //
    const hashes = hashData
      ? hashData
          ?.map((item) => item.result)
          .reduce((acc, cur) => {
            return acc.concat(cur);
          })
      : [];

    function fetcher(url: string) {
      return axios.get(url).then((response) => response.data);
    }

    return (
      <SwrContainer data={hashData} error={hashError}>
        <>
          {!hashes ? (
            <NoResult value={searchValue} />
          ) : (
            <>
              <FlatList
                data={hashes}
                renderItem={({ item }) => (
                  <Container
                    key={
                      //@ts-ignore
                      item._id
                    }
                  >
                    <PostItem
                      post={item}
                      mutate={hashMutate}
                      searchValue={searchValue}
                      setIsVisible={setIsVisible}
                      setIsUrl={setIsUrl}
                    />
                  </Container>
                )}
              />
              <ShowResult>
                <Pressable
                  onTouchStart={() => {
                    navigation.navigate('/kokkokme/kokkokme-search/hash', {
                      hash: searchValue,
                      setIsSearching: setIsSearching,
                    });
                  }}
                >
                  <Text style={{ color: COLOR.BLUE }}>See all results</Text>
                </Pressable>
              </ShowResult>
            </>
          )}
          <ChatWebView url={isUrl} isVisible={isVisible} setIsVisible={setIsVisible}></ChatWebView>
        </>
      </SwrContainer>
    );
  }

  if (searchValue.length) {
    // if (isSearching) {
    //   return (
    //     <FlatList
    //       data={data}
    //       renderItem={({ item }) => <Searching key={item.id} data={item} searchValue={searchValue} />}
    //       onEndReachedThreshold={0.01}
    //       onEndReached={() => setSize(size + 1)}
    //     />
    //   );
    // } else
    if (searchValue[0] !== '#') {
      return (
        <>
          <TabMenu menu={SEARCH} initialValue={initialTab} onPress={onPress} />
          <SwrContainer data={swrData} error={swrError}>
            {data.length === 0 ? (
              <NoResult value={searchValue} />
            ) : (
              <FlatList
                data={data}
                renderItem={({ item }) =>
                  type === 'users' ? (
                    <AccountResult key={item.id} data={item} />
                  ) : (
                    <Container key={item._id}>
                      <PostItem
                        post={item}
                        mutate={mutate}
                        searchValue={searchValue}
                        setIsVisible={setIsVisible}
                        setIsUrl={setIsUrl}
                      />
                    </Container>
                  )
                }
                onEndReachedThreshold={0.01}
                onEndReached={() => setSize(size + 1)}
              />
            )}
          </SwrContainer>
          <ChatWebView url={isUrl} isVisible={isVisible} setIsVisible={setIsVisible}></ChatWebView>
        </>
      );
    }
  }
  return <></>;
};

export default Results;
