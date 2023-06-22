import { Modal, Pressable, SafeAreaView, View } from 'react-native';
import tw from 'twrnc';
import WebView from 'react-native-webview';
import PrevIcon from '../../../../assets/media/ic-prev-16.svg';
import ReloadIcon from '../../../../assets/media/ic-reload-22.svg';
import CloseIcon from '../../../../assets/media/ic-close-16.svg';
import React, { useState } from 'react';

const ChatWebView = ({ isVisible, setIsVisible, url }) => {
  const [webView, setWebView] = useState();

  return (
    <Modal visible={isVisible} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <WebView
          // @ts-ignore
          ref={(web) => setWebView(web)}
          cacheEnabled={true}
          style={tw`w-full h-full flex-1`}
          source={{ uri: url }}
        />
        <View style={tw`flex-row justify-between bg-white p-2`}>
          <Pressable
            style={tw`flex-1 items-center pt-1`}
            onTouchStart={() => {
              //@ts-ignore
              webView?.goBack();
            }}
          >
            <PrevIcon />
          </Pressable>
          <Pressable
            style={tw`flex-1 items-center pt-1`}
            onTouchStart={() => {
              //@ts-ignore
              webView?.goForward();
            }}
          >
            <PrevIcon style={{ transform: [{ rotate: '180deg' }] }} />
          </Pressable>
          <Pressable
            style={tw`flex-1 items-center`}
            onTouchStart={() => {
              //@ts-ignore
              webView?.reload();
            }}
          >
            <ReloadIcon />
          </Pressable>
          <Pressable
            style={tw`flex-1 items-center pt-1`}
            // @ts-ignore
            onTouchStart={() => setIsVisible(false)}
          >
            <CloseIcon />
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ChatWebView;
