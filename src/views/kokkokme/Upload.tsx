import { t } from 'i18next';
import { useAtom } from 'jotai';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  TextInput,
  View,
  Text,
  Image,
  Platform,
  Pressable,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  Linking,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { launchCamera, launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import styled, { ThemeContext } from 'styled-components';

import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import { Avatar } from 'components/atoms/image';
import { Column } from 'components/layouts/Column';
import { Row } from 'components/layouts/Row';
import { ModalBase, ModalText } from 'components/modal';
import Space from 'components/utils/Space';
import BackHeader from 'components/molecules/BackHeader';
import { COLOR } from 'constants/COLOR';
import { multiUploadS3ByImagePicker, uploadS3ByImageCropPicker } from 'lib/uploadS3';
import { MainNavigationProp } from 'navigations/MainNavigator';
import userAtom from 'stores/userAtom';
import Location from 'types/socials/posts/Location';
import Region from 'types/socials/posts/Region';
import { uploadPost } from 'utils';
import MapPreview from 'views/kokkokme/components/timeline/MapPreview';

import Cancel from 'assets/images/icon/ic-close.svg';
import CameraIcon from 'assets/kokkokme/new-post/ic-camera.svg';
import CameraIconWhite from 'assets/kokkokme/ic-camera-white.svg';
import Close from 'assets/kokkokme/new-post/ic_close.svg';
import LocationIcon from 'assets/kokkokme/new-post/ic_location.svg';
import ImagePicker, { ImageOrVideo } from 'react-native-image-crop-picker';
import PermissionUtil from 'utils/PermissionUtil';
import { PERMISSIONS, RESULTS } from 'react-native-permissions';
import permissionUtil from 'utils/PermissionUtil';
import LogUtil from '../../utils/LogUtil';
import Video from 'react-native-video';
import ICLocationBlack from '/assets/ic-location-gray.svg';
import User from '../../types/auth/User';
import { WIDTH } from 'constants/WIDTH';

const CloseIcon = styled(Close)`
  cursor: pointer;
  margin-left: 5px;
`;

const Address = styled(Text)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

const Name = styled(Text)`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 5px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

const Icon = styled(Image)`
  width: 22px;
  height: 22px;
  tint-color: ${(props) => (props.theme.dark ? '#ffffff' : COLOR.DARK_GRAY)};
`;

const CancelIcon = styled(Cancel)`
  cursor: pointer;
  position: absolute;
  right: 0;
  top: -53px;
`;
const Input = styled(TextInput)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  padding-right: 10px;
  width: 100%;
  height: 100%;
`;
const TagButtonWrap = styled(View)`
  border-color: #bbbbbb;
  border-radius: 100px;
  border-width: 1px;
  justify-content: center;
  align-items: center;
  min-height: 22px;
  padding-left: 5px;
  padding-right: 5px;
`;

const MapContainer = styled(View)`
  flex: 1;
  align-items: center;
  justify-content: center;
`;
const TagNameWrap = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${COLOR.GRAY};
  min-height: 22px;
  border-radius: 15px;
  padding-left: 8px;
  padding-right: 8px;
  margin-left: 10px;
  margin-bottom: 6px;
`;

const CameraButtonWrap = styled(View)`
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border-width: 1px;
  border-color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const ImageboxWrap = styled(View)`
  width: 57px;
  height: 57px;
  justify-content: center;
`;
const Imagebox = styled(View)`
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
`;
const SelectedImage = styled(Image)`
  width: 100%;
  height: 100%;
`;
const TextInputWrap = styled(View)`
  flex: 1;
  width: 100%;
  padding: 20px;
`;
const Button_ = styled(View)`
  padding: 20px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;
const ModalTitle = styled(Text)`
  font-size: 15px;
  color: black;
  padding: 10px;
  font-weight: bold;
`;
const CancelButton = styled(TouchableOpacity)`
  background-color: #fff;
  width: 200px;
  height: 55px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: #ccc;
`;
const CancelLabel = styled(Text)`
  color: #ccc;
  font-size: 15px;
  font-weight: bold;
`;
const ConfirmButton = styled(TouchableOpacity)`
  background-color: ${COLOR.PRIMARY};
  width: 200px;
  height: 55px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${COLOR.PRIMARY};
  margin-bottom: 10px;
`;
const ConfirmLabel = styled(Text)`
  color: #fff;
  font-size: 15px;
  font-weight: bold;
`;
const ButtonWrap = styled(View)`
  padding-top: 10px;
  width: 300px;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Upload = () => {
  const options: ImageLibraryOptions = {
    maxHeight: 1200,
    maxWidth: 1200,
    quality: 0.8,
    selectionLimit: 30,
    videoQuality: 'high',
    mediaType: 'mixed',
  };
  const [user] = useAtom(userAtom);
  const navigation = useNavigation<MainNavigationProp>();

  const [value, setValue] = useState('');
  const [image, setImage] = useState<Array<any>>([]);
  const [isTagLocation, setIsTagLocation] = useState(false);
  const [tagUsers, setTagUsers] = useState<Array<any>>([]);
  const [isVisible, setIsVisible] = useState<boolean>();
  const [isVisibleLeave, setIsVisibleLeave] = useState<boolean>();
  const [isVisibleLeaveModal, setIsVisibleLeaveModal] = useState<boolean>(false);
  const theme = useContext(ThemeContext);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [region, setRegion] = useState<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const onChange = (event) => {
    setValue(event.nativeEvent.text);
  };

  const onSuccessReq = () => {
    setValue('');
    navigation.goBack();
  };

  useFocusEffect(
    useCallback(() => {
      console.log(region);
      console.log(address);
      setRegion(region);
    }, [region]),
  );

  useEffect(() => {
    setIsVisibleLeaveModal(true);
  }, [value, image, isTagLocation, tagUsers, address]);

  return (
    <>
      <BackHeader
        title={t('new-post.New Post')}
        onClick={() => {
          if (tagUsers.length > 0 || image.length > 0 || isTagLocation || value) {
            setIsVisibleLeave(true);
          } else {
            navigation.goBack();
          }
        }}
        button={[
          <Button
            key={0}
            fontSize={14}
            height={17}
            label={t('new-post.Write')}
            textvariant={ButtonTextVariant.Text}
            variant={ButtonVariant.TextBtn}
            onPress={() => {
              if (isLoading) {
                Alert.alert('Notice', 'Please wait for the Images loading');
              } else {
                if (!uploading) {
                  setUploading(true);
                  uploadPost(
                    value,
                    image,
                    isTagLocation ? region.latitude : 0,
                    isTagLocation ? region.longitude : 0,
                    tagUsers.length >= 1 ? tagUsers.map((item) => item.id) : [],
                    isTagLocation ? address : '',
                    onSuccessReq,
                  );
                }
              }
            }}
          />,
        ]}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView>
            <Column style={{ flex: 1 }}>
              <Row
                style={{
                  flex: 1,
                  width: '100%',
                  paddingVertical: 25,
                  paddingHorizontal: 20,
                  borderBottomColor: '#eeeeee',
                  borderBottomWidth: 1,
                }}
              >
                <Avatar size={40} src={user?.profile_image || undefined} />
                <Space width={20} />
                <Column style={{ flex: 1 }}>
                  <Name style={{ fontSize: user?.setting?.ct_text_size as number }}>
                    {user?.first_name} {user?.last_name}
                  </Name>
                  <View style={{ flexDirection: 'row', flex: 1 }}>
                    <Pressable
                      onTouchStart={() => {
                        navigation.navigate('/kokkokme/kokkokme-post/tag-users', {
                          tagUsers: tagUsers,
                          setTagedUsers: setTagUsers,
                        });
                      }}
                    >
                      <TagButtonWrap>
                        <Text style={{ fontSize: 12, lineHeight: 14, color: '#bbbbbb' }}>
                          + {t('new-post.Tag Friends')}
                        </Text>
                      </TagButtonWrap>
                    </Pressable>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {tagUsers.map((item, index) => (
                        <Pressable
                          key={item.uid}
                          onPress={() => {
                            console.log('tag item', item.uid);
                            setTagUsers(tagUsers.filter((x) => x !== item));
                          }}
                        >
                          <TagNameWrap key={item.id}>
                            <Text style={{ fontSize: user?.setting?.ct_text_size as number, color: COLOR.BLACK }}>
                              {item.first_name} {item.last_name}
                            </Text>
                            <CloseIcon width={14} height={14} />
                          </TagNameWrap>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </Column>
              </Row>
              <Row
                style={{
                  paddingVertical: 25,
                  paddingHorizontal: 20,
                  borderBottomColor: '#eeeeee',
                  borderBottomWidth: 1,
                }}
              >
                <Pressable onPress={() => setIsVisible(true)}>
                  <ImageboxWrap>
                    <CameraButtonWrap>
                      {theme.dark ? <CameraIconWhite /> : <CameraIcon />}
                      <Text
                        style={{
                          fontSize: 11,
                          color: theme.dark ? COLOR.WHITE : COLOR.BLACK,
                          marginTop: 5,
                        }}
                      >
                        {image.length > 0 ? image.length : 0}/30
                      </Text>
                    </CameraButtonWrap>
                  </ImageboxWrap>
                </Pressable>
                {isLoading ? (
                  <View style={{ height: 57, justifyContent: 'center', marginLeft: 10 }}>
                    <ActivityIndicator size="small" color={COLOR.TEXT_GRAY} />
                  </View>
                ) : (
                  <></>
                )}
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                  {image.length !== 0 && (
                    <View style={tw`flex-row`}>
                      {image.map((file, index) => {
                        if (file.type.includes('image')) {
                          return (
                            <View key={file.url ?? index.toString()} style={{ marginLeft: 10 }}>
                              <ImageboxWrap>
                                <Pressable
                                  onPress={() => {
                                    navigation.navigate('/chats/chat-room/gallery/edit', {
                                      checkedFileItem: image,
                                      setImage: setImage,
                                      edit: true,
                                      setIsLoading: setIsLoading,
                                    });
                                  }}
                                >
                                  <Imagebox>
                                    <SelectedImage source={{ uri: file.url }} />
                                  </Imagebox>
                                </Pressable>
                                <Pressable
                                  onPress={() => {
                                    setImage(image.filter((fileName) => fileName.url !== file.url));
                                  }}
                                >
                                  <CancelIcon />
                                </Pressable>
                              </ImageboxWrap>
                            </View>
                          );
                        } else if (file.type.includes('video')) {
                          LogUtil.info('video', file);
                          return (
                            <Pressable
                              style={{ marginLeft: 10 }}
                              onPress={() => {
                                setImage(image.filter((fileName) => fileName.url !== file.url));
                              }}
                            >
                              <ImageboxWrap>
                                <Video
                                  repeat={true}
                                  muted={true}
                                  source={{ uri: file.url }}
                                  style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: 'black' }}
                                />
                                <CancelIcon />
                              </ImageboxWrap>
                            </Pressable>
                          );
                        }
                      })}
                    </View>
                  )}
                </ScrollView>
              </Row>
              <View style={{ height: 55, borderBottomColor: '#ededed', borderBottomWidth: 1, width: '100%' }}>
                <Pressable
                  onPress={async () => {
                    permissionUtil
                      .checkPermission(
                        Platform.OS === 'ios'
                          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
                          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
                      )
                      .then((res) => {
                        if (res !== 'granted') {
                          Alert.alert('', 'You need to allow access to Location.', [
                            {
                              text: 'Cancel',
                              onPress: async () => {},
                            },
                            {
                              text: 'Go to settings',
                              onPress: async () => {
                                Platform.OS === 'ios'
                                  ? await Linking.openURL('app-settings:')
                                  : await Linking.openSettings();
                              },
                            },
                          ]);
                        } else {
                          navigation.navigate('/kokkokme/kokkokme-post/location', {
                            //@ts-ignore
                            setRegion: setRegion,
                            region: region,
                            //@ts-ignore
                            setIsTagLocation: setIsTagLocation,
                            //@ts-ignore
                            setAddress: setAddress,
                          });
                          setIsTagLocation(false);
                        }
                      });
                  }}
                >
                  <Button_>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {isTagLocation ? <LocationIcon /> : <ICLocationBlack />}
                      <Space width={5}></Space>
                      <Address>
                        {isTagLocation
                          ? address?.length > 40
                            ? address?.substring(0, 37) + '...'
                            : address
                          : 'Add Location'}
                      </Address>
                    </View>
                    <Icon source={require('assets/ic-next.png')} />
                  </Button_>
                </Pressable>
              </View>
              <TextInputWrap>
                <Input
                  multiline={true}
                  placeholder={t('new-post.Enter your thinking')}
                  placeholderTextColor={theme.dark ? COLOR.DARK_GRAY : COLOR.TEXT_GRAY}
                  value={value}
                  onChange={onChange}
                  style={{ textAlignVertical: 'top', fontSize: user?.setting?.ct_text_size as number }}
                  scrollEnabled={false}
                />
              </TextInputWrap>
              {isTagLocation && (
                <>
                  <MapPreview
                    address={address}
                    region={region}
                    onPressCancel={() => setIsTagLocation(!isTagLocation)}
                    onRegionChange={() => {}}
                  />
                </>
              )}
            </Column>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <ModalBase isVisible={!!isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle>{t('new-post.Options')}</ModalTitle>
          <Column style={{ paddingTop: 15 }}>
            <ConfirmButton
              onPress={() => {
                if (!isLoading) {
                  PermissionUtil.requestMultiplePermissions([
                    Platform.OS === 'ios' ? PERMISSIONS.IOS.MEDIA_LIBRARY : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
                    Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
                  ]).then((res) => {
                    if (
                      Object.values(res).filter(
                        (isGrant) => !(isGrant === RESULTS.DENIED || isGrant === RESULTS.BLOCKED),
                      ).length !== 2
                    ) {
                      Alert.alert('', 'You need to allow access to photo library and Media.', [
                        {
                          text: 'Cancel',
                          onPress: async () => {},
                        },
                        {
                          text: 'Go to settings',
                          onPress: async () => {
                            Platform.OS === 'ios'
                              ? await Linking.openURL('app-settings:')
                              : await Linking.openSettings();
                          },
                        },
                      ]);
                    } else if (image.length === 30) {
                      Alert.alert('Notice', "Can't add photos more than 30");
                    } else {
                      setIsVisible(false);
                      navigation.navigate('/chats/chat-room/gallery', {
                        image: image,
                        setImage: setImage,
                        setIsLoading: setIsLoading,
                      });
                    }
                  });
                } else {
                  Alert.alert('Notice', 'Please wait for the Images Loading');
                }
                console.log('성공');
              }}
            >
              <ConfirmLabel>{t('new-post.Choose From Photos')}</ConfirmLabel>
            </ConfirmButton>
            <ConfirmButton
              onPress={async () => {
                if (!isLoading) {
                  permissionUtil
                    .checkPermission(Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA)
                    .then((res) => {
                      if (res !== 'granted') {
                        Alert.alert('', 'You need to allow access to camera.', [
                          {
                            text: 'Cancel',
                            onPress: async () => {},
                          },
                          {
                            text: 'Go to settings',
                            onPress: async () => {
                              Platform.OS === 'ios'
                                ? await Linking.openURL('app-settings:')
                                : await Linking.openSettings();
                            },
                          },
                        ]);
                      } else if (image.length === 30) {
                        Alert.alert('Notice', "Can't add photos more than 30");
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
                            setIsVisible(false);
                            setIsLoading(true);
                            let mediaResList = [];
                            //@ts-ignore
                            const mediaRes = await uploadS3ByImageCropPicker(images.path, images.mime);
                            console.log(mediaRes);
                            //@ts-ignore
                            mediaResList.push({ url: mediaRes?.url, type: mediaRes?.type });
                            setImage(image.concat(mediaResList));
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
            >
              <ConfirmLabel>{t('new-post.Take Photo')}</ConfirmLabel>
            </ConfirmButton>
            <CancelButton
              onPress={() => {
                setIsVisible(false);
              }}
            >
              <CancelLabel>{t('new-post.Cancel')}</CancelLabel>
            </CancelButton>
            <View style={{ padding: 10 }} />
          </Column>
        </Column>
      </ModalBase>

      {/* 작성중 페이지 이탈시 */}
      <ModalBase isVisible={!!isVisibleLeave} onBackdropPress={() => setIsVisibleLeave(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle>{t('common.Are you sure you want to leave the page you are writing?')}</ModalTitle>
          <ModalText>{t('common.If you leave, the content you wrote will not be saved')}</ModalText>
          <ButtonWrap>
            <CancelButton
              style={{ width: 145 }}
              onPress={async () => {
                setIsVisibleLeave(false);
              }}
            >
              <CancelLabel>{t('common.Cancel')}</CancelLabel>
            </CancelButton>

            <ConfirmButton
              style={{ width: 145 }}
              onPress={async () => {
                setIsVisibleLeave(false);
                navigation.goBack();
              }}
            >
              <ConfirmLabel>{t('common.Leave')}</ConfirmLabel>
            </ConfirmButton>
          </ButtonWrap>
        </Column>
      </ModalBase>
    </>
  );
};
export default Upload;
