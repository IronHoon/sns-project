import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components/native';
import tw from 'twrnc';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { H4 } from 'components/atoms/typography/Heading';
import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import { Camera } from 'react-native-camera-kit';
import { t } from 'i18next';
import LogUtil from 'utils/LogUtil';
import QRCode from 'react-native-qrcode-svg';
import { useAtom } from 'jotai';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import ICDownload from '/assets/ic_download_25.svg';
import ICBack from '/assets/ic_back_25.svg';
import ICShare from '/assets/ic_share_25.svg';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import RNFS from 'react-native-fs';
import SHARE from 'react-native-share';
import userAtom from '../stores/userAtom';
import { MainNavigationProp } from '../navigations/MainNavigator';
import { useFetchWithType } from '../net/useFetch';
import { get, post } from '../net/rest/api';
import SwrContainer from '../components/containers/SwrContainer';
import Space from '../components/utils/Space';
import { multiUploadS3ByFilePath } from '../lib/uploadS3';
import { ModalBase } from '../components/modal';
import { Column } from '../components/layouts/Column';
import { Row } from '../components/layouts/Row';
import { COLOR } from '../constants/COLOR';
import { ImageLibraryOptions, launchImageLibrary } from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import User from '../types/auth/User';
import axios from 'axios';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const Wrapper = styled.SafeAreaView`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #fff;
`;

const ItemWrapper = styled.View`
  width: 33%;
`;

const Header = styled.View`
  display: flex;
  wdith: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  align-items: center;
  padding: 0 20px;
`;

// const IcDownload = styled.Image`
//   width: 22px;
//   height: 22px;
// `;

const HeaderButton = styled(Button)``;

const CodeScanContainer = styled.View`
  width: ${SCREEN_WIDTH}px;
`;

const BottomContainer = styled.View`
  background: #fff;
  padding: 30px 0 40px;
  display: flex;
  align-content: center;
  align-items: center;
`;

const ButtonContainer = styled.View`
  margin-top: 68px;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const IconCloseButton = styled.TouchableOpacity`
  display: flex;
`;

const IconButton = styled.TouchableOpacity`
  display: flex;
  align-items: center;
`;

const IconButtonLabel = styled.Text<{ themeColor?: boolean }>`
  color: ${(props) => (props.themeColor && props.theme.dark ? '#ffffff' : '#262525')};

  margin-top: 6px;
  font-size: 13px;
  font-weight: 500;
`;

const IconBackgrond = styled.View<{ active?: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ active }) => (active ? '#fcf2e8' : 'transparent')};
`;

const IconImage = styled.Image<{ size: number }>`
  ${({ size }) => {
    return css`
      width: ${size}px;
      height: ${size}px;
    `;
  }}
`;

