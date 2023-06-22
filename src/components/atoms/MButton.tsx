import React from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

interface Props {
  children?: string;
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

function Button({ children, onPress, style, labelStyle, disabled }: Props) {
  return (
    <Container
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

const Container = styled.TouchableOpacity<ContainerProps>`
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

export default Button;
