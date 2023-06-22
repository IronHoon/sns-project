import React, { useRef } from 'react';
import ImageZoom, { ImageZoomProps } from 'react-native-image-pan-zoom';
import { Dimensions, View, Image, Platform } from 'react-native';

interface ImageViewerProps {
  source: string;
  width?: any;
  height?: any;
  style?: ImageZoomProps['style'];
  onScaleChange?: (scale: number) => void;
}

const ImageViewer = ({
  source,
  width = Dimensions.get('window').width,
  height = Dimensions.get('window').height,
  onScaleChange,
  ...props
}) => {
  const scaleValue = useRef(1);
  return (
    <ImageZoom
      cropWidth={Dimensions.get('window').width}
      cropHeight={Dimensions.get('window').height * 0.6}
      imageWidth={width}
      imageHeight={height}
      minScale={1}
      {...props}
      onStartShouldSetPanResponder={(e) => {
        return e.nativeEvent.touches.length === 2 || scaleValue.current > 1;
      }}
      onMove={({ scale }) => {
        scaleValue.current = scale;
        onScaleChange && onScaleChange(scale);
      }}
    >
      <View
        style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
        onStartShouldSetResponder={(e) => {
          console.log(scaleValue.current, e.nativeEvent.touches.length < 2 && scaleValue.current <= 1);
          return e.nativeEvent.touches.length < 2 && scaleValue.current <= 1;
        }}
      >
        <Image source={{ uri: source }} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
      </View>
    </ImageZoom>
  );
};

export default ImageViewer;
