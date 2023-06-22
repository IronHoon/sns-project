'use strict';
import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  PanResponder,
  ToastAndroid,
  PanResponderInstance,
  Dimensions,
  BackHandler,
  NativeEventSubscription,
  StatusBar,
  Pressable,
} from 'react-native';
import Video from 'react-native-video';
import ICPause from 'assets/ic-pause-white.svg';
import Fullscreen from 'assets/kokkokme/btn-fullscreen.svg';
import PlayBtn from 'assets/kokkokme/btn-play.svg';
import MuteOff from 'assets/kokkokme/btn-mute-off.svg';
import MuteOn from 'assets/kokkokme/btn-mute-on.svg';
import LogUtil from '../../../../utils/LogUtil';
import Orientation from 'react-native-orientation-locker';
import Modal from 'react-native-modal';
import { Viewport } from '@skele/components';

const { height: HEIGHT, width: WIDTH } = Dimensions.get('window');
const VIDEO_WIDTH = WIDTH - 40;
const ViewportAwareVideo = Viewport.Aware(Video);

interface Props {
  video: string;
  toggleFullscreen?: () => void;
  //
  fullscreen?: boolean;
}

class VideoPlayerAnd extends Component<Props> {
  state = {
    rate: 1,
    volume: 1,
    muted: true,
    resizeMode: 'contain',
    duration: 0.0,
    currentTime: 0.0,
    paused: false,
    fullscreen: false,
    decoration: true,
    isLoading: false,
    seekerFillWidth: 0,
    seekerPosition: 0,
    seekerOffset: 0,
    seeking: false,
    loop: false,
    show: false,
    time: 3000,
    isVisible: false,
    landscape: false,
  };

  seekerWidth = 0;
  videoRef: Video;
  seekPanResponder: PanResponderInstance | undefined;
  video: string | undefined;
  private backHandler: NativeEventSubscription | undefined;

  onLoad = (data: any) => {
    this.setState({ duration: data.duration, isLoading: false });
  };

  onProgress = (data: any) => {
    if (!this.state.seeking) {
      const position = this.calculateSeekerPosition();
      this.setSeekerPosition(position);
    }
    this.setState({ currentTime: data.currentTime });
  };

  onVideoLoadStart = () => {
    console.log('onVideoLoadStart');
    this.setState({ isLoading: true });
  };

  onVideoBuffer = (param: any) => {
    console.log('onVideoBuffer');

    this.setState({ isLoading: param.isBuffering });
  };

  onReadyForDisplay = () => {
    console.log('onReadyForDisplay');

    this.setState({ isLoading: false });
  };

  toast = (visible: boolean, message: string) => {
    if (visible) {
      ToastAndroid.showWithGravityAndOffset(message, ToastAndroid.LONG, ToastAndroid.BOTTOM, 25, 50);
      return null;
    }
    return null;
  };

  onError = (err: any) => {
    console.log(JSON.stringify(err));
    this.toast(true, 'error: ' + err?.error?.code);
  };

  onEnd = () => {
    console.log('end');
    this.setState({ currentTime: 0, seeking: false });
    this.videoRef?.seek(0);
  };

  toggleFullscreen() {
    if (this.state.fullscreen) {
      this.setState({ landscape: false });
      Orientation.unlockAllOrientations();
    }
    this.setState({ fullscreen: !this.state.fullscreen });
    this.setState({ isVisible: !this.state.isVisible });

    // if(this.state.fullscreen){
    //   this.videoRef.presentFullscreenPlayer();
    // }else{
    //   this.videoRef.dismissFullscreenPlayer();
    // }
    console.log('width', WIDTH);
    console.log('height', HEIGHT);
    //
    // if (this.state.fullscreen) {
    //   Orientation.lockToLandscape();
    // } else {
    //   Orientation.unlockAllOrientations();
    // }
  }

  handleOrientation = () => {
    if (this.state.landscape) {
      this.setState({ landscape: !this.state.landscape });
      Orientation.unlockAllOrientations();
    } else {
      this.setState({ landscape: !this.state.landscape });
      Orientation.lockToLandscape();
    }
  };

  backAction = (): any => {
    // Orientation.getOrientation(orientation => {
    //   if (
    //     orientation === 'LANDSCAPE-LEFT' ||
    //     orientation === 'LANDSCAPE-RIGHT'
    //   ) {
    //     Orientation.lockToLandscape();
    //   } else Orientation.lockToPortrait();
    // });
    console.log('press back');
  };

