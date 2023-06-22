import React from 'react';
import { InputContainer } from 'views/more/components/InputContainer';
import { Desc } from 'views/more/components/Desc';
import User from '../../../types/auth/User';
import { t } from 'i18next';
import { Pressable } from 'react-native';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

interface OfficialAccountInfoProps {
  user: User;
}

const Title = styled.Text<{ isOfficial: boolean }>`
  color: ${({ isOfficial }) => (isOfficial ? '#ddd' : '#088cf1')};
`;

const OfficialAccountInfo = ({ user }: OfficialAccountInfoProps) => {
  const navigation = useNavigation<MainNavigationProp>();
  const isOfficial = user.official_account === 1;

  const me: User | null = useAtomValue(userAtom);
  const themeFont = me?.setting.ct_text_size as number;

  return (
    <InputContainer>
      <Pressable disabled={isOfficial} onTouchStart={() => navigation.navigate('/more/profile-edit/official-account')}>
        <Title style={{ fontSize: themeFont - 2 }} isOfficial={isOfficial}>{`${
          isOfficial ? 'Verified' : 'Verify'
        } official account`}</Title>
      </Pressable>
      <Desc style={{ fontSize: themeFont - 3 }}>
        Get a verified badge to make people find and recognize you easier with official account.
      </Desc>
    </InputContainer>
  );
};

export default OfficialAccountInfo;
