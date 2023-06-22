import React, { useState } from 'react';
import { FlatList, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components';

import { Avatar } from 'components/atoms/image';
import SwrContainer from 'components/containers/SwrContainer';
import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { useFetchWithType } from 'net/useFetch';
import { LikesList } from 'types/socials/likes/LikesList';

import KokIcon from 'assets/kokkokme/ic-kok.svg';
import User from '../../types/auth/User';
import { useAtomValue } from 'jotai';
import userAtom from '../../stores/userAtom';
import friendListAtom from '../../stores/friendListAtom';
import { Column } from 'components/layouts/Column';

const Container = styled(Pressable)<{ pressed?: boolean }>`
  background: ${({ theme }) => (theme.dark ? '#585858' : '#ffffff')};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 20px;
`;
const TextContainer = styled(Column)`
  margin-left: 15px;
`;

const Name = styled(Text)`
  color: ${({ theme }) => (theme.dark ? '#ffffff' : COLOR.BLACK)};
  font-size: 15px;
  font-weight: 500;
`;
const KokkokName = styled(Text)`
  color: ${COLOR.TEXT_LIGHT_GRAY};
  font-size: 13px;
`;

interface Props {
  id: number;
}

const Likes = ({ id }: Props) => {
  const navigation = useNavigation<MainNavigationProp>();
  const { data: likesData, error: likesError } = useFetchWithType<LikesList>(`/socials/likes/${id}?page=1&limit=10`);

  const handlePress = (userId: number, uid: string = '', contact: string = '') =>
    navigation.navigate('/kokkokme/user-timeline/:id', { id: userId, uid, contact: contact });
  const myUser: User | null = useAtomValue(userAtom);
  const [profileImage, setProfileImage] = useState<string>('');
  const friendList = useAtomValue(friendListAtom);

  const defaultImage = (i: any) => {
    const isMe = likesData?.docs?.[i].user_info.id === myUser?.id;
    if (!isMe) {
      if (likesData?.docs?.[i].user_info) {
        const isFriend = friendList?.filter((item) => item === likesData?.docs?.[i].user_info.id).length === 1;
        if (likesData?.docs?.[i].user_info.sc_profile_photo === 'friends' && isFriend) {
          if (likesData?.docs?.[i].user_info.profile_image === null) {
            return '';
          } else {
            return likesData?.docs?.[i].user_info.profile_image;
          }
        } else if (likesData?.docs?.[i].user_info.sc_profile_photo === 'public') {
          if (likesData?.docs?.[i].user_info.profile_image === null) {
            return '';
          } else {
            return likesData?.docs?.[i].user_info.profile_image;
          }
        } else {
          return '';
        }
      } else {
        return undefined;
      }
    } else {
      return likesData?.docs?.[i].user_info.profile_image;
    }
  };

  return (
    <SwrContainer data={likesData} error={likesError}>
      <FlatList
        data={likesData?.docs}
        renderItem={({ item, index }) => {
          const userName = item.user_info.first_name + ' ' + item.user_info.last_name;
          return (
            <Container
              style={({ pressed, }) => [
                {
                  backgroundColor: pressed ? '#fcf2e8' : theme.dark? '#585858': '#ffffff' ,
                },
              ]}
              onPress={() => handlePress(item.user_id, item.user_info.uid, item.user_info.contact)}
            >
              <Row align="center" fullWidth justify="space-between">
                <Row align="center">
                  <Avatar size={40} src={defaultImage(index)} />
                  <TextContainer justify="flex-start">
                    <Name style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                      {userName.length > 21 ? userName.substring(0, 18) + '...' : userName}
                    </Name>
                    <KokkokName style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                      {item.user_info.uid}
                    </KokkokName>
                  </TextContainer>
                </Row>
                <TouchableOpacity onPress={() => handlePress(item.user_id, item.user_info.uid, item.user_info.contact)}>
                  <KokIcon />
                </TouchableOpacity>
              </Row>
            </Container>
          );
        }}
      />
    </SwrContainer>
  );
};

export default Likes;
