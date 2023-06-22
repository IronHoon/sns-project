/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {NavigationContainer} from "@react-navigation/native";
import {RootNavigation} from "./navigations/RootNavigation";
import MainNavigator from "./navigations/MainNavigator";


function App(): JSX.Element {

  return (
      <NavigationContainer ref={RootNavigation.navigationRef}>
        <MainNavigator />
      </NavigationContainer>
  );
}



export default App;
