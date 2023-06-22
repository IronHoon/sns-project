import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, SafeAreaView, ScrollView } from 'react-native';
import styled from 'styled-components';
import { KokKokId, NameInputs, ProfileImage, ProfileMsgInput, UserInfoInputs } from 'views/more/components';
import { Divider } from 'views/more/components/Divider';
import { useFetchWithType } from '../../../net/useFetch';
import SwrContainer from '../../../components/containers/SwrContainer';
import userAtom from '../../../stores/userAtom';
import { useSetAtom } from 'jotai';
import User from '../../../types/auth/User';
import BackHeader from '../../../components/molecules/BackHeader';
import { t } from 'i18next';
import { Button, ButtonTextVariant, ButtonVariant } from '../../../components/atoms/button/Button';
import { patch } from '../../../net/rest/api';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '../../../navigations/MainNavigator';
import LogUtil from '../../../utils/LogUtil';
import OfficialAccountInfo from '../components/OfficialAccountInfo';
import LogoutButton from '../components/LogoutButton';
import MainLayout from 'components/layouts/MainLayout';
import profileDetailUidAtom from 'stores/profileDetailUidAtom';
import ActivityAtom from '../../../stores/activityAtom';
import { useAtom, useAtomValue } from 'jotai';
import activityAtom from '../../../stores/activityAtom';

const Container = styled(SafeAreaView)`
  flex: 1;
`;

const EditProfile = () => {
  const navigation = useNavigation<MainNavigationProp>();
  const { data, error, mutate } = useFetchWithType<User>('/auth/me');
  const setMe = useSetAtom(userAtom);
  const setCurrentProfileUid = useSetAtom(profileDetailUidAtom);
  const [draft, setDraft] = useState<User>();
  const [emailUpdate, setEmailUpdate] = useState(false);
  const [emailActivity, setEmailActivity] = useAtom(activityAtom);

  console.log('emailActivity', emailActivity);

  const [isVisible, setIsVisible] = useState('');
  // LogUtil.info('EditProfile draft', draft);
  const hasDiff = useMemo(() => {
    if (!data) return false;
    if (!draft) return false;

    if (data.profile_image !== draft.profile_image) return true;
    if (data.profile_background !== draft.profile_background) return true;
    if (data.profile_message !== draft.profile_message) return true;
    if (data.first_name !== draft.first_name) return true;
    if (data.last_name !== draft.last_name) return true;
    if (data.uid !== draft.uid) return true;
    if (data.birth !== draft.birth) return true;
    if (data.contact !== draft.contact) return true;
    if (data.email !== draft.email) return true;

    return false;
  }, [data, draft]);

  const update = useCallback((field: string, value: any) => {
    console.log('field', field);
    console.log('value', value);
    // console.log('여기 들어옴?');
    //@ts-ignore
    setDraft((updateDraft) => ({
      ...updateDraft,
      [field]: value,
    }));

    console.log('Draftsetting', draft);
  }, []);

  const dateOfBirth = useMemo(() => {
    if (draft?.birth) {
      const birthDate = new Date(draft?.birth);
      const year = birthDate.getFullYear();
      const month = birthDate.getMonth() + 1;
      const day = birthDate.getDate();
      return `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
    } else {
      return '';
    }
  }, [draft?.birth]);

  const submit = useCallback(() => {
    setEmailActivity(false);
    // LogUtil.info('submit draft ', draft);
    if (!draft) return;
    //@ts-ignore
    if (draft && draft.profile_message?.length > 151) {
      Alert.alert('Error', 'Profile message Maximum 150 characters limit');
      return;
    }
    if (draft && (draft.first_name.length > 17 || draft.last_name.length > 17)) {
      Alert.alert('Error', 'Name Maximum 16 characters limit');
      return;
    }
    if (draft && (draft.first_name === '' || draft.last_name === '')) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    patch('/auth/me', {
      profile_image: draft.profile_image,
      profile_background: draft.profile_background,
      first_name: draft.first_name,
      last_name: draft.last_name,
      uid: draft.uid,
      profile_message: draft.profile_message,
      birth: dateOfBirth,
      contact: draft.contact,
      email: draft.email,
    })
      .then(() => mutate())
      .then(() => navigation.goBack())
      .catch((patchError) => {
        LogUtil.error(`[patch] /auth/me fail : ${patchError}`);
        const message = patchError.response?.data?.message;
        if (message) {
          if (message === '아이디는 필수값입니다.') {
            Alert.alert('Error', t('common.ID is required'));
          } else if (message === 'ID can only use letters, numbers, underscores and periods.') {
            Alert.alert('Error', t('common.ID can only use letters, numbers, underscores and periods'));
          } else {
            Alert.alert('Error', message);
            LogUtil.info(message);
          }
        }
      });
  }, [draft, mutate, navigation]);

  useEffect(() => {
    if (data) {
      setMe(data);
      setCurrentProfileUid(data.uid);
      setDraft(data);
    }
  }, [data, setMe]);

  useFocusEffect(
    useCallback(() => {
      if (emailActivity) {
        console.log('mutate active');
        mutate();
      }
    }, [data, mutate]),
  );

  return (
    <MainLayout>
      <BackHeader
        title={t('profile-edit.Profile Edit')}
        border={false}
        button={[
          <Button
            key="button"
            fontSize={14}
            grayText
            label={t('profile-edit.Done')}
            textvariant={hasDiff ? ButtonTextVariant.PrimaryText : ButtonTextVariant.Text}
            variant={ButtonVariant.TextBtn}
            onPress={submit}
          />,
        ]}
      />
      <Container>
        <ScrollView>
          <SwrContainer data={data} error={error}>
            {data && (
              <>
                <ProfileImage draft={draft} update={update} />
                <NameInputs user={data} update={update} />
                <KokKokId user={data} update={update} />
                <Divider />
                <ProfileMsgInput user={data} update={update} />
                <Divider />
                <UserInfoInputs user={data} update={update} draft={draft} hasDiff={hasDiff} />
                <Divider />
                <OfficialAccountInfo user={data} />
                <LogoutButton />
              </>
            )}
          </SwrContainer>
        </ScrollView>
      </Container>
    </MainLayout>
  );
};

export default EditProfile;
