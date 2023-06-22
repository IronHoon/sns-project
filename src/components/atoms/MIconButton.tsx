import { COLOR } from 'constants/COLOR';
import React from 'react';
import { ImageSourcePropType, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

interface Props {
  style?: ViewStyle;
  onClick: () => void;
  source: ImageSourcePropType;
  position?: 'left' | 'right';
  themeColor?: boolean;
}

function IconButton({ style, onClick, source, position = 'right', themeColor = false }: Props) {
  return (
    <TouchableOpacity
      style={[position === 'right' ? styles.marginLeft : styles.marginRight, { ...style }]}
      onPress={() => onClick()}
    >
      <IconImage source={source} themeColor={themeColor} />
    </TouchableOpacity>
  );
}

export default IconButton;

const IconImage = styled.Image<{ themeColor: boolean }>`
  width: 24px;
  height: 24px;
  tint-color: ${({ theme, themeColor }) => (themeColor && theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

const styles = StyleSheet.create({
  marginLeft: { marginLeft: 15 },
  marginRight: { marginRight: 15 },
});
