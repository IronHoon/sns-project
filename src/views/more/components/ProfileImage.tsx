import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  ImageBackground,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import styled from 'styled-components';

import { COLOR } from 'constants/COLOR';
import { Avatar } from 'components/atoms/image';

import Camera from 'assets/images/profile-edit/ic-camera.svg';
import User from '../../../types/auth/User';
import { ImageLibraryOptions, launchImageLibrary } from 'react-native-image-picker';
import { uploadS3ByImagePicker, uploadS3ByImageCropPicker } from 'lib/uploadS3';
import { Menu, MenuItem } from 'react-native-material-menu';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PermissionUtil from 'utils/PermissionUtil';
import { PERMISSIONS, RESULTS } from 'react-native-permissions';
import { t } from 'i18next';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '../../../navigations/MainNavigator';
import LogUtil from '../../../utils/LogUtil';
import ImagePicker, { ImageOrVideo } from 'react-native-image-crop-picker';

interface ImgButtonProps {
  bottom?: number;
  left?: number;
}

const Container = styled(ImageBackground)`
  align-items: center;
  background: ${COLOR.LIGHT_GRAY};
  display: flex;
  height: 188px;
  padding-top: 30px;
`;
const ContainerView = styled(View)`
  align-items: center;
  background: ${COLOR.LIGHT_GRAY};
  display: flex;
  height: 188px;
  padding-top: 30px;
`;
const AvatarContainer = styled(View)`
  height: 100px;
  position: relative;
  width: 100px;
`;

const ImgButton = styled(TouchableOpacity)<ImgButtonProps>`
  height: 32px;
  bottom: ${({ bottom }) => bottom || 0}px;
  position: absolute;
  right: 0;
  width: 32px;

  ${({ left }) => (typeof left === 'number' ? `left: ${left}px` : '')}
`;

const styles = StyleSheet.create({
  boxShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
});

interface ProfileImageProps {
  draft: User | undefined;
  update: (field: string, value: any) => void;
}

