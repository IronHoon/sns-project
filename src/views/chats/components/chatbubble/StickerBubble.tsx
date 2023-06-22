import React from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import FastImage from 'react-native-fast-image';

const Img = styled(FastImage)<{ open: boolean }>`
  width: 100%;
  height: 100%;
  /* aspect-ratio: 1; */
  border-radius: ${({ open }) => (open ? '0px' : '11px')};
`;

const StickerBubble = ({ upload_urls }) => {
  return (
    <View style={{ width: 150, height: 150, margin: 1 }}>
      <Img
        style={{
          //@ts-ignore
          resizeMode: 'contain',
        }}
        source={{ uri: upload_urls[0] }}
      />
    </View>
  );
};

export default React.memo(StickerBubble);
