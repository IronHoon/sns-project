import {
  Dimensions,
  Image,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Space from '../../components/utils/Space';
import BackGray from '../../assets/kokkokme/ic-back.svg';
import { COLOR } from '../../constants/COLOR';
import ICMediaMore from '/assets/ic_media_more.svg';
import Carousel from 'react-native-snap-carousel';
import ImageViewer from './components/ImageViewer';
import ICDownload from '/assets/ic_download_white.svg';
import SHARE from 'react-native-share';
import ICShare from '/assets/ic_share_white.svg';
import ICFilter from '/assets/ic_filter_white.svg';
import ICDelete from '/assets/ic_delete_white.svg';
import { Options } from '../kokkokme/components/user-timeline/UserInfo';
import React, { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import styled from 'styled-components';
import userAtom from '../../stores/userAtom';
import { useAtom, useAtomValue } from 'jotai';
import { MainNavigationProp } from '../../navigations/MainNavigator';
import LogUtil from '../../utils/LogUtil';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import logUtil from '../../utils/LogUtil';
import { ModalBase, ModalText, ModalTitle } from '../../components/modal';
import { Column } from '../../components/layouts/Column';
import { Row } from '../../components/layouts/Row';
import DateUtil from '../../utils/DateUtil';
import useSocket from '../../hooks/useSocket';
import dateUtil from '../../utils/DateUtil';
import axios from 'axios';
import { Buffer } from 'buffer';

const Wrapper = styled(View)`
  flex-direction: column;
  display: flex;
  justify-content: space-between;
  background-color: #262525;
  flex: 1;
  padding-top: ${Platform.OS === 'ios' ? '0px' : '15px'};
  padding-bottom: ${Platform.OS === 'ios' ? '0px' : '20px'};
`;

const ContentContainer = styled(View)`
  flex-direction: column;
  width: 100%;
  flex: 1;
`;

const Footer = styled(View)`
  flex-direction: column;
  height: 200px;
  justify-content: space-between;
  padding-top: 20px;
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
  margin-bottom: 10px;
`;

const ConfirmLabel = styled(Text)`
  color: #fff;
  font-size: 15px;
  font-weight: 500;
`;

const MENU = [
  {
    value: 'saveAll',
    label: 'Save all photos',
  },
  {
    value: 'saveOnly',
    label: 'Save current photo only',
  },
  {
    value: 'cancel',
    label: 'Cancel',
  },
];

const ONEMENU = [
  {
    value: 'saveOnly',
    label: 'Save',
  },
  {
    value: 'cancel',
    label: 'Cancel',
  },
];
const NUMMENU = [
  {
    value: 'all',
    label: 'All photos',
  },
  {
    value: 'only',
    label: 'Current photo only',
  },
  {
    value: 'cancel',
    label: 'Cancel',
  },
];
const DELMENU = [
  {
    value: 'every',
    label: 'Delete for me and everyone',
  },
  {
    value: 'me',
    label: 'Delete for me',
  },
  {
    value: 'cancel',
    label: 'Cancel',
  },
];

const DELMENU2 = [
  {
    value: 'me',
    label: 'Delete for me',
  },
  {
    value: 'cancel',
    label: 'Cancel',
  },
];

const MediaDetail = () => {
  const {
    //@ts-ignore
    params: { selectedItem, room, userName },
  } = useRoute();

  const [imageIndex, setImageIndex] = useState(0);
  const user = useAtomValue(userAtom);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [flatList, setFlatList] = useState();
  const [carousel, setCarousel] = useState(null);
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const isWithIn24Hours = selectedItem?.createdAt && DateUtil.subtractHour(selectedItem?.createdAt, new Date()) < 24;
  const navigation = useNavigation<MainNavigationProp>();
  const [numVisible, setNumVisible] = useState(false);
  const [delVisible, setDelVisible] = useState(false);
  const [delList, setDelList] = useState('');
  const [isOnly, setIsOnly] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { chatSocketUtil } = useSocket();

  const isMe = selectedItem?.user?.id === user?.id;
  LogUtil.info('selectedItem', selectedItem);

  const handleMenuPress = (value?: string) => {
    LogUtil.info('selectedItem', selectedItem);
    if (value === 'saveAll') {
      selectedItem?.url.map((uri) => CameraRoll.save(uri, { type: 'photo' }));
    } else if (value === 'saveOnly') {
      selectedItem?.url.map((uri, index) => {
        if (index === imageIndex) CameraRoll.save(uri, { type: 'photo' });
      });
    } else if (value === 'all') {
      setIsOnly(false);
      setDelVisible(true);
    } else if (value === 'only') {
      setIsOnly(true);
      selectedItem?.url.map((uri, index) => {
        if (index === imageIndex) setDelList(uri);
      });
      setDelVisible(true);
    } else if (value === 'me') {
      console.log('dellist Uri', delList);
      if (!isOnly) {
        chatSocketUtil.emitDeleteMessage('채팅중', selectedItem.room_id, selectedItem?._id, 'me');
      } else {
        chatSocketUtil.emitDeleteMedia('채팅중', delList, selectedItem._id, 'me');
      }
      navigation.goBack();
    } else if (value === 'every') {
      if (!isOnly) {
        chatSocketUtil.emitDeleteMessage('채팅중', selectedItem.room_id, selectedItem?._id, 'all');
      } else {
        chatSocketUtil.emitDeleteMedia('채팅중', delList, selectedItem._id);
      }
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#262525',
      }}
    >
      <Wrapper>
        <View
          style={{
            width: '100%',
            height: 50,
            flexDirection: 'row',
            marginLeft: 15,
            marginBottom: 10,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            <Pressable
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Space width={30} />
              <BackGray />
              <Space width={40} />
            </Pressable>

            <View style={{ flexDirection: 'column' }}>
              <Text
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '700',
                }}
              >
                {userName.length > 30 ? userName.substring(0, 27) + '...' : userName}
              </Text>
              <Space height={2} />
              <Text style={{ color: COLOR.GRAY }}>{dateUtil.getChatDate(selectedItem.createdAt)}</Text>
            </View>
          </View>
          <Pressable
            onPress={() => {
              navigation.navigate('/chats/chat-room/chat-room-detail/media', {
                room: room,
              });
            }}
          >
            <View style={{ marginRight: 30 }}>
              <ICMediaMore />
            </View>
          </Pressable>
        </View>
        <ContentContainer>
          <Carousel
            ref={(component) => {
              //@ts-ignore
              setCarousel(component);
            }}
            data={selectedItem?.url}
            sliderWidth={SCREEN_WIDTH}
            itemWidth={SCREEN_WIDTH}
            sliderHeight={SCREEN_WIDTH}
            itemHeight={SCREEN_WIDTH}
            inactiveSlideScale={0.8}
            inactiveSlideOpacity={0.7}
            onSnapToItem={(index) => {
              setImageIndex(index);
              //@ts-ignore
              flatList.snapToItem(index);
            }}
            renderItem={(url) => {
              return (
                <View style={{ height: '100%', justifyContent: 'center' }}>
                  <ImageViewer
                    imageWidth={SCREEN_WIDTH}
                    imageHeight={SCREEN_WIDTH}
                    source={url.item}
                    onScaleChange={(scale) => setScrollEnabled(scale === 1)}
                  />
                </View>
              );
            }}
            hasParallaxImages={true}
          />
        </ContentContainer>

        <Footer>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Carousel
              //@ts-ignore
              data={selectedItem?.url}
              sliderWidth={SCREEN_WIDTH}
              itemWidth={54}
              ref={(c) => {
                //@ts-ignore
                setFlatList(c);
              }}
              //@ts-ignore
              firstItem={selectedItem?.url.length}
              sliderHeight={100}
              itemHeight={84}
              inactiveSlideScale={0.8}
              inactiveSlideOpacity={0.7}
              onSnapToItem={(index) => {
                setImageIndex(index);
                //@ts-ignore
                carousel.snapToItem(index);
              }}
              renderItem={(url) => {
                return (
                  <View
                    style={{
                      //@ts-ignore
                      borderWidth: selectedItem?.url[imageIndex] === url.item ? 2 : 0,
                      borderColor: COLOR.PRIMARY,
                    }}
                  >
                    <Image style={{ width: 50, height: 80 }} source={{ uri: url.item }}></Image>
                  </View>
                );
              }}
            />
            <Space height={10} />
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ color: 'white' }}>{imageIndex + 1}</Text>
              <Text style={{ color: 'gray' }}>{' of '}</Text>
              <Text style={{ color: 'white' }}>
                {
                  //@ts-ignore
                  selectedItem?.url.length
                }
              </Text>
            </View>
            <Space height={25} />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginHorizontal: 30,
            }}
          >
            <Pressable onTouchStart={() => setConfirmVisible(true)}>
              <ICDownload />
            </Pressable>
            <Pressable
              onTouchStart={() => {
                const baseList = [];
                selectedItem?.url.map(async (item) => {
                  try {
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
                    message: 'KokKok Share',
                    urls: baseList ?? [],
                  });
                }, 300);
              }}
            >
              <ICShare />
            </Pressable>
            <Pressable
              onTouchStart={() => {
                navigation.navigate('/chats/chat-room/gallery/edit', {
                  checkedFileItem: selectedItem?.url,
                  media: true,
                });
              }}
            >
              <ICFilter />
            </Pressable>

            <Pressable
              onTouchStart={() => {
                if (isWithIn24Hours) {
                  if (selectedItem.url.length > 1) {
                    setNumVisible(true);
                  } else {
                    setDelVisible(true);
                  }
                } else {
                  setIsVisible(true);
                  LogUtil.info('실패');
                }
              }}
            >
              <ICDelete />
            </Pressable>
          </View>
        </Footer>
      </Wrapper>
      <Options
        menu={selectedItem.url.length > 1 ? MENU : ONEMENU}
        modalVisible={confirmVisible}
        onBackdropPress={() => {
          setConfirmVisible(false);
        }}
        photo={confirmVisible}
        onMenuPress={handleMenuPress}
        onPress={setConfirmVisible}
      />
      <Options
        menu={NUMMENU}
        modalVisible={numVisible}
        onBackdropPress={() => {
          setNumVisible(false);
        }}
        photo={numVisible}
        onMenuPress={handleMenuPress}
        onPress={setNumVisible}
      />
      <Options
        menu={isMe ? DELMENU : DELMENU2}
        modalVisible={delVisible}
        onBackdropPress={() => {
          setDelVisible(false);
        }}
        photo={delVisible}
        onMenuPress={handleMenuPress}
        onPress={setDelVisible}
      />
      <ModalBase radius={true} isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle>You can't delete this media</ModalTitle>
          <ModalText>You can delete media in 24 hours only.</ModalText>
          <ModalText>from the time it was shared.</ModalText>
          <Row style={{ paddingTop: 15 }}>
            <ConfirmButton
              onPress={async () => {
                setIsVisible(false);
              }}
            >
              <ConfirmLabel>OK</ConfirmLabel>
            </ConfirmButton>
            <View style={{ padding: 10 }} />
          </Row>
        </Column>
      </ModalBase>
    </SafeAreaView>
  );
};

export default MediaDetail;
