import React from 'react';
import { StyleProp } from 'react-native';
import { View, ViewStyle } from 'react-native';
import tw from 'twrnc';

interface CenterProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const Center = ({ children, style }: CenterProps) => (
  <View style={[tw`items-center justify-center`, style]}>{children}</View>
);
