import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, Platform, Pressable, Text } from 'react-native';
import NavbarLayout from 'components/layouts/NavbarLayout';
import useFetch from '../../net/useFetch';
import SwrContainer from '../../components/containers/SwrContainer';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import ContactItem from './molecules/ContactItem';
import { useAtom, useAtomValue } from 'jotai';
import userAtom from '../../stores/userAtom';
import contactsAtom from '../../stores/contactsAtom';
import styled, { ThemeContext } from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import TitleHeader from 'components/molecules/TitleHeader';
import IconButton from 'components/atoms/MIconButton';
import Space from 'components/utils/Space';
import { Row } from 'components/layouts/Row';
import Open from 'assets/contacts/ic_open.svg';
import Fold from 'assets/contacts/ic_fold.svg';
import AlphabetList from 'react-native-flatlist-alphabet';
import Tail from 'assets/tail.svg';
import NoContacts from './molecules/NoContacts';
import { useSetAtom } from 'jotai';
import { SearchBar } from 'components/molecules/search-bar';
import { t } from 'i18next';
import { get } from '../../net/rest/api';
import friendListAtom from '../../stores/friendListAtom';

const DescChatBubble = () => {
  return (
    <ChatBubbleContainer>
      <MyChatBubble>
        <ChatText>{t('contacts-main.Add Friends!')}</ChatText>
      </MyChatBubble>
      <ChatTail fill={COLOR.PRIMARY} style={{ transform: [{ rotate: '45deg' }] }} />
    </ChatBubbleContainer>
  );
};

const EditButton = ({ fontSize, onClick }) => {
  return (
    <Pressable style={{ flexDirection: 'row' }} onPress={() => onClick()}>
      <Image source={require('assets/ic-edit.png')} style={{ width: fontSize - 3, height: fontSize - 3 }} />
      <Text style={{ fontSize: fontSize - 3, color: '#999999' }}> {t('contacts-main.Edit')}</Text>
    </Pressable>
  );
};

const DoneButton = ({ fontSize, onClick }) => {
  return (
    <Pressable onPress={() => onClick()}>
      <Text style={{ fontSize: fontSize - 2, color: COLOR.PRIMARY }}>{t('contacts-main.Done')}</Text>
    </Pressable>
  );
};

