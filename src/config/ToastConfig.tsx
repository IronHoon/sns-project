/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/react-in-jsx-scope */

import { Spacer } from 'components/layouts/Spacer';
import { WIDTH } from 'constants/WIDTH';
import React from 'react';
import { Pressable, Text } from 'react-native';
import { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import styled from 'styled-components/native';

const IconImage = styled.Image`
  width: 16px;
  height: 16px;
  margin: auto 0;
`;

const TextWrap = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  width: ${WIDTH - 100}px;
`;
const PressWrap = styled.View`
  flex-wrap: wrap;
  background-color: #fff;
  padding: 20px;
  width: 100%;
  justify-content: space-between;
  flex-direction: row;
`;

export const ToastConfig = {
  success: (props) => {
    if (props.text1)
      return (
        <>
          <BaseToast
            {...props}
            text1NumberOfLines={2}
            style={{
              borderLeftColor: props.warn ? '#ffc518' : '#15979e',
              borderRadius: 0,
              padding: 12,
              borderLeftWidth: 3,
            }}
            contentContainerStyle={{ paddingHorizontal: 12 }}
            text1Style={{
              marginLeft: 0,
              padding: 0,
              fontSize: 12,
              fontWeight: '400',
            }}
            renderLeadingIcon={() =>
              props.warn ? (
                <IconImage source={require('../assets/ic_warning.png')} />
              ) : (
                <IconImage source={require('../assets/ic_success.png')} />
              )
            }
          />
        </>
      );
  },
  error: (props) => (
    <>
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: '#ff0000',
          borderRadius: 0,
          padding: 12,
          borderLeftWidth: 3,
        }}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        text1Style={{
          fontSize: 12,
          fontWeight: '400',
        }}
        renderLeadingIcon={() => <IconImage source={require('../assets/ic_error.png')} />}
      />
    </>
  ),
  info: (props) => (
    <>
      <InfoToast
        {...props}
        style={{
          borderLeftColor: '#ffc518',
          borderRadius: 0,
          padding: 12,
          borderLeftWidth: 3,
        }}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        text1Style={{
          fontSize: 12,
          fontWeight: '400',
        }}
        renderLeadingIcon={() => <IconImage source={require('../assets/ic_info.png')} />}
      />
    </>
  ),
  inApp: (customProps) => {
    const { text1, text2, onPress, props } = customProps;
    return (
      <Pressable onTouchStart={onPress}>
        <PressWrap>
          <TextWrap>
            <Text style={{ fontWeight: 'bold', paddingRight: 10, color: '#000000' }}>{text1}</Text>
            <Text numberOfLines={2} style={{ color: '#000000' }}>
              {text2}
            </Text>
          </TextWrap>
          <Spacer />
          <Text style={{ color: '#4AA4EF' }}>View</Text>
        </PressWrap>
      </Pressable>
    );
  },
};
