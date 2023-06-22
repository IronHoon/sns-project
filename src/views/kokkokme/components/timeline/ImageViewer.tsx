import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import FastImage from 'react-native-fast-image';
import { COLOR } from '../../../../constants/COLOR';
import ICClose from 'assets/ic_close_22.svg';

const ImageViewer = ({ url, visible, onClose }) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  return (
    <Modal visible={visible} onRequestClose={onClose} statusBarTranslucent animationType="slide">
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Pressable onPress={onClose}>
          <ICClose />
        </Pressable>
      </View>

      <ImageZoom
        style={styles.container}
        cropWidth={screenWidth}
        cropHeight={screenHeight}
        imageWidth={imageSize.width}
        imageHeight={imageSize.height}
        maxOverflow={0}
      >
        <Image
          //@ts-ignore
          url={url}
          resizeMode="contain"
          loaderSize="large"
          onLoad={({ nativeEvent }) => {
            let width = nativeEvent.width;
            let height = nativeEvent.height;

            console.log(`${width} ${height}`);

            // If image width is bigger than screen => zoom ratio will be image width
            if (width > screenWidth) {
              const ratio = screenWidth / width;
              width *= ratio;
              height *= ratio;
            }

            // If image height is still bigger than screen => zoom ratio will be image height
            if (height > screenHeight) {
              const ratio = screenHeight / height;
              width *= ratio;
              height *= ratio;
            }
            setImageSize({ height, width });
          }}
          onPress={() => {}}
          containerStyle={styles.container}
          style={{}}
        />
      </ImageZoom>
    </Modal>
  );
};

export default ImageViewer;

const BG_COLOR = 'rgba(0, 0, 0, 1)';
const OVERLAY_COLOR = 'rgba(0, 0, 0, 0.5)';
const TEXT_COLOR = 'rgba(255, 255, 255, 1)';

const Image = ({ url, onPress, onLoad, style, loaderSize, ...restProps }) => {
  const [loaded, setLoaded] = useState(false);
  const handleLoading = (event) => {
    setLoaded(true);
    onLoad && onLoad(event);
  };
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const size = Math.min(windowWidth, windowHeight);
  return (
    <TouchableOpacity style={[styles.base]} onPress={onPress} disabled={true}>
      <FastImage
        style={[{ width: size, height: size }, style]}
        onLoad={handleLoading}
        source={{ uri: url }}
        {...restProps}
      />
      {!loaded && <ActivityIndicator color={COLOR.PRIMARY} style={styles.loader} size={loaderSize} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  BackText: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  container: { backgroundColor: BG_COLOR },
  header: {
    alignItems: 'flex-end',
    backgroundColor: OVERLAY_COLOR,
    flexDirection: 'row',
    height: 70,
    justifyContent: 'space-between',
    left: 0,
    paddingBottom: 8,
    paddingHorizontal: 20,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
  },
  base: {
    height: '100%',
    width: '100%',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BG_COLOR,
  },
  headerText: {
    color: TEXT_COLOR,
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    paddingLeft: 12,
    paddingRight: 6,
  },
  image: { borderRadius: 10, height: '100%', width: '100%' },
  imagesWrap: { height: '100%', width: '100%' },
});
