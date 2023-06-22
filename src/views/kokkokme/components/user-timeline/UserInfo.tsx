import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, TouchableWithoutFeedback, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import styled from 'styled-components';

import { Column } from 'components/layouts/Column';
import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { IFollowInfo } from 'types/socials/follow/FollowInfo';
import Nullable from 'types/_common/Nullable';
import { t } from 'i18next';
import Down from 'assets/contacts/ic_down_14.svg';
import tw from 'twrnc';
import { useFetchWithType } from '../../../../net/useFetch';
import { patch, post, remove } from '../../../../net/rest/api';
import Space from '../../../../components/utils/Space';
import Toast from 'react-native-toast-message';
import { useAtom, useAtomValue } from 'jotai';
import userAtom from '../../../../stores/userAtom';
import SwrContainer from '../../../../components/containers/SwrContainer';
import hideAtom from '../../../../stores/hideAtom';
import LogUtil from '../../../../utils/LogUtil';

const Container = styled(View)`
  border-bottom-color: ${COLOR.GRAY};
  border-bottom-style: solid;
  border-bottom-width: 1px;
  padding: 0 20px 30px;
  width: 100%;
  align-items: center;
`;
const FollowContainer = styled(Row)`
  margin: 20px 0;
`;
const FollowBlock = styled(Column)<{ paddingHorizontal?: number }>`
  ${({ paddingHorizontal }) =>
    paddingHorizontal
      ? `border-right-color: ${COLOR.GRAY}; border-right-style: 'solid'; border-right-width: 1px; margin-right: ${paddingHorizontal}px; padding-right: ${paddingHorizontal}px;`
      : ''}
`;

// const Name = styled(Text)`
//   color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
//   font-size: 20px;
//   font-weight: bold;
//   margin: 10px 0 3px;
// `;
const KokkokName = styled(Text)`
  color: ${COLOR.TEXT_LIGHT_GRAY};
  font-size: 13px;
`;
const FollowTitle = styled(Text)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: 13px;
  margin-bottom: 3px;
`;
const FollowData = styled(Text)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: 20px;
  font-weight: bold;
`;

const FollowButtonContainer = styled(View)<{ isFollowing: boolean; requested?: boolean }>`
  flex-direction: row;
  align-items: center;
  height: 32px;
  width: ${({ isFollowing }) => (isFollowing ? '120px' : '92px')};
  border-radius: 8px;
  ${({ isFollowing }) =>
    isFollowing ? `background-color:${COLOR.WHITE}; border-width: 1px` : `background-color:${COLOR.PRIMARY}`};
  ${({ requested }) => (requested ? 'width: 100px' : '')}
`;
const FollowButton = styled(View)<{ isFollowing: boolean }>`
  color: ${COLOR.BLACK};
  flex: 1;
  font-size: 16px;
  ${({ isFollowing }) => (isFollowing ? 'margin-left: 15px' : 'align-items: center')};
`;
const ProfileMessage = styled(Text)`
  color: ${COLOR.TEXT_GRAY};
  font-size: 13px;
  text-align: center;
`;

