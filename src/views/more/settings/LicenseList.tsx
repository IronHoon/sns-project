import React, { useState } from 'react';
import { FlatList, Image, Modal, Pressable, SafeAreaView, Text, View } from 'react-native';
import BackHeader from '../../../components/molecules/BackHeader';
import styled from 'styled-components';
import { COLOR } from '../../../constants/COLOR';
import CloseHeader from '../../../components/molecules/CloseHeader';
import { OpenSourceLicense } from '../../../data/OpenSourceLicense';
import Space from '../../../components/utils/Space';
import User from 'types/auth/User';
import { useAtomValue } from 'jotai';
import userAtom from 'stores/userAtom';
import { ScrollView } from 'react-native-gesture-handler';
import { WIDTH } from 'constants/WIDTH';

const NavContainer = styled(View)`
  /* height: 50px; */
  width: ${WIDTH};
  justify-content: space-between;
  border-bottom-color: ${COLOR.GRAY};
  border-bottom-width: 1px;
  padding-left: 10px;
  padding-right: 5px;
  flex-direction: row;
  align-items: center;
  padding: 10px;
`;

const TextContainer = styled(View)`
  /* flex: 1; */
  padding-top: 10px;
  padding-left: 20px;
  padding-right: 10px;
`;

const ListContainer = styled(View)`
  flex: 1;
  padding-top: 10px;
  padding-left: 10px;
  padding-right: 10px;
`;
const ListTitle = styled(Text)`
  font-size: 20px;
`;

const Icon = styled(Image)`
  width: 22px;
  height: 22px;
`;

// <>
//     <ListContainer>
//         <ListTitle>{item.libraryName}</ListTitle>
//         <Text>{item.version}</Text>
//         <Text>{item._license}</Text>
//         <Text>{item._description}</Text>
//         <Text>{item._licenseContent}</Text>
//     </ListContainer>
// </>

const LicenseList = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [license, setLicense] = useState();
  const myUser: User | null = useAtomValue(userAtom);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <BackHeader title={'Licenses'} />
      <FlatList
        data={OpenSourceLicense}
        renderItem={(item) => {
          return (
            <Pressable
              onPress={() => {
                setIsVisible(true);
                console.log('item.item', item.item);
                //@ts-ignore
                setLicense(item.item);
              }}
            >
              <NavContainer>
                <Text
                  numberOfLines={3}
                  style={{ width: WIDTH - 40, fontSize: myUser?.setting?.ct_text_size as number, color: 'black' }}
                >
                  {item.item.libraryName}
                </Text>
                <Icon source={require('assets/ic-next.png')} />
              </NavContainer>
            </Pressable>
          );
        }}
      />
      <Modal style={{ flex: 1 }} visible={isVisible}>
        <SafeAreaView style={{ flex: 1 }}>
          <CloseHeader
            onClick={() => {
              setIsVisible(false);
            }}
          />
          <ScrollView>
            <TextContainer>
              <ListTitle style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                {
                  //@ts-ignore
                  license?.libraryName
                }
              </ListTitle>
              <Space height={10} />
              <Text style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                {
                  //@ts-ignore
                  'Version : ' + license?.version
                }
              </Text>
              <Space height={10} />
              <Text style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                {
                  //@ts-ignore
                  'license : ' + license?._license
                }
              </Text>
              <Space height={10} />
              <Text style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                {
                  //@ts-ignore
                  license?._description
                }
              </Text>
              <Space height={10} />
              <Text style={{ fontSize: myUser?.setting?.ct_text_size as number }}>
                {
                  //@ts-ignore
                  license?._licenseContent
                }
              </Text>
            </TextContainer>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default LicenseList;
