import React, { useEffect, useState } from 'react';
import { Column } from '../../../../components/layouts/Column';
import { Linking, Pressable, SafeAreaView, Text, View } from 'react-native';
import { COLOR } from '../../../../constants/COLOR';
import Highlighter from 'react-native-highlight-words';
import LogUtil from '../../../../utils/LogUtil';
import { Hyperlink } from 'react-native-hyperlink';
import ChatWebView from './ChatWebView';
import { LinkPreview } from '@flyerhq/react-native-link-preview';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';

const TextBubble = ({ isMe, myUser, dark, isSearched, searchValue, messageText }) => {
  const [isUrl, setIsUrl] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isShowAll, setIsShowAll] = useState(false);
  const navigation = useNavigation<MainNavigationProp>();
  const shareLink = 'https://share.kokkokchat.link/posts/';
  return (
    <Column>
      <Hyperlink
        linkStyle={{ color: COLOR.BLUE }}
        onPress={(url) => {
          if (url.startsWith('http://')) {
            Linking.openURL(url);
          } else {
            if (url.startsWith(shareLink)) {
              const target_id = url.replace(shareLink, '');
              navigation.navigate('/kokkokme/:id', { id: target_id });
            } else {
              setIsVisible(true);
              setIsUrl(url);
            }
          }
        }}
      >
        <Text
          style={
            isMe
              ? {
                  color: COLOR.WHITE,
                  fontSize: myUser?.setting.ct_text_size,
                }
              : dark
              ? {
                  color: COLOR.WHITE,
                  fontSize: myUser?.setting.ct_text_size,
                }
              : {
                  color: COLOR.BLACK,
                  fontSize: myUser?.setting.ct_text_size,
                }
          }
        >
          {isSearched ? (
            <Highlighter
              autoEscape={true}
              highlightStyle={{
                backgroundColor: 'black',
                color: '#fff',
              }}
              searchWords={[searchValue]}
              textToHighlight={messageText}
            />
          ) : messageText.length > 200 && !isShowAll ? (
            messageText.substring(0, 197) + '...'
          ) : (
            messageText
          )}
        </Text>
      </Hyperlink>

      <ChatWebView url={isUrl} isVisible={isVisible} setIsVisible={setIsVisible}></ChatWebView>
      {messageText.length > 200 && !isShowAll && (
        <Pressable
          onPress={() => {
            setIsShowAll(true);
          }}
          style={{ marginTop: 5, paddingTop: 5, width: '100%', alignItems: 'center' }}
        >
          <Text
            style={
              isMe
                ? {
                    color: COLOR.WHITE,
                    fontSize: myUser?.setting.ct_text_size,
                  }
                : dark
                ? {
                    color: COLOR.WHITE,
                    fontSize: myUser?.setting.ct_text_size,
                  }
                : {
                    color: COLOR.TEXT_GRAY,
                    fontSize: myUser?.setting.ct_text_size,
                  }
            }
          >
            {' '}
            Show All{' '}
          </Text>
        </Pressable>
      )}
    </Column>
  );
};

export default React.memo(TextBubble);
