import React, { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useAtomValue } from 'jotai';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import { t } from 'i18next';
import { Checkbox } from 'components/atoms/input/Checkbox';
import BackHeader from 'components/molecules/BackHeader';
import useLocalContacts from 'hooks/useLocalContacts';
import localContactsAtom from 'stores/localContactsAtom';
import NoContacts from 'views/contacts/molecules/NoContacts';
import LogUtil from 'utils/LogUtil';
import { useSetAtom } from 'jotai';

const LabelContainer = styled.View`
  height: 46px;
  border-bottom-color: ${COLOR.GRAY};
  border-bottom-width: 1px;
  padding: 10px 20px 10px 20px;
  flex-direction: row;
  align-items: center;
`;
const Label = styled.Text`
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #bbbbbb;
`;
const ContactContainer = styled.View`
  height: 60px;
  padding: 10px 20px 10px 20px;
  flex-direction: row;
  align-items: center;
`;
const Name = styled.Text`
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const Footer = styled.View<{ isSelected: boolean }>`
  height: 55px;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme, isSelected }) => (isSelected ? COLOR.PRIMARY : theme.dark ? '#585858' : '#ffffff')};
`;
const FooterButton = styled.TouchableOpacity`
  padding: 15px;
`;
const FooterButtonLabel = styled.Text<{ isSelected: boolean }>`
  color: ${({ isSelected }) => (isSelected ? COLOR.WHITE : COLOR.PRIMARY)};
  font-size: 13px;
  font-weight: 500;
`;

function Contact({ item, count, setCount, isCheck, checkedContacts, setCheckedContacts, handleClick }) {
  const handleCheck = () => {
    if (!isCheck[item.contact]) {
      setCount(count + 1);
    } else {
      setCount(count - 1);
    }
    const checked = !isCheck[item.contact];
    if (checked) {
      setCheckedContacts([...checkedContacts, item]);
    } else {
      setCheckedContacts(checkedContacts.filter((checkedContact) => checkedContact.contact !== item.contact));
    }
    handleClick(item.contact, checked);
  };

  return (
    <ContactContainer>
      <Name>{item.name}</Name>
      <Pressable>
        <Checkbox checked={isCheck[item.contact]} handleChecked={() => handleCheck()} />
      </Pressable>
    </ContactContainer>
  );
}

function ChooseContacts() {
  const navigation = useNavigation();
  const loadLocalContacts = useLocalContacts();
  const localContacts = useAtomValue(localContactsAtom);
  const [isCheckAll, setIsCheckAll] = useState<boolean>(false);
  const [checkedContacts, setCheckedContacts] = useState<[]>([]);
  const [count, setCount] = useState<number>(0);
  const [contacts, setContacts] = useState([]);
  const [isCheck, setIsCheck] = useState([]);
  // const setContactQueue = useSetAtom(chatRoomSelectedContactQueueAtom);

  const getNumbers = (data) => {
    let numbers = '';
    data.forEach((number, i) => {
      if (i === data.length - 1) {
        numbers += `${number}`;
      } else {
        numbers += `${number}, `;
      }
    });
    return numbers;
  };

  useFocusEffect(
    useCallback(() => {
      let contactList = [];
      localContacts.forEach((contact) => {
        let mobile = contact.phoneNumbers?.filter((number) => number.label == 'mobile');
        let number = mobile && mobile[0] !== undefined ? mobile[0].number : 'none';
        let person = {
          name: `${contact.givenName} ${contact.familyName}`,
          contact: number,
        };

        if (number !== 'none') {
          // @ts-ignore
          contactList.push(person);
        }
      });
      setContacts(contactList);
      const obj = contactList.reduce((_, person) => {
        // @ts-ignore
        return { ..._, [person.contact]: false };
      }, {});
      // @ts-ignore
      setIsCheck(obj);
    }, [localContacts]),
  );

  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    // @ts-ignore
    if (isCheckAll) {
      let obj = contacts.reduce((_, person) => {
        // @ts-ignore
        return { ..._, [person.contact]: false };
      }, {});
      // @ts-ignore
      setIsCheck(obj);
      setCount(0);
    } else {
      let obj = contacts.reduce((_, person) => {
        // @ts-ignore
        return { ..._, [person.contact]: true };
      }, {});
      // @ts-ignore
      setIsCheck(obj);
      setCount(contacts.length);
    }
  };

  const handleClick = (contact, checked) => {
    // @ts-ignore
    setIsCheck((isCheck) => ({
      ...isCheck,
      [contact]: checked,
    }));
  };
  const sendContactQueueToChatRoom = () => {
    navigation.goBack();
    // setContactQueue(checkedContacts);
  };

  useFocusEffect(loadLocalContacts);

  return (
    <MainLayout>
      <BackHeader title={t('choose-contacts.Title')} />
      {contacts.length === 0 ? (
        <NoContacts title={t('choose-contacts.No Contacts')} text={''} />
      ) : (
        <>
          <LabelContainer>
            <Label>{t('choose-contacts.Contact')}</Label>
            <Checkbox checked={isCheckAll} handleChecked={() => handleSelectAll()} />
          </LabelContainer>
          <ScrollView style={tw`flex-1`}>
            {contacts &&
              contacts.map((item, index) => (
                <Contact
                  key={index}
                  item={item}
                  count={count}
                  setCount={setCount}
                  isCheck={isCheck}
                  checkedContacts={checkedContacts}
                  setCheckedContacts={setCheckedContacts}
                  handleClick={handleClick}
                />
              ))}
          </ScrollView>
        </>
      )}
      <Footer
        isSelected={count > 0}
        style={{
          justifyContent: 'center',
          shadowColor: COLOR.BLACK,
          shadowOpacity: 0.1,
          shadowOffset: {
            width: 0,
            height: -15,
          },
          shadowRadius: 10,
        }}
      >
        <FooterButton onPress={() => count !== 0 && sendContactQueueToChatRoom()}>
          <FooterButtonLabel isSelected={count > 0}>
            {count} {t('choose-contacts.Confirm')}
          </FooterButtonLabel>
        </FooterButton>
      </Footer>
    </MainLayout>
  );
}

export default ChooseContacts;
