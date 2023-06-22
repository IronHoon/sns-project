import React, { useContext, useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import styled, { ThemeContext } from 'styled-components';

import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import { Avatar } from 'components/atoms/image';
import { COLOR } from 'constants/COLOR';
import { t } from 'i18next';
import { useAtomValue } from 'jotai';
import userAtom from '../../../../stores/userAtom';

const Container = styled(View)`
  align-items: center;
  border-top-color: ${COLOR.GRAY};
  border-top-style: solid;
  border-top-width: 1px;
  display: flex;
  flex-direction: row;
  font-size: 16px;
  height: 55px;
  padding-left: 60px;
  width: 100%;

  ::placeholder {
    color: ${COLOR.DARK_GRAY};
  }
`;
const AvatarContainer = styled(View)`
  position: absolute;
  left: 16px;
  top: 13px;
`;
const BtnContainer = styled(TouchableOpacity)`
  right: 20px;
  top: 10px;
  position: absolute;
`;

const Input = styled(TextInput)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.TEXT_GRAY)};
  padding-right: 70px;
  width: 100%;
`;

interface Props {
  onPress: (value: string) => void;
  commentMutate: () => void;
}

const InputComment = ({ onPress, commentMutate }: Props) => {
  const [value, setValue] = useState('');
  const user = useAtomValue(userAtom);
  const theme = useContext(ThemeContext);

  return (
    <Container>
      <AvatarContainer>
        <Avatar size={30} src={user?.profile_image} />
      </AvatarContainer>
      <Input
        placeholder={t('post-detail.Comment')}
        placeholderTextColor={theme.dark ? COLOR.TEXT_GRAY : ''}
        value={value}
        onChangeText={(text: string) => setValue(text)}
        style={{ fontSize: user?.setting?.ct_text_size as number }}
      />
      <BtnContainer>
        <Button
          fontSize={13}
          fontWeight={400}
          height={38}
          label={t('post-detail.Posting')}
          textvariant={ButtonTextVariant.Text}
          variant={ButtonVariant.TextBtn}
          onPress={() => {
            onPress(value);
            setValue('');
            commentMutate();
          }}
          // @ts-ignore
          style={{ paddingTop: 10, paddingBottom: 10 }}
        />
      </BtnContainer>
    </Container>
  );
};
export default InputComment;
