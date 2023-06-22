import React from 'react';
import styled from 'styled-components/native';

type ComponentProps = {
  checked: boolean;
  handleChecked: () => void;
  small?: boolean;
};

type RadioImageProps = {
  small?: boolean;
};

const RadioContainer = styled.TouchableOpacity<RadioImageProps>`
  position: relative;
  ${({ small }) => (!small ? 'width: 22px;height: 22px;' : 'width: 18px;height: 18px;')}
`;

const RadioImage = styled.Image<RadioImageProps>`
  ${({ small }) => (!small ? 'display: flex;' : 'display: none;')}
  position: absolute;
  width: 100%;
  height: 100%;
`;

const RadiosmallImage = styled.Image<RadioImageProps>`
  ${({ small }) => (small ? 'display: flex;' : 'display: none;')}
  position: absolute;
  width: 100%;
  height: 100%;
`;

export const Radio = ({ checked, handleChecked, small }: ComponentProps) => {
  return (
    <RadioContainer onPress={handleChecked} small={small}>
      <RadioImage
        small={small}
        source={
          checked
            ? require('../../../assets/images/icon/radio-on-22.png')
            : require('../../../assets/images/icon/check-round-off-22.png')
        }
      />
      <RadiosmallImage
        small={small}
        source={
          checked
            ? require('../../../assets/images/icon/check-round-on-18.png')
            : require('../../../assets/images/icon/check-round-off-18.png')
        }
      />
    </RadioContainer>
  );
};
