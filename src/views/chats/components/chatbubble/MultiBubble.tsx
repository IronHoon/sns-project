import React, { useEffect, useState } from 'react';
import Tail from '../../../../assets/tail.svg';
import { COLOR } from '../../../../constants/COLOR';
import { Dimensions, Pressable, View, Text, Image, Linking } from 'react-native';
import ChatSocketUtil from '../../../../utils/chats/ChatSocketUtil';
import { Column } from '../../../../components/layouts/Column';
import ChatBubbleReply from '../ChatBubbleReply';
import RecordBubble from '../RecordBubble';
import { Row } from '../../../../components/layouts/Row';
import Voice from '../../../../assets/chats/call/ic_call.svg';
import Video from '../../../../assets/chats/call/ic_video.svg';
import TextBubble from './TextBubble';
import ContactBubble from './ContactBubble';
import LocationBubble from './LocationBubble';
import { LinkPreview } from '@flyerhq/react-native-link-preview';
import LoginBubble from './LoginBubble';
import LoginNotiBubble from './LoginNotiBubble';
import FileBubble from './FileBubble';
import Padding from '../../../../components/containers/Padding';
import styled from 'styled-components';
import { WIDTH } from '../../../../constants/WIDTH';
import Space from '../../../../components/utils/Space';
import LogUtil from '../../../../utils/LogUtil';

const LinkContainer = styled(View)<{ previewData: any }>`
  width: ${(props) => (props.previewData ? Dimensions.get('window').width * 0.6 : '0')};
  height: ${(props) => (props.previewData ? '190px' : '0')};
  border-radius: 10px;
  background-color: white;
`;

const LinkPreviewContainer = styled(View)<{ previewData: any }>`
  width: ${(props) => (props.previewData ? Dimensions.get('window').width * 0.6 : '0')};
  height: ${(props) => (props.previewData ? '190px' : '0')};
  border-radius: 10px;
  background-color: white;
  margin: ${(props) => (props.previewData ? '7px 7px 0 7px;' : '0')};
`;

const Thumbnail = styled(Image)<{ source?: { uri?: string } }>`
  width: ${Dimensions.get('window').width * 0.6}px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  height: ${(props) => (props.source.uri ? '120px' : '0')};
  object-fit: contain;
`;

const Title = styled(Text)`
  width: ${Dimensions.get('window').width * 0.6}px;
  color: ${COLOR.BLACK};
  font-size: 14px;
  font-weight: 500;
  margin: 3px 0 1px 0;
  padding: 3px 10px;
`;

const Desc = styled(Text)`
  width: ${Dimensions.get('window').width * 0.6}px;
  font-size: 12px;
  font-weight: 500;
  padding: 0 10px;
  color: ${COLOR.TEXT_GRAY};
`;

