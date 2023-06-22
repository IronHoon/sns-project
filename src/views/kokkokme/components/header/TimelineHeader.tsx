import React, { useCallback, useState } from 'react';
import { Alert, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import styled from 'styled-components';

import { Row } from 'components/layouts/Row';
import { MainNavigationProp } from 'navigations/MainNavigator';

import Back from 'assets/kokkokme/ic-back-white-l.svg';
import BackGray from 'assets/kokkokme/ic-back.svg';
import Write from 'assets/kokkokme/ic-write-white-l.svg';
import WriteGray from 'assets/kokkokme/ic-write-gray.svg';
import NotiOff from 'assets/kokkokme/ico-notification-off-white-l.svg';
import NotiOffGray from 'assets/kokkokme/ic-notification-off-gray.svg';
import NotiOn from 'assets/kokkokme/ico-notification-on-white-l.svg';
import NotiOnGray from 'assets/kokkokme/ic-notification-on-gray.svg';
import StartChat from 'assets/kokkokme/ic-start-chat-white.svg';
import StartChatGray from 'assets/kokkokme/ic-start-chat.svg';
import More from 'assets/kokkokme/ic-more-white.svg';
import MoreGray from 'assets/kokkokme/ic-more-gray.svg';

import { useFetchWithType } from 'net/useFetch';
import { IActivities } from 'types/socials';
import SwrContainer from 'components/containers/SwrContainer';
import User from '../../../../types/auth/User';
import { useAtomValue } from 'jotai';
import userAtom from '../../../../stores/userAtom';
import ChatHttpUtil from '../../../../utils/chats/ChatHttpUtil';
import { ModalBase, ModalText, ModalTitle, Options } from '../../../../components/modal';
import { MY_POST, OTHERS_POST, REPORT } from '../../../../constants/MENU';
import { Column } from '../../../../components/layouts/Column';
import { t } from 'i18next';
import { COLOR } from '../../../../constants/COLOR';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';
import { post, remove } from '../../../../net/rest/api';

const Container = styled(Row)`
  height: 72px;
  padding: 0 20px;
`;

const IcContainer = styled(TouchableOpacity)<{ margin?: number }>`
  height: 22px;
  margin-right: ${({ margin }) => (margin ? `${margin}` : 0)}px;
  width: 22px;
  /* border: 1px solid #eee; */
  /* border-radius: 22px; */
`;

const ButtonsContainer = styled(Row)`
  margin-top: 25px;
`;

const Button = styled(TouchableOpacity)<{
  cancel?: boolean;
  marginRight?: number;
}>`
  align-items: center;
  border-radius: 10px;
  border-style: solid;
  border-width: 1px;
  height: 42px;
  justify-content: center;
  margin-right: ${({ marginRight }) => marginRight || 0}px;
  width: 100px;

  ${({ cancel }) =>
    cancel ? 'background: #fff; border-color: #ddd;' : `background: ${COLOR.PRIMARY}; border-color: ${COLOR.PRIMARY};`};
`;

const Label = styled(Text)<{ cancel?: boolean }>`
  color: ${({ cancel }) => (cancel ? COLOR.TEXT_GRAY : COLOR.WHITE)};
  font-size: 13px;
  font-weight: ${({ cancel }) => (cancel ? 'normal' : 500)};
`;

interface Props {
  isMe?: boolean;
  userData?: User;
  isDeletedUser?: boolean;
}

const TimelineHeader = ({ isMe, userData, isDeletedUser }: Props) => {
  const { data, error, mutate } = useFetchWithType<IActivities>('/socials/notis?page=1&limit=10');
  const navigation = useNavigation<MainNavigationProp>();
  const myUser: User | null = useAtomValue(userAtom);
  const {
    // @ts-ignore
    params: { uid },
  } = useRoute();
  const {
    data: profileUser,
    error: profileError,
    mutate: profileMutate,
  } = useFetchWithType<User>(`/auth/users/detail?&uid=${uid}`);

  const [haveNewNoti, setHaveNewNoti] = useState(false);
  const [modal1Visible, setModal1Visible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [background, setBackground] = useState(false);
  const appLink = `https://share.kokkokchat.link/auth/users/detail?&uid=${uid}`;
  // TODO: 실제 유저 프로필 주소로 교체 필요

  const MENU = [
    {
      value: 'copy',
      label: t('usertimeline.Copy profile link'),
    },
    {
      value: 'block',
      label: userData?.block ? t('usertimeline.Unblock this user') : t('usertimeline.Block this user'),
    },
    {
      value: 'report',
      label: t('common.Report'),
    },
    {
      value: 'cancel',
      label: t('common.Cancel'),
    },
  ];

  useFocusEffect(
    useCallback(() => {
      if (data) {
        setHaveNewNoti(data.docs.some((list) => !list.read));
      }
      if (profileUser) {
        setBackground(!!profileUser.profile_background);
      }
      mutate();
    }, [data, mutate]),
  );

  const openOptions1 = (bool: boolean) => setModal1Visible(bool);
  const openOptions2 = (bool: boolean) => setModal2Visible(bool);

  const copyAppLink = () => {
    Clipboard.setString(appLink);
    Toast.show({
      type: 'success',
      text1: 'Link Copied',
    });
  };

  const handleMenuPress = (value?: string) => {
    if (value === 'copy') copyAppLink();
    if (value === 'block') {
      if (userData?.block) {
        remove(`/auth/block/${profileUser?.id}`)
          .then(() => {
            console.log('차단해제 성공!');
            // 차단 성공시 로직
            Toast.show({
              type: 'success',
              text1: t('common.{username} has been unblocked'),
            });
            navigation.goBack();
          })
          .catch((error) => {
            console.log(error);
          });
      } else setConfirmVisible(true);
    }
    if (value === 'report') openOptions2(true);
    if (value === 'cancel') setModal1Visible(false);
  };

  const handleDeletePost = () => {
    post(`/auth/block`, {
      type: 'sns',
      target_id: profileUser?.id,
    }).then(() => {
      console.log('차단 성공!');
      // 차단 성공시 로직
      Toast.show({
        type: 'success',
        text1: t('common.{username} has been blocked'),
      });
      navigation.goBack();
    });
    setConfirmVisible(false);
  };

  const handleReportPress = (value?: string) => {
    if (value === 'Cancel') return;

    post('/auth/report', {
      reported_id: profileUser?.id,
      type: 'user',
      issue: value,
    })
      .then(() => {
        console.log(value, ' 신고 성공!');
      })
      .catch((e) => {
        console.log(e);
      });
    Toast.show({
      type: 'success', // 'error', 'info'
      text1: t('kokkokme-main.Report has been received'),
    });
  };

  return (
    <>
      <Container align="center" justify="space-between">
        <IcContainer onPress={() => navigation.goBack()}>{background ? <Back /> : <BackGray />}</IcContainer>
        {!isDeletedUser &&
          (isMe ? (
            <Row>
              <IcContainer margin={15} onPress={() => navigation.navigate('/kokkokme/kokkokme-post')}>
                {background ? <Write /> : <WriteGray />}
              </IcContainer>
              <SwrContainer data={data} error={error}>
                <IcContainer onPress={() => navigation.navigate('/kokkokme/activity')}>
                  {haveNewNoti ? background ? <NotiOn /> : <NotiOnGray /> : background ? <NotiOff /> : <NotiOffGray />}
                </IcContainer>
              </SwrContainer>
            </Row>
          ) : (
            <>
              {userData?.setting?.sc_sns_account === 'private' ? (
                <Row>
                  {userData?.following?.status === 'approve' && (
                    <IcContainer
                      margin={15}
                      onPress={() =>
                        myUser && profileUser
                          ? ChatHttpUtil.requestGoChatRoomWithFriends(navigation, [profileUser.id], myUser.id)
                          : undefined
                      }
                    >
                      {background ? <StartChat /> : <StartChatGray />}
                    </IcContainer>
                  )}
                  <IcContainer onPress={() => openOptions1(true)}>{background ? <More /> : <MoreGray />}</IcContainer>
                </Row>
              ) : (
                <Row>
                  <IcContainer
                    margin={15}
                    onPress={() =>
                      myUser && profileUser
                        ? ChatHttpUtil.requestGoChatRoomWithFriends(navigation, [profileUser.id], myUser.id)
                        : undefined
                    }
                  >
                    {background ? <StartChat /> : <StartChatGray />}
                  </IcContainer>
                  <IcContainer onPress={() => openOptions1(true)}>{background ? <More /> : <MoreGray />}</IcContainer>
                </Row>
              )}
            </>
          ))}
      </Container>
      <Options
        menu={MENU}
        modalVisible={modal1Visible}
        onBackdropPress={() => setModal1Visible(false)}
        onMenuPress={handleMenuPress}
        onPress={openOptions1}
      />
      <Options
        menu={REPORT.menu}
        menuTitle={REPORT.title}
        modalVisible={modal2Visible}
        onBackdropPress={() => setModal2Visible(false)}
        onMenuPress={handleReportPress}
        onPress={openOptions2}
      />
      <ModalBase isVisible={confirmVisible} onBackdropPress={() => setConfirmVisible(false)} width={350}>
        <Column justify="center" align="center">
          <ModalTitle>
            {t('usertimeline.Are you sure you want to block the')}{' '}
            {profileUser?.first_name + ' ' + profileUser?.last_name}?
          </ModalTitle>
          <ModalText>
            {t("usertimeline.Once you leave, you can't see each other's posts and can't chat with each other")}
          </ModalText>
          <ButtonsContainer>
            <Button cancel marginRight={10} onPress={() => setConfirmVisible(false)}>
              <Label cancel>{t('kokkokme-main.Cancel')}</Label>
            </Button>
            <Button onPress={handleDeletePost}>
              <Label>{t('common.Block')}</Label>
            </Button>
          </ButtonsContainer>
        </Column>
      </ModalBase>
    </>
  );
};

export default TimelineHeader;
