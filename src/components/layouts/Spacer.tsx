import styled from 'styled-components/native';

export const Spacer = styled.View<{ flex?: number }>`
  flex-grow: ${({ flex }) => (flex ? `${flex}` : '1')};
  /* flex-basis:${({ flex }) => (flex ? `${flex}` : '1')}; */
`;
