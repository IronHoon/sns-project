import useLocalContacts from '../hooks/useLocalContacts';
import { useAtomValue } from 'jotai';
import localContactsAtom from '../stores/localContactsAtom';
import { post } from '../net/rest/api';
import User from '../types/auth/User';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Platform } from 'react-native';
import { PERMISSIONS, RESULTS } from 'react-native-permissions';
import PermissionUtil from './PermissionUtil';
import Contacts from 'react-native-contacts';
import LocalContact from '../types/contacts/LocalContact';
import DeviceCountry from 'react-native-device-country';
import parsePhoneNumber, { getCountryCallingCode, parsePhoneNumberWithError } from 'libphonenumber-js';
import LogUtil from './LogUtil';

class AddAutoUtil {
  static getUsers(contactList): Promise<Array<any>> {
    console.log('contactList', contactList);

    return new Promise((resolve, reject) => {
      let contact = [];
      post('/auth/contacts/search', { contacts: contactList })
        .then((res) => {
          console.log('result', res);
          //@ts-ignore
          res?.forEach((user) => {
            let number = user.contact;
            let name = user.first_name + ' ' + user.last_name;
            contact.push({
              //@ts-ignore
              number: number,
              //@ts-ignore
              name: name,
            });
          });
          console.log('겟유저 : ', contact);
          resolve(contact);
        })
        .catch((e) => {
          console.log(e);
          reject([]);
        });
    });
  }

  static async getContactList(): Promise<Array<any>> {
    return new Promise(async (resolve, reject) => {
      const localContacts = await Contacts.getAll();
      let countryCode = '';
      let contactArr = <Array<string>>[];
      DeviceCountry.getCountryCode()
        .then((result) => {
          //@ts-ignore
          countryCode = getCountryCallingCode(result.code.toUpperCase());
          localContacts.map((contact) => {
            let mobile = contact.phoneNumbers?.filter((number) => number.label === 'mobile');
            let number = mobile && mobile[0] !== undefined ? mobile[0].number : 'none';
            const contactNumWithCode = parsePhoneNumber(`+${countryCode}` + `${number}`)
              ?.formatInternational()
              .toString();
            const regex = /[^0-9]/g;
            const contactNum = number.replace(regex, '');
            if (number !== 'none') {
              contactArr.push(contactNumWithCode ?? '');
              contactArr.push(contactNum);
            }
            console.log(contactArr);
          });
        })
        .then(async () => {
          const contact = await this.getUsers(contactArr);
          if (contact) {
            console.log('연락처', contact);
            resolve(contact);
          } else {
            reject();
          }
        })
        .catch((e) => {
          console.log(e);
        });
    });
  }
}

export default AddAutoUtil;