const ProfileImage = ({ draft, update }: ProfileImageProps) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [selectedPhotoType, setSelectedPhotoType] = useState<'profile_image' | 'profile_background'>('profile_image');
  const [locationX, setLocationX] = useState(0);
  const [locationY, setLocationY] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<MainNavigationProp>();

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);

  const setLocation = (x, y, lx) => {
    if (x + 200 > Dimensions.get('window').width) {
      setLocationX(x - 200);
      setLocationY(y);
    } else {
      setLocationX(x);
      setLocationY(y);
    }
  };

  const choosePhoto = async () => {
    //접근 권한 허용 확인
    const grants = await PermissionUtil.requestMultiplePermissions([
      Platform.OS === 'ios' ? PERMISSIONS.IOS.MEDIA_LIBRARY : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    ]);
    const isGrantList = Object.values(grants).filter(
      (isGrant) => !(isGrant === RESULTS.DENIED || isGrant === RESULTS.BLOCKED),
    );
    //접근 권한 허용 확인 후 허용이 안되있을 경우 앱셋팅 열기
    if (isGrantList.length === 2) {
      navigation.navigate('/chats/chat-room/gallery', {
        update: update,
        selectedPhotoType: selectedPhotoType,
      });
      // let options: ImageLibraryOptions;
      // if (selectedPhotoType === 'profile_image') {
      //   options = {
      //     quality: 0.8,
      //     selectionLimit: 1,
      //     mediaType: 'photo',
      //     includeExtra: true,
      //   };
      // } else {
      //   options = {
      //     maxHeight: 1200,
      //     maxWidth: 1200,
      //     quality: 0.8,
      //     selectionLimit: 1,
      //     mediaType: 'photo',
      //     includeExtra: true,
      //   };
      // }
      // const file = await launchImageLibrary(options)
      // const mediaRes = await uploadS3ByImagePicker(file);
      // if (mediaRes) {
      //   const { url: path } = mediaRes;
      //   update(selectedPhotoType, path);
      // }
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

    hideMenu();
  };

  const removePhoto = () => {
    update(selectedPhotoType, null);
    hideMenu();
  };

  return (
    <GestureHandlerRootView
      onTouchStart={(e) => {
        if (!visible) {
          setLocation(e.nativeEvent.pageX, e.nativeEvent.pageY, e.nativeEvent.locationX);
        }
      }}
    >
      <Menu
        style={{ position: 'absolute', top: locationY, left: locationX }}
        visible={visible}
        onRequestClose={hideMenu}
        anchor={
          draft?.profile_background ? (
            <Container source={{ uri: draft?.profile_background + '?w=1280&h=1280' || undefined }} resizeMode="cover">
              <AvatarContainer>
                <Avatar size={100} src={draft?.profile_image} />
                <ImgButton
                  bottom={12}
                  style={styles.boxShadow}
                  onPress={async () => {
                    setSelectedPhotoType('profile_image');
                    showMenu();
                  }}
                >
                  <Camera />
                </ImgButton>
              </AvatarContainer>
              <ImgButton
                bottom={25}
                left={0}
                style={styles.boxShadow}
                onPress={async () => {
                  setSelectedPhotoType('profile_background');
                  showMenu();
                }}
              >
                <Camera />
              </ImgButton>
            </Container>
          ) : (
            <ContainerView>
              <AvatarContainer>
                <Avatar size={100} src={draft?.profile_image} />
                <ImgButton
                  bottom={12}
                  style={styles.boxShadow}
                  onPress={async () => {
                    setSelectedPhotoType('profile_image');
                    showMenu();
                  }}
                >
                  <Camera />
                </ImgButton>
              </AvatarContainer>
              <ImgButton
                bottom={25}
                left={0}
                style={styles.boxShadow}
                onPress={async () => {
                  setSelectedPhotoType('profile_background');
                  showMenu();
                }}
              >
                <Camera />
              </ImgButton>
            </ContainerView>
          )
        }
      >
        <MenuItem
          style={{ height: 50, width: 200 }}
          textStyle={{ color: COLOR.BLACK }}
          onPress={() => choosePhoto()}
          pressColor={'#fcf2e8'}
        >
          Choose from photo
        </MenuItem>
        <MenuItem
          style={{ height: 50, width: 200 }}
          textStyle={{ color: COLOR.BLACK }}
          onPress={async () => {
            if (!isLoading) {
              PermissionUtil.checkPermission(
                Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
              ).then((res) => {
                if (res !== 'granted') {
                  Alert.alert('', 'You need to allow access to camera.', [
                    {
                      text: 'Cancel',
                      onPress: async () => {},
                    },
                    {
                      text: 'Go to settings',
                      onPress: async () => {
                        Platform.OS === 'ios' ? await Linking.openURL('app-settings:') : await Linking.openSettings();
                      },
                    },
                  ]);
                } else {
                  ImagePicker.openCamera({
                    multiple: true,
                    cropping: true,
                    maxFiles: 30,
                    width: 1200,
                    height: 1200,
                    showCropFrame: true,
                    compressImageQuality: 1,
                  })
                    .then(async (images) => {
                      console.log(images);
                      setIsLoading(true);
                      //@ts-ignore
                      const mediaRes = await uploadS3ByImageCropPicker(images.path, images.mime);
                      console.log('mediaRes', mediaRes);
                      //@ts-ignore
                      update(selectedPhotoType, mediaRes?.url);
                      hideMenu();
                      setIsLoading(false);
                    })
                    .then(() => {
                      ImagePicker.clean()
                        .then(() => {
                          console.log('removed all tmp images from tmp directory');
                        })
                        .catch((e) => {
                          Alert.alert(e);
                        });
                    });
                }
              });
            } else {
              Alert.alert('Notice', 'Please wait for the Images Loading');
            }
          }}
          pressColor={'#fcf2e8'}
        >
          {t('new-post.Take Photo')}
        </MenuItem>
        {(selectedPhotoType === 'profile_image' ? draft?.profile_image : draft?.profile_background) && (
          <MenuItem
            style={{ height: 50, width: 200 }}
            textStyle={{ color: COLOR.BLACK }}
            onPress={() => removePhoto()}
            pressColor={'#fcf2e8'}
          >
            Remove photo
          </MenuItem>
        )}
      </Menu>
    </GestureHandlerRootView>
  );
};

export default ProfileImage;
