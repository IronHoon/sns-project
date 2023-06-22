import React from 'react';
import { View } from 'react-native';
import styled, { css } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { COLOR } from 'constants/COLOR';
import { MainNavigationProp } from '../../navigations/MainNavigator';

interface PrevHeaderProps {
  onClick?: () => void;
  title?: React.ReactElement;
  border?: boolean;
  button?;
  buttonWrap?: boolean;
  themeColor?: boolean;
}

export default function PrevHeader({
  onClick,
  title,
  border = true,
  button,
  buttonWrap,
  themeColor = true,
}: PrevHeaderProps) {
  const navigation = useNavigation<MainNavigationProp>();

  return (
    <HeaderContainer border={border}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
        <PrevHeaderButton
          onPress={() => {
            if (onClick) {
              onClick();
            } else {
              navigation.goBack();
            }
          }}
        >
          <View style={[{ width: 22, height: 22 }]}>
            <IconImage themeColor={themeColor} source={require('../../assets/ic-prev.png')} />
          </View>
        </PrevHeaderButton>
        {title}
        <ButtonContainer buttonWrap={buttonWrap}>{button}</ButtonContainer>
      </View>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.View<{ border?: boolean }>`
  ${(props) =>
    props.theme.dark || !props.border
      ? css``
      : css`
          border-bottom-width: 1px;
          border-color: ${COLOR.GRAY};
        `}
  height: 56px;
  padding-right: 15px;
`;

const PrevHeaderButton = styled.TouchableOpacity`
  padding: 15px 10px 15px 15px;
`;
const ButtonContainer = styled.View<{ buttonWrap?: boolean }>`
  position: absolute;
  right: 0;
  flex-direction: row;
  ${({ buttonWrap, theme }) =>
    buttonWrap &&
    css`
      background-color: ${theme.dark ? '#30302E' : '#f8f8f8'};
    `}
  padding: 8px;
  padding-left: 0px;
  padding-right: 13px;
  border-radius: 18px;
`;

const IconImage = styled.Image<{ themeColor: boolean }>`
  width: 22px;
  height: 22px;
  tint-color: ${(props) => (props.themeColor && props.theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
