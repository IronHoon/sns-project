import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { COLOR } from '../../../constants/COLOR';
import PauseW from '../../../assets/chats/chatroom/ic-pause-white.svg';
import Pause from '../../../assets/chats/chatroom/ic-pause.svg';
import PlayW from '../../../assets/chats/chatroom/ic-play-white.svg';
import Play from '../../../assets/chats/chatroom/ic-play.svg';
import { Row } from '../../../components/layouts/Row';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Sound from 'react-native-sound';
import LogUtil from '../../../utils/LogUtil';

interface RecordProps {
  upload_urls: string[];
  isMe: boolean;
  dark: boolean;
}

const RecordBubble = ({ upload_urls, isMe, dark }: RecordProps) => {
  const [isPlay, setIsPlay] = useState<boolean>(false);
  const [playTime, setPlayTime] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const [record, setRecord] = useState<Sound>();
  const currentTime = useRef(0);

  useEffect(() => {
    const sound = new Sound(upload_urls[0], '', (e) => {
      if (e) {
        console.log('this is error', e);
      } else {
        sound && setRecord(sound);
      }
    });
  }, [upload_urls]);

  const playComplete = useCallback(
    (success) => {
      if (record) {
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
        record.setCurrentTime(0);
        setIsPlay(false);
      }
    },
    [record],
  );

  const onStartPlay = useCallback(async () => {
    setIsPlay(true);
    record?.play(playComplete);
    setInterval(() => {
      record?.getCurrentTime((seconds) => {
        //@ts-ignore
        setPlayTime(seconds * 1000);
        currentTime.current = seconds * 1000;
      });
    }, 100);
  }, [record]);

  const onPausePlay = useCallback(async () => {
    record?.pause();
    setIsPlay(false);
  }, [record]);
  const MILLISECONDS_PER_MINUTE = 60 * 1000;
  const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
  const hhmmssms = useCallback(
    (milliseconds) => {
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
    },
    [MILLISECONDS_PER_HOUR, MILLISECONDS_PER_MINUTE],
  );

  const handleSpeed = useCallback(() => {
    if (currentSpeed === 1) {
      record?.setSpeed(1.5);
      setCurrentSpeed(1.5);
    }
    if (currentSpeed === 1.5) {
      record?.setSpeed(2);
      setCurrentSpeed(2);
    }
    if (currentSpeed === 2) {
      record?.setSpeed(1);
      setCurrentSpeed(1);
    }
  }, [currentSpeed, record]);
  return (
    <Row style={{ alignItems: 'center', width: 140 }}>
      <Pressable style={{ marginRight: 10, marginLeft: 5 }} onPress={() => handleSpeed()}>
        <View
          style={{
            backgroundColor: !isMe ? '#262525' : COLOR.WHITE,
            borderRadius: 7.5,
            width: 32,
            height: 15,
            alignItems: 'center',
          }}
        >
          <Text style={[{ fontSize: 11 }, !isMe ? { color: COLOR.WHITE } : { color: COLOR.PRIMARY }]}>
            {currentSpeed}x
          </Text>
        </View>
      </Pressable>
      {isPlay ? (
        !record?.isPlaying() ? (
          <ActivityIndicator style={{ width: 15, height: 10 }} />
        ) : (
          <Pressable onPress={() => onPausePlay()}>
            {isMe ? <PauseW width={18} height={18} /> : <Pause width={18} height={18} />}
          </Pressable>
        )
      ) : (
        <Pressable onPress={() => onStartPlay()}>
          {isMe ? <PlayW width={18} height={18} /> : <Play width={18} height={18} />}
        </Pressable>
      )}
      <Text style={[{ marginLeft: 10 }, isMe ? { color: COLOR.WHITE } : { color: dark ? COLOR.WHITE : COLOR.BLACK }]}>
        {isPlay ? `${hhmmssms(playTime)}` : `${hhmmssms(record ? record?.getDuration() * 1000 : 0)}`}
      </Text>
    </Row>
  );
};

export default RecordBubble;
