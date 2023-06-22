import Button from 'components/atoms/MButton';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  Text,
  TextInputChangeEventData,
  TouchableOpacity,
} from 'react-native';
import styled from 'styled-components/native';
import tw from 'twrnc';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { ImageLibraryOptions, launchImageLibrary } from 'react-native-image-picker';
import { uploadS3ByImagePicker } from 'lib/uploadS3';
import { post, rememberToken } from '../../net/rest/api';
import Certification from '../../types/auth/Certification';
import { useSetAtom } from 'jotai';
import tokenAtom from '../../stores/tokenAtom';
import userAtom from '../../stores/userAtom';
import { getModel, getUniqueId } from 'react-native-device-info';
import FirebaseMessageUtil from 'utils/chats/FirebaseMessageUtil';
import { t } from 'i18next';
import AuthUtil from '../../utils/AuthUtil';
import CheckSvg from 'assets/ic_check.svg';
import { TextInput } from 'react-native-gesture-handler';
import { Row } from 'components/layouts/Row';
import permissionUtil from '../../utils/PermissionUtil';
import { PERMISSIONS } from 'react-native-permissions';
import LogUtil from '../../utils/LogUtil';
import { isDevAuth } from '../../utils/isDevAuth';
import MySetting from 'MySetting';

interface SignUpPayload {
  mode: string;
  first_name: string;
  last_name: string;
  profile_image?: string;
  uid: string;
  contact: string;
  device_id: string;
  device_name: string;
  push_token: string;
}

const errorMessageMap = {
  '아이디는 필수값입니다.': t('common.ID is required'),
  'ID can only use letters, numbers, underscores and periods.': t(
    'common.ID can only use letters, numbers, underscores and periods',
  ),
  'ID must have at least 2 characters.': t('common.ID must have at least 2 characters'),
  'ID cannot be used more than 40 characters.': t('common.ID cannot be used more than 40 characters'),
  'ID is not available. Please enter another ID.': t('common.ID is not available Please enter another ID'),
};

const InvalidText = styled(Text)`
  color: red;
  font-size: 13px;
  margin-bottom: 3px;
`;

