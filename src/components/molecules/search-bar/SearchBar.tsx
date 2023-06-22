import React, { useContext, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components';

import { Row } from 'components/layouts/Row';
import { MainNavigationProp } from 'navigations/MainNavigator';

import Close from 'assets/images/icon/ic-close.svg';
import Search from 'assets/images/icon/ic-search.svg';
import SearchW from 'assets/images/icon/ic-search-w.svg';
import { t } from 'i18next';
import { COLOR } from 'constants/COLOR';
import { ThemeContext } from 'styled-components/native';
import tw from 'twrnc';
import User from 'types/auth/User';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

interface IContainerStyle {
  focus?: boolean;
  height?: number;
  withCancel?: boolean;
}

const Container = styled(Row)<IContainerStyle>`
  border-bottom-color: ${({ focus, withCancel, theme }) =>
    withCancel ? 'transparent' : focus ? (theme.dark ? '#ededed' : '#262525') : theme.dark ? '#999999' : '#ededed'};
  border-bottom-style: solid;
  border-bottom-width: 1px;
  height: 48px;
  margin-bottom: ${({ withCancel }) => (withCancel ? 0 : 25)}px;
  position: relative;
  width: 100%;
`;
const IconContainer = styled(View)`
  height: 16px;
  width: 16px;
`;
const TouchIconContainer = styled(TouchableOpacity)`
  height: 16px;
  right: 0;
  position: absolute;
  width: 16px;
`;

const SearchIcon = styled(Search)`
  height: 100%;
  width: 100%;
`;
const SearchIconW = styled(SearchW)`
  height: 100%;
  width: 100%;
`;
const RestyledInput = styled(TextInput)<{ fontSize?: number }>`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '16px')};
  margin-left: 12px;
  padding-right: 20px;
`;
const CloseIcon = styled(Close)`
  cursor: pointer;
  height: 100%;
  width: 100%;
`;
const CancelButton = styled(Text)<{ fontSize?: number }>`
  color: #bbb;
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize - 3}px` : '12px')};
  /* font-size: 12px; */
  margin-left: 20px;
`;

type Props = {
  onChange: (value: string) => void;
  value: string;
  autoFocus?: boolean;
  height?: number;
  placeholder?: string;
  withCancel?: boolean;
  onEndEditing?: () => void;
  setIsFocus?: (boolean) => void;
  neighbor?: boolean;
  fontSize?: number;
};

export const SearchBar = ({
  height,
  value,
  placeholder = '',
  withCancel,
  onChange,
  onEndEditing,
  autoFocus = false,
  setIsFocus,
  neighbor,
  fontSize,
}: Props) => {
  const [focus, setFocus] = useState(false);
  const navigation = useNavigation<MainNavigationProp>();
  const themeContext = useContext(ThemeContext);
  const myUser: User | null = useAtomValue(userAtom);

  return (
    <Container align="center" focus={focus} fullWidth height={height} withCancel={withCancel}>
      <Row align="center" fullWidth={false} style={tw`flex-1`}>
        <IconContainer>{themeContext.dark ? <SearchIconW /> : <SearchIcon />}</IconContainer>
        <RestyledInput
          style={{ fontSize: myUser?.setting?.ct_text_size as number }}
          numberOfLines={1}
          placeholder={placeholder}
          placeholderTextColor={themeContext.dark ? COLOR.WHITE : '#999999'}
          value={value}
          onChangeText={onChange}
          onFocus={() => {
            if (setIsFocus) {
              setIsFocus(true);
            }
            setFocus(true);
          }}
          onBlur={() => {
            setFocus(false);
            if (setIsFocus) {
              setIsFocus(false);
            }
          }}
          onEndEditing={onEndEditing}
          autoFocus={autoFocus}
          fontSize={fontSize}
        />
        {value !== '' && (
          <TouchIconContainer
            onPress={() => {
              onChange('');
              onEndEditing && onEndEditing();
            }}
          >
            <CloseIcon />
          </TouchIconContainer>
        )}
      </Row>
      {withCancel && !neighbor && (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <CancelButton fontSize={fontSize}>{t('contacts-search.Cancel')}</CancelButton>
        </TouchableOpacity>
      )}
    </Container>
  );
};
