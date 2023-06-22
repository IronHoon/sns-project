import React, { useCallback, useContext } from 'react';
import BackHeader from '../../../../components/molecules/BackHeader';
import MainLayout from 'components/layouts/MainLayout';
import styled, { ThemeContext } from 'styled-components/native';
import { Column } from 'components/layouts/Column';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from 'navigations/MainNavigator';
import { Button, ButtonTextVariant, ButtonVariant } from 'components/atoms/button/Button';
import { Center } from 'components/layouts/Center';
import Space from 'components/utils/Space';
import { Row } from 'components/layouts/Row';
import { ScrollView, View } from 'react-native';
import AddIcon from '../../../../assets/add.svg';
import WhiteAddIcon from '../../../../assets/add-white.svg';
import { useFetchWithType } from '../../../../net/useFetch';
import SwrContainer from '../../../../components/containers/SwrContainer';
import BlockList from '../../../../types/blocks/BlockList';
import { remove } from '../../../../net/rest/api';
import { t } from 'i18next';
import { COLOR } from 'constants/COLOR';
import { useAtomValue } from 'jotai';
import friendListAtom from 'stores/friendListAtom';
import { Avatar } from 'components/atoms/image';
import User from 'types/auth/User';
import userAtom from 'stores/userAtom';

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
const BlockTextBox = styled.View`
  background-color: ${(props) => (props.theme.dark ? '#69686a' : '#f8f8f8')};
  padding: 20px;
  border-radius: 10px;
`;
const BlockLabel = styled.Text`
  font-size: 13px;
  color: ${(props) => (props.theme.dark ? '#ffffff' : '#000000')};
`;
const BlockDescription = styled.Text`
  font-size: 12px;
  padding-top: 10px;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
`;
const Description = styled.Text`
  font-size: 12px;
  text-align: center;
  padding-top: 20px;
  padding-bottom: 5px;
  /* line-height: 18px; */
  color: #999999;
`;
const ContactContainer = styled.ScrollView`
  padding: 20px;
`;
const ProfileImageBox = styled.View`
  width: 40px;
  height: 40px;
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

const blockedList = [
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

const sortedList = blockedList.sort((a, b) => {
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

function BlockedUsers() {
  const navigation = useNavigation<MainNavigationProp>();
  const themeContext = useContext(ThemeContext);
  const { data: blockData, error: blockError, mutate: blockMutate } = useFetchWithType<BlockList>('auth/block');
  const myUser: User | null = useAtomValue(userAtom);
  const addedMeList = useAtomValue(friendListAtom);

  const isPrivacy = (data) => {
    if (data.sc_profile_photo === 'public' || (data.sc_profile_photo === 'friends' && addedMeList?.includes(data.id))) {
      return false;
    } else {
      return true;
    }
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        await blockMutate();
      })();
    }, [blockMutate]),
  );

  return (
    <MainLayout>
      <BackHeader title={t('privacy.Blocked users')} />
      <Column style={{ alignItems: 'center', padding: 20 }}>
        <Button
          label={t('privacy.Block user')}
          onPress={() => navigation.navigate('/more/settings/privacy-and-security/bolcked-users/add-blocked-user')}
          height={52}
          width={'100%'}
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
      <SwrContainer data={blockData} error={blockError}>
        {blockData &&
          (blockData.blocklist.length !== 0 ? (
            <ContactContainer>
              {blockData?.blocklist.map((user, index) => (
                <Row key={index} style={{ alignItems: 'center', marginBottom: 20 }}>
                  <Avatar size={40} src={isPrivacy(user.target) ? '' : user.target.profile_image} />
                  <Space width={10} />
                  <Column style={{ flex: 1 }}>
                    <NameText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                      {user.target.first_name} {user.target.last_name}
                    </NameText>
                    <IDText
                      style={{ fontSize: myUser?.setting?.ct_text_size as number }}
                    >{`@${user.target.uid}`}</IDText>
                  </Column>
                  <Button
                    label={t('privacy.Unblock')}
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
                      remove(`/auth/block/${user.target.id}`).then(async () => {
                        await blockMutate();
                      });
                    }}
                  />
                </Row>
              ))}
            </ContactContainer>
          ) : (
            <ScrollView>
              <Space height={70} />
              <Center>
                <Icon source={require('../../../../assets/ic-nocontract.png')} />
                <DescText style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                  {t('privacy.No users have been blocked')}
                </DescText>
              </Center>
              <Space height={70} />
              <View style={{ padding: 20 }}>
                <BlockTextBox>
                  <BlockLabel style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                    {t('privacy.The blocked friend infomation')}
                  </BlockLabel>
                  <BlockDescription style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                    {t('privacy.1) It does not appear in the friend list')}
                    {t('privacy.2) Blocked users cannot search for you or add you as friends')}
                    {t('privacy.3) It does not appear in my SNS posts and comments')}
                  </BlockDescription>
                </BlockTextBox>
                <Description style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                  {t('privacy.However, you can be invited to group chat, group voice chat, and group video chat')}
                  {t('privacy.At this time, the blocked friends mark is only shown to you')}
                </Description>
              </View>
            </ScrollView>
          ))}
      </SwrContainer>
    </MainLayout>
  );
}

export default BlockedUsers;
