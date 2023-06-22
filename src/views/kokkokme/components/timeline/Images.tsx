import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Image, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Lightbox from 'react-native-lightbox-v2';
import Carousel from 'react-native-snap-carousel';
import styled from 'styled-components';

import Next from 'assets/kokkokme/btn-next.svg';
import Prev from 'assets/kokkokme/btn-prev.svg';
import FastImage from 'react-native-fast-image';
import VideoPlayerIos from './VideoPlayerIos';
import VideoPlayerAnd from './VideoPlayerAnd';
import LogUtil from '../../../../utils/LogUtil';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import ImageViewer from '../timeline/ImageViewer';
import Zoom from 'react-native-zoom-reanimated';

const { width: WIDTH } = Dimensions.get('window');
const IMG_WIDTH = WIDTH - 40;

const Container = styled(Pressable)<{ isShared?: boolean; imagesWrap?: boolean }>`
  height: ${({ isShared, imagesWrap }) => (isShared ? IMG_WIDTH - 30 : imagesWrap ? WIDTH : IMG_WIDTH)}px;
  margin-top: ${({ imagesWrap }) => (imagesWrap ? 0 : 15)}px;
  position: relative;
  width: ${({ isShared, imagesWrap }) => (isShared ? IMG_WIDTH - 30 : imagesWrap ? WIDTH : IMG_WIDTH)}px;
`;
const IcContainer = styled(TouchableOpacity)<IcContainerStyle>`
  position: absolute;
  top: ${IMG_WIDTH / 2 + 12}px;
  z-index: 10;

  ${({ left }) => (left ? `left: ${left}px;` : '0px;')}
  ${({ right }) => (right ? `right: ${right}px;` : '0px;')}
`;

const Pagination = styled(View)<{ imagesWrap?: boolean }>`
  align-items: center;
  background: rgba(38, 37, 37, 0.5);
  border-radius: 12px;
  bottom: 15px;
  color: #fff;
  display: flex;
  flex-direction: row;
  height: 20px;
  left: ${({ imagesWrap }) => (imagesWrap ? WIDTH / 2 - 24 : IMG_WIDTH / 2 - 24)}px;
  justify-content: center;
  position: absolute;
  width: 48px;
`;
const Num = styled(Text)`
  color: #fff;
  font-size: 12px;
`;

interface Props {
  images?: string[];
  media?: any[];
  isShared?: boolean;
  isPlay?: boolean;
  imagesWrap?: boolean;
}

interface RenderItemProps {
  item: string;
  index: number;
}

interface IcContainerStyle {
  left?: number;
  right?: number;
}

const Images = ({ images, isShared, media, isPlay, imagesWrap = false }: Props) => {
  const sliderRef = useRef<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const [active, setActive] = useState<number>(sliderRef.current?._activeItem || 0);
  console.log('sliderRef ', sliderRef.current?._activeItem, images);
  // console.log(active);
  const renderItem = useCallback(
    ({ item, index }: RenderItemProps) => {
      if (images) {
        return (
          <Container key={index} isShared={isShared} imagesWrap={imagesWrap}>
            <Lightbox>
              <FastImage
                resizeMode="contain"
                source={{
                  uri: item,
                  priority: FastImage.priority.low,
                }}
                style={imagesWrap ? styles.imagesWrap : styles.image}
              />
            </Lightbox>
          </Container>
        );
      } else {
        //@ts-ignore
        if (item?.type?.includes('image')) {
          return (
            <>
              <Container key={index} isShared={isShared} imagesWrap={imagesWrap}>
                <Pressable
                  onPress={() => {
                    setIsVisible(true);
                  }}
                >
                  <FastImage
                    resizeMode="contain"
                    //@ts-ignore
                    source={{ uri: item.url, priority: FastImage.priority.low }}
                    style={imagesWrap ? styles.imagesWrap : styles.image}
                  />
                </Pressable>
              </Container>
            </>
          );
        } else {
          // return Platform.OS === 'ios' ? (
          //   <VideoPlayerIos
          //     active={active}
          //     //@ts-ignore
          //     video={item.url}
          //   />
          // ) : (
          //   <VideoPlayerAnd
          //     fullscreen={false}
          //     //@ts-ignore
          //     video={item.url}
          //   // toggleFullscreen={() => toggleFullscreen?.(id)}
          //   />
          // );

          return (
            <VideoPlayerAnd
              fullscreen={false}
              //@ts-ignore
              video={item.url}
              // toggleFullscreen={() => toggleFullscreen?.(id)}
            />
          );

          //@ts-ignore
          // <VideoPlayer item={item.url}/>
          //   //@ts-ignore
          //   <View style={{marginTop:15, borderRadius:20, backgroundColor:'black'}}>
          //     <Video repeat={true} source={{ uri: item.url }} style={{ width: screenWidth, height:screenWidth  }} />
          //   </View>
        }
      }
    },
    [isShared],
  );

  const pressPrev = () => {
    if (active > 0) sliderRef.current.snapToPrev();
  };

  const pressNext = () => {
    if (images) {
      if (active < images.length - 1) sliderRef.current.snapToNext();
    } else if (media) {
      if (active < media.length - 1) sliderRef.current.snapToNext();
    }
  };

  // useEffect(()=>{
  //   sliderRef.current.snapToItem(active)
  // },[active])

  return (
    <View>
      {images ? (
        <>
          {images.length > 1 && active !== 0 && (
            <IcContainer left={10} onPress={pressPrev}>
              <Prev />
            </IcContainer>
          )}
          <Carousel
            data={images}
            inactiveSlideScale={1}
            itemWidth={IMG_WIDTH}
            renderItem={renderItem}
            sliderWidth={IMG_WIDTH}
            ref={sliderRef}
            onSnapToItem={(index) => setActive(index)}
          />
          {images.length > 1 && (
            <Pagination imagesWrap={imagesWrap}>
              <Num>
                {active + 1}/{images.length}
              </Num>
            </Pagination>
          )}
          {images?.length > 1 && active !== images!.length - 1 && (
            <IcContainer right={10} onPress={pressNext}>
              <Next />
            </IcContainer>
          )}
        </>
      ) : media ? (
        <>
          {media.length > 1 && active !== 0 && (
            <IcContainer left={10} onPress={pressPrev}>
              <Prev />
            </IcContainer>
          )}
          <Carousel
            data={media}
            inactiveSlideScale={1}
            itemWidth={imagesWrap ? WIDTH : IMG_WIDTH}
            renderItem={renderItem}
            sliderWidth={imagesWrap ? WIDTH : IMG_WIDTH}
            ref={sliderRef}
            onSnapToItem={(index) => setActive(index)}
          />
          {media[active] && (
            <ImageViewer
              url={media[active]?.url ?? ''}
              data={media}
              visible={isVisible}
              onClose={() => setIsVisible(false)}
              active={active}
              title={''}
            />
          )}
          {media.length > 1 && (
            <Pagination imagesWrap={imagesWrap}>
              <Num>
                {active + 1}/{media.length}
              </Num>
            </Pagination>
          )}
          {media?.length > 1 && active !== media!.length - 1 && (
            <IcContainer right={10} onPress={pressNext}>
              <Next />
            </IcContainer>
          )}
        </>
      ) : (
        <></>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: { borderRadius: 10, height: '100%', width: '100%' },
  imagesWrap: { height: '100%', width: '100%' },
});

export default Images;
