import React, {useCallback} from 'react';
import {Image, ImageBackground, StyleSheet, View} from "react-native";
import MyAppText from "../components/MyAppText";
import Space from "../components/Space";
import {MainNavigationProp} from "../navigations/MainNavigator";
import {useFocusEffect, useNavigation} from "@react-navigation/native";

const Splash = ()=>{

    const navigation = useNavigation<MainNavigationProp>();

    useFocusEffect(
        useCallback(() => {
            setTimeout(() => {
                navigation.navigate('/landing');
            }, 1000);
        }, []),
    );

    return <View style={{flex:1, justifyContent:'center',alignContent:'center', width:'100%', backgroundColor:'#3251d3'}}>
        <View style={{height:'100%', width:'100%', position:'absolute', overflow:'hidden'}}>
                <Image source={require('../assets/background.png')} style={{position:'absolute',bottom:-210,left:-350, width:900,height:900*2399/3403}} resizeMode={'cover'}></Image>
        </View>

            <View style={{width:'100%', alignContent:'center',}}>
                <Image source={require('../assets/ic_truck.png')} style={{alignSelf:'center', width:180 , height:180*330/582, }} />
                <Space height={4}/>
                    <MyAppText style={{color:'white', fontSize:40, alignSelf:'center',lineHeight:40}}>슬기로운</MyAppText>
                <Space height={5}/>
                    <MyAppText style={{color:'white', fontSize:40, alignSelf:'center'}} >화물기사생활</MyAppText>
                <Space height={8}/>
                <MyAppText style={{color:'white', fontSize:14, alignSelf:'center', fontFamily:'NanumSquareR'}} >화물운송종사자격시험 대비 완전정복</MyAppText>
            </View>
        <View style={{position:'absolute', width:'100%' ,  height:100, bottom:120, justifyContent:'center',}}>
            <MyAppText style={{color:'white',alignSelf:'center',fontFamily:'NanumSquareR', fontWeight:'700', fontSize:16}}>주원통운 X 한양대학교</MyAppText>

        </View>
    </View>
}

const styles = StyleSheet.create({
    bgImage:{
        height: '100%',
        display: 'flex',

    }
})

export default Splash;
