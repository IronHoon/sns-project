import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '../../../../navigations/MainNavigator';
import { Dimensions, FlatList, Image, ImageStyle, StyleProp, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import FastImage from 'react-native-fast-image';
import LogUtil from '../../../../utils/LogUtil';

const ImageBubble = ({ room, selectedItem, isMe, upload_urls, showMenu, isLightbox, userName }) => {
  const navigation = useNavigation<MainNavigationProp>();

  if (upload_urls?.length === 1) {
    return (
      <TouchableOpacity
        style={{ marginLeft: isMe ? 0 : 5, marginRight: isMe ? 5 : 0 }}
        onPress={() => {
          navigation.navigate('/chats/chat-room/media-detail', {
            selectedItem: selectedItem,
            room: room,
            userName: userName,
          });
        }}
        onLongPress={() => {
          showMenu();
        }}
      >
        <AutoRatioImage
          width={!isLightbox ? Dimensions.get('window').width * 0.55 : Dimensions.get('window').width * 1}
          marginLeft={isMe && !isLightbox ? 10 : undefined}
          marginRight={isMe && !isLightbox ? undefined : 10}
          url={upload_urls[0]}
        />
      </TouchableOpacity>
    );
  }

  const flatListWidth = Dimensions.get('window').width * 0.65;
  return (
    <FlatList
      style={{
        width: flatListWidth,
        marginLeft: isMe ? 10 : undefined,
        marginRight: isMe ? undefined : 10,
      }}
      data={upload_urls}
      renderItem={({ item: url }) => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('/chats/chat-room/media-detail', {
              selectedItem: selectedItem,
              room: room,
              userName: userName,
            });
          }}
          onLongPress={() => {
            showMenu();
          }}
          style={{
            flex: !isLightbox ? 1 : undefined,
          }}
        >
          <Image
            style={{
              width: !isLightbox ? '100%' : Dimensions.get('window').width * 1,
              height: !isLightbox ? '100%' : '100%',
              resizeMode: !isLightbox ? undefined : 'contain',
              aspectRatio: !isLightbox ? 1 : undefined,
              flex: !isLightbox ? 1 : undefined,
            }}
            source={{ uri: `${url}?w=160&h=160` }}
          />
        </TouchableOpacity>
      )}
      numColumns={3}
      keyExtractor={(url) => url}
    />
  );
};

interface AutoRatioImageType {
  marginLeft?: number;
  marginRight?: number;
  style?: StyleProp<ImageStyle>;
  url: string;
  width: number;
}

const AutoRatioImage = function (props: AutoRatioImageType) {
  const [state, setState] = useState<object>({});
  useEffect(() => {
    Image.getSize(props.url, (width, height) => {
      setState({ aspectRatio: width / height, width: width, height: height });
    });
  }, []);

  return (
    <FastImage
      resizeMode={'contain'}
      source={{ uri: props.url }}
      style={{
        //@ts-ignore
        opacity: state?.aspectRatio ? 1 : 0,
        //@ts-ignore
        aspectRatio: state?.aspectRatio ? state.aspectRatio : undefined,
        //@ts-ignore
        width: props.width,
        //@ts-ignore
        height: state?.aspectRatio ? props.width / state.aspectRatio : undefined,
        marginLeft: props?.marginLeft ? props.marginLeft : undefined,
        marginRight: props?.marginRight ? props.marginRight : undefined,
      }}
    />
  );
};

export default React.memo(ImageBubble);
