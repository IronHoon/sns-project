import React from 'react';
import { Column } from '../../../../components/layouts/Column';
import { Text } from 'react-native';
import { COLOR } from '../../../../constants/COLOR';
import LogUtil from '../../../../utils/LogUtil';

const LoginNotiBubble = ({ isMe, t, dark, messageText }) => {
  LogUtil.info('LoginNotiBubble rerender');
  return (
    <Column>
      <Text style={{ marginVertical: 10, fontWeight: 'bold', fontSize: 16, color: COLOR.BLACK }}>
        {t('chats-main.Login Notification')}
      </Text>
      <Text style={isMe ? { color: COLOR.WHITE } : dark ? { color: COLOR.WHITE } : { color: COLOR.BLACK }}>
        {messageText}
      </Text>
    </Column>
  );
};

export default React.memo(LoginNotiBubble);
