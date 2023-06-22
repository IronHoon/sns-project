import { NavigationProp, useNavigation } from '@react-navigation/native';
import MySetting from 'MySetting';
import { RootNatigation } from 'navigations/RootNavigation';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { isOfType } from 'typesafe-actions';
import LogUtil from 'utils/LogUtil';
import ChatSocketUtil from './ChatSocketUtil';
import FirebaseMessageUtil from './FirebaseMessageUtil';

export const useEffectDeepLink = () => {
  useEffect(() => {
    Linking.getInitialURL() // 최초 실행 시에 Universal link 또는 URL scheme요청이 있었을 때 여기서 찾을 수 있음
      .then(async (url) => {
        if (DeepLinkUtil.useInitialUrl) return;
        if (url) {
          DeepLinkUtil.useInitialUrl = true;
          LogUtil.info('useEffectDeepLink getInitialURL', [url]);

          setTimeout(() => {
            DeepLinkUtil.goNextPage(url);
          }, 2000);
        }
      });

    var listener = Linking.addEventListener('url', ({ url }) => {
      // 앱이 실행되어있는 상태에서 요청이 왔을 때 처리하는 이벤트 등록
      LogUtil.info('useEffectDeepLink onLink', [url]);
      DeepLinkUtil.goNextPage(url);
    });

    return () => {
      listener.remove();
    };
  }, []);
};

export class DeepLinkUtil {
  static useInitialUrl: boolean = false;
  static goNextPage(url: string) {
    if (url?.includes('posts/')) {
      const postId = url.split('posts/').reverse()[0];
      this.goPostPage(postId);
    }
  }
  static goPostPage(postId: string) {
    RootNatigation.navigate(`/kokkokme/:id`, { id: postId });
  }
}
