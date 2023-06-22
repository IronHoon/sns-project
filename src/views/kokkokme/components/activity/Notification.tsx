import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import styled from 'styled-components';

import { Avatar } from 'components/atoms/image';
import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';
import { RADIUS } from 'constants/RADIUS';
import { patch, remove } from 'net/rest/api';
import { getTimeDiffShort } from 'utils';
import Buttons from 'views/kokkokme/components/activity/Buttons';
import { t } from 'i18next';
import { MainNavigationProp } from '../../../../navigations/MainNavigator';
import { WIDTH } from 'constants/WIDTH';
import { useAtomValue } from 'jotai';
import friendListAtom from 'stores/friendListAtom';
import User from 'types/auth/User';

const Container = styled(Row)`
  padding-top: 20px;
  /* height: 60px; */
  flex-wrap: wrap;
  width: 100%;
`;
const ButtonWrap = styled(View)`
  /* padding-right: 25px; */
`;
const TextContainer = styled(Row)<{ isMultiLined?: boolean; isMulti?: boolean }>`
  margin-left: 10px;
  flex-wrap: wrap;
  padding: 5px 0;
  width: ${WIDTH - 120}px;

  ${({ isMultiLined }) => (isMultiLined ? 'flex-wrap: wrap; max-width: 150px;' : '')}
  ${({ isMulti }) => (isMulti ? 'flex-wrap: wrap; max-width: 190px;' : '')}
`;
const ResultContainer = styled(View)`
  align-items: center;
  border: 1px solid ${COLOR.GRAY};
  border-radius: ${RADIUS.SM}px;
  height: 30px;
  justify-content: center;
  padding: 0 5px;
`;

const Name = styled(Text)`
  flex-wrap: wrap;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: 13px;
  font-weight: bold;
`;
const Message = styled(Text)<{ isMultiLined?: boolean }>`
  color: ${({ theme }) => (theme.dark ? COLOR.DARK_GRAY : COLOR.BLACK)};
  font-size: 13px;
  margin-left: ${({ isMultiLined }) => (isMultiLined ? 0 : 5)}px;
  max-width: 190px;
`;
const Time = styled(Text)`
  color: #aaa;
  font-size: 12px;
  margin-left: 5px;
`;
const Result = styled(Text)`
  color: ${COLOR.TEXT_GRAY};
  font-size: 13px;
  font-weight: 500;
`;

const ActivityRow = styled(View)`
  width: ${WIDTH - 200}px;
  flex-direction: row;
  align-items: center;
`;

interface Props {
  me: User;
  data: any;
  onPress: (data: any) => void;
  activityMutate: () => void;
}