const NameContainer = styled(View)`
  /* height: auto; */
  justify-content: center;
`;
const Name = styled(View)`
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
`;
const NameText = styled(Text)`
  font-size: 20px;
  padding-top: 10px;
  /* line-height: 22px; */
  font-weight: 500;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
interface Props {
  followmutate: () => void;
  follow?: IFollowInfo;
  name: string;
  profileMessage: Nullable<string>;
  uid: string;
  id: number;
}

interface OptionProps {
  menu: any;
  onPress: (visible: boolean) => void;
  photo?: boolean;
  menuTitle?: string;
  modalVisible?: boolean;
  onBackdropPress?: () => void;
  onMenuPress?: (value?: string) => void;
  border?: boolean;
}

const MENU = [
  {
    value: 'hide',
    label: t('usertimeline.Hide all activities'),
    desc: t("usertimeline.User's all activities will be hidden on Kok Kok Me"),
  },
  {
    value: 'unfollow',
    label: t('usertimeline.Unfollow this user'),
  },
  {
    value: 'cancel',
    label: t('common.Cancel'),
  },
];

const MENU2 = [
  {
    value: 'show',
    label: t('usertimeline.Show all activities'),
  },
  {
    value: 'unfollow',
    label: t('usertimeline.Unfollow this user'),
  },
  {
    value: 'cancel',
    label: t('common.Cancel'),
  },
];

export const Options = ({
  photo,
  menu,
  menuTitle,
  modalVisible,
  onBackdropPress,
  onMenuPress,
  onPress,
  border,
}: OptionProps) => {
  const user = useAtomValue(userAtom);

  return (
    <Modal transparent={true} visible={modalVisible}>
      <TouchableWithoutFeedback onPress={onBackdropPress}>
        <View style={styles.centeredView} />
      </TouchableWithoutFeedback>
      <View style={styles.modalView}>
        {menuTitle && (
          <View style={styles.title}>
            <Text style={(styles.titleText, { fontSize: user?.setting?.ct_text_size as number })}>{menuTitle}</Text>
          </View>
        )}
        {menu.map((x) => (
          <Pressable
            key={x.value}
            style={({ pressed }) => [
              x.value === 'cancel' && styles.final,
              {
                backgroundColor: pressed ? '#fcf2e8' : '',
                padding: 16,
                elevation: 2,
                borderStyle: 'solid',
                borderBottomWidth: photo || border ? 0 : 1,
                borderColor: `${COLOR.GRAY}`,
              },
            ]}
            onPress={() => {
              onMenuPress?.(x.value);
              onPress(!modalVisible);
            }}
          >
            <Text
              style={[
                x.value === 'hide' || x.value === 'unfollow'
                  ? tw`text-red-600 text-sm text-center`
                  : x.value === 'show'
                  ? tw`text-blue-500 text-center`
                  : photo
                  ? tw`text-black`
                  : tw`text-black text-center`,
                { fontSize: user?.setting?.ct_text_size as number, paddingTop: 5 },
                ,
              ]}
            >
              {x.label}
            </Text>
            {x.desc && <Text style={(styles.desc, { fontSize: user?.setting?.ct_text_size as number })}>{x.desc}</Text>}
          </Pressable>
        ))}
      </View>
    </Modal>
  );
};

const UserInfo = ({ followmutate, follow, name, profileMessage, uid, id }: Props) => {
  const [hide, setHide] = useAtom(hideAtom);
  const navigation = useNavigation<MainNavigationProp>();
  const {
    data: userData,
    error: userError,
    mutate: userMutate,
  } = useFetchWithType<any>(uid ? `auth/users/detail?uid=${uid}` : '');
  const [modal1Visible, setModal1Visible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const user = useAtomValue(userAtom);
  const [buttonClicked, setButtonClicked] = useState(false);

  const openOptions1 = (bool: boolean) => setModal1Visible(bool);
  const openOptions2 = (bool: boolean) => setModal2Visible(bool);

  const handleMenuPress = (value?: string) => {
    console.log(value);
    if (value === 'hide' || value === 'show') {
      patch(`/socials/follows/following/${id}/hidden`, {}).then(async () => {
        console.log('숨김 성공');
        setHide(false);
        await userMutate();
      });
    }
    if (value === 'unfollow') {
      remove(`/socials/follows/${id}`)
        .then(async () => {
          setHide(false);
          await userMutate();
          await followmutate();

          console.log('언팔로우');
          Toast.show({
            type: 'success',
            text1: `${userData.first_name + ' ' + userData.last_name} is unfollowed.`,
          });
        })
        .catch((e) => console.log(e));
    }
    if (value === 'cancel') {
      setModal1Visible(false);
      setModal2Visible(false);
      setHide(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      if (hide) {
        setModal1Visible(true);
        console.log('여기서 모달 세팅');
      }
    }, [hide]),
  );

  LogUtil.info('blockData', follow);
  LogUtil.info('id', id);

  return (
    <>
      <Container>
        <Column align="center">
          <NameContainer>
            <Name>
              {name.split(' ').map((word) => (
                <NameText style={{ fontSize: user?.setting?.ct_text_size as number }}>{word}</NameText>
              ))}
            </Name>
          </NameContainer>
          {/* <Name>{name}</Name> */}
          <KokkokName style={{ fontSize: user?.setting?.ct_text_size as number }}>@{uid}</KokkokName>
        </Column>
        <FollowContainer justify="center">
          <Pressable
            disabled={userData?.block}
            onPress={() => {
              navigation.navigate('/kokkokme/user-timeline/followers', {
                id: id,
                name: name,
              });
            }}
          >
            <FollowBlock align="center" paddingHorizontal={25}>
              <FollowTitle>{t('user-timeline.followers')}</FollowTitle>
              <FollowData>{follow?.follower.toLocaleString() ?? null}</FollowData>
            </FollowBlock>
          </Pressable>
          <Pressable
            disabled={userData?.block}
            onPress={() => {
              navigation.navigate('/kokkokme/user-timeline/followers', {
                id: id,
                name: name,
              });
            }}
          >
            <FollowBlock align="center">
              <FollowTitle>{t('user-timeline.following')}</FollowTitle>
              <FollowData>{follow?.following.toLocaleString() ?? null}</FollowData>
            </FollowBlock>
          </Pressable>
        </FollowContainer>
        <>
          {user?.id !== id && (
            <SwrContainer data={userData} error={userError}>
              <>
                {userError?.response.data.code === 'api.not found user' || !!userData?.block ? (
                  <>
                    <FollowButtonContainer
                      isFollowing={false}
                      style={{ backgroundColor: COLOR.DARK_GRAY }}
                      // requested={userData?.following?.status === 'private'}
                    >
                      <FollowButton isFollowing={false}>
                        <Text style={{ color: COLOR.BLACK, fontSize: 13, fontWeight: '500' }}>
                          {t('follower-list.Follow')}
                        </Text>
                      </FollowButton>
                      <View style={tw`flex-0.1 absolute right-3`} />
                    </FollowButtonContainer>
                  </>
                ) : (
                  <Pressable
                    onTouchStart={() => {
                      if (userData?.following?.status === 'private') {
                        remove(`socials/follows/${id}`)
                          .then(async (res) => {
                            await userMutate();
                            await followmutate();
                            console.log('언팔로우', res);
                          })
                          .catch((e) => console.log(e));
                      } else {
                        if (userData.following) {
                          if (userData.following.hidden) {
                            setModal2Visible(true);
                          } else {
                            setModal1Visible(true);
                          }
                        } else {
                          post('/socials/follows', {
                            follower_id: id,
                          })
                            .then(async () => {
                              await userMutate();
                              await followmutate();
                              console.log('팔로우');
                            })
                            .catch((e) => console.log(e));
                        }
                      }
                    }}
                  >
                    <FollowButtonContainer
                      isFollowing={!!userData.following}
                      style={{ borderColor: '#ededed' }}
                      requested={userData?.following?.status === 'private'}
                    >
                      <FollowButton isFollowing={!!userData.following}>
                        {userData.following ? (
                          <Text style={{ color: COLOR.BLACK, fontSize: 13 }}>
                            {userData?.following?.status === 'private'
                              ? t('follower-list.Requested')
                              : t('user-timeline.Following')}
                          </Text>
                        ) : (
                          <>
                            {userData.follower !== null ? (
                              <Text style={{ color: COLOR.WHITE, fontSize: 13, fontWeight: '500' }}>
                                {t('follower-list.Follow Back')}
                              </Text>
                            ) : (
                              <Text style={{ color: COLOR.WHITE, fontSize: 13, fontWeight: '500' }}>
                                {t('follower-list.Follow')}
                              </Text>
                            )}
                          </>
                        )}
                      </FollowButton>
                      {userData?.following?.status !== 'private' && (
                        <View style={tw`flex-0.1 absolute right-3`}>{userData.following && <Down />}</View>
                      )}
                    </FollowButtonContainer>
                  </Pressable>
                )}

                <Space height={10} />
              </>
            </SwrContainer>
          )}
        </>

        <ProfileMessage style={{ fontSize: user?.setting?.ct_text_size as number }}>{profileMessage}</ProfileMessage>
      </Container>
      <Options
        menu={MENU}
        modalVisible={modal1Visible}
        onBackdropPress={() => {
          setHide(false);
          setModal1Visible(false);
        }}
        onMenuPress={handleMenuPress}
        onPress={openOptions1}
      />
      <Options
        menu={MENU2}
        modalVisible={modal2Visible}
        onBackdropPress={() => setModal2Visible(false)}
        onMenuPress={handleMenuPress}
        onPress={openOptions2}
      />
    </>
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
    paddingLeft: 20,
  },
  titleText: {
    color: `${COLOR.BLACK}`,
    // fontSize: 16,
    fontWeight: '500',
  },

  final: {
    borderColor: 'white',
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
    // fontSize: 13,
    marginTop: 5,
    textAlign: 'center',
  },
});

export default UserInfo;
