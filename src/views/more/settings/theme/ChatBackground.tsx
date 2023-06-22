import React, { useCallback, useContext, useEffect, useState } from 'react';
import BackHeader from 'components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import Toast from 'react-native-toast-message';
import { Dimensions, ImageBackground, TouchableOpacity, View } from 'react-native';
import styled, { ThemeContext } from 'styled-components/native';
import BackgroundModal from './components/BackgroundModal';
import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';
import Tail from 'assets/tail.svg';
import { Avatar } from 'components/atoms/image';
import { useFocusEffect } from '@react-navigation/native';
import { BACKGROUND } from 'constants/BACKGROUND';
import { uploadS3ByImagePicker } from 'lib/uploadS3';
import { ImageLibraryOptions, launchImageLibrary } from 'react-native-image-picker';
import { patch } from 'net/rest/api';
import userAtom from 'stores/userAtom';
import { useAtom } from 'jotai';
import { t } from 'i18next';

interface BackgroundColorType {
  type: 'color' | 'image' | 'album' | '0';
  background:
    | '#f8f8f8'
    | '#59636C'
    | '#C6D4DF'
    | '#6884B3'
    | '#14B1A2'
    | '#A4CEC0'
    | '#9BBF5F'
    | '#FFCD51'
    | '#FFAA85'
    | '#E47885'
    | '#EDAAB3'
    | '#7C6267'
    | '#CCCCCC'
    | '#9D9E9D'
    | '#3F438A'
    | '#002C41'
    | '#828B9C'
    | '#CBB4D1';
}

const ButtonLabel = styled.Text<{ change: boolean }>`
  color: ${({ theme, change }) => (change ? theme.colors.PRIMARY : theme.colors.TEXT_GRAY)};
`;
const NavButtonContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding: 15px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #e3e3e3;
`;
const Icon = styled.Image`
  width: 22px;
  height: 22px;
  tint-color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const NavLabel = styled.Text`
  flex: 1;
  font-size: 14px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const PreviewContainer = styled.View`
  height: 45%;
  justify-content: center;
  align-items: center;
`;
const ChatRoomContainer = styled.View<{ color?: string }>`
  background-color: ${({ color }) => color};
  height: 80%;
  width: 50%;
  padding-top: 20px;
  padding-left: 15px;
  border-radius: 15px; ;
`;
const ProfileImageBox = styled.View`
  width: 25px;
  height: 25px;
  border-radius: 70px;
  overflow: hidden;
  margin-right: 15px;
`;
const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`;
const LeftChatBubbleContainer = styled.View`
  width: 65%;
  margin-top: 5px;
  flex-direction: row;
  align-items: flex-end;
`;
const LeftChatBubble = styled.View<{ color?: string }>`
  border-radius: 15px;
  background-color: ${({ color }) => (color !== '#f8f8f8' ? COLOR.BLACK : COLOR.WHITE)};
  width: 80px;
`;
const LeftChatText = styled.Text`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  padding-left: 15px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-right: 15px;
`;
const RightChatBubbleContainer = styled.View`
  margin-top: 5px;
  flex-direction: row;
  align-items: flex-end;
  margin-right: 15px; ;
`;
const RightChatBubble = styled.View`
  border-radius: 15px;
  background-color: ${COLOR.PRIMARY};
  width: 90px;
  margin-right: 10px;
`;
const RightChatText = styled.Text`
  color: ${COLOR.WHITE};
  padding-left: 15px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-right: 15px;
`;

const Done = ({ change, handleDone }) => {
  return (
    <TouchableOpacity onPress={() => change && handleDone()}>
      <ButtonLabel change={change}>{t('theme.Done')}</ButtonLabel>
    </TouchableOpacity>
  );
};

const ChatUI = ({ selected }) => {
  return (
    <>
      <Row>
        <ProfileImageBox>
          <Avatar size={25} />
        </ProfileImageBox>
        <LeftChatBubbleContainer>
          <Tail
            fill={selected.color === '#f8f8f8' ? COLOR.WHITE : COLOR.BLACK}
            style={{ position: 'absolute', top: -5, transform: [{ rotate: '90deg' }] }}
          />
          <LeftChatBubble color={selected.type === 'color' ? selected.color : COLOR.BLACK}>
            <LeftChatText />
          </LeftChatBubble>
        </LeftChatBubbleContainer>
      </Row>
      <Row style={{ marginTop: 15, alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }} />
        <RightChatBubbleContainer>
          <Tail
            fill={COLOR.PRIMARY}
            style={{ position: 'absolute', top: -5, right: 10, transform: [{ rotate: '90deg' }] }}
          />
          <RightChatBubble>
            <RightChatText />
          </RightChatBubble>
        </RightChatBubbleContainer>
      </Row>
    </>
  );
};

