import styled from 'styled-components';
import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';

export const RowContainer = styled(Row)`
  align-items: center;
  border-bottom-color: ${COLOR.GRAY};
  border-bottom-style: solid;
  border-bottom-width: 1px;
  height: 48px;
  width: 100%;
`;
