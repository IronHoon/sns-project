import React from 'react';
import styled from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import AddContacts from 'assets/contacts/ic_addcontacts.svg';

const Container = styled.View`
  flex: 1;
  display: flex;
  align-items: center;
  padding-top: 120px;
`;
const Title = styled.Text`
  margin: 20px 0 10px;
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

const Desc = styled.Text`
  font-size: 14px;
  line-height: 20px;
  color: ${COLOR.TEXT_GRAY};
  text-align: center;
`;

function NoContacts({ title, text }) {
  return (
    <Container>
      <AddContacts width={52} height={52} />
      <Title>{title}</Title>
      <Desc>{text}</Desc>
    </Container>
  );
}

export default NoContacts;
