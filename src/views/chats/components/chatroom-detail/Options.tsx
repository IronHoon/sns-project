import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { COLOR } from 'constants/COLOR';

interface Props {
  menu: any;
  menuTitle?: string;
  modalVisible?: boolean;
  onMenuPress?: (value: string, visible: boolean) => void;
  dark?: boolean;
}

function Options({ menu: menuList, menuTitle, modalVisible, onMenuPress, dark }: Props) {
  return (
    <Modal transparent={true} visible={modalVisible} onRequestClose={() => onMenuPress?.('cancel', !modalVisible)}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {menuTitle && (
            <View style={styles.title}>
              <Text style={styles.titleText}>{menuTitle}</Text>
            </View>
          )}
          {menuList.map((menu) => (
            <Pressable
              key={menu.value}
              style={({ pressed }) => [
                {
                  backgroundColor: pressed ? (dark ? '#88808f' : '#fcf2e8') : dark ? '#585858' : '#ffffff',
                },
                styles.button,
              ]}
              onPress={() => {
                onMenuPress?.(menu.value, !modalVisible);
              }}
            >
              <Text style={styles.textStyle}>{menu.label}</Text>
              {menu.desc && <Text style={styles.desc}>{menu.desc}</Text>}
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

export default Options;

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
    height: 50,
    paddingLeft: 20,
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
    fontSize: 14,
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
