import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import MainLayout from 'components/layouts/MainLayout';
import PrevHeader from 'components/molecules/PrevHeader';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import IcKok from 'assets/chats/chatroom-detail/ic-kok.svg';
import styled, { ThemeContext } from 'styled-components/native';
import ChatRoomDetailButtonNav from './components/chatroom-detail/ChatRoomDetailButtonNav';
import ChatRoomDetailMenuNav from './components/chatroom-detail/ChatRoomDetailMenuNav';
import MemberList from './components/chatroom-detail/MemberList';
import Lightbox from 'react-native-lightbox-v2';
import Options from './components/chatroom-detail/Options';
import { ModalBase } from 'components/modal';
import { Column } from 'components/layouts/Column';
import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';
import Space from 'components/utils/Space';
import Room, { RoomTypeOfServer } from 'types/chats/rooms/Room';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import User from 'types/auth/User';
import userAtom from 'stores/userAtom';
import AuthUtil from 'utils/AuthUtil';
import DateUtil from 'utils/DateUtil';
import LogUtil from 'utils/LogUtil';
import ChatSocketUtil from 'utils/chats/ChatSocketUtil';
import useSocket from 'hooks/useSocket';
import chatStatusAtom from 'stores/chatStatusAtom';
import Toast from 'react-native-toast-message';
import tokenAtom from 'stores/tokenAtom';
import axios from 'axios';
import RNFetchBlob from 'rn-fetch-blob';
import Share from 'react-native-share';
import Modal from 'react-native-modal';
import { Buffer } from 'buffer';
import friendListAtom from '../../stores/friendListAtom';
import { WIDTH } from 'constants/WIDTH';
import { zip } from 'react-native-zip-archive';
import RNFS from 'react-native-fs';
import { useSetAtom } from 'jotai';
import activityAtom from '../../stores/activityAtom';
import { ToastConfig } from 'config/ToastConfig';

const UserInfo = styled.View`
  margin-top: 25px;
  align-items: center;
`;
const ProfileContainer = styled(Lightbox)`
  width: 120px;
  height: 120px;
  border-radius: 70px;
  overflow: hidden;
  margin: 15px;
`;
const ProfileImage = styled.Image<{ open: boolean }>`
  width: 100%;
  height: 100%;
  max-height: 300px;
  border-radius: ${({ open }) => (open ? '0px' : '70px')};
`;
const Name = styled.Text<{ fontSize: number }>`
  font-size: ${({ fontSize }) => fontSize + 4};
  font-weight: 500;
  margin: 5px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const ID = styled.Text`
  color: ${(props) => props.theme.colors.POINT_GRAY};
`;
const LastSeen = styled.Text`
  margin: 5px;
  color: #999999;
  font-weight: 500;
`;
const ModalTitle = styled.Text`
  font-size: 15px;
  font-weight: 500;
  color: black;
  padding: 10px;
  text-align: center;
`;
const ModalText = styled.Text`
  color: #999999;
  padding: 10px;
  font-size: 13px;
  text-align: center;
`;
const CancelButton = styled.TouchableOpacity`
  background-color: #fff;
  width: 100px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: #ccc;
`;
const CancelLabel = styled.Text`
  color: #ccc;
  font-size: 13px;
  font-weight: 500;
`;
const ConfirmButton = styled.TouchableOpacity`
  background-color: ${COLOR.PRIMARY};
  width: 100px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${COLOR.PRIMARY};
`;
const ConfirmLabel = styled.Text`
  color: #fff;
  font-size: 13px;
  font-weight: 500;
`;
const CheckBoxContainer = styled.TouchableOpacity`
  position: relative;
  width: 20px;
  height: 22px;
`;
const CheckBoxImage = styled.Image`
  position: absolute;
  width: 100%;
  height: 100%;
`;
const CheckBoxText = styled.Text`
  font-size: 13px;
  font-weight: 600;
  margin-left: 5px;
  color: ${COLOR.PRIMARY};
