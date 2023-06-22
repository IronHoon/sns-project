import React from 'react';
import { Column } from '../../../../components/layouts/Column';
import { Linking, Text, TouchableOpacity } from 'react-native';
import { COLOR } from '../../../../constants/COLOR';
import { Row } from '../../../../components/layouts/Row';
import Voice from '../../../../assets/chats/call/ic_call.svg';

const ContactBubble = ({ isMe, dark, contactName, contactNumber }) => {
  return (
    <Column align="center">
      <Text
        style={[
          { marginBottom: -4 },
          isMe ? { color: COLOR.WHITE } : dark ? { color: COLOR.WHITE } : { color: COLOR.BLACK },
        ]}
      >
        {contactName}
      </Text>
      <Row
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 5,
          marginBottom: 5,
        }}
      >
        <Voice width={10} height={10} />
        <Text
          style={{
            color: '#999999',
            fontSize: 12,
            marginLeft: 2,
          }}
        >
          contact
        </Text>
      </Row>
      <TouchableOpacity
        onPress={() => Linking.openURL(`tel:${contactNumber}`)}
        style={{
          backgroundColor: COLOR.GRAY,
          paddingHorizontal: 50,
          paddingVertical: 5,
          borderRadius: 5,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={[
            { fontSize: 12 },
            isMe ? { color: COLOR.BLACK } : dark ? { color: COLOR.WHITE } : { color: COLOR.BLACK },
          ]}
        >
          call contact
        </Text>
      </TouchableOpacity>
    </Column>
  );
};

export default React.memo(ContactBubble);
