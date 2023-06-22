import React, { useCallback, useState } from 'react';
import { FlatList, Platform, Pressable, View } from 'react-native';
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
import Screen from '../../../../components/containers/Screen';
import BackHeader from '../../../../components/molecules/BackHeader';
import useSWRInfinite from 'swr/infinite';
import axios from 'axios';
import ChatWebView from '../../../chats/components/chatbubble/ChatWebView';

const Container = styled(View)`
  padding: 0 20px;
`;

const HashResult = () => {
  const options = {
    initialSize: 1,
    revalidateAll: false,
    revalidateFirstPage: true,
  };
  const {
    //@ts-ignore
    params: { hash },
  } = useRoute();

  const match = hash.match(/[\uac00-\ud7af]|[\u1100-\u11ff]|[\u3130-\u318f]|[\ua960-\ua97f]|[\ud7b0-\ud7ff]/g);
  console.log('match: ', match);
  const {
    data: hashData,
    error: hashError,
    mutate: hashMutate,
    size,
    setSize,
  } = useSWRInfinite(
    (index) =>
      Platform.OS === 'ios' && match?.length! > 0
        ? `/socials/search?type=hash&contents=${hash}&page=${index + 1}&limit=10`
        : `/socials/search?type=hash&contents=%23${hash.slice(1, hash.length)}&page=${index + 1}&limit=10`,
    fetcher,
    options,
  );
  const [isVisible, setIsVisible] = useState(false);
  const [isUrl, setIsUrl] = useState('');
  useFocusEffect(
    useCallback(() => {
      (async () => await hashMutate())();
    }, [hashMutate]),
  );
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
    <Screen>
      <BackHeader title={hash} hashNumber={hashData ? hashData[0].totalCount : 0} />
      <SwrContainer data={hashData} error={hashError}>
        {hashes ? (
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
                  searchValue={hash}
                  setIsVisible={setIsVisible}
                  setIsUrl={setIsUrl}
                />
              </Container>
            )}
            onEndReachedThreshold={0.01}
            onEndReached={() => setSize(size + 1)}
          />
        ) : (
          <NoResult value={hash} />
        )}
      </SwrContainer>
      <ChatWebView url={isUrl} isVisible={isVisible} setIsVisible={setIsVisible}></ChatWebView>
    </Screen>
  );
};

export default HashResult;
