import React, { useCallback, useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import styled from 'styled-components';

import { Notification } from 'views/kokkokme/components/activity';
import useFetch, { useFetchWithType } from 'net/useFetch';
import SwrContainer from 'components/containers/SwrContainer';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import NoActivity from './components/activity/NoActivity';
import { IActivities, IActivityDocs } from '../../types/socials';
import { MainNavigationProp } from '../../navigations/MainNavigator';
import { patch } from '../../net/rest/api';
import { useAtomValue, useSetAtom } from 'jotai';
import profileDetailUidAtom from 'stores/profileDetailUidAtom';
import User from 'types/auth/User';
import userAtom from 'stores/userAtom';

const Container = styled(FlatList)`
  padding: 0 20px;
`;

interface UserInfo {
  id: number;
  uid: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_background: string;
  profile_message: string;
  birth: Date;
  recently_used_at: Date;
  video_able: boolean;
  call_able: boolean;
  contact: string;
  official_account: boolean;
  profile_image: string;
  remember_me_token?: string;
  created_at: Date;
  updated_at: Date;
}
const Activity = () => {
  const me: User | null = useAtomValue(userAtom);
  const setCurrentProfileUid = useSetAtom(profileDetailUidAtom);
  const [showModal, setShowModal] = useState(false);
  const navigation = useNavigation<MainNavigationProp>();
  const {
    data: activityData,
    error: activityError,
    mutate: activityMutate,
  } = useFetchWithType<IActivities>('/socials/notis?page=1&limit=50');
  const [activity, setActivity] = useState<Array<IActivityDocs>>();
  useFocusEffect(
    useCallback(() => {
      if (activityData) {
        setActivity(activityData.docs);
      }
    }, [activityData]),
  );

  useFocusEffect(
    useCallback(() => {
      patch('/socials/notis', {}).then(() => {
        activityMutate();
      });
    }, []),
  );

  useEffect(() => {
    activityMutate();
  }, [activity]);

  const [userInfo, setUserInfo] = useState<UserInfo>();
  const showProfile = (data: any) => {
    setShowModal(true);
    setCurrentProfileUid(data.user_info.uid);
    navigation.navigate('/profile-detail');
    setUserInfo(data.user_info);
  };

  return (
    <>
      <SwrContainer data={activityData} error={activityError}>
        {activity?.length === 0 ? (
          <NoActivity me={me as User} />
        ) : (
          <Container
            data={activity}
            renderItem={({ item }) => (
              <Notification me={me as User} data={item} onPress={showProfile} activityMutate={activityMutate} />
            )}
          />
        )}
      </SwrContainer>
      {/*{showModal && <Profile data={userInfo} isVisible={showModal} onCloseModal={() => setShowModal(false)} />}*/}
    </>
  );
};

export default Activity;
