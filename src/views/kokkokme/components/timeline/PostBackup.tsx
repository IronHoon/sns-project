import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { MainNavigationProp } from 'navigations/MainNavigator';
import Content from 'views/kokkokme/components/timeline/Content';
import Images from 'views/kokkokme/components/timeline/Images';
import LikedBy from 'views/kokkokme/components/timeline/LikedBy';
import MetaInfoButtons from 'views/kokkokme/components/timeline/MetaInfoButtons';
import PostHeader from 'views/kokkokme/components/timeline/PostHeader';
import SharedPost from 'views/kokkokme/components/timeline/SharedPost';
import VideoPlayerIos from 'views/kokkokme/components/timeline/VideoPlayerIos';
import VideoPlayerAnd from 'views/kokkokme/components/timeline/VideoPlayerAnd';
import { useAtomValue } from 'jotai';
import userAtom from '../../../../stores/userAtom';

interface Props {
  id: number;
  name: string;
  date: Date;
  post: any;

  fullscreen?: boolean;
  shared?: any;
  searchValue?: string;
  toggleFullscreen?: (id: number) => void;
}

const PostBackup = ({ id, name, date, post, searchValue, shared, fullscreen = false, toggleFullscreen }: Props) => {
  const { images, video, content, likes, comments, likedBy } = post;
  const navigation = useNavigation<MainNavigationProp>();
  const user = useAtomValue(userAtom);

  const handlePress = () => navigation.navigate('/kokkokme/:id', { id });

  return (
    <View style={fullscreen ? styles.fullscreen : styles.container}>
      <PostHeader date={date} name={name} user={user!} deletePost={() => {}} postId={''} profileImage={''} />
      {!!shared && <SharedPost data={shared} searchValue={searchValue} />}
      {!!images?.length && <Images images={images} />}
      {!!video && Platform.OS === 'ios' && <VideoPlayerIos video={video} />}
      {!!video && Platform.OS === 'android' && (
        // @ts-ignore
        <VideoPlayerAnd fullscreen={fullscreen} video={video} toggleFullscreen={() => toggleFullscreen?.(id)} />
      )}
      <Content content={content} searchValue={searchValue} onPress={handlePress} />
      <MetaInfoButtons
        likes={likes}
        comments={comments}
        // @ts-ignore
        onPress={handlePress}
      />
      {!!likedBy && <LikedBy likedBy={likedBy} count={0} postId={''} />}
    </View>
  );
};

export default PostBackup;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingVertical: 15,
  },
  fullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
