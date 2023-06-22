import React, { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import styled from 'styled-components/native';
import { COLOR } from '../../../constants/COLOR';
import SelectCountryModal from '../../modal/SelectCountryModal';

interface SelectCountryProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function SelectCountry({ value, onChange }: SelectCountryProps) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState('LA');
  const [, setCountryCallingCode] = useState(856);

  useEffect(() => {
    if (value) {
      setCountryCode(value);
    }
  }, [value]);

  useEffect(() => {
    onChange?.(countryCode);
  }, [countryCode, onChange]);

  return (
    <SelectCountryButton
      onPress={() => {
        Keyboard.dismiss();
        setIsVisible(true);
      }}
    >
      <Icon source={require('../../../assets/ic-phone-16.png')} />
      <Country>{countryCode}</Country>
      <Icon source={require('../../../assets/ic-down.png')} />

      <SelectCountryModal
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setCountryCode={setCountryCode}
        setCountryCallingCode={setCountryCallingCode}
      />
    </SelectCountryButton>
  );
}

const SelectCountryButton = styled.TouchableOpacity`
  flex-direction: row;
  border-bottom-style: solid;
  border-bottom-color: ${COLOR.LIGHT_GRAY};
  border-bottom-width: 1px;
  width: 60px;
  padding-bottom: 10px;
  align-items: center;
`;
const Country = styled.Text`
  padding-left: 5px;
  padding-right: 5px;
  height: 19px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const Icon = styled.Image`
  width: 15px;
  height: 15px;
  tint-color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
