import React from 'react';
import styled from 'styled-components/native';
import { COLOR } from '../../constants/COLOR';
import User from 'types/auth/User';
import userAtom from 'stores/userAtom';
import { useAtomValue } from 'jotai';

const Component = styled.Text`
  text-align: center;
  margin-bottom: 10px;
  font-weight: 500;
  /* font-size: 15px; */
  /* line-height: 20px; */
  color: ${COLOR.BLACK};
`;

export const ModalTitle = ({ ...props }) => {
  const myUser: User | null = useAtomValue(userAtom);
  return <Component style={{ fontSize: myUser?.setting?.ct_text_size as number }} {...props} />;
};
