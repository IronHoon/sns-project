import React, { LegacyRef, useEffect, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import LogUtil from 'utils/LogUtil';
import DocumentScanner from 'react-native-document-scanner-plugin';
import PermissionUtil from 'utils/PermissionUtil';
import {
  check,
  checkMultiple,
  Permission,
  PERMISSIONS,
  PermissionStatus,
  request,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import { Column } from 'components/layouts/Column';
import Button from 'components/atoms/MButton';
import { t } from 'i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { EventRegister } from 'react-native-event-listeners';
type Callback = (data: string) => void;
export class DocumentScannerCallback {
  static listenerId?: string | boolean;
  eventName = 'document-scanner-callback';
  constructor(callback: Callback) {
    this.remove();
    this.add(callback);
  }

  add(callback: Callback) {
    if (!DocumentScannerCallback.listenerId) {
      DocumentScannerCallback.listenerId = EventRegister.addEventListener(this.eventName, callback);
    }
  }
  remove() {
    if (DocumentScannerCallback.listenerId && typeof DocumentScannerCallback.listenerId === 'string') {
      EventRegister.removeEventListener(DocumentScannerCallback.listenerId);
      DocumentScannerCallback.listenerId = undefined;
    }
  }

  emit(scannedImage: string) {
    EventRegister.emit(this.eventName, scannedImage);
  }
}

function KokkokDocumentScannerPage() {
  const route = useRoute();
  //@ts-ignore
  const documentScannerCallback = route.params?.callback as DocumentScannerCallback | undefined;

  const navigation = useNavigation<MainNavigationProp>();
  const [scannedImage, setScannedImage] = useState<string>();

  const scanDocument = async () => {
    const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const permissionStatus = await PermissionUtil.checkPermission(permission);
    if (permissionStatus === RESULTS.DENIED) {
      await PermissionUtil.requestPermission(permission);
    }

    // start the document scanner
    const { scannedImages } = await DocumentScanner.scanDocument({ maxNumDocuments: 1 });

    // get back an array with scanned image file paths
    if (scannedImages && scannedImages.length > 0) {
      // set the img src, so we can view the first scanned image
      setScannedImage(scannedImages[0]);
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    scanDocument();

    return () => {};
  }, []);

  if (!scannedImage) {
    return <></>;
  }

  return (
    <Column>
      <Image style={{ width: '100%', height: '90%', resizeMode: 'contain' }} source={{ uri: scannedImage }} />
      <Button
        style={{ width: '100%', height: '10%' }}
        onPress={() => {
          documentScannerCallback?.emit(scannedImage);
          navigation.goBack();
        }}
      >
        {t('document-scanner.Send')}
      </Button>
    </Column>
  );
}

export default KokkokDocumentScannerPage;
