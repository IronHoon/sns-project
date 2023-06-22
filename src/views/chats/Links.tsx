import React, { useMemo } from 'react';
import { Alert, ImageBackground, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';
import BackHeader from '../../components/molecules/BackHeader';
import { useRoute } from '@react-navigation/native';
import Room from '../../types/chats/rooms/Room';
import useFetch from '../../net/useFetch';
import SwrContainer from '../../components/containers/SwrContainer';
import Message from 'types/chats/rooms/messages/Message';
import DateUtil from 'utils/DateUtil';
import LogUtil from 'utils/LogUtil';
import { Column } from 'components/layouts/Column';
import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';

const Desc = styled.Text`
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 3px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

function Links() {
  const route = useRoute();
  // @ts-ignore
  const room: Room = route.params?.room;
  const { data, error } = useFetch(`/chats/rooms/${room._id}/media?type=link`);
  const links = useMemo(() => {
    if (!data) return [];
    return data.map((item) => item.links[0] && item.links[0]).flat();
  }, [data]);

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
    LogUtil.info('messageList', messageList);
    return messageList;
  })(data);

  return (
    <MainLayout>
      <BackHeader title="Links" />
      <ScrollView style={tw`flex-1`}>
        <SwrContainer data={data} error={error}>
          {data &&
            messageListWithSystemMessages.reverse().map((item, i) => (
              <View key={i}>
                <>
                  {item.type === 'system' ? (
                    <Column style={{ padding: 15, width: '100%' }}>
                      <Text style={{ color: 'gray' }}>{item?.content ?? ''}</Text>
                    </Column>
                  ) : (
                    <>
                      {item.links && item.links[0] && (
                        <>
                          <Pressable
                            style={tw`p-4`}
                            onPress={() => {
                              //@ts-ignore
                              Linking.canOpenURL(item.links[0].url)
                                //@ts-ignore
                                .then(() => Linking.openURL(item.links[0].url))
                                .catch(() => Alert.alert('Error', 'Cannot open URL'));
                            }}
                          >
                            <Row align="center">
                              <View
                                style={{ width: 40, height: 40, marginRight: 15, borderRadius: 8, overflow: 'hidden' }}
                              >
                                <ImageBackground
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: '#bcb3c5',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                  source={item.links[0].image ? { uri: item.links[0].image } : { uri: undefined }}
                                >
                                  <Text style={{ color: COLOR.WHITE, fontSize: 18, fontWeight: '500' }}>
                                    {item.links[0].image ? '' : `${item.links[0].description.substring(0, 1)}`}
                                  </Text>
                                </ImageBackground>
                              </View>
                              <Column style={{ flex: 1 }}>
                                <Desc numberOfLines={1}>{item.links[0].description}</Desc>
                                <Text style={{ fontSize: 12, color: '#999999' }}>{item.links[0].url}</Text>
                              </Column>
                            </Row>
                          </Pressable>
                        </>
                      )}
                    </>
                  )}
                </>
              </View>
            ))}
          {/*TODO: 목록이 비었을 때에 대한 처리 필요*/}
        </SwrContainer>
      </ScrollView>
    </MainLayout>
  );
}

export default Links;
