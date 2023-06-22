import { useAtomValue } from 'jotai';
import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text,
  FlatList,
  Dimensions,
  Pressable,
  Keyboard,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components';

import SwrContainer from 'components/containers/SwrContainer';
import { COLOR } from 'constants/COLOR';
import { useFetchWithType } from 'net/useFetch';
import Comments from 'types/socials/comments/Comments';
import { LikesList } from 'types/socials/likes/LikesList';
import IPostDetail from 'types/socials/posts/PostDetail';
import { IRouteParamsStr } from 'types/socials/posts/RouteParams';
import { cancelLikePost, deletePost, likePost, postComment } from 'utils';
import CommentsContainer from 'views/kokkokme/components/detail/CommentsContainer';
import InputComment from 'views/kokkokme/components/detail/InputComment';
import Content from 'views/kokkokme/components/timeline/Content';
import Images from 'views/kokkokme/components/timeline/Images';
import LikedBy from 'views/kokkokme/components/timeline/LikedBy';
import MetaInfoButtons from 'views/kokkokme/components/timeline/MetaInfoButtons';
import PostHeader from 'views/kokkokme/components/timeline/PostHeader';
import TaggedUsers from 'views/kokkokme/components/timeline/TaggedUsers';
import VideoPlayerIos from 'views/kokkokme/components/timeline/VideoPlayerIos';
import VideoPlayerAnd from 'views/kokkokme/components/timeline/VideoPlayerAnd';
import LocationIcon from 'assets/kokkokme/new-post/ic_location.svg';
import userAtom from '../../stores/userAtom';
import { Row } from '../../components/layouts/Row';
import Location from './components/timeline/Location';
import MapPreview from './components/timeline/MapPreview';
import Space from '../../components/utils/Space';
import useSWRInfinite from 'swr/infinite';
import axios from 'axios';
import Comment from './components/detail/Comment';
import NoResultPost from './NoResultPost';
import { LinkPreview } from '@flyerhq/react-native-link-preview';
import Padding from 'components/containers/Padding';
import DownIcon from 'assets/contacts/ic_down_14.svg';
import { t } from 'i18next';
import { Options } from 'components/modal';
import { get } from 'net/rest/api';
import { Column } from 'components/layouts/Column';
import ChatWebView from '../chats/components/chatbubble/ChatWebView';
import User from 'types/auth/User';

