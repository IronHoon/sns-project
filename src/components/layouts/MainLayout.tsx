import React from 'react';
import styled from 'styled-components/native';

type Props = {
  children?: React.ReactNode;
  themeColor?: boolean;
  color?: string;
};

export default function MainLayout({ children, themeColor = true, color = '#ffffff' }: Props) {
  return (
    <Component themeColor={themeColor} color={color}>
      {children}
    </Component>
  );
}

const Component = styled.SafeAreaView<{ themeColor: boolean; color: string }>`
  background-color: ${(props) => (props.themeColor ? props.theme.colors.background : props.color)};
  flex: 1;
`;
