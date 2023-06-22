import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import tw from 'twrnc';
import styled from 'styled-components/native';
import type { MainNavigationProp } from 'navigations/MainNavigator';
import { ScrollView, View, ViewStyle, TextStyle, Platform, Text, BackHandler, Linking } from 'react-native';
import { PERMISSIONS, Permission as PermissionType, RESULTS } from 'react-native-permissions';
import { COLOR } from 'constants/COLOR';
import Screen from 'components/containers/Screen';
import Padding from 'components/containers/Padding';
import H3 from 'components/atoms/Typo';
import Space from 'components/utils/Space';
import Typo from 'components/atoms/Typo';
import { Permission } from './components';
import PermissionUtil from 'utils/PermissionUtil';
import { EventRegister } from 'react-native-event-listeners';
import { ModalBase } from 'components/modal';
import MButton from 'components/atoms/MButton';
import H2 from 'components/atoms/H2';
import { Row } from 'components/layouts/Row';
import LogUtil from 'utils/LogUtil';
import MainLayout from 'components/layouts/MainLayout';
import Toast from 'react-native-toast-message';
import { t } from 'i18next';

//[TODO] 버튼 공통 컴포넌트 적용
interface Props {
  children?: string;
  onPress?: () => void;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  disabled?: boolean;
}

interface ContainerProps {
  children?: React.ReactNode | string;
  onPress?: () => void;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  disabled?: boolean;
}

interface LabelProps {
  children?: string;
  style?: TextStyle;
  disabled?: boolean;
}

function Button({ children, onPress, style, labelStyle, disabled }: Props) {
  return (
    <Container
      onPress={() => {
        if (!disabled) {
          onPress?.();
        }
      }}
      style={style}
      disabled={disabled}
    >
      <Label disabled={disabled} style={labelStyle}>
        {children}
      </Label>
    </Container>
  );
}

const Container = styled.TouchableOpacity<ContainerProps>`
  background-color: ${({ disabled }) => (disabled ? '#ededed' : '#f68722')};
  width: 100%;
  height: 70px;
  align-items: center;
  justify-content: center;
`;

const Label = styled.Text<LabelProps>`
  color: ${({ disabled }) => (disabled ? '#ccc' : '#fff')};
  font-size: 18px;
  font-weight: bold;
`;

const Tittle = styled(H2)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const DescTypo = styled(Typo)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const CancelModal = ({ modal, setModal, onPressQuit, onPressAgree }) => {
  return (
    <ModalBase
      isVisible={modal}
      onBackdropPress={() => setModal(false)}
      title={t('landing.Info')}
      subDesc={t(
        'landing.Required items must be agreed to use the service. Go to the device Settings > Privacy and Security, and allow the required permissions when using the app, then run it',
      )}
    >
      <Row style={{ marginTop: 10 }}>
        <MButton
          style={{
            width: 100,
            height: 42,
            borderRadius: 5,
            borderWidth: 1,
            borderColor: '#dddddd',
            backgroundColor: COLOR.WHITE,
          }}
          onPress={() => {
            onPressQuit();
            setModal(false);
          }}
          labelStyle={{ fontSize: 14, color: '#dddddd', fontWeight: 'bold' }}
        >
          {t('landing.Skip')}
        </MButton>
        <Space width={10} />
        <MButton
          style={{ width: 100, height: 42, borderRadius: 5 }}
          onPress={() => {
            onPressAgree();
            setModal(false);
          }}
          labelStyle={{ fontSize: 14 }}
        >
          {t('landing.Agree')}
        </MButton>
      </Row>
    </ModalBase>
  );
};

const PermissionAlert = ({ modal, setModal, onPressOk }) => {
  return (
    <ModalBase
      isVisible={modal}
      onBackdropPress={() => setModal(false)}
      title={t('landing.Info')}
      subDesc={t(
        'landing.Required items must be agreed to use the service. Go to the device Settings > Privacy and Security, and allow the required permissions when using the app, then run it.',
      )}
    >
      <MButton
        style={{ width: 100, height: 42, borderRadius: 5 }}
        onPress={() => {
          setModal(false);
          Linking.openSettings();
        }}
        labelStyle={{ fontSize: 14 }}
      >
        {t('landing.Ok')}
      </MButton>
    </ModalBase>
  );
};

type Callback = (navigation: any) => void;
export class PermissionsCallback {
  static listenerId?: string | boolean;
  eventName = 'permissions-callback';
  constructor(callback: Callback) {
    this.remove();
    this.add(callback);
  }

  private add(callback: Callback) {
    if (!PermissionsCallback.listenerId) {
      PermissionsCallback.listenerId = EventRegister.addEventListener(this.eventName, callback);
    }
  }
  private remove() {
    if (PermissionsCallback.listenerId && typeof PermissionsCallback.listenerId === 'string') {
      EventRegister.removeEventListener(PermissionsCallback.listenerId);
      PermissionsCallback.listenerId = undefined;
    }
  }

  emit(navigation: any) {
    EventRegister.emit(this.eventName, navigation);
  }
}

