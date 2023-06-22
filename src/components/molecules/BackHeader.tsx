import React, { useContext } from 'react';
import { Text, View } from 'react-native';
import styled, { css } from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { COLOR } from 'constants/COLOR';
import { ThemeContext } from 'styled-components';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

interface BackHeaderProps {
  onClick?: () => void;
  title?: string;
  border?: boolean;
  button?: Array<React.ReactElement>;
  themeColor?: boolean;
  name?: string;
  hashNumber?: number;
  isForward?: boolean;
  isEdit?: boolean;
}

export default function BackHeader({
  onClick,
  title,
  border = true,
  button,
  themeColor = true,
  name,
  hashNumber,
  isForward,
  isEdit,
}: BackHeaderProps) {
  const navigation = useNavigation();
  const theme = useContext(ThemeContext);
  const me = useAtomValue(userAtom);
  return (
    <HeaderContainer isEdit={isEdit ?? false} border={border}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <BackHeaderButton
          onPress={() => {
            if (onClick) {
              onClick();
            } else {
              navigation.goBack();
            }
          }}
        >
          {!isForward ? (
            <IconImage isEdit={isEdit ?? false} themeColor={themeColor} source={require('assets/ic-back.png')} />
          ) : (
            <Close source={require('assets/ic-close.png')} />
          )}
        </BackHeaderButton>
        {name && (
          <Text style={{ color: theme.dark ? COLOR.WHITE : COLOR.BLACK, fontWeight: '500', fontSize: 16 }}>
            {name?.length > 20 ? name.substring(0, 17) + '...' : name}
          </Text>
        )}
        <Title isEdit={isEdit ?? false} themeColor={themeColor} themeFont={me?.setting.ct_text_size}>
          {title}
        </Title>
        {!!hashNumber && <HashNumber>{hashNumber} Posts</HashNumber>}
        <ButtonContainer>{button}</ButtonContainer>
      </View>
    </HeaderContainer>
  );
}

const Title = styled.Text<{ themeColor: boolean; isEdit: boolean; themeFont: number }>`
  font-size: ${({ themeFont }) => themeFont + 1};
  font-weight: 500;
  color: ${(props) =>
    props.isEdit
      ? COLOR.WHITE
      : props.themeColor
      ? props.theme.dark
        ? props.theme.colors.WHITE
        : props.theme.colors.BLACK
      : props.theme.colors.BLACK};
`;

const HashNumber = styled.Text`
  font-size: 14px;
  color: ${COLOR.DARK_GRAY};
  position: absolute;
  right: 10px;
`;

const HeaderContainer = styled.View<{ border?: boolean; isEdit: boolean }>`
  ${(props) =>
    props.isEdit
      ? css``
      : !props.border && props.theme.dark
      ? css``
      : css`
          border-bottom-width: 1px;
          border-color: ${COLOR.GRAY};
        `}
  min-height: 56px;
  padding: 15px 15px 15px 0;
`;

const BackHeaderButton = styled.TouchableOpacity`
  position: absolute;
  left: 0;
  padding: 15px;
`;
const ButtonContainer = styled.View`
  position: absolute;
  right: 0;
  flex-direction: row;
`;

const IconImage = styled.Image<{ themeColor: boolean; isEdit: boolean }>`
  width: 16px;
  height: 16px;
  tint-color: ${(props) =>
    props.isEdit ? COLOR.WHITE : props.themeColor && props.theme.dark ? COLOR.WHITE : COLOR.BLACK};
`;

const Close = styled.Image`
  width: 16px;
  height: 16px;
  tint-color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
