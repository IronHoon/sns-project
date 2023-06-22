import Navbar from 'components/molecules/Navbar';
import { useAtomValue } from 'jotai';
import React from 'react';
import { StatusBar, View } from 'react-native';
import themeAtom from 'stores/themeAtom';
import styled from 'styled-components/native';
import tw from 'twrnc';

type Props = {
  children?: React.ReactNode;
  themeColor?: boolean;
  color?: string;
};

export default function NavbarLayout({ children, themeColor = true, color = '#ffffff' }: Props) {
  const theme = useAtomValue(themeAtom);
  const isDarkMode = theme === 'dark';
  return (
    <Component themeColor={themeColor} color={color}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={tw`flex-1`}>{children}</View>
      <View style={tw`h-1.3/17`} />
      <Navbar />
    </Component>
  );
}

const Component = styled.SafeAreaView<{ themeColor: boolean; color: string }>`
  background-color: ${(props) => (props.themeColor ? props.theme.colors.background : props.color)};
  flex: 1;
`;
