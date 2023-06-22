import React, { useCallback } from 'react';
import styled, { css } from 'styled-components/native';
import { Pressable, Text, TextStyle, View, ViewStyle } from 'react-native';
import tw from 'twrnc';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { COLOR } from 'constants/COLOR';
import { RADIUS } from 'constants/RADIUS';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import i18n from '../../../i18n';
import { isDev } from '../../utils/isDev';
import MainLayout from 'components/layouts/MainLayout';
import chatStatusAtom from '../../stores/chatStatusAtom';

//[TODO] 버튼 공통 컴포넌트 적용
interface Props {
  children?: string;
  onTouchStart?: () => void;
  onPress?: () => void;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  disabled?: boolean;
}

interface ContainerProps {
  children?: React.ReactNode | string;
  onPress?: () => void;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  disabled?: boolean;
}

interface LabelProps {
  children?: string;
  style?: TextStyle;
  disabled?: boolean;
}
function Button({ children, onTouchStart, onPress, style, labelStyle, disabled }: Props) {
  return (
    <Container
      onTouchStart={onTouchStart}
      onPress={() => {
        if (!disabled) {
          onPress?.();
        }
      }}
      style={style}
      disabled={disabled}
    >
      <Label disabled={disabled} style={labelStyle}>
        {children}
      </Label>
    </Container>
  );
}

const Container = styled.Pressable<ContainerProps>`
  background-color: ${({ disabled }) => (disabled ? '#ededed' : '#f68722')};
  width: 100%;
  height: 70px;
  align-items: center;
  justify-content: center;
`;

const Label = styled.Text<LabelProps>`
  color: ${({ disabled }) => (disabled ? '#ccc' : '#fff')};
  font-size: 18px;
  font-weight: bold;
`;

const Logo = styled.Image`
  width: 100px;
  height: 120px;
  margin-bottom: 30px;
`;

const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const Description = styled.Text`
  margin-top: 15px;
  font-size: 14px;
  line-height: 20px;
  color: ${COLOR.TEXT_GRAY};
  text-align: center;
`;

const DescButton = styled.Pressable<{ borderRight?: boolean }>`
  padding: 0 12px;
  height: 16px;
  ${({ borderRight }) => {
    return (
      borderRight &&
      css`
        border-right-width: 1px;
        border-right-color: ${COLOR.GRAY};
      `
    );
  }}
`;

const DescButtonLabel = styled.Text<{ active?: boolean }>`
  font-size: 12px;
  color: ${({ active }) => (active ? COLOR.PRIMARY : COLOR.TEXT_GRAY)};
`;

function Landing() {
  const navigation = useNavigation<MainNavigationProp>();
  const { t } = useTranslation();
  const [chatStatus, setChatStatus] = useAtom(chatStatusAtom);

  useFocusEffect(
    useCallback(() => {
      setChatStatus({
        ...chatStatus,
        rooms: null,
      });
    }, []),
  );

  return (
    <MainLayout>
      <View
        style={tw.style(`flex-1 justify-center items-center`, {
          padding: 30,
        })}
      >
        <View style={tw`flex-1 justify-center items-center`}>
          <Logo source={require('../../assets/logo.png')} />
          <Title>{t('landing.Welcome!')}</Title>
          <Description>{t('landing.Enjoy messenger, voice and video chat for free!')}</Description>
          {isDev() && (
            <View style={tw`items-center m-4`}>
              <Pressable
                onPress={() => {
                  navigation.navigate('/__dev__/page-list');
                }}
              >
                <Text>테스트 전용 : 페이지 목록으로</Text>
              </Pressable>
            </View>
          )}
        </View>
        <View style={{ width: '100%' }}>
          <Button
            style={tw.style(`mb-15px`, { borderRadius: RADIUS.MD })}
            onTouchStart={() => {
              navigation.navigate('/phone-number-input', { route: 'sign-in' });
            }}
          >
            {t('landing.LOGIN')}
          </Button>
          <Button
            style={tw.style(`bg-white border`, { borderRadius: RADIUS.MD, borderColor: COLOR.PRIMARY })}
            labelStyle={tw.style(`text-[${COLOR.PRIMARY}]`)}
            onTouchStart={() => {
              navigation.navigate('/phone-number-input', { route: 'sign-up' });
            }}
          >
            {t('landing.REGISTER')}
          </Button>
        </View>
        <View style={tw`mt-30px mb-10px flex-row`}>
          <DescButton
            borderRight
            onTouchStart={() => {
              i18n.changeLanguage('lo');
            }}
          >
            <DescButtonLabel active={i18n.language === 'lo'}>ພາສາລາວ</DescButtonLabel>
          </DescButton>
          <DescButton
            onTouchStart={() => {
              i18n.changeLanguage('en');
            }}
          >
            <DescButtonLabel active={i18n.language === 'en'}>English</DescButtonLabel>
          </DescButton>
        </View>
      </View>
    </MainLayout>
  );
}

export default Landing;
