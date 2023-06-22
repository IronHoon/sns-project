import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Platform, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import styled from 'styled-components';

import SwrContainer from 'components/containers/SwrContainer';
import { MainNavigationProp } from 'navigations/MainNavigator';
import useFetch from 'net/useFetch';
import User from 'types/auth/User';
import Region from 'types/socials/posts/Region';
import Post from 'types/socials/likes/Post';
import { cancelLikePost, deletePost, likePost } from 'utils';
import Content from 'views/kokkokme/components/timeline/Content';
import MapPreview from 'views/kokkokme/components/timeline/MapPreview';
import MetaInfoButtons from 'views/kokkokme/components/timeline/MetaInfoButtons';
import PostHeader from 'views/kokkokme/components/timeline/PostHeader';
import TaggedUsers from 'views/kokkokme/components/timeline/TaggedUsers';
import VideoPlayerAnd from 'views/kokkokme/components/timeline/VideoPlayerAnd';
import VideoPlayerIos from 'views/kokkokme/components/timeline/VideoPlayerIos';
import Images from './Images';
import LikedBy from './LikedBy';
import { useAtom, useAtomValue } from 'jotai';
import userAtom from '../../../../stores/userAtom';
import Space from '../../../../components/utils/Space';
import Location from './Location';
import LogUtil from '../../../../utils/LogUtil';
import friendListAtom from '../../../../stores/friendListAtom';
import { LinkPreview } from '@flyerhq/react-native-link-preview';

const Container = styled(View)`
  padding: 15px 0;
  min-height: 5px;
`;

interface PostProps {
  post: Post;
  searchValue?: string;
  mutate: () => void;
  setIsSearching?: (boolean) => void;
  setIsClick?: (boolean) => void;
  isPlay?: boolean;
  setIsVisible?: any;
  setIsUrl?: any;
}

export default function PostItem({
  isPlay,
  post,
  mutate,
  searchValue,
  setIsSearching,
  setIsClick,
  setIsVisible,
  setIsUrl,
}: PostProps) {
  // TODO: image 배열에서 비디오 받아오도록 수정 필요
  const VIDEO = '';
  // const VIDEO = require('assets/broadchurch.mp4');

  const {
    _id,
    commentcount,
    contents,
    created_at,
    image,
    is_like,
    latitude,
    likecount,
    longitude,
    taged_user_ids,
    user_id,
    user,
    region,
    media,
  } = post;

  if (setIsSearching) {
    setIsSearching(true);
  }

  const { data: likesData, error: likesError, mutate: likesMutate } = useFetch(`/socials/likes/${_id}?page=1&limit=10`);
  const navigation = useNavigation<MainNavigationProp>();
  const me = useAtomValue(userAtom);
  const [isMap, setIsMap] = useState(false);

  const [profileImage, setProfileImage] = useState<string>('');
  const friendList = useAtomValue(friendListAtom);

  const isMe = user_id === me?.id;

  const [firstLiker, setFirstLiker] = useState<string>('');
  const [coords, setCoords] = useState<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const myUser: User | null = useAtomValue(userAtom);

  useFocusEffect(
    useCallback(() => {
      setCoords({
        ...coords,
        latitude: latitude,
        longitude: longitude,
      });
    }, [post]),
  );
  useFocusEffect(
    useCallback(() => {
      if (likesData?.docs.length) {
        setFirstLiker(`${likesData?.docs[0].user_info.first_name} ${likesData?.docs[0].user_info.last_name}`);
      }
    }, [likesData]),
  );

  const goToDetailPage = () => {
    navigation.navigate('/kokkokme/:id', { id: _id });
    if (setIsClick) {
      setIsClick(true);
    }
  };

  const onSuccessPostReq = async () => await mutate();
  const onSuccessLikeReq = async () => {
    await likesMutate();
    await mutate();
  };

  const handlePressLike = () => {
    is_like ? cancelLikePost(likesData!.docs, me?.id, onSuccessLikeReq) : likePost(_id, user_id, onSuccessLikeReq);
  };

  useEffect(() => {
    // const isFriend = friendList?.filter((item) => item === user.id).length === 1;

    if (user.sc_profile_photo === 'private') {
      setProfileImage('');
    } else {
      setProfileImage(user.profile_image);
    }
  }, []);

  useEffect(() => {
    // const isFriend = friendList?.filter((item) => item === user.id).length === 1;
    if (user.sc_profile_photo === 'friends') {
      setProfileImage(user.profile_image);
    } else if (user.sc_profile_photo === 'public') {
      setProfileImage(user.profile_image);
    } else if (user.sc_profile_photo === 'private') {
      setProfileImage('');
    } else {
      setProfileImage(user.profile_image);
    }
  }, [user.sc_profile_photo, user.profile_image]);

  return (
    <Container>
      <PostHeader
        mutate={mutate}
        date={created_at}
        isOfficial={user?.official_account}
        name={`${user?.first_name} ${user?.last_name}`}
        postId={_id}
        profileImage={isMe ? user.profile_image : profileImage}
        user={user as User}
        deletePost={() => deletePost(_id, onSuccessPostReq)}
      />
      {!!image?.length && (
        <>
          <Images images={image} />
          <Space height={10} />
        </>
      )}
      {!!media?.length && (
        <>
          <Images media={media} />
          <Space height={10} />
        </>
      )}
      {!!contents?.length && (
        <Content
          myUser={myUser as User}
          setIsUrl={setIsUrl}
          setIsVisible={setIsVisible}
          media={!!media?.length}
          content={contents}
          searchValue={searchValue}
          onPress={goToDetailPage}
        />
      )}
      {!!region && <Location region={region} onPress={setIsMap} isMap={isMap} />}
      {isMap && (
        <>
          <Space height={15} />
          <MapPreview
            region={{
              latitude: latitude,
              longitude: longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            address={region}
            readOnly={true}
          />
        </>
      )}
      {!!taged_user_ids?.length && <TaggedUsers data={taged_user_ids} />}
      <MetaInfoButtons
        isLiked={is_like}
        likes={likecount}
        comments={commentcount}
        pressComment={goToDetailPage}
        pressLike={handlePressLike}
      />
      <SwrContainer data={likesData} error={likesError}>
        {!!likecount ? <LikedBy myUser={myUser as User} count={likecount} likedBy={firstLiker} postId={_id} /> : <></>}
      </SwrContainer>
    </Container>
  );
}
