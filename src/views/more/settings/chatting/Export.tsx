import React, { useContext, useMemo, useState } from 'react';
import MainLayout from 'components/layouts/MainLayout';
import CloseHeader from 'components/molecules/CloseHeader';
import { ActivityIndicator, Alert, Platform, Text, TouchableOpacity, View } from 'react-native';
import styled, { ThemeContext } from 'styled-components/native';
import { Row } from 'components/layouts/Row';
import { Checkbox } from 'components/atoms/input/Checkbox';
import { Column } from 'components/layouts/Column';
import { COLOR } from 'constants/COLOR';
import Modal from 'react-native-modal';
import Room, { OnRoomsType } from 'types/chats/rooms/Room';
import RNFetchBlob from 'rn-fetch-blob';
import { useAtom, useAtomValue } from 'jotai';
import tokenAtom from '../../../../stores/tokenAtom';
import axios from 'axios';
import Share from 'react-native-share';
import { Buffer } from 'buffer';
import { t } from 'i18next';
import userAtom from 'stores/userAtom';
import ChatDataUtil from 'utils/chats/ChatDataUtil';
import LogUtil from 'utils/LogUtil';
import CopyUtil from 'utils/CopyUtil';
import useSocket from 'hooks/useSocket';
import chatStatusAtom from 'stores/chatStatusAtom';
import friendListAtom from 'stores/friendListAtom';
import { zip } from 'react-native-zip-archive';
import RNFS from 'react-native-fs';

const DescriptionBox = styled.View`
  padding: 20px;
  background-color: ${(props) => (props.theme.dark ? '#69686A' : '#f8f8f8')};
`;
const Count = styled.Text`
  color: ${COLOR.PRIMARY};
  font-weight: bold;
`;
const SelectButtonLabel = styled.Text`
  color: #999999;
  margin-left: 5px;
`;
const ChatContainer = styled.ScrollView``;
const ProfileImageBox = styled.View`
  width: 46px;
  height: 46px;
  border-radius: 70px;
  overflow: hidden;
  margin-right: 10px;
  margin-left: 10px;
`;
const ProfilesImageBox = styled.View`
  width: 22px;
  height: 22px;
  border-radius: 70px;
  overflow: hidden;
`;
const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`;
const NameText = styled.Text`
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 5px;
  width: 85%;
`;
const ChatText = styled.Text`
  color: #999999;
  font-size: 13px;
  width: 90%;
`;
const Time = styled.Text`
  color: ${COLOR.POINT_GRAY};
  font-size: 12px;
`;
const Badge = styled.View`
  background-color: #15979e;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
`;
const BadgeCount = styled.Text`
  color: #ffffff;
  padding: 3px;
  padding-left: 7px;
  padding-right: 7px;
  font-size: 11px;
  font-weight: bold;
