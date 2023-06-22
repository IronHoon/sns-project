import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { COLOR } from 'constants/COLOR';

interface Props {
    menu: any;
    onPress: (visible: boolean) => void;
    menuTitle?: string;
    modalVisible?: boolean;
    onMenuPress?: (value?: string) => void;
    dark?: boolean;
}

function ChooseFriendsModal({
    menu,
    menuTitle,
    modalVisible,
    onMenuPress,
    onPress,
    dark,
}: Props) {
    return (

        <Modal transparent={true} visible={modalVisible}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    {menuTitle && (
                        <View style={styles.title}>
                            <Text style={styles.titleText}>{menuTitle}</Text>
                        </View>
                    )}
                    {menu.map(x => (
                        <Pressable
                            key={x.value}
                            style={({ pressed }) => [
                                {
                                    backgroundColor: pressed ? (dark ? '#88808f' : '#fcf2e8') : (dark ? '#585858' : '#ffffff')
                                },
                                styles.button,
                            ]}
                            onPress={() => {
                                onMenuPress?.(x.value);
                                onPress(!modalVisible);
                            }}>
                            <Text style={styles.textStyle}>{x.label}</Text>
                            {x.desc && <Text style={styles.desc}>{x.desc}</Text>}
                        </Pressable>
                    ))}
                </View>
            </View>
        </Modal>
    );
};

export default ChooseFriendsModal;

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