const Notification = ({ me, data, onPress, activityMutate }: Props) => {
  const { created_at, type, target_id, target_user_id } = data;
  const { id, profile_image, first_name, last_name, uid, contact, sc_profile_photo } = data.user_info;
  const addedMeList = useAtomValue(friendListAtom);
  const [convertedDate, setConvertedDate] = useState<string>();
  const navigation = useNavigation<MainNavigationProp>();
  const fullName = first_name + ' ' + last_name;

  useFocusEffect(
    useCallback(() => {
      setConvertedDate(getTimeDiffShort(created_at));
    }, [created_at]),
  );

  const onPressAccept = () => {
    // TODO: 팔로우 승인 동작 여부 확인 필요
    patch(`/socials/follows/${id}/accept`, {}).then(() => {
      console.log('승인');
    });
    activityMutate();
  };

  const onPressDeny = () => {
    remove(`/socials/follows/${id}/denied`).then(() => {
      console.log('거절');
    });
    activityMutate();
  };

  const profileImageSetting = () => {
    if (sc_profile_photo === 'private') {
      console.log('sc_profile_photo private', sc_profile_photo);
      return '' as string;
    }

    if (sc_profile_photo === 'friends') {
      const isAddedMe = addedMeList?.includes(id);
      console.log('sc_profile_photo friends', sc_profile_photo);
      if (isAddedMe) {
        console.log('sc_profile_photo isAddedMe true', sc_profile_photo);
        return profile_image as string;
      } else {
        return '' as string;
      }
    }
    return profile_image as string;
  };
  useEffect(() => {
    profileImageSetting();
    activityMutate();
  }, [sc_profile_photo]);

  return (
    <Container align="center" justify="space-between">
      <ActivityRow>
        <TouchableOpacity onPress={() => onPress(data)}>
          <Avatar src={profileImageSetting()} />
        </TouchableOpacity>
        <Pressable
          onPress={() => {
            if (type === 'like') {
              navigation.navigate('/kokkokme/:id', { id: target_id });
            } else if (type === 'comment') {
              navigation.navigate('/kokkokme/:id', { id: target_id });
            } else if (type === 'tag') {
              navigation.navigate('/kokkokme/:id', { id: target_id });
            } else if (type === 'applyfollow') {
              navigation.navigate('/kokkokme/user-timeline/:id', { id: id, uid: uid, contact: contact });
            } else if (type === 'denie') {
              navigation.navigate('/kokkokme/user-timeline/:id', { id: id, uid: uid, contact: contact });
            } else if (type === 'accept') {
              navigation.navigate('/kokkokme/user-timeline/:id', { id: id, uid: uid, contact: contact });
            } else if (type === 'follow') {
              navigation.navigate('/kokkokme/user-timeline/:id', { id: id, uid: uid, contact: contact });
            } else if (type === 'acceptfollow') {
              navigation.navigate('/kokkokme/user-timeline/:id', { id: id, uid: uid, contact: contact });
            }
          }}
        >
          <TextContainer isMultiLined={type === 'applyfollow'} isMulti={type === 'accept' || type === 'denie'}>
            <Name style={{ fontSize: me?.setting?.ct_text_size as number }}>
              {fullName.length > 20 ? fullName.substring(0, 17) + '...' : fullName}
            </Name>
            {type === 'like' && (
              <Message style={{ fontSize: me?.setting?.ct_text_size as number }}>
                {t('activity.liked your post')}
              </Message>
            )}
            {type === 'comment' && (
              <Message style={{ fontSize: me?.setting?.ct_text_size as number }}>
                {t('activity.commented on your post')}
              </Message>
            )}
            {type === 'applyfollow' && (
              <Message style={{ fontSize: me?.setting?.ct_text_size as number }} isMultiLined={true}>
                {t('activity.requested to follow you')}
              </Message>
            )}
            {type === 'accept' && (
              <Message style={{ fontSize: me?.setting?.ct_text_size as number }}>
                {t('activity.request to follow has been accepted')}
              </Message>
            )}
            {type === 'follow' && (
              <Message style={{ fontSize: me?.setting?.ct_text_size as number }}>
                {t('activity.started following you')}
              </Message>
            )}
            {type === 'denie' && (
              <Message style={{ fontSize: me?.setting?.ct_text_size as number }}>
                {t('activity.request to follow has been denied')}
              </Message>
            )}
            {type === 'tag' && (
              <Message style={{ fontSize: me?.setting?.ct_text_size as number }}>
                {t('activity.tagged you on a post')}
              </Message>
            )}
            {type === 'acceptfollow' && (
              <Message style={{ fontSize: me?.setting?.ct_text_size as number }}>
                {' '}
                {t('activity.accepted your follow request')}
              </Message>
            )}
          </TextContainer>
        </Pressable>
        <Time style={{ fontSize: me?.setting?.ct_text_size as number }}>{convertedDate}</Time>
      </ActivityRow>

      <ButtonWrap>
        {type === 'applyfollow' && <Buttons onPressAccept={onPressAccept} onPressDeny={onPressDeny} />}
        {type === 'accept' && (
          <ResultContainer>
            <Result> {t('activity.Accepted')}</Result>
          </ResultContainer>
        )}
        {type === 'denie' && (
          <ResultContainer>
            <Result>{t('activity.Denied')}</Result>
          </ResultContainer>
        )}
      </ButtonWrap>
    </Container>
  );
};

export default Notification;
