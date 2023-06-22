import React, { useContext } from 'react';
import { Dimensions, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components';

import { Avatar } from 'components/atoms/image';
import { Column } from 'components/layouts/Column';
import { Row } from 'components/layouts/Row';
import { COLOR } from 'constants/COLOR';
import { MainNavigationProp } from 'navigations/MainNavigator';
import User from '../../../../types/auth/User';
import { ThemeContext } from 'styled-components/native';
import LogUtil from '../../../../utils/LogUtil';

interface Props {
  user: User;
}

const Container = styled(Row)``;
const TextContainer = styled(Column)`
  margin-left: 10px;
  width: ${`${Dimensions.get('window').width - 200}px`};
`;

const UserName = styled(Text)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: 18px;
  /* height: 22px; */
  font-weight: bold;
  /* text-overflow: ellipsis; */
`;
const KokKokName = styled(Text)`
  color: ${COLOR.TEXT_LIGHT_GRAY};
  font-size: 13px;
`;

const UserInfo = ({ user }: Props) => {
  const { id, uid, contact } = user;
  const navigation = useNavigation<MainNavigationProp>();

  const handlePress = () => navigation.navigate('/kokkokme/user-timeline/:id', { id, uid, contact });
  // LogUtil.info('user', user);
  return (
    <Container align="center">
      <TouchableOpacity onPress={handlePress}>
        <Avatar src={user.profile_image} />
      </TouchableOpacity>
      <TextContainer justify="flex-start">
        <UserName numberOfLines={1} style={{ fontSize: user?.setting?.ct_text_size as number, width: '100%' }}>
          {user.first_name} {user.last_name}
        </UserName>
        <KokKokName numberOfLines={1} style={{ fontSize: user?.setting?.ct_text_size as number }}>
          @{user.uid}
        </KokKokName>
      </TextContainer>
    </Container>
  );
};

export default UserInfo;
