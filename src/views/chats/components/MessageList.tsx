import { Row } from 'components/layouts/Row';
import { t } from 'i18next';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, Vibration, View } from 'react-native';
import Message from 'types/chats/rooms/messages/Message';
import ChatSocketUtil from 'utils/chats/ChatSocketUtil';
import LogUtil from 'utils/LogUtil';
import { Divider } from 'views/more/components/Divider';
import ChatBubble from './ChatBubble';
import ChatListItem from './ChatListItem';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';
import Room from '../../../types/chats/rooms/Room';
import AuthUtil from '../../../utils/AuthUtil';

const MessageList = ({
  messageListWithSystemMessages,
  searchedMessageIndex,
  searchedMessageList,
  messageIndexById,
  unreadCountInfoByRoomId,
  room_id,
  count,
  setCount,
  roomState,
  isSystemAccount,
  dark,
  setParentMessageForReply,
  setIsForward,
  isForward,
  checkedChatList,
  setShowPin,
  setCheckedChatList,
  searchValue,
  isStipopShowing,
  showStipopBottomSheet,
  setChatRoomMode,
}) => {
  const messageListRef = useRef<any>(null);

  useEffect(() => {
    if (messageListRef?.current && searchedMessageIndex >= 0 && searchedMessageList?.[searchedMessageIndex]?._id) {
      const targetMessageId = searchedMessageList[searchedMessageIndex]._id;
      const targetMessageIndex = messageIndexById[targetMessageId];
      try {
        messageListRef.current.scrollToIndex({
          animated: true,
          index: targetMessageIndex,
        });
      } catch (passed) {}
    }
  }, [searchedMessageIndex]);

  const onEndReached = async () => {
    LogUtil.info('onScroll onEndReached');
    const prefix = 'MessageList';
    await ChatSocketUtil.instance.easy.getMessagesOfRoom(prefix, room_id, { resetPage: false });
  };

  const unreadCountByMessageId = useMemo(() => {
    return ((unreadCountInfoByRoomId, messageListWithSystemMessages) => {
      let readCountIndex = 0;
      const unreadCountInfo = unreadCountInfoByRoomId[room_id] ?? {};
      const readCountList = Object.keys(unreadCountInfo)
        .map((unreadCount) => Number(unreadCount))
        .reverse();
      // LogUtil.info('room_id,readCountList', { room_id, readCountList });
      const lastMessageIdList = Object.values<any>(unreadCountInfo)
        .map((messageIdPair) => messageIdPair[0])
        .reverse();
      return () => {
        const unreadCountByMessageId = {};
        for (const message of messageListWithSystemMessages) {
          const unreadCount: number | null = readCountList?.[readCountIndex];
          // LogUtil.info('message message._id,content, readCountIndex,unreadCoun, ', [message._id, message.content, readCountIndex, unreadCount]);
          unreadCountByMessageId[message._id] = unreadCount;
          if (lastMessageIdList?.[readCountIndex] === message._id) {
            readCountIndex++;
          }
        }
        // LogUtil.info('messageListWithSystemMessages', messageListWithSystemMessages.map((message) => { return message._id }));
        // LogUtil.info('unreadCountByMessageId', unreadCountByMessageId);
        return unreadCountByMessageId;
      };
    })(unreadCountInfoByRoomId, messageListWithSystemMessages)();
  }, [unreadCountInfoByRoomId, messageListWithSystemMessages, room_id]);
  const extractItemKey = (item): string => item._id;
  const renderItem = useCallback(
    ({ item: message, index }: { item: Message; index: number }) => {
      const unreadCount: number | null = unreadCountByMessageId?.[message._id];
      // LogUtil.info(`message content:${message.content},unreadCount:${unreadCount}`);
      const isMe = message?.user?.id === AuthUtil.getUserId();
      return message.type === 'system' ? (
        message._id.includes('system:date') ? (
          <Row key={message._id} justify="center" style={{ width: '100%', paddingVertical: 30 }}>
            <View style={{ backgroundColor: '#ededed', borderRadius: 11 }}>
              <Text
                style={{
                  color: 'gray',
                  paddingHorizontal: 15,
                  paddingVertical: 5,
                }}
              >
                {message?.content ?? ''}
              </Text>
            </View>
          </Row>
        ) : (
          <Row key={message._id} style={{ width: '100%', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
            <Divider style={{ marginLeft: 5, flex: 1, height: 1 }} />
            <View
              style={{
                width: Dimensions.get('window').width / 2,
                backgroundColor: '#ededed',
                padding: 5,
                paddingHorizontal: 10,
                borderRadius: 10.5,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#999999',
                  fontSize: 11,
                }}
              >
                {message?.i18n_content ? t(message.i18n_content.key, message.i18n_content.data) : message.content}
              </Text>
            </View>
            <Divider style={{ marginRight: 5, flex: 1, height: 1 }} />
          </Row>
        )
      ) : (
        <ChatBubble
          key={message._id}
          count={count}
          setCount={setCount}
          originalMessage={message}
          roomType={roomState.type}
          dark={dark}
          room_id={roomState._id}
          setParentMessageForReply={setParentMessageForReply}
          setForward={setIsForward}
          isForward={isForward}
          checkedChatList={checkedChatList}
          setShowPin={setShowPin}
          setCheckedChatList={setCheckedChatList}
          room={roomState}
          isSearched={Object.keys(messageIndexById).includes(message._id)}
          searchValue={searchValue}
          isSystemAccount={isSystemAccount}
          isStipopShowing={isStipopShowing}
          showStipopBottomSheet={showStipopBottomSheet}
          unreadCount={unreadCount}
          setChatRoomMode={setChatRoomMode}
        />
      );
    },
    [
      checkedChatList,
      count,
      isForward,
      isStipopShowing,
      isSystemAccount,
      messageIndexById,
      roomState,
      searchValue,
      showStipopBottomSheet,
      t,
      dark,
      unreadCountByMessageId,
    ],
  );

  return (
    <View style={{ flex: 1 }}>
      {messageListWithSystemMessages.length > 0 ? (
        <SwipeListView
          //@ts-ignore
          listViewRef={messageListRef}
          keyExtractor={extractItemKey}
          data={messageListWithSystemMessages}
          renderItem={renderItem}
          rightOpenValue={-30}
          previewRowKey={'0'}
          previewOpenValue={-40}
          previewOpenDelay={3000}
          renderHiddenItem={() => <></>}
          disableRightSwipe={true}
          inverted={true}
          directionalDistanceChangeThreshold={1}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          onRowOpen={(rowKey, rowMap, toValue) => {
            //@ts-ignore
            setParentMessageForReply(rowMap[rowKey].props.children[1].props.originalMessage);
            rowMap[rowKey].closeRow();
          }}
        />
      ) : (
        <View style={{ flex: 1 }} />
      )}
    </View>
  );
};

export default React.memo(MessageList);