function ContactsMain({ navigation }) {
  const user = useAtomValue(userAtom);

  const themeContext = useContext(ThemeContext);
  const themeColor = themeContext.dark ? '#464646' : COLOR.LIGHT_GRAY;
  const themeFont = user?.setting.ct_text_size as number;

  const setContacts = useSetAtom(contactsAtom);

  const { data: contactsList, error: contactsError, mutate: contactsMutate } = useFetch('/auth/contacts');
  const { data: birthdayList, error: birthdayError, mutate: birthdayMutate } = useFetch('/auth/contacts/birthday');
  const { data: favoritesList, error: favoritesError, mutate: favoritesMutate } = useFetch('/auth/contacts/favorites');

  const [isBirthOpen, setIsBirthOpen] = useState<boolean>(true);
  const [isFavoriteOpen, setIsFavoriteOpen] = useState<boolean>(true);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [selectedList, setSelectedList] = useState([]);
  const [keyword, setKeyword] = useState<string>('');
  const [isScroll, setIsScroll] = useState<boolean>(false);

  const handleDone = () => {
    contactsMutate();
    favoritesMutate();
    setSelectedList([]);
    setKeyword('');
    setIsEdit(false);
  };

  const systemAccountUserId = 5;
  const filter = useCallback(
    (contact) => {
      const { friend } = contact;
      if (friend.id === systemAccountUserId) {
        return false;
      }

      if (friend.email !== null && keyword !== '') {
        if (friend.email.toLowerCase().includes(keyword.toLowerCase())) {
          return true;
        }
      }
      if (friend.contact.includes(keyword)) {
        return true;
      }
      if (friend.first_name.toLowerCase().includes(keyword.toLowerCase())) {
        return true;
      }
      if (friend.last_name.toLowerCase().includes(keyword.toLowerCase())) {
        return true;
      }
      if (friend.uid.toLowerCase().includes(keyword.toLowerCase())) {
        return true;
      }

      return false;
    },
    [keyword],
  );

  const filtered = useMemo(() => {
    return contactsList && contactsList.filter((contact) => filter(contact));
  }, [contactsList, filter]);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setIsEdit(false);
      setSelectedList([]);
      contactsMutate();
      birthdayMutate();
      favoritesMutate();
      setContacts(contactsList);
    }
  }, [isFocused]);

  const addedMeList = useAtomValue(friendListAtom);

  const filteredBirthdayList = birthdayList?.filter(({ friend }) => {
    const sc_birthday = friend.setting.sc_birthday;
    const isAddedMe = addedMeList?.includes(friend.id);
    if (sc_birthday === 'public' || (sc_birthday === 'friends' && isAddedMe)) {
      return true;
    } else {
      return false;
    }
  });

  const buttonList = [
    {
      icon: require('assets/ic-search.png'),
      onClick: () => navigation.navigate('/contacts/contacts-search'),
    },
    {
      icon: require('assets/contacts/ic_add.png'),
      onClick: () => navigation.navigate('/contacts/contacts-add-friend'),
    },
  ];

  const data =
    contactsList &&
    filtered
      .sort((a, b) => a.friend.first_name.toLowerCase().localeCompare(b.friend.first_name.toLowerCase()))
      .map((contact, i) => ({
        value: contact.friend.first_name,
        key: i,
        id: contact.id,
        friend: contact.friend,
      }));

  return (
    <NavbarLayout themeColor={false} color={themeColor}>
      <TitleHeader
        title={t('contacts-main.Contacts')}
        themeColor={true}
        border={false}
        justify={'flex-start'}
        button={buttonList.map((button, i) => (
          <IconButton key={i} themeColor={true} source={button.icon} onClick={() => button.onClick()} />
        ))}
      />
      {contactsList && contactsList.length === 0 ? (
        <>
          {/*내 정보*/}
          {user && <ContactItem user={user} />}
          <NoContacts title={t('contacts-main.No Contacts')} text={t('contacts-main.Add friends to chat with them')} />
        </>
      ) : (
        <SwrContainer data={contactsList} error={contactsError}>
          <AlphabetList
            //@ts-ignore
            onScrollBeginDrag={() => setIsScroll(true)}
            onScrollEndDrag={() => {
              setTimeout(() => {
                setIsScroll(false);
              }, 2000);
            }}
            //@ts-ignore
            ListHeaderComponent={
              <>
                {/*내 정보*/}
                {user && <ContactItem user={user} />}
                <Space height={20} />
                {isEdit && (
                  <SearchBarContainer>
                    <SearchBar
                      onChange={setKeyword}
                      value={keyword}
                      placeholder={t('contacts-main.Search within your contact list')}
                    />
                  </SearchBarContainer>
                )}
                {filteredBirthdayList && filteredBirthdayList.length > 0 && (
                  <>
                    <SwrContainer data={filteredBirthdayList} error={birthdayError}>
                      <>
                        <Row style={{ alignItems: 'center', marginRight: 20 }}>
                          <Row style={{ flex: 1 }}>
                            <Label fontSize={themeFont}>
                              {t('contacts-main.Friends with Birthday')}{' '}
                              <Count fontSize={themeFont}>{filteredBirthdayList && filteredBirthdayList.length}</Count>
                            </Label>
                          </Row>
                          <Pressable onPress={() => setIsBirthOpen(!isBirthOpen)}>
                            {isBirthOpen ? <Fold /> : <Open />}
                          </Pressable>
                        </Row>
                        {isBirthOpen && (
                          <>
                            {filteredBirthdayList &&
                              filteredBirthdayList.map((contact) => (
                                <ContactItem key={contact.id} user={contact?.friend} />
                              ))}
                          </>
                        )}
                      </>
                    </SwrContainer>
                    <Space height={20} />
                  </>
                )}
                {favoritesList && favoritesList.length > 0 && (
                  <>
                    <SwrContainer data={favoritesList} error={favoritesError}>
                      <>
                        <Row style={{ alignItems: 'center', marginRight: 20 }}>
                          <Row style={{ flex: 1 }}>
                            <Label fontSize={themeFont}>
                              {t('contacts-main.Favorites')}{' '}
                              <Count fontSize={themeFont}>{favoritesList && favoritesList.length}</Count>
                            </Label>
                          </Row>
                          <Pressable onPress={() => setIsFavoriteOpen(!isFavoriteOpen)}>
                            {isFavoriteOpen ? <Fold /> : <Open />}
                          </Pressable>
                        </Row>
                        {isFavoriteOpen && (
                          <>
                            {favoritesList &&
                              favoritesList.map((contact) => <ContactItem key={contact.id} user={contact?.friend} />)}
                          </>
                        )}
                      </>
                    </SwrContainer>
                    <Space height={20} />
                  </>
                )}
                <Row style={{ alignItems: 'center', marginRight: 20 }}>
                  <Row style={{ flex: 1 }}>
                    <Label fontSize={themeFont}>
                      {t('contacts-main.Friends')}{' '}
                      <Count fontSize={themeFont}>{contactsList && contactsList.length}</Count>
                    </Label>
                  </Row>
                  {isEdit ? (
                    <DoneButton fontSize={themeFont} onClick={() => handleDone()} />
                  ) : (
                    <EditButton fontSize={themeFont} onClick={() => setIsEdit(true)} />
                  )}
                </Row>
              </>
            }
            // ListFooterComponent={<>{Platform.OS === 'android' && <AndroidPadding />}</>}
            //@ts-ignore
            // scrollEnabled={false}
            containerStyle={{
              position: 'absolute',
              right: -18,
              top: -60,
            }}
            style={{
              height: '92%',
              width: Dimensions.get('window').width,
              marginBottom: Platform.OS === 'android' ? Dimensions.get('screen').height / 28 : 0,
            }}
            data={data}
            indexLetterColor="#cccccc"
            indexLetterSize={themeFont - 5}
            renderItem={(contact: any) => (
              <ContactItem
                key={contact.id}
                user={contact.friend}
                isEdit={isEdit}
                selectedList={selectedList}
                setSelectedList={setSelectedList}
                highlight={true}
                searchValue={keyword}
                isLastone={contact.key + 1 === data.length}
              />
            )}
            renderSectionHeader={(section) => (
              <SectionHeaderWrap>
                <SectionHeaderLabel>{section.title}</SectionHeaderLabel>
              </SectionHeaderWrap>
            )}
            stickySectionHeadersEnabled={true}
            letterIndexWidth={isScroll ? 40 : 0}
            alphabetContainer={{ width: 20 }}
          />
        </SwrContainer>
      )}
      {contactsList && contactsList.length === 0 && <DescChatBubble />}
    </NavbarLayout>
  );
}

