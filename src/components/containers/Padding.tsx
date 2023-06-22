import React from 'react';
import { View, ViewStyle } from 'react-native';

interface Props {
  children?: React.ReactNode | React.ReactNode[];
  padding?: number;
  style?: ViewStyle;
}

function Padding({ children, padding = 15, style }: Props) {
  return (
    <View
      style={[
        {
          padding: padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export default Padding;
