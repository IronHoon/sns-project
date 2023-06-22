import React, { useMemo } from 'react';
import { Column } from '../../../../components/layouts/Column';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '../../../../navigations/MainNavigator';
import { useFetchWithType } from '../../../../net/useFetch';
import User from '../../../../types/auth/User';
import { Avatar } from '../../../../components/atoms/image';
import { Dimensions, Pressable, Text, View } from 'react-native';
import Tail from '../../../../assets/tail.svg';
import { COLOR } from '../../../../constants/COLOR';
import Space from '../../../../components/utils/Space';
import { useAtomValue, useSetAtom } from 'jotai';
import profileDetailUidAtom from '../../../../stores/profileDetailUidAtom';
import friendListAtom from 'stores/friendListAtom';
import Nullable from 'types/_common/Nullable';
import userAtom from 'stores/userAtom';

const ProfileButton = styled.View<{ isMe: boolean }>`
  width: 180px;
  height: 30px;
  border-radius: 5px;
  background-color: ${(props) => (props.isMe ? 'white' : '#eeeeee')};
  justify-content: center;
  align-items: center;
`;

const NameText = styled.Text<{ isMe: boolean; dark: boolean }>`
  color: ${(props) => (props.isMe ? 'white' : props.dark ? 'white' : 'black')};
`;

const ProfileBubble = ({ uid, isMe, dark, roomType, showMenu }) => {
  const navigation = useNavigation<MainNavigationProp>();
  const { data: userData, error: userError } = useFetchWithType<User>(uid ? `auth/users/detail?uid=${uid}` : '');
  const setCurrentProfileUid = useSetAtom(profileDetailUidAtom);
  //나를 추가한 유저 리스트
  const addedMeList = useAtomValue(friendListAtom);
  const isAddedMe = userData ? addedMeList?.includes(userData.id) : false;
  const me: Nullable<User> = useAtomValue(userAtom);
  const profile_image = useMemo(() => {
    if (
      userData?.sc_profile_photo === 'public' ||
      (userData?.sc_profile_photo === 'friends' && isAddedMe) ||
      me?.uid === uid
    ) {
      return userData?.profile_image;
    } else {
      return '';
    }
  }, [userData]);

  return (
    <>
      {!isMe && (
        <Tail
          fill={dark ? '#262525' : COLOR.WHITE}
          style={[
            {
              position: 'absolute',
              left: 3,
              transform: [{ rotate: '90deg' }],
            },
            roomType === 'group' ? { top: 16.5 } : { top: 0 },
          ]}
        />
      )}
      <View
        style={{
          ...(isMe
            ? {
                maxWidth: Dimensions.get('window').width * 0.65,
                backgroundColor: COLOR.PRIMARY,
                borderRadius: 11,
                paddingHorizontal: 10,
                paddingVertical: 8,
                marginVertical: 4,
                marginLeft: 8,
                marginRight: 6,
              }
            : {
                maxWidth: Dimensions.get('window').width * 0.65,
                backgroundColor: dark ? '#262525' : COLOR.WHITE,
                borderRadius: 11,
                paddingHorizontal: 10,
                paddingVertical: 8,
                marginVertical: 4,
                marginRight: 8,
                marginLeft: 7,
              }),
        }}
      >
        <Pressable
          onLongPress={() => {
            showMenu();
          }}
          onPress={() => {
            setCurrentProfileUid(uid);
            navigation.navigate('/profile-detail');
          }}
        >
          <Column
            justify="flex-start"
            style={{
              height: 120,
              width: 200,
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 5,
            }}
          >
            <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center' }}>
              <Avatar src={profile_image} />
              <Space height={5} />
              <NameText isMe={isMe} dark={dark} numberOfLines={1}>
                {userData?.first_name} {userData?.last_name}
              </NameText>
            </View>
            <ProfileButton isMe={isMe}>
              <Text style={{ color: isMe ? '#555555' : '#000000' }}>View Profile</Text>
            </ProfileButton>
          </Column>
        </Pressable>
      </View>
      {isMe && (
        <Tail
          fill={COLOR.PRIMARY}
          style={[
            {
              position: 'absolute',
              top: -1,
              right: 3,
              transform: [{ rotate: '90deg' }],
            },
          ]}
        />
      )}
    </>
  );
};

export default React.memo(ProfileBubble);
