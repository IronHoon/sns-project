import React from 'react';
import styled from 'styled-components';

import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import { Row } from 'components/layouts/Row';
import { RADIUS } from 'constants/RADIUS';
import { t } from 'i18next';

const Container = styled(Row)`
  margin-left: 10px;
`;

const RestyledButton = styled(Button)`
  border-radius: ${RADIUS.SM}px;
`;

interface Props {
  onPressAccept?: () => void;
  onPressDeny?: () => void;
}

const Buttons = ({ onPressAccept, onPressDeny }: Props) => (
  <Container>
    <RestyledButton
      fontSize={13}
      fontWeight={500}
      height={30}
      label={t('activity.Accept')}
      marginRight={5}
      width={58}
      onPress={onPressAccept}
    />
    <RestyledButton
      fontSize={13}
      fontWeight={500}
      height={30}
      label={t('activity.Deny')}
      textvariant={ButtonTextVariant.OutlinedText}
      variant={ButtonVariant.Outlined}
      width={48}
      onPress={onPressDeny}
    />
  </Container>
);

export default Buttons;