const Wrapper = styled(KeyboardAvoidingView)`
  background-color: ${({ theme }) => (theme.dark ? '#585858' : '#ffffff')};
  flex: 1;
`;
const Inner = styled(View)`
  padding: 15px 20px;
`;
const FlexContainer = styled(View)`
  background-color: ${({ theme }) => (theme.dark ? '#585858' : COLOR.LIGHT_GRAY)};
  padding: 0 20px;
  width: 100%;
`;
const ButtonWrap = styled(View)`
  position: relative;
`;
const SelectButtonWrap = styled(Pressable)`
  /* position: absolute; */
  transform: translateY(-5px);
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
  height: 32px;
  /* width: 170px; */
  flex: 1;
  max-width: 170px;
  border-radius: 8px;
  border: 1px solid #ededed;
  flex-wrap: nowrap;
  /* background-color: #fff; */
`;
const SelectButton = styled(View)`
  color: ${COLOR.BLACK};
  flex: 1;
  font-size: 16px;
  padding-left: 2px;
`;
const SelectButtonText = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.TEXT_GRAY)};
`;

const PostDetail = ({ id }: IRouteParamsStr) => {
  const [sorting, setSorting] = useState(-1);
  const [modalVisible, setModalVisible] = useState(false);
  const openOptions = (bool: boolean) => setModalVisible(bool);
  const [optionList, setOptionList] = useState(t('common.Comments (Newest)'));
  const me = useAtomValue(userAtom);
  const [isUrl, setIsUrl] = useState('');
  const [isWebVisible, setIsWebVisible] = useState(false);
  const {
    data: postData,
    error: postError,
    mutate: postMutate,
  } = useFetchWithType<IPostDetail>(`/socials/posts/${id}`);
  const { data: likesData, mutate: likesMutate } = useFetchWithType<LikesList>(`/socials/likes/${id}?page=1&limit=10`);

  const options = {
    initialSize: 1,
    revalidateAll: false,
    revalidateFirstPage: true,
  };

  const {
    data: commentsData,
    error: commentsError,
    mutate: commentsMutate,
    size,
    setSize,
  } = useSWRInfinite(
    (index) => `/socials/comments?post_id=${id}&order=${sorting}&page=${index + 1}&limit=10`,
    fetcher,
    options,
  );

  useFocusEffect(
    useCallback(() => {
      (async () => await commentsMutate())();
    }, [commentsMutate]),
  );

  const comments = commentsData ? [].concat(...commentsData) : [];

  function fetcher(url: string) {
    return axios.get(url).then((response) => response.data);
  }

  const [isMap, setIsMap] = useState(false);
  const [firstLiker, setFirstLiker] = useState<string>('');

  useFocusEffect(
    useCallback(() => {
      commentsMutate();
      if (likesData?.docs.length) {
        setFirstLiker(`${likesData?.docs[0].user_info.first_name} ${likesData?.docs[0].user_info.last_name}`);
      }
    }, [likesData]),
  );

  const onSuccessPostReq = async () => await postMutate();

  const onSuccessLikeReq = async () => {
    await postMutate();
    await likesMutate();
  };

  const onSuccessCommReq = async () => {
    await postMutate();
    await commentsMutate();
  };

  const handlePressLike = () => {
    postData?.is_like
      ? cancelLikePost(likesData!.docs, me?.id, onSuccessLikeReq)
      : likePost(id, postData!.user_id, onSuccessLikeReq);
  };

  const handlePressPost = (value: string) => {
    postComment(id, value, me?.id, onSuccessCommReq);
    Keyboard.dismiss();
  };

  const isNotfound = useMemo(() => {
    if (postError) {
      return postError.response.status;
    } else {
      return false;
    }
  }, [postError]);

  if (isNotfound === 403) {
    return <NoResultPost type={403} />;
  }

  if (isNotfound === 404) {
    return <NoResultPost />;
  }

  const MENU = [
    {
      value: 'Comments (Newest)',
      label: t('common.Comments (Newest)'),
    },
    {
      value: 'Comments (Oldest)',
      label: t('common.Comments (Oldest)'),
    },
    {
      value: 'Cancel',
      label: t('common.Cancel'),
    },
  ];

  const handleMenuPress = async (value?: string) => {
    if (value === 'Cancel') {
      return;
    }

    if (value === 'Comments (Newest)') {
      //최신순 정렬
      await setSorting(-1);
      setOptionList(t('common.Comments (Newest)'));
      commentsMutate();
      setModalVisible(false);
    }
    if (value === 'Comments (Oldest)') {
      //오래된순 정렬
      await setSorting(1);
      setOptionList(t('common.Comments (Oldest)'));
      commentsMutate();
      setModalVisible(false);
    }
  };

  return (
    <Wrapper behavior={'padding'}>
      <FlatList
        data={comments}
        ListHeaderComponent={
          <SwrContainer data={postData} error={postError}>
            {postData && (
              <Inner>
                <PostHeader
                  mutate={postMutate}
                  date={postData.created_at}
                  isDetail={true}
                  isOfficial={postData.user.official_account}
                  name={`${postData.user.first_name} ${postData.user.last_name}`}
                  postId={id}
                  profileImage={postData.user.profile_image}
                  user={postData.user}
                  deletePost={() => deletePost(id, onSuccessPostReq)}
                />
                {!!postData.image.length && (
                  <>
                    <Images images={postData.image} />
                    <Space height={10} />
                  </>
                )}
                {!!postData.media.length && (
                  <>
                    <Images media={postData.media} />
                    <Space height={10} />
                  </>
                )}
                {/*/!* TODO: 화면 안에서 자동재생하도록 해야함 *!/*/}
                {!!postData.contents?.length && (
                  <Content
                    myUser={me as User}
                    media={false}
                    content={postData.contents}
                    isDetail
                    setIsUrl={setIsUrl}
                    setIsVisible={setIsWebVisible}
                  />
                )}
                {!!postData.region && <Location region={postData.region} onPress={setIsMap} isMap={isMap} />}
                {isMap && (
                  <>
                    <Space height={15} />
                    <MapPreview
                      region={{
                        latitude: postData.latitude,
                        longitude: postData.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                      }}
                      address={postData.region}
                      readOnly={true}
                    />
                  </>
                )}
                {!!postData.taged_user_ids.length && <TaggedUsers data={postData.taged_user_ids} />}
                <Padding />
                <ButtonWrap>
                  <Column style={{ flex: 1 }}>
                    <Row>
                      <View style={{ flex: 1 }}>
                        <MetaInfoButtons
                          isLiked={Boolean(postData.is_like)}
                          likes={postData.likecount}
                          comments={postData.commentcount}
                          pressLike={handlePressLike}
                        />
                      </View>
                      <SelectButtonWrap
                        onPress={() => {
                          setModalVisible(true);
                        }}
                      >
                        <SelectButton>
                          <SelectButtonText>{optionList}</SelectButtonText>
                        </SelectButton>
                        <DownIcon />
                      </SelectButtonWrap>
                    </Row>
                    {!!postData.likecount && (
                      <LikedBy myUser={me as User} count={postData.likecount} likedBy={firstLiker} postId={id} />
                    )}
                  </Column>

                  <Options
                    menu={MENU}
                    modalVisible={modalVisible}
                    onBackdropPress={() => setModalVisible(false)}
                    onMenuPress={handleMenuPress}
                    onPress={openOptions}
                  />
                </ButtonWrap>
              </Inner>
            )}
          </SwrContainer>
        }
        //@ts-ignore
        renderItem={(comment: Comments) => {
          return (
            <>
              {commentsData?.length ? (
                <FlexContainer>
                  <SwrContainer data={commentsData} error={commentsError}>
                    <Comment
                      key={comment._id}
                      postMutate={postMutate}
                      commentMutate={commentsMutate}
                      data={comment}
                      onSuccessReq={onSuccessCommReq}
                    />
                  </SwrContainer>
                </FlexContainer>
              ) : (
                <></>
              )}
            </>
          );
        }}
        onEndReachedThreshold={0.01}
        onEndReached={() => setSize(size + 1)}
      />

      {/*<ScrollView contentContainerStyle={styles.container}>*/}
      {/*  */}
      {/*  {!!commentsData?.length && (*/}
      {/*    <FlexContainer>*/}
      {/*      <SwrContainer data={commentsData} error={commentsError}>*/}
      {/*        <CommentsContainer*/}
      {/*          postMutate={postMutate}*/}
      {/*          commentMutate={commentsMutate}*/}
      {/*          data={comments}*/}
      {/*          onSuccessReq={onSuccessCommReq}*/}
      {/*          handle={() => setSize(size + 1)}*/}
      {/*        />*/}
      {/*      </SwrContainer>*/}
      {/*    </FlexContainer>*/}
      {/*  )}*/}
      {/*</ScrollView>*/}
      <InputComment onPress={handlePressPost} commentMutate={commentsMutate} />
      <ChatWebView url={isUrl} isVisible={isWebVisible} setIsVisible={setIsWebVisible} />
    </Wrapper>
  );
};

export default PostDetail;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
