import { COLOR } from 'constants/COLOR';
import { TextInput } from 'react-native';
import styled from 'styled-components';

export const Input = styled(TextInput)<{ marginBottom?: number }>`
  border-bottom-color: ${COLOR.GRAY};
  border-bottom-width: 1px;
  font-size: 16px;
  height: 48px;
  margin-bottom: ${({ marginBottom }) => marginBottom || 0}px;
  width: 100%;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
