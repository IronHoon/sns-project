import { useFocusEffect, useNavigation } from '@react-navigation/native';
import IconButton from 'components/atoms/MIconButton';
import Padding from 'components/containers/Padding';
import BackHeader from 'components/molecules/BackHeader';
import PrevHeader from 'components/molecules/PrevHeader';
import { useSetAtom } from 'jotai';
import { MainNavigationProp } from 'navigations/MainNavigator';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import showCallViewAtom from 'stores/showCallViewAtom';
import Room from 'types/chats/rooms/Room';
import ChatSocketUtil from 'utils/chats/ChatSocketUtil';
import { ChatRoomModeType, IconImage } from '../ChatRoom';
import ChatRoomTitle from './ChatRoomTitle';
import IC_CLOSE_ROUND from 'assets/chats/chatroom/ic_close_round.svg';
import styled, { css } from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import DateOrString from 'types/_common/DateOrString';
import { Row } from 'components/layouts/Row';
import Space from 'components/utils/Space';
import ChatTextInput from './ChatTextInput';
import ArrowUpW from 'assets/chats/chatroom/ic-up-w.svg';
import ArrowDownW from 'assets/chats/chatroom/ic-down-w.svg';
import IC_UP from 'assets/chats/chatroom/ic_up.svg';
import IC_DOWN from 'assets/chats/chatroom/ic_down.svg';
import SHARE from 'react-native-share';
import LogUtil from '../../../utils/LogUtil';
import axios from 'axios';
import { Buffer } from 'buffer';

export interface Word {
  id: number;
  idx: string;
  idiom: string;
  category: string;
  created_at: DateOrString;
  updated_at: DateOrString;
}

export type SuggestionStateType = 'not_searched' | 'searchable' | 'searched';
type ChatRoomFooterProp = {
  roomState: Room;
  input;
  setChatRoomMode;
  chatRoomMode: ChatRoomModeType;
  isForward;
  onSend;
  setIsForward;
  parentMessage;
  setParentMessage;
  isBlockUser;
  checkedChatList;
  count;
  searchValue;
  selectedIndex;
  setSelectedIndex;
  searchedMessageList;
  setCheckedChatList;
  setCount;
  isSystemAccount;
  dark: boolean;
  isStipopShowing;
  showStipopBottomSheet;
};

