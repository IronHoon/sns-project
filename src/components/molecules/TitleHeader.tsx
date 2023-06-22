import React from 'react';
import { View } from 'react-native';
import Padding from '../containers/Padding';
import styled, { css } from 'styled-components/native';

interface TitleHeader {
  title?: string;
  border?: boolean;
  button?: Array<React.ReactElement>;
  justify?: 'flex-start' | 'center';
  themeColor?: boolean;
}

export default function TitleHeader({
  title,
  border = true,
  justify = 'center',
  button,
  themeColor = true,
}: TitleHeader) {
  return (
    <HeaderContainer border={border}>
      <Padding>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: justify }}>
          <Title themeColor={themeColor} justify={justify}>
            {title}
          </Title>
          <ButtonContainer>{button}</ButtonContainer>
        </View>
      </Padding>
    </HeaderContainer>
  );
}

const Title = styled.Text<{ justify: string; themeColor: boolean }>`
  font-size: ${(props) => (props.justify === 'center' ? '16px' : '22px')};
  font-weight: ${(props) => (props.justify === 'center' ? '500' : 'bold')};
  color: ${(props) =>
    props.themeColor
      ? props.theme.dark
        ? props.theme.colors.WHITE
        : props.theme.colors.BLACK
      : props.theme.colors.BLACK};
`;

const HeaderContainer = styled.View<{ border?: boolean }>`
  ${(props) =>
    props.theme.dark || !props.border
      ? css``
      : css`
          border-bottom-width: 1px;
          border-color: ${(props) => props.theme.colors.GRAY};
        `}/* height: 56px; */
`;
const ButtonContainer = styled.View`
  position: absolute;
  right: 0;
  bottom: 0;
  flex-direction: row;
`;
