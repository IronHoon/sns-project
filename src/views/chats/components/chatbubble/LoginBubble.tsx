import React from 'react';
import AuthUtil from '../../../../utils/AuthUtil';
import { Column } from '../../../../components/layouts/Column';
import { Text } from 'react-native';
import { COLOR } from '../../../../constants/COLOR';
import { Row } from '../../../../components/layouts/Row';
import styled from 'styled-components/native';
import LogUtil from '../../../../utils/LogUtil';

const LoginLabel = styled.Text`
  color: black;
  font-size: 13px;
  font-weight: 500;
`;

const LoginButton = styled.TouchableOpacity`
  background-color: ${COLOR.PRIMARY};
  margin: 7px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${COLOR.PRIMARY};
  flex: 1;
`;

const DenyButton = styled.TouchableOpacity`
  background-color: #ddd;
  margin: 7px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: #ddd;
  flex: 1;
`;

const DenyLabel = styled.Text`
  color: black;
  font-size: 13px;
  font-weight: 500;
`;

const LoginBubble = ({ isMe, originalMessage, t, dark, messageText }) => {
  const onLogin = async (isLogin) => {
    await AuthUtil.loginForDesktop({ code: originalMessage.code, action: isLogin ? 'login' : 'deny' });
  };

  LogUtil.info('LoginBubble rerender');

  return (
    <Column>
      <Text style={{ marginVertical: 10, fontWeight: 'bold', fontSize: 16, color: COLOR.BLACK }}>
        {t('chats-main.Verify Kok Kok Login')}
      </Text>
      <Text style={isMe ? { color: COLOR.WHITE } : dark ? { color: COLOR.WHITE } : { color: COLOR.BLACK }}>
        {messageText}
      </Text>
      <Column style={{ marginTop: 8 }}>
        <Row>
          <LoginButton onPress={() => onLogin(true)}>
            <LoginLabel>Login</LoginLabel>
          </LoginButton>
        </Row>
        <Row>
          <DenyButton onPress={() => onLogin(false)}>
            <DenyLabel>Deny</DenyLabel>
          </DenyButton>
        </Row>
      </Column>
    </Column>
  );
};

export default React.memo(LoginBubble);
