import { useAtom, useAtomValue } from 'jotai';
import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import styled from 'styled-components';

import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import { Avatar } from 'components/atoms/image';
import { Row } from 'components/layouts/Row';
import { Options } from 'components/modal';
import { COLOR } from 'constants/COLOR';
import { REPORT } from 'constants/MENU';
import userAtom from 'stores/userAtom';
import Comments from 'types/socials/comments/Comments';
import DateOrString from 'types/_common/DateOrString';
import InputReComment from 'views/kokkokme/components/detail/InputReComment';
import { deleteComment, getTimeDiffFull, postComment } from 'utils';

import More from 'assets/kokkokme/ic-more-sm.svg';
import { t } from 'i18next';
import { MainNavigationProp } from '../../../../navigations/MainNavigator';
import { patch, post } from '../../../../net/rest/api';
import commentsContainer from './CommentsContainer';
import hideAtom from '../../../../stores/hideAtom';
import { useFetchWithType } from '../../../../net/useFetch';
import User from '../../../../types/auth/User';
import i18next from '../../../../../i18n';
import uuid from 'react-native-uuid';
import tw from 'twrnc';
import LogUtil from '../../../../utils/LogUtil';
import friendListAtom from '../../../../stores/friendListAtom';
import { WIDTH } from 'constants/WIDTH';

const Container = styled(Row)<{ isReComment?: boolean }>`
  padding: ${({ isReComment }) => (isReComment ? '15px 0 15px 40px' : '15px 0')};
  width: 100%;
`;
const FlexContainer = styled(View)`
  width: ${WIDTH - 75}px;
  /* flex-wrap: wrap; */
`;
const ContentContainer = styled(View)`
  width: ${WIDTH - 80}px;
  flex-wrap: wrap;
  margin: 0 0 5px 10px;
`;

const Writer = styled(Text)`
  width: ${WIDTH - 80}px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: 13px;
  font-weight: 500;
  padding-bottom: 5px;
  /* margin-left: 10px; */
`;
const Content = styled(Text)`
  width: ${WIDTH - 80}px;
  color: ${({ theme }) => (theme.dark ? COLOR.TEXT_GRAY : '#777')};
  font-size: 13px;
`;
const CreatedAt = styled(Text)`
  color: ${COLOR.DARK_GRAY};
  font-size: 11px;
  margin-left: 10px;
  margin-right: 8px;
`;
interface TextStyle {
  highlight?: boolean;
  isShared?: boolean;
}

const HashTag = styled(Text)<TextStyle>`
  background: ${({ highlight }) => (highlight ? COLOR.BLACK : 'transparent')};
  color: ${({ highlight }) => (highlight ? COLOR.WHITE : COLOR.BLUE)};
  font-size: ${({ isShared }) => (isShared ? 13 : 15)}px;
`;
const Word = styled(Text)<TextStyle>`
  background: ${({ highlight }) => (highlight ? COLOR.BLACK : 'transparent')};
  color: ${({ highlight }) => (highlight ? COLOR.WHITE : COLOR.TEXT_GRAY)};
  font-size: ${({ isShared }) => (isShared ? 13 : 15)}px;
`;
const TextContainer = styled(View)`
  flex: 1;
`;
interface Props {
  data: any;
  onSuccessReq: () => void;
  commentMutate: () => void;
  postMutate: () => void;
  commentId?: string;
  setCommentId?: (id) => void;
}

