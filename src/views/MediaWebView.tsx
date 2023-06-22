import tw from 'twrnc';
import { Image, Pressable, SafeAreaView, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import React, { useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import showMediaAtom from '../stores/showMediaAtom';
import PrevIcon from '../assets/media/ic-prev-16.svg';
import ReloadIcon from '../assets/media/ic-reload-22.svg';
import CloseIcon from '../assets/media/ic-close-16.svg';
import ShareIcon from '/assets/ic_share_small.svg';
import SHARE from 'react-native-share';

export default function MediaWebView() {
  const [show, setShow] = useAtom<boolean>(showMediaAtom);
  const webview = useRef<WebView>();
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!show) {
      webview.current?.injectJavaScript('location.href="https://laoedaily.com.la"');
    }
  }, [show]);
  return (
    <View style={[tw`w-full h-full bg-white`, { position: 'absolute', opacity: show ? 1 : 0, top: show ? 0 : -9999 }]}>
      <SafeAreaView style={tw`flex-1`}>
        <WebView
          // @ts-ignore
          ref={webview}
          cacheEnabled={true}
          style={tw`w-full h-full flex-1`}
          source={{ uri: 'https://laoedaily.com.la' }}
          onNavigationStateChange={(web) => {
            setUrl(web.url);
          }}
        />
        <View style={tw`flex-row justify-between bg-white p-2`}>
          <Pressable style={tw`flex-1 items-center pt-1`} onTouchStart={() => webview.current?.goBack()}>
            <PrevIcon />
          </Pressable>
          <Pressable style={tw`flex-1 items-center pt-1`} onTouchStart={() => webview.current?.goForward()}>
            <PrevIcon style={{ transform: [{ rotate: '180deg' }] }} />
          </Pressable>
          <Pressable
            style={tw`flex-1 items-center pt-1`}
            onTouchStart={() => {
              setTimeout(() => {
                SHARE.open({ type: 'url', url: url });
              }, 300);
            }}
          >
            <ShareIcon style={{ width: 10, height: 10 }} />
          </Pressable>
          <Pressable style={tw`flex-1 items-center`} onTouchStart={() => webview.current?.reload()}>
            <ReloadIcon />
          </Pressable>
          <Pressable
            style={tw`flex-1 items-center pt-1`}
            // @ts-ignore
            onTouchStart={() => setShow(false)}
          >
            <CloseIcon />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
