import React, { useState } from 'react';
import { InputContainer } from 'views/more/components/InputContainer';
import { Desc } from 'views/more/components/Desc';
import { Input } from 'views/more/components/Input';
import User from '../../../types/auth/User';
import { patch } from '../../../net/rest/api';
import { t } from 'i18next';
import styled from 'styled-components';
import { Text } from 'react-native';

interface ProfileMsgInputProps {
  user: User;
  update: (field: string, value: any) => void;
}

const InvalidText = styled(Text)`
  color: red;
  font-size: 13px;
  margin-bottom: 3px;
  margin-top: 10px;
`;

const ProfileMsgInput = ({ user, update }: ProfileMsgInputProps) => {
  const [message, setMessage] = useState(user.profile_message || '');
  const [invalidText, setInvalidText] = useState(' ');
  const themeFont = user?.setting.ct_text_size as number;

  const setMsg = (msg) => {
    setMessage(msg);
    if (msg.length > 151) {
      setInvalidText('Profile message Maximum 150 characters limit');
    } else {
      setInvalidText('');
    }
  };
  return (
    <InputContainer>
      <Input
        placeholder={t('profile-edit.Profile Message')}
        value={message}
        onChangeText={(value) => {
          setMsg(value);
          update('profile_message', value);
        }}
        style={{ fontSize: themeFont - 1 }}
      />
      <InvalidText style={{ fontSize: themeFont - 3 }}>{invalidText}</InvalidText>
      <Desc style={{ fontSize: themeFont - 3 }}>{t('profile-edit.Any detail such as age, occupation or city')}</Desc>
    </InputContainer>
  );
};

export default ProfileMsgInput;
