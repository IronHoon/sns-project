import { COLOR } from 'constants/COLOR';
import React from 'react';
import styled from 'styled-components/native';

const ItemButton = styled.Pressable<ButtonStyleProps>`
  height: 42px;
  ${({ width }) => `width: ${width}`}
  align-items: center;
  justify-content: center;
  border: 1px solid #000;
  border-radius: 8px;
  border-color: ${({ borderColorPrimary }) => (!borderColorPrimary ? `${COLOR.BLACK}` : `${COLOR.PRIMARY}`)};
`;
const ItemButtonText = styled.Text<ButtonStyleProps>`
  font-size: 16px;
  color: ${({ borderColorPrimary }) => (!borderColorPrimary ? `${COLOR.BLACK}` : `${COLOR.PRIMARY}`)};
`;
type ButtonStyleProps = {
  borderColorPrimary?: boolean;
  width?: string;
};

type ButtonProps = {
  label: string;
  onPress?: () => void;
  borderColorPrimary?: boolean;
  width?: string;
};

const ListButtons = ({ label, onPress, borderColorPrimary, width }: ButtonProps) => {
  return (
    <ItemButton onPress={onPress} borderColorPrimary={borderColorPrimary} width={width}>
      <ItemButtonText borderColorPrimary={borderColorPrimary}>{label}</ItemButtonText>
    </ItemButton>
  );
};

export default ListButtons;