`;

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
  const setActivity = useSetAtom(activityAtom);

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
    const today = `${year}${month}${day < 10 ? '0' + day : day}${hour}${min}${sec}`;
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
            await RNFS.mkdir(dirs + `/KoKKoKChat`);
            await RNFS.moveFile(res.path(), dirs + `/KoKKoKChat/${fileName}`)
              .then((res) => console.log('res', res))
              .catch((error) => console.log('error', error));

            await zip(dirs + `/KoKKoKChat`, dirs + `/KoKKoKChat${today}.zip`)
              .then((path) => {
                RNFS.unlink(dirs + `/KoKKoKChat`);
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
              });
          }
        });
    } catch (error) {
      setIsProgressing(false);
      console.warn(error);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackButtonPress={() => (isProgressing ? {} : setIsVisible(false))}
      onBackdropPress={() => (isProgressing ? {} : setIsVisible(false))}
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
            onPress={() => {
              setActivity(true);
              exportChat('zip');
            }}
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
            onPress={() => {
              setActivity(true);
              exportChat('pdf');
            }}
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

const DeleteModal = ({ isVisible, setIsVisible, handleClear }) => {
  const [checked, setChecked] = useState<boolean>(false);

  return (
    <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
      <Column justify="center" align="center">
        <ModalTitle>{t('chatting.Are you sure you want to clear all chat messages?')}</ModalTitle>
        <Space height={35} />
        <Row style={{ position: 'absolute', left: 0, top: 55, alignItems: 'center' }}>
          <CheckBoxContainer
            onPress={() => {
              setChecked(!checked);
            }}
          >
            <CheckBoxImage source={checked ? require('assets/ic-check-on.png') : require('assets/ic-check-off.png')} />
          </CheckBoxContainer>
          <CheckBoxText>{t('chatting.Delete media in all chatrooms')}</CheckBoxText>
        </Row>
        <Row style={{ paddingTop: 15 }}>
          <CancelButton onPress={() => setIsVisible(false)}>
            <CancelLabel>{t('common.Cancel')}</CancelLabel>
          </CancelButton>
          <View style={{ padding: 10 }} />
          <ConfirmButton
            onPress={() => {
              handleClear(checked);
            }}
          >
            <ConfirmLabel>{t('chatting.Clear')}</ConfirmLabel>
          </ConfirmButton>
        </Row>
      </Column>
    </ModalBase>
  );
};

const LeaveModal = ({ isVisible, setIsVisible, handleLeave, admin_id, user_id, isGroup }) => {
  return (
    <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
      <Column justify="center" align="center">
        <ModalTitle>{t('chats-main.Are you sure you want to leave the chat room?')}</ModalTitle>
        <ModalText>
          {isGroup && admin_id === user_id
            ? t(
                'chats-main.The chat room will be maintained even if you (owner) leave Also, you cannot see all chat history when coming back',
              )
            : t(
                'chat-info.If you leave, all chat history will be deleted and this chatroom will be removed from the chat list',
              )}
        </ModalText>
        <Row style={{ paddingTop: 15 }}>
          <CancelButton
            onPress={() => {
              setIsVisible(false);
            }}
          >
            <CancelLabel>{t('common.Cancel')}</CancelLabel>
          </CancelButton>
          <View style={{ padding: 10 }} />
          <ConfirmButton onPress={() => handleLeave()}>
            <ConfirmLabel>{t('common.Delete')}</ConfirmLabel>
          </ConfirmButton>
        </Row>
      </Column>
    </ModalBase>
  );
};
const ReportModal = ({ type, reportValue, setReportValue, handleReport }) => {
  const [checked, setChecked] = useState<boolean>(false);

  return (
    <ModalBase isVisible={!!reportValue} onBackdropPress={() => setReportValue('')} width={350}>
      <Column justify="center" align="center">
        <ModalTitle>
          {type === 'group' ? t('chat-info.Report this group?') : t('chat-info.Report the chatroom?')}
        </ModalTitle>
        <ModalText style={{ textAlign: 'left' }}>
          {t('chat-info.People in this chatroom will not be notifed with your report')}
        </ModalText>
        <Space height={35} />
        <Row style={{ position: 'absolute', left: 10, top: 95, alignItems: 'center' }}>
          <CheckBoxContainer
            onPress={() => {
              setChecked(!checked);
            }}
          >
            <CheckBoxImage source={checked ? require('assets/ic-check-on.png') : require('assets/ic-check-off.png')} />
          </CheckBoxContainer>
          <CheckBoxText>
            {type === 'group'
              ? t('chat-info.Leave this chatroom and delete all conversation')
              : t('chat-info.Block user and delete all conversation')}
          </CheckBoxText>
        </Row>
        <Row style={{ paddingTop: 15 }}>
          <CancelButton onPress={() => setReportValue('')}>
            <CancelLabel>{t('common.Cancel')}</CancelLabel>
          </CancelButton>
          <View style={{ padding: 10 }} />
          <ConfirmButton
            onPress={() => {
              handleReport(checked);
              setChecked(false);
            }}
          >
            <ConfirmLabel>{t('common.Report')}</ConfirmLabel>
          </ConfirmButton>
        </Row>
      </Column>
    </ModalBase>
  );
};

function ChatRoomDetail() {
  const navigation = useNavigation();
  const { params } = useRoute();

  const { chatStatus, chatSocketUtil, forceUpdateForChatStatus } = useSocket();
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isReportVisible, setIsReportVisible] = useState<boolean>(false);
  const [isMoreVisible, setIsMoreVisible] = useState<boolean>(false);
  const [isLeaveVisible, setIsLeaveVisible] = useState<boolean>(false);
  const [isClearVisible, setIsClearVisible] = useState<boolean>(false);
  const [isExportVisible, setIsExportVisible] = useState<boolean>(false);
  const [reportValue, setReportValue] = useState<string>('');

  const themeContext = useContext(ThemeContext);

  //@ts-ignore
  const room: Room = params.room;
  const type: RoomTypeOfServer = room.type;

  const myUser = useAtomValue<User | null>(userAtom);
  const myUserId = myUser?.id;
  const joinedUsersWithoutMe = room?.joined_users?.filter((user) => user.id !== myUserId);
  const targetUser = joinedUsersWithoutMe?.[0];
  const profileUser = type === 'me' ? myUser : targetUser;
  const profileUserSetting = room.user_settings.filter((user) => user.user_id === profileUser?.id)?.[0];
  const isArchive = room.archived_user_ids.some((archived_user_id) => archived_user_id === myUserId);
  const isMe = profileUser?.id === myUser?.id;
  const isDeletedUser = !isMe && profileUser?.uid.split('_').pop() === `deleted${profileUser?.id}`;

  const [profileImage, setProfileImage] = useState();

  const addedMeList = useAtomValue(friendListAtom);
  const isAddedMe = addedMeList?.includes(targetUser?.id);

  const lastAt = useMemo(() => {
    if (type === 'chat') {
      const recent_login = targetUser?.user_setting?.sc_recent_login;
      if (recent_login === 'public' || (recent_login === 'friends' && isAddedMe))
        return DateUtil.timeForToday(targetUser?.last_active_at);
    }
    return '';
  }, [room]);

  useFocusEffect(
    useCallback(() => {
      const isFriend = addedMeList?.filter((item) => item === profileUser?.id).length === 1;
      if (!isMe) {
        if (profileUser?.sc_profile_photo === 'friends' && isFriend) {
          if (
            profileUser?.profile_image === null ||
            profileUser?.profile_image === 'private' ||
            profileUser?.profile_image === ''
          ) {
            setProfileImage(require('assets/img-profile.png'));
          } else if (profileUser?.profile_image) {
            //@ts-ignore
            setProfileImage({ uri: profileUser?.profile_image });
          }
        } else if (profileUser?.sc_profile_photo === 'public') {
          if (
            profileUser?.profile_image === null ||
            profileUser?.profile_image === 'private' ||
            profileUser?.profile_image === ''
          ) {
            setProfileImage(require('assets/img-profile.png'));
          } else if (profileUser?.profile_image) {
            //@ts-ignore
            setProfileImage({ uri: profileUser?.profile_image });
          }
        } else {
          setProfileImage(require('assets/img-profile.png'));
        }
      } else {
        if (profileUser?.profile_image) {
          //@ts-ignore
          setProfileImage({ uri: profileUser?.profile_image });
        } else {
          setProfileImage(require('assets/img-profile.png'));
        }
      }
    }, []),
  );
  const moreMenu =
    type !== 'me'
      ? [
          {
            value: 'export',
            label: t('chatting.Export chats'),
          },
          {
            value: 'clear',
            label: t('chat-info.Clear chat'),
          },
          {
            value: 'archive',
            label: isArchive ? t('chat-info.Unarchive this chat room') : t('chat-info.Archive this chat room'),
          },
          {
            value: 'leave',
            label: t('chat-info.Leave this chat room'),
          },
          {
            value: 'cancel',
            label: t('common.Cancel'),
          },
        ]
      : [
          {
            value: 'export',
            label: t('chatting.Export chats'),
          },
          {
            value: 'clear',
            label: t('chat-info.Clear chat'),
          },
          {
            value: 'leave',
            label: t('chat-info.Leave this chat room'),
          },
          {
            value: 'cancel',
            label: t('common.Cancel'),
          },
        ];
  const reportMenu = [
    {
      value: 'spam',
      label: t('kokkokme-main.Spam'),
    },
    {
      value: 'nude-images',
      label: t('kokkokme-main.Nude images or sexual acts'),
    },
    {
      value: 'do-not-like',
      label: t("kokkokme-main.I don't like it"),
    },
    {
      value: 'fraudulent',
      label: t('kokkokme-main.Fraudulent or false'),
    },
    {
      value: 'hate-speech',
      label: t('kokkokme-main.Hate speech or symbol'),
    },
    {
      value: 'false-information',
      label: t('kokkokme-main.False information'),
    },
    {
      value: 'cancel',
      label: t('common.Cancel'),
    },
  ];

  const handleMoreButtonPress = async (value, isVisible) => {
    if (value === 'export') {
      setIsMoreVisible(isVisible);
      setIsExportVisible(true);
    }
    if (value === 'clear') {
      setIsClearVisible(true);
      setIsMoreVisible(isVisible);
    }
    if (value === 'archive') {
      if (profileUser?.id) {
        if (isArchive) {
          ChatHttpUtil.requestUnarchiveRoom(room);
          room.archived_user_ids = room.archived_user_ids.filter((archivedUserId) => archivedUserId !== profileUser.id);
          chatStatus.rooms!.archivedRooms = chatStatus.rooms!.archivedRooms.filter((room) => room._id !== room._id);
          chatStatus.rooms!.unArchivedRooms = [...chatStatus.rooms!.unArchivedRooms, room];
        } else {
          ChatHttpUtil.requestArchiveRoom(room);
          chatStatus.rooms!.unArchivedRooms = chatStatus.rooms!.unArchivedRooms.filter((room) => room._id !== room._id);
          chatStatus.rooms!.archivedRooms = [...chatStatus.rooms!.archivedRooms, room];
          room.archived_user_ids = [...room.archived_user_ids, profileUser.id];
        }

        chatStatus.currentRoomForChat = room;
        forceUpdateForChatStatus();

        navigation.goBack();
        navigation.goBack();
      }
    }
    if (value === 'leave') {
      setIsLeaveVisible(true);
      setIsMoreVisible(isVisible);
    }

    if (value === 'cancel') {
      setIsMoreVisible(isVisible);
    }
  };

  const handleReportButtonPress = (value, isVisible) => {
    setIsReportVisible(isVisible);
    if (value !== 'cancel') {
      setReportValue(value);
    }
  };

  const handleClear = async (useDeleteAllType) => {
    LogUtil.info('handleClear useDeleteAllType, room._id', [useDeleteAllType, room._id]);

    await ChatHttpUtil.requestClearMessageOfRoom(room, useDeleteAllType);
    await ChatSocketUtil.instance.easy.getMessagesOfRoom('refreshRoom', room._id, { resetPage: true });

    LogUtil.info('handleClear goBack!!!');
    navigation.goBack();
    navigation.goBack();
  };

  const handleLeave = async () => {
    const room_ids = [room._id];
    await ChatHttpUtil.requestLeaveRoom(room_ids);
    delete chatStatus.messageDocsByRoomId[room._id];
    chatStatus.rooms!.archivedRooms = chatStatus.rooms!.archivedRooms.filter((localRoom) => localRoom._id !== room._id);
    chatStatus.rooms!.unArchivedRooms = chatStatus.rooms!.unArchivedRooms.filter(
      (localRoom) => localRoom._id !== room._id,
    );
    forceUpdateForChatStatus();

    navigation.goBack();
    navigation.goBack();
    setIsLeaveVisible(false);
  };

  const handleReport = async (useBlockUserAndDeleteAllConversation) => {
    await ChatHttpUtil.requestReportRoom(room, useBlockUserAndDeleteAllConversation, reportValue);
    setReportValue('');
    navigation.goBack();
    navigation.goBack();

    Toast.show({
      type: 'success',
      text1: t('chat-info.Reported'),
      text2: t('chat-info.Reported2'),
    });
  };

  const onPressKokkok = () => {
    if (type === 'chat') {
      // @ts-ignore
      navigation.navigate('/kokkokme/user-timeline/:id', {
        id: targetUser?.id,
        uid: targetUser.uid,
        contact: targetUser?.contact,
      });
    }
    if (type === 'me') {
      // @ts-ignore
      navigation.navigate('/kokkokme/user-timeline/:id', { id: myUser?.id, uid: myUser.uid, contact: myUser?.contact });
    }
  };

  return (
    <>
      <MainLayout>
        {type !== 'group' ? (
          <PrevHeader
            border={false}
            button={[
              <TouchableOpacity key={0} onPress={onPressKokkok}>
                <IcKok width={24} height={24} />
              </TouchableOpacity>,
            ]}
          />
        ) : (
          <PrevHeader border={false} />
        )}
        <ScrollView style={{ flex: 1 }}>
          {type !== 'group' && (
            <UserInfo>
              <ProfileContainer onOpen={() => setIsLightboxOpen(true)} willClose={() => setIsLightboxOpen(false)}>
                <ProfileImage
                  open={isLightboxOpen}
                  //@ts-ignore
                  source={profileImage}
                />
              </ProfileContainer>
              {type === 'chat' ? (
                <>
                  <Name fontSize={myUser?.setting.ct_text_size as number}>
                    {isDeletedUser
                      ? 'Deleted Account'
                      : `${targetUser?.first_name ?? ''} ${targetUser?.last_name ?? ''}`}
                  </Name>
                  <ID style={{ fontSize: myUser?.setting.ct_text_size as number }}>@{targetUser?.uid}</ID>
                  {lastAt !== '' && (
                    <LastSeen style={{ fontSize: myUser?.setting.ct_text_size as number }}>{lastAt}</LastSeen>
                  )}
                </>
              ) : (
                <View style={{ marginBottom: 27, alignItems: 'center' }}>
                  <Name fontSize={myUser?.setting.ct_text_size as number}>
                    {myUser?.first_name ?? ''} {myUser?.last_name ?? ''}
                  </Name>
                  <ID style={{ fontSize: myUser?.setting.ct_text_size as number }}>@{myUser?.uid}</ID>
                </View>
              )}
            </UserInfo>
          )}
          <ChatRoomDetailButtonNav
            type={type}
            setIsVisible={setIsMoreVisible}
            room={room}
            profileUserSetting={profileUserSetting}
          />
          <ChatRoomDetailMenuNav type={type} setIsVisible={setIsReportVisible} room={room} />
          {type === 'group' && <MemberList room={room} user_id={myUserId} />}
        </ScrollView>
        <Options
          menu={moreMenu}
          modalVisible={isMoreVisible}
          onMenuPress={handleMoreButtonPress}
          // dark={themeContext.dark}
        />
        <Options
          menuTitle={t('kokkokme-main.Please select a reason for reporting')}
          menu={reportMenu}
          modalVisible={isReportVisible}
          onMenuPress={handleReportButtonPress}
          // dark={themeContext.dark}
        />
        <DeleteModal isVisible={isClearVisible} setIsVisible={setIsClearVisible} handleClear={handleClear} />
        <LeaveModal
          isVisible={isLeaveVisible}
          setIsVisible={setIsLeaveVisible}
          handleLeave={handleLeave}
          admin_id={room?.admin_id}
          user_id={myUserId}
          isGroup={type === 'group'}
        />
        <ReportModal
          type={type}
          reportValue={reportValue}
          setReportValue={setReportValue}
          handleReport={handleReport}
        />
        <ExportModal isVisible={isExportVisible} setIsVisible={setIsExportVisible} selectedRoomId={[room._id]} />
      </MainLayout>
      <Toast config={ToastConfig} />
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    // ...StyleSheet.absoluteFillObject,
  },
});

export default ChatRoomDetail;
