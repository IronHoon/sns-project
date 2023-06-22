import React, { useContext } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled, { ThemeContext } from 'styled-components/native';
import { Column } from 'components/layouts/Column';
import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import { Center } from 'components/layouts/Center';
import Space from 'components/utils/Space';
import { Row } from 'components/layouts/Row';
import { ScrollView } from 'react-native';
import { useFetchWithType } from '../../../../net/useFetch';
import SwrContainer from '../../../../components/containers/SwrContainer';
import HiddenList from '../../../../types/userSetting/HiddenList';
// import Avatar from '../../../../components/atoms/image/Avatar';
import { patch } from '../../../../net/rest/api';
import i18next, { t } from 'i18next';
import { Avatar } from 'components/atoms/image';
import User from 'types/auth/User';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';

const Icon = styled.Image`
  width: 52px;
  height: 52px;
`;
const Description = styled.Text`
  font-size: 13px;
  padding-top: 10px;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
`;
const ContactContainer = styled.View`
  flex: 1;
  padding: 20px;
`;
const ProfileImageBox = styled.View`
  width: 40px;
  /* height: 40px; */
  border-radius: 70px;
  overflow: hidden;
  margin-right: 15px;
`;
const ProfileImage = styled.Image`
  width: 100%;
  height: 100%;
`;
const NameText = styled.Text`
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
  font-size: 15px;
  font-weight: 500;
`;
const IDText = styled.Text`
  color: #999999;
  font-size: 13px;
`;
const userList = [
  {
    img: require('../../../../assets/cat1.jpg'),
    name: 'Aaysone',
    id: 'lorem',
  },
  {
    img: require('../../../../assets/cat2.jpg'),
    name: 'Alice',
    id: 'lorem',
  },
  {
    img: require('../../../../assets/cat3.jpg'),
    name: 'Ann',
    id: 'lorem',
  },
];

const sortedList = userList.sort((a, b) => {
  //@ts-ignore
  let x = a.name.toLowerCase();
  //@ts-ignore
  let y = b.name.toLowerCase();
  if (x < y) {
    return -1;
  }
  if (x > y) {
    return 1;
  }
  return 0;
});

function HideAllActivities() {
  const lan = i18next.language;
  const themeContext = useContext(ThemeContext);
  const { data, error, mutate } = useFetchWithType<HiddenList>('/socials/follows/following/hidden?page=1&limit=10');
  const myUser: User | null = useAtomValue(userAtom);

  return (
    <MainLayout>
      <BackHeader title={t('privacy.Hide all activities')} />
      <SwrContainer data={data} error={error}>
        {data?.items?.length !== 0 ? (
          <ContactContainer>
            <ScrollView>
              {data?.items?.map((user, index) => (
                <Row key={index} style={{ alignItems: 'center', marginBottom: 20 }}>
                  <Avatar size={40} src={user.hidden_user.profile_image} />
                  <Space width={10} />
                  <Column style={{ flex: 1 }}>
                    <NameText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                      {user.hidden_user.first_name} {user.hidden_user.last_name}
                    </NameText>
                    <IDText
                      style={{ fontSize: myUser?.setting?.ct_text_size as number }}
                    >{`@${user.hidden_user.uid}`}</IDText>
                  </Column>
                  <Button
                    label={t('privacy.Show all activites')}
                    width={lan == 'lo' ? 150 : 130}
                    height={35}
                    borderRadius
                    fontSize={13}
                    fontWeight={400}
                    variant={ButtonVariant.Outlined}
                    textvariant={ButtonTextVariant.OutlinedText}
                    blacklined={!themeContext.dark}
                    whitelined={themeContext.dark}
                    blacklinedText={!themeContext.dark}
                    whitelinedText={themeContext.dark}
                    onPress={() => {
                      patch(`/socials/follows/following/${user.hidden_user.id}/hidden`, {}).then(async () => {
                        await mutate();
                        console.log('성공');
                      });
                    }}
                  />
                </Row>
              ))}
            </ScrollView>
            <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
              {t(
                'privacy.You can only manage users that all activities are hidden on this page. To hide some users’ activities is',
              )}
            </Description>
          </ContactContainer>
        ) : (
          <>
            <Space height={60} />
            <Center>
              <Icon source={require('../../../../assets/ic-nocontract.png')} />
              <Space height={10} />
              <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                {t('privacy.There are no hidden activities')}
              </Description>
            </Center>
          </>
        )}
      </SwrContainer>
    </MainLayout>
  );
}

export default HideAllActivities;
