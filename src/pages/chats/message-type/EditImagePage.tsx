import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Button,
  TouchableOpacity,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import BackHeader from '../../../components/molecules/BackHeader';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import LogUtil from '../../../utils/LogUtil';
import ImageCropper from 'react-native-simple-image-cropper';
import styled from 'styled-components';
import { MainNavigationProp } from '../../../navigations/MainNavigator';
import { KokKokImageFile } from './KokKokGalleryPage';
import { COLOR } from '../../../constants/COLOR';
import Space from '../../../components/utils/Space';
import { ModalBase } from '../../../components/modal';
import { Column } from '../../../components/layouts/Column';
import { t } from 'i18next';
import { Row } from '../../../components/layouts/Row';
import ImageRotate from 'react-native-image-rotate';

import {
  Maven,
  Walden,
  Valencia,
  Toaster,
  Slumber,
  Inkwell,
  Lofi,
  Hudson,
  Brooklyn,
  _1977,
  Sharpen,
  Achromatomaly,
  Vintage,
  Polaroid,
  Tint,
  IosCIExposureAdjust,
} from 'react-native-image-filter-kit';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import { multiUploadS3ByFilePath, uploadS3ByFilePath } from '../../../lib/uploadS3';
import MainLayout from '../../../components/layouts/MainLayout';
import Carousel from 'react-native-snap-carousel';
import ImageViewer from '../../../views/chats/components/ImageViewer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import uuid from 'react-native-uuid';

const FILTERS = [
  {
    title: 'Normal',
    filterComponent: Tint,
  },
  {
    title: 'Polaroid',
    filterComponent: Polaroid,
  },
  {
    title: 'maven',
    filterComponent: Maven,
  },

  {
    title: 'Walden',
    filterComponent: Walden,
  },
  {
    title: 'Lofi',
    filterComponent: Lofi,
  },
  {
    title: 'Valencia',
    filterComponent: Valencia,
  },
  {
    title: 'Inkwell',
    filterComponent: Inkwell,
  },
  {
    title: 'Toaster',
    filterComponent: Toaster,
  },
  {
    title: 'Slumber',
    filterComponent: Slumber,
  },
  {
    title: 'Hudson',
    filterComponent: Hudson,
  },
  {
    title: 'Brooklyn',
    filterComponent: Brooklyn,
  },
  {
    title: '_1977',
    filterComponent: _1977,
  },
  {
    title: 'Sharpen',
    filterComponent: Sharpen,
  },
  {
    title: 'Achromatomaly',
    filterComponent: Achromatomaly,
  },
  {
    title: 'Vintage',
    filterComponent: Vintage,
  },
  {
    title: 'Tint',
    filterComponent: Tint,
  },
];

type Callback = (fileList: KokKokImageFile[]) => void;

