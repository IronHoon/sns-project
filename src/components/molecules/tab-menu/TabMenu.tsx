import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { Tab } from 'components/atoms/menu';
import { Row } from 'components/layouts/Row';
import { useFocusEffect } from '@react-navigation/native';

interface MenuProps {
  label: string;
  value: string;
}
interface Props {
  menu: MenuProps[];
  onPress: (value: string) => void;
  onListRefresh?: () => void;
  initialValue?: string;
  setIsSearching?: (boolean) => void;
  isSearching?: boolean;
}

const Container = styled(Row)``;

export const TabMenu = ({ isSearching, setIsSearching, menu, initialValue = '', onPress, onListRefresh }: Props) => {
  const [selected, setSelected] = useState(initialValue);
  useFocusEffect(
    useCallback(() => {
      if (setIsSearching) setIsSearching(false);
    }, []),
  );

  console.log('isSearching ', isSearching);
  const handleChange = (value) => {
    setSelected(value);
    if (onListRefresh) {
      onListRefresh();
    }
    onPress(value);
  };

  return (
    <Container fullWidth>
      {menu.map(({ label, value }) => (
        <Tab key={value} label={label} length={menu.length} selected={selected} value={value} onChange={handleChange} />
      ))}
    </Container>
  );
};
