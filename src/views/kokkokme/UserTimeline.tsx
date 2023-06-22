import { useAtomValue } from 'jotai';
import React, { useCallback, useState } from 'react';
import { Dimensions, ImageBackground, Platform, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import styled from 'styled-components';
import styledRN from 'styled-components/native';

import SwrContainer from 'components/containers/SwrContainer';
import { SCREEN_WIDTH } from 'constants/WIDTH';
import { useFetchWithType } from 'net/useFetch';
import userAtom from 'stores/userAtom';
import { TimelineHeader } from 'views/kokkokme/components/header';
import { TimelineContainer } from 'views/kokkokme/components/user-timeline';
import User from '../../types/auth/User';
import { IFollowInfo } from '../../types/socials';
import { COLOR } from '../../constants/COLOR';
import friendListAtom from '../../stores/friendListAtom';
import LogUtil from '../../utils/LogUtil';
import LinearGradient from 'react-native-linear-gradient';

const Container = styled(View)`
  flex: 1;
  padding-bottom: ${Platform.OS === 'android' ? '35px' : '0px'};
  position: relative;
  /* position: absolute; */
`;
const NameContainer = styledRN.View`
  height: auto;
  justify-content: center;
`;
const Name = styledRN.View`
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
`;
const NameText = styledRN.Text`
  font-size: 22px;
  font-weight: 500;
  margin: 5px;
  color: ${COLOR.WHITE};
`;

const UserTimeline = () => {
  const {
    // @ts-ignore
    params: { id, uid, contact },
  } = useRoute();
  const { data: userData, error: userError } = useFetchWithType<User>(uid ? `auth/users/detail?uid=${uid}` : '');
  const { data: blockUserData, error: blockUserError } = useFetchWithType<User>(
    `/auth/users/detail?contact=${contact}`,
  );

  const me = useAtomValue(userAtom);
  const { mutate: followMutate } = useFetchWithType<IFollowInfo>(`/socials/follows/${id}/count`);
  const [name, setName] = useState<string>('');

  const myUser: User | null = useAtomValue(userAtom);

  const isMe = userData?.id === myUser?.id;
  const isDeletedUser = !isMe && userData?.uid.split('_').pop() === `deleted${userData?.id}`;

  const [profileImage, setProfileImage] = useState('');
  const friendList = useAtomValue(friendListAtom);

  useFocusEffect(
    useCallback(() => {
      const isFriend = friendList?.filter((item) => item === userData?.id).length === 1;
      if (!isMe) {
        if (userData?.sc_profile_photo === 'friends' && isFriend) {
          if (userData?.profile_image === null || userData?.profile_image === '') {
            setProfileImage('');
          } else if (userData?.profile_image) {
            //@ts-ignore
            setProfileImage(userData?.profile_image);
          }
        } else if (userData?.sc_profile_photo === 'public') {
          if (userData?.profile_image === null || userData?.profile_image === '') {
            setProfileImage('');
          } else if (userData?.profile_image) {
            //@ts-ignore
            setProfileImage(userData?.profile_image);
          }
        } else {
          setProfileImage('');
        }
      } else {
        if (userData?.profile_image) {
          //@ts-ignore
          setProfileImage(userData?.profile_image);
        } else {
          setProfileImage('');
        }
      }
    }, [userData]),
  );

  useFocusEffect(
    useCallback(() => {
      if (userData) {
        setName(`${userData.first_name + ' ' || ''} ${userData.last_name || ''}`);
      }
      followMutate();
    }, [userData]),
  );

  if (!userData && userError?.response.status === 404) {
    return (
      <Container>
        <ImageBackground blurRadius={10} source={{ uri: undefined }} style={[styles.background]}>
          <TimelineHeader isMe={false} userData={undefined} isDeletedUser />
          <TimelineContainer
            //@ts-ignore
            isHidden={!!userData?.following?.hidden}
            isMe={me?.id === id}
            name={name}
            profileImage={profileImage}
            //@ts-ignore
            profileMessage={userData?.profile_message || ''}
            isDeletedUser
          />
        </ImageBackground>
      </Container>
    );
  }
  console.log('error code', userError?.response.data.code);

  return (
    <Container>
      <>
        {/* @ts-ignore */}
        {userError?.response.data.code === 'api.not found user' || !!userData?.block ? (
          <>
            <ImageBackground blurRadius={10} source={{ uri: undefined }} style={styles.background}>
              <TimelineHeader isMe={false} userData={userData} />
              <TimelineContainer isHidden={false} isMe={false} name={'Unknown'} profileImage={''} profileMessage={''} />
            </ImageBackground>
          </>
        ) : (
          <ImageBackground
            blurRadius={10}
            source={{ uri: userData?.profile_background + '?w=1280&h=1280' || undefined }}
            style={[styles.background]}
          >
            <LinearGradient
              colors={['#AAAAAAaa', '#AAAAAA00']}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: 60,
              }}
            />
            {userData?.profile_background && (
              <View
                style={{
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  height: Dimensions.get('window').height,
                  width: Dimensions.get('window').width,
                  position: 'absolute',
                  zIndex: 0,
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
            )}

            <TimelineHeader isMe={me?.id === id} userData={userData} />
            <TimelineContainer
              isHidden={!!userData?.following?.hidden}
              isMe={me?.id === id}
              name={name}
              profileImage={profileImage}
              profileMessage={userData?.profile_message || ''}
            />
          </ImageBackground>
        )}
      </>
    </Container>
  );
};

export default UserTimeline;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    height: SCREEN_WIDTH,
  },
});
