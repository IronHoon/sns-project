import React, { useContext } from 'react';
import { RowContainer } from 'views/more/components/RowContainer';
import { Title } from 'views/more/components/Title';
import ButtonInput from 'views/more/components/ButtonInput';
import User from '../../../types/auth/User';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '../../../navigations/MainNavigator';
import { t } from 'i18next';
import styled, { ThemeContext } from 'styled-components/native';
import { Row } from 'components/layouts/Row';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

const ExclamationWrap = styled.View`
  position: absolute;
  right: 15px;
  border-width: 1.3px;
  border-radius: 70px;
  border-style: solid;
  border-color: #ff0000;
  /* justify-content: center; */
  align-items: center;
`;
const Exclamation = styled.Text`
  color: #ff0000;
  font-size: 11px;
  font-weight: bold;
  height: 15px;
  width: 3px;
  margin: 0 5px;
`;

interface EmailProps {
  user: User;
  update: (field: string, value: any) => void;
  draft: User | undefined;
  hasDiff: boolean;
}
const Email = ({ user, update, draft, hasDiff }: EmailProps) => {
  const navigation = useNavigation<MainNavigationProp>();
  const { dark } = useContext(ThemeContext);
  const me: User | null = useAtomValue(userAtom);
  const themeFont = me?.setting.ct_text_size as number;

  return (
    <RowContainer>
      <Row align="center" style={{ maxWidth: 70 }}>
        <Title style={{ fontSize: themeFont - 2 }}>{t('profile-edit.Email')}</Title>
        {!user.email && (
          <ExclamationWrap>
            <Exclamation>!</Exclamation>
          </ExclamationWrap>
        )}
      </Row>
      <ButtonInput
        placeholder={t('profile-edit.Please register your E-mail')}
        value={hasDiff ? draft?.email || '' : user.email || ''}
        dark={dark}
        onPress={() => {
          if (user.email) {
            navigation.navigate('/more/profile-edit/change-mail-info', {
              update: update,
            });
          } else {
            navigation.navigate('/more/profile-edit/email-input', {
              route: 'register-email',
              update: update,
            });
          }
        }}
      />
    </RowContainer>
  );
};

export default Email;
