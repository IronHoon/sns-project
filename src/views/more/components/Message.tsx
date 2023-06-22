import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Dimensions, Image, Linking, Pressable, Text, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components';

import { Avatar } from 'components/atoms/image';
import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';

import BookmarkOn from 'assets/images/icon/ic-bookmark-on.svg';
import Move from 'assets/images/icon/ic-move.svg';
import MoveW from 'assets/images/icon/ic-move-w.svg';
import SenderInfo from './SenderInfo';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import Room from 'types/chats/rooms/Room';
import { ThemeContext } from 'styled-components/native';
import Lightbox from 'react-native-lightbox-v2';
import { FlatGrid, SectionGrid } from 'react-native-super-grid';
import Play from 'assets/chats/chatroom/ic-play.svg';
import Pause from 'assets/chats/chatroom/ic-pause.svg';
import Voice from 'assets/chats/call/ic_call.svg';
import Video from 'assets/chats/call/ic_video.svg';
import Sound from 'react-native-sound';
import { createThumbnail, Thumbnail } from 'react-native-create-thumbnail';
import { Column } from 'components/layouts/Column';
import { LinkPreview } from '@flyerhq/react-native-link-preview';
import path from 'path';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import User from 'types/auth/User';
import LocationBubble from 'views/chats/components/chatbubble/LocationBubble';
import LogUtil from 'utils/LogUtil';

const IconContainer = styled(TouchableOpacity)`
  height: 22px;
  width: 22px;
`;
const ContentContainer = styled(TouchableOpacity)`
  flex-direction: row;
  margin: 15px 0 30px;
  padding-right: 20px;
  align-items: center;
`;
const Content = styled(View)`
  background: ${COLOR.LIGHT_GRAY};
  border-radius: 15px;
  color: ${COLOR.BLACK};
  cursor: pointer;
  font-size: 13px;
  padding: 15px;
  width: 100%;
`;
const ImgContainer = styled(Lightbox)<{ isLandscape: boolean }>`
  border-radius: 11px;
  max-height: ${({ isLandscape }) =>
    isLandscape ? `${Dimensions.get('window').width * 0.4}px` : `${Dimensions.get('window').width * 0.6}px`};
  min-width: ${({ isLandscape }) =>
    isLandscape ? `${Dimensions.get('window').width * 0.55}px` : `${Dimensions.get('window').width * 0.45}px`};
  min-height: ${`${Dimensions.get('window').width * 0.4}px`};
  margin-top: 4px;
  margin-bottom: 4px;
  margin-left: 8px;
  margin-right: 6px;
  overflow: hidden;
`;
const ImgsContainer = styled(Lightbox)<{ isLandscape: boolean }>`
  margin: 1px;
`;
const Img = styled(Image)<{ open: boolean }>`
  width: 100%;
  height: 100%;
  /* aspect-ratio: 1; */
  border-radius: ${({ open }) => (open ? '0px' : '11px')};
`;
const Imgs = styled(Image)<{ open: boolean }>`
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  border-radius: ${({ open }) => (open ? '0px' : '11px')};
`;
const BubbleText = styled(Text)`
  color: ${COLOR.BLACK};
`;

type FileBubbleProps = { fileUrl: string; fileSize?: number };
function FileBubble({ fileUrl, fileSize }: FileBubbleProps) {
  const fileName = path.basename(fileUrl);
  const fileType = path.extname(fileUrl);

  let image = require('../../../assets/chats/chatroom/ic_file_unknown.png');
  if (fileType.includes('doc')) {
    image = require('../../../assets/chats/chatroom/ic_file_doc.png');
  } else if (
    fileType.includes('jpg') ||
    fileType.includes('jpeg') ||
    fileType.includes('png') ||
    fileType.includes('gif')
  ) {
    image = require('../../../assets/chats/chatroom/ic_file_image.png');
  } else if (fileType.includes('pdf')) {
    image = require('../../../assets/chats/chatroom/ic_file_pdf.png');
  } else if (fileType.includes('ppt')) {
    image = require('../../../assets/chats/chatroom/ic_file_ppt.png');
  } else if (fileType.includes('xlsx')) {
    image = require('../../../assets/chats/chatroom/ic_file_xlsx.png');
  } else if (fileType.includes('apk')) {
    image = require('../../../assets/chats/chatroom/ic_file_apk.png');
  }

  return (
    <Row justify="center" align="center">
      <Image source={image} style={{ width: 50, height: 50, margin: 15 }} />
      <Column style={{ width: 155 }}>
        <Text style={{ marginBottom: 5 }}>{fileName}</Text>
        {fileSize && <Text style={{ color: '#999999' }}>{(fileSize / 1024 / 1024).toFixed(2)} MB</Text>}
      </Column>
    </Row>
  );
}

