import React from 'react';
import {SafeAreaView, View} from "react-native";
import Splash from "../views/Splash";
import Landing from "../views/Landing";

const SplashPage = ()=>{

    return <SafeAreaView style={{flex:1}}>
        <Landing/>
    </SafeAreaView>
}

export default SplashPage;
