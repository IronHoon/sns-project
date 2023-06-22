import React, { useMemo } from 'react';
import { Text, Pressable } from 'react-native';
import Highlighter from 'react-native-highlight-words';
import styled from 'styled-components';

import { Avatar } from 'components/atoms/image';
import { Row } from 'components/layouts/Row';
import { Column } from 'components/layouts/Column';
import { COLOR } from 'constants/COLOR';

import Official from 'assets/kokkokme/ic-official.svg';
import { useAtomValue } from 'jotai';
import friendListAtom from 'stores/friendListAtom';
import Nullable from 'types/_common/Nullable';
import User from 'types/auth/User';
import userAtom from 'stores/userAtom';

const Container = styled(Pressable)<{ pressed?: boolean }>`
  background-color: ${({ theme }) => (theme.dark ? '#585858' : '#fff')};
  display: flex;
  flex-direction: row;
  padding: 10px 20px;
  align-items: center;
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
  data: any;
  searchValue: string;
  onPress: (data: any) => void;
}

const TagSearching = ({ data, searchValue, onPress }: Props) => {
  //나를 추가한 유저 리스트
  const addedMeList = useAtomValue(friendListAtom);
  const isAddedMe = addedMeList?.includes(data.id);
  const me: Nullable<User> = useAtomValue(userAtom);
  const isMe = me?.id === data.id;

  const profile_image = useMemo(() => {
    if (data.sc_profile_photo === 'public' || (data.sc_profile_photo === 'friends' && isAddedMe) || isMe) {
      return data.profile_image;
    } else {
      return '';
    }
  }, [data]);

  return (
    <Container
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? '#fcf2e8' : 'transparent',
        },
      ]}
      onPress={() => onPress(data)}
    >
      <Avatar size={40} src={profile_image} />
      <TextContainer justify="flex-start">
        <Row fullWidth>
          <Name
            style={{ fontSize: me?.setting?.ct_text_size as number, color: COLOR.BLACK }}
          >{`${data.first_name} ${data.last_name}`}</Name>
          {!!data.official_account && <Official />}
        </Row>
        <KokkokName style={{ fontSize: me?.setting?.ct_text_size as number, color: COLOR.TEXT_GRAY }}>
          @{data.uid}
        </KokkokName>
      </TextContainer>
    </Container>
  );
};

export default TagSearching;