export default function ProfileEnroll() {
  const { params }: any = useRoute();
  const navigation = useNavigation<MainNavigationProp>();
  // const [isValidateName, setIsValidateName] = useState(false);
  const [isDuplicateId, setIsDuplicateId] = useState(true);
  const [profile_image, setProfileImage] = useState<string>();
  const [first_name, setFirstName] = useState<string>('');
  const [last_name, setLastName] = useState<string>('');
  const [uid, _setUid] = useState<string>('');
  const [invalidText, setInvalidText] = useState(' ');
  const setUid = (_uid) => {
    _setUid(_uid);
    AuthUtil.requestGetDuplicateId(_uid)
      .then(() => {
        setInvalidText(' ');
        setIsDuplicateId(false);
      })
      .catch((error) => {
        if (_uid === '') {
          setInvalidText(' ');
        } else {
          setIsDuplicateId(true);
          const errorMessage = error.response.data.message;
          if (errorMessageMap[errorMessage]) {
            setInvalidText(errorMessageMap[errorMessage]);
          } else {
            setInvalidText(errorMessage);
          }
        }
      });
  };
  const setToken = useSetAtom(tokenAtom);
  const setUser = useSetAtom(userAtom);

  const isValidateName = useMemo(() => {
    return !!(first_name && last_name && uid);
  }, [first_name, last_name, uid]);

  // useEffect(() => {
  //   // getAlbum();
  //   console.log('====================================');
  //   console.log(first_name, last_name, uid);
  //   console.log('====================================');
  //   if (first_name && last_name && uid) {
  //     setIsValidateName(true);
  //   } else {
  //     setIsValidateName(false);
  //   }
  // }, [first_name, last_name, uid]);

  const onClickCameraButton = () => {
    getAlbum();
  };

  const getAlbum = useCallback(() => {
    (async () => {
      permissionUtil
        .checkPermission(
          Platform.OS === 'ios' ? PERMISSIONS.IOS.PHOTO_LIBRARY : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        )
        .then((res) => {
          if (res !== 'granted') {
            Alert.alert('', 'You need to allow access to photo library.', [
              {
                text: 'Allow Access',
                onPress: async () => {
                  Platform.OS === 'ios' ? await Linking.openURL('app-settings:') : await Linking.openSettings();
                },
              },
            ]);
          } else {
            let options: ImageLibraryOptions = {
              maxHeight: 200,
              maxWidth: 200,
              selectionLimit: 1,
              mediaType: 'photo',
              includeExtra: true,
            };

            launchImageLibrary(options, async (file) => {
              console.log(file);
              const mediaRes = await uploadS3ByImagePicker(file);
              if (mediaRes) {
                const { url: _profile_image } = mediaRes;
                setProfileImage(_profile_image);
              }
            });
          }
        });
    })();
  }, []);

  return (
    <ScrollView contentContainerStyle={tw``}>
      <ProfileContainer style={tw`flex-1`}>
        <ProfileView style={tw``}>
          <TouchableOpacity onPress={onClickCameraButton}>
            {profile_image && profile_image !== 'private' ? (
              <ProfileImage source={{ uri: profile_image }} />
            ) : (
              <ProfileImage source={require('../../assets/img-profile.png')} />
            )}
            <CameraImage
              // style={tw`absolute bottom-0 right-0 w-8 h-8`}
              source={require('../../assets/ic-camera-button.png')}
            />
          </TouchableOpacity>
          <ProfileDesc>{t('Profile Info.Enter your name and add a profile photo(optional)')}</ProfileDesc>
        </ProfileView>
        <FormView style={tw``}>
          <Text1>{t('Profile Info.User Name (required)')}</Text1>
          <TextInputComponent
            fill={first_name.length > 0}
            placeholder={t('Profile Info.First Name')}
            placeholderTextColor={'#bbb'}
            onChange={(e: any) => setFirstName(e.nativeEvent.text)}
          >
            {first_name}
          </TextInputComponent>
          <TextInputComponent
            fill={last_name.length > 0}
            placeholder={t('Profile Info.Last Name')}
            placeholderTextColor={'#bbb'}
            onChange={(e: any) => setLastName(e.nativeEvent.text)}
          >
            {last_name}
          </TextInputComponent>
        </FormView>
        <FormView style={tw`flex-1`}>
          <Text1>{t('Profile Info.Kok Kok ID (required)')}</Text1>
          <TextInputRow fill={uid.length > 0}>
            <TextInput
              style={tw`flex-1`}
              placeholder={t('Profile Info.Kok Kok ID')}
              placeholderTextColor={'#bbb'}
              autoCapitalize={'none'}
              onChange={(e: NativeSyntheticEvent<TextInputChangeEventData>) => setUid(e.nativeEvent.text)}
            >
              {uid}
            </TextInput>
            {!isDuplicateId && <CheckSvg />}
          </TextInputRow>
          <InvalidText>{invalidText}</InvalidText>
          <Text style={tw`text-gray-400`}>
            {t('Profile Info.Kok Kok ID will be shown on your profile and searched by others')}
          </Text>
        </FormView>
      </ProfileContainer>
      <Button
        disabled={!(isValidateName && !isDuplicateId)}
        onPress={async () => {
          LogUtil.info('회원가입을 시도');

          await AuthUtil.logout(getUniqueId()); //소켓을 끊기위해서 로그아웃 함.

          const _params: any = {
            first_name,
            last_name,
            profile_image,
            uid,
            contact: params.data.contact,
            device_id: getUniqueId(),
            device_name: getModel(),
            push_token: (await FirebaseMessageUtil.getFcmToken()) ?? '',
            type: MySetting.deviceType,
          };
          if (isDevAuth()) {
            _params.mode = 'dev';
          }
          const data = await post<Certification, SignUpPayload>('/pub/auth/sign-up', _params, null, undefined, true);

          await rememberToken(data!.token.token);
          setUser(data!.user);
          setToken(data!.token.token);
          AuthUtil.setMe(data!.user);

          navigation.popToTop();
          navigation.replace('/chats');
        }}
      >
        {t('Profile Info.NEXT')}
      </Button>
    </ScrollView>
  );
}

const ProfileContainer = styled.View`
  flex: 1 1 auto;
  min-width: 100%;
  background-color: #f8f8f8;
`;

const ProfileView = styled.View`
  /* flex: 1 1 auto; */
  align-items: center;
  padding: 30px 0 20px;
`;

const ProfileImage = styled.Image`
  width: 100px;
  height: 100px;
  border-radius: 100px;
`;

const CameraImage = styled.Image`
  position: absolute;
  bottom: -20px;
  right: -20px;
  width: 60px;
  height: 60px;
`;

const ProfileDesc = styled.Text`
  margin-top: 20px;
  font-size: 13px;
  color: #bbb;
`;

const FormView = styled.View`
  margin-top: 8px;
  padding: 30px 23px;
  background: white;
`;

const Text1 = styled.Text`
  color: black;
`;

const TextInputComponent = styled.TextInput<TextInputProps>`
  margin: 15px 0 15px;
  height: 48px;
  color: #262525;
  border-bottom-color: ${(props) => (props.fill ? '#262525' : '#ededed')};
  border-bottom-width: 1px;
`;

const TextInputRow = styled(Row)<{ fill: boolean }>`
  margin: 15px 0 15px;
  height: 48px;
  color: #262525;
  border-bottom-color: ${(props) => (props.fill ? '#262525' : '#ededed')};
  border-bottom-width: 1px;
  align-items: center;
`;

interface TextInputProps {
  fill?: boolean;
  valid?: boolean;
}
