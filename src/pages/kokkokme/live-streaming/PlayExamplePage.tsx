// import * as React from 'react';
// import { useState, useCallback, useEffect } from 'react';
// import {
//   Dimensions,
//   StyleSheet,
//   View,
//   ScrollView,
//   AppStateStatus,
//   AppState,
//   Text,
//   ActivityIndicator,
// } from 'react-native';
// import IVSPlayer, { IVSPlayerRef, LogLevel, PlayerState, Quality, ResizeMode } from 'amazon-ivs-react-native-player';
// import { Platform } from 'react-native';
// import Slider from '@react-native-community/slider';
// import { useNavigation } from '@react-navigation/native';
// import { MainNavigationProp } from 'navigations/MainNavigator';
// import Button from 'components/atoms/MButton';
// import Play from 'assets/chats/chatroom/ic-play.svg';
// import styled from 'styled-components/native';
// import MySetting from 'MySetting';
// import useAppState from 'hooks/useAppState';
//
// enum Position {
//   PORTRAIT,
//   LANDSCAPE,
// }
//
// const IconButton = styled.Pressable`
//   width: ${`${Dimensions.get('window').width / 3.1}px`};
//   padding: 15px;
// `;
//
// type ResizeModeOption = {
//   name: string;
//   value: ResizeMode;
// };
//
// const RESIZE_MODES: ResizeModeOption[] = [
//   {
//     name: 'Aspect Fill',
//     value: 'aspectFill',
//   },
//   {
//     name: 'Aspect Fit',
//     value: 'aspectFit',
//   },
//   {
//     name: 'Aspect Zoom',
//     value: 'aspectZoom',
//   },
// ];
//
// export default function PlayExamplePage() {
//   const { setOptions } = useNavigation<MainNavigationProp>();
//   const mediaPlayerRef = React.useRef<IVSPlayerRef>(null);
//   const [autoplay, setAutoplay] = useState(true);
//   const [paused, setPaused] = useState(false);
//   const [muted, setMuted] = useState(false);
//   const [pauseInBackground, setPauseInBackground] = useState(false);
//   const [manualQuality, setManualQuality] = useState<Quality | null>(null);
//   const [detectedQuality, setDetectedQuality] = useState<Quality | null>(null);
//   const [initialBufferDuration, setInitialBufferDuration] = useState(0.1);
//   const [autoMaxQuality, setAutoMaxQuality] = useState<Quality | null>(null);
//   const [qualities, setQualities] = useState<Quality[]>([]);
//   const [autoQualityMode, setAutoQualityMode] = useState(true);
//   const [buffering, setBuffering] = useState(false);
//   const [duration, setDuration] = useState<number | null>(null);
//   const [liveLowLatency, setLiveLowLatency] = useState(true);
//   const [playbackRate, setPlaybackRate] = useState(1);
//   const [logLevel, setLogLevel] = useState(LogLevel.IVSLogLevelError);
//   const [progressInterval, setProgressInterval] = useState(1);
//   const [volume, setVolume] = useState(1);
//   const [position, setPosition] = useState<number>();
//   const [lockPosition, setLockPosition] = useState(false);
//   const [positionSlider, setPositionSlider] = useState(0);
//   const [breakpoints, setBreakpoints] = useState<number[]>([]);
//   const [orientation, setOrientation] = useState(Position.PORTRAIT);
//   const [logs, setLogs] = useState<string[]>([]);
//   const [resizeMode, setResizeMode] = useState<ResizeModeOption | null>(RESIZE_MODES[1]);
//
//   useAppState({
//     onInactiveOrBackground: () => {
//       pauseInBackground && setPaused(true);
//     },
//     onForeground: () => {
//       pauseInBackground && setPaused(false);
//     },
//   });
//
//   const log = useCallback(
//     (text: string) => {
//       console.log(text);
//       setLogs((logs) => [text, ...logs.slice(0, 30)]);
//     },
//     [setLogs],
//   );
//
//   const onDimensionChange = useCallback(
//     ({ window: { width, height } }) => {
//       if (width < height) {
//         setOrientation(Position.PORTRAIT);
//
//         setOptions({ headerShown: true, gestureEnabled: true });
//       } else {
//         setOrientation(Position.LANDSCAPE);
//         setOptions({ headerShown: false, gestureEnabled: false });
//       }
//     },
//     [setOptions],
//   );
//
//   useEffect(() => {
//     Dimensions.addEventListener('change', onDimensionChange);
//
//     return () => {
//       Dimensions.removeEventListener('change', onDimensionChange);
//     };
//   }, [onDimensionChange]);
//
//   const slidingCompleteHandler = (value: number) => {
//     mediaPlayerRef?.current?.seekTo(value);
//   };
//
//   const parseSecondsToString = (seconds: number) => {
//     if (seconds === Infinity || Number.isNaN(seconds) || seconds < 0) {
//       return 'live';
//     }
//
//     const date = new Date(0);
//     date.setSeconds(seconds);
//     return date.toISOString().slice(11, 19);
//   };
//
//   return (
//     <View style={styles.container}>
//       <View style={styles.playerContainer}>
//         {/*
//           Note: A buffering indicator is included by default on Android. It's
//           styling is managed in /example/android/app/src/main/res/values/styles.xml
//           by adjusting the 'android:indeterminateTint'.
//         */}
//         {buffering && Platform.OS === 'ios' ? (
//           <ActivityIndicator animating={true} size="large" style={styles.loader} />
//         ) : null}
//
//         <IVSPlayer
//           key={resizeMode?.value}
//           ref={mediaPlayerRef}
//           paused={paused}
//           resizeMode={resizeMode?.value}
//           muted={muted}
//           autoplay={autoplay}
//           liveLowLatency={liveLowLatency}
//           streamUrl={MySetting.liveShoppingPlaybackUrl}
//           logLevel={logLevel}
//           initialBufferDuration={initialBufferDuration}
//           playbackRate={playbackRate}
//           progressInterval={progressInterval}
//           volume={volume}
//           autoQualityMode={autoQualityMode}
//           quality={manualQuality}
//           autoMaxQuality={autoMaxQuality}
//           breakpoints={breakpoints} // 이 시점에, onTimePoint 를 불러준다. (seconds가 요소이다.)
//           onSeek={(newPosition) => console.log('new position', newPosition)}
//           onPlayerStateChange={(state) => {
//             if (state === PlayerState.Buffering) {
//               log(`buffering at ${detectedQuality?.name}`);
//             }
//             if (state === PlayerState.Playing || state === PlayerState.Idle) {
//               setBuffering(false);
//             }
//             log(`state changed: ${state}`);
//           }}
//           onDurationChange={(duration) => {
//             setDuration(duration);
//             log(`duration changed: ${parseSecondsToString(duration || 0)}`);
//           }}
//           onQualityChange={(newQuality) => {
//             setDetectedQuality(newQuality);
//             log(`quality changed: ${newQuality?.name}`);
//           }}
//           onRebuffering={() => setBuffering(true)}
//           onLoadStart={() => log(`load started`)}
//           onLoad={(loadedDuration) => log(`loaded duration changed: ${parseSecondsToString(loadedDuration || 0)}`)}
//           onLiveLatencyChange={(liveLatency) => console.log(`live latency changed: ${liveLatency}`)}
//           onTextCue={(textCue) => console.log('text cue', textCue)}
//           onTextMetadataCue={(textMetadataCue) => console.log('text metadata cue', textMetadataCue)}
//           onProgress={(newPosition) => {
//             if (!lockPosition) {
//               setPosition(newPosition);
//               setPositionSlider(newPosition);
//             }
//             console.log(`progress changed: ${parseSecondsToString(position ? position : 0)}`);
//           }}
//           onData={(data) => setQualities(data.qualities)}
//           onVideoStatistics={(video) => console.log('onVideoStatistics', video)}
//           onError={(error) => console.log('error', error)}
//           onTimePoint={(timePoint) => console.log('time point', timePoint)}
//         >
//           {orientation === Position.PORTRAIT ? (
//             <>
//               <View style={styles.playButtonContainer}>
//                 <View style={styles.positionContainer}>
//                   <View style={styles.durationsContainer}>
//                     {duration && position !== null ? (
//                       <Text style={styles.positionText} testID="videoPosition">
//                         {parseSecondsToString(position ? position : 0)}
//                       </Text>
//                     ) : (
//                       <Text />
//                     )}
//                     {duration ? (
//                       <Text style={styles.positionText} testID="durationLabel">
//                         {parseSecondsToString(duration)}
//                       </Text>
//                     ) : null}
//                   </View>
//                   {duration && !Number.isNaN(duration) ? (
//                     <Slider
//                       testID="durationSlider"
//                       disabled={!duration || duration === Infinity}
//                       minimumValue={0}
//                       maximumValue={duration === Infinity ? 100 : duration}
//                       value={duration === Infinity ? 100 : positionSlider}
//                       onValueChange={setPosition}
//                       onSlidingComplete={slidingCompleteHandler}
//                       onTouchStart={() => setLockPosition(true)}
//                       onTouchEnd={() => {
//                         setLockPosition(false);
//                         setPositionSlider(position ?? 0);
//                       }}
//                     />
//                   ) : null}
//                 </View>
//                 <IconButton
//                   onPress={() => {
//                     setPaused((prev) => !prev);
//                   }}
//                   style={styles.playIcon}
//                 >
//                   {paused ? <Play width={18} height={18} /> : <Play width={18} height={18} />}
//                 </IconButton>
//               </View>
//             </>
//           ) : null}
//         </IVSPlayer>
//         <View style={styles.logs}>
//           {logs.map((log, index) => (
//             <Text key={index} style={styles.log} accessibilityLabel={log}>
//               {log}
//             </Text>
//           ))}
//         </View>
//       </View>
//     </View>
//   );
// }
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 0,
//     backgroundColor: 'black',
//   },
//   playerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   playButtonContainer: {
//     alignItems: 'center',
//     position: 'absolute',
//     bottom: 10,
//     width: '100%',
//   },
//   playIcon: {
//     borderWidth: 1,
//     borderColor: 'white',
//   },
//   positionContainer: {
//     width: '100%',
//   },
//   durationsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   icon: {
//     position: 'absolute',
//     top: 5,
//     right: 0,
//   },
//   settings: {
//     padding: 15,
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     alignItems: 'flex-start',
//   },
//   settingsHeader: {
//     backgroundColor: '#fff',
//     alignItems: 'center',
//   },
//   positionText: {
//     color: 'white',
//   },
//   settingsTitle: {
//     paddingBottom: 8,
//   },
//   flex1: {
//     flex: 1,
//   },
//   loader: {
//     position: 'absolute',
//     zIndex: 1,
//     alignSelf: 'center',
//   },
//   logs: {
//     top: 0,
//     width: '100%',
//     height: 250,
//     borderTopLeftRadius: 8,
//     borderTopRightRadius: 8,
//     backgroundColor: '#e2e2e2',
//     padding: 10,
//     paddingTop: 20,
//   },
//   log: {
//     fontSize: 7,
//   },
//   modalContentContainer: {
//     paddingHorizontal: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flex: 1,
//   },
//   modalContent: { backgroundColor: 'white', borderRadius: 4, height: '80%' },
//   modalHeader: {
//     justifyContent: 'space-between',
//     flexDirection: 'row',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },
// });
