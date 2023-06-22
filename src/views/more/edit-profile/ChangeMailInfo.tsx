import React, { useCallback, useContext, useState } from 'react';
import styled, { ThemeContext } from 'styled-components/native';
import MainLayout from '../../../components/layouts/MainLayout';
import BackHeader from '../../../components/molecules/BackHeader';
import Icon from '../../../assets/img-change-mail.svg';
import WhiteIcon from '../../../assets/img-change-mail-white.svg';
import MailIcon from '../../../assets/mail.svg';
import WhiteMailIcon from '../../../assets/mail-white.svg';
import { COLOR } from '../../../constants/COLOR';
import { Button, ButtonTextVariant, ButtonVariant } from '../../../components/atoms/button/Button';
import { ContentModalBase, ModalText, ModalTitle } from '../../../components/modal';
import { Row } from '../../../components/layouts/Row';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';

const Container = styled.View`
  flex: 1;
  display: flex;
  align-items: center;

  padding-top: 100px;
`;

const Title = styled.Text`
  margin: 10px 0 7px;

  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  color: ${(props) => (props.theme.dark ? props.theme.colors.WHITE : props.theme.colors.BLACK)};
`;

const Desc = styled.Text`
  font-size: 14px;
  line-height: 20px;
  color: ${COLOR.TEXT_GRAY};
  text-align: center;
`;

const ButtonContainer = styled.View`
  padding: 0 20px 30px;
`;

const ModalButtonContainer = styled(Row)`
  margin-top: 20px;
`;

function ChangeMailInfo() {
  const themeContext = useContext(ThemeContext);
  const navigation = useNavigation<MainNavigationProp>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const modalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);
  const {
    //@ts-ignore
    params: { update },
  } = useRoute();

  const handleConfirm = () => {
    modalClose();
    navigation.navigate('/more/profile-edit/email-input', { route: 'change-email', update: update });
  };

  return (
    <MainLayout>
      <BackHeader title="Change E-mail" />
      <Container>
        {themeContext.dark ? <WhiteIcon width={92} height={92} /> : <Icon width={92} height={92} />}
        <Title>You can change your E-mail here.</Title>
        <Desc>
          Your account and your cloud data messages,{'\n'}
          media, contacts, etc...{'\n'}
          will be moved to the new E-mail.
        </Desc>
      </Container>
      <ButtonContainer>
        <Button
          onPress={() => setIsModalOpen(true)}
          height={60}
          borderRadius
          variant={ButtonVariant.Outlined}
          textvariant={ButtonTextVariant.OutlinedText}
          blacklined={!themeContext.dark}
          whitelined={themeContext.dark}
          blacklinedText={!themeContext.dark}
          whitelinedText={themeContext.dark}
          label="Change e-mail"
        >
          {themeContext.dark ? <WhiteMailIcon width={24} height={24} /> : <MailIcon width={24} height={24} />}
        </Button>
      </ButtonContainer>

      {/* Modal */}
      <ContentModalBase isVisible={isModalOpen} onBackdropPress={modalClose}>
        <ModalTitle>Change E-mail</ModalTitle>
        <ModalText>
          User will see your new E-mail if they have it in their address book or your privacy settings allow them to see
          it. You can modify this in{' '}
        </ModalText>
        <ModalText bold>Settings &gt; Privacy and Security &gt; E-mail number.</ModalText>
        <ModalButtonContainer>
          {/* TODO: border-radius 정리 */}
          <Button
            onPress={modalClose}
            label="Cancel"
            width={100}
            height={42}
            marginRight={10}
            fontSize={13}
            variant={ButtonVariant.Outlined}
            textvariant={ButtonTextVariant.OutlinedText}
            grayText
          />
          <Button onPress={handleConfirm} label="Confirm" width={100} height={42} fontSize={13} />
        </ModalButtonContainer>
      </ContentModalBase>
    </MainLayout>
  );
}

export default ChangeMailInfo;
