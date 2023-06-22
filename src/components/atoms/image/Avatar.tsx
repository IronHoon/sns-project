import React from 'react';
import { Image, View } from 'react-native';
import styled from 'styled-components';

import Profile from 'assets/images/profile-edit/img-profile.svg';

interface Props {
  size?: number;
  src?: string;
}

const IcContainer = styled(View)<{ size?: number }>`
  ${({ size }) => (size ? `height: ${size}px; width: ${size}px;` : '')}
`;

const Img = styled(Image)<{ size?: number }>`
  ${({ size }) => (size ? `height: ${size}px; width: ${size}px;` : '')}
`;

export const Avatar = ({ size = 40, src = '' }: Props) => {
  if (!!src && !src?.includes('?')) {
    src += `?w=${size * 2}&h=${size * 2}`;
  }
  return !src?.length || src === 'private' ? (
    <IcContainer size={size}>
      <Profile width={size} height={size} />
    </IcContainer>
  ) : (
    <Img borderRadius={size / 2} size={size} source={{ uri: src }} />
  );
};
