import React, { FC, useEffect, useState, useRef, useCallback } from 'react';
import {
  Text,
  Modal,
  View,
  Alert,
  AppState,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TouchableOpacityProps,
  TextInput,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import {
  CameraPosition,
  CameraPreviewAspectMode,
  StateStatusUnion,
  IAudioStats,
  IBroadcastSessionError,
  IVSBroadcastCameraView,
  IIVSBroadcastCameraView,
} from 'amazon-ivs-react-native-broadcast';
import MySetting from 'MySetting';
import useAppState from 'hooks/useAppState';
import styled from 'styled-components/native';
import { Row } from 'components/layouts/Row';
import { Spacer } from 'components/layouts/Spacer';
import Space from 'components/utils/Space';
import { Column } from 'components/layouts/Column';
import { Button } from 'components/atoms/button/Button';
import LogUtil from 'utils/LogUtil';
import CameraFlipImage from 'assets/kokkokme/live-streaming/camera_flip_22.svg';
import { COLOR } from 'constants/COLOR';
import { Avatar } from 'components/atoms/image';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';

enum SessionReadyStatus {
  None = 'NONE',
  Ready = 'READY',
  NotReady = 'NOT_READY',
}
const { None, NotReady, Ready } = SessionReadyStatus;

const INITIAL_BROADCAST_STATE_STATUS = 'INVALID' as const;
const INITIAL_STATE = {
  readyStatus: None,
  stateStatus: INITIAL_BROADCAST_STATE_STATUS,
};
const INITIAL_META_DATA_STATE = {
  audioStats: {
    rms: 0,
    peak: 0,
  },
  streamQuality: 0,
  networkHealth: 0,
};
const VIDEO_CONFIG = {
  width: 1920,
  height: 1080,
  bitrate: 7500000,
  targetFrameRate: 60,
  keyframeInterval: 2,
  isBFrames: true,
  isAutoBitrate: true,
  maxBitrate: 8500000,
  minBitrate: 1500000,
} as const;
const AUDIO_CONFIG = {
  bitrate: 128000,
} as const;

const Spinner = () => <ActivityIndicator size="large" style={s.spinner} />;

const BroadcastExamplePage = () => {
  const navigation = useNavigation<MainNavigationProp>();

  const cameraViewRef = useRef<IIVSBroadcastCameraView>(null);

  //변경 가능한 속성들
  const avatarUrl = '';
  const [isMuted, setIsMuted] = useState(true);
  const [isMirrored, setIsMirrored] = useState(false);
  const [aspectMode, setAspectMode] = useState<CameraPreviewAspectMode>('fill');
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>('back');

  //주요 상태들
  const [{ stateStatus, readyStatus }, setState] = useState<{
    readonly stateStatus: StateStatusUnion;
    readonly readyStatus: SessionReadyStatus;
  }>(INITIAL_STATE);
  const [{ audioStats, networkHealth, streamQuality }, setMetaData] = useState<{
    readonly streamQuality: number;
    readonly networkHealth: number;
    readonly audioStats: {
      readonly rms: number; // 평균 볼륨
      readonly peak: number; // 최대 볼륨
    };
  }>(INITIAL_META_DATA_STATE);
  const isConnecting = stateStatus === 'CONNECTING';
  const isConnected = stateStatus === 'CONNECTED';
  const isDisconnected = stateStatus === 'DISCONNECTED';

  useAppState({
    onInactiveOrBackground: () => {
      cameraViewRef.current?.stop();
    },
    onForeground: () => {},
  });

  useEffect(() => {
    if (readyStatus === NotReady) {
      Alert.alert('Sorry, something went wrong :(', 'Broadcast session is not ready. Please try again.');
    }
  }, [readyStatus]);

  const onIsBroadcastReadyHandler = useCallback(
    (isReady: boolean) =>
      setState((currentState) => ({
        ...currentState,
        readyStatus: isReady ? Ready : NotReady,
      })),
    [],
  );

  const onBroadcastStateChangedHandler = useCallback(
    (status: StateStatusUnion) =>
      setState((currentState) => ({
        ...currentState,
        stateStatus: status,
      })),
    [],
  );

  const onBroadcastAudioStatsHandler = useCallback(
    (stats: IAudioStats) =>
      setMetaData((currentState) => ({
        ...currentState,
        audioStats: {
          ...currentState.audioStats,
          ...stats,
        },
      })),
    [],
  );

  const onBroadcastQualityChangedHandler = useCallback(
    (quality: number) =>
      setMetaData((currentState) => ({
        ...currentState,
        streamQuality: quality,
      })),
    [],
  );

  const onNetworkHealthChangedHandler = useCallback(
    (health: number) =>
      setMetaData((currentState) => ({
        ...currentState,
        networkHealth: health,
      })),
    [],
  );

  const onBroadcastErrorHandler = useCallback(
    (exception: IBroadcastSessionError) => console.log('Broadcast session error: ', exception),
    [],
  );

  const onErrorHandler = useCallback(
    (errorMessage: string) => console.log('Internal module error: ', errorMessage),
    [],
  );

  const onMediaServicesWereLostHandler = useCallback(() => console.log('The media server is terminated.'), []);

  const onMediaServicesWereResetHandler = useCallback(() => console.log('The media server is restarted.'), []);

  const onAudioSessionInterruptedHandler = useCallback(() => {
    console.log('The audio session is interrupted.');
  }, []);

  const onAudioSessionResumedHandler = useCallback(() => {
    console.log('The audio session is resumed.');
  }, []);

  const onPressPlayButtonHandler = useCallback(() => cameraViewRef.current?.start(), []);

  const onPressStopButtonHandler = useCallback(() => cameraViewRef.current?.stop(), []);

  const onPressSwapCameraButtonHandler = useCallback(
    () => setCameraPosition((currentPosition) => (currentPosition === 'back' ? 'front' : 'back')),
    [],
  );

  const onPressMuteButtonHandler = useCallback(() => setIsMuted((currentIsMuted) => !currentIsMuted), []);

  const onPressMirrorButtonHandler = useCallback(() => setIsMirrored((currentIsMirrored) => !currentIsMirrored), []);

  const onPressAspectModeButtonHandler = useCallback((mode: CameraPreviewAspectMode) => setAspectMode(mode), []);

  const isStartButtonVisible = isDisconnected || stateStatus === INITIAL_BROADCAST_STATE_STATUS;

  return (
    <>
      <IVSBroadcastCameraView
        ref={cameraViewRef}
        style={s.cameraView}
        rtmpsUrl={MySetting.liveShoppingStreamUrl}
        streamKey={MySetting.liveShoppingStreamKey}
        videoConfig={VIDEO_CONFIG}
        audioConfig={AUDIO_CONFIG}
        isMuted={isMuted}
        isCameraPreviewMirrored={isMirrored}
        cameraPosition={cameraPosition}
        cameraPreviewAspectMode={aspectMode}
        onError={onErrorHandler} //모듈의 내부 오류가 발생했음을 나타냅니다.
        onBroadcastError={onBroadcastErrorHandler} //브로드캐스트 세션 오류가 발생했음을 나타냅니다.
        onIsBroadcastReady={onIsBroadcastReadyHandler} //브로드캐스트할 준비가 될 때 호출
        onBroadcastStateChanged={onBroadcastStateChangedHandler} //브로드캐스트 상태, 연결정도 알려줌
        onBroadcastAudioStats={onBroadcastAudioStatsHandler} //소리 변화를 알려줌
        onBroadcastQualityChanged={onBroadcastQualityChangedHandler} //브로드캐스트 품질 알려줌
        onNetworkHealthChanged={onNetworkHealthChangedHandler} //네트워크 품질 알려줌
        onAudioSessionInterrupted={onAudioSessionInterruptedHandler} //iOS에서 다른 시스템에 의해 소리르 못쓰는 상황 (시리, 전화)
        onAudioSessionResumed={onAudioSessionResumedHandler} // //iOS에서 다른 시스템에 의해 소리를 다시 쓰는 상황 (시리, 전화)
        onMediaServicesWereLost={onMediaServicesWereLostHandler} //iOS에서 아주 드물게, 브로드캐스트할 수 없는 상황
        onMediaServicesWereReset={onMediaServicesWereResetHandler} //iOS에서 다시 브로드캐스트 할 수 있는 상황이 될 때,
        {...(__DEV__ && {
          logLevel: 'debug',
          sessionLogLevel: 'debug',
        })}
      />
      {/* paddingLeft:'5px', paddingRight:'5px' */}
      <AbsoluteContainer>
        <Body>
          <Row fullWidth>
            <TouchableOpacity onPress={navigation.goBack}>
              <IconImage source={require('assets/ic-prev.png')} />
            </TouchableOpacity>
            <Space width={8} />
            <View style={{ marginTop: -5, marginRight: 13 }}>
              <Avatar size={35} src={avatarUrl}></Avatar>
            </View>
            <Text style={{ marginTop: 3, color: 'white' }}>Asysone Kim</Text>
            <Spacer />
            <TouchableOpacity onPress={onPressSwapCameraButtonHandler}>
              <CameraFlipImage />
            </TouchableOpacity>
          </Row>
          <Column fullWidth>
            <TouchableOpacity
              style={{ width: '100%' }}
              onPress={() => {
                LogUtil.info('onPress');
              }}
            >
              <TextInput
                style={{ textAlignVertical: 'top', width: '100%', borderBottomColor: 'white', borderBottomWidth: 1 }}
                placeholder={'Tap to add description...'}
                placeholderTextColor={'white'}
                editable={false}
                // onFocus={() => setFocus(true)}
                // onBlur={() => setFocus(false)}
                // onChangeText={(text) => {
                //   setSearchText(text);
                // }}
              />
            </TouchableOpacity>
            <Space height={26} />
            <Button label="Next" borderRadius width={'100%'} height={60} />
          </Column>
        </Body>
      </AbsoluteContainer>
      {/* <Modal visible transparent animationType="fade" supportedOrientations={['landscape', 'portrait']}>
        <SafeAreaProvider>
          {readyStatus === None ? (
            <Spinner />
          ) : (
            readyStatus === Ready && (
              <SafeAreaView testID="primary-container" style={s.primaryContainer}>
                <View style={s.topContainer}>
                  <View style={s.topButtonContainer}>
                    <Button title={isMuted ? 'Unmute' : 'Mute'} onPress={onPressMuteButtonHandler} />
                    <Button title="Toggle mirroring" onPress={onPressMirrorButtonHandler} />
                    <Button title="Swap" onPress={onPressSwapCameraButtonHandler} />
                    {isConnected && <Button title="Stop" onPress={onPressStopButtonHandler} />}
                  </View>
                  <View style={s.topButtonContainer}>
                    {(['none', 'fill', 'fit'] as const).map((mode) => (
                      <Button key={mode} title={mode} onPress={() => onPressAspectModeButtonHandler(mode)} />
                    ))}
                  </View>
                </View>
                {(isStartButtonVisible || isConnecting) && (
                  <View style={s.middleContainer}>
                    {isStartButtonVisible && <Button title="Start" onPress={onPressPlayButtonHandler} />}
                    {isConnecting && <Spinner />}
                  </View>
                )}
                <View style={s.bottomContainer}>
                  <View style={s.metaDataContainer}>
                    <Text style={s.metaDataText}>{`Peak ${audioStats.peak?.toFixed(2)}, Rms: ${audioStats.rms?.toFixed(
                      2,
                    )}`}</Text>
                    <Text style={s.metaDataText}>{`Stream quality: ${streamQuality}`}</Text>
                    <Text style={s.metaDataText}>{`Network health: ${networkHealth}`}</Text>
                  </View>
                  {isConnected && <Text style={s.liveText}>LIVE</Text>}
                </View>
              </SafeAreaView>
            )
          )}
        </SafeAreaProvider>
      </Modal> */}
    </>
  );
};

const s = StyleSheet.create({
  spinner: {
    flex: 1,
  },
  topContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topButtonContainer: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  middleContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bottomContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  button: {
    marginHorizontal: 8,
  },
  buttonText: {
    padding: 8,
    borderRadius: 8,
    fontSize: 20,
    color: '#ffffff',
    backgroundColor: 'rgba(128, 128, 128, 0.4)',
    textTransform: 'capitalize',
  },
  metaDataContainer: {
    flex: 1,
  },
  metaDataText: {
    color: '#ffffff',
  },
  liveText: {
    color: '#ffffff',
    padding: 8,
    backgroundColor: '#FF5C5C',
    borderRadius: 8,
  },
  cameraView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  primaryContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
});

export default BroadcastExamplePage;

const AbsoluteContainer = styled.View`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const Body = styled(Column)`
  width: 100%;
  height: 100%;
  justify-content: space-between;
  padding-left: 25px;
  padding-right: 25px;
  padding-top: 20px;
  padding-bottom: 20px;
`;

const IconImage = styled.Image`
  width: 22px;
  height: 22px;
  tint-color: ${(props) => (props.theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
