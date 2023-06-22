import CloseHeader from 'components/molecules/CloseHeader';
import React from 'react';
import { View, SafeAreaView } from 'react-native';
import Modal from 'react-native-modal';
import { WebView } from 'react-native-webview';

interface Props {
    isTermsVisible: boolean;
    setIsTermsVisible: (props) => void;
}

function TermsModal({ isTermsVisible, setIsTermsVisible }: Props) {
    return (
        <Modal
            isVisible={isTermsVisible}
            onBackButtonPress={() => setIsTermsVisible(false)}
            onBackdropPress={() => setIsTermsVisible(false)}
        >
            <View
                style={{
                    justifyContent: 'center',
                    width: '100%',
                    height: '80%',
                }}>
                <WebView source={{ uri: 'https://living-bowl-f8a.notion.site/Terms-of-Service-4519e155aa0c416cb18e9f15bb7f57a1' }} />
            </View>
        </Modal>
    )
}

export default TermsModal;