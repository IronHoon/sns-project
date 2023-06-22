import React, { useCallback, useContext } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled, { ThemeContext } from 'styled-components/native';
import { Column } from 'components/layouts/Column';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import { Center } from 'components/layouts/Center';
import Space from 'components/utils/Space';
import { Row } from 'components/layouts/Row';
import AddIcon from 'assets/add.svg';
import WhiteAddIcon from 'assets/add-white.svg';
import { useFetchWithType } from '../../../../net/useFetch';
import SwrContainer from '../../../../components/containers/SwrContainer';
import ExceptList from '../../../../types/userSetting/ExceptList';
import { remove } from '../../../../net/rest/api';
// import Avatar from '../../../../components/atoms/image/Avatar';
import { t } from 'i18next';
import { COLOR } from 'constants/COLOR';
import User from 'types/auth/User';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import { Avatar } from 'components/atoms/image';

const Icon = styled.Image`
  width: 52px;
  height: 52px;
`;
const Text = styled.Text`
  font-size: 18px;
  font-weight: 500;
  padding-top: 15px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const Description = styled.Text`
  text-align: center;
  padding-top: 10px;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
`;
const ContactContainer = styled.ScrollView`
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
const DescText = styled(Text)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const exceptList = [
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

const sortedList = exceptList.sort((a, b) => {
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

function Except() {
  const navigation = useNavigation<MainNavigationProp>();
  const themeContext = useContext(ThemeContext);
  //@ts-ignore
  const { params } = useRoute();
  //@ts-ignore
  const routeName = params?.route ?? 'post';
  //@ts-ignore
  const privateEnabled = params.private;
  const { data, error, mutate } = useFetchWithType<ExceptList>(`/auth/user-setting/${routeName}/except`);
  const myUser: User | null = useAtomValue(userAtom);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await mutate();
      })();
    }, [mutate]),
  );

  return (
    <MainLayout>
      <BackHeader title={t('privacy.Except from2')} />
      <Column style={{ alignItems: 'center', padding: 20 }}>
        <Button
          label={t('privacy.Except from2')}
          onPress={() =>
            navigation.navigate('/more/settings/privacy-and-security/kokkokme/privacy-settings/except/add-except', {
              route: routeName,
              private: privateEnabled,
            })
          }
          width="100%"
          // height="52"
          fontSize={myUser?.setting?.ct_text_size as number}
          borderRadius
          variant={ButtonVariant.Outlined}
          textvariant={ButtonTextVariant.OutlinedText}
          blacklined={!themeContext.dark}
          whitelined={themeContext.dark}
          blacklinedText={!themeContext.dark}
          whitelinedText={themeContext.dark}
        >
          {themeContext.dark ? <WhiteAddIcon width={14} height={14} /> : <AddIcon width={14} height={14} />}
        </Button>
      </Column>
      <SwrContainer data={data} error={error}>
        {data?.length !== 0 ? (
          <ContactContainer>
            {data?.map((user, index) => (
              <Row key={index} style={{ alignItems: 'center', marginBottom: 20 }}>
                <ProfileImageBox>
                  <Avatar size={40} src={user.exceptUser.profile_image} />
                </ProfileImageBox>
                <Column style={{ flex: 1 }}>
                  <NameText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                    {user.exceptUser.first_name}
                    {user.exceptUser.last_name}
                  </NameText>
                  <IDText
                    style={{ fontSize: myUser?.setting?.ct_text_size as number }}
                  >{`@${user.exceptUser.uid}`}</IDText>
                </Column>
                <Button
                  label={t('privacy.Include')}
                  width={75}
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
                    remove(`auth/user-setting/${routeName}/except/${user.exceptUser.id}`).then(() => {
                      console.log('성공');
                      mutate();
                    });
                  }}
                />
              </Row>
            ))}
          </ContactContainer>
        ) : (
          <>
            <Space height={60} />
            <Center>
              <Icon source={require('../../../../assets/ic-nocontract.png')} />
              <DescText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                {t('privacy.No users have been excepted')}
              </DescText>
              <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                {t('privacy.Friends excepted cannot see your activities on Kok Kok Me')}
              </Description>
            </Center>
          </>
        )}
      </SwrContainer>
    </MainLayout>
  );
}

export default Except;
