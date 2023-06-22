import { useNavigation } from '@react-navigation/native';
import MainLayout from 'components/layouts/MainLayout';
import { COLOR } from 'constants/COLOR';
import { MainNavigationProp } from 'navigations/MainNavigator';
import React from 'react';
import { Dimensions, ScrollView, Share, Text } from 'react-native';
import styled from 'styled-components/native';
import MetaInfoButtons from './components/list/MetaInfoButtons';
import UserListItem from './components/list/UserListItem';
import LinearGradient from 'react-native-linear-gradient';

import ReportIcon from 'assets/report-12.svg';
import Images from 'views/kokkokme/components/timeline/Images';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const ItemImageWrap = styled.View`
  height: 375px;
  background-color: #eee;
  position: relative;
`;
const HeaderContainer = styled.View`
  padding: 20px;
  justify-content: space-between;
  flex-direction: row;
  position: absolute;
  width: 100%;
  z-index: 1;
`;
const HeaderWrap = styled.View`
  height: 72px;
`;
const ImagesWrap = styled.View`
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
`;
const HeaderButton = styled.Pressable``;
const IconImage = styled.Image`
  width: 16px;
  height: 16px;
  tint-color: #fff;
`;
const UserButton = styled.Pressable`
  padding: 15px;
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY};
`;
const ItemInfoWrap = styled.View`
  width: 100%;
  padding: 20px;
`;
const ItemTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
  margin-bottom: 9px;
`;
const TagWrap = styled.View`
  flex-direction: row;
`;
const Tag = styled.Pressable<{ noMargin?: boolean; primary?: boolean }>`
  ${({ primary }) => (primary ? `border: 1px solid ${COLOR.PRIMARY};` : `border: 1px solid #bbb;`)}
  border-radius: 10px;
  ${({ noMargin }) => (noMargin ? `margin-right: 0 ` : `margin-left: 5px`)};
  padding: 2px 7px;
  justify-content: center;
  align-items: center;
  height: 20px;
`;
const Name = styled.Text<{ primary?: boolean }>`
  ${({ primary }) => (primary ? `color: ${COLOR.PRIMARY};` : `color: #bbb;`)}
  font-size: 11px;
  font-weight: normal;
`;

const Info = styled.Text`
  margin-top: 20px;
  font-size: 13px;
  font-weight: normal;
  line-height: 20px;
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;
const IconWrap = styled.View`
  padding-top: 10px;
  padding-bottom: 20px;
  border-bottom-width: 1px;
  border-bottom-color: #ededed;
  margin-bottom: 10px;
`;

const ReportButton = styled.Pressable`
  flex-direction: row;
`;
const ButtonText = styled.Text`
  font-size: 13px;
  font-weight: 500;
  color: #bcb3c5;
  padding-left: 5px;
  transform: translateY(-1px);
`;
const ItemListWrap = styled.View`
  padding: 50px 20px 20px 20px;
`;
const ListTitleWrap = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
`;
const ListTitle = styled.Text`
  font-size: 16px;
  color: ${COLOR.BLACK};
`;
const ListButton = styled.Pressable``;
const ListButtonText = styled.Text`
  font-size: 13px;
  font-weight: normal;
  color: #999;
`;
const ItemList = styled.View`
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: space-between;
`;
const RowItem = styled.View``;
const RowItemTitle = styled.Text`
  font-size: 15px;
  font-weight: 500;
  color: ${COLOR.BLACK};
`;
const ItemImage = styled.Image`
  border: 1px solid ${COLOR.GRAY};
  width: ${SCREEN_WIDTH / 2 - 26}px;
  height: 162px;
  border-radius: 4px;
`;
const PriceText = styled.Text`
  font-size: 13px;
  font-weight: normal;
  color: #999;
`;
const StickyBottom = styled.View`
  width: 100%;
  height: 80px;
  background-color: ${({ theme }) => theme.colors.background};
  box-shadow: 0px -4px 6px #6a6a6a18;
