import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import tw from 'twrnc';

export type RowJustifyEnum = 'center' | 'flex-end' | 'flex-start' | 'space-around' | 'space-between' | 'space-evenly';
export type RowAlignEnum = 'baseline' | 'center' | 'flex-start' | 'stretch' | 'flex-end';
type RowProps = {
  fullWidth?: boolean;
  align?: RowAlignEnum;
  justify?: RowJustifyEnum;
  wrap?: 'wrap' | 'wrap-reverse' | 'nowrap';
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const Row = ({
  children,
  align = 'flex-start',
  justify = 'flex-start',
  wrap = 'nowrap',
  fullWidth = false,
  style,
}: RowProps) => {
  const alignProps = align;
  const justifyProps = justify;
  const wrapProps = `flex-${wrap}`;
  const widthProps = fullWidth ? '100%' : 'auto';
  return (
    <View
      style={[
        tw`${wrapProps}`,
        {
          flexDirection: 'row',
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
