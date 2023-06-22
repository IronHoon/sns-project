import React, { useCallback, useEffect, useState } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import { Column } from 'components/layouts/Column';
import { SwitchButton } from 'components/atoms/switch/SwitchButton';
import IconButton from 'components/atoms/MIconButton';
import { useFetchWithType } from '../../../../net/useFetch';
import User from '../../../../types/auth/User';
import { patch, post } from '../../../../net/rest/api';
import SwrContainer from '../../../../components/containers/SwrContainer';
import useLocalContacts from '../../../../hooks/useLocalContacts';
import { useFocusEffect } from '@react-navigation/native';
import { useAtomValue } from 'jotai';
import localContactsAtom from '../../../../stores/localContactsAtom';
import { t } from 'i18next';
import AsyncStorage from '@react-native-community/async-storage';
import addAutoUtil from '../../../../utils/AddAutoUtil';
import permissionUtil from '../../../../utils/PermissionUtil';
import { PermissionStatus, Platform } from 'react-native';
import { PERMISSIONS, request } from 'react-native-permissions';
import { checkPermission } from 'react-native-contacts';
import LogUtil from '../../../../utils/LogUtil';
import PermissionUtil from '../../../../utils/PermissionUtil';

const SwitchContainer = styled.View`
  flex-direction: row;
  padding: 15px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #e3e3e3;
`;
const SwitchLabel = styled.Text`
  margin-bottom: 5px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Description = styled.Text`
  font-size: 13px;
  width: 85%;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
`;
const RefreshContainer = styled.View`
  flex-direction: row;
  padding: 15px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #e3e3e3;
`;
const RefreshLabel = styled.Text`
  flex: 1;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const RefreshDate = styled.Text`
  font-size: 13px;
  /* line-height: 18px; */
  color: #999999;
`;

function getRefreshDate(date: string | undefined) {
  let currentDate;
  if (date) {
    currentDate = new Date(date);
  } else {
    currentDate = new Date();
  }
  let hour = currentDate.getHours();
  let ampm = 'AM';
  let month = `${currentDate.getMonth() + 1}`;

  if (hour > 12) {
    ampm = 'PM';
    hour = hour - 12;
  }
  if (month.length === 1) {
    month = `0${month}`;
  }

  switch (month) {
    case '01':
      return `Jan ${currentDate.getDate()} ${hour}:${currentDate.getMinutes()} ${ampm}`;
    case '02':
      return `Feb ${currentDate.getDate()} ${hour}:${currentDate.getMinutes()} ${ampm}`;
    case '03':
      return `Mar ${currentDate.getDate()} ${hour}:${currentDate.getMinutes()} ${ampm}`;
    case '04':
      return `Apr ${currentDate.getDate()} ${hour}:${currentDate.getMinutes()} ${ampm}`;
    case '05':
      return `May ${currentDate.getDate()} ${hour}:${currentDate.getMinutes()} ${ampm}`;
    case '06':
      return `Jun ${currentDate.getDate()} ${hour}:${currentDate.getMinutes()} ${ampm}`;
    case '07':
      return `Jul ${currentDate.getDate()} ${hour}:${currentDate.getMinutes()} ${ampm}`;
    case '08':
      return `Aug ${currentDate.getDate()} ${hour}:${currentDate.getMinutes()} ${ampm}`;
    case '09':
      return `Sep ${currentDate.getDate()} ${hour}:${currentDate.getMinutes()} ${ampm}`;
    case '10':
      return `Oct ${currentDate.getDate()} ${hour}:${currentDate.getMinutes()} ${ampm}`;
    case '11':
      return `Nov ${currentDate.getDate()} ${hour}:${currentDate.getMinutes()} ${ampm}`;
    case '12':
      return `Dec ${currentDate.getDate()} ${hour}:${currentDate.getMinutes()} ${ampm}`;
    default:
      return '';
  }
}

interface Contact {
  number: string;
  name: string;
}

