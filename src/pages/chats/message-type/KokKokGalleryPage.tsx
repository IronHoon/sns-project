import React, { Dispatch, useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { CameraRoll, GetPhotosParams } from '@react-native-camera-roll/camera-roll';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { EventRegister } from 'react-native-event-listeners';
import Nullable from 'types/_common/Nullable';
import { Checkbox } from 'components/atoms/input/Checkbox';
import Close from 'assets/kokkokme/new-post/ic_close.svg';
import Padding from 'components/containers/Padding';
import Space from 'components/utils/Space';
import { COLOR } from 'constants/COLOR';
import styled, { css } from 'styled-components/native';
import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import Toast, { BaseToast } from 'react-native-toast-message';
import { Row } from 'components/layouts/Row';
import DropdownIcon from 'assets/chats/chatroom/gallery/ic_down.svg';
import { Menu, MenuItem } from 'react-native-material-menu';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LogUtil from 'utils/LogUtil';
import { MainNavigationProp } from '../../../navigations/MainNavigator';
import { Image as IMage, Video } from 'react-native-compressor';
import { ModalBase } from '../../../components/modal';
import { Column } from '../../../components/layouts/Column';
import { t } from 'i18next';
import { Radio } from '../../../components/atoms/input/Radio';
import ICMoreGray from '/assets/ic_more_gray.svg';
import ICFilterGray from '/assets/ic_filter_gray.svg';
import ICMorePrimary from '/assets/ic_more_primary.svg';
import ICFilterPrimary from '/assets/ic_filter_primary.svg';
import { SetStateAction } from 'jotai';
import { multiUploadS3ByFilePath } from '../../../lib/uploadS3';
import { ToastConfig as GlobalToastConfig } from 'config/ToastConfig';
import uuid from 'react-native-uuid';

// import { BarCodeScanner } from 'expo-barcode-scanner'

const Icon = styled(Image)`
  width: 22px;
  height: 22px;
`;

const IconImages = styled.Image`
  width: 16px;
  height: 16px;
  margin: auto 0;
`;

const HeaderContainer = styled.View<{ border?: boolean }>`
  ${(props) =>
    !props.border && props.theme.dark
      ? css``
      : css`
          border-bottom-width: 1px;
          border-color: ${COLOR.GRAY};
        `}
`;

export type KokKokImageFile = {
  uri: string;
  name: string;
  type: string;
};

type SelectedImageProp = {
  item: CameraRoll.PhotoIdentifier;
  navigation;
  index: number;
  kokKokGalleryPageCallback: KokKokGalleryPageCallback;
  setCheckedFileItemByUri: Dispatch<React.SetStateAction<{}>>;
  codeScan?: boolean;
  setNotFound?: (boolean) => void;
  image?: string[];
  count: number;
  defaultCount: Dispatch<SetStateAction<number>>;
  update?: (field: string, vlaue: string) => void;
  selectedPhotoType?: string;
  checkedFileItemByUri?: any;
};
export const SelectedImage = function async({
  item,
  navigation,
  codeScan,
  index,
  count,
  defaultCount,
  image,
  setNotFound,
  kokKokGalleryPageCallback,
  setCheckedFileItemByUri,
  update,
  selectedPhotoType,
  checkedFileItemByUri,
}: SelectedImageProp) {
  const uri = item.node.image.uri;
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    setChecked(!!checkedFileItemByUri[item.node.image.uri]);
  }, []);
  const toggleChecked = async (event) => {
    if (selectedPhotoType) {
      navigation.navigate('/chats/chat-room/gallery/edit', {
        checkedFileItem: item.node.image.uri,
        update: update,
        selectedPhotoType: selectedPhotoType,
      });
    } else {
      setChecked((checked) => {
        const nextChecked = !checked;

        setCheckedFileItemByUri((checkedFileByUri) => {
          const newCheckedFileByUri = { ...checkedFileByUri };
          if (nextChecked) {
            if (image) {
              if (image.length + count > 29) {
                Toast.show({ text1: "Photos can't be chosen more than 30 at once." });
              } else {
                LogUtil.info('length', image.length);
                LogUtil.info('count', count);
                //@ts-ignore
                defaultCount((prev) => prev + 1);
                newCheckedFileByUri[uri] = item;
              }
            } else {
              //@ts-ignore
              defaultCount((prev) => prev + 1);
              newCheckedFileByUri[uri] = item;
            }
          } else {
            //@ts-ignore
            defaultCount((prev) => prev - 1);
            delete newCheckedFileByUri[uri];
          }
          return newCheckedFileByUri;
        });
        if (nextChecked) {
          if (image) {
            if (image.length + count > 29) {
              return checked;
            }
          }
        }
        return nextChecked;
      });
    }
  };

  return (
    <Pressable
      onPress={toggleChecked}
      style={{
        marginBottom: Dimensions.get('window').width * 0.005,
        width: '33%',
        aspectRatio: 1,
        marginHorizontal: index % 3 === 1 ? '0.5%' : 0,
      }}
    >
      <Image
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
        source={{ uri: uri }}
      />
      {!selectedPhotoType && (
        <Checkbox
          style={{
            position: 'absolute',
            right: 5,
            top: 5,
          }}
          round
          checked={checked}
          handleChecked={toggleChecked}
        />
      )}
    </Pressable>
  );
};

