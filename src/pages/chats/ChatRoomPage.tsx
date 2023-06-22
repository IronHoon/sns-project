import React from 'react';
import { ChatRoom } from 'views/chats';
import { SafeAreaView } from 'react-native';
import BackHeader from '../../components/molecules/BackHeader';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function ChatRoomPage() {
  return (
    // <GestureHandlerRootView style={{flex:1}}>
    <ChatRoom />
    // </GestureHandlerRootView>
  );
  // return (
  //   <SafeAreaView style={{ flex: 1 }}>
  //     <BackHeader />
  //     <Example />
  //   </SafeAreaView>
  // );
}

export default ChatRoomPage;
