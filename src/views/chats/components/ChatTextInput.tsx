import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import styled, { ThemeContext } from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import Plus from 'assets/chats/chatroom/ic-plus.svg';
import Emoji from 'assets/chats/chatroom/ic-imoji.svg';
import Mic from 'assets/chats/chatroom/ic-mic.svg';
import Send from 'assets/chats/chatroom/ic-send.svg';
import Delete from 'assets/chats/chatroom/ic-delete.svg';
import Play from 'assets/chats/chatroom/ic-play.svg';
import PlayW from 'assets/chats/chatroom/ic-play-white.svg';
import Stop from 'assets/chats/chatroom/ic-stop.svg';
import StopW from 'assets/chats/chatroom/ic-stop-white.svg';
import Pause from 'assets/chats/chatroom/ic-pause.svg';
import PauseW from 'assets/chats/chatroom/ic-pause-white.svg';
import { Dimensions, Keyboard, Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import Reply from 'assets/chats/ic-reply.svg';
import { Column } from 'components/layouts/Column';
import { useAtomValue } from 'jotai';
import userAtom from '../../../stores/userAtom';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { uploadS3ByImagePicker } from 'lib/uploadS3';
import uuid from 'react-native-uuid';
import ChatDataUtil from 'utils/chats/ChatDataUtil';
import LogUtil from 'utils/LogUtil';
import PermissionUtil from 'utils/PermissionUtil';
import { PERMISSIONS, RESULTS } from 'react-native-permissions';
import Message from 'types/chats/rooms/messages/Message';
import Space from '../../../components/utils/Space';
import { useTranslation } from 'react-i18next';
import ParsedText from 'react-native-parsed-text';
import MicStream from 'react-native-microphone-stream';
import { SuggestionStateType, Word } from './ChatRoomFooter';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import tw from 'twrnc';
import { Else, If, Then, When } from 'react-if';
import useSocket from '../../../hooks/useSocket';

const WordSuggestionWrapper = styled.View`
  width: 100%;
  background-color: ${({ theme }) => (theme.dark ? '#464646' : 'white')};
`;

const WordText = styled.Text`
  font-size: 13px;
`;

const WordSuggestionItem = styled.View`
  background-color: ${COLOR.GRAY};
  padding: 7px;
  margin-left: 12px;
  border-radius: 15px;
  cursor: pointer;
`;

const WordSuggestionScrollView = styled.ScrollView`
  padding-top: 8px;
  padding-bottom: 8px;
`;

type WordSuggestionItemsProps = { words: Word[]; setSuggestionState: Function; setValue: Function };
const WordSuggestionItems = ({ words, setValue }: WordSuggestionItemsProps) => {
  const onClick = (word) => {
    setValue((value) => {
      let strList = value.split(' ');
      strList = strList.slice(0, strList.length - 1);

      let newValue = strList.join(' ');
      newValue += ` ${word.idiom}`;
      return newValue;
    });
  };

  const renderItems = () => {
    return (
      <>
        {words.map((word, i) => (
          <TouchableOpacity key={i} onPress={() => onClick(word)}>
            <WordSuggestionItem>
              <WordText>{word.idiom}</WordText>
            </WordSuggestionItem>
          </TouchableOpacity>
        ))}
      </>
    );
  };

  return <WordSuggestionScrollView horizontal={true}>{renderItems()}</WordSuggestionScrollView>;
};

const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

type ChatTextInputProps = {
  input;
  chatRoomMode;
  setChatRoomMode;
  onSend;
  parentMessage?: Message;
  setParentMessage;
  isBlockUser?: boolean;
  isSystemAccount?: boolean;
  setChatText: Function;
  chatText: string;
  suggestionState: SuggestionStateType;
  setSuggestionState: Function;
  words;
  setWords;
  isStipopShowing;
  showStipopBottomSheet;
};

export function ChatTextInput({
  input,
  chatRoomMode,
  setChatRoomMode,
  onSend,
  parentMessage,
  setParentMessage,
  isBlockUser,
  isSystemAccount,
  setChatText,
  chatText,
  suggestionState,
  setSuggestionState,
  words,
  /*
    미사용 코드로 추정되어 주석처리함
    Commented out because it seems to be unused code
   */
  // setWords,
  isStipopShowing,
  showStipopBottomSheet,
}: ChatTextInputProps) {
  const { t } = useTranslation();
  const themeContext = useContext(ThemeContext);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPlay, setIsPlay] = useState<boolean>(false);
  const me = useAtomValue(userAtom);
  const maxSound = useRef(0);
  const screenWidth = Dimensions.get('window').width;
  const [, setLineCount] = useState(1);
  const { chatSocketUtil } = useSocket();

  const [path, setPath] = useState('');
  const [state, setState] = useState({
    isLoggingIn: false,
    recordSecs: 0,
    recordTime: '00:00:00',
    currentPositionSec: 0,
    currentDurationSec: 0,
    playTime: '00:00:00',
    duration: '00:00:00',
    audioRecorderPlayer: new AudioRecorderPlayer(),
  });

  const offset = useSharedValue(0);
  const [audioList, setAudioList] = useState<Array<number>>([]);
  const timer1 = useRef();
  /*
    미사용 코드로 추정되어 주석처리함
    Commented out because it seems to be unused code
   */
  // const timer2 = useRef();

  const animatedStyles = useAnimatedStyle(() => {
    return {
      // transform: [{ }]
      transform: [{ translateX: 0 }],
      height: offset.value > 100 ? 25 : offset.value / 4,
      // width:offset.value> screenWidth-170? screenWidth-170:offset.value
    };
  });

  const getPermissions = async () => {
    try {
      const grants = await PermissionUtil.checkMultiplePermissions([
        Platform.OS === 'ios' ? PERMISSIONS.IOS.MEDIA_LIBRARY : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
      ]);

      if (
        grants[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] === RESULTS.DENIED ||
        grants[PERMISSIONS.IOS.MEDIA_LIBRARY] === RESULTS.DENIED
      ) {
        await PermissionUtil.requestPermission(
          Platform.OS === 'ios' ? PERMISSIONS.IOS.MEDIA_LIBRARY : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        );
      }
      if (
        grants[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] === RESULTS.DENIED ||
        grants[PERMISSIONS.IOS.PHOTO_LIBRARY] === RESULTS.DENIED
      ) {
        await PermissionUtil.requestPermission(
          Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        );
      }
      if (
        grants[PERMISSIONS.ANDROID.RECORD_AUDIO] === RESULTS.DENIED ||
        grants[PERMISSIONS.IOS.MICROPHONE] === RESULTS.DENIED
      ) {
        await PermissionUtil.requestPermission(
          Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
        );
      }
    } catch (err) {
      console.warn(err);
      return;
    }
  };

  const sendMessage = async () => {
    setAudioList([]);
    setLineCount(1);
    if (chatRoomMode === 'recordMode') {
      stopRecording().then(async () => {
        let name = uuid.v4().toString();
        LogUtil.info('record uri', path);
        let file = {
          assets: [
            {
              uri: path,
              fileName: Platform.select({
                ios: `${name}.m4a`,
                android: `${name}.mp4`,
              }),
              type: Platform.select({
                ios: 'audio/m4a',
                android: 'audio/mp4',
              }),
            },
          ],
        };
        const mediaRes = await uploadS3ByImagePicker(file);
        if (mediaRes) {
          onSend([
            ChatDataUtil.newMessage({
              type: 'record',
              text: `[${t('chats-main.Record')}]`,
              uploadPathList: [mediaRes.url],
              uploadSizeList: [mediaRes.size ?? 0],
            }),
          ]);
          setChatRoomMode('normal');
        }
      });
    } else if (chatRoomMode === 'replyMode') {
      onSend([ChatDataUtil.newMessage({ text: chatText, type: 'chat', parentMessage: parentMessage })]);
      setChatText('');
      setChatRoomMode('normal');
    } else {
      onSend([ChatDataUtil.newMessage({ text: chatText, type: 'chat' })]);
      setChatText('');
    }
  };

  const hhmmssms = (milliseconds) => {
    let hour = Math.floor(milliseconds / MILLISECONDS_PER_HOUR);
    let min = Math.floor((milliseconds % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE);
    let sec = Math.floor((milliseconds % MILLISECONDS_PER_MINUTE) / 1000);
    // let ms = Math.floor(milliseconds % 1000);
    return `${hour < 10 ? `0${hour}` : `${hour}`}:${min < 10 ? `0${min}` : `${min}`}:${
      sec < 10 ? `0${sec}` : `${sec}`
    }`;
    // return `${hour < 10 ? `0${hour}` : `${hour}`}:${min < 10 ? `0${min}` : `${min}`}:${
    //   sec < 10 ? `0${sec}` : `${sec}`
    // }.${String(ms).padEnd(3, '0')}`;
  };
  const onStartRecord = async () => {
    /*
      미사용 코드로 추정되어 주석 처리함
      Commented out because it seems to be unused code
     */
    // const audioSet: AudioSet = {
    //   AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
    //   AudioSourceAndroid: AudioSourceAndroidType.MIC,
    //   AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
    //   AVNumberOfChannelsKeyIOS: 2,
    //   AVFormatIDKeyIOS: AVEncodingOption.aac,
    // };

    setInterval(() => {
      if (maxSound.current < offset.value) maxSound.current = offset.value;
    }, 1);
    /*
      210픽셀은 좌우 버튼의 크기를 대략적으로 계산한 것임
      210 pixels is an approximate calculation of the size of the left and right buttons
     */
    const MAX_BARS = (screenWidth - 230) / 5;
    //@ts-ignore
    setInterval(() => {
      if (audioList.length > MAX_BARS) {
        audioList.splice(0, 1);
      }
      if (maxSound.current > 100) {
        audioList.push(25);
        maxSound.current = 10;
      } else {
        audioList.push(maxSound.current / 4);
        maxSound.current = 10;
      }
    }, 200);

    //? Custom path
    // const uri = await this.audioRecorderPlayer.startRecorder(
    //   this.path,
    //   audioSet,
    // );
    uuid.v4().toString();

    //? Default path
    const uri = await state.audioRecorderPlayer.startRecorder();

    state.audioRecorderPlayer.addRecordBackListener((e) => {
      setState({
        ...state,
        recordSecs: e.currentPosition,
        recordTime: hhmmssms(e.currentPosition),
      });
    });

    setPath(uri);
  };

  const onStopRecord = async () => {
    await state.audioRecorderPlayer.stopRecorder();
    LogUtil.info('timer1', timer1.current);
    state.audioRecorderPlayer.removeRecordBackListener();
    setState({
      ...state,
      recordSecs: 0,
    });
  };

  const onStartPlay = async () => {
    console.log('onStartPlay');
    const msg = await state.audioRecorderPlayer.startPlayer();
    const volume = await state.audioRecorderPlayer.setVolume(1.0);

    console.log(`file: ${msg}`, `volume: ${volume}`);
    state.audioRecorderPlayer.addPlayBackListener((e) => {
      if (e.currentPosition === e.duration) {
        console.log('finished');
        state.audioRecorderPlayer.stopPlayer();
        setIsPlay(false);
      }
      setState({
        ...state,
        currentPositionSec: e.currentPosition,
        currentDurationSec: e.duration,
        playTime: hhmmssms(e.currentPosition),
        duration: hhmmssms(e.duration),
      });
    });
  };

  const onPausePlay = async () => {
    await state.audioRecorderPlayer.pausePlayer();
  };

  const startRecording = () => {
    isStipopShowing && showStipopBottomSheet();
    if (Platform.OS === 'android') {
      getPermissions();
    }
    setChatRoomMode('recordMode');
    setIsRecording(true);
    onStartRecord();

    MicStream.addListener((data) => {
      //TODO:Show waveform of MicData
      if (Platform.OS === 'ios') {
        if (data[0] > 8000) {
          offset.value = 100;
        } else if (data[0] > 4000) {
          offset.value = 80 + (data[0] - 4000) / 200;
        } else if (data[0] > 2000) {
          offset.value = 60 + (data[0] - 2000) / 100;
        } else if (data[0] > 1000) {
          offset.value = 40 + (data[0] - 1000) / 50;
        } else if (data[0] > 500) {
          offset.value = 20 + (data[0] - 500) / 25;
        } else if (data[0] > 300) {
          offset.value = 10 + (data[0] - 300) / 10;
        } else {
          offset.value = 10;
          // offset.value=5
        }
      } else {
        if (data[0] > 1000) {
          offset.value = 100;
        } else if (data[0] > 800) {
          offset.value = 80 + (data[0] - 800) / 10;
        } else if (data[0] > 600) {
          offset.value = 60 + (data[0] - 600) / 10;
        } else if (data[0] > 400) {
          offset.value = 40 + (data[0] - 400) / 10;
        } else if (data[0] > 200) {
          offset.value = 20 + (data[0] - 200) / 10;
        } else if (data[0] > 100) {
          offset.value = 10 + (data[0] - 100) / 10;
        } else {
          offset.value = 10;
          // offset.value=5
        }
      }
    });
    MicStream.init({
      bufferSize: 1024,
      sampleRate: 17640,
      bitsPerChannel: 16,
      channelsPerFrame: 1,
    });
    MicStream.start();
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await onStopRecord();
    MicStream.stop();
    setAudioList([]);
  };

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const playRecording = () => {
    setIsPlay(true);
    onStartPlay();
  };
  const pauseRecording = () => {
    setIsPlay(false);
    onPausePlay();
  };
  const handleDelete = async () => {
    setIsPlay(false);
    onPausePlay();
    await onStopRecord();
    setChatRoomMode('normal');
    MicStream.stop();
    setAudioList([]);
  };

  // LogUtil.info(`ChatTextInput chatRoomMode, ${[chatRoomMode]}`,);
  return (
    <ChatTextInputContainer>
      {/*
        ----------------------------------------------------------------------------------------------------------------
        입력 영역 상단 표시 영역
        Input Area Top
        ----------------------------------------------------------------------------------------------------------------
      */}
      {/*
        검색 결과가 표시될 때
        When Search Result is displayed
      */}
      <When condition={suggestionState === 'searched' && me?.setting.ct_word_suggestion === 1}>
        <WordSuggestionWrapper>
          <WordSuggestionItems words={words} setSuggestionState={setSuggestionState} setValue={setChatText} />
        </WordSuggestionWrapper>
      </When>
      {/*
        답장을 작성할 때
        When writing a reply
      */}
      <When condition={chatRoomMode === 'replyMode'}>
        <ReplyContainer>
          <Column style={{ flex: 1 }}>
            <ReplyTitle>{`Reply to ${parentMessage?.user?.first_name ?? ''} ${
              parentMessage?.user?.last_name ?? ''
            }`}</ReplyTitle>
            <ReplyMessage numberOfLines={1}>{parentMessage?.content}</ReplyMessage>
          </Column>
          <IconContainer
            onPress={() => {
              setParentMessage(undefined);
              setChatRoomMode('normal');
              Keyboard.dismiss();
            }}
          >
            <Close source={require('assets/ic-close.png')} />
          </IconContainer>
        </ReplyContainer>
      </When>
      <View style={tw`flex-row items-center`}>
        {/*
        ----------------------------------------------------------------------------------------------------------------
        좌측 버튼 영역
        Left Button Area
        ----------------------------------------------------------------------------------------------------------------
        */}
        <When condition={chatRoomMode === 'normal' || chatRoomMode === 'searchMode'}>
          <Pressable
            style={[{ padding: 6, marginLeft: 6 }]}
            onPress={() => {
              isStipopShowing && showStipopBottomSheet();
              Keyboard.dismiss();
              setChatRoomMode('plusMenu');
              setLineCount(1);
            }}
          >
            <Plus width={22} height={22} />
          </Pressable>
        </When>
        {/*
          녹음 모드일 때
          When recording mode
        */}
        <When condition={chatRoomMode === 'recordMode'}>
          <Pressable style={{ padding: 6, marginLeft: 6 }} onPress={() => handleDelete()}>
            <Delete width={22} height={22} />
          </Pressable>
        </When>
        {/*
          --------------------------------------------------------------------------------------------------------------
          중앙 입력 영역
          Center Input Area
          --------------------------------------------------------------------------------------------------------------
        */}
        <View style={tw`flex-1 justify-center`}>
          <If condition={isBlockUser || isSystemAccount || chatSocketUtil.connecting}>
            {/*
              소켓에 연결중이거나 블락된 사용자이거나 시스템 어카운트일 경우 입력되지 않도록 한다
              When connecting to socket or blocked user or system account, input is not allowed
            */}
            <Then>
              <ChatContainer style={{ height: 42, marginLeft: 6 }}>
                <Block>
                  <When condition={chatSocketUtil.connecting}>Connecting...</When>
                  <When condition={isBlockUser}>Can't chat with blocked user.</When>
                  <When condition={isSystemAccount}>Can't chat with system user.</When>
                </Block>
              </ChatContainer>
            </Then>
            {/*
              입력이 제한되지 않는 거의 모든 상태가 여기에 해당한다
              Almost all states that are not limited to input are here
            */}
            <Else>
              <TextInputWrap>
                {/*
                  + 버튼을 눌러서 열린 상태일때
                  When the + button is pressed and opened
                */}
                <When condition={chatRoomMode === 'plusMenu'}>
                  <Pressable
                    style={{ marginRight: 15 }}
                    onPress={() => {
                      setChatRoomMode('normal');
                      input.current?.focus();
                    }}
                  >
                    <IconImage source={require('assets/ic-close.png')} />
                  </Pressable>
                </When>
                {/*
                  답장 모드일 때
                  When reply mode
                */}
                <When condition={chatRoomMode === 'replyMode'}>
                  <Pressable style={{ marginRight: 15 }}>
                    <Reply width={22} height={22} />
                  </Pressable>
                </When>
                <ChatContainer>
                  <If condition={chatRoomMode !== 'recordMode'}>
                    {/*
                      녹음 모드가 아닐 때
                      When not recording mode
                    */}
                    <Then>
                      <ChatInput
                        //@ts-ignore
                        ref={input}
                        placeholder="Message"
                        placeholderTextColor={'#bbbbbb'}
                        style={[
                          {
                            marginBottom: 5,
                          },
                        ]}
                        onChangeText={(text) => {
                          setChatText(text);
                        }}
                        multiline={true}
                        returnKeyLabel={'send'}
                        autoCompleteType={'off'}
                        autoCorrect={false}
                        onPressIn={() => isStipopShowing && showStipopBottomSheet()}
                        onFocus={() => {
                          if (chatRoomMode === 'plusMenu') {
                            setChatRoomMode('normal');
                          }
                        }}
                      >
                        <ParsedText
                          parse={[
                            {
                              pattern: /\b(\w+)$/,
                              style: {
                                textDecorationLine: suggestionState === 'searched' ? 'underline' : undefined,
                                textDecorationColor: suggestionState === 'searched' ? 'black' : undefined,
                              },
                              onPress: () => {},
                            },
                          ]}
                          childrenProps={{ allowFontScaling: false }}
                        >
                          {chatText}
                        </ParsedText>
                      </ChatInput>
                    </Then>
                    {/*
                      녹음 모드일 때
                      When recording mode
                    */}
                    <Else>
                      <RecordContainer>
                        <If condition={isRecording}>
                          {/*
                            녹음이 진행중일 때
                            When recording is in progress
                          */}
                          <Then>
                            <Pressable onPress={() => stopRecording()}>
                              {themeContext.dark ? <StopW width={22} height={22} /> : <Stop width={22} height={22} />}
                            </Pressable>
                            <Space width={10} />
                            {audioList.map((item, index) => (
                              <Fragment key={index.toString()}>
                                <View
                                  style={{
                                    width: 2.5,
                                    height: item,
                                    backgroundColor: COLOR.PRIMARY,
                                    borderRadius: 1.25,
                                  }}
                                ></View>
                                <Space width={3} />
                              </Fragment>
                            ))}
                            <Animated.View style={[styles.box, animatedStyles]}></Animated.View>
                          </Then>
                          {/*
                            녹음이 진행중이 아닐 때
                            When recording is not in progress
                          */}
                          <Else>
                            <If condition={isPlay}>
                              {/*
                                재생중일 때
                                When playing
                              */}
                              <Then>
                                <Pressable onPress={() => pauseRecording()}>
                                  {themeContext.dark ? (
                                    <PauseW width={22} height={22} />
                                  ) : (
                                    <Pause width={22} height={22} />
                                  )}
                                </Pressable>
                              </Then>
                              {/*
                                재생중이 아닐 때
                                When not playing
                              */}
                              <Else>
                                <Pressable onPress={() => playRecording()}>
                                  {themeContext.dark ? (
                                    <PlayW width={22} height={22} />
                                  ) : (
                                    <Play width={22} height={22} />
                                  )}
                                </Pressable>
                              </Else>
                            </If>
                          </Else>
                        </If>
                        <Time>{isPlay ? state.playTime : state.recordTime}</Time>
                      </RecordContainer>
                    </Else>
                  </If>
                </ChatContainer>
              </TextInputWrap>
            </Else>
          </If>
        </View>
        {/*
          --------------------------------------------------------------------------------------------------------------
          우측 버튼 영역
          Right button area
          --------------------------------------------------------------------------------------------------------------
        */}
        {/*
          녹음 모드가 아닐 때 스티커 삽입 버튼을 표시한다
          When not recording mode, show sticker insertion button
        */}
        <When condition={chatRoomMode !== 'recordMode'}>
          <Pressable
            style={[{ padding: 6 }]}
            onPress={() => {
              if (chatRoomMode !== 'normal') {
                setChatRoomMode('normal');
              }
              showStipopBottomSheet();
            }}
          >
            <Emoji width={22} height={22} />
          </Pressable>
        </When>
        <If condition={chatText !== '' || chatRoomMode === 'recordMode'}>
          {/*
            입력한 메시지가 있거나 녹음 모드일 때
            When there is a message entered or recording mode
          */}
          <Then>
            <Pressable style={[{ padding: 6, marginRight: 6 }]} onPress={sendMessage}>
              <Send width={22} height={22} />
            </Pressable>
          </Then>
          {/*
            입력한 메시지가 없다면 녹음 시작 버튼을 노출한다
            If there is no message entered, the recording start button is exposed
          */}
          <Else>
            <Pressable style={[{ padding: 6, marginRight: 6 }]} onPress={() => startRecording()}>
              <Mic width={22} height={22} />
            </Pressable>
          </Else>
        </If>
      </View>
    </ChatTextInputContainer>
  );
}

export default ChatTextInput;

const ChatTextInputContainer = styled.View`
  background-color: ${({ theme }) => (theme.dark ? '#464646' : '#ffffff')};
  //min-height: 50px;
  padding-top: 10px;
  max-height: 130px;
`;

const TextInputWrap = styled.View`
  flex-direction: row;
  padding-left: 6px;
  padding-right: 6px;
  align-items: center;
  min-height: 30px;
  max-height: 130px;
  background-color: ${({ theme }) => (theme.dark ? '#464646' : '#ffffff')};
`;
const ChatInput = styled.TextInput`
  flex: 1;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const ChatContainer = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => (theme.dark ? '#464646' : '#ffffff')};
  border-radius: 10px;
  align-items: center;
`;
const RecordContainer = styled.View`
  flex: 1;
  flex-direction: row;
  background-color: ${({ theme }) => (theme.dark ? '#464646' : '#ffffff')};
  border-radius: 23px;
  margin-right: 15px;
  padding: 16px 15px;
  align-items: center;
`;
const Time = styled.Text`
  position: absolute;
  right: -40px;
  color: #bbbbbb;
  font-size: 12px;
  margin-right: 20px;
`;
const Block = styled.Text`
  flex: 1;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : '#bbbbbb')};
`;
const IconImage = styled.Image`
  width: 22px;
  height: 22px;
  tint-color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const ReplyContainer = styled.View`
  flex-direction: row;
  height: 60px;
  padding: 20px;
  background-color: ${({ theme }) => (theme.dark ? '#464646' : '#ffffff')};
`;
const ReplyTitle = styled.Text`
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 5px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const ReplyMessage = styled.Text`
  font-size: 13px;
  color: #bbbbbb;
`;
const IconContainer = styled.TouchableOpacity`
  margin-top: 10px;
  margin-left: 20px;
  justify-content: center;
  align-items: center;
`;
const Close = styled.Image`
  width: 16px;
  height: 16px;
  tint-color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

const styles = StyleSheet.create({
  box: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: COLOR.PRIMARY,
  },
});