const Comment = ({ postMutate, commentMutate, data, onSuccessReq, commentId, setCommentId }: Props) => {
  const me: User | null = useAtomValue(userAtom);
  const {
    data: commentUser,
    error: commentUserError,
    mutate: commentUserMutate,
  } = useFetchWithType<User>(`/auth/users/detail?uid=${data.item.user.uid}`);
  const [show, setShow] = useState(false);
  const [modal1Visible, setModal1Visible] = useState<boolean>(false);
  const [modal2Visible, setModal2Visible] = useState<boolean>(false);
  const [modal3Visible, setModal3Visible] = useState<boolean>(false);

  const [fullName, setFullName] = useState<string>('');
  const [createdAt, setCreatedAT] = useState<DateOrString>('');
  const [contents, setContents] = useState<string>('');
  const navigation = useNavigation<MainNavigationProp>();

  const [contentArr, setContentArr] = useState<string[]>(['']);
  const [hashCount, setHashCount] = useState<number>(0);
  const [onlyHash, setOnlyHash] = useState<boolean>(false);

  const isMe = commentUser?.id === me?.id;
  const isDeletedUser = data.item.user.uid.split('_').pop() === `deleted${data.item.user.id}`;
  const [profileImage, setProfileImage] = useState('');
  const friendList = useAtomValue(friendListAtom);

  useFocusEffect(
    useCallback(() => {
      const isFriend = friendList?.filter((item) => item === commentUser?.id).length === 1;
      if (!isMe) {
        if (commentUser?.sc_profile_photo === 'friends' && isFriend) {
          if (commentUser?.profile_image === null || commentUser?.profile_image === '') {
            setProfileImage('');
          } else if (commentUser?.profile_image) {
            //@ts-ignore
            setProfileImage(commentUser?.profile_image);
          }
        } else if (commentUser?.sc_profile_photo === 'public') {
          if (commentUser?.profile_image === null || commentUser?.profile_image === '') {
            setProfileImage('');
          } else if (commentUser?.profile_image) {
            //@ts-ignore
            setProfileImage(commentUser?.profile_image);
          }
        } else {
          setProfileImage('');
        }
      } else {
        if (commentUser?.profile_image) {
          //@ts-ignore
          setProfileImage(commentUser?.profile_image);
        } else {
          setProfileImage('');
        }
      }
    }, [commentUser]),
  );

  useFocusEffect(
    useCallback(() => {
      const regExp = /(#[^\s!@#$%^&*()=+.\/,\[{\]};:'"?><]+)/g;
      const tempArr = data.item.contents.split(regExp);

      setContentArr(tempArr);
      setHashCount(data.item.contents.match(regExp)?.length || 0);
    }, [data]),
  );

  const showHashTagSearchResult = (word: string) => {
    navigation.navigate('/kokkokme/kokkokme-search/hash', {
      hash: word,
    });
  };

  const handlePressHash = (word: string) => {
    return showHashTagSearchResult(word);
  };

  useFocusEffect(
    useCallback(() => {
      if (data) {
        if (isDeletedUser) {
          setFullName('Deleted Account');
          return;
        }
        setFullName(`${data.item.user.first_name} ${data.item.user.last_name}`);
        setContents(data.item.contents);
        setCreatedAT(() => getTimeDiffFull(data.item.created_at));
      }
    }, [data]),
  );

  const COMMENT = [
    {
      value: 'hide-comment',
      label: i18next.t('kokkokme-main.Hide this comment'),
    },
    {
      value: 'hide-all-activities',
      label: i18next.t('kokkokme-main.Hide all activities'),
      desc: 'User’s all activities will be hidden on Timeline',
    },
    {
      value: 'report',
      label: i18next.t('kokkokme-main.Report'),
    },
    {
      value: 'cancel',
      label: i18next.t('kokkokme-main.Cancel'),
    },
  ];
  const DELETE = [
    {
      value: 'delete',
      label: i18next.t('common.Delete'),
    },
    {
      value: 'cancel',
      label: i18next.t('kokkokme-main.Cancel'),
    },
  ];

  const openOptions1 = (bool: boolean) => setModal1Visible(bool);
  const openOptions2 = (bool: boolean) => setModal2Visible(bool);
  const openOptions3 = (bool: boolean) => setModal3Visible(bool);

  const showInput = () => {
    setShow(!show);
    if (!show) {
      setCommentId && setCommentId(data.item._id);
    }
  };

  const [hide, setHide] = useAtom(hideAtom);

  const handleMenuPress = (value?: string) => {
    console.log(value);
    if (value === 'report') openOptions2(true);
    if (value === 'hide-comment') {
      patch(`/socials/comments/${data.item._id}/hide`, {}).then(() => {
        console.log('숨김 성공!!');
        console.log('comment id', data.item._id);
        commentMutate();
      });
    }
    if (value === 'hide-all-activities') {
      setHide(true);
      navigation.navigate('/kokkokme/user-timeline/:id', {
        id: data.item.user.id,
        uid: data.item.user.uid,
        contact: data.item.user.contact,
      });
    }
    if (value === 'delete') {
      deleteComment(data.item._id, onSuccessReq);
    }
  };

  const handleReportPress = (value?: string) => {
    if (value === 'Cancel') return;

    post('/auth/report', {
      reported_id: data.item._id,
      type: 'comment',
      issue: value,
    })
      .then(() => {
        console.log(value, ' 신고 성공!');
        Toast.show({
          type: 'success', // 'error', 'info'
          text1: t('post-detail.Report has been received'),
        });
      })
      .catch((e) => {
        console.log(e.response.data.message);
      });
  };

  const handlePressPost = (value: string) => {
    postComment(data.item.post_id, value, me?.id, onSuccessReq, data.item.group);
    setShow(false);
    commentMutate();
  };

  return (
    <>
      <Container fullWidth isReComment={data?.item.depth === 1}>
        <Pressable
          onPress={() => {
            navigation.navigate('/kokkokme/user-timeline/:id', {
              id: data?.item.user.id,
              uid: data?.item.user.uid,
              contact: data?.item.user.contact,
            });
          }}
        >
          <Avatar src={isDeletedUser ? '' : profileImage} size={30} />
        </Pressable>
        <FlexContainer>
          <ContentContainer>
            <Pressable
              onPress={() => {
                navigation.navigate('/kokkokme/user-timeline/:id', {
                  id: data?.item.user.id,
                  uid: data?.item.user.uid,
                  contact: data?.item.user.contact,
                });
              }}
            >
              <Writer
                style={{
                  width: data?.item.depth === 1 ? WIDTH - 120 : WIDTH - 80,
                  fontSize: me?.setting?.ct_text_size as number,
                }}
              >
                {fullName}
              </Writer>
            </Pressable>
            <TextContainer>
              <Content style={{ width: data?.item.depth === 1 ? WIDTH - 120 : WIDTH - 80 }}>
                {contentArr.map((word, i) =>
                  word.includes('#') ? (
                    <HashTag
                      style={{ fontSize: me?.setting?.ct_text_size as number }}
                      key={uuid.v4().toString()}
                      onPress={() => {
                        handlePressHash(word);
                      }}
                    >
                      {word}
                    </HashTag>
                  ) : (
                    <Word style={{ fontSize: me?.setting?.ct_text_size as number }} key={uuid.v4().toString()}>
                      {word}
                    </Word>
                  ),
                )}
              </Content>
              {/*<Content>{data.contents}</Content>*/}
            </TextContainer>
          </ContentContainer>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', width: WIDTH - 80 }}>
            <Row align="center">
              <CreatedAt style={{ fontSize: me?.setting?.ct_text_size as number }}>{createdAt}</CreatedAt>
              {!show ? (
                commentId !== '' && data._id !== commentId ? (
                  <></>
                ) : (
                  <Button
                    fontSize={13}
                    height={18}
                    label={t('post-detail.reply')}
                    textvariant={ButtonTextVariant.Text}
                    variant={ButtonVariant.TextBtn}
                    onPress={showInput}
                  />
                )
              ) : (
                <Button
                  fontSize={13}
                  height={18}
                  label={t('post-detail.close')}
                  textvariant={ButtonTextVariant.Text}
                  variant={ButtonVariant.TextBtn}
                  onPress={showInput}
                />
              )}
            </Row>
            <Pressable
              onTouchStart={() => {
                if (me?.id === data.item.user_id) {
                  openOptions3(true);
                } else {
                  openOptions1(true);
                }
              }}
              style={{ paddingEnd: data?.item.depth === 1 ? 40 : 0 }}
            >
              <More />
            </Pressable>
            {/*)}*/}
          </View>
        </FlexContainer>
      </Container>
      {show && <InputReComment me={me as User} onPress={handlePressPost} />}
      <Options
        onBackdropPress={setModal1Visible}
        hide={!!commentUser?.following}
        menu={COMMENT}
        modalVisible={modal1Visible}
        onMenuPress={handleMenuPress}
        onPress={openOptions1}
      />
      <Options
        onBackdropPress={setModal3Visible}
        menu={DELETE}
        modalVisible={modal3Visible}
        onMenuPress={handleMenuPress}
        onPress={openOptions3}
      />
      <Options
        menu={REPORT.menu}
        menuTitle={REPORT.title}
        modalVisible={modal2Visible}
        onMenuPress={handleReportPress}
        onPress={openOptions2}
      />
    </>
  );
};

export default Comment;
