import React from 'react';
import { View } from 'react-native';
import Padding from '../containers/Padding';
import styled, { css } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { COLOR } from 'constants/COLOR';

interface CloseHeaderProps {
  onClick?: () => void;
  title?: string;
  border?: boolean;
  button?: Array<React.ReactElement>;
  position?: 'left' | 'right';
  themeColor?: boolean;
  white?: boolean;
}

export default function CloseHeader({
  onClick,
  title,
  border = true,
  button,
  position = 'right',
  themeColor = true,
  white = false,
}: CloseHeaderProps) {
  const navigation = useNavigation();

  return (
    <HeaderContainer border={border}>
      <Padding>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <CloseHeaderButton
            style={{ padding: 10 }}
            position={position}
            onPress={() => {
              if (onClick) {
                onClick();
              } else {
                navigation.goBack();
              }
            }}
          >
            <IconImage themeColor={themeColor} white={white} source={require('../../assets/ic-close.png')} />
          </CloseHeaderButton>
          <Title themeColor={themeColor}>{title}</Title>
          <ButtonContainer position={position}>{button}</ButtonContainer>
        </View>
      </Padding>
    </HeaderContainer>
  );
}

const Title = styled.Text<{ themeColor: boolean }>`
  font-size: 16px;
  font-weight: 500;
  color: ${(props) => (props.themeColor ? (props.theme.dark ? '#ffffff' : '#000000') : '#000000')};
`;

const HeaderContainer = styled.View<{ border?: boolean }>`
  ${(props) =>
    props.theme.dark || !props.border
      ? css``
      : css`
          border-bottom-width: 1px;
          border-color: ${COLOR.GRAY};
        `}
  height: 56px;
`;

const CloseHeaderButton = styled.TouchableOpacity<{ position: 'left' | 'right' }>`
  position: absolute;
  ${(props) => (props.position === 'left' ? { left: 0 } : { right: 0 })};
`;
const ButtonContainer = styled.View<{ position: 'left' | 'right' }>`
  position: absolute;
  right: 0;
  flex-direction: row;
  ${(props) => (props.position === 'right' ? { left: 0 } : { right: 0 })};
`;

const IconImage = styled.Image<{ themeColor: boolean; white: boolean }>`
  width: 16px;
  height: 16px;
  tint-color: ${(props) =>
    props.white
      ? props.theme.colors.WHITE
      : props.themeColor && props.theme.dark
      ? props.theme.colors.WHITE
      : props.theme.colors.BLACK};
`;
