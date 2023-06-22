import React from 'react';
import { FlatList } from 'react-native';
import styled from 'styled-components';
import Message from './Message';

interface MessagesProps {
  data: any;
  onClick: (id: number, bookmarked: boolean) => void;
  setIsVisible: (boolean: boolean) => void;
}

const Container = styled(FlatList)`
  height: 100%;
`;

const Messages = ({ data, onClick, setIsVisible }: MessagesProps) => {
  const renderItem = ({ item }) => <Message data={item} onClick={onClick} setIsVisible={setIsVisible} />;

  return <Container data={data} keyExtractor={(item: any) => item._id} renderItem={renderItem} />;
};

export default Messages;
