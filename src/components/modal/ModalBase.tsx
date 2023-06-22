import React from 'react';

import styled from 'styled-components/native';
import { View } from 'react-native';
import Modal from 'react-native-modal';
import User from 'types/auth/User';
import userAtom from 'stores/userAtom';
import { useAtomValue } from 'jotai';

type ModalBaseProps = {
  isVisible: boolean;
  width?: number;
  onBackdropPress: () => void;
  title?: string;
  subDesc?: string;
  children?: any;
  radius?: boolean;
  padding?: boolean;
};

const StyledModalContainer = styled.View<{ width: number; radius: boolean; isPadding: boolean }>`
  flex-direction: column;
  align-items: center;
  width: ${({ width }) => `${width}px`};
  border-radius: ${({ radius }) => (radius ? '11px' : '0px')};
  padding: ${({ isPadding }) => (isPadding ? '35px 15px' : '0px 15px')};
  background-color: #fff;
`;

const Title = styled.Text`
  color: #262525;
  font-weight: 500;
  /* font-size: 15px; */
  margin-bottom: 7px;
`;

const Description = styled.Text`
  color: #999;
  font-weight: 500;
  /* font-size: 12px; */
  margin-bottom: 7px;
`;

const ContentInner = styled.View`
  display: flex;
  cursor: auto;
  flex-direction: row;
  pointer-events: auto;
  justify-content: space-between;
`;

export const ModalBase = ({
  isVisible,
  onBackdropPress,
  title,
  subDesc,
  children,
  width = 325,
  radius = false,
  padding = true,
}: ModalBaseProps) => {
  const myUser: User | null = useAtomValue(userAtom);

  return (
    <View>
      <Modal
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        isVisible={isVisible}
        onBackdropPress={onBackdropPress}
      >
        <StyledModalContainer width={width} radius={radius} isPadding={padding}>
          {title && <Title style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{title}</Title>}
          {subDesc && (
            <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{subDesc}</Description>
          )}
          <ContentInner>{children}</ContentInner>
        </StyledModalContainer>
      </Modal>
    </View>
  );
};
