import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Alert,
  AlertButton,
  BackHandler,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import styled from 'styled-components';

import { MainNavigationProp } from 'navigations/MainNavigator';
import { KokKokMeHeader } from 'views/kokkokme/components/header';
import { Timeline } from 'views/kokkokme/components/timeline';
import SwrContainer from '../../components/containers/SwrContainer';
import useFetch, { useFetchWithType } from '../../net/useFetch';
import tw from 'twrnc';
import PostDetail from '../../types/socials/posts/PostDetail';
import axios from 'axios';
import useSWRInfinite from 'swr/infinite';
import { IActivities, IActivityDocs } from '../../types/socials';
import NetInfo from '@react-native-community/netinfo';
import { t } from 'i18next';
import { useAtom } from 'jotai';

const Container = styled(View)`
  flex: 1;
  padding-bottom: ${Platform.OS === 'android' ? '35px' : '0px'};
`;

const KokKokMeMain = () => {
  const navigation = useNavigation<MainNavigationProp>();

  const options = {
    initialSize: 1,
    revalidateAll: false,
    revalidateFirstPage: true,
  };
  const { data, error, mutate, size, setSize } = useSWRInfinite(
    (index) => `/socials/timeline?page=${index + 1}&limit=10`,
    fetcher,
    options,
  );

  useFocusEffect(
    useCallback(() => {
      (async () => await mutate())();
    }, [mutate]),
  );

  // useFocusEffect(
  //   useCallback(() => {
  //     get('auth/contacts/suggestion')
  //       .then((result) => {
  //         console.log('내연락처를 추가한 유저의 아이디', result)
  //         //@ts-ignore
  //         setFriendList(result);
  //       })
  //       .catch((error) => {
  //         console.log('friendList Error', error);
  //       });
  //   }, []),
  // );

  const posts = data ? [].concat(...data) : [];

  function fetcher(url: string) {
    return axios.get(url).then((response) => response.data);
  }

  // console.log('데이터 길이 ', posts?.length);

  const {
    data: notiData,
    error: notiError,
    mutate: notiMutate,
  } = useFetchWithType<IActivities>('/socials/notis?page=1&limit=10');
  const [haveNewNoti, setHaveNewNoti] = useState(false);

  useFocusEffect(
    useCallback(() => {
      notiMutate();
      if (notiData) {
        setHaveNewNoti(notiData.docs.some((list) => !list.read));
      }
    }, [notiData, notiMutate]),
  );
  return (
    <Container>
      <View style={{ paddingLeft: 20, paddingRight: 20 }}>
        <SwrContainer data={data} error={error}>
          <KokKokMeHeader
            data={notiData}
            error={notiError}
            haveNewNoti={haveNewNoti}
            pressNoti={() => navigation.navigate('/kokkokme/activity')}
            pressSearch={() => navigation.navigate('/kokkokme/kokkokeme-search')}
            pressPost={() => navigation.navigate('/kokkokme/kokkokme-post')}
          />
        </SwrContainer>
      </View>
      <View style={tw`flex-1`}>
        <SwrContainer data={data} error={error}>
          <Timeline data={posts} mutate={mutate} handleOnEndReached={() => setSize(size + 1)} />
        </SwrContainer>
      </View>
    </Container>
  );
};

export default KokKokMeMain;
