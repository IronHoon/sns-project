import React from 'react';
import { Dimensions, Text, TouchableOpacity } from 'react-native';
import styled from 'styled-components';

import { COLOR } from 'constants/COLOR';

interface Props {
  label: string;
  length: number;
  selected: string;
  value: string;
  onChange: (value: string) => void;
}

interface StyleProps {
  active: boolean;
  length: number;
  onPress: () => void;
}

const { width: WIDTH } = Dimensions.get('window');

const TabButton = styled(TouchableOpacity)<StyleProps>`
  align-items: center;
  border-bottom-style: solid;
  display: flex;
  height: 50px;
  justify-content: center;
  width: ${({ length }) => (length ? `${WIDTH / length}px;` : '100%')};

  ${({ active }) =>
    active
      ? `border-bottom-color: ${COLOR.PRIMARY}; border-bottom-width: 2px; color: ${COLOR.PRIMARY};`
      : `border-bottom-color: ${COLOR.GRAY}; border-bottom-width: 1px; color: ${COLOR.TEXT_GRAY};`}
`;
const ButtonText = styled(Text)<{ active: boolean }>`
  font-size: 14px;
  ${({ active }) =>
    active ? `color: ${COLOR.PRIMARY}; font-weight: 500;` : `color: ${COLOR.TEXT_GRAY}; font-weight: normal`}
`;

export const Tab = ({ label, length, selected, value, onChange }: Props) => (
  <TabButton active={value === selected} length={length} onPress={() => onChange(value)}>
    <ButtonText active={value === selected}>{label}</ButtonText>
  </TabButton>
);
