import React from 'react';
import { COLOR } from 'constants/COLOR';
import { View, Platform } from 'react-native';
import styled from 'styled-components/native';

type Props = {
  icon: any;
  title: string;
  required: boolean;
  description: string;
  permissionKey: { android: string; ios: string };
  checked: boolean;
  handleCheckedPermissions: (permissionKey: string) => void;
};

const Component = styled.View`
  display: flex;
  flex-direction: row;
  margin-bottom: 33px;
  width: 100%;
`;

const CheckBoxContainer = styled.TouchableOpacity`
  position: relative;
  width: 20px;
  height: 22px;
`;

const CheckBoxImage = styled.Image`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const Icon = styled.Image`
  width: 20px;
  height: 22px;
  margin: 0 6px 0 10px;
  tint-color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

const Title = styled.Text`
  font-weight: 500;
  font-size: 15px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  line-height: 22px;
`;

const Optional = styled.Text<{ required?: boolean }>`
  font-weight: 500;
  font-size: 15px;
  color: ${({ required, theme }) => (required ? COLOR.RED : theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

const Description = styled.Text`
  font-size: 13px;
  line-height: 20px;
  margin-top: 8px;
  max-width: 95%;
  color: ${COLOR.TEXT_GRAY};
`;
export function Permission({
  icon,
  title,
  required,
  description,
  permissionKey,
  checked,
  handleCheckedPermissions,
}: Props) {
  return (
    <Component>
      <CheckBoxContainer
        disabled={required}
        onPress={() => {
          !required && handleCheckedPermissions(permissionKey[Platform.OS]);
        }}
      >
        <CheckBoxImage
          source={checked ? require('../../../assets/ic-check-on.png') : require('../../../assets/ic-check-off.png')}
        />
      </CheckBoxContainer>
      <Icon source={icon} />
      <View style={{ flex: 1 }}>
        <Title>
          {title}
          <Optional required={required}> ({required ? 'Required' : 'Optional'})</Optional>
        </Title>
        <Description>{description}</Description>
      </View>
    </Component>
  );
}