const QRScan = () => {
  const [, setScaned] = useState<boolean>(true);
  const ref = useRef(null);
  const binaryCode = useRef('');
  const [isMyCode, setIsMyCode] = useState<boolean>(false);
  const [me, setMe] = useAtom(userAtom);
  const navigation = useNavigation<MainNavigationProp>();
  const [notFound, setNotFound] = useState(false);
  const [qrCode, setQrCode] = useState();
  const [myCode, setMyCode] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [result, setResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [binaryURL, setBinaryURL] = useState('');
  const { data: userData, error: userError, mutate: userMutate } = useFetchWithType<User>('/auth/me');
  const date = new Date();
  useEffect(() => {
    setScaned(true);
    if (me?.qrcode) {
      setMyCode(me.qrcode);
    } else {
      post('/auth/me/qrcode', {})
        .then(async (res) => {
          let newCode = {
            ...me,
            //@ts-ignore
            ['qrcode']: res.qrcode,
          };
          //@ts-ignore
          await setMe(newCode);
          LogUtil.info('result', res);
        })
        .then(async () => {
          setMyCode(me?.qrcode ?? '');
          await userMutate();
        });
    }
  }, [userMutate, myCode]);

  console.log('myCode', myCode);

  useFocusEffect(
    useCallback(() => {
      setMyCode(me?.qrcode ?? '');
    }, [myCode]),
  );

  const submit = useCallback(
    (qrcode) => {
      get(`/auth/users/detail?qrcode=${qrcode}`)
        .then((res) => {
          LogUtil.info('scan result', res);
          setNotFound(false);
          setIsMyCode(false);
          // @ts-ignore
          if (res.block === null) {
            setResult(true);
            navigation.navigate('/contacts/contacts-search/result', {
              //@ts-ignore
              result: res,
              setResult: setResult,
            });
          } else {
            setNotFound(true);
            setIsMyCode(false);
          }
        })
        .catch((error) => {
          if (error.response.status === 404) {
            setNotFound(true);
            setIsMyCode(false);
          }
          setNotFound(true);
          setIsMyCode(false);
        });
    },
    [navigation],
  );

  const onBarCodeRead = (event: any) => {
    const code = event.nativeEvent.codeStringValue;
    if (!result && code) {
      submit(code);
    }
  };

  // ...

  const openQRCodeFromGallery = () => {
    const galleryOptions: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: true,
    };

    launchImageLibrary(galleryOptions, (response) => {
      //@ts-ignore
      if (!response || response.didCancel || !response.assets[0].base64) {
        return;
      }

      // const { base64 } = response;
      RNQRGenerator.detect({
        //@ts-ignore
        uri: response.assets[0].uri,
        // base64: response.assets[0].base64,
      })
        .then((detectedQRCodes) => {
          const { values } = detectedQRCodes; // Array of detected QR code values. Empty if nothing found.
          // do your stuff
          submit(values);
        })
        .catch((error) => {
          console.log(error);
          // handle errors
        });
    });
  };

  return (
    <Wrapper>
      <Header>
        <ItemWrapper style={{ alignItems: 'flex-start' }}>
          <HeaderButton
            onPress={() => {
              // navigation.navigate('/chats/chat-room/gallery', {
              //   codeScan: true,
              //   setNotFound: setNotFound,
              // });
              openQRCodeFromGallery();
            }}
            fontSize={13}
            fontWeight={500}
            variant={ButtonVariant.TextBtn}
            textvariant={ButtonTextVariant.Text}
            deepGrayText
            label={t('qr-code-modal.Album')}
          />
        </ItemWrapper>
        <ItemWrapper style={{ alignItems: 'center' }}>
          <H4>{!isMyCode ? t('qr-code-modal.Code Scan') : t('common.My Code')}</H4>
        </ItemWrapper>
        <ItemWrapper style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
          <IconCloseButton onPress={() => navigation.goBack()}>
            <IconImage source={require('/assets/ic-close.png')} size={18} />
          </IconCloseButton>
        </ItemWrapper>
      </Header>
      {!isMyCode ? (
        <CodeScanContainer style={tw`flex-1 justify-center items-center`}>
          <Camera
            ref={ref}
            scanBarcode
            style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT / 2 }}
            laserColor="rgba(0, 0, 0, 0)"
            frameColor="rgba(0, 0, 0, 0.5)"
            surfaceColor="rgba(0, 0, 0, 0)"
            onReadCode={onBarCodeRead}
          />
          {notFound && (
            <Text numberOfLines={2} style={{ position: 'absolute', top: 80, textAlign: 'center', color: 'red' }}>
              {'Invalid Code.\nPlease scan a valid code.'}
            </Text>
          )}
        </CodeScanContainer>
      ) : (
        <CodeScanContainer style={tw`flex-1 justify-center items-center border-t border-gray-200 border-b`}>
          <SwrContainer data={userData} error={userError}>
            <QRCode getRef={(c) => setQrCode(c)} size={SCREEN_WIDTH * 0.5} value={userData?.qrcode}></QRCode>
          </SwrContainer>
          <Space height={50} />
          <View style={{ justifyContent: 'space-between', flexDirection: 'row', width: SCREEN_WIDTH * 0.55 }}>
            <Pressable
              onPress={() => {
                setIsVisible2(true);
              }}
            >
              <ICBack />
            </Pressable>
            <Pressable
              onPress={() => {
                setIsLoading(true);
                if (qrCode)
                  //@ts-ignore
                  qrCode.toDataURL((data) => {
                    RNFS.writeFile(
                      Platform.OS === 'ios'
                        ? RNFS.CachesDirectoryPath + '/QRCode.png'
                        : 'file://' + RNFS.CachesDirectoryPath + '/QRCode.png',
                      data,
                      'base64',
                    )
                      .then(async (success) => {
                        console.log('here success', success);
                        const res = await multiUploadS3ByFilePath([
                          {
                            uri:
                              Platform.OS === 'ios'
                                ? RNFS.CachesDirectoryPath + '/QRCode.png'
                                : 'file://' + RNFS.CachesDirectoryPath + '/QRCode.png',
                            name:
                              Platform.OS === 'ios'
                                ? RNFS.CachesDirectoryPath + '/QRCode.png'
                                : 'file://' + RNFS.CachesDirectoryPath + '/QRCode.png',
                            type: 'image/png',
                          },
                        ]);
                        return res;
                      })
                      .then((res) => {
                        console.log('qr result', res);
                        res.map(async (item) => {
                          try {
                            const res = await axios.get(item.url, {
                              responseType: 'arraybuffer' /* or responseType: 'arraybuffer'  */,
                            });
                            // console.log('get result', JSON.stringify(res.request._response));
                            // console.log('getResult', res.request._response)
                            // const base64 = await Buffer.from(res.data, 'binary').toString('base64'); // 여기에 await 가 필요했는지 아닌지 모르겠네요
                            // LogUtil.info('newbase64', base64);
                            binaryCode.current = `data:image/png;base64,${res.request._response}`;
                          } catch (error) {
                            //@ts-ignore
                            console.log('errorResponse', error);
                          }
                        });
                      })
                      .then(() => {
                        setTimeout(() => {
                          console.log('binaryCode.current', binaryCode.current);
                          SHARE.open({ message: `KokKokChat QRCode`, urls: [binaryCode.current], type: 'urls' });
                          // SHARE.open({
                          //   type: 'urls',
                          //   message: 'KokKok QRCode',
                          //   urls: baseList ?? [],
                          // });
                          setIsLoading(false);
                        }, 30);
                      })
                      .catch((e) => {
                        Alert.alert('Error', JSON.stringify(e));
                      });
                  });
              }}
            >
              {isLoading ? <ActivityIndicator /> : <ICShare />}
            </Pressable>
            <Pressable
              onPress={() => {
                setIsVisible(true);
              }}
            >
              <ICDownload />
            </Pressable>
          </View>
        </CodeScanContainer>
      )}

      <BottomContainer>
        {!isMyCode ? (
          <H4>{t('qr-code-modal.Please scan QR code or upload an image')}</H4>
        ) : (
          <H4 style={{ textAlign: 'center' }}>{'with the code above,\nthe other person can add you as a friend. '}</H4>
        )}
        <ButtonContainer>
          <IconButton style={{ marginRight: 56 }} onPress={() => setIsMyCode(false)}>
            <IconBackgrond active>
              <IconImage source={require('/assets/ic_codescan.png')} size={26} />
            </IconBackgrond>
            <IconButtonLabel>{t('qr-code-modal.Code Scan')}</IconButtonLabel>
          </IconButton>
          <IconButton onPress={() => setIsMyCode(true)}>
            <IconBackgrond>
              <IconImage source={require('/assets/ic_mycode.png')} size={26} />
            </IconBackgrond>
            <IconButtonLabel>{t('qr-code-modal.My Code')}</IconButtonLabel>
          </IconButton>
        </ButtonContainer>
      </BottomContainer>
      <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle>{t('common.Saved my code to an album')}</ModalTitle>
          <Row style={{ paddingTop: 15 }}>
            <ConfirmButton
              onPress={async () => {
                if (qrCode)
                  //@ts-ignore
                  qrCode.toDataURL((data) => {
                    RNFS.writeFile(RNFS.CachesDirectoryPath + '/some-name.png', data, 'base64')
                      .then((success) => {
                        return CameraRoll.save(RNFS.CachesDirectoryPath + '/some-name.png', { type: 'photo' });
                      })
                      .then(() => {
                        console.log('이미지 저장 성공');
                      });
                  });
                setIsVisible(false);
              }}
            >
              <ConfirmLabel>{t('common.Confirm')}</ConfirmLabel>
            </ConfirmButton>
            <View style={{ padding: 10 }} />
          </Row>
        </Column>
      </ModalBase>
      <ModalBase isVisible={isVisible2} onBackdropPress={() => setIsVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle>{t('common.Would you change my code?')}</ModalTitle>
          <ModalText>{t('common.The old code is no longer usable, and a new code is created')}</ModalText>
          <Row style={{ paddingTop: 15 }}>
            <CancelButton
              onPress={async () => {
                setIsVisible2(false);
              }}
            >
              <CancelLabel>{t('common.Cancel')}</CancelLabel>
            </CancelButton>
            <Space width={10} />
            <ConfirmButton
              onPress={async () => {
                post('/auth/me/qrcode', {}).then(async (res) => {
                  let newCode = {
                    ...me,
                    //@ts-ignore
                    ['qrcode']: res.qrcode,
                  };
                  //@ts-ignore
                  setMe(newCode);
                  LogUtil.info('result', res);
                  setMyCode(me?.qrcode ?? '');
                  await userMutate();
                });
                setIsVisible2(false);
              }}
            >
              <ConfirmLabel>{t('common.Confirm')}</ConfirmLabel>
            </ConfirmButton>
            <View style={{ padding: 10 }} />
          </Row>
        </Column>
      </ModalBase>
    </Wrapper>
  );
};

const ConfirmButton = styled(TouchableOpacity)`
  background-color: ${COLOR.PRIMARY};
  width: 120px;
  height: 55px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${COLOR.PRIMARY};
  margin-bottom: 10px;
`;

const CancelButton = styled(TouchableOpacity)`
  background-color: #fff;
  width: 120px;
  height: 55px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: #ccc;
`;

const ModalText = styled(Text)`
  color: #999999;
  padding: 10px;
  text-align: center;
`;
const CancelLabel = styled(Text)`
  color: #ccc;
  font-size: 15px;
  font-weight: bold;
`;
const ConfirmLabel = styled(Text)`
  color: #fff;
  font-size: 15px;
  font-weight: bold;
`;
const ModalTitle = styled(Text)`
  font-size: 15px;
  color: black;
  padding: 10px;
  font-weight: bold;
`;

export default QRScan;
