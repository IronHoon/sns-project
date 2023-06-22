import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import tw from 'twrnc';

type ColumnProps = {
  fullWidth?: boolean;
  align?: 'baseline' | 'center' | 'flex-start' | 'flex-end' | 'stretch';
  justify?: 'center' | 'flex-end' | 'flex-start' | 'space-around' | 'space-between' | 'space-evenly';
  wrap?: 'wrap' | 'wrap-reverse' | 'nowrap';
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const Column = ({
  children,
  align = 'flex-start',
  justify = 'flex-start',
  wrap = 'nowrap',
  fullWidth = false,
  style,
}: ColumnProps) => {
  const alignProps = align;
  const justifyProps = justify;
  const wrapProps = `flex-${wrap}`;
  const widthProps = fullWidth ? '100%' : 'auto';
  return (
    <View
      style={[
        tw`${wrapProps}`,
        {
          alignItems: alignProps,
          justifyContent: justifyProps,
          width: widthProps,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
