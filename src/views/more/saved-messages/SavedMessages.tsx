import React, { useCallback, useState } from 'react';
import { TouchableWithoutFeedback, View, Keyboard, Text, Pressable } from 'react-native';
import styled from 'styled-components';
import { SearchBar } from 'components/molecules/search-bar';
import { NoResults, Messages } from 'views/more/components';
import { useFetchWithType } from 'net/useFetch';
import { SavedMessage } from 'types/chats/SavedMessage';
import SwrContainer from 'components/containers/SwrContainer';
import { post } from 'net/rest/api';
import { useFocusEffect } from '@react-navigation/native';
import { ModalBase } from 'components/modal';
import { Row } from 'components/layouts/Row';
import { Column } from 'components/layouts/Column';
import { t } from 'i18next';

const Container = styled(View)`
  height: 100%;
  padding: 20px 20px 60px 20px;
`;
const ModalTitle = styled(Text)`
  color: black;
  padding: 10px;
`;
const ConfirmButton = styled(Pressable)`
  background-color: ${(props) => props.theme.colors.PRIMARY};
  width: 100px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${(props) => props.theme.colors.PRIMARY};
`;
const ConfirmLabel = styled(Text)`
  color: #fff;
  font-size: 13px;
  font-weight: 500;
`;
export const SavedMessages = () => {
  const { data, error, mutate } = useFetchWithType<SavedMessage[]>('/chats/messages/saves');
  const [searchValue, setSearchValue] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const onClick = (room_id, message_id) => {
    post(`chats/rooms/${room_id}/messages/${message_id}/unsave`, {}).then(() => {
      mutate();
    });
  };

  useFocusEffect(
    useCallback(() => {
      mutate();
    }, [mutate]),
  );
  const filterData = data?.filter(
    (msg) =>
      msg.message.content.toLowerCase().includes(searchValue.toLowerCase()) ||
      `${msg.message.user?.first_name} ${msg.message.user?.last_name}`
        ?.toLowerCase()
        .includes(searchValue.toLowerCase()),
  );

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <>
        <SwrContainer data={filterData} error={error}>
          <Container>
            <SearchBar onChange={(value) => setSearchValue(value)} placeholder="Search messages" value={searchValue} />
            {searchValue && filterData?.length === 0 ? (
              <NoResults searchValue={searchValue} />
            ) : (
              <Messages data={filterData} onClick={onClick} setIsVisible={setIsVisible} />
            )}
          </Container>
        </SwrContainer>
        <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
          <Column justify="center" align="center">
            <ModalTitle>{t('saved-message.This message has been deleted')}</ModalTitle>
            <Row style={{ paddingTop: 25 }}>
              <ConfirmButton
                onTouchStart={() => {
                  setIsVisible(false);
                }}
              >
                <ConfirmLabel>{t('saved-message.OK')}</ConfirmLabel>
              </ConfirmButton>
            </Row>
          </Column>
        </ModalBase>
      </>
    </TouchableWithoutFeedback>
  );
};
