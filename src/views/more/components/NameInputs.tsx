import React, { useEffect, useState } from 'react';

import { Input } from 'views/more/components/Input';
import { Desc } from 'views/more/components/Desc';
import { InputContainer } from 'views/more/components/InputContainer';
import User from '../../../types/auth/User';
import { patch } from '../../../net/rest/api';
import { t } from 'i18next';
import styled from 'styled-components/native';
import { Text } from 'react-native';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

interface NameInputsProps {
  user: User;
  update: (field: string, value: any) => void;
}
const InvalidText = styled(Text)`
  color: red;
  font-size: 13px;
  margin-bottom: 3px;
  margin-top: 10px;
`;

const NameInputs = ({ user, update }: NameInputsProps) => {
  const [firstName, setFirstName] = useState(user.first_name || '');
  const [lastName, setLastName] = useState(user.last_name || '');
  const [invalidText, setInvalidText] = useState(' ');

  const me: User | null = useAtomValue(userAtom);
  const themeFont = me?.setting.ct_text_size as number;

  useEffect(() => {
    setFirstName(user.first_name);
    setLastName(user.last_name);
  }, [user]);

  useEffect(() => {
    if (firstName.length > 17 || lastName.length > 17) {
      setInvalidText('Name Maximum 16 characters limit');
    } else if (firstName === '' || lastName === '') {
      setInvalidText('Name is required.');
    } else {
      setInvalidText(' ');
    }
  }, [firstName, lastName]);

  return (
    <InputContainer>
      <Input
        marginBottom={20}
        placeholder={t('profile-edit.First Name')}
        value={firstName}
        onChangeText={(value) => {
          setFirstName(value);
          update('first_name', value);
        }}
        style={{ fontSize: themeFont - 1 }}
      />
      <Input
        placeholder={t('profile-edit.Last Name')}
        value={lastName}
        onChangeText={(value) => {
          setLastName(value);
          update('last_name', value);
        }}
        style={{ fontSize: themeFont - 1 }}
      />
      <InvalidText>{invalidText}</InvalidText>

      <Desc style={{ fontSize: themeFont - 3 }}>
        {t('profile-edit.Enter your name and add an optional profile photo')}
      </Desc>
    </InputContainer>
  );
};

export default NameInputs;
