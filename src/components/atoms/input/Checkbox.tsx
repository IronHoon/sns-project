import React from 'react';
import styled from 'styled-components/native';

type ComponentProps = {
  style?;
  checked: boolean;
  handleChecked: (checked: boolean) => void;
  round?: boolean;
};

type CheckBoxImageProps = {
  round?: boolean;
};

const CheckBoxContainer = styled.TouchableOpacity`
  position: relative;
  width: 22px;
  height: 22px;
`;

const CheckBoxImage = styled.Image<CheckBoxImageProps>`
  ${({ round }) => (!round ? 'display: flex;' : 'display: none;')}
  position: absolute;
  width: 100%;
  height: 100%;
`;

const CheckBoxRoundImage = styled.Image<CheckBoxImageProps>`
  ${({ round }) => (round ? 'display: flex;' : 'display: none;')}
  position: absolute;
  width: 100%;
  height: 100%;
`;

export const Checkbox = ({ style, checked, handleChecked, round }: ComponentProps) => {
  return (
    <CheckBoxContainer style={style} onPress={() => handleChecked(!checked)}>
      <CheckBoxImage
        round={round}
        source={
          checked
            ? require('../../../assets/images/icon/check-on-22.png')
            : require('../../../assets/images/icon/check-off-22.png')
        }
      />
      <CheckBoxRoundImage
        round={round}
        source={
          checked
            ? require('../../../assets/images/icon/check-round-on-22.png')
            : require('../../../assets/images/icon/check-round-off-22.png')
        }
      />
    </CheckBoxContainer>
  );
};
