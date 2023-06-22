import { Avatar } from 'components/atoms/image';
import Space from 'components/utils/Space';
import { COLOR } from 'constants/COLOR';
import React from 'react';
import { Pressable, View } from 'react-native';
import styled from 'styled-components/native';
import StarButton from '../StarButton';

const Container = styled.View`
  flex-direction: row;
  position: relative;
`;
const NameWrap = styled.View`
  flex-direction: row;
  align-items: center;
`;
const Name = styled.Text`
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  margin-bottom: 3px;
`;
const Sub = styled.Text`
  font-size: 12px;
  font-weight: normal;
  color: #cecece;
  padding-left: 6px;
`;
const UserId = styled.Text`
  font-size: 13px;
  font-weight: normal;
  color: #bcb3c5;
`;
const ButtonWrap = styled.View<Props>`
  flex-direction: row;
  align-items: center;
  position: absolute;
  right: 0;
  ${({ topButton }) => (topButton ? 'top: 3px' : 'top: 50%')};
  transform: translateY(-6px);
`;
const ButtonSubText = styled.Text`
  font-size: 12px;
  font-weight: normal;
  color: #bbb;
  margin-left: 3px;
`;
const Icon = styled.Image`
  width: 22px;
  height: 22px;
  tint-color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;

type Props = {
  iconSize?: number;
  location?: boolean;
  topButton?: boolean;
  count?: number;
  leftLocation?: boolean;
};
const UserListItem = ({ iconSize = 46, location, topButton, count, leftLocation }: Props) => {
  //TODO : 데이터연결후 삭제
  const user = {
    first_name: 'kok',
    last_name: 'ooo',
    uid: 'leeeee',
  };

  return (
    <Container>
      <Avatar size={iconSize} src={'' || ''} />
      <Space width={10} />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <NameWrap>
          <Name numberOfLines={1}>{`${user?.first_name} ${user?.last_name}`}</Name>
          {leftLocation ? <></> : location ? <Sub>location</Sub> : <Sub>Last chat 1d</Sub>}
        </NameWrap>
        <UserId>@{user?.uid}</UserId>
      </View>

      <ButtonWrap topButton={topButton}>
        {topButton ? (
          <>
            <StarButton starSize={20} disabled={true} count={count} />
          </>
        ) : (
          <>
            <ButtonSubText>All</ButtonSubText>
            {leftLocation ? (
              <></>
            ) : (
              <Pressable onPress={() => {}}>
                <Icon source={require('/assets/ic-next.png')} />
              </Pressable>
            )}
          </>
        )}
      </ButtonWrap>
    </Container>
  );
};

export default UserListItem;
