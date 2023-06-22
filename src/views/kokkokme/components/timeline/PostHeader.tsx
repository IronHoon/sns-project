import { useAtomValue } from 'jotai';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Text, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import styled from 'styled-components';

import { Avatar } from 'components/atoms/image';
import { Column } from 'components/layouts/Column';
import { Row } from 'components/layouts/Row';
import { ModalBase, ModalText, ModalTitle, Options, Share } from 'components/modal';
import { COLOR } from 'constants/COLOR';
import { MY_POST, OTHERS_POST, OTHERS_POST_NOFOLLOW, REPORT } from 'constants/MENU';
import { MONTH } from 'constants/MONTH';
import { MainNavigationProp } from 'navigations/MainNavigator';
import userAtom from 'stores/userAtom';
import BooleanOrNumber from 'types/_common/BooleanOrNumber';
import DateOrString from 'types/_common/DateOrString';

import More from 'assets/kokkokme/ic-more.svg';
import Official from 'assets/kokkokme/ic-official.svg';
import User from '../../../../types/auth/User';
import { t } from 'i18next';
import Clipboard from '@react-native-clipboard/clipboard';
import SHARE from 'react-native-share';
import { patch, post, remove } from '../../../../net/rest/api';
import useFetch, { useFetchWithType } from '../../../../net/useFetch';
import DateUtil from '../../../../utils/DateUtil';
import friendListAtom from '../../../../stores/friendListAtom';

const Container = styled(Row)``;
const TextContainer = styled(Column)`
  margin-left: 15px;
`;
const ButtonsContainer = styled(Row)`
  margin-top: 25px;
`;

const Name = styled(Text)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: 15px;
  font-weight: 500;
  margin-right: 5px;
  /* text-overflow: ellipsis; */
  width: ${`${Dimensions.get('window').width - 120}px`};
`;
const Time = styled(Text)`
  color: ${COLOR.DARK_GRAY};
  font-size: 11px;
`;
const MoreIc = styled(More)`
  fill: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
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
  date: DateOrString;
  name: string;
  postId: string;
  profileImage: string;
  deletePost: (postId: string) => void;
  user: User;
  mutate: () => void;
  isDetail?: boolean;
  isOfficial?: BooleanOrNumber;
}

