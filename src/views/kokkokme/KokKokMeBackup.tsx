import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components';

import { MainNavigationProp } from 'navigations/MainNavigator';
import { KokKokMeHeader } from 'views/kokkokme/components/header';
import TimelineBackup from './components/timeline/TimelineBackup';
import Button from '../../components/atoms/MButton';

export const DUMMY_POSTS = [
  {
    id: 1,
    name: 'user1',
    date: new Date(),
    post: {
      images: ['https://placeimg.com/335/335/animals'],
      content:
        "Lorem Ipsum is simply dummy text of #test_hash1 the printing and typesetting industry. #test_hash2 Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      likes: 0,
      comments: 0,
      likedBy: 'user1-1',
    },
  },
  {
    id: 2,
    name: 'user2',
    date: new Date(),
    post: {
      images: [
        'https://placeimg.com/335/335/animals',
        'https://placeimg.com/335/335/people',
      ],
      content:
        "Lorem Ipsum is simply dummy text of #test_hash1 the printing and typesetting industry. #test_hash2 Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      likes: 10,
      comments: 10,
      likedBy: 'user2-1',
    },
  },
  {
    id: 3,
    name: 'user3',
    date: new Date(),
    post: {
      images: [
        'https://placeimg.com/335/335/animals',
        'https://placeimg.com/335/335/people',
        'https://placeimg.com/335/335/tech',
      ],
      content:
        "Lorem Ipsum is simply dummy text of #test_hash1 the printing and typesetting industry. #test_hash2 Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      likes: 20,
      comments: 20,
      likedBy: 'user3-1',
    },
  },
  {
    id: 4,
    name: 'user4',
    date: new Date(),
    post: {
      images: [],
      content:
        "Lorem Ipsum is simply dummy text of #test_hash1 the printing and typesetting industry. #test_hash2 Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      likes: 0,
      comments: 0,
      likedBy: 'user4-1',
    },
    shared: {
      id: 2,
      name: 'user2',
      date: new Date(),
      post: {
        images: [
          'https://placeimg.com/335/335/animals',
          'https://placeimg.com/335/335/people',
        ],
        content:
          "Lorem Ipsum is simply dummy text of #test_hash1 the printing and typesetting industry. #test_hash2 Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
        likes: 10,
        comments: 10,
        likedBy: 'user2-1',
      },
    },
  },
  {
    id: 5,
    name: 'user5',
    date: new Date(),
    post: {
      images: [],
      content:
        "Lorem Ipsum is simply dummy text of #test_hash1 the printing and typesetting industry. #test_hash2 Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      likes: 0,
      comments: 0,
      likedBy: 'user5-1',
    },
    shared: {
      id: 1,
      name: 'user1',
      date: new Date(),
      post: {
        images: [],
        content:
          "Lorem Ipsum is simply dummy text of #test_hash1 the printing and typesetting industry. #test_hash2 Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      },
    },
  },
  {
    id: 6,
    name: 'user6',
    date: new Date(),
    post: {
      images: [],
      video: require('assets/broadchurch.mp4'),
      content:
        "Lorem Ipsum is simply dummy text of #test_hash1 the printing and typesetting industry. #test_hash2 Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      likes: 0,
      comments: 0,
      likedBy: 'user2-1',
    },
  },
];

const Container = styled(View)`
  padding: 0 20px;
`;

const KokKokMeBackup = () => {
  const navigation = useNavigation<MainNavigationProp>();

  return (
    <Container>
      <KokKokMeHeader
        pressSearch={() => navigation.navigate('/kokkokme/kokkokeme-search')}
        pressPost={() => navigation.navigate('/kokkokme/kokkokme-post')}
        pressNoti={() => {}}
      />
      <Button
        onPress={() => {
          navigation.navigate('/kokkokme');
        }}>
        데이터 연결 된 타임라인 보기
      </Button>
      <TimelineBackup dummy={DUMMY_POSTS} />
    </Container>
  );
};

export default KokKokMeBackup;
