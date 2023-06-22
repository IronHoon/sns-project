import React, { useCallback, useEffect, useState } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import { Dimensions, Platform, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import { Row } from 'components/layouts/Row';
import Toast from 'react-native-toast-message';
import Slider from '@react-native-community/slider';
import { patch } from 'net/rest/api';
import { Avatar } from 'components/atoms/image';
import { useFocusEffect } from '@react-navigation/native';
import { useAtom } from 'jotai';
import userAtom from 'stores/userAtom';
import { t } from 'i18next';

const ButtonLabel = styled.Text<{ change: boolean }>`
  color: ${({ theme, change }) => (change ? theme.colors.PRIMARY : theme.colors.TEXT_GRAY)};
`;
const ChatRoomContainer = styled.View`
  background-color: ${({ theme }) => (theme.dark ? '#59636C' : COLOR.LIGHT_GRAY)};
  /* min-height: ${`${Dimensions.get('window').height / 1.5}px`}; */
  flex: 1;
  padding-top: 20px;
  padding-left: 15px;
`;
const ProfileImageBox = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 70px;
  overflow: hidden;
  margin-right: 15px;
`;
const LeftChatBubbleContainer = styled.View`
  width: 65%;
  margin-top: 5px;
  flex-direction: row;
  align-items: flex-end;
`;
const LeftChatBubble = styled.View`
  border-radius: 15px;
  background-color: ${({ theme }) => (theme.dark ? COLOR.BLACK : COLOR.WHITE)};
  width: ${`${Dimensions.get('window').width / 2}px`};
`;
const LeftChatAfter = styled.View`
  border-top-width: 30px;
  border-top-style: solid;
  border-top-color: ${({ theme }) => (theme.dark ? COLOR.BLACK : COLOR.WHITE)};
  border-left-width: 30px;
  border-left-style: solid transparent;
  border-left-color: ${({ theme }) => (theme.dark ? '#59636C' : COLOR.LIGHT_GRAY)};
  content: '';
  position: absolute;
  top: 0px;
  left: -10px;
`;
const LeftChatText = styled.Text<{ fontSize: number }>`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: ${({ fontSize }) => `${fontSize}px`};
  padding-left: 15px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-right: 15px;
`;
const TimeStamp = styled.Text`
  color: ${COLOR.DARK_GRAY};
  margin-left: 10px;
  margin-right: 10px;
`;
const RightBubbleContainer = styled.View`
  margin-top: 5px;
  flex-direction: row;
  align-items: flex-end;
  margin-right: 15px; ;
`;
const RightBubble = styled.View`
  border-radius: 15px;
  background-color: ${COLOR.PRIMARY};
  width: ${`${Dimensions.get('window').width / 2}px`};
  margin-right: 10px;
`;
const RightAfter = styled.View`
  border-top-width: 30px;
  border-top-style: solid;
  border-top-color: ${COLOR.PRIMARY};
  border-right-width: 30px;
  border-right-style: solid transparent;
  border-right-color: ${({ theme }) => (theme.dark ? '#59636C' : COLOR.LIGHT_GRAY)};
  content: '';
  position: absolute;
  top: 0px;
  right: 0px;
`;
const RightText = styled.Text<{ fontSize: number }>`
  color: ${COLOR.WHITE};
  font-size: ${({ fontSize }) => `${fontSize}px`};
  padding-left: 15px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-right: 15px;
`;
const SettingWrap = styled.View`
  height: 160px;
`;
const DescContainer = styled.View`
  justify-content: center;
  align-items: center;
  padding-top: 10px;
  height: 80px;
`;
const Desc = styled.Text`
  color: ${({ theme }) => (theme.dark ? theme.colors.WHITE : theme.colors.BLACK)};
  font-size: 13px;
`;
const Indicators = styled.TouchableOpacity`
  width: 10px;
  height: 10px;
  background-color: ${COLOR.GRAY};
  border-radius: 15px;
`;
const Divider = styled.View`
  width: ${`${Dimensions.get('window').width / 6.35}px`};
`;
const Text = styled.Text`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

const Done = ({ change, update, fontSize }) => {
  return (
    <TouchableOpacity onPress={() => change && update(fontSize)}>
      <ButtonLabel change={change}>{t('theme.Done')}</ButtonLabel>
    </TouchableOpacity>
  );
};

const getCurrentPosition = (fontSize) => {
  switch (fontSize) {
    case 13:
      return 1;
    case 15:
      return 2;
    case 18:
      return 3;
    case 20:
      return 4;
    case 25:
      return 5;
    default:
      return 2;
  }
};

function TextSize() {
  const [myUser, setMyUser] = useAtom(userAtom);

  const [isChange, setIsChange] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(15);
  const [currentPosition, setCurrentPosition] = useState(2);
  const [count, setCount] = useState(0);

  const update = useCallback(
    async (value: number) => {
      await patch('/auth/user-setting', {
        ...myUser?.setting,
        ['ct_text_size']: value,
      }).then(() => {
        let myUserSetting = {
          ...myUser,
          setting: {
            ...myUser?.setting,
            ['ct_text_size']: value,
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

  useEffect(() => {
    if (fontSize !== myUser?.setting?.ct_text_size) {
      setIsChange(true);
    }
    if (fontSize === myUser?.setting?.ct_text_size) {
      setIsChange(false);
    }
  }, [fontSize]);

  useEffect(() => {
    switch (currentPosition) {
      case 1:
        setFontSize(13);
        break;
      case 2:
        setFontSize(15);
        break;
      case 3:
        setFontSize(18);
        break;
      case 4:
        setFontSize(20);
        break;
      case 5:
        setFontSize(25);
        break;
      default:
        setFontSize(15);
        break;
    }
  }, [currentPosition]);

  useFocusEffect(
    useCallback(() => {
      // @ts-ignore
      setFontSize(myUser?.setting?.ct_text_size);
      // @ts-ignore
      setCurrentPosition(getCurrentPosition(myUser?.setting?.ct_text_size));
    }, [myUser]),
  );

  return (
    <MainLayout>
      <BackHeader
        title={t('theme.Text Size')}
        button={[<Done key={0} change={isChange} update={update} fontSize={fontSize} />]}
      />
      <ChatRoomContainer>
        <Row>
          <ProfileImageBox>
            <Avatar />
          </ProfileImageBox>
          <LeftChatBubbleContainer>
            <LeftChatAfter />
            <LeftChatBubble>
              <LeftChatText fontSize={fontSize}>
                {t('theme.Hi! How are you doing? You look good on your last post!')}
              </LeftChatText>
            </LeftChatBubble>
            <TimeStamp>17:03</TimeStamp>
          </LeftChatBubbleContainer>
        </Row>
        <Row style={{ marginTop: 15, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }} />
          <TimeStamp>17:05</TimeStamp>
          <RightBubbleContainer>
            <RightAfter />
            <RightBubble>
              <RightText fontSize={fontSize}>{t('theme.Oh, Thanks! I went there with my family last week')}</RightText>
            </RightBubble>
          </RightBubbleContainer>
        </Row>
      </ChatRoomContainer>
      <SettingWrap>
        <DescContainer>
          <Desc style={{ fontSize: fontSize }}>{t('theme.Please drag to change text size')}</Desc>
        </DescContainer>
        <Row style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 25 }}>
          <Text style={{ fontSize: 12, marginRight: 10 }}>A</Text>
          <View style={{ position: 'absolute', flexDirection: 'row' }}>
            <Indicators />
            <Divider />
            <Indicators />
            <Divider />
            <Indicators />
            <Divider />
            <Indicators />
            <Divider />
            <Indicators />
          </View>
          <Slider
            style={{ flex: 1 }}
            minimumValue={1}
            maximumValue={5}
            step={1}
            tapToSeek={true}
            value={currentPosition}
            onValueChange={(value) => {
              if (Platform.OS === 'android' && count < 1) {
                setCount(count + 1);
              } else {
                setCurrentPosition(value);
              }
            }}
            minimumTrackTintColor={COLOR.GRAY}
            maximumTrackTintColor={COLOR.GRAY}
            thumbImage={
              Platform.OS === 'ios' ? require('assets/white-circle20.png') : require('assets/white-circle60.png')
            }
          />
          <Text style={{ fontSize: 18, marginLeft: 10 }}>A</Text>
        </Row>
      </SettingWrap>
    </MainLayout>
  );
}

export default TextSize;
