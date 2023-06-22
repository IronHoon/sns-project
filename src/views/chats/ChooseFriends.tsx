import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import BackHeader from '../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import { SearchBar } from 'components/molecules/search-bar';
import styled, { ThemeContext } from 'styled-components/native';
import {
  Alert,
  BackHandler,
  ImageBackground,
  Keyboard,
  Pressable,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
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
import { CreateRoomRequest } from 'types/_request/CreateRoomRequest';
import AuthUtil from 'utils/AuthUtil';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import LogUtil from 'utils/LogUtil';
import useFetch, { useFetchWithType } from 'net/useFetch';
import SwrContainer from 'components/containers/SwrContainer';
import Contact from 'types/contacts/Contact';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import Nullable from 'types/_common/Nullable';
import { t } from 'i18next';
import shareAtom from '../../stores/shareAtom';
import ChatTextInput from './components/ChatTextInput';
import tw from 'twrnc';
import useSocket from '../../hooks/useSocket';
import ChatDataUtil from '../../utils/chats/ChatDataUtil';
import Toast, { BaseToast } from 'react-native-toast-message';
import { EventRegister } from 'react-native-event-listeners';
import friendListAtom from '../../stores/friendListAtom';
import { useSetAtom } from 'jotai';
import profileDetailUidAtom from 'stores/profileDetailUidAtom';

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
const Caption = styled.Text<{ fontSize: number }>`
  color: #bbbbbb;
  font-size: ${({ fontSize }) => fontSize - 2};
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
const NameText = styled.Text<{ isJoined: boolean | undefined }>`
  color: ${({ theme, isJoined }) => (isJoined ? 'rgba(0, 0, 0, 0.3)' : theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  /* font-size: 15px; */
  font-weight: 500;
  margin-bottom: 5px;
`;
const IDText = styled.Text<{ themeFont: number }>`
  color: #999999;
  font-size: ${({ themeFont }) => themeFont - 2};
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
const DescText = styled(Text)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

const SelectButton = ({ count, onPress }) => {
  const me = useAtomValue(userAtom);
  return (
    <TouchableOpacity style={{ flexDirection: 'row', marginRight: 5 }} onPress={() => onPress()}>
      <Count style={{ fontSize: me?.setting.ct_text_size as number }}>{count}</Count>
      <SelectButtonLabel style={{ fontSize: me?.setting.ct_text_size as number }}>
        {t('choose-friends.Select')}
      </SelectButtonLabel>
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
  canClickProfile: boolean;
};
const FriendProfile = ({
  isJoined,
  friend,
  count,
  setCount,
  selectedFriendList,
  setSelectedFriendList,
  canClickProfile,
}: FriendProfileProp) => {
  const themeContext = useContext(ThemeContext);

  const myUser: User | null = useAtomValue(userAtom);
  const setCurrentProfileUid = useSetAtom(profileDetailUidAtom);
  const navigation = useNavigation<MainNavigationProp>();
  const isMe = friend?.id === myUser?.id;
  const [profileImage, setProfileImage] = useState();
  const friendList = useAtomValue(friendListAtom);

  useFocusEffect(
    useCallback(() => {
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
    }, []),
  );
  return (
    <Row
      style={[
        { alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20 },
        selectedFriendList.includes(friend) &&
          (themeContext.dark ? { backgroundColor: '#88808f' } : { backgroundColor: '#fcf2e8' }),
      ]}
    >
      {!isJoined && (
        <Checkbox
          round
          checked={selectedFriendList.includes(friend)}
          handleChecked={() => {
            if (!selectedFriendList.includes(friend)) {
              setCount(count + 1);
              setSelectedFriendList([...selectedFriendList, friend]);
            } else {
              setCount(count - 1);
              selectedFriendList.splice(selectedFriendList.indexOf(friend), 1);
              setSelectedFriendList(selectedFriendList);
            }
          }}
        />
      )}
      {isJoined && <Space width={22} />}
      <Pressable
        style={{ flexDirection: 'row', alignItems: 'center' }}
        onPress={() => {
          if (canClickProfile) {
            setCurrentProfileUid(friend?.uid);
            navigation.navigate('/profile-detail');
          }
        }}
      >
        <ImageBackground
          style={{ width: 46, height: 46, borderRadius: 70, overflow: 'hidden', marginLeft: 16, marginRight: 16 }}
          //@ts-ignore
          source={profileImage}
        >
          {isJoined && <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', flex: 1 }} />}
        </ImageBackground>
        <Column style={{ flex: 1 }}>
          <NameText isJoined={isJoined} numberOfLines={1} style={{ fontSize: myUser?.setting.ct_text_size as number }}>
            {friend.first_name}
            {friend.last_name !== '' && ` ${friend.last_name}`}
          </NameText>
          <IDText themeFont={myUser?.setting.ct_text_size as number}>@{friend.uid}</IDText>
        </Column>
      </Pressable>
    </Row>
  );
};

type Callback = (data: any) => void;
export class ChooseFriendsCallback {
  static listenerId?: string | boolean;
  eventName = 'choose-friends-callback';
  constructor(callback: Callback) {
    this.remove();
    this.add(callback);
  }

  add(callback: Callback) {
    if (!ChooseFriendsCallback.listenerId) {
      ChooseFriendsCallback.listenerId = EventRegister.addEventListener(this.eventName, callback);
    }
  }
  remove() {
    if (ChooseFriendsCallback.listenerId && typeof ChooseFriendsCallback.listenerId === 'string') {
      EventRegister.removeEventListener(ChooseFriendsCallback.listenerId);
      ChooseFriendsCallback.listenerId = undefined;
    }
  }

  emit(data: any) {
    EventRegister.emit(this.eventName, data);
  }
}
export class ChooseFriendsCloseCallback {
  static listenerId?: string | boolean;
  eventName = 'choose-friends-close-callback';
  constructor(callback: Callback) {
    this.remove();
    this.add(callback);
  }

  add(callback: Callback) {
    if (!ChooseFriendsCloseCallback.listenerId) {
      ChooseFriendsCloseCallback.listenerId = EventRegister.addEventListener(this.eventName, callback);
    }
  }
  remove() {
    if (ChooseFriendsCloseCallback.listenerId && typeof ChooseFriendsCloseCallback.listenerId === 'string') {
      EventRegister.removeEventListener(ChooseFriendsCloseCallback.listenerId);
      ChooseFriendsCloseCallback.listenerId = undefined;
    }
  }

  emit(data: any) {
    EventRegister.emit(this.eventName, data);
  }
}

function ascending(a, b) {
  return a.friend.first_name.toLowerCase() < b.friend.first_name.toLowerCase() ? -1 : 1;
}
function ChooseFriends() {
  const {
    data: contactList,
    error: contactError,
    mutate: contactMutate,
  } = useFetchWithType<Contact[]>('/auth/contacts', true);
  const { params } = useRoute<any>();
  const chooseFriendsCallback = params?.callback as ChooseFriendsCallback | undefined;
  const chooseFriendsCloseCallback = params?.closeCallback as ChooseFriendsCloseCallback | undefined;
  const roomId = params?.roomId as string | undefined;
  const roomTypeOfClient = params?.chatRoomType as RoomTypeOfClient | undefined;
  const joinUsersId = params?.joinedUsers?.map((user) => user.id) ?? null;
  const byCallView = params?.byCallView ?? false;

  const navigation = useNavigation<MainNavigationProp>();
  const [searchText, setSearchText] = useState('');
  const searchedContactList = (contactList ?? [])
    .filter(
      (contact) =>
        contact.friend.uid.toLowerCase().includes(searchText.toLowerCase()) ||
        contact.friend.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
        contact.friend.last_name.toLowerCase().includes(searchText.toLowerCase()) ||
        contact.friend.contact.includes(searchText) ||
        (contact.friend.email && contact.friend.email.toLowerCase().includes(searchText.toLowerCase())),
    )
    .sort(ascending);
  const [count, setCount] = useState<number>(0);
  const [selectedFriendList, setSelectedFriendList] = useState<User[]>([]);
  const user = useAtomValue(userAtom);
  const userId = user?.id;
  const setCurrentProfileUid = useSetAtom(profileDetailUidAtom);

  const onPressSelect = async () => {
    if (selectedFriendList.length > 0 && userId) {
      chooseFriendsCallback?.emit({ navigation, selectedFriendList, roomId, roomTypeOfClient, userId });
    }
  };

  useEffect(() => {
    //CallView에 의해 켜졌을 때, back하기전에 closeCallback하기 위해 필요.
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      chooseFriendsCloseCallback?.emit({ navigation });
      navigation.pop();
      return true;
    });
    return () => {
      backHandler.remove();
    };
  }, []);

  return (
    <MainLayout>
      <BackHeader
        title={t('choose-friends.Choose Friends')}
        button={[<SelectButton key={0} count={count} onPress={() => onPressSelect()} />]}
        onClick={chooseFriendsCloseCallback ? () => chooseFriendsCloseCallback.emit({ navigation }) : undefined}
      />
      {/* <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}> */}
      <Container>
        {count > 0 && (
          <ScrollView
            style={{ maxHeight: 104, paddingTop: 16 }}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            {selectedFriendList.map((friend, i) => (
              <View key={i} style={{ paddingTop: 16 }}>
                <SelectedProfileImageBox>
                  <ProfileImage
                    source={
                      friend.profile_image && friend.profile_image !== 'private'
                        ? { uri: friend.profile_image }
                        : require('assets/chats/img_profile.png')
                    }
                  />
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
                  <SelectedProfileText numberOfLines={1} style={{ fontSize: user?.setting.ct_text_size as number }}>
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
              <CaptionContainer>
                <Caption fontSize={user?.setting.ct_text_size as number}>{t('choose-friends.Friends')}</Caption>
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
                    canClickProfile={!byCallView}
                  />
                ))}
              </FriendsList>
            </>
          )}
        </SwrContainer>
      </Container>
      {/* </TouchableWithoutFeedback> */}
    </MainLayout>
  );
}

export default ChooseFriends;