function Permissions() {
  const route = useRoute();
  //@ts-ignore
  const permissionsCallback = route.params?.callback as PermissionsCallback | undefined;

  const [cancelModal, setCancelModal] = useState<boolean>(false);
  const [permissionAlert, setPermissionAlert] = useState<boolean>(false);

  const navigation = useNavigation<MainNavigationProp>();
  const [checkedPermissionKeys, setCheckedPermissionKeys] = useState<string[]>([]);
  const permissions = [
    {
      icon: require('../../assets/ic-contact.png'),
      title: 'Contacts',
      required: false,
      description: "You can send messages to your contacts' friends",
      permissionKey: { android: 'READ_CONTACTS', ios: 'CONTACTS' },
    },
    {
      icon: require('../../assets/ic-camera.png'),
      title: 'Camera',
      required: false,
      description: 'You can take photos and videos with your camera and send them to your friends',
      permissionKey: { android: 'CAMERA', ios: 'CAMERA' },
    },
    {
      icon: require('../../assets/ic-phone.png'),
      title: 'Phone',
      required: false,
      description: 'Make and manage calls.',
      permissionKey: { android: 'CALL_PHONE', ios: '' },
    },
    {
      icon: require('../../assets/ic-mic.png'),
      title: 'Microphone',
      required: false,
      description: 'Use the microphone to Send voice messages.',
      permissionKey: { android: 'RECORD_AUDIO', ios: 'MICROPHONE' },
    },
    {
      icon: require('../../assets/ic-storage.png'),
      title: 'Storage',
      required: true,
      description: 'Download photos and other files to your phone.',
      permissionKey: { android: 'WRITE_EXTERNAL_STORAGE', ios: 'MEDIA_LIBRARY' },
    },
    {
      icon: require('../../assets/ic-media.png'),
      title: 'Files & Media',
      required: true,
      description: 'You can send photos, videos, media, files and more to your friends',
      permissionKey: { android: 'READ_EXTERNAL_STORAGE', ios: 'PHOTO_LIBRARY' },
    },
    {
      icon: require('../../assets/ic-location.png'),
      title: 'Location',
      required: false,
      description: 'Access your location when you share it to others.',
      permissionKey: {
        android: 'ACCESS_FINE_LOCATION',
        ios: 'LOCATION_ALWAYS',
      },
    },
  ];

  useEffect(() => {
    const arr: string[] = [];
    permissions.forEach((permission) => {
      // if (permission.required) {
      //   arr.push(permission.permissionKey[Platform.OS]);
      // }
      arr.push(permission.permissionKey[Platform.OS]);
    });
    setCheckedPermissionKeys(arr);
  }, []);

  const handleCheckedPermissions = (permissionKey) => {
    if (checkedPermissionKeys.includes(permissionKey)) {
      setCheckedPermissionKeys(
        checkedPermissionKeys.filter((checkedPermission) => checkedPermission !== permissionKey),
      );
    } else {
      setCheckedPermissionKeys(checkedPermissionKeys.concat(permissionKey));
    }
  };

  const getPermissions = () => {
    let arr: PermissionType[] = [];
    checkedPermissionKeys.forEach((checkedPermissionName) => {
      if (checkedPermissionName) {
        arr.push(PERMISSIONS[Platform.OS.toUpperCase()][checkedPermissionName]);
      }
    });
    return arr;
  };
  const agree = () => {
    PermissionUtil.requestMultiplePermissions(getPermissions()).then(async (grantObject) => {
      //key는 "android.permission.WRITE_EXTERNAL_STORAGE"
      const requiredPermissions = permissions.filter((permission) => {
        const permissionName = permission.permissionKey[Platform.OS];
        const permissionFullName = PERMISSIONS[Platform.OS.toUpperCase()][permissionName];

        const result = grantObject[permissionFullName];
        return permission.required && (result === RESULTS.DENIED || result === RESULTS.BLOCKED); //필수이면서, denied인 것이 있다.
      });
      if (requiredPermissions.length > 0) {
        // ios 권고사항 : 권한을 거부해도 앱에 진입하되 해당 기능만 사용할 수 없도록 처리해야함
        navigation.navigate('/landing');
      } else {
        permissionsCallback?.emit(navigation);
      }
    });
  };
  const cancel = () => {
    // ios 권고사항 : 권한을 거부해도 앱에 진입하되 해당 기능만 사용할 수 없도록 처리해야함
    navigation.navigate('/landing');
  };
  const onPressAgree = () => {
    setCancelModal(false);
    Linking.openSettings();
  };
  const onPressCancel = () => {
    // ios 권고사항 : 권한을 거부해도 앱에 진입하되 해당 기능만 사용할 수 없도록 처리해야함
    navigation.navigate('/landing');

    // BackHandler.exitApp();
    //
    // Toast.show({
    //   type: 'error',
    //   text1:
    //     'Go to the device Settings > Privacy and Security, and allow the required permissions when using the app, then run it',
    // });
  };
  const onPressOk = () => {
    permissionsCallback?.emit(navigation);
  };

  return (
    <MainLayout>
      <ScrollView>
        <Padding>
          <Space height={20} />
          <Tittle> {t('landing.App access permission')}</Tittle>
          <Space height={15} />
          <DescTypo>
            {t(
              'landing.If you do not allow the optional access permission item, you cannot use the service using the function',
            )}
          </DescTypo>
          <Space height={30} />
          <Space height={1} color="#eee" />
          <Space height={30} />
          {permissions.map((permission, i) => {
            return (
              <Permission
                key={i}
                {...permission}
                checked={checkedPermissionKeys.includes(permission.permissionKey[Platform.OS])}
                handleCheckedPermissions={handleCheckedPermissions}
              />
            );
          })}
        </Padding>
        <View style={tw`flex-row`}>
          <Button style={tw`flex-1 bg-[${COLOR.GRAY}]`} onPress={cancel}>
            {t('landing.SKIP')}
          </Button>
          <Button style={tw`flex-1`} onPress={agree}>
            {t('landing.AGREE')}
          </Button>
        </View>
      </ScrollView>
      <CancelModal
        modal={cancelModal}
        setModal={setCancelModal}
        onPressAgree={onPressAgree}
        onPressQuit={onPressCancel}
      />
      <PermissionAlert modal={permissionAlert} setModal={setPermissionAlert} onPressOk={onPressOk} />
    </MainLayout>
  );
}

export default Permissions;