function ChatBackground() {
  const [myUser, setMyUser] = useAtom(userAtom);
  const [isChange, setIsChange] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const themeContext = useContext(ThemeContext);

  const [type, setIsType] = useState<'color' | 'image' | 'album'>('color');
  const [selected, setSelected] = useState<
    BackgroundColorType | { type: 'image'; background: number } | { type: 'album'; background: string }
  >({ type: 'color', background: '#f8f8f8' });

  const openColorsModal = () => {
    setIsType('color');
    setIsVisible(true);
  };
  const openImagesModal = () => {
    setIsType('image');
    setIsVisible(true);
  };

  const options: ImageLibraryOptions = {
    selectionLimit: 1,
    mediaType: 'photo',
    includeExtra: true,
  };

  const openGalleryModal = () => {
    launchImageLibrary(options, async (file) => {
      const mediaRes = await uploadS3ByImagePicker(file);
      if (mediaRes) {
        const { url: background } = mediaRes;
        setSelected({ type: 'album', background: background });
      }
    });
  };

  const update = useCallback(
    async (type: string, background: any) => {
      await patch('/auth/user-setting', {
        ...myUser?.setting,
        ['ct_background_type']: type,
        ['ct_background']: `${background}`,
      }).then(() => {
        let myUserSetting = {
          ...myUser,
          setting: {
            ...myUser?.setting,
            ['ct_background_type']: type,
            ['ct_background']: `${background}`,
          },
        };
        // @ts-ignore
        setMyUser(myUserSetting);

        Toast.show({
          type: 'success',
          text1: 'Changes Applied.',
        });

        setIsChange(false);
      });
    },
    [myUser],
  );

  const handleDone = () => {
    update(selected.type, selected.background);
  };

  useEffect(() => {
    const current = { type: myUser?.setting?.ct_background_type, background: myUser?.setting?.ct_background };
    if (JSON.stringify(selected) === JSON.stringify(current)) {
      setIsChange(false);
    } else {
      setIsChange(true);
    }
  }, [selected]);

  useFocusEffect(
    useCallback(() => {
      // @ts-ignore
      setSelected({ type: myUser?.setting?.ct_background_type, background: myUser?.setting?.ct_background });
    }, [myUser]),
  );

  return (
    <MainLayout>
      <BackHeader
        title={t('theme.Chat Background')}
        button={[<Done key={0} change={isChange} handleDone={handleDone} />]}
      />
      <PreviewContainer>
        {(selected.type === 'color' || selected.type === '0') && (
          <ChatRoomContainer color={selected.type === 'color' ? selected.background : '#f8f8f8'}>
            <ChatUI selected={selected} />
          </ChatRoomContainer>
        )}
        {selected.type === 'image' && (
          <ImageBackground
            source={selected.type === 'image' ? BACKGROUND[selected.background] : require('assets/background/bg01.png')}
            style={{
              height: Dimensions.get('window').height * 0.3,
              width: Dimensions.get('window').width / 2,
              paddingTop: 20,
              paddingLeft: 15,
              borderRadius: 15,
            }}
            resizeMode={'stretch'}
          >
            <ChatUI selected={selected} />
          </ImageBackground>
        )}
        {selected.type === 'album' && (
          <ImageBackground
            source={selected.type === 'album' ? { uri: selected.background } : require('assets/background/bg01.png')}
            style={{
              height: Dimensions.get('window').height * 0.3,
              width: Dimensions.get('window').width / 2,
              paddingTop: 20,
              paddingLeft: 15,
              borderRadius: 15,
            }}
            resizeMode={'stretch'}
          >
            <ChatUI selected={selected} />
          </ImageBackground>
        )}
      </PreviewContainer>
      <NavButtonContainer onPress={() => openColorsModal()}>
        <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('theme.Colors')}</NavLabel>
        <Icon source={require('assets/ic-next.png')} />
      </NavButtonContainer>
      <NavButtonContainer onPress={() => openImagesModal()}>
        <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('theme.Images')}</NavLabel>
        <Icon source={require('assets/ic-next.png')} />
      </NavButtonContainer>
      <NavButtonContainer onPress={() => openGalleryModal()}>
        <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
          {t('theme.Choose from Gallery')}
        </NavLabel>
        <Icon source={require('assets/ic-next.png')} />
      </NavButtonContainer>
      <BackgroundModal
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        type={type}
        selected={selected}
        setSelected={setSelected}
      />
    </MainLayout>
  );
}

export default ChatBackground;
