import React, {useEffect, useState} from 'react';
import {Image, Platform, Pressable, View} from "react-native";
import Space from "../components/Space";
import MyAppText from "../components/MyAppText";
import {login} from "@react-native-seoul/kakao-login";
import appleAuth from "@invertase/react-native-apple-authentication";
import {post} from "../net/rest/api";

const Landing = ()=>{
    const [result, setResult] = useState<string>('');

    const signInWithKakao = async (): Promise<void> => {
        try {
            const token = await login();
            setResult(JSON.stringify(token));
            console.log('tokenResult',token);
            await post('/User/login',{
                id:'1601070820',
                login_type:'kakao',
                dev_type:Platform.OS ==='ios'?'ios':'android',
                dev_token:''
            }).then((result)=>console.log(result))
        } catch (err) {
            console.error('login err', err);

        }
    };

    const onAppleButtonPress = async () =>{
        // performs login request
        const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            // Note: it appears putting FULL_NAME first is important, see issue #293
            requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
        });

        // get current authentication state for user
        // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
        const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

        // use credentialState response to ensure the user is authenticated
        if (credentialState === appleAuth.State.AUTHORIZED) {
            // user is authenticated
            console.log('success applelogin', appleAuthRequestResponse.user)
            await post('/User/login',{
                id:'apple_id',
                login_type:'apple',
                dev_type:Platform.OS ==='ios'?'ios':'android',
                dev_token:''
            }).then((result)=>console.log(result))
        }else{
            console.log('fail to login')
        }
    }

    useEffect(() => {
        // onCredentialRevoked returns a function that will remove the event listener. useEffect will call this function when the component unmounts
        return appleAuth.onCredentialRevoked(async () => {
            console.warn('If this function executes, User Credentials have been Revoked');
        });
    }, []);

    return <View style={{flex:1, justifyContent:'center',alignContent:'center', width:'100%', backgroundColor:'#3251d3'}}>
        <View style={{height:'100%', width:'100%', position:'absolute', overflow:'hidden'}}>
            <Image source={require('../assets/background.png')} style={{position:'absolute',bottom:-210,left:-350, width:900,height:900*2399/3403}} resizeMode={'cover'}></Image>
        </View>

        <View style={{width:'100%', alignContent:'center',}}>
            <Space height={100}/>
            <MyAppText style={{color:'white' ,alignSelf:'center', fontFamily:'NanumSquareR', fontSize:20}}>
                로그인 계정을 선택하세요
            </MyAppText>
            <Space height={25}/>
            <Pressable onPress={()=>{
                console.log('hihihi')
                signInWithKakao();}} style={{width:'80%', height:60, alignItems:'center', justifyContent:'center',alignSelf:'center', backgroundColor:'white', borderRadius:5, flexDirection:'row'}}>
                <Image source={require('../assets/ktalk-logo-black-and-white.png')} style={{width:40,height:40}}/>
                <Space width={10}/>
                <MyAppText>카카오 계정으로 로그인</MyAppText>

            </Pressable>
            <Space height={15}/>
            <Pressable onPress={()=>onAppleButtonPress()} style={{width:'80%', height:60, alignItems:'center', justifyContent:'center',alignSelf:'center', backgroundColor:'white', borderRadius:5, flexDirection:'row'}}>
                <Image source={require('../assets/Apple-logo-black-and-white.png')} style={{width:30,height:35}}/>
                <Space width={10}/>
                <MyAppText>APPLE로 로그인</MyAppText>

            </Pressable>
        </View>

    </View>
}

export default Landing;