export default ContactsMain;

const Label = styled.Text<{ fontSize: number }>`
  font-size: ${({ fontSize }) => `${fontSize - 2}px`};
  font-weight: 500;
  color: #bbbbbb;
  margin-left: 20px;
  margin-top: 10px;
  margin-bottom: 10px;
`;
const Count = styled.Text<{ fontSize: number }>`
  font-size: ${({ fontSize }) => `${fontSize - 2}px`};
  font-weight: 500;
  color: ${COLOR.PRIMARY};
`;
const SectionHeaderWrap = styled.View`
  margin-left: 20px;
  margin-top: 10px;
  margin-bottom: 10px;
`;
const SectionHeaderLabel = styled.Text`
  font-size: 13px;
  font-weight: bold;
  color: ${COLOR.PRIMARY};
`;
const ChatBubbleContainer = styled.View`
  width: 103px;
  position: absolute;
  top: 55px;
  right: 17px;
`;
const MyChatBubble = styled.View`
  border-radius: 15px;
  background-color: ${COLOR.PRIMARY};
  width: 105px;
  justify-content: center;
  align-items: center;
`;
const ChatText = styled.Text`
  color: ${COLOR.WHITE};
  font-size: 12px;
  font-weight: 500;
  padding: 8px;
`;
const ChatTail = styled(Tail)`
  position: absolute;
  top: -10px;
  right: 15px;
`;
const SearchBarContainer = styled.View`
  height: 60px;
  padding: 20px;
  justify-content: center;
`;
const AndroidPadding = styled.View`
  height: ${`${Dimensions.get('window').height / 17}px`};
`;