const EditImagePage = () => {
  const {
    params: {
      //@ts-ignore
      edit,
      //@ts-ignore
      checkedFileItem,
      //@ts-ignore
      callback,
      //@ts-ignore
      media,
      //@ts-ignore
      setImage,
      //@ts-ignore
      setIsLoading,
      //@ts-ignore
      videoList,
      //@ts-ignore
      chat,
      //@ts-ignore
      update,
      //@ts-ignore
      selectedPhotoType,
    },
  } = useRoute();
  const [count, setCount] = useState(0);
  const [images, setImages] = useState([]);
  const [cropperOpt, setCropperOpt] = useState({
    cropperParams: {},
    croppedImage: '',
  });
  const [cropper, setCropper] = useState();
  const [isProgressing, setIsProgressing] = useState(false);
  const [isFilter, setIsFilter] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const [length, setLength] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [carousel, setCarousel] = useState();
  const [maxIndex, setMaxIndex] = useState(0);
  const number = useRef(0);
  const [loopcount, setLoopcount] = useState(0);
  const isProgress = useRef(false);

  const [cropImage, setCropImage] = useState('');

  const navigation = useNavigation<MainNavigationProp>();

  const window = Dimensions.get('window').width;
  const w = window * 0.95;
  const CROP_AREA_WIDTH = w;
  const CROP_AREA_HEIGHT = w;

  const [checkedItem, setCheckedItem] = useState<Array<string>>([]);

  useFocusEffect(
    useCallback(() => {
      setImages([]);
    }, []),
  );

  useEffect(() => {
    const checkedList = [];
    if (media) {
      //@ts-ignore
      checkedFileItem.map((item) => checkedList.push(item));
    } else if (chat) {
      //@ts-ignore
      checkedFileItem.map((item) => checkedList.push(item.uri));
    } else if (edit) {
      //@ts-ignore
      checkedFileItem.map((item) => {
        //@ts-ignore
        if (item.type.includes('image')) checkedList.push(item.url);
      });
    } else if (selectedPhotoType) {
      //@ts-ignore
      checkedList.push(checkedFileItem);
    } else {
      //@ts-ignore
      checkedFileItem.map((item) => checkedList.push(item.uri));
    }
    setCheckedItem(checkedList);
    setLength(checkedList.length);
    number.current = checkedList.length;
  }, [checkedFileItem]);

  const setCropperParams = (cropperParams) => {
    setCropperOpt((prevState) => ({
      ...prevState,
      cropperParams: cropperParams,
    }));
  };

  let extractedUri = useRef(
    media
      ? checkedFileItem[count]
      : chat
      ? checkedFileItem[count].uri
      : edit
      ? checkedFileItem[count].url
      : selectedPhotoType
      ? checkedFileItem
      : checkedFileItem[count].uri,
  );
  const [selectedFilterIndex, setIndex] = useState(0);

  const onExtractImage = ({ nativeEvent }) => {
    LogUtil.info('nativeEvent', nativeEvent);
    extractedUri.current = nativeEvent.uri;
  };

  useFocusEffect(
    useCallback(() => {
      console.log('fittedSize', cropperOpt.cropperParams);
      isProgress.current = false;
      setCropImage(checkedItem[checkedItem.length - 1]);
      if (cropper && number.current !== 0)
        (async () => {
          await promiseFun();
        })();
    }, [checkedItem.length]),
  );

  useFocusEffect(
    useCallback(() => {
      extractedUri.current = media
        ? checkedFileItem[count]
        : chat
        ? checkedFileItem[count].uri
        : edit
        ? checkedFileItem[count].url
        : selectedPhotoType
        ? checkedFileItem
        : checkedFileItem[count].uri;
    }, [count]),
  );

  const onReverse = async () => {
    ImageRotate.rotateImage(
      checkedItem[imageIndex],
      -90,
      (uri) => {
        checkedItem[imageIndex] = uri;
      },
      (error) => {
        LogUtil.info('error', error);
      },
    );
  };

  const onSelectFilter = (selectedIndex) => {
    LogUtil.info('index', selectedFilterIndex);
    if (selectedIndex === 0) {
      extractedUri.current = media
        ? checkedFileItem[count]
        : chat
        ? checkedFileItem[count].uri
        : edit
        ? checkedFileItem[count].url
        : selectedPhotoType
        ? checkedFileItem
        : checkedFileItem[count].uri;
      setIndex(selectedIndex);
    } else {
      setIndex(selectedIndex);
    }
  };

  const renderFilterComponent = ({ item, index }) => {
    const FilterComponent = item.filterComponent;
    const image = (
      <Image
        style={styles.filterSelector}
        source={{
          uri: checkedItem[imageIndex],
        }}
        resizeMode={'contain'}
      />
    );
    return (
      <TouchableOpacity onPress={() => onSelectFilter(index)}>
        <Text style={styles.filterTitle}>{item.title}</Text>
        <FilterComponent image={image} />
      </TouchableOpacity>
    );
  };

  const SelectedFilterComponent = FILTERS[selectedFilterIndex].filterComponent;

  const handlePress = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const length = checkedItem.length;
      isProgress.current = true;
      setImageIndex(checkedItem.length - 1);
      setCropperOpt((prevState) => ({
        ...prevState,
      }));
      const { cropperParams } = cropperOpt;
      const cropSize = {
        width: 4800,
        height: 4800,
      };

      const cropAreaSize = {
        width: window,
        height: window,
      };
      try {
        setLoopcount(loopcount + 1);
        //@ts-ignore
        ImageCropper.crop({
          ...cropperParams,
          imageUri: cropImage,
          cropSize,
          cropAreaSize,
        })
          .then((result) => {
            if (selectedPhotoType) {
              const dir = uuid.v4();
              const filename = result?.split('/').pop();
              const key = `${dir}/${filename}`;
              //@ts-ignore
              images.unshift({
                //@ts-ignore
                uri: result,
                //@ts-ignore
                type: 'image/jpg',
                //@ts-ignore
                name: key,
              });
              console.log('images', images);
              multiUploadS3ByFilePath(images).then((result) => {
                update(selectedPhotoType, result[0].url);
                navigation.goBack();
                navigation.goBack();
              });
            } else {
              const dir = uuid.v4();
              const filename = result?.split('/').pop();
              const key = `${dir}/${filename}`;
              //@ts-ignore
              setCropperOpt((prevState) => ({
                ...prevState,
                croppedImage: result,
              }));

              //@ts-ignore
              images.unshift({
                //@ts-ignore
                uri: result,
                //@ts-ignore
                type:
                  media || edit || selectedPhotoType
                    ? 'image'
                    : chat
                    ? checkedFileItem[count].type
                    : checkedFileItem[count].type,
                name: key,
              });
              checkedItem.pop();
              console.log('result images', images);
            }
          })
          .then(() => {
            number.current = number.current - 1;
            resolve();
          })
          .catch((e) => {
            reject();
          });
      } catch (error) {
        reject();
        console.log(error);
      }
    });
  };

  const handleDone = () => {
    if (number.current === 0) {
      if (media) {
        //@ts-ignore
        images?.map((uri) => CameraRoll.save(uri.uri, { type: 'photo' }));
        setIsProgressing(false);
        navigation.goBack();
      } else if (setImage) {
        setIsLoading(true);
        setIsProgressing(false);
        !edit && navigation.goBack();
        navigation.goBack();
        const mediaList = multiUploadS3ByFilePath(images).then((mediaList) => {
          if (!edit) {
            setImage((prev) =>
              prev.concat(
                mediaList.map((item) => {
                  return {
                    url: item.url,
                    type: item.type,
                  };
                }),
              ),
            );
          } else {
            setImage(checkedFileItem.filter((item) => item.type.includes('video')));
            setImage((prev) =>
              prev.concat(
                mediaList.map((item) => {
                  return {
                    url: item.url,
                    type: item.type,
                  };
                }),
              ),
            );
          }
          setIsLoading(false);
        });
      } else {
        if (!selectedPhotoType) {
          setIsProgressing(false);

          callback.emit(
            images.map((item) => {
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
                type: item.type,
              };
            }),
          );
          if (videoList) callback.emit(videoList);
          navigation.goBack();
          navigation.goBack();
        }
      }
    }
  };

  const promiseFun = async () => {
    if (!isProgress.current) await handlePress();
    handleDone();
  };

  function serialized(fn) {
    let queue = Promise.resolve();
    return (...args) => {
      const res = queue.then(() => fn(...args));
      queue = res.catch(() => {});
      return res;
    };
  }

  return (
    <SafeAreaView style={{ backgroundColor: `#262525`, flex: 1 }}>
      <BackHeader
        isEdit={true}
        title={selectedPhotoType ? '' : imageIndex + 1 + '/' + length}
        onClick={() => {
          setIsVisible(true);
        }}
        themeColor={false}
      />

      {!isFilter ? (
        <>
          <View
            style={{
              flex: 1,
              backgroundColor: '#262525',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Carousel
              ref={(component) => {
                //@ts-ignore
                setCarousel(component);
              }}
              firstItem={imageIndex}
              data={checkedItem}
              sliderWidth={SCREEN_WIDTH}
              itemWidth={SCREEN_WIDTH}
              inactiveSlideScale={0.8}
              inactiveSlideOpacity={0.7}
              onSnapToItem={(index) => {
                console.log('current index', index);
                setImageIndex(index);
                if (index > maxIndex) {
                  setMaxIndex(index);
                }
              }}
              renderItem={(url) => {
                return (
                  <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        height: 100,
                        justifyContent: 'center',
                      }}
                    >
                      {checkedItem.length > 1 && <Text style={{ color: 'white' }}>Swipe to edit more photos</Text>}
                    </View>
                    <ImageCropper
                      //@ts-ignore
                      ref={(ref) => {
                        //@ts-ignore
                        setCropper(ref);
                      }}
                      imageUri={url.item}
                      cropAreaWidth={window}
                      cropAreaHeight={window}
                      containerColor="black"
                      areaColor="black"
                      setCropperParams={(event) => {
                        setCropperParams(event);
                      }}
                      // rotate={1}
                      areaOverlay={
                        <Image
                          style={{ width: window, height: window }}
                          source={require('/assets/ic_white_frame.png')}
                        />
                      }
                    />
                  </View>
                );
              }}
              hasParallaxImages={true}
            />
            {/*<View style={{ backgroundColor: '#262525' }}>*/}
            {/*  <ImageCropper*/}
            {/*    imageUri={extractedUri.current}*/}
            {/*    cropAreaWidth={window}*/}
            {/*    cropAreaHeight={window}*/}
            {/*    containerColor="black"*/}
            {/*    areaColor="black"*/}
            {/*    setCropperParams={setCropperParams}*/}
            {/*    // rotate={1}*/}
            {/*    areaOverlay={*/}
            {/*      <Image style={{ width: window, height: window }} source={require('/assets/ic_white_frame.png')} />*/}
            {/*    }*/}
            {/*  />*/}
            {/*</View>*/}
          </View>
          <View
            style={{
              padding: 20,
              height: 70,
              backgroundColor: '#262525',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Pressable
              onPress={() => {
                setIsFilter(true);
              }}
            >
              <IconWrapper>
                <Icon source={require('/assets/ic-edit-filter.png')}></Icon>
              </IconWrapper>
            </Pressable>
            <Pressable onPress={onReverse}>
              <IconWrapper>
                <Icon source={require('/assets/ic-rotate.png')}></Icon>
              </IconWrapper>
            </Pressable>
            {isProgressing ? (
              <ActivityIndicator></ActivityIndicator>
            ) : (
              <Pressable
                onPress={async () => {
                  setIsProgressing(true);
                  setCropImage(checkedItem[checkedItem.length - 1]);
                  checkedItem.pop();
                }}
              >
                <DoneButton>
                  <>
                    <Icon source={require('/assets/ic-done.png')} style={{ height: 10, width: 10 }} />
                    <Space width={3}></Space>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                      {media && checkedFileItem.length === count + 1
                        ? 'Save'
                        : media || setImage || selectedPhotoType
                        ? 'Done'
                        : 'Send'}
                    </Text>
                  </>
                </DoneButton>
              </Pressable>
            )}
          </View>
        </>
      ) : (
        <View style={{ justifyContent: 'center', flex: 1 }}>
          {selectedFilterIndex === 0 ? (
            <View style={{ flex: 1 }}>
              <Image
                style={styles.image}
                source={{
                  uri: checkedItem[imageIndex],
                }}
                resizeMode={'contain'}
              />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              {Platform.OS === 'ios' ? (
                <IosCIExposureAdjust
                  extractImageEnabled={true}
                  onExtractImage={onExtractImage}
                  inputEV={0.2}
                  inputImage={
                    <SelectedFilterComponent
                      onExtractImage={onExtractImage}
                      extractImageEnabled={true}
                      image={
                        <Image
                          style={styles.image}
                          source={{
                            uri: checkedItem[imageIndex],
                          }}
                          resizeMode={'contain'}
                        />
                      }
                    />
                  }
                />
              ) : (
                <SelectedFilterComponent
                  onExtractImage={onExtractImage}
                  extractImageEnabled={true}
                  image={
                    <Image
                      style={styles.image}
                      source={{
                        uri: checkedItem[imageIndex],
                      }}
                      resizeMode={'contain'}
                    />
                  }
                />
              )}
            </View>
          )}
          <View style={{ height: 150 }}>
            <Space height={10} />
            <FlatList
              data={FILTERS}
              keyExtractor={(item) => item.title}
              horizontal={true}
              renderItem={renderFilterComponent}
              showsHorizontalScrollIndicator={false}
            />
          </View>
          <View
            style={{
              padding: 20,
              height: 70,
              backgroundColor: '#262525',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <Pressable
              onPress={() => {
                checkedItem[imageIndex] = extractedUri.current;
                setIsFilter(false);
              }}
            >
              <DoneButton>
                <Icon source={require('/assets/ic-done.png')} style={{ height: 10, width: 10 }} />
                <Space width={3}></Space>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Done</Text>
              </DoneButton>
            </Pressable>
          </View>
        </View>
      )}

      <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle>{t('common.Are you sure you want to undo the edit?')}</ModalTitle>
          <ModalText>{t('common.If you delete it, all applied contents will be deleted')}</ModalText>
          <View style={{ flexDirection: 'row', paddingTop: 15, justifyContent: 'center', alignItems: 'center' }}>
            <CancelButton
              onPress={async () => {
                setIsVisible(false);
              }}
            >
              <CancelLabel>{t('common.Cancel')}</CancelLabel>
            </CancelButton>
            <Space width={10} />
            <ConfirmButton
              onPress={async () => {
                setIsVisible(false);
                navigation.goBack();
              }}
            >
              <ConfirmLabel>{t('common.Confirm')}</ConfirmLabel>
            </ConfirmButton>
          </View>
        </Column>
      </ModalBase>
    </SafeAreaView>
  );
};

const ButtonWrapper = styled(View)`
  position: relative;
`;

const ConfirmButton = styled(TouchableOpacity)`
  background-color: ${COLOR.PRIMARY};
  width: 120px;
  height: 55px;
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
  font-size: 15px;
  font-weight: bold;
`;
const ModalTitle = styled(Text)`
  font-size: 15px;
  color: black;
  padding: 10px;
  font-weight: bold;
`;

const Icon = styled(Image)`
  width: 25px;
  height: 25px;
`;
const IconWrapper = styled(View)`
  width: 50px;
  height: 22px;
`;
const DoneButton = styled(View)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border-radius: 20px;
  height: 30px;
  width: 40px;
`;

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  filterSelector: {
    width: 100,
    height: 100,
    margin: 5,
  },
  filterTitle: {
    fontSize: 12,
    textAlign: 'center',
    color: 'white',
  },
});

export default EditImagePage;
