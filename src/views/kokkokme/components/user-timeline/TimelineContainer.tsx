import { t } from 'i18next';
import React, { useCallback, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
// import styled from 'styled-components';
import styled from 'styled-components/native';
import { Avatar } from 'components/atoms/image';
import { Row } from 'components/layouts/Row';
import SwrContainer from 'components/containers/SwrContainer';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { useFetchWithType } from 'net/useFetch';
import { IFollowInfo } from 'types/socials';
import Timeline from 'types/socials/Timeline';
import HiddenAccount from 'views/kokkokme/components/user-timeline/HiddenAccount';
import PostItem from 'views/kokkokme/components/timeline/PostItem';
import PrivateAccount from 'views/kokkokme/components/user-timeline/PrivateAccount';
import UserInfo from 'views/kokkokme/components/user-timeline/UserInfo';

import Edit from 'assets/kokkokme/ic-edit.svg';
import useSWRInfinite from 'swr/infinite';
import axios from 'axios';
import Hidden from '../../../../assets/kokkokme/ic-hidden.svg';
import { Column } from '../../../../components/layouts/Column';
import { COLOR } from '../../../../constants/COLOR';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { multiUploadS3ByImagePicker } from '../../../../lib/uploadS3';
import { ModalBase } from '../../../../components/modal';
import Lightbox from 'react-native-lightbox-v2';
import { useEffect } from 'react';
import ChatWebView from '../../../chats/components/chatbubble/ChatWebView';
import NoPost from './NoPost';
import User from 'types/auth/User';
import userAtom from 'stores/userAtom';
import { useAtomValue } from 'jotai';
import { ScrollView } from 'react-native-gesture-handler';

const Container = styled(View)<{ isMe?: boolean }>`
  background: ${({ theme }) => (theme.dark ? '#585858' : '#ffffff')};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  flex: 1;
  margin-top: 50px;
  padding-top: ${({ isMe }) => (isMe ? 20 : 50)}px;
  /* z-index: 1; */
`;
const ButtonContainer = styled(Row)`
  padding: 0 20px 20px;
`;

const Title = styled(Text)`
  color: ${COLOR.BLACK};
  font-size: 18px;
  font-weight: 500;
  margin-top: 11px;
`;
const ConfirmButton = styled(TouchableOpacity)`
  background-color: ${COLOR.PRIMARY};
  width: 200px;
  height: 55px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${COLOR.PRIMARY};
  margin-bottom: 10px;
`;
const ConfirmLabel = styled(Text)`
  color: #fff;
  font-size: 15px;
  font-weight: bold;
`;
const ModalTitle = styled(Text)`
  font-size: 15px;
  color: black;
  padding: 10px;
  font-weight: bold;
`;
const ProfileContainer = styled(Lightbox)<{ open: boolean }>`
  width: ${({ open }) => (open ? '100%' : '88px')};
  height: ${({ open }) => (open ? '100%' : '88px')};
  border-radius: 88px;
  overflow: hidden;
`;
const ProfileImageBox = styled(Image)<{ open: boolean }>`
  width: 100%;
  height: 100%;
  height: ${({ open }) => (open ? '100%' : '88px')};
  border-radius: ${({ open }) => (open ? '0px' : '88px')};
  position: absolute;
  top: 0;
`;

const DeletedAccount = styled(Text)`
  width: 100%;
  text-align: center;
  font-size: 22px;
  padding: 0;
  left: -20%;
  margin: 30px 0;
  color: ${COLOR.BLACK};
`;

interface Props {
  isMe: boolean;
  name: string;
  profileImage: string;
  profileMessage: string;
  isHidden?: boolean;
  isDeletedUser?: boolean;
}

const TimelineContainer = ({ isHidden, isMe, name, profileImage, profileMessage, isDeletedUser }: Props) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const navigation = useNavigation<MainNavigationProp>();
  const {
    // @ts-ignore
    params: { id, uid },
  } = useRoute();

  const options = {
    initialSize: 1,
    revalidateAll: false,
    revalidateFirstPage: true,
  };
  const {
    data: postData,
    error: postError,
    mutate: postMutate,
    size,
    setSize,
  } = useSWRInfinite((index) => `/socials/users/${id}/posts?page=${index + 1}&limit=10`, fetcher, options);

  useFocusEffect(
    useCallback(() => {
      (async () => await postMutate())();
    }, [postMutate]),
  );

  const posts = postData ? [].concat(...postData) : [];
  const [isVisible, setIsVisible] = useState(false);

  function fetcher(url: string) {
    return axios.get(url).then((response) => response.data);
  }

  const {
    data: followData,
    error: followError,
    mutate: followMutate,
  } = useFetchWithType<IFollowInfo>(`/socials/follows/${id}/count`);
  const {
    data: userData,
    error: userError,
    mutate: userMutate,
  } = useFetchWithType<any>(uid ? `auth/users/detail?uid=${uid}` : '');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [isUrl, setIsUrl] = useState('');
  const [isWebVisible, setIsWebVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (isMe) {
        return;
      }
      (async () => {
        await postMutate();
        await followMutate();
      })();
    }, [isMe, followMutate, postMutate]),
  );

  useFocusEffect(
    useCallback(() => {
      if (postError?.response.data.message === 'api.user is blocking me.' || userData?.block) {
        setIsVisible(true);
      }
    }, []),
  );

  useEffect(() => {
    console.log(postError?.response.data.message);
  }, [postError]);

  useEffect(() => {
    if (!userData) {
      return;
    }
    if (
      userData?.setting?.sc_sns_account === 'private' &&
      (userData?.following?.status === 'private' || userData?.following === null)
    ) {
      setIsPrivate(true);
    } else {
      setIsPrivate(false);
    }
  }, [userData]);
  // console.log(postData);
  // console.log(followData);
  // console.log(userData);
  // console.log(id, uid);
  const myUser: User | null = useAtomValue(userAtom);

  if (isDeletedUser) {
    return (
      <Container isMe={false}>
        <View style={styles.avatarContainer}>
          <ProfileContainer
            open={isLightboxOpen}
            onOpen={() => setIsLightboxOpen(true)}
            willClose={() => setIsLightboxOpen(false)}
          >
            <ProfileImageBox
              open={isLightboxOpen}
              style={{
                resizeMode: 'contain',
              }}
              //@ts-ignore
              source={require('assets/chats/img_profile.png')}
            />
          </ProfileContainer>
          <DeletedAccount style={{ fontSize: myUser?.setting?.ct_text_size as number }}>Deleted Account</DeletedAccount>
        </View>
      </Container>
    );
  }

  return (
    <Container isMe={isMe}>
      <View style={styles.avatarContainer}>
        <ProfileContainer
          open={isLightboxOpen}
          onOpen={() => setIsLightboxOpen(true)}
          willClose={() => setIsLightboxOpen(false)}
        >
          <ProfileImageBox
            open={isLightboxOpen}
            style={{
              resizeMode: !isLightboxOpen ? undefined : 'contain',
            }}
            //@ts-ignore
            source={profileImage ? { uri: profileImage } : require('assets/chats/img_profile.png')}
          />
        </ProfileContainer>
      </View>

      {isMe && (
        <ButtonContainer justify="flex-end">
          <TouchableOpacity onPress={() => navigation.navigate('/more/profile-edit')}>
            <Row>
              <Edit style={styles.icon} />
              <Text style={styles.buttonText}>{t('user-timeline.Edit')}</Text>
            </Row>
          </TouchableOpacity>
        </ButtonContainer>
      )}
      {postError?.response.data.message === 'api.user is blocking me.' || userData?.block ? (
        <>
          <UserInfo
            followmutate={() => {}}
            follow={undefined}
            name={name}
            profileMessage={profileMessage}
            id={id}
            uid={uid}
          />
          <View style={{ flex: 1, paddingTop: 80, alignItems: 'center' }}>
            <Hidden />
            <Title>{t('user-timeline.No Post')}</Title>
          </View>
          <ModalBase isVisible={!!isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
            <Column justify="center" align="center">
              <ModalTitle>{t('user-timeline.This user cannot be found')}</ModalTitle>
              <Column style={{ paddingTop: 15 }}>
                <ConfirmButton
                  onPress={async () => {
                    setIsVisible(false);
                    navigation.goBack();
                  }}
                >
                  <ConfirmLabel>{t('common.Confirm')}</ConfirmLabel>
                </ConfirmButton>
                <View style={{ padding: 10 }} />
              </Column>
            </Column>
          </ModalBase>
        </>
      ) : postError?.response.data.message === 'api.user is exclude me' ? (
        <>
          <ScrollView>
            <SwrContainer data={followData} error={followError}>
              <UserInfo
                followmutate={followMutate}
                follow={followData!}
                name={name}
                profileMessage={profileMessage}
                id={id}
                uid={uid}
              />
            </SwrContainer>
            <NoPost myUser={myUser} />
          </ScrollView>
        </>
      ) : userData?.following?.hidden ? (
        <>
          <ScrollView>
            <SwrContainer data={followData} error={followError}>
              <UserInfo
                followmutate={followMutate}
                follow={followData!}
                name={name}
                profileMessage={profileMessage}
                id={id}
                uid={uid}
              />
            </SwrContainer>
            <HiddenAccount myUser={myUser} />
          </ScrollView>
        </>
      ) : postError?.response.data.message === 'api.private user.' ||
        postError?.response.data.message === 'api.Private users and not friends.' ||
        (isPrivate && !isMe) ? (
        <>
          <ScrollView>
            <SwrContainer data={followData} error={followError}>
              <UserInfo
                followmutate={followMutate}
                follow={followData!}
                name={name}
                profileMessage={profileMessage}
                id={id}
                uid={uid}
              />
            </SwrContainer>

            <PrivateAccount myUser={myUser} />
          </ScrollView>
        </>
      ) : (
        <SwrContainer data={postData} error={postError}>
          {posts?.length === 0 ? (
            <>
              <ScrollView>
                <SwrContainer data={followData} error={followError}>
                  <UserInfo
                    followmutate={followMutate}
                    follow={followData!}
                    name={name}
                    profileMessage={profileMessage}
                    id={id}
                    uid={uid}
                  />
                </SwrContainer>
                <NoPost myUser={myUser} />
              </ScrollView>
            </>
          ) : (
            <>
              <FlatList
                ListHeaderComponent={
                  <SwrContainer data={followData} error={followError}>
                    <UserInfo
                      followmutate={followMutate}
                      follow={followData!}
                      name={name}
                      profileMessage={profileMessage}
                      id={id}
                      uid={uid}
                    />
                  </SwrContainer>
                }
                onEndReachedThreshold={0.01}
                onEndReached={() => setSize(size + 1)}
                data={posts}
                renderItem={({ item, index }) => (
                  <PostItem
                    key={index}
                    mutate={postMutate}
                    post={item}
                    setIsVisible={setIsWebVisible}
                    setIsUrl={setIsUrl}
                  />
                )}
                style={styles.postsContainer}
              />
              <ChatWebView url={isUrl} isVisible={isWebVisible} setIsVisible={setIsWebVisible} />
            </>
          )}
        </SwrContainer>
      )}
    </Container>
  );
};

export default TimelineContainer;

const styles = StyleSheet.create({
  avatarContainer: {
    backgroundColor: '#fff',
    borderRadius: 44,
    left: '50%',
    position: 'absolute',
    top: 0,
    transform: [{ translateX: -44 }, { translateY: -44 }],
    borderColor: '#eee',
    borderWidth: 1,
  },
  icon: {
    marginRight: 3,
    // borderColor: '#eee',
    // borderWidth: 1,
  },
  buttonText: {
    color: '#bcb3c5',
    fontSize: 12,
  },
  postsContainer: {
    paddingHorizontal: 20,
  },
});
