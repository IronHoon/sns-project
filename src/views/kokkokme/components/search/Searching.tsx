import React, { useCallback, useState } from 'react';
import { Text } from 'react-native';
import Highlighter from 'react-native-highlight-words';
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components';

import { Avatar } from 'components/atoms/image';
import { Row } from 'components/layouts/Row';
import { Column } from 'components/layouts/Column';
import { COLOR } from 'constants/COLOR';
import User from 'types/auth/User';

import Official from 'assets/kokkokme/ic-official.svg';
import { useAtomValue } from 'jotai';
import userAtom from '../../../../stores/userAtom';
import friendListAtom from '../../../../stores/friendListAtom';

const Container = styled(Row)`
  padding: 10px 20px;
`;
const TextContainer = styled(Column)`
  margin-left: 16px;
`;

const Name = styled(Text)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  font-size: 15px;
  font-weight: 500;
  margin-right: 5px;
`;
const KokkokName = styled(Text)`
  color: ${COLOR.TEXT_LIGHT_GRAY};
  font-size: 13px;
`;

interface Props {
  data: Partial<User>;
  searchValue: string;
}

const Searching = ({ data, searchValue }: Props) => {
  const [fullName, setFullName] = useState('');
  const myUser: User | null = useAtomValue(userAtom);

  const isMe = data?.id === myUser?.id;
  const [profileImage, setProfileImage] = useState('');
  const friendList = useAtomValue(friendListAtom);

  useFocusEffect(
    useCallback(() => {
      const isFriend = friendList?.filter((item) => item === data?.id).length === 1;
      if (!isMe) {
        if (data?.sc_profile_photo === 'friends' && isFriend) {
          if (data?.profile_image === null || data?.profile_image === '') {
            setProfileImage('');
          } else if (data?.profile_image) {
            //@ts-ignore
            setProfileImage(data?.profile_image);
          }
        } else if (data?.sc_profile_photo === 'public') {
          if (data?.profile_image === null || data?.profile_image === '') {
            setProfileImage('');
          } else if (data?.profile_image) {
            //@ts-ignore
            setProfileImage(data?.profile_image);
          }
        } else {
          setProfileImage('');
        }
      } else {
        if (data?.profile_image) {
          //@ts-ignore
          setProfileImage(data?.profile_image);
        } else {
          setProfileImage('');
        }
      }
    }, []),
  );
  useFocusEffect(
    useCallback(() => {
      setFullName(`${data.first_name} ${data.last_name}`);
    }, [data]),
  );

  return (
    <Container fullWidth>
      <Avatar size={40} src={profileImage} />
      <TextContainer>
        <Row fullWidth>
          <Name>
            <Highlighter
              highlightStyle={{ color: COLOR.PRIMARY }}
              searchWords={[`${searchValue}`]}
              textToHighlight={fullName ?? ''}
            />
          </Name>
          {!!data.official_account && <Official />}
        </Row>
        <KokkokName>
          <Highlighter
            highlightStyle={{ color: COLOR.PRIMARY }}
            searchWords={[`${searchValue}`]}
            textToHighlight={data.uid ?? ''}
          />
        </KokkokName>
      </TextContainer>
    </Container>
  );
};

export default Searching;