  componentDidMount() {
    this.initSeekPanResponder();
    // Orientation.addOrientationListener(this.handleOrientation);
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.backAction);
  }

  componentWillUnmount() {
    // Orientation.removeOrientationListener(this.handleOrientation);
    this.backHandler?.remove();
  }

  renderFullScreenControl() {
    return (
      <TouchableOpacity
        onPress={() => {
          this.toggleFullscreen();
        }}
      >
        <Fullscreen />
      </TouchableOpacity>
    );
  }

  renderLandScapeControl() {
    return (
      <TouchableOpacity
        onPress={() => {
          this.handleOrientation();
        }}
      >
        <Fullscreen />
      </TouchableOpacity>
    );
  }

  renderPause() {
    return (
      <Pressable
        style={styles.playBtn}
        onPress={() => {
          this.setState({ paused: !this.state.paused });
        }}
      >
        {this.state.paused ? <PlayBtn /> : <ICPause />}
      </Pressable>
    );
  }

  renderVolumeControl() {
    return (
      <TouchableOpacity
        onPress={() => {
          if (!this.state.muted) this.setState({ muted: true });
          else this.setState({ muted: false });
        }}
      >
        {!this.state.muted ? <MuteOff /> : <MuteOn />}
      </TouchableOpacity>
    );
  }

  /**
   * Render the seekbar and attach its handlers
   */

  /**
   * Constrain the location of the seeker to the
   * min/max value based on how big the
   * seeker is.
   *
   * @param {float} val position of seeker handle in px
   * @return {float} constrained position of seeker handle in px
   */
  constrainToSeekerMinMax(val = 0) {
    if (val <= 0) {
      return 0;
    } else if (val >= this.seekerWidth) {
      return this.seekerWidth;
    }
    return val;
  }

  /**
   * Set the position of the seekbar's components
   * (both fill and handle) according to the
   * position supplied.
   *
   * @param {float} position position in px of seeker handle}
   */
  setSeekerPosition(position = 0) {
    const state = this.state;
    position = this.constrainToSeekerMinMax(position);

    state.seekerFillWidth = position;
    state.seekerPosition = position;

    if (!state.seeking) {
      state.seekerOffset = position;
    }

    this.setState(state);
  }

  /**
   * Calculate the position that the seeker should be
   * at along its track.
   *
   * @return {float} position of seeker handle in px based on currentTime
   */
  calculateSeekerPosition() {
    const percent = this.state.currentTime ? this.state.currentTime / this.state.duration : 0;
    return this.seekerWidth * percent;
  }

  /**
   * Return the time that the video should be at
   * based on where the seeker handle is.
   *
   * @return {float} time in ms based on seekerPosition.
   */
  calculateTimeFromSeekerPosition() {
    const percent = this.state.seekerPosition / this.seekerWidth;
    return this.state.duration * percent;
  }

  /**
   * Get our seekbar responder going
   */
  initSeekPanResponder() {
    this.seekPanResponder = PanResponder.create({
      // Ask to be the responder.
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,

      /**
       * When we start the pan tell the machine that we're
       * seeking. This stops it from updating the seekbar
       * position in the onProgress listener.
       */
      onPanResponderGrant: (evt, gestureState) => {
        const state = this.state;
        // this.clearControlTimeout()
        const position = evt.nativeEvent.locationX;
        this.setSeekerPosition(position);
        state.seeking = true;
        this.setState(state);
      },

      /**
       * When panning, update the seekbar position.
       */
      onPanResponderMove: (evt, gestureState) => {
        const position = this.state.seekerOffset + gestureState.dx;
        this.setSeekerPosition(position);
      },

      /**
       * On release we update the time and seek to it in the video.
       * If you seek to the end of the video we fire the
       * onEnd callback
       */
      onPanResponderRelease: (evt, gestureState) => {
        const time = this.calculateTimeFromSeekerPosition();
        const state = this.state;
        if (time >= state.duration && !state.isLoading) {
          state.paused = true;
          this.onEnd();
        } else {
          this.videoRef?.seek(time);
          state.seeking = false;
        }
        this.setState(state);
      },
    });
  }

  renderSeekBar() {
    if (!this.seekPanResponder) {
      return null;
    }
    return (
      <View style={styles.seekbarContainer} {...this.seekPanResponder.panHandlers} {...styles.generalControls}>
        <View
          style={styles.seekbarTrack}
          onLayout={(event) => (this.seekerWidth = event.nativeEvent.layout.width)}
          pointerEvents={'none'}
        >
          <View
            style={[
              styles.seekbarFill,
              {
                width: this.state.seekerFillWidth > 0 ? this.state.seekerFillWidth : 0,
                backgroundColor: '#FFF',
              },
            ]}
            pointerEvents={'none'}
          />
        </View>
        <View
          style={[
            styles.seekbarHandle,
            {
              left: this.state.seekerPosition > 0 ? this.state.seekerPosition : 0,
            },
          ]}
          pointerEvents={'none'}
        >
          <View style={[styles.seekbarCircle, { backgroundColor: '#FFF' }]} pointerEvents={'none'} />
        </View>
      </View>
    );
  }

  IndicatorLoadingView() {
    if (this.state.isLoading) return <ActivityIndicator color="#3235fd" size="large" style={styles.IndicatorStyle} />;
    else return <View />;
  }

  // renderOverlay() {
  //   return (
  //     <>
  //       {this.IndicatorLoadingView()}
  //       <View style={styles.volumeControl}>{this.renderVolumeControl()}</View>
  //       {this.state.fullscreen && <View style={styles.landScapeControl}>{this.renderLandScapeControl()}</View>}
  //       <View style={styles.fullScreenControl}>{this.renderFullScreenControl()}</View>
  //       <Pressable
  //         style={styles.bottomControls}
  //         onTouchEnd={() => {
  //           this.setState({ time: this.state.time + 3000 });
  //         }}
  //       >
  //         <View>{this.renderSeekBar()}</View>
  //       </Pressable>
  //       <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
  //         <View style={styles.playControl}>{this.renderPause()}</View>
  //       </View>
  //     </>
  //   );
  // }

  renderOverlay() {
    return (
      <View style={{ position: 'absolute', width: '100%', height: '100%', bottom: 0 }}>
        <View style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.playControl}>{this.renderPause()}</View>
        </View>
        {this.IndicatorLoadingView()}
        <View style={styles.volumeControl}>{this.renderVolumeControl()}</View>
        {!this.state.isVisible && this.state.fullscreen && (
          <View style={styles.landScapeControl}>{this.renderLandScapeControl()}</View>
        )}
        <View style={styles.fullScreenControl}>{this.renderFullScreenControl()}</View>
        <Pressable
          style={styles.bottomControls}
          onTouchEnd={() => {
            this.setState({ time: this.state.time + 3000 });
          }}
        >
          <View>{this.renderSeekBar()}</View>
        </Pressable>
      </View>
    );
  }

  renderVideoView(video) {
    return (
      <Pressable
        style={styles.videoStyle}
        onPress={() => {
          this.setState({ show: !this.state.show });
        }}
      >
        {/*<ViewportAwareVideo*/}
        {/*    source={{ uri: video }}*/}
        {/*    onViewportEnter={() => {*/}
        {/*      console.log('entered!!')*/}
        {/*      this.setState({paused:false})*/}
        {/*      console.log(this.state.paused)*/}
        {/*    }}*/}
        {/*    onViewportLeave={() => {*/}
        {/*      console.log('left!!')*/}
        {/*      this.setState({paused:true})}} />*/}
        <Video
          ref={(ref: Video) => {
            this.videoRef = ref;
          }}
          source={{ uri: video }}
          style={styles.videoStyle}
          rate={this.state.rate}
          paused={this.state.paused}
          volume={this.state.volume}
          muted={this.state.muted}
          resizeMode={this.state.resizeMode}
          onLoad={this.onLoad}
          onProgress={this.onProgress}
          onEnd={this.onEnd}
          progressUpdateInterval={1000}
          onError={this.onError}
          onLoadStart={this.onVideoLoadStart}
          onReadyForDisplay={this.onReadyForDisplay}
          onBuffer={this.onVideoBuffer}
          repeat={false}
        />
      </Pressable>
    );
  }

  render() {
    const { fullscreen = false, video } = this.props;
    // const viewStyle = this.state.fullscreen
    const viewStyle = styles.container;

    return (
      <>
        <View style={viewStyle}>
          {!this.state.isVisible && this.renderVideoView(this.props.video)}
          {/*{this.renderVideoView(video)}*/}
          {!this.state.isVisible && this.state.show && this.renderOverlay()}
        </View>
        <Modal
          style={{
            left: this.state.landscape ? -40 : -20,
            right: 0,
            position: 'absolute',
            top: -40,
            bottom: 0,
            flex: 1,
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            backgroundColor: 'black',
          }}
          isVisible={this.state.isVisible}
        >
          {this.renderVideoView(this.props.video)}
          {this.state.show && this.renderOverlay()}
        </Modal>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'black',
    borderRadius: 10,
    flex: 1,
    height: VIDEO_WIDTH,
    justifyContent: 'center',
    marginTop: 15,
    overflow: 'hidden',
    width: VIDEO_WIDTH,
  },
  fullscreen: {
    backgroundColor: 'black',
    // position:'relative',
    // flex: 1,
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    position: 'absolute',
    top: 0,
    // left: 0,
    // bottom: 0,
    // right: 0
    // zIndex: 999,
  },
  videoStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  bottomControls: {
    backgroundColor: 'transparent',
    borderRadius: 5,
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
  },
  generalControls: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  IndicatorStyle: {
    flex: 1,
    justifyContent: 'center',
  },
  seekbarContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 4,
    height: 30,
    justifyContent: 'flex-end',
  },
  seekbarTrack: {
    backgroundColor: '#333',
    height: 1,
    position: 'relative',
    top: 14,
    width: '100%',
  },
  seekbarFill: {
    backgroundColor: '#FFF',
    height: 1,
    width: '100%',
  },
  seekbarHandle: {
    position: 'absolute',
    marginLeft: -7,
    height: 28,
    width: 28,
  },
  seekbarCircle: {
    borderRadius: 12,
    position: 'relative',
    top: 8,
    left: 8,
    height: 12,
    width: 12,
  },
  playControl: {
    height: 50,
    width: 50,
  },
  landScapeControl: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  playBtn: {
    alignItems: 'flex-start',
    display: 'flex',
    justifyContent: 'flex-start',
    flex: 1,
    height: 5,
    width: 40,
    top: 5,
    left: 5,
  },
  fullScreenControl: {
    position: 'absolute',
    right: 20,
    bottom: 40,
  },
  volumeControl: {
    position: 'absolute',
    right: 60,
    bottom: 40,
  },
});

export default VideoPlayerAnd;
