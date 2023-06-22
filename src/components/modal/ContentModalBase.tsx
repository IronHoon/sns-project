import React from 'react';

import styled from 'styled-components/native';
import {View} from 'react-native';
import Modal from 'react-native-modal';

type ModalBaseProps = {
  isVisible: boolean;
  width?: number;
  onBackdropPress: () => void;
  title?: string;
  subDesc?: string;
  children?: any;
};

const StyledModalContainer = styled.View`
  flex-direction: column;
  align-items: center;
  width: 325px;
  padding: 35px 20px;
  background-color: #fff;
`;

const ContentInner = styled.View`
  display: flex;
  cursor: auto;
  align-items: center;
  pointer-events: auto;
  justify-content: space-between;
`;

export const ContentModalBase = ({
  isVisible,
  onBackdropPress,
  children,
}: ModalBaseProps) => {
  return (
    <View>
      <Modal
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
        useNativeDriver={true}
        hideModalContentWhileAnimating={true}
        isVisible={isVisible}
        onBackdropPress={onBackdropPress}>
        <StyledModalContainer>
          <ContentInner>{children}</ContentInner>
        </StyledModalContainer>
      </Modal>
    </View>
  );
};
