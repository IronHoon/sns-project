import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import BackHeader from '../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import { SearchBar } from 'components/molecules/search-bar';
import styled, { ThemeContext } from 'styled-components/native';
import {
  Alert,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { Center } from 'components/layouts/Center';
import Space from 'components/utils/Space';
import { COLOR } from 'constants/COLOR';
import { Column } from 'components/layouts/Column';
import { Row } from 'components/layouts/Row';
import { Checkbox } from 'components/atoms/input/Checkbox';
import Close from 'assets/images/icon/ic-close.svg';
import User from 'types/auth/User';
import { useAtom, useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import { post } from 'net/rest/api';
import Room, { CallType, RoomTypeOfClient, RoomTypeOfServer } from 'types/chats/rooms/Room';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import LogUtil from 'utils/LogUtil';
import useFetch, { useFetchWithType } from 'net/useFetch';
import SwrContainer from 'components/containers/SwrContainer';
import Contact from 'types/contacts/Contact';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import Nullable from 'types/_common/Nullable';
import { t } from 'i18next';
import useSocket from '../../hooks/useSocket';
import ChatDataUtil from '../../utils/chats/ChatDataUtil';
import { TabMenu } from '../../components/molecules/tab-menu';
import { SwipeListView } from 'react-native-swipe-list-view';
import ChatListItem from './components/ChatListItem';
import chatStatusAtom from '../../stores/chatStatusAtom';
import Toast, { BaseToast } from 'react-native-toast-message';
import ShareAtom from '../../stores/shareAtom';
import friendListAtom from '../../stores/friendListAtom';
import Chat from '../more/settings/theme/Chat';
import { ToastConfig as GlobalToastConfig } from 'config/ToastConfig';

const Container = styled.View`
  flex: 1;
`;
const Count = styled.Text`
  color: ${COLOR.PRIMARY};
  font-weight: bold;
`;
const SelectButtonLabel = styled.Text`
  color: #999999;
  margin-left: 5px;
`;
const SearchBarContainer = styled.View`
  padding-top: 15px;
  padding-left: 15px;
  padding-right: 15px;
`;
const CaptionContainer = styled.View`
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
  border-bottom-style: solid;
  padding-left: 15px;
  margin-top: -5px;
  padding-bottom: 15px;
`;
const Caption = styled.Text`
  color: #bbbbbb;
  font-size: 13px;
  font-weight: 500;
`;
const ProfileImageBox = styled.View`
  width: 46px;
  height: 46px;
  border-radius: 70px;
  overflow: hidden;
  margin-left: 16px;
  margin-right: 16px;
`;
const SelectedProfileImageBox = styled.View`
  width: 46px;
  height: 46px;
  border-radius: 70px;
  overflow: hidden;
  margin-left: 16px;
`;

const ChatContainer = styled.View`
  flex: 1;
  flex-direction: row;
  background-color: ${({ theme }) => (theme.dark ? '#30302E' : COLOR.LIGHT_GRAY)};
  padding: 10px;
  border-radius: 10px;
  align-items: center;
`;
const SelectedProfileText = styled.Text`
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
  font-weight: 500;
`;
const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`;
const NameText = styled.Text`
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 5px;
`;
const IDText = styled.Text`
  color: #999999;
  font-size: 13px;
`;
const Icon = styled.Image`
  width: 52px;
  height: 52px;
`;
const Text = styled.Text`
  font-size: 18px;
  font-weight: 500;
  padding-top: 15px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Description = styled.Text`
  text-align: center;
  padding-top: 10px;
  padding-bottom: 5px;
  line-height: 18px;
  color: #999999;
`;
const FriendsList = styled.ScrollView`
  flex: 1;
`;
const DescText = styled.Text`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const MyProfile = styled.View`
  height: 90px;
`;
const CloseIcon = styled(Close)`
  /* position: absolute;
  top: -50px;
  right: -5px; */
  cursor: pointer;
  height: 100%;
  width: 100%;
`;

const ChatInput = styled.TextInput`
  flex: 1;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const CallingUserName = styled.Text`
  font-size: 13px;
  color: #262525;
`;
const Footer = styled.View`
  height: 55px;
  justify-content: center;
  align-items: flex-end;
  background-color: ${({ theme }) => (theme.dark ? '#585858' : '#ffffff')};
  padding-left: 20px;
  padding-right: 20px;
`;
const IconImage = styled.Image`
  width: 16px;
  height: 16px;
  margin: auto 0;
`;

const MENU = [
  {
    value: 'Friends',
    label: 'Friends',
  },
  {
    value: 'Chats',
    label: 'Chats',
  },
];

const SelectButton = ({ count, onPress }) => {
  return (
    <TouchableOpacity style={{ flexDirection: 'row', marginRight: 5 }} onPress={() => onPress()}>
      <Count>{count}</Count>
      <SelectButtonLabel>{t('chatting.Select')}</SelectButtonLabel>
    </TouchableOpacity>
  );
};

type FriendProfileProp = {
  friend: User;
  count: number;
  setCount: Function;
  selectedFriendList: User[];
  setSelectedFriendList: Function;
  isJoined?: boolean;
};
const FriendProfile = ({
  isJoined,
  friend,
  count,
  setCount,
  selectedFriendList,
  setSelectedFriendList,
}: FriendProfileProp) => {
  const themeContext = useContext(ThemeContext);
  const style = {
    backgroundColor: 'black',
  };
  const myUser: User | null = useAtomValue(userAtom);
  const isMe = friend.id === myUser?.id;
  const [profileImage, setProfileImage] = useState();
  const friendList = useAtomValue(friendListAtom);

  useEffect(() => {
    const isFriend = friendList?.filter((item) => item === friend?.id).length === 1;
    if (!isMe) {
      if (friend?.sc_profile_photo === 'friends' && isFriend) {
        if (friend?.profile_image === null || friend?.profile_image === '') {
          setProfileImage(require('assets/img-profile.png'));
        } else if (friend?.profile_image) {
          //@ts-ignore
          setProfileImage({ uri: friend?.profile_image });
        }
      } else if (friend?.sc_profile_photo === 'public') {
        if (friend?.profile_image === null || friend?.profile_image === '') {
          setProfileImage(require('assets/img-profile.png'));
        } else if (friend?.profile_image) {
          //@ts-ignore
          setProfileImage({ uri: friend?.profile_image });
        }
      } else {
        setProfileImage(require('assets/img-profile.png'));
      }
    } else {
      if (friend?.profile_image) {
        //@ts-ignore
        setProfileImage({ uri: friend?.profile_image });
      } else {
        setProfileImage(require('assets/img-profile.png'));
      }
    }
  }, [friend.sc_profile_photo]);

  return (
    <Row
      style={[
        { alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20 },
        selectedFriendList.includes(friend) &&
          (themeContext.dark ? { backgroundColor: '#88808f' } : { backgroundColor: '#fcf2e8' }),
      ]}
    >
      <Checkbox
        round
        checked={selectedFriendList.includes(friend)}
        handleChecked={() => {
          if (!selectedFriendList.includes(friend)) {
            if (count > 9) {
              Toast.show({
                text1: "You can't forward the message\nmore than 10 friends at once.",
              });
            } else {
              setCount(count + 1);
              setSelectedFriendList([...selectedFriendList, friend]);
            }
          } else {
            setCount(count - 1);
            selectedFriendList.splice(selectedFriendList.indexOf(friend), 1);
            setSelectedFriendList(selectedFriendList);
          }
        }}
      />
      <ImageBackground
        style={{ width: 46, height: 46, borderRadius: 70, overflow: 'hidden', marginLeft: 16, marginRight: 16 }}
        //@ts-ignore
        source={profileImage}
      >
        {isJoined && <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', flex: 1 }} />}
      </ImageBackground>
      <Column style={{ flex: 1 }}>
        <NameText style={{ color: isJoined ? 'rgba(0,0,0,0.3)' : COLOR.BLACK }}>
          {friend.first_name}
          {friend.last_name !== '' && ` ${friend.last_name}`}
        </NameText>
        <IDText>@{friend.uid}</IDText>
      </Column>
    </Row>
  );
};

function ShareChat() {
  const { chatStatus, chatSocketUtil } = useSocket();
  const onRoomsData = chatStatus.rooms;
  const unArchivedRoomList: Room[] = onRoomsData?.unArchivedRooms ?? [];
  const [checkedRoomList, setCheckedRoomList] = useState<Room[]>([]);
  const [isDeselect, setIsDeselect] = useState<boolean>(false);
  const extractItemKey = (item: Room): string => item._id;
  const [share, setShare] = useAtom(ShareAtom);
  const {
    data: contactList,
    error: contactError,
    mutate: contactMutate,
  } = useFetchWithType<Contact[]>('/auth/contacts', true);
  const { params } = useRoute();
  const navigation = useNavigation<MainNavigationProp>();
  const [searchText, setSearchText] = useState('');
  const searchedContactList = (contactList ?? []).filter(
    (contact) =>
      contact.friend.uid.toLowerCase().includes(searchText.toLowerCase()) ||
      contact.friend.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
      contact.friend.last_name.toLowerCase().includes(searchText.toLowerCase()) ||
      contact.friend.contact.includes(searchText),
  );
  const searchedRoomList = (unArchivedRoomList ?? []).filter(
    (room) =>
      room.joined_users.filter((user) => user.first_name.toLowerCase().includes(searchText.toLowerCase())).length > 0 ||
      room.joined_users.filter((user) => user.last_name.toLowerCase().includes(searchText.toLowerCase())).length > 0 ||
      room.joined_users.filter((user) => user.uid.toLowerCase().includes(searchText.toLowerCase())).length > 0 ||
      room.joined_users.filter((user) => user.contact.toLowerCase().includes(searchText.toLowerCase())).length > 0 ||
      room.joined_users.filter((user) => user.email?.toLowerCase().includes(searchText.toLowerCase())).length > 0,
  );
  // console.log(unArchivedRoomList.filter(room=>room.name.toLowerCase().includes('ano')))
  const [count, setCount] = useState<number>(0);
  const [selectedFriendList, setSelectedFriendList] = useState<User[]>([]);
  const user = useAtomValue(userAtom);
  // @ts-ignore
  const roomTypeOfClient: RoomTypeOfClient = params.chatRoomType;
  // @ts-ignore
  const contact = params.contact;
  const input = useRef();
  const [value, setValue] = useState<string>('Friends');
  const [chatText, setChatText] = useState<string>();
  const {
    // @ts-ignore
    params: { roomId, joinedUsers, chatList, room, shareEx },
  } = useRoute();
  const joinUsersId = joinedUsers?.map((user) => user.id) ?? null;
  const myUser: User | null = useAtomValue(userAtom);
  const [profileImage, setProfileImage] = useState();
  const friendList = useAtomValue(friendListAtom);

  const ToastConfig = {
    ...GlobalToastConfig,
    success: (props) => {
      if (props.text1)
        return (
          <>
            <BaseToast
              {...props}
              text1NumberOfLines={2}
              style={{
                borderLeftColor: count > 9 ? '#ffc518' : '#15979e',
                borderRadius: 0,
                padding: 12,
                borderLeftWidth: 3,
              }}
              contentContainerStyle={{ paddingHorizontal: 12 }}
              text1Style={{
                marginLeft: 0,
                padding: 0,
                fontSize: 12,
                fontWeight: '400',
              }}
              renderLeadingIcon={() =>
                count > 9 ? (
                  <IconImage source={require('../../assets/ic_warning.png')} />
                ) : (
                  <IconImage source={require('../../assets/ic_success.png')} />
                )
              }
              renderTrailingIcon={() =>
                count > 9 ? <></> : <IconImage source={require('../../assets/ic-arrow.png')} />
              }
            />
          </>
        );
    },
  };
  const onPressSelect = useCallback(
    async (chatText: string | undefined) => {
      // LogUtil.info(`onPressSelect : selectedFriendList: `, selectedFriendList);
      // LogUtil.info(`onPressSelect : roomTypeOfClient: `, roomTypeOfClient);

      const selectedFriendIdList: number[] = selectedFriendList.map((selectedFriend, i) => selectedFriend.id);
      const selectedFriendUIdList: string[] = selectedFriendList.map((selectedFriend, i) => selectedFriend.uid);
      LogUtil.info('selectedFriendList', selectedFriendIdList);
      if (contact) {
        selectedFriendUIdList.map((item) => chatList.push(ChatDataUtil.newMessage({ text: item, type: 'profile' })));
        for (const newIMessage of chatList) {
          LogUtil.info('onSend kokkokIMessages', newIMessage);
          if (newIMessage) {
            chatSocketUtil.emitChatRoom('채팅중', room?._id ?? '', user!.id, newIMessage);
          }
        }
        navigation.goBack();
      } else if (shareEx) {
        // share extension 통해서 들어온경우
        if (value === 'Friends') {
          if (chatText) {
            chatList.push(ChatDataUtil.newMessage({ text: chatText, type: 'chat' }));
          }
          navigation.navigate('/chats');
          setShare(true);
          await ChatHttpUtil.requestShareCreateRoom(selectedFriendIdList, user!.id, chatList, chatSocketUtil).then(
            (res) => {},
          );
          // navigation.popToTop();
        } else if (value === 'Chats') {
          if (chatText) {
            chatList.push(ChatDataUtil.newMessage({ text: chatText, type: 'chat' }));
          }
          setShare(true);

          for (const room of checkedRoomList) {
            for (const newIMessage of chatList) {
              LogUtil.info('onSend kokkokIMessages', newIMessage);
              if (newIMessage) {
                chatSocketUtil.emitChatRoom('채팅중', room?._id ?? '', user!.id, newIMessage);
              }
            }
          }
          // navigation.popToTop();
          navigation.navigate('/chats');
        }
      } else {
        if (value === 'Friends') {
          if (chatText) {
            chatList.push(ChatDataUtil.newMessage({ text: chatText, type: 'chat' }));
          }

          // console.log(chatList);
          navigation.navigate('/chats/chat-room', {
            room: room,
          });
          setShare(true);
          await ChatHttpUtil.requestShareCreateRoom(selectedFriendIdList, user!.id, chatList, chatSocketUtil).then(
            (res) => {},
          );
        } else if (value === 'Chats') {
          // console.log(checkedRoomList);
          if (chatText) {
            chatList.push(ChatDataUtil.newMessage({ text: chatText, type: 'chat' }));
          }
          navigation.navigate('/chats/chat-room', {
            room: room,
          });
          setShare(true);

          for (const room of checkedRoomList) {
            for (const newIMessage of chatList) {
              LogUtil.info('onSend kokkokIMessages', newIMessage);
              if (newIMessage) {
                chatSocketUtil.emitChatRoom('채팅중', room?._id ?? '', user!.id, newIMessage);
              }
            }
          }
        }
      }
    },
    [user, selectedFriendList, navigation, checkedRoomList],
  );

  const onListRefresh = () => {
    if (value === 'Friends') {
      setSelectedFriendList([]);
      setCount(0);
    } else if (value === 'Chats') {
      setCheckedRoomList([]);
      setCount(0);
    }
  };

  const limitCount = () => {};

  const defaultImage = (i: any) => {
    if (selectedFriendList?.[i]) {
      const isFriend = friendList?.filter((item) => item === selectedFriendList?.[i].id).length === 1;
      if (selectedFriendList?.[i].sc_profile_photo === 'friends' && isFriend) {
        if (selectedFriendList?.[i].profile_image === null || selectedFriendList?.[i].profile_image === 'private') {
          return require('assets/chats/img_profile.png');
        } else {
          return { uri: selectedFriendList?.[i].profile_image };
        }
      } else if (selectedFriendList?.[i].sc_profile_photo === 'public') {
        if (selectedFriendList?.[i].profile_image === null || selectedFriendList?.[i].profile_image === 'private') {
          return require('assets/chats/img_profile.png');
        } else {
          return { uri: selectedFriendList?.[i].profile_image };
        }
      } else {
        return require('assets/chats/img_profile.png');
      }
    } else {
      return undefined;
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <MainLayout>
          <BackHeader
            title={t('choose-friends.Choose Friends')}
            button={[<SelectButton key={0} count={count} onPress={() => onPressSelect(chatText)} />]}
          />
          {!contact && (
            <TabMenu menu={MENU} onPress={setValue} initialValue={value} onListRefresh={onListRefresh}></TabMenu>
          )}
          {value === 'Friends' && (
            <Container>
              {count > 0 && (
                <ScrollView
                  style={{ maxHeight: 94, paddingTop: 16 }}
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                >
                  {selectedFriendList.map((friend, i) => (
                    <View key={i} style={{ paddingTop: 16 }}>
                      <SelectedProfileImageBox>
                        <ProfileImage source={defaultImage(i)} />
                      </SelectedProfileImageBox>
                      <Pressable
                        onPressIn={() => {
                          setCount(count - 1);
                          //@ts-ignore
                          selectedFriendList.splice(selectedFriendList.indexOf(friend), 1);
                          setSelectedFriendList(selectedFriendList);
                        }}
                      >
                        <View style={{ position: 'absolute', top: -55, right: -10, padding: 10 }}>
                          <CloseIcon />
                        </View>
                      </Pressable>
                      <View style={{ overflow: 'hidden', width: 50, marginLeft: 16 }}>
                        <SelectedProfileText numberOfLines={1}>
                          {friend.first_name}
                          {friend.last_name !== '' && ` ${friend.last_name}`}
                        </SelectedProfileText>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
              <SearchBarContainer>
                <SearchBar
                  onChange={(value) => setSearchText(value)}
                  placeholder={t('choose-friends.Search by name, phone number or E-mail')}
                  value={searchText}
                />
              </SearchBarContainer>
              <SwrContainer data={contactList} error={contactError}>
                {searchedContactList.length === 0 ? (
                  <>
                    {/* <CaptionContainer>
                                            <Caption>Friends</Caption>
                                        </CaptionContainer> */}
                    <View style={{ padding: 13 }} />
                    <Space height={125} />
                    <Center>
                      <Icon source={require('assets/ic-nocontract.png')} />
                      <DescText>{t('common.No Results')}</DescText>
                      <Description>{`${t('common.There were no results for')} '${searchText}'`}</Description>
                    </Center>
                  </>
                ) : (
                  <>
                    {searchText.length === 0 && !!user && (
                      <>
                        <CaptionContainer>
                          <Caption>My profile</Caption>
                        </CaptionContainer>
                        <MyProfile>
                          <FriendProfile
                            friend={user}
                            isJoined={false}
                            count={count}
                            setCount={setCount}
                            selectedFriendList={selectedFriendList}
                            setSelectedFriendList={setSelectedFriendList}
                          />
                        </MyProfile>
                      </>
                    )}
                    <CaptionContainer>
                      <Caption>{t('choose-friends.Friends')}</Caption>
                    </CaptionContainer>
                    <FriendsList>
                      {searchedContactList.map((contact, i) => (
                        <FriendProfile
                          key={i}
                          friend={contact.friend}
                          isJoined={joinUsersId?.includes(contact.friend_id) ?? null}
                          count={count}
                          setCount={setCount}
                          selectedFriendList={selectedFriendList}
                          setSelectedFriendList={setSelectedFriendList}
                        />
                      ))}
                    </FriendsList>
                    {count > 0 && !contact && (
                      <Footer
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-around',
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
                        <ChatContainer>
                          <ChatInput
                            //@ts-ignore
                            ref={input}
                            placeholder="Enter a message"
                            placeholderTextColor={'#bbbbbb'}
                            value={chatText}
                            onChangeText={(text) => setChatText(text)}
                            multiline={true}
                            returnKeyLabel={'send'}
                            autoCompleteType={'off'}
                            autoCorrect={false}
                            onFocus={() => {}}
                          />
                        </ChatContainer>
                      </Footer>
                    )}
                  </>
                )}
              </SwrContainer>
            </Container>
          )}
          {value === 'Chats' && (
            <Container>
              <SearchBarContainer>
                <SearchBar
                  onChange={(value) => setSearchText(value)}
                  placeholder={t('choose-friends.Search by name, phone number or E-mail')}
                  value={searchText}
                />
              </SearchBarContainer>
              {searchedRoomList.length === 0 ? (
                <>
                  {/* <CaptionContainer>
                                            <Caption>Friends</Caption>
                                        </CaptionContainer> */}
                  <View style={{ padding: 13 }} />
                  <Space height={125} />
                  <Center>
                    <Icon source={require('assets/ic-nocontract.png')} />
                    <DescText>{t('common.No Results')}</DescText>
                    <Description>{`${t('common.There were no results for')} '${searchText}'`}</Description>
                  </Center>
                </>
              ) : (
                <SwipeListView
                  data={searchedRoomList}
                  renderItem={(renderedItem, rowMap) => (
                    <ChatListItem
                      checkedRoomList={checkedRoomList}
                      setCheckedRoomList={setCheckedRoomList}
                      isDeselect={isDeselect}
                      count={count}
                      isEdit={true}
                      setCount={setCount}
                      room={renderedItem.item}
                      rowMap={rowMap}
                    />
                  )}
                  keyExtractor={extractItemKey}
                  disableRightSwipe={true}
                  rightOpenValue={-260}
                  closeOnRowPress={true}
                />
              )}
              {count > 0 && !contact && (
                <Footer
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
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
                  <ChatContainer>
                    <ChatInput
                      //@ts-ignore
                      ref={input}
                      placeholder="Enter a message"
                      placeholderTextColor={'#bbbbbb'}
                      value={chatText}
                      onChangeText={(text) => setChatText(text)}
                      multiline={true}
                      returnKeyLabel={'send'}
                      autoCompleteType={'off'}
                      autoCorrect={false}
                      onFocus={() => {}}
                    />
                  </ChatContainer>
                </Footer>
              )}
            </Container>
          )}
          <Toast config={ToastConfig}></Toast>
        </MainLayout>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

export default ShareChat;
