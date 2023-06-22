import React, { useState } from 'react';
import BackHeader from '../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import { SearchBar } from 'components/molecules/search-bar';
import styled from 'styled-components/native';
import NoResults from './components/NoResults';
import { Keyboard, TouchableWithoutFeedback, View } from 'react-native';
import ChatListItem from './components/ChatListItem';
import Room, { roomSort } from 'types/chats/rooms/Room';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import { t } from 'i18next';
import LogUtil from 'utils/LogUtil';
import CopyUtil from 'utils/CopyUtil';
import useSocket from 'hooks/useSocket';
import chatStatusAtom from 'stores/chatStatusAtom';
import { useAtomValue } from 'jotai';
import { COLOR } from 'constants/COLOR';

const Container = styled.View`
  flex: 1;
`;
const SearchBarContainer = styled.View`
  padding-top: 15px;
  padding-left: 15px;
  padding-right: 15px;
`;
const CaptionContainer = styled.View`
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
  border-bottom-style: solid;
  padding-left: 15px;
  margin-top: -5px;
  padding-bottom: 15px;
`;
const Caption = styled.Text`
  color: #bbbbbb;
  font-size: 13px;
  font-weight: 500;
`;
const ChatRoomList = styled.ScrollView`
  flex: 1;
`;

const ChatsSearch = function () {
  const { chatStatus } = useSocket();

  const [searchText, setSearchText] = useState('');
  const onRoomsData = chatStatus.rooms;
  const archivedRoomList: Room[] = onRoomsData?.archivedRooms ?? [];
  const unArchivedRoomList: Room[] = onRoomsData?.unArchivedRooms ?? [];
  const roomList: Room[] = [...archivedRoomList, ...unArchivedRoomList];
  const filteredRoomList = roomList
    .filter(
      (chatroom) =>
        chatroom.name.toLowerCase().includes(searchText.toLowerCase()) ||
        chatroom.preview_message?.content?.toLowerCase()?.includes(searchText.toLowerCase()),
    )
    .sort(roomSort);

  const onChangeSearch = async (value) => {
    setSearchText(value);
  };

  return (
    <MainLayout>
      <BackHeader title={t('chats-search.Search')} />
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <Container>
          <SearchBarContainer>
            <SearchBar
              onChange={onChangeSearch}
              placeholder={t('chats-search.Search chatroom')}
              value={searchText}
              autoFocus={true}
            />
          </SearchBarContainer>
          {searchText !== '' && (
            <>
              {filteredRoomList.length === 0 ? (
                <>
                  {/* <CaptionContainer>
                      <Caption>Chatrooms</Caption>
                    </CaptionContainer> */}
                  <View style={{ padding: 13 }} />
                  <NoResults searchText={searchText} />
                </>
              ) : (
                <>
                  <CaptionContainer>
                    <Caption>{t('chats-search.Chatrooms')}</Caption>
                  </CaptionContainer>
                  <ChatRoomList>
                    {filteredRoomList.map((filteredData, i) => (
                      <ChatListItem key={i} room={filteredData} />
                    ))}
                  </ChatRoomList>
                </>
              )}
            </>
          )}
        </Container>
      </TouchableWithoutFeedback>
    </MainLayout>
  );
};

export default ChatsSearch;
