import { useRoute } from '@react-navigation/native';
import PrevHeader from 'components/molecules/PrevHeader';
import React from 'react';
import { SafeAreaView } from 'react-native';
import Video from 'react-native-video';
import LogUtil from 'utils/LogUtil';

function VideoPlayerPage() {
  const { params } = useRoute();
  //@ts-ignore
  const uri = params.uri;

  LogUtil.info('VideoPlayerPage uri', [uri]);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <PrevHeader border={false} themeColor={false} />
      <Video source={{ uri: uri }} style={{ flex: 1 }} controls={true} />
    </SafeAreaView>
  );
}

export default VideoPlayerPage;
