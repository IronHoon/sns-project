import { COLOR } from 'constants/COLOR';
import React, { useContext } from 'react';
import { Platform, Switch } from 'react-native';
import { ThemeContext } from 'styled-components/native';

type ComponentProps = {
  isEnabled: boolean;
  setIsEnabled: () => void;
};

export const SwitchButton = ({ isEnabled, setIsEnabled }: ComponentProps) => {
  const themeContext = useContext(ThemeContext);
  return (
    <Switch
      trackColor={{ false: themeContext.dark ? '#282828' : '#dbdbdb', true: COLOR.PRIMARY }}
      thumbColor={'#ffffff'}
      ios_backgroundColor={themeContext.dark ? '#282828' : '#fbfbfb'}
      onValueChange={() => setIsEnabled()}
      value={isEnabled}
      style={Platform.OS === 'ios' && { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
    />
  );
};
