import React, { useContext } from 'react';

import { RowContainer } from 'views/more/components/RowContainer';
import { Title } from 'views/more/components/Title';
import ButtonInput from 'views/more/components/ButtonInput';
import { t } from 'i18next';
import parsePhoneNumber from 'libphonenumber-js';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { ThemeContext } from 'styled-components/native';
import User from '../../../types/auth/User';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

function getFormattedNum(phoneNumber) {
  let formattedNum = '';
  let phoneNumberSplit = phoneNumber.split(' ');

  phoneNumberSplit.forEach((num, i) => {
    if (i === 0) {
      formattedNum += `${num} `;
    } else if (i < phoneNumberSplit.length - 1) {
      formattedNum += `${num}-`;
    } else {
      formattedNum += `${num}`;
    }
  });
  return formattedNum;
}

interface UserInfoInputsProps {
  user: User;
  update: (field: string, value: any) => void;
  draft: User | undefined;
  hasDiff: boolean;
}
const Number = ({ user, update, draft, hasDiff }: UserInfoInputsProps) => {
  const navigation = useNavigation<MainNavigationProp>();
  const contact = parsePhoneNumber(`+${user.contact}`)?.formatInternational();
  const formattedNum = getFormattedNum(contact);
  const { dark } = useContext(ThemeContext);
  // console.log('update', update);
  const draftNum = parsePhoneNumber(`+${draft?.contact}`)?.formatInternational();
  const me: User | null = useAtomValue(userAtom);
  const themeFont = me?.setting.ct_text_size as number;
  return (
    <RowContainer fullWidth>
      {/* <Title>{t('profile-edit.Number')}</Title> */}
      <Title style={{ fontSize: themeFont - 2 }}>{`Phone\nNumber`}</Title>
      <ButtonInput
        value={hasDiff ? getFormattedNum(draftNum) : formattedNum}
        placeholder="+82 010-1234-5678"
        dark={dark}
        onPress={() =>
          navigation.navigate('/more/profile-edit/change-number-info', {
            update: update,
          })
        }
      />
    </RowContainer>
  );
};

export default Number;