function ChatRoomFooter({
  roomState,
  input,
  setChatRoomMode,
  chatRoomMode,
  isForward,
  onSend,
  setIsForward,
  parentMessage,
  setParentMessage,
  isBlockUser,
  checkedChatList,
  count,
  searchValue,
  selectedIndex,
  setSelectedIndex,
  searchedMessageList,
  setCheckedChatList,
  setCount,
  isSystemAccount,

  dark,
  isStipopShowing,
  showStipopBottomSheet,
}: ChatRoomFooterProp) {
  const [words, setWords] = useState<Word[]>([]);
  const [originLastWord, setOriginLastWord] = useState<string>('');
  const [chatText, _setChatText] = useState('');
  const [suggestionState, setSuggestionState] = useState<SuggestionStateType>('searchable');
  const setChatText = (value) => {
    _setChatText(value);
    setSuggestionState('searchable');
  };

  const navigation = useNavigation<MainNavigationProp>();
  // useEffect(() => {
  //   (async () => {
  //     const strList = chatText.split(' ');
  //     const lastWord = strList[strList.length - 1];
  //     if (lastWord && originLastWord !== lastWord) {
  //       setOriginLastWord(lastWord);
  //       const res = await get<any>(`/auth/idiom?word=${lastWord}`);
  //       if ((res?.data ?? []).length > 0) {
  //         setSuggestionState('searched');
  //         setWords(res.data);
  //       } else {
  //         setSuggestionState('not_searched');
  //         setWords([]);
  //       }
  //     } else {
  //       setSuggestionState('not_searched');
  //       setWords([]);
  //     }
  //   })();
  // }, [chatText]);
  LogUtil.info('checkedChatList footer', checkedChatList);

  const [chatList, setChatList] = useState([]);
  const [otherList, setOtherList] = useState([]);
  const [imageList, setImageList] = useState([]);
  const [sendList, setSendList] = useState([]);

  const nextSearchWord = (nextNumber: number) => {
    const listLength = searchedMessageList.length;
    setSelectedIndex((prevScrollIdIndex) => {
      let scrollIdIndex = prevScrollIdIndex + nextNumber;
      if (scrollIdIndex >= listLength) {
        scrollIdIndex = listLength - 1;
      }
      if (scrollIdIndex < 0) {
        scrollIdIndex = 0;
      }
      return scrollIdIndex;
    });
  };

  useEffect(() => {
    let chatList = [];
    let otherList = [];
    let imageList = [];
    checkedChatList.map(async (item) => {
      if (item.type === 'chat') {
        // //@ts-ignore
        // await setChatList(chatList.push(item));
        LogUtil.info('chatitem', item.content);
        //@ts-ignore
        chatList.push(item.content);
      } else if (item.type === 'image') {
        item.url.map(async (item) => {
          //@ts-ignore
          imageList.push(item);
        });
      } else {
        item.url.map(async (item) => {
          LogUtil.info('otherItems', item);
          //@ts-ignore
          // await setOtherList(otherList.push(item))
          //@ts-ignore
          otherList.push(item);
        });
      }
    });
    setChatList(chatList);
    setOtherList(otherList);
    setImageList(imageList);
  }, [checkedChatList]);

  const url = 'https://awesome.contents.com/';
  const title = 'Awesome Contents';
  const message = 'Please check this out.';
  const icon = 'data:<data_type>/<file_extension>;base64,<base64_data>';
  const options = Platform.select({
    ios: {
      failOnCancel: false,
      activityItemSources: [
        {
          placeholderItem: { type: 'text', content: message },
          item: { default: { type: 'url', content: 'https://www.google.com' } },
          linkMetadata: {
            title: 'KokKok Share',
            url: 'https://www.google.com',
            image: 'https://www.google.com',
          },
        },
      ],
    },
    default: {
      failOnCancel: false,
      message:
        chatList.length > 0
          ? //@ts-ignore
            chatList.reduce((acc, cur) => {
              return acc + '\n' + cur;
            })
          : '',
      url: otherList[0],
      type: 'url',
      showAppsToView: true,
    },
  });

  // const options = {
  //   //@ts-ignore
  //   message:
  //     chatList.length > 0
  //       ? //@ts-ignore
  //         chatList.reduce((acc, cur) => {
  //           return acc + '\n' + cur;
  //         })
  //       : '',
  //   urls: otherList,
  //   type: 'url',
  //   showAppsToView: true,
  // };

  if (chatRoomMode === 'searchMode') {
    return (
      <Footer
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          shadowColor: COLOR.BLACK,
          shadowOpacity: 0.1,
          shadowOffset: {
            width: 0,
            height: -15,
          },
          shadowRadius: 10,
        }}
      >
        {searchValue !== '' && (
          <SearchIndex>
            {selectedIndex + 1} of {searchedMessageList.length}
          </SearchIndex>
        )}
        <View style={{ flex: 1 }} />
        <View onTouchStart={() => nextSearchWord(+1)}>{dark ? <ArrowUpW /> : <IC_UP />}</View>
        <Space width={15} />
        <View onTouchStart={() => nextSearchWord(-1)}>{dark ? <ArrowDownW /> : <IC_DOWN />}</View>
      </Footer>
    );
  }

  if (!isForward) {
    return (
      <ChatTextInput
        input={input}
        chatRoomMode={chatRoomMode}
        setChatRoomMode={setChatRoomMode}
        onSend={onSend}
        parentMessage={parentMessage}
        setParentMessage={setParentMessage}
        isBlockUser={isBlockUser && roomState.joined_users.length === 2}
        isSystemAccount={isSystemAccount}
        setChatText={setChatText}
        chatText={chatText}
        suggestionState={suggestionState}
        setSuggestionState={setSuggestionState}
        words={words}
        setWords={setWords}
        isStipopShowing={isStipopShowing}
        showStipopBottomSheet={showStipopBottomSheet}
      />
    );
  } else {
    return (
      <Footer
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          shadowColor: COLOR.BLACK,
          shadowOpacity: 0.1,
          shadowOffset: {
            width: 0,
            height: -15,
          },
          shadowRadius: 10,
        }}
      >
        <Pressable
          onTouchStart={() => {
            setIsForward(false);
            navigation.navigate('/chats/chat-room/share-chat', {
              chatRoomType: 'chat',
              chatList: checkedChatList,
              room: roomState,
            });
          }}
        >
          <IconImage themeColor={true} source={require('assets/btn-share-24.png')} />
        </Pressable>
        <Row>
          <Text style={{ color: COLOR.DARK_GRAY }}>Select </Text>
          <Text style={{ color: count > 0 ? COLOR.PRIMARY : COLOR.DARK_GRAY }}>{count}</Text>
        </Row>
        <Pressable
          onTouchStart={async () => {
            try {
              const baseList = [];
              imageList.map(async (item) => {
                try {
                  LogUtil.info('itemname', item);

                  const res = await axios.get(item, {
                    responseType: 'arraybuffer' /* or responseType: 'arraybuffer'  */,
                  });
                  const base64 = await Buffer.from(res.data, 'binary').toString('base64'); // 여기에 await 가 필요했는지 아닌지 모르겠네요
                  // LogUtil.info('newbase64', base64);
                  //@ts-ignore
                  baseList.push(`data:image/png;base64,${base64}`);
                } catch (error) {
                  //@ts-ignore
                  console.log('errorResponse', error.response);
                }
              });

              setTimeout(() => {
                SHARE.open({
                  type: 'urls',
                  urls: baseList.concat(otherList),
                  message:
                    chatList.length > 0
                      ? //@ts-ignore
                        chatList.reduce((acc, cur) => {
                          return acc + '\n' + cur;
                        })
                      : '',
                })
                  .then(async () => {
                    await setCheckedChatList([]);
                    await setIsForward(false);
                    await setCount(0);
                    await setOtherList([]);
                    await setChatList([]);
                  })
                  .catch((e) => {
                    console.log(e);
                  });
              }, 300);
            } catch (err) {
              console.log(err);
            }
          }}
        >
          <IconImage themeColor={true} source={require('assets/ic-share.png')} />
        </Pressable>
      </Footer>
    );
  }
}

export default React.memo(ChatRoomFooter);

const SearchIndex = styled.Text`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const Footer = styled.View`
  height: 55px;
  justify-content: center;
  align-items: flex-end;
  padding-left: 25px;
  padding-right: 25px;
  background-color: ${({ theme }) => (theme.dark ? '#464646' : '#ffffff')};
`;
