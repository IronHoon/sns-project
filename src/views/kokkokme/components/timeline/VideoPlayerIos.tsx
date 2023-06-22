import React, { useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Video from 'react-native-video';
import LogUtil from '../../../../utils/LogUtil';
import InViewPort from '@coffeebeanslabs/react-native-inviewport';
import { Viewport } from '@skele/components';

const { width: WIDTH } = Dimensions.get('window');
const VIDEO_WIDTH = WIDTH - 40;

interface Props {
  video: string;
  active: number;
}

const VideoPlayerIos = ({ video, active }: Props) => {
  const [videoState, setVideoState] = useState({
    rate: 1,
    volume: 1,
    muted: true,
    duration: 0.0,
    currentTime: 0.0,
    controls: true,
    paused: true,
    skin: 'native',
    isBuffering: false,
  });

  const ViewportAwareVideo = Viewport.Aware(Video);

  const onLoad = (data: any) => {
    setVideoState({ ...videoState, duration: data.duration, paused: true });
  };

  const onProgress = (data: any) => {
    setVideoState({ ...videoState, currentTime: data.currentTime });
  };

  const onBuffer = ({ isBuffering }: { isBuffering: boolean }) => {
    setVideoState({ ...videoState, isBuffering });
  };

  const pauseVideo = () => {
    setVideoState({ ...videoState, paused: true });
  };

  const playVideo = () => {
    setVideoState({ ...videoState, paused: false });
  };

  const handlePlaying = (isVisible) => {
    if (isVisible) isVisible ? playVideo() : pauseVideo();
  };

  return (
    <View style={styles.container}>
      <View style={styles.fullScreen}>
        {/* <ViewportAwareVideo
          source={{ uri: video }}
          onViewportEnter={() => {
            // console.log('entered!!')
            playVideo()
          }}
          onViewportLeave={() => {
            // console.log('leave!!')
            pauseVideo()
          }}
        /> */}
        <InViewPort style={styles.fullScreen} onChange={handlePlaying} delay={1000}>
          {video && (
            <Video
              source={{ uri: video }}
              style={styles.fullScreen}
              paused={videoState.paused}
              volume={videoState.volume}
              muted={videoState.muted}
              ignoreSilentSwitch={'ignore'}
              onLoad={onLoad}
              onBuffer={onBuffer}
              onProgress={onProgress}
              repeat={false}
              controls={videoState.controls}
            />
          )}
        </InViewPort>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    height: VIDEO_WIDTH,
    marginTop: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  controls: {
    backgroundColor: 'transparent',
    borderRadius: 5,
    position: 'absolute',
    bottom: 44,
    left: 4,
    right: 4,
  },
  progress: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 3,
    overflow: 'hidden',
  },
  innerProgressCompleted: {
    height: 20,
    backgroundColor: '#cccccc',
  },
  innerProgressRemaining: {
    height: 20,
    backgroundColor: '#2C2C2C',
  },
  generalControls: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    paddingBottom: 10,
  },
  skinControl: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  controlOption: {
    alignSelf: 'center',
    fontSize: 11,
    color: 'white',
    paddingLeft: 2,
    paddingRight: 2,
    lineHeight: 12,
  },
  trackingControls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default VideoPlayerIos;
