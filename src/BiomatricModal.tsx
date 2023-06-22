import React, { useCallback, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { CallAuthBiomatirc } from './utils/Biometric';
import LogUtil from './utils/LogUtil';
import { useFocusEffect } from '@react-navigation/native';

const BiomatricModal = ({ open, CallBack }) => {
  useEffect(() => {
    (async () => {
      await CallBack(true);
    })();
  }, []);

  // const CallBack = async (data) => {
  //     // console.info(data);
  //     if (data === true) {
  //         let sign = await CallAuthBiomatirc();
  //         LogUtil.info('callback', sign);
  //         if (sign) {
  //             console.log('인증 성공!!!', JSON.stringify(sign));
  //             setPassCode(false);
  //             setBioAuth(false);
  //         } else if (sign === null) {
  //             setBioAuth(false);
  //         } else {
  //             await CallBack(true);
  //         }
  //     }
  // };
  return (
    <Modal animationType="slide" transparent={true} visible={open}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View
          style={{
            flexDirection: 'column',
            backgroundColor: 'white',
            margin: 20,
            padding: 20,
            alignItems: 'center',
            borderRadius: 20,
          }}
        >
          <Text style={{ padding: 25, fontSize: 16, textAlign: 'center' }}>
            Do you want to allow KokKokChat to use biometric authentication ?
          </Text>
          <TouchableOpacity style={{ padding: 10 }} onPress={() => CallBack(true)}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Enable</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default BiomatricModal;
