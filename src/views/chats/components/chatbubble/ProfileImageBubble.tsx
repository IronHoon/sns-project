import React from 'react';
import { Column } from '../../../../components/layouts/Column';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '../../../../navigations/MainNavigator';

const ProfilesImageBox = styled.View`
  width: 30px;
  height: 30px;
  border-radius: 70px;
  overflow: hidden;
  margin-left: 12px;
  margin-right: 8px;
`;

const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`;

const ProfileImageBubble = ({ isSystemAccount, setCurrentProfileUid, uid, profileImage }) => {
  const navigation = useNavigation<MainNavigationProp>();
  return (
    <Column justify="flex-start" style={{ height: '100%' }}>
      <ProfilesImageBox
        onTouchStart={() => {
          if (isSystemAccount) {
            return;
          }
          setCurrentProfileUid(uid);
          navigation.navigate('/profile-detail');
        }}
      >
        <ProfileImage
          source={profileImage === null ? require('assets/img-profile.png') : { uri: profileImage + '?w=200&h=200' }}
        />
      </ProfilesImageBox>
    </Column>
  );
};

export default React.memo(ProfileImageBubble);
