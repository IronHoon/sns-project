import React, { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components';

import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import { COLOR } from 'constants/COLOR';
import { t } from 'i18next';
import User from 'types/auth/User';

const Container = styled(View)<{ reReComment?: boolean }>`
  align-items: center;
  background: ${({ theme }) => (theme.dark ? COLOR.DARK_GRAY : COLOR.WHITE)};
  display: flex;
  flex-direction: row;
  font-size: 16px;
  height: 40px;
  margin-left: ${({ reReComment }) => (reReComment ? 80 : 40)}px;
  padding-left: 15px;
  margin-bottom: 10px;

  ::placeholder {
    color: ${COLOR.DARK_GRAY};
  }
`;
const BtnContainer = styled(TouchableOpacity)`
  right: 20px;
  top: 11px;
  position: absolute;
`;

const Input = styled(TextInput)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.TEXT_GRAY)};
  padding-right: 70px;
  width: 100%;
`;

interface Props {
  me: User;
  onPress: (value: string) => void;
  reReComment?: boolean;
}

const InputReComment = ({ me, reReComment, onPress }: Props) => {
  const [value, setValue] = useState('');

  return (
    <Container reReComment={reReComment}>
      <Input
        placeholder={t('post-detail.Comment')}
        value={value}
        onChangeText={(text: string) => setValue(text)}
        style={{ fontSize: me?.setting?.ct_text_size as number }}
      />
      <BtnContainer>
        <Button
          fontSize={13}
          fontWeight={400}
          height={18}
          label={t('post-detail.Posting')}
          textvariant={ButtonTextVariant.Text}
          variant={ButtonVariant.TextBtn}
          onPress={() => {
            onPress(value);
            setValue('');
          }}
        />
      </BtnContainer>
    </Container>
  );
};

export default InputReComment;