type Callback = (fileList: KokKokImageFile[]) => void;

export class KokKokGalleryPageCallback {
  static listenerId?: string | boolean;
  eventName = 'kokkok-gallery-callback';

  constructor(callback: Callback) {
    this.remove();
    this.add(callback);
  }

  private add(callback: Callback) {
    if (!KokKokGalleryPageCallback.listenerId) {
      KokKokGalleryPageCallback.listenerId = EventRegister.addEventListener(this.eventName, callback);
    }
  }

  private remove() {
    if (KokKokGalleryPageCallback.listenerId && typeof KokKokGalleryPageCallback.listenerId === 'string') {
      EventRegister.removeEventListener(KokKokGalleryPageCallback.listenerId);
      KokKokGalleryPageCallback.listenerId = undefined;
    }
  }

  emit(fileList: KokKokImageFile[]) {
    EventRegister.emit(this.eventName, fileList);
  }
}

type AssetType = 'All' | 'Videos' | 'Photos';
const KokKokGalleryPage = function () {
  const route = useRoute();
  //@ts-ignore
  const kokKokGalleryPageCallback = route.params?.callback as KokKokGalleryPageCallback;
  const [count, setCount] = useState<number>(0);
  const {
    //@ts-ignore
    params: { codeScan, setNotFound, setImage, image, setIsLoading, update, selectedPhotoType },
  } = useRoute();

  const navigation = useNavigation<MainNavigationProp>();
  const [allItemByUri, setAllItemByUri] = useState<Record<string, CameraRoll.PhotoIdentifier>>({});
  const allItem = Object.values(allItemByUri);

  const [checkedFileItemByUri, setCheckedFileItemByUri] = useState<Record<string, CameraRoll.PhotoIdentifier>>({});
  const checkedFileItem = Object.values(checkedFileItemByUri);
  const pageSize = 30;
  const [nextCursor, setNextCursor] = useState<Nullable<string>>(null);
  const [hasNextCursor, setHasNextPage] = useState<boolean>(true);
  const [selecetedAssetType, _setSelecetedAssetType] = useState<AssetType>('All');
  const setSelecetedAssetType = (selecetedAssetType) => {
    setShowMenu(false);
    setNextCursor(null);
    setHasNextPage(true);
    setAllItemByUri({});
    // setCheckedFileItemByUri({});
    _setSelecetedAssetType(selecetedAssetType);
  };
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [locationX, setLocationX] = useState(0);
  const [locationY, setLocationY] = useState(0);
  const [photo, setPhoto] = useState('standard');
  const [video, setVideo] = useState('standard');
  const [list, setList] = useState([]);
  const [quality, setQuality] = useState(0.7);
  const [videoQuality, setVideoQuality] = useState(false);
  const uploadQuality = 0.3;
  const [isDone, setIsDone] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsDone(false);
      setList([]);
    }, []),
  );

  const ToastConfig = {
    ...GlobalToastConfig,
    success: (props) => {
      const disableBackButton = props?.props?.disableBackButton;
      return (
        <>
          <BaseToast
            {...props}
            text1NumberOfLines={2}
            style={{
              borderLeftColor: '#ffc518',
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
            renderLeadingIcon={() => <IconImages source={require('/assets/ic_warning.png')} />}
          />
        </>
      );
    },
  };

  const setLocation = (x1, y1, lx) => {
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height;

    const menuWidth = 200;
    const menuHeight = 280;

    const x2 = x1 + menuWidth;
    const y2 = y1 + menuHeight;

    // LogUtil.info("setLocation x1,x2,y1,y2,windowWidth,windowHeight", [x1, x2, y1, y2, windowWidth, windowHeight]);
    if (windowWidth < x2) {
      setLocationX(windowWidth - menuWidth);
    } else {
      setLocationX(x1);
    }

    setLocationY(y1);
  };

  useEffect(() => {
    setQuality(0.7);
  }, []);

  const getPhotos = (nextCursor, selecetedAssetType) => {
    // LogUtil.info('getPhotos', allItemByUri);
    const params: GetPhotosParams = {
      first: pageSize,
      assetType: selecetedAssetType,
      // mimeTypes: [
      //   'image/gif',
      //   'image/png',
      //   'image/jpeg',
      //   'image/bmp',
      //   'image/webp',
      //   'video/mpeg',
      //   'video/mp4',
      //   'video/3gpp',
      //   'video/3gpp2',
      //   'video/webm',
      //   'video/avi',
      //   'application/x-mpegURL',
      //   'video/MP2T',
      // ],
    };
    if (nextCursor) {
      params.after = nextCursor;
      params.first = Platform.OS === 'ios' ? pageSize : parseInt(nextCursor) + pageSize; //android 30에서 버그가 있어서, first를 수정하였음. (https://github.com/react-native-cameraroll/react-native-cameraroll/issues/359)
    }
    hasNextCursor &&
      CameraRoll.getPhotos(params)
        .then((res) => {
          setAllItemByUri((prevItemByUri) => {
            const newItemByUri = { ...prevItemByUri };
            for (const photo of res.edges) {
              if (!newItemByUri[photo.node.image.uri]) {
                newItemByUri[photo.node.image.uri] = photo;
              }
            }
            return newItemByUri;
          });
          if (res.page_info.end_cursor) {
            setNextCursor(res.page_info.end_cursor);
          }
          setHasNextPage(res.page_info.has_next_page);
        })
        .catch((error) => {
          console.log(error);
        });
  };

  const onCompress = async (checkedList, quality) => {
    for (let i = 0; i < checkedList.length; i++) {
      let result;
      if (checkedList[i].node.type.includes('image')) {
        result = await IMage.compress(checkedList[i].node.image.uri, {
          maxWidth: 1200,
          quality: quality,
        });
      } else if (checkedList[i].node.type.includes('video')) {
        if (!videoQuality) {
          result = await Video.compress(checkedList[i].node.image.uri, {
            compressionMethod: 'auto',
          });
        } else {
          result = checkedList[i].node.image.uri;
        }
      }
      //@ts-ignore
      list.push({
        //@ts-ignore
        uri: result,
        //@ts-ignore
        type: checkedList[i].node.type,
      });
    }
  };

  const onSend = () => {
    var validLimited = false;

    if (checkedFileItem.length <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Please select Photo',
      });
      return;
    }

    checkedFileItem.map((img) => {
      const size = img.node.image.fileSize || 0;
      const imgSize = parseInt((size / (1024 * 1024)).toFixed(0), 10);
      if (imgSize > 300) {
        validLimited = true;
      }
    });

    //TODO: Toast인지, Modal인지 기획 필요함;
    if (validLimited) {
      Toast.show({
        type: 'error',
        text1: 'File of limited size (300 MB) cannot be upload.',
      });
      return;
    }

    if (!isDone) {
      setIsDone(true);
      if (setImage) {
        if (checkedFileItem.map((item) => item.node.type.includes('video')).includes(true)) {
          let videoList = [];

          checkedFileItem.map((item) => {
            if (item.node.type.includes('video')) {
              const dir = uuid.v4();
              const filename = item.node.image.uri.split('/').pop();
              const key = `${dir}/${filename}`;
              //@ts-ignore
              videoList.push({
                //@ts-ignore
                uri: item.node.image.uri,
                // name: path.basename(item.node.image.uri),
                //@ts-ignore
                name: key,
                //@ts-ignore
                type: item.node.type === 'video' ? item.node.type + '/mp4' : item.node.type,
              });
            }
          });
          if (checkedFileItem.map((item) => item.node.type.includes('image')).includes(true)) {
            onCompress(
              checkedFileItem.filter((item) => item.node.type.includes('image')),
              uploadQuality,
            ).then(() => {
              navigation.navigate('/chats/chat-room/gallery/edit', {
                checkedFileItem: list,
                image: image,
                setImage: setImage,
                setIsLoading: setIsLoading,
              });
              multiUploadS3ByFilePath(videoList).then((res) => {
                setImage(
                  image.concat(
                    res.map((item) => {
                      return { url: item.url, type: item.type };
                    }),
                  ),
                );
              });
            });
          } else {
            setIsLoading(true);
            navigation.goBack();
            multiUploadS3ByFilePath(videoList)
              .then((res) => {
                setImage(
                  image.concat(
                    res.map((item) => {
                      return { url: item.url, type: item.type };
                    }),
                  ),
                );
              })
              .then(() => setIsLoading(false));
          }
        } else {
          onCompress(
            checkedFileItem.filter((item) => item.node.type.includes('image')),
            uploadQuality,
          ).then(() => {
            navigation.navigate('/chats/chat-room/gallery/edit', {
              checkedFileItem: list,
              image: image,
              setImage: setImage,
              setIsLoading: setIsLoading,
            });
          });
        }
      } else {
        onCompress(checkedFileItem, quality)
          .then(() => {
            kokKokGalleryPageCallback.emit(
              list.map((item) => {
                const dir = uuid.v4();
                //@ts-ignore
                const filename = item.uri.split('/').pop();
                const key = `${dir}/${filename}`;
                return {
                  //@ts-ignore
                  uri: item.uri,
                  //@ts-ignore
                  name: key,
                  //@ts-ignore
                  type: item.type === 'video' ? item.type + '/mp4' : item.type,
                };
              }),
            );
          })
          .then(() => {
            navigation.goBack();
          });
      }
    }
  };

  const onEdit = () => {
    // 포스트 업로드 시
    if (!isDone) {
      setIsDone(true);
      if (setImage) {
        if (checkedFileItem.map((item) => item.node.type.includes('video')).includes(true)) {
          let videoList = [];
          checkedFileItem.map((item) => {
            if (item.node.type.includes('video')) {
              LogUtil.info('myuri', item.node.image.uri);
              LogUtil.info('mytype', item.node.type);
              const dir = uuid.v4();
              const filename = item.node.image.uri.split('/').pop();
              const key = `${dir}/${filename}`;
              //@ts-ignore
              videoList.push({
                //@ts-ignore
                uri: item.node.image.uri,
                // name: path.basename(item.node.image.uri),
                //@ts-ignore
                name: key,
                //@ts-ignore
                type: item.node.type === 'video' ? item.node.type + '/mp4' : item.node.type,
              });
            }
          });
          if (checkedFileItem.map((item) => item.node.type.includes('image')).includes(true)) {
            onCompress(
              checkedFileItem.filter((item) => item.node.type.includes('image')),
              uploadQuality,
            ).then(() => {
              navigation.navigate('/chats/chat-room/gallery/edit', {
                checkedFileItem: list,
                image: image,
                setImage: setImage,
                setIsLoading: setIsLoading,
              });
              multiUploadS3ByFilePath(videoList).then((res) => {
                setImage(
                  image.concat(
                    res.map((item) => {
                      return { url: item.url, type: item.type };
                    }),
                  ),
                );
              });
            });
          } else {
            setIsLoading(true);
            navigation.goBack();

            multiUploadS3ByFilePath(videoList)
              .then((res) => {
                setImage(
                  image.concat(
                    res.map((item) => {
                      return { url: item.url, type: item.type };
                    }),
                  ),
                );
              })
              .then(() => setIsLoading(false));
          }
        } else {
          onCompress(
            checkedFileItem.filter((item) => item.node.type.includes('image')),
            uploadQuality,
          ).then(() => {
            navigation.navigate('/chats/chat-room/gallery/edit', {
              checkedFileItem: list,
              image: image,
              setImage: setImage,
              setIsLoading: setIsLoading,
            });
          });
        }
        //채팅 전송 시
      } else {
        if (checkedFileItem.map((item) => item.node.type.includes('video')).includes(true)) {
          let videoList = [];
          checkedFileItem.map((item) => {
            if (item.node.type.includes('video')) {
              LogUtil.info('myuri', item.node.image.uri);
              LogUtil.info('mytype', item.node.type);
              const dir = uuid.v4();
              const filename = item.node.image.uri.split('/').pop();
              const key = `${dir}/${filename}`;
              //@ts-ignore
              videoList.push({
                //@ts-ignore
                uri: item.node.image.uri,
                // name: path.basename(item.node.image.uri),
                //@ts-ignore
                name: key,
                //@ts-ignore
                type: item.node.type,
              });
            }
          });
          if (checkedFileItem.map((item) => item.node.type.includes('image')).includes(true)) {
            onCompress(
              checkedFileItem.filter((item) => item.node.type.includes('image')),
              quality,
            ).then(() => {
              navigation.navigate('/chats/chat-room/gallery/edit', {
                checkedFileItem: list,
                callback: kokKokGalleryPageCallback,
                setImage: setImage,
                videoList: videoList,
                setIsLoading: setIsLoading,
              });
            });
            // kokKokGalleryPageCallback.emit(videoList)
          }
        } else {
          onCompress(checkedFileItem, quality).then(() => {
            navigation.navigate('/chats/chat-room/gallery/edit', {
              checkedFileItem: list,
              chat: true,
              callback: kokKokGalleryPageCallback,
              setImage: setImage,
              setIsLoading: setIsLoading,
            });
          });
        }
      }
    }
  };
  useEffect(() => {
    getPhotos(nextCursor, selecetedAssetType);
  }, [selecetedAssetType]);

  const toggleAssetTypeMenu = () => setShowMenu((showMenu) => !showMenu);

  return (
    <SafeAreaView>
      <View style={{ height: codeScan ? '100%' : '93%' }}>
        <HeaderContainer border={false}>
          <Padding>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: codeScan ? 'flex-end' : 'flex-start',
              }}
            >
              <Close
                onTouchStart={() => {
                  navigation.goBack();
                }}
              />
              <Space width={10} />
              {!codeScan && !selectedPhotoType && (
                <GestureHandlerRootView
                  onTouchStart={(e) => {
                    if (!showMenu) {
                      setLocation(e.nativeEvent.pageX, e.nativeEvent.pageY, e.nativeEvent.locationX);
                    }
                  }}
                >
                  <Menu
                    style={{ position: 'absolute', top: locationY, left: locationX }}
                    visible={showMenu}
                    onRequestClose={toggleAssetTypeMenu}
                    anchor={
                      <View onTouchStart={toggleAssetTypeMenu}>
                        <Row>
                          <Text>{selecetedAssetType === 'All' ? 'View All' : selecetedAssetType}</Text>
                          <Space width={5} />
                          <DropdownIcon />
                        </Row>
                      </View>
                    }
                  >
                    <MenuItem
                      style={{ height: 50, width: 200 }}
                      textStyle={{ color: COLOR.BLACK }}
                      onTouchStart={() => setSelecetedAssetType('All')}
                      pressColor={'#fcf2e8'}
                    >
                      View All
                    </MenuItem>
                    <MenuItem
                      style={{ height: 50, width: 200 }}
                      textStyle={{ color: COLOR.BLACK }}
                      onTouchStart={() => setSelecetedAssetType('Photos')}
                      pressColor={'#fcf2e8'}
                    >
                      Photos
                    </MenuItem>
                    <MenuItem
                      style={{ height: 50, width: 200 }}
                      textStyle={{ color: COLOR.BLACK }}
                      onTouchStart={() => setSelecetedAssetType('Videos')}
                      pressColor={'#fcf2e8'}
                    >
                      Videos
                    </MenuItem>
                  </Menu>
                </GestureHandlerRootView>
              )}
              <View style={{ flex: 1 }} />
              {checkedFileItem.length > 0 && !setImage && (
                <Text style={{ color: '#999999' }}>
                  {checkedFileItem.length} of {allItem.length}
                </Text>
              )}
              {setImage && (
                <Text style={{ color: '#999999' }}>
                  {count}/{30 - image.length}
                </Text>
              )}
              <Space width={5} />
              {!codeScan && !selectedPhotoType && (
                <Button
                  label={setImage ? 'Done' : 'Send'}
                  height={32}
                  borderRadius
                  fontSize={13}
                  fontWeight={500}
                  variant={ButtonVariant.TextBtn}
                  textvariant={ButtonTextVariant.Text}
                  onPress={onSend}
                />
              )}
            </View>
          </Padding>
        </HeaderContainer>
        <FlatList
          data={allItem}
          numColumns={3}
          renderItem={({ item, index }) => (
            <SelectedImage
              update={update}
              selectedPhotoType={selectedPhotoType}
              count={count}
              checkedFileItemByUri={checkedFileItemByUri}
              codeScan={codeScan}
              defaultCount={setCount}
              image={image}
              setNotFound={setNotFound}
              item={item}
              index={index}
              navigation={navigation}
              kokKokGalleryPageCallback={kokKokGalleryPageCallback}
              setCheckedFileItemByUri={setCheckedFileItemByUri}
            />
          )}
          onEndReachedThreshold={0.5}
          onEndReached={(e) => {
            //
            getPhotos(nextCursor, selecetedAssetType);
          }}
        />
      </View>
      {!codeScan && !selectedPhotoType && (
        <View style={{ height: '7%', justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 20 }}>
          {checkedFileItem.length > 0 ? (
            <View style={{ flexDirection: 'row' }}>
              <Pressable onPress={onEdit}>
                <ICFilterPrimary />
              </Pressable>
              {!setImage && (
                <>
                  <Space width={30} />
                  <Pressable
                    onPress={() => {
                      setModalVisible(true);
                    }}
                  >
                    <ICMorePrimary />
                  </Pressable>
                </>
              )}
            </View>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <ICFilterGray />
              {!setImage && (
                <>
                  <Space width={30} />
                  <ICMoreGray />
                </>
              )}
            </View>
          )}
        </View>
      )}

      <ModalBase radius={true} isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle>Resolution</ModalTitle>
          <Space height={30} />
          <View
            style={{
              paddingBottom: 10,
              width: 325,
              flexDirection: 'row',
              justifyContent: 'flex-start',
              borderBottomWidth: 1,
              borderBottomColor: '#ededed',
            }}
          >
            <ModalSubTitle>Photo</ModalSubTitle>
          </View>
          <Space height={10} />
          <RadioContainer
            onPress={() => {
              setQuality(0.1);
              setPhoto('low');
            }}
          >
            <RadioLabel>Low resolution</RadioLabel>
            <Radio
              checked={photo === 'low'}
              handleChecked={() => {
                setQuality(0.1);
                setPhoto('low');
              }}
            />
          </RadioContainer>
          <RadioContainer
            onPress={() => {
              setQuality(0.7);
              setPhoto('standard');
            }}
          >
            <RadioLabel>Standard resolution</RadioLabel>
            <Radio
              checked={photo === 'standard'}
              handleChecked={() => {
                setQuality(0.7);
                setPhoto('standard');
              }}
            />
          </RadioContainer>
          <RadioContainer
            onPress={() => {
              setQuality(1);
              setPhoto('original');
            }}
          >
            <RadioLabel>Original</RadioLabel>
            <Radio
              checked={photo === 'original'}
              handleChecked={() => {
                setQuality(1);
                setPhoto('original');
              }}
            />
          </RadioContainer>
          <View
            style={{
              paddingBottom: 10,
              width: 325,
              flexDirection: 'row',
              justifyContent: 'flex-start',
              borderBottomWidth: 1,
              borderBottomColor: '#ededed',
            }}
          >
            <ModalSubTitle>Video</ModalSubTitle>
          </View>
          <Space height={10} />
          <RadioContainer
            onPress={() => {
              setVideoQuality(false);
              setVideo('standard');
            }}
          >
            <RadioLabel>Standard resolution</RadioLabel>
            <Radio
              checked={video === 'standard'}
              handleChecked={() => {
                setVideoQuality(false);
                setVideo('standard');
              }}
            />
          </RadioContainer>
          <RadioContainer
            onPress={() => {
              setVideoQuality(true);
              setVideo('high');
            }}
          >
            <RadioLabel>High resolution</RadioLabel>
            <Radio
              checked={video === 'high'}
              handleChecked={() => {
                setVideoQuality(true);
                setVideo('high');
              }}
            />
          </RadioContainer>

          <View
            style={{
              marginBottom: -25,
              width: 100,
              paddingTop: 15,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ConfirmButton
              onPress={async () => {
                setModalVisible(false);
              }}
            >
              <ConfirmLabel>{t('common.Confirm')}</ConfirmLabel>
            </ConfirmButton>
            <View style={{ padding: 10 }} />
          </View>
        </Column>
      </ModalBase>
      <Toast config={ToastConfig} />
    </SafeAreaView>
  );
};

const ConfirmButton = styled(TouchableOpacity)`
  background-color: ${COLOR.PRIMARY};
  width: 120px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${COLOR.PRIMARY};
`;

const CancelButton = styled(TouchableOpacity)`
  background-color: #fff;
  width: 120px;
  height: 55px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: #ccc;
`;

const ModalText = styled(Text)`
  color: #999999;
  padding: 10px;
  text-align: center;
`;
const CancelLabel = styled(Text)`
  color: #ccc;
  font-size: 15px;
  font-weight: bold;
`;
const ConfirmLabel = styled(Text)`
  color: #fff;
  font-size: 14px;
  font-weight: 500;
`;
const ModalTitle = styled(Text)`
  font-size: 16px;
  color: #262525;
  font-weight: 500;
`;

const ModalSubTitle = styled(Text)`
  font-size: 15px;
  color: #262525;
  padding: 10px;
  font-weight: 500;
`;

const RadioContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding-top: 5px;
  padding-bottom: 20px;
  align-items: center;
  width: 325px;
  padding-right: 10px;
  justify-content: space-between;
`;
const RadioLabel = styled.Text`
  font-size: 14px;
  margin-left: 10px;
  color: #262525;
`;
export default KokKokGalleryPage;
