import React from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import styled from 'styled-components';

import { Row } from 'components/layouts/Row';
import Move from 'assets/images/profile-edit/ic-move.svg';
import MoveW from 'assets/images/profile-edit/ic-move-w.svg';
import { COLOR } from 'constants/COLOR';

const Input = styled(TextInput)`
  font-size: 16px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

interface Props {
  placeholder: string;
  value?: string;
  dark?: boolean;
  onPress: () => void;
}

const ButtonInput = ({ placeholder, value, dark, onPress }: Props) => (
  <TouchableOpacity style={{ flex: 1 }} onPress={onPress}>
    <Row align="center" justify="space-between" style={{ flex: 1 }}>
      <Input editable={false} value={value} placeholder={placeholder} placeholderTextColor={'#ddd'} />
      {dark ? <MoveW /> : <Move />}
    </Row>
  </TouchableOpacity>
);

export default ButtonInput;