function AddUsers() {
  const { data: meData, error: meError, mutate: mutateMe } = useFetchWithType<User>('/auth/me');
  const loadLocalContacts = useLocalContacts();
  const localContacts = useAtomValue(localContactsAtom);
  const [userData, setUserData] = useState<Array<User>>([]);
  const [contactList, setContactList] = useState<Array<string>>([]);
  const [contacts, setContacts] = useState<Array<Contact>>([]);
  const [isAddAuto, setIsAddAuto] = useState<boolean>();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const isAdd = await AsyncStorage.getItem('isAddAuto');
        if (isAdd === 'true') {
          setIsAddAuto(true);
        } else {
          setIsAddAuto(false);
        }
      })();
    }, []),
  );

  const getUsers = (contactList) => {
    post('/auth/contacts/search', { contacts: contactList }).then((res) => {
      // @ts-ignore
      setUserData(res);
    });
  };

  useFocusEffect(loadLocalContacts);

  useFocusEffect(
    useCallback(() => {
      let contactArr = [];
      localContacts.forEach((contact) => {
        let mobile = contact.phoneNumbers?.filter((number) => number.label == 'mobile');
        let number = mobile && mobile[0] !== undefined ? mobile[0].number : 'none';
        if (number !== 'none') {
          // @ts-ignore
          contactArr.push(number.replace(/[^0-9]/g, ''));
        }
      });
      getUsers(contactArr);
      setContactList(contactArr);
      console.log(contactArr);
    }, [localContacts]),
  );

  useFocusEffect(
    useCallback(() => {
      let contactArr = [];
      userData.forEach((user) => {
        let number = user.contact;
        let name = user.first_name + ' ' + user.last_name;
        contactArr.push({
          //@ts-ignore
          number: number,
          //@ts-ignore
          name: name,
        });
      });
      setContacts(contactArr);
    }, [userData]),
  );

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await mutateMe();
      })();
    }, [mutateMe]),
  );

  const [refreshDate, setRefreshDate] = useState(getRefreshDate(meData?.sync_contact_at));

  return (
    <MainLayout>
      <BackHeader title={t('privacy.Add users')} />
      <SwrContainer data={meData} error={meError}>
        <SwitchContainer>
          <Column style={{ flex: 1 }}>
            <SwitchLabel style={{ fontSize: meData?.setting?.ct_text_size as number }}>
              {t('privacy.Add Automatically')}
            </SwitchLabel>
            <Description style={{ fontSize: meData?.setting?.ct_text_size as number }}>
              {t('privacy.Kok Kok users in your contacts will be automatically synced to you friends list')}
            </Description>
          </Column>
          <SwitchButton
            isEnabled={!!isAddAuto}
            setIsEnabled={async () => {
              await AsyncStorage.setItem('isAddAuto', isAddAuto ? 'false' : 'true');
              setIsAddAuto(!isAddAuto);
            }}
          />
        </SwitchContainer>
      </SwrContainer>
      <RefreshContainer>
        <RefreshLabel style={{ fontSize: meData?.setting?.ct_text_size as number }}>
          {t('privacy.Refresh')}
        </RefreshLabel>
        <RefreshDate style={{ fontSize: meData?.setting?.ct_text_size as number }}>{refreshDate}</RefreshDate>
        <IconButton
          themeColor={true}
          source={require('../../../../assets/ic-refresh.png')}
          onClick={async () => {
            addAutoUtil.getContactList().then(async (contacts) => {
              LogUtil.info('now contacts', contacts);
              post('/auth/contacts', {
                contacts: [...contacts, { number: '02023', name: 'dff' }],
              })
                .then(() => {
                  console.log('성공');
                })
                .catch((e) => {
                  console.log(e.response);
                });
              setRefreshDate(getRefreshDate(undefined));
              await mutateMe();
            });
          }}
        />
      </RefreshContainer>
    </MainLayout>
  );
}

export default AddUsers;
