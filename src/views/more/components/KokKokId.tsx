import React, { useContext, useState } from 'react';
import { Text, TextInput } from 'react-native';
import styled from 'styled-components';

import { Desc } from 'views/more/components/Desc';
import { InputContainer } from 'views/more/components/InputContainer';
import User from '../../../types/auth/User';
import { t } from 'i18next';
import AuthUtil from 'utils/AuthUtil';
import CheckSvg from 'assets/ic_check.svg';
import CheckSvg_Dark from 'assets/ic_check_w.svg';
import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';
import { ThemeContext } from 'styled-components/native';

const TextInputRow = styled(Row)`
  margin: 15px 0 10px;
  height: 48px;
  color: #262525;
  font-size: 16px;
  border-bottom-color: ${COLOR.GRAY};
  border-bottom-width: 1px;
  align-items: center;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const IDInput = styled(TextInput)`
  flex: 1;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const InvalidText = styled(Text)`
  color: red;
  font-size: 13px;
  margin-bottom: 3px;
`;

interface KokKokIdProps {
  user: User;
  update: (field: string, value: any) => void;
}

const errorMessageMap = {
  '아이디는 필수값입니다.': t('common.ID is required'),
  'ID can only use letters, numbers, underscores and periods.': t(
    'common.ID can only use letters, numbers, underscores and periods',
  ),
  'ID must have at least 2 characters.': t('common.ID must have at least 2 characters'),
  'ID cannot be used more than 40 characters.': t('common.ID cannot be used more than 40 characters'),
  'ID is not available. Please enter another ID.': t('common.ID is not available Please enter another ID'),
};

const KokKokId = ({ user, update }: KokKokIdProps) => {
  const myUid = user.uid;
  const [uid, _setUid] = useState<string>(user.uid ?? '');
  const [isDuplicateId, setIsDuplicateId] = useState(true);
  const [invalidText, setInvalidText] = useState(' ');
  const themeContext = useContext(ThemeContext);
  const themeFont = user?.setting.ct_text_size as number;

  const setUid = (uid) => {
    _setUid(uid);
    setInvalidText(' ');
    AuthUtil.requestGetDuplicateId(uid)
      .then(() => {
        setIsDuplicateId(false);
      })
      .catch((error) => {
        setIsDuplicateId(true);
        const errorMessage = error.response.data.message;
        if (errorMessageMap[errorMessage]) {
          if (errorMessage === 'ID is not available. Please enter another ID.') {
            if (myUid === uid) {
              setInvalidText('');
              setIsDuplicateId(true);
            } else {
              setInvalidText(errorMessageMap[errorMessage]);
            }
          } else {
            setInvalidText(errorMessageMap[errorMessage]);
          }
        } else {
          setInvalidText(errorMessage);
        }
      });
  };
  return (
    <InputContainer>
      <TextInputRow>
        <IDInput
          autoCapitalize={'none'}
          placeholder={t('Profile Info.Kok Kok ID')}
          placeholderTextColor={'#bbb'}
          onChangeText={(value) => {
            setUid(value);
            update('uid', value);
          }}
          style={{ fontSize: themeFont - 1 }}
        >
          {uid}
        </IDInput>
        {!isDuplicateId && (themeContext.dark ? <CheckSvg_Dark /> : <CheckSvg />)}
      </TextInputRow>
      <InvalidText style={{ fontSize: themeFont - 3 }}>{invalidText}</InvalidText>
      <Desc style={{ fontSize: themeFont - 3 }}>
        {t('profile-edit.Kok Kok ID will be shown on your profile and searched by others')}
      </Desc>
    </InputContainer>
  );
};

export default KokKokId;
