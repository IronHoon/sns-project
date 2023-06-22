import { useAtom } from 'jotai';
import localContactsAtom from '../stores/localContactsAtom';
import { useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import Contacts from 'react-native-contacts';
import LocalContact from '../types/contacts/LocalContact';
import { PERMISSIONS, RESULTS } from 'react-native-permissions';
import PermissionUtil from 'utils/PermissionUtil';

export default function useLocalContacts() {
  const [, setLocalContacts] = useAtom(localContactsAtom);

  return useCallback(() => {
    (async () => {
      const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CONTACTS : PERMISSIONS.ANDROID.READ_CONTACTS;
      const permissionStatus = await PermissionUtil.checkPermission(permission);
      if (permissionStatus === RESULTS.DENIED) {
        PermissionUtil.requestPermission(permission, {
          title: 'Contacts',
          message: 'This app would like to view your contacts.',
          buttonPositive: 'Please accept bare mortal',
        }).then((result) => {
          if (result === 'blocked') {
            Alert.alert('', 'You need to grant permission to read the contact.', [
              {
                text: 'Allow Access',
                onPress: async () => {
                  Platform.OS === 'ios' ? await Linking.openURL('app-settings:') : await Linking.openSettings();
                },
              },
            ]);
          }
        });
      } else if (permissionStatus === RESULTS.GRANTED) {
        const contacts = await Contacts.getAll();
        setLocalContacts(contacts as LocalContact[]);
      } else {
        Alert.alert('', 'You need to grant permission to read the contact.', [
          {
            text: 'Allow Access',
            onPress: async () => {
              Platform.OS === 'ios' ? await Linking.openURL('app-settings:') : await Linking.openSettings();
            },
          },
        ]);
      }
    })();
  }, []);
}
