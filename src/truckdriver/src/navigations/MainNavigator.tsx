import * as React from 'react';
import {Dispatch, SetStateAction} from 'react';
import {createNativeStackNavigator, NativeStackNavigationProp} from "react-native-screens/native-stack";
import SplashPage from "../pages/SplashPage";
import LandingPage from "../pages/LandingPage";




export type MainNavigatorRouteParams = {
    '/': undefined;
    '/landing':undefined;

};

export type MainNavigationProp = NativeStackNavigationProp<
    MainNavigatorRouteParams,
    '/'
    >;

const Stack = createNativeStackNavigator<MainNavigatorRouteParams>();

function MainNavigator() {
    return (
        <Stack.Navigator
            initialRouteName="/"
            screenOptions={{
                headerShown: false,
                stackAnimation:'none'
            }}>
            <Stack.Screen name="/" component={SplashPage} />
            <Stack.Screen name="/landing" component={LandingPage} />


        </Stack.Navigator>
    );
}

export default MainNavigator;
