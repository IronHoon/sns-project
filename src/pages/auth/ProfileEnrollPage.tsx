import React from 'react';
import Screen from '../../components/containers/Screen';
import H1 from '../../components/atoms/H1';
import { KeyboardAvoidingView, Platform } from 'react-native';
import tw from 'twrnc';
import BackHeader from '../../components/molecules/BackHeader';
import ProfileEnroll from 'views/auth/ProfileEnroll';
import { useTranslation } from 'react-i18next';

function ProfileEnrollPage() {
  const { t } = useTranslation();
  return (
    <Screen>
      <BackHeader title={t('Profile Info.Profile Info')} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw.style(`flex-1 justify-center items-center`)}
      >
        <ProfileEnroll />
      </KeyboardAvoidingView>
    </Screen>
  );
}

export default ProfileEnrollPage;