const PostHeader = ({
  mutate,
  date,
  name,
  postId,
  profileImage = '',
  isDetail,
  isOfficial,
  deletePost,
  user,
}: Props) => {
  const navigation = useNavigation<MainNavigationProp>();
  const me = useAtomValue(userAtom);
  const { data: userData, mutate: userMutate } = useFetchWithType<User>(
    user.uid ? `/auth/users/detail?uid=${user.uid}` : '',
  );
  const { mutate: followMutate } = useFetchWithType<any>(`/socials/follows/${user.id}/count`);
  const [dateStr, setDateStr] = useState('');
  const [modal1Visible, setModal1Visible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const myUser: User | null = useAtomValue(userAtom);
  const isMe = user.id === myUser?.id;
  const isDeletedUser = !isMe && user?.uid.split('_').pop() === `deleted${user?.id}`;

  const postLink = `https://share.kokkokchat.link/posts/${postId}`;
  // TODO: 웹링크 정책

  useFocusEffect(
    useCallback(() => {
      const timeDiff = DateUtil.postTime(date, new Date());
      if (timeDiff[1] >= 24) {
        const currentDate = new Date();
        const convertedDate = new Date(date);
        const month = MONTH[convertedDate?.getMonth()];
        const dateNum = convertedDate?.getDate();
        const year = convertedDate?.getFullYear();

        setDateStr(`${month} ${dateNum}, ${year}`);
      } else if (timeDiff[0] >= 60 && timeDiff[1] < 24) {
        if (timeDiff[1] === 1) {
          setDateStr(`${timeDiff[1]}hour ago`);
        } else {
          setDateStr(`${timeDiff[1]}hours ago`);
        }
      } else if (timeDiff[0] >= 1 && timeDiff[0] < 60) {
        if (timeDiff[0] === 1) {
          setDateStr(`${timeDiff[0]}minute ago`);
        } else {
          setDateStr(`${timeDiff[0]}minutes ago`);
        }
      } else if (timeDiff[0] < 1) {
        setDateStr('now');
      }
    }, [date]),
  );

  // useEffect(() => {
  //   const isFriend = friendList?.filter((item) => item === user?.id).length === 1;
  //   if (!isMe) {
  //     if (user?.sc_profile_photo === 'friends' && isFriend) {
  //       if (user?.profile_image === null || user?.profile_image === '') {
  //         setProfileImage('');
  //       } else if (user?.profile_image) {
  //         //@ts-ignore
  //         setProfileImage(user?.profile_image);
  //       }
  //     } else if (user?.sc_profile_photo === 'public') {
  //       if (user?.profile_image === null || user?.profile_image === '') {
  //         setProfileImage('');
  //       } else if (user?.profile_image) {
  //         //@ts-ignore
  //         setProfileImage(user?.profile_image);
  //       }
  //     } else {
  //       setProfileImage('');
  //     }
  //   } else {
  //     if (user?.profile_image) {
  //       //@ts-ignore
  //       setProfileImage(user?.profile_image);
  //     } else {
  //       setProfileImage('');
  //     }
  //   }
  // }, [user.sc_profile_photo]);

  const openOptions1 = (bool: boolean) => setModal1Visible(bool);
  const openOptions2 = (bool: boolean) => setModal2Visible(bool);

  const handlePress = () =>
    navigation.navigate('/kokkokme/user-timeline/:id', { id: user.id, uid: user.uid, contact: user.contact });

  const handleReportPress = (value?: string) => {
    if (value === 'Cancel') {
      return;
    }

    post('/auth/report', {
      reported_id: postId,
      type: 'post',
      issue: value,
    })
      .then(() => {
        console.log(value, ' 신고 성공!');
        Toast.show({
          type: 'success', // 'error', 'info'
          text1: t('kokkokme-main.Report has been received'),
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const copyLink = () =>
    Toast.show({
      type: 'success', // 'error', 'info'
      text1: t('kokkokme-main.Link Copied'),
    });

  const copyPostLink = () => {
    Clipboard.setString(postLink);
    Toast.show({
      type: 'success',
      text1: 'Link Copied',
    });
  };

  const options = {
    message: 'Share Post',
    title: 'Share Post',
    url: postLink,
    showAppsToView: true,
  };

  const handleMenuPress = async (value?: string) => {
    console.log(value);
    if (value === 'Report') {
      openOptions2(true);
    }
    if (value === 'Delete') {
      setConfirmVisible(true);
    }
    if (value === 'Copy link') {
      copyPostLink();
    }
    if (value === 'Share') {
      try {
        console.log('이건 공유');
        setTimeout(async () => {
          await SHARE.open(options);
        }, 300);
      } catch (err) {
        console.log(err);
      }
    }
    if (value === 'Edit') {
      navigation.navigate('/kokkokme/kokkokme-post/edit', {
        id: postId,
      });
    }
    if (value === 'unfollow') {
      remove(`/socials/follows/${user.id}`).then(() => {
        console.log('언팔로우');
        userMutate();
        followMutate();
        mutate();
      });
    }
    if (value === 'hide') {
      patch(`/socials/posts/${postId}/hide`, {}).then(() => {
        console.log('숨김 성공');
        mutate();
      });
    }
  };

  const handleDeletePost = () => {
    deletePost(postId);
    setConfirmVisible(false);

    if (isDetail) {
      navigation.goBack();
    }
  };

  return (
    <>
      <Container align="center" fullWidth justify="space-between">
        <Row align="center">
          <TouchableOpacity onPress={handlePress}>
            <Avatar src={profileImage} />
          </TouchableOpacity>
          <TextContainer justify="flex-start">
            <Name numberOfLines={1} style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
              {isDeletedUser ? 'Deleted User' : name} {!!isOfficial && <Official />}
            </Name>

            <Time style={{ fontSize: myUser?.setting?.ct_text_size as number }}>{dateStr}</Time>
          </TextContainer>
        </Row>
        <TouchableOpacity onPress={() => openOptions1(true)}>
          <MoreIc />
        </TouchableOpacity>
      </Container>
      <Options
        menu={me?.id === user.id ? MY_POST : userData?.following ? OTHERS_POST : OTHERS_POST_NOFOLLOW}
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
          <ModalTitle style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
            {t('kokkokme-main.Are you sure you want to delete the article?')}
          </ModalTitle>
          <ModalText>{t('kokkokme-main.If you delete it, all applied contents will be deleted')}</ModalText>
          <ButtonsContainer>
            <Button cancel marginRight={10} onPress={() => setConfirmVisible(false)}>
              <Label cancel>{t('kokkokme-main.Cancel')}</Label>
            </Button>
            <Button onPress={handleDeletePost}>
              <Label>{t('kokkokme-main.Delete')}</Label>
            </Button>
          </ButtonsContainer>
        </Column>
      </ModalBase>
      {/*<Share modalVisible={shareVisible} copyLink={copyLink} onBackdropPress={() => setShareVisible(false)} />*/}
    </>
  );
};

export default PostHeader;
