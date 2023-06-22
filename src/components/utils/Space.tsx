import React from 'react';
import styled from 'styled-components/native';

interface Props {
  width?: number;
  height?: number;
  color?: string;
}

const Space = styled.View<Props>`
  height: ${props => (props.height ? `${props.height}px` : '10px')};
  width: ${props => (props.width ? `${props.width}px` : '100%')};
  background-color: ${props => props.color || 'transparent'};
`;

export default Space;
