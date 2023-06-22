import React, { useCallback, useEffect, useState } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled from 'styled-components/native';
import { SwitchButton } from 'components/atoms/switch/SwitchButton';
import { View } from 'react-native';
import { ModalBase } from 'components/modal';
import { Column } from 'components/layouts/Column';
import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';
import Space from 'components/utils/Space';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { patch, post, remove } from 'net/rest/api';
import { useAtom, useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import { t } from 'i18next';
import LogUtil from '../../../../utils/LogUtil';
import Room from '../../../../types/chats/rooms/Room';
import CopyUtil from '../../../../utils/CopyUtil';
import ChatHttpUtil from '../../../../utils/chats/ChatHttpUtil';
import { useFetchWithType } from '../../../../net/useFetch';
import User from '../../../../types/auth/User';
import SwrContainer from '../../../../components/containers/SwrContainer';
import useSocket from 'hooks/useSocket';
import chatStatusAtom from 'stores/chatStatusAtom';
import ChatSocketUtil from 'utils/chats/ChatSocketUtil';

const NavButtonContainer = styled.TouchableOpacity`
  flex-direction: row;
  padding: 15px;
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
`;
const NavLabel = styled.Text`
  flex: 1;
  font-size: 14px;
  color: ${(props) => (props.theme.dark ? props.theme.colors.WHITE : props.theme.colors.BLACK)};
`;
const SwitchContainer = styled.View`
  flex-direction: row;
  padding: 15px;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
`;
const SwitchLabel = styled.Text`
  margin-bottom: 5px;
  color: ${(props) => (props.theme.dark ? props.theme.colors.WHITE : props.theme.colors.BLACK)};
`;
const ModalText = styled.Text`
  color: ${COLOR.BLACK};
  padding-top: 5px;
  padding-bottom: 10px;
  text-align: center;
  font-weight: 600;
  font-size: 15px;
`;
const CancelButton = styled.TouchableOpacity`
  background-color: #fff;
  width: 110px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: #ccc;
`;
const CancelLabel = styled.Text`
  color: #ccc;
  font-weight: bold;
`;
const Confirm = styled.TouchableOpacity`
  background-color: ${COLOR.PRIMARY};
  width: 110px;
  height: 50px;
  align-items: center;
  justify-content: center;
  border: 1px;
  border-radius: 10px;
  border-color: ${COLOR.PRIMARY};
`;
const ModalLabel = styled.Text`
  color: #fff;
  font-weight: bold;
`;
const Description = styled.Text`
  font-size: 13px;
  padding-top: 5px;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
`;
const CheckBoxContainer = styled.TouchableOpacity`
  position: relative;
  width: 20px;
  height: 22px;
`;
const CheckBoxImage = styled.Image`
  position: absolute;
  width: 100%;
  height: 100%;
`;
const CheckBoxText = styled.Text`
  padding: 10px 0;
  font-size: 13px;
  font-weight: 600;
  margin-left: 5px;
  color: ${COLOR.PRIMARY};
`;

const ArchiveModal = ({ isVisible, setIsVisible, handleConfirm }) => {
  return (
    <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
      <Column justify="center" align="center">
        <ModalText>{t('chatting.Are you sure you want to unarchive all archived chat rooms?')}</ModalText>
        <Row style={{ paddingTop: 15 }}>
          <CancelButton onPress={() => setIsVisible(false)}>
            <CancelLabel>{t('chatting.Cancel')}</CancelLabel>
          </CancelButton>
          <View style={{ padding: 10 }} />
          <Confirm
            onPress={() => {
              handleConfirm();
            }}
          >
            <ModalLabel>{t('chatting.Confirm')}</ModalLabel>
          </Confirm>
        </Row>
      </Column>
    </ModalBase>
  );
};

const DeleteModal = ({ myUser, isVisible, setIsVisible, handleClear }) => {
  const [checked, setChecked] = useState<boolean>(false);

  return (
    <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
      <Column justify="center" align="center">
        <ModalText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
          {t('chatting.Are you sure you want to clear all chat messages?')}
        </ModalText>
        <Space height={35} />
        <Row style={{ position: 'absolute', left: 0, top: 55, alignItems: 'center' }}>
          <CheckBoxContainer
            onPress={() => {
              setChecked(!checked);
            }}
          >
            <CheckBoxImage
              source={
                checked ? require('../../../../assets/ic-check-on.png') : require('../../../../assets/ic-check-off.png')
              }
            />
          </CheckBoxContainer>
          <CheckBoxText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
            {' '}
            {t('chatting.Delete media in all chatrooms')}
          </CheckBoxText>
        </Row>
        <Row style={{ paddingTop: 15 }}>
          <CancelButton onPress={() => setIsVisible(false)}>
            <CancelLabel>{t('chatting.Cancel')}</CancelLabel>
          </CancelButton>
          <View style={{ padding: 10 }} />
          <Confirm
            onPress={() => {
              handleClear(checked);
              setChecked(false);
            }}
          >
            <ModalLabel>{t('chatting.Clear')}</ModalLabel>
          </Confirm>
        </Row>
      </Column>
    </ModalBase>
  );
};

const LeaveModal = ({ myUser, isVisible, setIsVisible, handleLeave }) => {
  return (
    <ModalBase isVisible={isVisible} onBackdropPress={() => setIsVisible(false)} width={350}>
      <Column justify="center" align="center">
        <ModalText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
          {t('chatting.Are you sure you want to leave my chatroom?')}
        </ModalText>
        <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
          {t('chatting.All conversation history will be deleted and all chatrooms will be removed from your chat list')}
        </Description>
        <Row style={{ paddingTop: 15 }}>
          <CancelButton onPress={() => setIsVisible(false)}>
            <CancelLabel>{t('chatting.Cancel')}</CancelLabel>
          </CancelButton>
          <View style={{ padding: 10 }} />
          <Confirm
            onPress={() => {
              handleLeave();
            }}
          >
            <ModalLabel>{t('chatting.Leave')}</ModalLabel>
          </Confirm>
        </Row>
      </Column>
    </ModalBase>
  );
};

function Chatting() {
  const { chatStatus, chatSocketUtil } = useSocket();
  const { data: userData, error: userError, mutate: userMutate } = useFetchWithType<User>('/auth/me');
  const [isArchiveVisible, setIsArchiveVisible] = useState<boolean>(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState<boolean>(false);
  const [isLeaveVisible, setIsLeaveVisible] = useState<boolean>(false);
  const navigation = useNavigation<MainNavigationProp>();
  const onRoomsData = chatStatus.rooms;
  const archivedRoomList: Room[] = CopyUtil.deepCopy(onRoomsData?.archivedRooms) ?? [];
  const socketPrefix = '아카이브채팅목록';
  const [myUser, setMyUser] = useAtom<User | null>(userAtom);

  const refreshChatRoom = async (room?: Room) => {
    if (room) {
      await chatSocketUtil.easy.joinRoomForChat('Chatting', room._id);
    }
  };

  console.log(archivedRoomList);
  const handleClear = useCallback(async (isMediaDelete: boolean) => {
    await remove(`/chats/messages${isMediaDelete ? '?type=all' : ''}`, null, undefined, true);
    ChatSocketUtil.instance.util.removeAllMessages();
    await refreshChatRoom();
    setIsDeleteVisible(false);
  }, []);

  const onUnarchive = async () => {
    LogUtil.info('ArchiveChats onUnarchive');
    for (const checkedRoom of archivedRoomList) {
      await ChatHttpUtil.requestUnarchiveRoom(checkedRoom);
    }
    await chatSocketUtil.easy.getRooms(socketPrefix);
  };

  const handleLeave = useCallback(async () => {
    await post('chats/rooms/leave-all', {});
    setIsLeaveVisible(false);
  }, []);

  const update = useCallback(
    async (field: string, value: any) => {
      console.log('field : ', field);
      console.log('value : ', value);
      await patch('/auth/user-setting', {
        ...userData?.setting,
        [field]: value,
      }).then(() => {
        let myUserSetting = {
          ...myUser,
          setting: {
            ...myUser?.setting,
            [field]: value,
          },
        };
        // @ts-ignore
        setMyUser(myUserSetting);
      });
      await userMutate();
    },
    [userData],
  );

  return (
    <MainLayout>
      <BackHeader title={t('chatting.Chatting')} />
      <NavButtonContainer onPress={() => navigation.navigate('/more/settings/chatting/export')}>
        <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{t('chatting.Export chats')}</NavLabel>
      </NavButtonContainer>
      <SwrContainer data={userData} error={userError}>
        <>
          <SwitchContainer>
            <View style={{ flex: 1 }}>
              <SwitchLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                {t('chatting.Archive chats')}
              </SwitchLabel>
            </View>
            <SwitchButton
              isEnabled={!!userData?.setting?.ct_active_chat}
              setIsEnabled={() => {
                if (userData?.setting?.ct_active_chat) {
                  setIsArchiveVisible(true);
                } else {
                  update('ct_active_chat', 1);
                }
              }}
            />
          </SwitchContainer>
          <SwitchContainer>
            <View style={{ flex: 1 }}>
              <SwitchLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                {t('chatting.Word suggestion')}
              </SwitchLabel>
            </View>
            <SwitchButton
              isEnabled={!!userData?.setting?.ct_word_suggestion}
              setIsEnabled={() => update('ct_word_suggestion', userData?.setting?.ct_word_suggestion ? 0 : 1)}
            />
          </SwitchContainer>
        </>
      </SwrContainer>

      <NavButtonContainer onPress={() => setIsDeleteVisible(true)}>
        <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
          {t('chatting.Delete all chat messages')}
        </NavLabel>
      </NavButtonContainer>
      <NavButtonContainer onPress={() => setIsLeaveVisible(true)}>
        <NavLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
          {t('chatting.Leave all chatrooms')}
        </NavLabel>
      </NavButtonContainer>
      <ArchiveModal
        isVisible={isArchiveVisible}
        setIsVisible={setIsArchiveVisible}
        handleConfirm={async () => {
          await update('ct_active_chat', 0);
          onUnarchive();
          setIsArchiveVisible(false);
        }}
      />
      <DeleteModal
        myUser={myUser}
        isVisible={isDeleteVisible}
        setIsVisible={setIsDeleteVisible}
        handleClear={handleClear}
      />
      <LeaveModal
        myUser={myUser}
        isVisible={isLeaveVisible}
        setIsVisible={setIsLeaveVisible}
        handleLeave={handleLeave}
      />
    </MainLayout>
  );
}

export default Chatting;