`;

function getMonth(m: any) {
  let month = '';

  if (m < 10) {
    month = `0${m}`;
  } else {
    month = `${m}`;
  }

  switch (month) {
    case '01':
      return 'Jan';
    case '02':
      return 'Feb';
    case '03':
      return 'Mar';
    case '04':
      return 'Apr';
    case '05':
      return 'May';
    case '06':
      return 'Jun';
    case '07':
      return 'Jul';
    case '08':
      return 'Aug';
    case '09':
      return 'Sep';
    case '10':
      return 'Oct';
    case '11':
      return 'Nov';
    case '12':
      return 'Dec';
    default:
      return '';
  }
}

const Chat = ({ room, count, setCount, selectedRoomId, setSelectedRoomId }) => {
  const themeContext = useContext(ThemeContext);
  const [checked, setChecked] = useState<boolean>(false);
  const me = useAtomValue(userAtom);
  const friendList = useAtomValue(friendListAtom);

  const getTime = (createdAt) => {
    const currentDate = new Date();
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    if (currentDate.getFullYear() !== year) {
      return `${getMonth(month)} ${day < 10 ? `0${day}` : `${day}`}. ${year}`;
    } else {
      if (currentDate.getMonth() + 1 !== month || currentDate.getDate() !== day) {
        return `${getMonth(month)} ${day < 10 ? `0${day}` : `${day}`}`;
      } else {
        return `${hours < 10 ? `0${hours}` : `${hours}`}:${minutes < 10 ? `0${minutes}` : `${minutes}`} ${
          hours < 13 ? 'AM' : 'PM'
        }`;
      }
    }
  };
  const usersWithoutMe = useMemo(() => {
    return room.joined_users.filter((user) => user.id !== me?.id);
  }, [me?.id, room.joined_users]);

  const defaultImage = (i: any) => {
    if (room.joined_users?.[i]) {
      const isFriend = friendList?.filter((item) => item === room.joined_users?.[i].id).length === 1;
      if (room.joined_users?.[i].sc_profile_photo === 'friends' && isFriend) {
        if (room.joined_users?.[i].profile_image === null || room.joined_users?.[i].profile_image === 'private') {
          return require('assets/chats/img_profile.png');
        } else {
          return { uri: room.joined_users[i].profile_image };
        }
      } else if (room.joined_users?.[i].sc_profile_photo === 'public') {
        if (room.joined_users?.[i].profile_image === null || room.joined_users?.[i].profile_image === 'private') {
          return require('assets/chats/img_profile.png');
        } else {
          return { uri: room.joined_users[i].profile_image };
        }
      } else {
        return require('assets/chats/img_profile.png');
      }
    } else {
      return undefined;
    }
  };

  const preview_message = useMemo(() => ChatDataUtil.simpleMessageVer(room), [room]);

  return (
    <Row
      style={[
        { alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20 },
        checked && (themeContext.dark ? { backgroundColor: '#88808f' } : { backgroundColor: '#fcf2e8' }),
      ]}
    >
      <Checkbox
        round
        checked={checked}
        handleChecked={() => {
          if (!checked) {
            setCount(count + 1);
            setSelectedRoomId([...selectedRoomId, room._id]);
          } else {
            setCount(count - 1);
            setSelectedRoomId(selectedRoomId.filter((id) => id !== room._id));
          }
          setChecked(!checked);
        }}
      />
      {usersWithoutMe.length > 1 ? (
        <Column style={{ paddingHorizontal: 10 }}>
          <Row style={{ marginBottom: 5 }}>
            <ProfilesImageBox style={{ marginRight: 5 }}>
              <ProfileImage source={defaultImage(0)} />
            </ProfilesImageBox>
            <ProfilesImageBox>
              <ProfileImage source={defaultImage(1)} />
            </ProfilesImageBox>
          </Row>
          <Row>
            <ProfilesImageBox style={{ marginRight: 5 }}>
              <ProfileImage source={defaultImage(2)} />
            </ProfilesImageBox>
            <ProfilesImageBox>
              <ProfileImage source={defaultImage(3)} />
            </ProfilesImageBox>
          </Row>
        </Column>
      ) : (
        <ProfileImageBox>
          <ProfileImage source={defaultImage(1)} />
        </ProfileImageBox>
      )}
      <Column style={{ flex: 1 }}>
        <Row>
          <NameText numberOfLines={1} style={{ fontSize: me?.setting?.ct_text_size as number }}>
            {usersWithoutMe[0] ? `${usersWithoutMe[0].first_name} ${usersWithoutMe[0].last_name}` : room.name}
          </NameText>
          {room.joined_users.length > 2 && <Count>{room.joined_users.length}</Count>}
        </Row>
        <ChatText numberOfLines={2} style={{ fontSize: me?.setting?.ct_text_size as number }}>
          {preview_message}
        </ChatText>
      </Column>
      <Column style={{ width: 74, alignItems: 'flex-end' }}>
        <Time style={{ fontSize: me?.setting?.ct_text_size as number }}>
          {room.preview_message ? getTime(room.preview_message?.createdAt) : ''}
        </Time>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {room.unread_count !== 0 && (
            <Row style={{ width: '100%' }}>
              <View style={{ flex: 1 }} />
              <Badge>
                <BadgeCount>{room.unread_count > 999 ? '999+' : room.unread_count}</BadgeCount>
              </Badge>
            </Row>
          )}
        </View>
      </Column>
    </Row>
  );
};

const shareToFiles = async (url) => {
  const shareOptions = {
    title: 'Share file',
    failOnCancel: false,
    saveToFiles: true,
    url: url, // base64 with mimeType or path to local file
  };

  // If you want, you can use a try catch, to parse
  // the share response. If the user cancels, etc.
  try {
    const ShareResponse = await Share.open(shareOptions);
    // console.log(ShareResponse);
  } catch (error) {
    // console.log('Error =>', error);
  }
};

const ExportModal = ({ isVisible, setIsVisible, selectedRoomId }) => {
  const token = useAtomValue(tokenAtom);
  const [isProgressing, setIsProgressing] = useState<boolean>(false);

  const exportChat = async (type) => {
    let url =
      axios.defaults.baseURL +
      `/chats/rooms/pdf?room_ids=${encodeURIComponent(JSON.stringify(selectedRoomId))}&type=pdf`;

    setIsProgressing(true);

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    const today = `${year}${month}${day}${hour}${min}${sec}`;
    const dirs = Platform.OS === 'ios' ? RNFetchBlob.fs.dirs.DocumentDir : RNFetchBlob.fs.dirs.DownloadDir;
    const fileName = `KoKKoKChat${today}.pdf`;

    try {
      await RNFetchBlob.config({
        fileCache: true,
        path: dirs + `/${fileName}`,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: `${dirs}/${fileName}`,
        },
      })
        .fetch('GET', url, {
          Authorization: `Bearer ${token}`,
        })
        .then(async (res) => {
          if (type === 'pdf') {
            setIsVisible(false);
            setTimeout(() => {
              setIsProgressing(false);
              if (Platform.OS === 'android') {
                shareToFiles(`file://${res.path()}`);
              } else {
                RNFetchBlob.ios.previewDocument(res.path());
              }
            }, 500);
          } else {
            await RNFS.mkdir(dirs + '/KoKKoKChat');
            await RNFS.moveFile(res.path(), dirs + `/KoKKoKChat/${fileName}`)
              .then((res) => console.log('res', res))
              .catch((error) => console.log('error', error));

            await zip(dirs + '/KoKKoKChat', dirs + `/KoKKoKChat${today}.zip`)
              .then((path) => {
                RNFS.unlink(dirs + '/KoKKoKChat');
                setIsVisible(false);
                setTimeout(() => {
                  setIsProgressing(false);
                  if (Platform.OS === 'android') {
                    shareToFiles(`file://${path}`);
                  } else {
                    RNFetchBlob.ios.previewDocument(path);
                  }
                }, 500);
              })
              .catch((error) => {
                setIsProgressing(false);
                console.warn(error);
                Alert.alert('error', 'Something went wrong. please try again');
              });
          }
        });
    } catch (error) {
      setIsProgressing(false);
      console.warn(error);
      Alert.alert('error', 'Something went wrong. please try again');
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackButtonPress={() => setIsVisible(false)}
      onBackdropPress={() => setIsVisible(false)}
    >
      {isProgressing ? (
        <ActivityIndicator color={COLOR.PRIMARY} size="small" />
      ) : (
        <View
          style={{
            position: 'absolute',
            left: 0,
            bottom: 10,
            backgroundColor: 'white',
            height: 180,
            width: '100%',
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={{
              padding: 20,
              borderBottomColor: COLOR.POINT_GRAY,
              borderBottomWidth: 1,
              width: '100%',
              alignItems: 'center',
            }}
            onPress={() => exportChat('zip')}
          >
            <Text style={{ color: '#000000' }}>Export to Zip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              padding: 20,
              borderBottomColor: COLOR.POINT_GRAY,
              borderBottomWidth: 1,
              width: '100%',
              alignItems: 'center',
            }}
            onPress={() => exportChat('pdf')}
          >
            <Text style={{ color: '#000000' }}>Export to PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ padding: 20, width: '100%', alignItems: 'center' }}
            onPress={() => setIsVisible(false)}
          >
            <Text style={{ color: 'red' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </Modal>
  );
};
const SelectButton = ({ count, onPress }) => {
  return (
    <TouchableOpacity style={{ flexDirection: 'row', marginRight: 5 }} onPress={() => onPress()}>
      <Count>{count}</Count>
      <SelectButtonLabel>{t('chatting.Select')}</SelectButtonLabel>
    </TouchableOpacity>
  );
};

const Export = function () {
  const { chatStatus } = useSocket();
  const me = useAtomValue(userAtom);
  const [count, setCount] = useState<number>(0);
  const [isProgress, setIsProgress] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [selectedRoomId, setSelectedRoomId] = useState<Array<string>>([]);
  const onRoomsData = chatStatus.rooms;
  const archivedRoomList: Room[] = onRoomsData?.archivedRooms ?? [];
  const unArchivedRoomList: Room[] = onRoomsData?.unArchivedRooms ?? [];
  const roomList: Room[] = CopyUtil.deepCopy([...archivedRoomList, ...unArchivedRoomList]); // mobx의 경우 deepCopy해야 scrollView에서 에러가 없음.

  return (
    <MainLayout>
      <CloseHeader
        title={t('chatting.Export Chats')}
        position="left"
        button={count > 0 ? [<SelectButton key={0} count={count} onPress={() => setIsVisible(true)} />] : []}
      />
      {isProgress ? (
        <></>
      ) : (
        <>
          <DescriptionBox>
            <Text style={{ color: '#999999', fontSize: me?.setting?.ct_text_size }}>
              {t('chatting.Only text messages are included, except for media')}
            </Text>
          </DescriptionBox>
          <ChatContainer>
            {roomList &&
              roomList.map((room, index) => (
                <Chat
                  key={index}
                  room={room}
                  count={count}
                  setCount={setCount}
                  selectedRoomId={selectedRoomId}
                  setSelectedRoomId={setSelectedRoomId}
                />
              ))}
          </ChatContainer>
        </>
      )}
      <ExportModal isVisible={isVisible} setIsVisible={setIsVisible} selectedRoomId={selectedRoomId} />
    </MainLayout>
  );
};

export default Export;
