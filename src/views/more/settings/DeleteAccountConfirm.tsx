import React from 'react';
import styled from 'styled-components/native';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import { COLOR } from 'constants/COLOR';
import { Avatar } from 'components/atoms/image';
import AuthUtil from 'utils/AuthUtil';
import { getUniqueId } from 'react-native-device-info';

const MainLayout = styled.View`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const Title = styled.Text`
  font-size: 16px;
  color: black;
  font-weight: bold;
  color: ${(props) => (props.theme.dark ? props.theme.colors.WHITE : props.theme.colors.BLACK)};
`;
const Desc = styled.Text`
  font-size: 14px;
  color: #a0a0a0;
  margin-bottom: 30px;
`;

const NameContainer = styled.View`
  height: auto;
  justify-content: center;
  margin-top: 12px;
  margin-bottom: 3px;
`;
const Name = styled.View`
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
`;
const NameText = styled.Text`
  font-size: 22px;
  font-weight: 500;
  margin: 5px;
  color: ${(props) => (props.theme.dark ? props.theme.colors.WHITE : props.theme.colors.BLACK)};
  line-height: 22;
`;

const Uid = styled.Text`
  margin-bottom: 7px;
`;

const PhoneNumber = styled.Text`
  margin-bottom: 30px;
`;

const SignText = styled.Text`
  color: ${COLOR.PRIMARY};
  text-decoration: underline;
`;
function DeleteAccount() {
  const user = useAtomValue(userAtom);
  // const [inputId, setInputId] = useState<string>('');
  const navigation = useNavigation<MainNavigationProp>();
  return (
    <MainLayout>
      <Title>Your account is Deleted.</Title>
      <Desc>We look forward to coming back with better service.</Desc>
      <Avatar src={user?.profile_image} size={120} />

      <NameContainer>
        <Name>
          {`${user?.first_name} ${user?.last_name !== null && user?.last_name} `.split(' ').map((word) => (
            <NameText>{word}</NameText>
          ))}
        </Name>
      </NameContainer>
      <Uid>@{user?.uid ?? ''}</Uid>
      <PhoneNumber>{user?.contact}</PhoneNumber>
      <Desc style={{ marginBottom: 5 }}>Are you going to create a new account?</Desc>
      <SignText
        onPress={() => {
          AuthUtil.logout(getUniqueId()).then(async () => {
            navigation.popToTop();
            navigation.replace('/landing');
          });
        }}
      >
        sign in here
      </SignText>
    </MainLayout>
  );
}

export default DeleteAccount;
