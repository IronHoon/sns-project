import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import Gallery from 'assets/chats/chatroom/ic-gallery.svg';
import Camera from 'assets/chats/chatroom/ic-camera.svg';
import Document from 'assets/chats/chatroom/ic-documnet.svg';
import Location from 'assets/chats/chatroom/ic-location.svg';
import Contact from 'assets/chats/chatroom/ic-contact.svg';
import ContactW from 'assets/chats/chatroom/ic-contact-white.svg';
import Scanner from 'assets/chats/chatroom/ic-scanner.svg';
import { Column } from 'components/layouts/Column';
import { Row } from 'components/layouts/Row';
import { Alert, AppState, Linking, Platform, View } from 'react-native';
import { ImageLibraryOptions, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import {
  multiUploadS3ByDocumentPicker,
  multiUploadS3ByFilePath,
  multiUploadS3ByImagePicker,
  uploadS3ByFilePath,
} from 'lib/uploadS3';
import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import ChatDataUtil from 'utils/chats/ChatDataUtil';
import LogUtil from 'utils/LogUtil';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import contactsAtom from 'stores/contactsAtom';
import { selectContact, selectContactPhone } from 'react-native-select-contact';
import { EventRegister } from 'react-native-event-listeners';
import { DocumentScannerCallback } from 'pages/chats/message-type/KokkokDocumentScannerPage';
import { SearchMapCallback } from './message-type/SearchMap';
import PermissionUtil from 'utils/PermissionUtil';
import { PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useTranslation } from 'react-i18next';
import { createThumbnail } from 'react-native-create-thumbnail';
import { KokKokGalleryPageCallback } from 'pages/chats/message-type/KokKokGalleryPage';
import Toast from 'react-native-toast-message';
import Modal from 'react-native-modal';
import { Options } from '../../kokkokme/components/user-timeline/UserInfo';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import AsyncStorage from '@react-native-community/async-storage';
import { useAtom } from 'jotai';
import { useSetAtom } from 'jotai';
import activityAtom from '../../../stores/activityAtom';
import { t } from 'i18next';

const MenuContainer = styled.View`
  height: 187px;
  flex-direction: row;
  justify-content: center;
  border-top-width: 1px;
  border-top-color: ${COLOR.GRAY};
  background-color: ${({ theme }) => (theme.dark ? '#30302E' : '#ffffff')};
`;
const MenuButton = styled.Pressable`
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: center;
  width: 90px;
`;
const MenuLabel = styled.Text`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: 13px;
  margin-top: 5px;
`;

const MENU = [
  {
    value: 'profile',
    label: `${t('chatting.Share KokKok Profile')}`,
  },
  {
    value: 'contacts',
    label: `${t('chatting.Share Contact')}`,
  },
  {
    value: 'cancel',
    label: `${t('chatting.Cancel')}`,
  },
];

const CAMERA = [
  {
    value: 'photo',
    label: `${t('chatting.Take a photo')}`,
  },
  {
    value: 'video',
    label: `${t('chatting.Take a video')}`,
  },
  {
    value: 'cancel',
    label: `${t('chatting.Cancel')}`,
  },
];

function PlusMenu({ dark, onSend, roomState }) {
  const { t } = useTranslation();
  const navigation = useNavigation<MainNavigationProp>();
  const options: ImageLibraryOptions = {
    selectionLimit: 10,
    mediaType: 'mixed',
    includeExtra: true,
  };

  const setActivity = useSetAtom(activityAtom);

  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleCamera, setIsVisibleCamera] = useState(false);

  const showUploadToastSuccess = () => {
    Toast.show({
      type: 'success',
      text1: t('chats-main.upload was successful'),
      props: { disableBackButton: true },
    });
  };
  const showUploadToastFail = () => {
    Toast.show({
      type: 'error',
      text1: t('chats-main.failed to upload'),
    });
  };

  const handleUpload = useCallback(
    async (imagePickerResponse) => {
      LogUtil.info('ImagePickerResponse', imagePickerResponse);
      try {
        const mediaResList = await multiUploadS3ByImagePicker(imagePickerResponse);
        if (mediaResList.length <= 0) {
          showUploadToastFail();
          return;
        }

        const imageResList = mediaResList.filter((mediaRes) => mediaRes.type.toLowerCase().includes('image'));
        if (imageResList.length > 0) {
          onSend([
            ChatDataUtil.newMessage({
              type: 'image',
              text: `[${t('chats-main.Image')}]`,
              uploadPathList: imageResList.map((mediaRes) => mediaRes.url),
              uploadSizeList: imageResList.map((mediaRes) => mediaRes.size ?? 0),
            }),
          ]);
        }

        const videoResList = mediaResList.filter((mediaRes) => mediaRes.type.toLowerCase().includes('video'));
        if (videoResList.length > 0) {
          for (const videoRes of videoResList) {
            const imageResponse = await createThumbnail({
              url: videoRes.url,
              timeStamp: 10000,
            });

            // LogUtil.error('[PlusMenu handleUpload] step 1 ', imageResponse);
            const thumbnailRes = await uploadS3ByFilePath(imageResponse.path, imageResponse.mime);
            if (!thumbnailRes) {
              LogUtil.info('[PlusMenu handleUpload] thumbnailRes is null');
              continue;
            }

            // LogUtil.error('[PlusMenu handleUpload] step 2');
            onSend([
              ChatDataUtil.newMessage({
                type: 'video',
                text: `[${t('chats-main.Video')}]`,
                uploadPathList: [videoRes.url, thumbnailRes?.url],
                uploadSizeList: [videoRes.size ?? 0, imageResponse?.size ?? 0],
              }),
            ]);
          }
        }

        showUploadToastSuccess();
      } catch (error) {
        LogUtil.error('[PlusMenu handleUpload] error', error);
        showUploadToastFail();
      }
    },
    [onSend],
  );

  const openGalleryFunction = async () => {
    const grants = await PermissionUtil.requestMultiplePermissions([
      Platform.OS === 'ios' ? PERMISSIONS.IOS.MEDIA_LIBRARY : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ]);
    const isGrantList = Object.values(grants).filter(
      (isGrant) => !(isGrant === RESULTS.DENIED || isGrant === RESULTS.BLOCKED),
    );
    if (isGrantList.length === 2) {
      // launchImageLibrary(options).then(handleUpload);
      navigation.navigate('/chats/chat-room/gallery', {
        callback: new KokKokGalleryPageCallback((fileList) => {
          multiUploadS3ByFilePath(fileList)
            .then(async (mediaResList) => {
              if (mediaResList.length <= 0) {
                showUploadToastFail();
                return;
              }

              const imageResList = mediaResList.filter((mediaRes) => mediaRes.type.toLowerCase().includes('image'));
              if (imageResList.length > 0) {
                onSend([
                  ChatDataUtil.newMessage({
                    type: 'image',
                    text: `[${t('chats-main.Image')}]`,
                    uploadPathList: imageResList.map((mediaRes) => mediaRes.url),
                    uploadSizeList: imageResList.map((mediaRes) => mediaRes.size ?? 0),
                  }),
                ]);
              }

              const videoResList = mediaResList.filter((mediaRes) => mediaRes.type.toLowerCase().includes('video'));
              if (videoResList.length > 0) {
                for (const videoRes of videoResList) {
                  const imageResponse = await createThumbnail({
                    url: videoRes.url,
                    timeStamp: 10000,
                  });

                  const thumbnailRes = await uploadS3ByFilePath(imageResponse.path, imageResponse.mime);
                  if (!thumbnailRes) {
                    LogUtil.info('[openGalleryFunction] thumbnailRes is null');
                    continue;
                  }

                  onSend([
                    ChatDataUtil.newMessage({
                      type: 'video',
                      text: `[${t('chats-main.Video')}]`,
                      uploadPathList: [videoRes.url, thumbnailRes?.url],
                      uploadSizeList: [videoRes.size ?? 0, imageResponse?.size ?? 0],
                    }),
                  ]);
                }
              }

              showUploadToastSuccess();
            })
            .catch((error) => {
              LogUtil.error('openGalleryFunction multiUploadS3ByFilePath error', error);
              showUploadToastFail();
            });
        }),
      });
    } else {
      Alert.alert('', t('common.NotFoundPermission'), [
        {
          text: 'Allow Access',
          onPress: async () => {
            Platform.OS === 'ios' ? await Linking.openURL('app-settings:') : await Linking.openSettings();
          },
        },
      ]);
    }
  };

  const openCameraFunction = async (value) => {
    // await handleAuthFalse()

    const status = await PermissionUtil.requestPermission(
      Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
    );
    const isGranted = status === RESULTS.GRANTED;
    if (isGranted) {
      launchCamera({
        mediaType: value,
        includeExtra: true,
      }).then((result) => {
        console.log('cameraResult', result);
        !result.didCancel && handleUpload(result);
        setIsVisibleCamera(false);
      });
    } else {
      Alert.alert('', t('common.NotFoundPermission'));
    }
  };

  const openDocumentFunction = () => {
    // here
    DocumentPicker.pickMultiple().then((resList: DocumentPickerResponse[]) => {
      multiUploadS3ByDocumentPicker(resList).then((mediaResList) => {
        if (mediaResList.length <= 0) {
          showUploadToastFail();
          return;
        }
        for (const mediaRes of mediaResList) {
          onSend([
            ChatDataUtil.newMessage({
              type: 'file',
              text: mediaRes.name,
              uploadPathList: [mediaRes.url],
              uploadSizeList: [mediaRes.size ?? 0],
            }),
          ]);
        }

        showUploadToastSuccess();
      });
    });
  };

  const handleMenuPress = async (value?: string) => {
    LogUtil.info('Menu value', value);
    if (value === 'profile') {
      console.log('profile console');
      setIsVisible(false);
      navigation.navigate('/chats/chat-room/share-chat', {
        chatRoomType: 'chat',
        room: roomState,
        contact: true,
        chatList: [],
      });
    } else if (value === 'contacts') {
      console.log('contacts console');
      await setActivity(true);
      await openContactFunction();
      setIsVisible(false);
    } else if (value === 'cancel') {
      setIsVisible(false);
      setIsVisibleCamera(false);
    } else if (value === 'photo') {
      setActivity(true);
      await openCameraFunction(value);
    } else if (value === 'video') {
      setActivity(true);
      await openCameraFunction(value);
    }
  };

  const openContactFunction = async () => {
    const grantObject = await PermissionUtil.requestMultiplePermissions(
      Platform.OS === 'ios'
        ? [PERMISSIONS.IOS.CONTACTS]
        : [PERMISSIONS.ANDROID.WRITE_CONTACTS, PERMISSIONS.ANDROID.READ_CONTACTS],
    );
    const grants = Object.values(grantObject);

    const isGranted = grants.every((grant) => grant === RESULTS.GRANTED);
    if (isGranted) {
      console.log('selectcontact');
      try {
        const res = await selectContact();
        if (res?.name && res.phones?.[0].number) {
          onSend([
            ChatDataUtil.newMessage({
              type: 'contact',
              text: `[${t('chats-main.Contact')}]`,
              contactName: res.name,
              contactNumber: res.phones?.[0].number,
            }),
          ]);
        }
      } catch (e) {
        console.log('error', e);
      }
    } else {
      Alert.alert('', t('common.NotFoundPermission'));
    }
  };

  const openLocationFunction = () => {
    navigation.navigate('/chats/chat-room/search-map', {
      callback: new SearchMapCallback(({ formattedAddress, region, filePath }) => {
        uploadS3ByFilePath(filePath).then((mediaRes) => {
          if (mediaRes) {
            onSend([
              ChatDataUtil.newMessage({
                type: 'location',
                text: `[${t('chats-main.Location')}]`,
                formattedAddress: formattedAddress,
                latitude: region.latitude,
                longitude: region.longitude,
                uploadPathList: [mediaRes.url],
                uploadSizeList: [mediaRes.size ?? 0],
              }),
            ]);
          }
        });
      }),
    });
  };

  const openScannerFunction = () => {
    navigation.navigate('/chats/chat-room/document-scanner', {
      callback: new DocumentScannerCallback((scannedImage) => {
        uploadS3ByFilePath(scannedImage)
          .then(async (mediaRes) => {
            if (mediaRes) {
              onSend([
                ChatDataUtil.newMessage({
                  type: 'image',
                  text: `[${t('chats-main.Image')}]`,
                  uploadPathList: [mediaRes.url],
                  uploadSizeList: [mediaRes.size ?? 0],
                }),
              ]);
              showUploadToastSuccess();
            } else {
              LogUtil.info('openScannerFunction uploadS3ByFilePath mediaRes is empty');
              showUploadToastFail();
            }
          })
          .catch((error) => {
            LogUtil.error('openScannerFunction uploadS3ByFilePath error', error);
            showUploadToastFail();
          });
        LogUtil.info('document-scanner-callback scannedImage', [scannedImage]);
      }),
    });
  };

  return (
    <MenuContainer>
      <Column>
        <Row>
          <MenuButton onPress={openGalleryFunction}>
            <Gallery width={35} height={35} />
            <MenuLabel>Gallery</MenuLabel>
          </MenuButton>
          <MenuButton
            onPress={async () => {
              // await setActivity(true);
              // await openCameraFunction();
              setIsVisibleCamera(true);
            }}
          >
            <Camera width={35} height={35} />
            <MenuLabel>Camera</MenuLabel>
          </MenuButton>
          <MenuButton
            onPress={async () => {
              await setActivity(true);
              await openDocumentFunction();
            }}
          >
            <Document width={35} height={35} />
            <MenuLabel>Document</MenuLabel>
          </MenuButton>
          <MenuButton onPress={openLocationFunction}>
            <Location width={35} height={35} />
            <MenuLabel>Location</MenuLabel>
          </MenuButton>
        </Row>
        <Row>
          <MenuButton onPress={() => setIsVisible(true)}>
            {dark ? <ContactW width={35} height={35} /> : <Contact width={35} height={35} />}
            <MenuLabel>Contact</MenuLabel>
          </MenuButton>
          <MenuButton
            onPress={async () => {
              await setActivity(true);
              await openScannerFunction();
            }}
          >
            <Scanner width={35} height={35} />
            <MenuLabel>Scanner</MenuLabel>
          </MenuButton>
        </Row>
      </Column>
      <Options
        menu={MENU}
        modalVisible={isVisible}
        onBackdropPress={() => {
          setIsVisible(false);
        }}
        onMenuPress={async (value) => {
          await handleMenuPress(value);
        }}
        onPress={() => {}}
        border={true}
      />
      <Options
        menu={CAMERA}
        modalVisible={isVisibleCamera}
        onBackdropPress={() => {
          setIsVisibleCamera(false);
        }}
        onMenuPress={async (value) => {
          await handleMenuPress(value);
        }}
        onPress={() => {}}
        border={true}
      />
    </MenuContainer>
  );
}

export default PlusMenu;
