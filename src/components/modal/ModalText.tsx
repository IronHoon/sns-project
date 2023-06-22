import { useAtomValue } from 'jotai';
import React, { ReactNode } from 'react';
import userAtom from 'stores/userAtom';
import styled from 'styled-components/native';
import User from 'types/auth/User';
import { COLOR } from '../../constants/COLOR';

type ComponentProps = {
  children: ReactNode;
  bold?: boolean;
};

const Component = styled.Text<ComponentProps>`
  ${({ bold }) => bold && 'font-weight: 700;'}

  /* font-size: 13px; */
  /* line-height: 19px; */
  color: ${COLOR.TEXT_GRAY};

  text-align: center;
`;

export const ModalText = ({ children, bold, ...props }: ComponentProps) => {
  const myUser: User | null = useAtomValue(userAtom);

  return (
    <Component style={{ fontSize: myUser?.setting?.ct_text_size as number }} bold={bold} {...props}>
      {children}
    </Component>
  );
};
