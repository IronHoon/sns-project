import { Text } from 'react-native';
import styled from 'styled-components';

import { COLOR } from 'constants/COLOR';

export const Title = styled(Text)<{ marginRight?: number }>`
  font-size: 14px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  margin-right: ${({ marginRight }) => marginRight || 0}px;
  min-width: 70px;
`;
