import React, { useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import User from '../../../types/auth/User';
import tw from 'twrnc';
import Space from '../../../components/utils/Space';
import { Avatar } from '../../../components/atoms/image';
import { useAtomValue } from 'jotai';
import userAtom from '../../../stores/userAtom';
import styled from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import Cake from 'assets/contacts/ic_cake.svg';
import Call from 'assets/contacts/ic_call.svg';
import Mov from 'assets/contacts/ic_mov.svg';
import { Row } from 'components/layouts/Row';
import Highlighter from 'react-native-highlight-words';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import Remove from 'assets/contacts/ic_remove.svg';
import Undo from 'assets/contacts/ic_undo.svg';
import { post, remove } from 'net/rest/api';
import { t } from 'i18next';
import ChatHttpUtil from 'utils/chats/ChatHttpUtil';
import Room, { CallType } from 'types/chats/rooms/Room';
import Nullable from 'types/_common/Nullable';
import AuthUtil from 'utils/AuthUtil';
import DateUtil from 'utils/DateUtil';
import profileDetailUidAtom from 'stores/profileDetailUidAtom';
import { useSetAtom } from 'jotai';
import showCallViewAtom from 'stores/showCallViewAtom';
import ChatSocketUtil from 'utils/chats/ChatSocketUtil';
import friendListAtom from '../../../stores/friendListAtom';
import LogUtil from '../../../utils/LogUtil';

interface ContactItemProps {
  user: User;
  highlight?: boolean;
  searchValue?: string;
  isEdit?: boolean;
  selectedList?: Array<number>;
  setSelectedList?: (id) => void;
  isLastone?: boolean;
}

const Container = styled.Pressable<{ me: boolean; lastOne?: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => (theme.dark ? '#69686a' : COLOR.WHITE)};
  margin-left: 12px;
  margin-right: 12px;
  margin-top: 5px;
  margin-bottom: ${({ lastOne }) => (lastOne ? '25px' : '5px')};
  border-radius: 10px;
  /* height: ${({ me }) => (me ? '80px' : '70px')}; */
  padding: 15px;
`;
const CallWrap = styled.View`
  flex-direction: row;
`;
const Name = styled.Text<{ me: boolean; size: number }>`
  font-size: ${({ size }) => `${size}px`};
  font-weight: 500;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  margin-bottom: 5px;
  max-width: ${({ me }) => (me ? '89%' : '85%')};
`;
const UserId = styled.Text<{ size: number }>`
  font-size: ${({ size }) => `${size - 2}px`};
  color: #bcb3c5;
`;

export default function ContactItem({
  user: contactUser,
  highlight = false,
  searchValue = '',
  isEdit = false,
  selectedList = [],
  setSelectedList,
  isLastone,
}: ContactItemProps) {
  const showCallView = useSetAtom(showCallViewAtom);
  const setCurrentProfileUid = useSetAtom(profileDetailUidAtom);
  const me: Nullable<User> = useAtomValue(userAtom);
  const navigation = useNavigation<MainNavigationProp>();
  const [checked, setChecked] = useState<boolean>(selectedList.includes(contactUser.id));
  const isMe = me?.id === contactUser.id;
  //나를 추가한 유저 리스트
  const addedMeList = useAtomValue(friendListAtom);
  const isAddedMe = addedMeList?.includes(contactUser.id);
  // const [isEveryone, setIsEveryone] = useState<boolean>();

  const addFriend = () => {
    AuthUtil.requestAddFriend(contactUser?.contact);
  };

  const block = () => {
    AuthUtil.requestBlockUser('contact', contactUser?.id).then(() => {});
  };

  const unBlock = () => {
    remove(`/auth/block/${contactUser?.id}`).then(() => {
      addFriend();
    });
  };

  const handleSelect = async () => {
    if (setSelectedList) {
      if (selectedList.includes(contactUser.id)) {
        // 차단 해제
        setSelectedList(selectedList.filter((id) => id !== contactUser.id));
        unBlock();
      } else {
        // 차단
        setSelectedList([...selectedList, contactUser.id]);
        block();
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      setChecked(selectedList.includes(contactUser.id));
    }, [selectedList]),
  );

  const onRequestVoiceCall = () => {
    me &&
      ChatHttpUtil.requestGoCallRoomWithFriends(
        navigation,
        [contactUser.id],
        me?.id,
        'audio',
        (navigation, room: Room, callType: CallType) => {
          if (ChatSocketUtil.instance.isOnAlreadyCalling()) {
            return;
          }

          showCallView({
            open: true,
            viewType: 'full',
            params: { room: room, callType: callType, action: 'create' },
          });
        },
      );
  };
  const onRequestVideoCall = () => {
    me &&
      ChatHttpUtil.requestGoCallRoomWithFriends(
        navigation,
        [contactUser.id],
        me?.id,
        'video',
        (navigation, room: Room, callType: CallType) => {
          if (ChatSocketUtil.instance.isOnAlreadyCalling()) {
            return;
          }

          showCallView({
            open: true,
            viewType: 'full',
            params: { room: room, callType: callType, action: 'create' },
          });
        },
      );
  };

  if (!contactUser) {
    return <></>;
  }

  const isBirth = useMemo(() => {
    if (contactUser?.birth) {
      const dateOfBirth = new Date(contactUser?.birth);
      const today = new Date();
      const sc_birth = contactUser?.setting.sc_birthday;

      if (`${dateOfBirth.getMonth()}${dateOfBirth.getDate()}` === `${today.getMonth()}${today.getDate()}`) {
        if (sc_birth === 'public' || (sc_birth === 'friends' && isAddedMe)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }, [contactUser]);

  const profile_image = useMemo(() => {
    if (
      contactUser.sc_profile_photo === 'public' ||
      (contactUser.sc_profile_photo === 'friends' && isAddedMe) ||
      isMe
    ) {
      return contactUser.profile_image;
    } else {
      return '';
    }
  }, [contactUser]);

  const isVoiceCallAble = useMemo(() => {
    if (
      contactUser.setting.sc_voice_call === 'public' ||
      (contactUser.setting.sc_voice_call === 'friends' && isAddedMe)
    ) {
      return true;
    } else {
      return false;
    }
  }, [contactUser]);

  const isVideoCallAble = useMemo(() => {
    if (
      contactUser.setting.sc_video_call === 'public' ||
      (contactUser.setting.sc_video_call === 'friends' && isAddedMe)
    ) {
      return true;
    } else {
      return false;
    }
  }, [contactUser]);
  return (
    <Container
      me={me && contactUser.id === me!.id}
      style={({ pressed }) => !isEdit && pressed && styles.boxShadow}
      onPress={() => {
        if (!isEdit) {
          setCurrentProfileUid(contactUser.uid);
          navigation.navigate('/profile-detail');
        }
      }}
      lastOne={isLastone}
    >
      <View style={tw`flex-row items-center flex-1`}>
        <Avatar size={me && contactUser.id !== me!.id ? 40 : 55} src={profile_image} />
        <Space width={20} />
        <View style={{ flex: 1 }}>
          <Row align="center">
            <Name me={me && contactUser.id === me!.id} numberOfLines={1} size={me?.setting.ct_text_size as number}>
              {highlight ? (
                <Highlighter
                  highlightStyle={{ color: COLOR.PRIMARY }}
                  searchWords={[`${searchValue}`]}
                  textToHighlight={`${contactUser?.first_name} ${contactUser?.last_name}`}
                />
              ) : (
                <>{`${contactUser?.first_name} ${contactUser?.last_name}`}</>
              )}
            </Name>
            {
              // && isEveryone
              isBirth && <Cake style={{ marginLeft: 5, marginBottom: 7 }} />
            }
          </Row>
          {contactUser.uid.toLowerCase().includes(searchValue.toLowerCase()) ? (
            <UserId size={me?.setting.ct_text_size as number} numberOfLines={1}>
              @
              <Highlighter
                highlightStyle={{ color: COLOR.PRIMARY }}
                searchWords={[`${searchValue}`]}
                textToHighlight={contactUser?.uid}
              />
            </UserId>
          ) : contactUser.email && contactUser.email.toLowerCase().includes(searchValue.toLowerCase()) ? (
            <UserId size={me?.setting.ct_text_size as number} numberOfLines={1}>
              <Highlighter
                highlightStyle={{ color: COLOR.PRIMARY }}
                searchWords={[`${searchValue}`]}
                textToHighlight={contactUser?.email}
              />
            </UserId>
          ) : contactUser.contact.includes(searchValue) ? (
            <UserId size={me?.setting.ct_text_size as number}>
              <Highlighter
                highlightStyle={{ color: COLOR.PRIMARY }}
                searchWords={[`${searchValue}`]}
                textToHighlight={contactUser?.contact}
              />
            </UserId>
          ) : (
            <UserId size={me?.setting.ct_text_size as number}>@{contactUser?.uid}</UserId>
          )}
        </View>
      </View>
      {me && contactUser.id !== me!.id && (
        <>
          {!isEdit ? (
            <CallWrap>
              {contactUser.call_able === 1 && isVoiceCallAble ? (
                <Pressable onPress={onRequestVoiceCall}>
                  <Call />
                </Pressable>
              ) : (
                <></>
              )}
              {contactUser.video_able === 1 && isVideoCallAble ? (
                <Pressable style={{ marginLeft: 10 }} onPress={onRequestVideoCall}>
                  <Mov />
                </Pressable>
              ) : (
                <></>
              )}
            </CallWrap>
          ) : (
            <Pressable onPress={() => handleSelect()}>
              {checked ? (
                <Row style={{ alignItems: 'center' }}>
                  <Undo />
                  <Text
                    style={{
                      fontSize: (me?.setting.ct_text_size as number) - 2,
                      fontWeight: '500',
                      color: '#0b0a0c',
                      marginLeft: 5,
                    }}
                  >
                    {t('profile-detail.Unblock')}
                  </Text>
                </Row>
              ) : (
                <Row style={{ alignItems: 'center' }}>
                  <Remove />
                  <Text
                    style={{
                      fontSize: (me?.setting.ct_text_size as number) - 2,
                      fontWeight: '500',
                      color: '#ff0000',
                      marginLeft: 5,
                    }}
                  >
                    {t('profile-detail.Block')}
                  </Text>
                </Row>
              )}
            </Pressable>
          )}
        </>
      )}
    </Container>
  );
}
const styles = StyleSheet.create({
  boxShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 7,
      height: 7,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
});
