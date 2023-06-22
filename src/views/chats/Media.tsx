import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import BackHeader from '../../components/molecules/BackHeader';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Room from '../../types/chats/rooms/Room';
import useFetch from '../../net/useFetch';
import SwrContainer from '../../components/containers/SwrContainer';
import FastImage from 'react-native-fast-image';
import MainLayout from 'components/layouts/MainLayout';
import DateUtil from 'utils/DateUtil';
import Message from 'types/chats/rooms/messages/Message';
import LogUtil from 'utils/LogUtil';
import { Column } from 'components/layouts/Column';
import ICPic from '/assets/ic_pics.svg';
import dateUtil from 'utils/DateUtil';
import Video from 'react-native-video';
import { useAtomValue } from 'jotai';
import userAtom from '../../stores/userAtom';
import { COLOR } from '../../constants/COLOR';
import styled from 'styled-components/native';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import { MainNavigationProp } from '../../navigations/MainNavigator';
import useSocket from '../../hooks/useSocket';

const VideoDuration = styled.Text`
  position: absolute;
  color: #fff;
  z-index: 1;
  bottom: 7px;
  right: 7px;
  font-size: 12px;
`;

function Media() {
  const route = useRoute();
  // @ts-ignore
  const room: Room = route.params?.room;
  const { data, error } = useFetch(`/chats/rooms/${room._id}/media?type=media`);

  const { width } = Dimensions.get('window');
  const navigation = useNavigation<MainNavigationProp>();
  const messageListWithSystemMessages = ((messageList: Message[]) => {
    if (!messageList) return [];

    const addSystemDate = (messageList: Message[]) => {
      const systemMessageId = 'system:date';
      messageList = messageList.filter((message) => !message._id.includes(systemMessageId));
      let newSystemMessageObj = {};
      for (const message of messageList) {
        const todayDateStr = DateUtil.getChatDate(message.createdAt);
        const newSystemMessage = {
          _id: `${systemMessageId}:${todayDateStr}`,
          type: 'system',
          content: todayDateStr,
          createdAt: new Date(DateUtil.date(message.createdAt).toDateString()),
        };
        newSystemMessageObj = {
          ...newSystemMessageObj,
          [newSystemMessage._id]: newSystemMessage,
        };
      }
      return [...messageList, ...Object.values<Message>(newSystemMessageObj)];
    };

    messageList = addSystemDate(messageList);
    messageList.sort((a, b) => DateUtil.subtract(a.createdAt, b.createdAt));

    return messageList;
  })(data);

  const date = useRef('');
  const index = useRef(0);
  let temp;

  const VideoTag = ({ item }) => {
    const [runtime, setRuntime] = useState();
    return (
      <>
        <Video
          source={{ uri: item.url[0] }}
          style={{ width: width * 0.33, height: width * 0.33 }}
          controls={true}
          paused={true}
          onLoad={(e) => {
            const videoD = Math.floor(e.duration);
            setRuntime(videoD);
          }}
        />
        <VideoDuration>{parseInt((runtime % 3600) / 60) + `:` + ((runtime + 1) % 60)}</VideoDuration>
      </>
    );
  };

  return (
    <MainLayout>
      <BackHeader title="Media" />
      <ScrollView style={tw`flex-1`}>
        <SwrContainer data={data} error={error}>
          <View style={tw`flex-row flex-wrap`}>
            {data &&
              messageListWithSystemMessages.map((item, i) => {
                if (i !== 0) {
                  temp = date.current;
                }
                date.current = dateUtil.getChatDate(item.createdAt);
                if (temp !== date.current) {
                  index.current = i;
                }
                if (item.type === 'video') {
                  LogUtil.info('video item', item);
                }

                return (
                  <View key={i} style={{ position: 'relative' }}>
                    <>
                      {temp !== date.current && (
                        <Column style={{ padding: 15, width: width, height: 50 }}>
                          <Text style={{ color: 'gray' }}>{date.current}</Text>
                        </Column>
                      )}
                    </>
                    <>
                      {item.url && (
                        <>
                          <View
                            style={{
                              width: width * 0.33,
                              height: width * 0.33,
                              margin: 0.6,
                              position: i === index.current + 1 || i === index.current + 2 ? 'absolute' : 'relative',
                              right: i === index.current + 1 ? width / 3 : 0,
                              top: i === index.current + 1 || i === index.current + 2 ? 50 : 0,
                            }}
                          >
                            {item.type === 'video' ? (
                              <VideoTag item={item} />
                            ) : (
                              <Pressable
                                onPress={() => {
                                  //@ts-ignore
                                  navigation.navigate('/chats/chat-room/media-detail', {
                                    selectedItem: item,
                                    room: room,
                                    userName: item.user.first_name + ' ' + item.user.last_name,
                                  });
                                }}
                              >
                                <FastImage
                                  source={{
                                    uri: item.url[0],
                                    priority: FastImage.priority.low,
                                  }}
                                  style={[tw`w-full h-full`, { maxHeight: 300 }]}
                                />
                              </Pressable>
                            )}

                            {item.url.length > 1 && item.type !== 'video' && (
                              <View
                                style={{
                                  position: 'absolute',
                                  right: 5,
                                  top: width / 3.6,
                                }}
                              >
                                <ICPic />
                              </View>
                            )}
                          </View>
                        </>
                      )}
                    </>
                    {/*)}*/}
                  </View>
                );
              })}
          </View>
        </SwrContainer>
      </ScrollView>
    </MainLayout>
  );
}

export default Media;
