import React, { Fragment } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

import { COLOR } from 'constants/COLOR';
import User from 'types/auth/User';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

interface Props {
  menu: any;
  onPress: (visible: boolean) => void;
  hide?: boolean;
  menuTitle?: string;
  modalVisible?: boolean;
  onBackdropPress?: (data: any | null) => void;
  onMenuPress?: (value?: string) => void;
}

export const Options = ({ menu, menuTitle, modalVisible, onBackdropPress, onMenuPress, onPress, hide }: Props) => {
  const myUser: User | null = useAtomValue(userAtom);
  return (
    <Modal transparent={true} visible={modalVisible} onRequestClose={() => onPress(!modalVisible)}>
      <TouchableWithoutFeedback onPress={onBackdropPress}>
        <View style={styles.centeredView} />
      </TouchableWithoutFeedback>
      <View style={styles.modalView}>
        {menuTitle && (
          <View style={styles.title}>
            <Text numberOfLines={3} style={(styles.titleText, { fontSize: myUser?.setting?.ct_text_size as number })}>
              {menuTitle}
            </Text>
          </View>
        )}
        {menu.map((x) => (
          <Fragment key={x.value}>
            {hide && (
              <Pressable
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? '#fcf2e8' : '',
                  },
                  styles.button,
                ]}
                onPress={() => {
                  onMenuPress?.(x.value);
                  onPress(!modalVisible);
                }}
              >
                <Text style={(styles.textStyle, { fontSize: myUser?.setting?.ct_text_size as number })}>{x.label}</Text>
                {x.desc && (
                  <Text style={(styles.desc, { fontSize: myUser?.setting?.ct_text_size as number })}>{x.desc}</Text>
                )}
              </Pressable>
            )}
            {!hide && x.value !== 'hide-all-activities' && (
              <Pressable
                key={x.value}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? '#fcf2e8' : '',
                  },
                  styles.button,
                ]}
                onPress={() => {
                  onMenuPress?.(x.value);
                  onPress(!modalVisible);
                }}
              >
                <Text style={(styles.textStyle, { fontSize: myUser?.setting?.ct_text_size as number })}>{x.label}</Text>
                {x.desc && (
                  <Text style={(styles.desc, { fontSize: myUser?.setting?.ct_text_size as number })}>{x.desc}</Text>
                )}
              </Pressable>
            )}
          </Fragment>
        ))}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    flex: 1,
  },
  modalView: {
    backgroundColor: '#fff',
    paddingBottom: 30,
  },
  title: {
    borderBottomColor: '#ededed',
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    display: 'flex',
    justifyContent: 'center',
    // height: 50,
    padding: 20,
  },
  titleText: {
    color: `${COLOR.BLACK}`,
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    padding: 16,
    elevation: 2,
  },
  textStyle: {
    color: `${COLOR.BLACK}`,
    // fontSize: 14,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  desc: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 5,
  },
});