const Message = ({ data, onClick, setIsVisible }) => {
  const me = useAtomValue<User | null>(userAtom);
  const navigation = useNavigation<MainNavigationProp>();
  const themeContext = useContext(ThemeContext);
  // console.log(data.message.type)
  const originalMessage = data.message;
  const messageText = data.message?.content;
  const messageType = data.message?.type;
  const upload_urls = data.message?.url;
  const upload_urls_size = data.message?.upload_urls_size;
  const contactName = data.message?.contactName;
  const contactNumber = data.message?.contactNumber;

  const [isLightbox, setIsLightbox] = useState<boolean>(false);
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const [isPlay, setIsPlay] = useState<boolean>(false);
  const [record, setRecord] = useState<Sound>();
  const [playTime, setPlayTime] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(1);
  const [videoThumbnail, setVideoThumbnail] = useState<Thumbnail>();

  const MILLISECONDS_PER_MINUTE = 60 * 1000;
  const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

  const hhmmssms = (milliseconds) => {
    let hour = Math.floor(milliseconds / MILLISECONDS_PER_HOUR);
    let min = Math.floor((milliseconds % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE);
    let sec = Math.floor((milliseconds % MILLISECONDS_PER_MINUTE) / 1000);
    let ms = Math.floor(milliseconds % 1000);
    // return `${hour < 10 ? `0${hour}` : `${hour}`}:${min < 10 ? `0${min}` : `${min}`}:${sec < 10 ? `0${sec}` : `${sec}`}`;
    return `${hour < 10 ? `0${hour}` : `${hour}`}:${min < 10 ? `0${min}` : `${min}`}:${
      sec < 10 ? `0${sec}` : `${sec}`
    }.${String(ms).padEnd(3, '0')}`;
  };

  const playComplete = (success) => {
    if (record) {
      if (success) {
        console.log('successfully finished playing');
      } else {
        console.log('playback failed due to audio decoding errors');
      }
      record.setCurrentTime(0);
      setIsPlay(false);
    }
  };

  const onStartPlay = async () => {
    setIsPlay(true);
    record?.play(playComplete);
    setInterval(() => {
      record?.getCurrentTime((seconds) => {
        //@ts-ignore
        setPlayTime(seconds * 1000);
      });
    }, 100);
  };

  const onPausePlay = async () => {
    record?.pause();
    setIsPlay(false);
  };

  const handleSpeed = () => {
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
  };

  const goChatRoom = () => {
    if (data.message.deleted_from_user_ids.includes(me?.id)) {
      // This message has been deleted
      setIsVisible(true);
    } else {
      ChatHttpUtil.requestGetRoom(data.room_id).then((room) => {
        if (room) {
          /* 해당 메세지 있는 채팅방으로 이동 */
          navigation.navigate('/chats/chat-room', { room: room });
        }
      });
    }
  };

  const onPressLocationBubble = useCallback(
    (formattedAddress, latitude, longitude) => {
      LogUtil.info('onPressLocationBubble');
      navigation.navigate('/chats/chat-room/view-map', { locationInfo: { formattedAddress, latitude, longitude } });
    },
    [navigation],
  );

  useEffect(() => {
    if (upload_urls?.length === 1) {
      Image.getSize(upload_urls[0], (width, height) => {
        setImgWidth(width);
        setImgHeight(height);
      });
    }

    if (messageType === 'video' && upload_urls?.[0]) {
      createThumbnail({
        url: upload_urls[0],
        timeStamp: 10000,
      })
        .then((response) => {
          setVideoThumbnail(response);
        })
        .catch((err) => {});
    }

    if (messageType === 'record' && messageText) {
      const sound = new Sound(messageText, undefined, (e) => {
        if (e) {
          console.log(e);
        } else {
          sound && setRecord(sound);
        }
      });
    }
  }, []);

  return (
    <View>
      <Row align="center" justify="space-between">
        <Row align="center" style={{ width: Dimensions.get('window').width - 110 }}>
          <Avatar size={40} src={originalMessage.user ? originalMessage.user.profile_image : ''} />
          <SenderInfo
            date={data.message.createdAt}
            name={
              originalMessage.user
                ? `${data.message.user.first_name}${
                    data.message.user.last_name !== null && ` ${data.message.user.last_name}`
                  }`
                : 'Unknown'
            }
          />
        </Row>
        <IconContainer onPress={() => onClick(data.room_id, data.message_id)}>
          <BookmarkOn />
        </IconContainer>
      </Row>
      <ContentContainer onPress={() => goChatRoom()}>
        <Content>
          {messageType === 'image' && (
            <View>
              {upload_urls?.length === 1 ? (
                <ImgContainer
                  isLandscape={imgWidth >= imgHeight}
                  onOpen={() => setIsLightbox(true)}
                  willClose={() => setIsLightbox(false)}
                >
                  <Img
                    open={isLightbox}
                    style={{
                      resizeMode: isLightbox ? 'contain' : 'cover',
                    }}
                    source={{ uri: upload_urls[0] }}
                  />
                </ImgContainer>
              ) : (
                <FlatGrid
                  itemDimension={90}
                  maxDimension={90 * 3}
                  spacing={0}
                  data={upload_urls ?? []}
                  renderItem={({ item: url }) => (
                    <ImgsContainer
                      isLandscape={imgWidth >= imgHeight}
                      onOpen={() => setIsLightbox(true)}
                      willClose={() => setIsLightbox(false)}
                      style={{ width: !isLightbox ? 90 : undefined, height: !isLightbox ? 90 : undefined }}
                    >
                      <Imgs
                        open={isLightbox}
                        style={{
                          resizeMode: isLightbox ? 'contain' : 'cover',
                          width: !isLightbox ? 88 : undefined,
                          height: !isLightbox ? 88 : undefined,
                        }}
                        source={{ uri: url }}
                      />
                    </ImgsContainer>
                  )}
                  keyExtractor={(item, index) => item}
                />
              )}
            </View>
          )}
          {messageType === 'video' && (
            <View
              style={{
                width: 200,
                alignSelf: 'center',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
                ...(videoThumbnail?.width && videoThumbnail?.height
                  ? { aspectRatio: videoThumbnail?.width / videoThumbnail?.height }
                  : {}),
              }}
            >
              <Image
                style={{
                  position: 'absolute',
                  width: 200,
                  borderRadius: 11,
                  ...(videoThumbnail?.width && videoThumbnail?.height
                    ? { aspectRatio: videoThumbnail?.width / videoThumbnail?.height }
                    : {}),
                }}
                source={{ uri: videoThumbnail?.path }}
              />
              {videoThumbnail?.path && (
                <Image
                  style={{ width: 40, height: 40 }}
                  source={require('../../../assets/chats/chatroom/ic_play_overlay.png')}
                />
              )}
            </View>
          )}
          {(messageType === 'chat' ||
            messageType === 'file' ||
            messageType === 'voice_talk' ||
            messageType === 'face_talk' ||
            messageType === 'record' ||
            messageType === 'contact') && (
            <Column>
              {messageType === 'record' ? (
                <Row style={{ alignItems: 'center' }}>
                  <Pressable style={{ marginRight: 10 }} onPress={() => handleSpeed()}>
                    <View
                      style={{
                        borderRadius: 7.5,
                        width: 32,
                        height: 15,
                        alignItems: 'center',
                        backgroundColor: COLOR.BLACK,
                      }}
                    >
                      <Text style={[{ fontSize: 11, color: COLOR.WHITE }]}>{currentSpeed}x</Text>
                    </View>
                  </Pressable>
                  {isPlay ? (
                    <Pressable onPress={() => onPausePlay()}>
                      <Pause width={18} height={18} />
                    </Pressable>
                  ) : (
                    <Pressable onPress={() => onStartPlay()}>
                      <Play width={18} height={18} />
                    </Pressable>
                  )}
                  <BubbleText style={[{ marginLeft: 10 }]}>
                    {isPlay ? `${hhmmssms(playTime)}` : `${hhmmssms(record ? record?.getDuration() * 1000 : 0)}`}
                  </BubbleText>
                </Row>
              ) : (
                <>
                  <Row>
                    {messageType === 'voice_talk' && <Voice width={25} height={25} />}
                    {messageType === 'face_talk' && <Video width={25} height={25} />}
                    {messageType === 'file' && upload_urls?.[0] && (
                      <FileBubble fileUrl={upload_urls[0]} fileSize={upload_urls_size?.[0]} />
                    )}
                    {(messageType === 'chat' || messageType === 'voice_talk' || messageType === 'face_talk') && (
                      <BubbleText>{messageText}</BubbleText>
                    )}
                    {messageType === 'contact' && (
                      <Column align="center">
                        <BubbleText style={{ marginBottom: -4 }}>{contactName}</BubbleText>
                        <Row style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 5 }}>
                          <Voice width={10} height={10} />
                          <Text style={{ color: '#999999', fontSize: 12, marginLeft: 2 }}>contact</Text>
                        </Row>
                        <TouchableOpacity
                          onPress={() => Linking.openURL(`tel:${contactNumber}`)}
                          style={{
                            backgroundColor: COLOR.GRAY,
                            paddingHorizontal: 50,
                            paddingVertical: 5,
                            borderRadius: 5,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <BubbleText style={{ fontSize: 12 }}>call contact</BubbleText>
                        </TouchableOpacity>
                      </Column>
                    )}
                  </Row>
                  {(messageText.includes('http://') || messageText.includes('https://')) && (
                    <LinkPreview
                      text={messageText}
                      renderText={(text) => (
                        <View style={{ width: Dimensions.get('window').width * 0.45, height: 0 }}></View>
                      )}
                    />
                  )}
                </>
              )}
            </Column>
          )}
          {messageType === 'location' && (
            <LocationBubble
              onPressLocationBubble={onPressLocationBubble}
              formattedAddress={originalMessage.formattedAddress}
              latitude={originalMessage.latitude}
              longitude={originalMessage.longitude}
            />
          )}
        </Content>
        {themeContext.dark ? <MoveW /> : <Move />}
      </ContentContainer>
    </View>
  );
};

export default Message;