const MultiBubble = ({
  isMe,
  dark,
  roomType,
  showMenu,
  messageType,
  room,
  showCallView,
  originalMessage,
  upload_urls,
  upload_urls_size,
  messageText,
  myUser,
  searchValue,
  t,
  isSearched,
  contactName,
  contactNumber,
  onPressLocationBubble,
}) => {
  const [linkPreview, setLinkPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    setLinkPreview(originalMessage.has_link);
    setPreviewData(originalMessage.links);
  }, [originalMessage]);

  return (
    <Column>
      {!isMe && (
        <Tail
          fill={dark ? '#262525' : COLOR.WHITE}
          style={[
            {
              position: 'absolute',
              left: 3,
              top: -0.85,
              transform: [{ rotate: '90deg' }],
            },
          ]}
        />
      )}
      <Pressable
        style={{ flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}
        onLongPress={() => {
          showMenu();
        }}
        onPress={
          messageType === 'voice_talk' || messageType === 'face_talk'
            ? () => {
                if (ChatSocketUtil.instance.isOnAlreadyCalling()) {
                  return;
                }

                room &&
                  showCallView({
                    open: true,
                    viewType: 'full',
                    params: {
                      room: room,
                      callType: messageType === 'voice_talk' ? 'audio' : 'video',
                      action: 'create',
                    },
                  });
              }
            : undefined
        }
      >
        <View
          // textStyle={{
          //   right: {
          //     color: COLOR.WHITE,
          //     fontSize: myUser?.setting.ct_text_size,
          //   },
          //   left: {
          //     color: dark ? COLOR.WHITE : COLOR.BLACK,
          //     fontSize: myUser?.setting.ct_text_size,
          //   },
          // }}
          style={{
            ...(isMe
              ? {
                  maxWidth: Dimensions.get('window').width * 0.65,
                  backgroundColor: COLOR.PRIMARY,
                  borderRadius: 11,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  marginVertical: 4,
                  marginLeft: 8,
                  marginRight: 6,
                }
              : {
                  maxWidth: Dimensions.get('window').width * 0.65,
                  backgroundColor: dark ? '#262525' : COLOR.WHITE,
                  borderRadius: 11,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  marginVertical: 4,
                  marginRight: 8,
                  marginLeft: 7,
                }),
          }}
        >
          {/* 말풍선 style */}
          <Column style={{ paddingHorizontal: 5, paddingVertical: 2 }}>
            {originalMessage?.reply_parent_message && (
              <>
                <ChatBubbleReply
                  style={[
                    { padding: 5 },
                    isMe
                      ? {
                          color: COLOR.WHITE,
                        }
                      : {
                          color: dark ? COLOR.WHITE : COLOR.BLACK,
                        },
                  ]}
                  reply_message={originalMessage.reply_parent_message}
                />
                <View
                  style={{
                    width: '100%',
                    height: 0.5,
                    backgroundColor: COLOR.GRAY,
                    marginTop: 10,
                    marginBottom: 10,
                  }}
                />
              </>
            )}
            {messageType === 'record' ? (
              <RecordBubble upload_urls={upload_urls} isMe={isMe} dark={dark} />
            ) : (
              <Row style={{ alignItems: 'center' }}>
                {messageType === 'voice_talk' && <Voice width={25} height={25} style={{ marginRight: 5 }} />}
                {messageType === 'face_talk' && <Video width={25} height={25} style={{ marginRight: 5 }} />}
                {messageType === 'file' && upload_urls?.[0] && (
                  <FileBubble
                    showMenu={showMenu}
                    fileUrl={upload_urls[0]}
                    fileSize={upload_urls_size?.[0]}
                    messageText={messageText}
                    isMe={isMe}
                  />
                )}
                {(messageType === 'chat' || messageType === 'voice_talk' || messageType === 'face_talk') && (
                  <TextBubble
                    isMe={isMe}
                    myUser={myUser}
                    dark={dark}
                    isSearched={isSearched}
                    searchValue={searchValue}
                    messageText={messageText}
                  />
                )}
                {messageType === 'login' && (
                  <LoginBubble
                    isMe={isMe}
                    originalMessage={originalMessage}
                    t={t}
                    dark={dark}
                    messageText={messageText}
                  />
                )}
                {messageType === 'loginNoti' && (
                  <LoginNotiBubble isMe={isMe} messageText={messageText} t={t} dark={dark} />
                )}
                {messageType === 'contact' && (
                  <ContactBubble isMe={isMe} dark={dark} contactName={contactName} contactNumber={contactNumber} />
                )}
                {messageType === 'location' && (
                  <LocationBubble
                    onPressLocationBubble={onPressLocationBubble}
                    formattedAddress={originalMessage.formattedAddress}
                    latitude={originalMessage.latitude}
                    longitude={originalMessage.longitude}
                  />
                )}
              </Row>
            )}
          </Column>
        </View>
        {linkPreview && (
          <>
            {previewData.map((item) => {
              return (
                <Pressable
                  style={{
                    width: Dimensions.get('window').width * 0.6,
                    height: 190,
                    marginTop: 7,
                    marginRight: 7,
                    marginBottom: 0,
                    marginLeft: 7,
                  }}
                  onPress={() => {
                    //@ts-ignore
                    Linking.openURL(item.url);
                  }}
                >
                  <LinkContainer previewData={true}>
                    <View
                      style={{
                        width: Dimensions.get('window').width * 0.6,
                        height: 121,
                        borderBottomWidth: 1,
                        backgroundColor: '#eeeeee',
                        borderColor: '#eeeeee',
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                      }}
                    >
                      {
                        //@ts-ignore
                        <Thumbnail
                          source={{
                            //@ts-ignore
                            uri: item?.image,
                          }}
                        />
                      }
                    </View>
                    <View>
                      <Title numberOfLines={1}>
                        {
                          //@ts-ignore
                          item?.title
                        }
                      </Title>
                      <Desc ellipsizeMode="tail" numberOfLines={1}>
                        {
                          //@ts-ignore
                          item?.description ?? 'Click here to go to the link'
                        }
                      </Desc>
                      <Space height={5} />
                      <Desc ellipsizeMode="tail" numberOfLines={1}>
                        {
                          //@ts-ignore
                          item?.url
                        }
                      </Desc>
                    </View>
                  </LinkContainer>
                </Pressable>
              );
            })}

            <Padding padding={1} />
          </>
        )}
      </Pressable>
      {isMe && (
        <Tail
          fill={COLOR.PRIMARY}
          style={[
            {
              position: 'absolute',
              right: 3,
              top: -0.85,
              transform: [{ rotate: '90deg' }],
            },
          ]}
        />
      )}
    </Column>
  );
};

export default React.memo(MultiBubble);
