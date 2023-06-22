import React, { useContext } from 'react';
import { SafeAreaView } from 'react-native';
import SingleChildComponentProps from '../../types/SingleChildComponentProps';
import { ThemeContext } from 'styled-components';
import tw from 'twrnc';

function Screen({ children }: SingleChildComponentProps) {
  const theme = useContext(ThemeContext);
  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: theme.dark ? '#585858' : '#ffffff' }]}>
      {children}
    </SafeAreaView>
  );
}

export default Screen;
