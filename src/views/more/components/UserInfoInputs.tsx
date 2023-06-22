import React from 'react';

import Birthday from 'views/more/components/Birthday';
import Email from 'views/more/components/Email';
import { InputContainer } from 'views/more/components/InputContainer';
import Number from 'views/more/components/Number';
import User from '../../../types/auth/User';

interface UserInfoInputsProps {
  user: User;
  update: (field: string, value: any) => void;
  draft: User | undefined;
  hasDiff: boolean;
}

const UserInfoInputs = ({ user, update, draft, hasDiff }: UserInfoInputsProps) => (
  <InputContainer>
    <Birthday update={update} draft={draft} />
    <Number user={user} update={update} draft={draft} hasDiff={hasDiff} />
    <Email user={user} update={update} draft={draft} hasDiff={hasDiff} />
  </InputContainer>
);

export default UserInfoInputs;
