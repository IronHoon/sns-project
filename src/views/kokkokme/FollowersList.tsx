import { t } from 'i18next';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, View } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import styled from 'styled-components';

import SwrContainer from 'components/containers/SwrContainer';
import { SearchBar } from 'components/molecules/search-bar';
import { TabMenu } from 'components/molecules/tab-menu';
import { FOLLOW } from 'constants/MENU';
import { useFetchWithType } from 'net/useFetch';
import { FollowerList, FollowingList, IItem } from 'types/socials';
import ResultBlock from 'views/kokkokme/components/followers-list/ResultBlock';
import { NoResult } from 'views/kokkokme/components/search';
import { cancelFollow, followBack } from 'utils';
import { useAtomValue } from 'jotai';
import userAtom from '../../stores/userAtom';
import useSWRInfinite from 'swr/infinite';
import axios from 'axios';
import friendListAtom from '../../stores/friendListAtom';

const Container = styled(KeyboardAvoidingView)`
  flex: 1;
`;
const SearchBarContainer = styled(View)`
  padding: 20px 20px 0;
`;
const ResultsContainer = styled(FlatList)`
  padding: 0 20px;
`;

const FollowersList = () => {
  const {
    // @ts-ignore
    params: { id },
  } = useRoute();

  const user = useAtomValue(userAtom);
  const [view, setView] = useState('followers');
  const [searchValue, setSearchValue] = useState('');
  const [targetList, setTargetList] = useState<IItem[]>([]);
  const [touch, setTouch] = useState(false);
  const [size, setSize] = useState(1);
  const friendList = useAtomValue(friendListAtom);

  const options = {
    initialSize: 1,
    revalidateAll: false,
    revalidateFirstPage: true,
  };

  const {
    data: followingData,
    error: followingError,
    mutate: followingMutate,
    size: followingSize,
    setSize: followingSetSize,
  } = useSWRInfinite(
    (index) => `/socials/follows/${id}/following?search_word=${searchValue}&page=${index + 1}&limit=10`,
    fetcher,
    options,
  );

  const {
    data: followerData,
    error: followerError,
    mutate: followerMutate,
    size: followerSize,
    setSize: followerSetSize,
  } = useSWRInfinite(
    (index) => `/socials/follows/${id}/follower?search_word=${searchValue}&page=${index + 1}&limit=10`,
    fetcher,
    options,
  );

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await followingMutate();
        await followerMutate();
      })();
    }, [followingMutate, followerMutate, targetList]),
  );

  const following = followingData
    ? followingData
        .map((item) => item.items)
        .reduce((acc, cur) => {
          return acc.concat(cur);
        })
    : [];
  const follower = followerData
    ? followerData
        .map((item) => item.items)
        .reduce((acc, cur) => {
          return acc.concat(cur);
        })
    : [];

  const defaultImageFollowing = (i: any) => {
    if (following?.[i].following) {
      const isFriend = friendList?.filter((item) => item === following?.[i].following.id).length === 1;
      if (following?.[i].following.sc_profile_photo === 'friends' && isFriend) {
        if (following?.[i].following.profile_image === null) {
          return '';
        } else {
          return following?.[i].following.profile_image;
        }
      } else if (following?.[i].following.sc_profile_photo === 'public') {
        if (following?.[i].following.profile_image === null) {
          return '';
        } else {
          return following?.[i].following.profile_image;
        }
      } else {
        return '';
      }
    } else {
      return undefined;
    }
  };

  const defaultImageFollower = (i: any) => {
    if (follower?.[i].follower) {
      const isFriend = friendList?.filter((item) => item === follower?.[i].follower.id).length === 1;
      if (follower?.[i].follower.sc_profile_photo === 'friends' && isFriend) {
        if (follower?.[i].follower.profile_image === null) {
          return '';
        } else {
          return follower?.[i].follower.profile_image;
        }
      } else if (follower?.[i].follower.sc_profile_photo === 'public') {
        if (follower?.[i].follower.profile_image === null) {
          return '';
        } else {
          return follower?.[i].follower.profile_image;
        }
      } else {
        return '';
      }
    } else {
      return undefined;
    }
  };

  const defaultImageTarget = (i: any) => {
    if (targetList && targetList?.[i].following) {
      const isFriend = friendList?.filter((item) => item === targetList?.[i].following?.id).length === 1;
      if (targetList?.[i].following?.sc_profile_photo === 'friends' && isFriend) {
        if (targetList?.[i].following?.profile_image === null) {
          return '';
        } else {
          return targetList?.[i].following?.profile_image;
        }
      } else if (targetList?.[i].following?.sc_profile_photo === 'public') {
        if (targetList?.[i].following?.profile_image === null) {
          return '';
        } else {
          return targetList?.[i].following?.profile_image;
        }
      } else {
        return '';
      }
    } else {
      return '';
    }
  };
  function fetcher(url: string) {
    return axios.get(url).then((response) => response.data);
  }

  useEffect(() => {
    (async () => {
      console.log('여기 들어옴?');
      await setSize(size + 1);
    })().then(async () => {
      await followingSetSize(size);
      setTargetList(following);
    });
  }, [touch]);

  const selectTab = async (value: string) => {
    setView(value);
    await followingMutate();
    await followerMutate();

    setTargetList(following || []);
  };

  const handleChange = (value: string) => setSearchValue(value);

  const mutateOnSuccessReq = async () => {
    await followingMutate();
    await followerMutate();
  };

  const cancelRequest = (itemId: number, followingId: number) => {
    setTargetList(targetList.map((item) => (item.id === itemId ? { ...item, isCanceled: true } : { ...item })));
    console.log('팔로우취소');
    cancelFollow(followingId, mutateOnSuccessReq);
  };

  const requestFollow = (itemId: number, followingId: number) => {
    setTargetList(targetList.map((item) => (item.id === itemId ? { ...item, isCanceled: false } : { ...item })));

    followBack(followingId, mutateOnSuccessReq);
  };

  return (
    <Container behavior="padding">
      <TabMenu menu={FOLLOW} initialValue="followers" onPress={selectTab} />
      <SearchBarContainer>
        <SearchBar
          placeholder={t('new-post.Search by Name or KokKok ID')}
          value={searchValue}
          onChange={handleChange}
        />
      </SearchBarContainer>
      {view === 'followers' && (
        <SwrContainer data={followerData} error={followerError}>
          {!follower?.length ? (
            !searchValue.length ? (
              <></>
            ) : (
              <NoResult value={searchValue} />
            )
          ) : (
            <ResultsContainer
              data={follower}
              renderItem={({ item, index }: any) => (
                <ResultBlock
                  me={user?.id === id}
                  key={item.id}
                  followStatus={!item.connected ? 'followingBack' : 'following'}
                  name={`${item.follower.first_name} ${item.follower.last_name}`}
                  profileImage={defaultImageFollower(index)}
                  uid={item.follower.uid}
                  onCancelFollow={() => cancelFollow(item.user_id, mutateOnSuccessReq)}
                  onFollowBack={() => followBack(item.user_id, mutateOnSuccessReq)}
                />
              )}
              onEndReachedThreshold={0.01}
              onEndReached={() => followerSetSize(followerSize + 1)}
            />
          )}
        </SwrContainer>
      )}
      {view === 'following' && (
        <SwrContainer data={followingData} error={followingError}>
          {!following?.length ? (
            !searchValue.length ? (
              <></>
            ) : (
              <NoResult value={searchValue} />
            )
          ) : searchValue.length ? (
            <ResultsContainer
              data={following}
              renderItem={({ item, index }: any) => (
                <ResultBlock
                  me={user?.id === id}
                  key={item.following.uid}
                  followingId={item.following.id}
                  followStatus={
                    item.isCanceled ? 'followingBack' : item.status === 'private' ? 'requested' : 'following'
                  }
                  itemId={item.id}
                  name={`${item.following.first_name} ${item.following.last_name}`}
                  profileImage={defaultImageFollowing(index)}
                  uid={item.following.uid}
                  onCancelRequest={cancelRequest}
                  onRequestFollow={requestFollow}
                />
              )}
              onEndReachedThreshold={0.1}
              onEndReached={async () => {
                await followingSetSize(followingSize + 1);
                await followingMutate();
                console.log('followingSize ', followingSize);
                console.log('following length', following.length);
              }}
            />
          ) : (
            <ResultsContainer
              data={targetList}
              renderItem={({ item, index }: any) => (
                <ResultBlock
                  me={user?.id === id}
                  key={item.following.uid}
                  followingId={item.following.id}
                  followStatus={
                    item.isCanceled ? 'followingBack' : item.status === 'private' ? 'requested' : 'following'
                  }
                  itemId={item.id}
                  name={`${item.following.first_name} ${item.following.last_name}`}
                  //@ts-ignore
                  profileImage={defaultImageTarget(index)}
                  uid={item.following.uid}
                  onCancelRequest={cancelRequest}
                  onRequestFollow={requestFollow}
                />
              )}
              onEndReachedThreshold={0.01}
              onEndReached={() => {
                followingSetSize(followingSize + 1).then(() => {
                  console.log('followingSize ', followingSize);
                  console.log('targetList length', targetList.length);
                  setTouch(!touch);
                });
              }}
            />
          )}
        </SwrContainer>
      )}
    </Container>
  );
};

export default FollowersList;
