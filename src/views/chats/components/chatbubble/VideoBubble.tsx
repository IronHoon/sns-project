import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import LogUtil from '../../../../utils/LogUtil';

const VideoBubble = ({ upload_urls, onPressVideoBubble, showMenu }) => {
  console.log('upload_urls', upload_urls[1]);
  return (
    <View
      style={{
        width: 200,
        alignSelf: 'center',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        height: 200,
        marginLeft: 10,
        marginRight: 10,
      }}
    >
      <TouchableOpacity
        style={{
          position: 'absolute',
          width: 200,
          borderRadius: 11,
          height: 200,
        }}
        onLongPress={() => {
          showMenu();
        }}
      >
        <Image
          style={{
            position: 'absolute',
            width: 200,
            borderRadius: 11,
            height: 200,
          }}
          source={{ uri: upload_urls[1] }}
        />
      </TouchableOpacity>
      {upload_urls?.[0] && upload_urls?.[1] && (
        <TouchableOpacity onPress={() => onPressVideoBubble(upload_urls[0])}>
          <Image style={{ width: 40, height: 40 }} source={require('/assets/chats/chatroom/ic_play_overlay.png')} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default React.memo(VideoBubble);
