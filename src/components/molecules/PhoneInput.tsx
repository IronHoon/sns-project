import React, { useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import styled from 'styled-components/native';
import parsePhoneNumber from 'libphonenumber-js';
import SelectCountry from '../atoms/input/SelectCountry';
import { COLOR } from '../../constants/COLOR';
import { COUNTRIES_DATA } from '../../data/countriesData';
import CloseRoundIcon from 'assets/ic-close-round.svg';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import { t } from 'i18next';

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  invalid?: boolean;
}

const InvalidText = styled.Text`
  color: red;
  font-size: 13px;
  padding-top: 10px;
  margin-left: 70px;
`;

export default function PhoneInput({ value, onChange, invalid }: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [focus, setFocus] = useState<boolean>(false);
  const user = useAtomValue(userAtom);

  const isValid = useMemo(() => {
    if (phoneNumber === '') {
      return true;
    } else {
      if (phoneNumber === user?.contact) {
        return false;
      } else {
        if (countryCode) {
          const countryData = COUNTRIES_DATA.find((country) => country.countryCode === countryCode);
          if (countryData) {
            const parsed = parsePhoneNumber(`+${countryData.countryCallingCode}${phoneNumber}`);
            return parsed?.isValid();
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
    }
  }, [countryCode, phoneNumber]);

  useEffect(() => {
    if (value) {
      const parsed = parsePhoneNumber(value);
      setCountryCode(parsed?.country || '');
      setPhoneNumber(parsed?.nationalNumber || '');
    }
  }, [value]);

  useEffect(() => {
    if (countryCode) {
      const countryData = COUNTRIES_DATA.find((country) => country.countryCode === countryCode);
      if (countryData) {
        onChange?.(`+${countryData.countryCallingCode}${phoneNumber}`);
      }
    }
  }, [countryCode, onChange, phoneNumber]);

  return (
    <View>
      <View style={tw`flex-row`}>
        <SelectCountry onChange={setCountryCode} />
        <PhoneNumberTextInput
          keyboardType="phone-pad"
          placeholder={t('using-phone-number.Phone number')}
          placeholderTextColor={COLOR.POINT_GRAY}
          value={phoneNumber}
          onChangeText={(number) => setPhoneNumber(number)}
          focus={focus}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          isValid={phoneNumber.length === 1 ? false : invalid ? false : isValid ?? true}
        />
        {phoneNumber !== '' && (
          <TouchableOpacity
            style={{ position: 'absolute', right: 10, top: 0 }}
            onPress={() => {
              setPhoneNumber('');
            }}
          >
            <CloseRoundIcon width={16} height={16} />
          </TouchableOpacity>
        )}
      </View>
      {!isValid && (
        <InvalidText>
          {phoneNumber === user?.contact
            ? t('using-phone-number.You cannot add yourself')
            : t('using-phone-number.Please enter a valid phone number')}
        </InvalidText>
      )}
    </View>
  );
}

const PhoneNumberTextInput = styled.TextInput<{
  focus: boolean;
  isValid: boolean;
}>`
  padding: 0;
  margin: 0;
  height: 28.5px;
  padding-bottom: 10px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ isValid, focus, theme }) =>
    !isValid ? 'red' : focus ? (theme.dark ? COLOR.WHITE : COLOR.BLACK) : COLOR.LIGHT_GRAY};
  width: 80%;
  margin-left: 10px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
