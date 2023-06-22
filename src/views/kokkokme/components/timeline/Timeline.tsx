import React, { Component, ComponentType, useState } from 'react';
import { FlatList, View } from 'react-native';
import styled from 'styled-components';

import { NAV_HEIGHT } from 'constants/HEIGHT';
import Post from 'types/socials/likes/Post';
import PostDetail from 'types/socials/posts/PostDetail';
import PostItem from './PostItem';
import { FlashList } from '@shopify/flash-list';
import tw from 'twrnc';
import LogUtil from '../../../../utils/LogUtil';
import { Viewport } from '@skele/components';
import { COLOR } from 'constants/COLOR';
import ChatWebView from '../../../chats/components/chatbubble/ChatWebView';

const Container = styled(FlatList)`
  border-top-color: ${COLOR.GRAY};
  border-top-style: solid;
  border-top-width: 1px;
  margin-bottom: ${NAV_HEIGHT}px;
`;

interface Props {
  data?: PostDetail[];
  mutate: () => void;
  handleOnEndReached: () => void;
}

interface IItem {
  item: PostDetail;
}

const Timeline = ({ data, mutate, handleOnEndReached }: Props) => {
  const [isUrl, setIsUrl] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  return (
    <Viewport.Tracker>
      <>
        <FlashList
          data={data}
          // @ts-ignore
          renderItem={({ item, index }: IItem | Post) => {
            return (
              // <InViewPort onChange={(is)=>{
              //     setIsPlay(is)
              //     console.log('index' , index)
              //     console.log('이거보여?',is)
              //       console.log('이건 isplay', isPlay)
              // }}>
              <View style={{ paddingLeft: 20, paddingRight: 20 }}>
                <PostItem post={item} mutate={mutate} setIsUrl={setIsUrl} setIsVisible={setIsVisible} />
              </View>
              // </InViewPort>
            );
          }}
          estimatedItemSize={200}
          onEndReachedThreshold={0.01}
          onEndReached={handleOnEndReached}
        />
        <ChatWebView url={isUrl} isVisible={isVisible} setIsVisible={setIsVisible}></ChatWebView>
      </>
    </Viewport.Tracker>
  );
};

export default Timeline;