`;
const ItemDetail = () => {
  const navigation = useNavigation<MainNavigationProp>();
  const appLink = 'https://www.grotesq.com/';
  // TODO: 실제 앱스토어 링크로 교체 필요
  // TODO: api 연결후 삭제
  const media = [
    {
      url: 'https://s3.ap-northeast-2.amazonaws.com/kokkok/file%3A%2F%2F%2FUsers%2Fyujun.ko%2FLibrary%2FDeveloper%2FCoreSimulator%2FDevices%2F7F0B2734-DF04-49F8-B33D-1BB7E516F056%2Fdata%2FContainers%2FData%2FApplication%2F494977F3-D435-4092-855B-BAE0D5D0BB70%2FLibrary%2FCaches%2FReactNative_cropped_image_%2F3E8FF95E-9584-4400-9D4D-531B45E40DD6.jpg',
      type: 'image',
    },
    {
      url: 'https://s3.ap-northeast-2.amazonaws.com/kokkok/file%3A%2F%2F%2FUsers%2Fyujun.ko%2FLibrary%2FDeveloper%2FCoreSimulator%2FDevices%2F7F0B2734-DF04-49F8-B33D-1BB7E516F056%2Fdata%2FContainers%2FData%2FApplication%2F494977F3-D435-4092-855B-BAE0D5D0BB70%2FLibrary%2FCaches%2FReactNative_cropped_image_%2F618C2935-AF25-4F1E-A713-BDC76A6CE211.jpg',
      type: 'image',
    },
  ];

  return (
    <MainLayout>
      <ScrollView style={{ flex: 1 }}>
        <ItemImageWrap>
          <HeaderWrap>
            <LinearGradient
              colors={['#00000090', 'transparent']}
              style={{
                flex: 1,
              }}
            >
              <HeaderContainer>
                <HeaderButton onPress={() => navigation.goBack()}>
                  <IconImage source={require('assets/ic-back.png')} />
                </HeaderButton>
                <HeaderButton
                  onPress={() => {
                    Share.share({
                      message: appLink,
                    });
                  }}
                >
                  <IconImage source={require('assets/ic-itemshare-16.png')} />
                </HeaderButton>
              </HeaderContainer>
            </LinearGradient>
          </HeaderWrap>
          <ImagesWrap>
            <Images media={media} imagesWrap />
          </ImagesWrap>
        </ItemImageWrap>

        <UserButton onPress={() => navigation.navigate('/market/item/seller-profile')}>
          <UserListItem iconSize={40} leftLocation />
        </UserButton>

        <ItemInfoWrap>
          <ItemTitle>Title Lorem IpsumTitle Lorem</ItemTitle>

          <TagWrap>
            <Tag noMargin primary>
              <Name primary>Category</Name>
            </Tag>
            <Tag>
              <Name>Category</Name>
            </Tag>
          </TagWrap>

          <Info>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque viverra lorem libero, vitae semper justo
            congue ac. Phasellus et congue augue.
          </Info>
          <IconWrap>
            <MetaInfoButtons itemDetail likes={0} comments={0} view={1000} />
          </IconWrap>

          <ReportButton onPress={() => {}}>
            <ReportIcon />
            <ButtonText>Report this post</ButtonText>
          </ReportButton>
        </ItemInfoWrap>
        <ItemListWrap>
          <ListTitleWrap>
            <ListTitle>
              <Text style={{ fontWeight: 'bold' }}>Ann Hwang</Text>’s items
            </ListTitle>
            <ListButton>
              <ListButtonText>view all</ListButtonText>
            </ListButton>
          </ListTitleWrap>

          <ItemList>
            <RowItem>
              <ItemImage source={require('assets/ic-no-result.svg')} />
              <RowItemTitle>title</RowItemTitle>
              <PriceText>₭38000 LAK</PriceText>
            </RowItem>
            {/* <RowItem>
              <ItemImage source={require('assets/ic-no-result.svg')} />
            </RowItem> */}
          </ItemList>
        </ItemListWrap>
      </ScrollView>
      <StickyBottom></StickyBottom>
    </MainLayout>
  );
};

export default ItemDetail;
