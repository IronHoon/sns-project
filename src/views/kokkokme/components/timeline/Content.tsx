import React, { useCallback, useContext, useState } from 'react';
import { Button, Dimensions, Image, Linking, Pressable, Text, TouchableOpacity, View } from 'react-native';
import uuid from 'react-native-uuid';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import styled, { ThemeContext } from 'styled-components';

import { COLOR } from 'constants/COLOR';
import { MainNavigationProp } from 'navigations/MainNavigator';
import LogUtil from '../../../../utils/LogUtil';
import { LinkPreview } from '@flyerhq/react-native-link-preview';
import Padding from 'components/containers/Padding';
import { Hyperlink } from 'react-native-hyperlink';
import ChatWebView from '../../../chats/components/chatbubble/ChatWebView';
import { WIDTH } from 'constants/WIDTH';
import Space from '../../../../components/utils/Space';
import User from 'types/auth/User';

interface TextStyle {
  highlight?: boolean;
  isShared?: boolean;
  dark?: boolean;
}

const Container = styled(Pressable)`
  margin: 10px 0;
  width: 100%;
  max-width: 100%;
`;

const HashTag = styled(Text)<TextStyle>`
  background: ${({ highlight }) => (highlight ? COLOR.BLACK : 'transparent')};
  color: ${({ highlight }) => (highlight ? COLOR.WHITE : COLOR.BLUE)};
  font-size: ${({ isShared }) => (isShared ? 13 : 15)}px;
`;
const Word = styled(Text)<TextStyle>`
  max-width: ${Dimensions.get('window').width * 0.89}px;
  background: ${({ highlight }) => (highlight ? COLOR.BLACK : 'transparent')};
  color: ${({ highlight, dark }) => (highlight ? COLOR.WHITE : dark ? COLOR.LIGHT_GRAY : COLOR.TEXT_GRAY)};
  font-size: ${({ isShared }) => (isShared ? 13 : 15)}px;
  word-break: break-all;
`;
const More = styled(Text)`
  color: ${COLOR.PRIMARY};
  font-size: 15px;
  text-align: right;
  width: 100%;
`;

const LinkContainer = styled(View)<{ previewData: any }>`
  width: ${(props) => (props.previewData ? Dimensions.get('window').width * 0.89 + 2 : '0')};
  height: ${(props) => (props.previewData ? '250px' : '0')};
  border-radius: 10px;
  background-color: white;
  border-color: #eeeeee;
  border-width: 1px;
  margin: ${(props) => (props.previewData ? '7px  0' : '0')};
`;

const Thumbnail = styled(Image)<{ source?: { uri?: string } }>`
  width: ${Dimensions.get('window').width * 0.89}px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  height: ${(props) => (props.source.uri ? '180px' : '0')};
  object-fit: contain;
`;

const Title = styled(Text)`
  width: ${Dimensions.get('window').width * 0.89}px;
  color: ${COLOR.BLACK};
  font-size: 14px;
  font-weight: 500;
  margin: 3px 0 1px 0;
  padding: 3px 10px;
`;

const Desc = styled(Text)`
  width: ${Dimensions.get('window').width * 0.89}px;
  font-size: 12px;
  font-weight: 500;
  padding: 0 10px;
  color: ${COLOR.TEXT_GRAY};
`;
interface Props {
  content: string;
  myUser: User;
  isDetail?: boolean;
  isShared?: boolean;
  searchValue?: string;
  onPress?: () => void;
  media: boolean;
  setIsUrl?: any;
  setIsVisible?: any;
}

const Content = ({
  myUser,
  content,
  isDetail,
  media,
  isShared,
  searchValue = '',
  onPress,
  setIsUrl,
  setIsVisible,
}: Props) => {
  const navigation = useNavigation<MainNavigationProp>();

  const [show, setShow] = useState<boolean>(false);
  const [contentArr, setContentArr] = useState<string[]>(['']);
  const [hashCount, setHashCount] = useState<number>(0);
  const [onlyHash, setOnlyHash] = useState<boolean>(false);
  const theme = useContext(ThemeContext);

  const windowWidth = Math.floor(Dimensions.get('window').width);
  // const [isUrl, setIsUrl] = useState('');
  // const [isVisible, setIsVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const regExp = /(#[^\s!@#$%^&*()=+.\/,\[{\]};:'"?><]+)/g;
      const tempArr = content.split(regExp);
      const arrLength = tempArr.length;

      // if (!tempArr[0].length && !tempArr[arrLength - 1].length) {
      //   setContentArr(tempArr.filter((x) => x.length));
      //   console.log(contentArr);
      // } else if (!tempArr[arrLength - 1].length) {
      //   setContentArr(tempArr.splice(0, 1));
      //     console.log(contentArr);
      // } else if (!tempArr[0].length) {
      //   setContentArr(tempArr.splice(arrLength - 1, 1));
      //     console.log(contentArr);
      // } else setContentArr(tempArr);
      setContentArr(tempArr);
      setHashCount(content.match(regExp)?.length || 0);
    }, [content]),
  );

  LogUtil.info('theme', theme.dark);
  useFocusEffect(
    useCallback(() => {
      if (contentArr.length === hashCount) setOnlyHash(true);
    }, [contentArr, hashCount]),
  );

  useFocusEffect(
    useCallback(() => {
      if (content?.length > 139 && !isDetail) {
        setShow(true);
      }
    }, [content, isDetail]),
  );

  const showHashTagSearchResult = (word: string) => {
    navigation.navigate('/kokkokme/kokkokme-search/hash', {
      hash: word,
    });
  };

  const handlePressHash = (word: string) => {
    return showHashTagSearchResult(word);
  };
  console.log('widddddth', windowWidth);
  return (
    // TODO: 검색 결과 강조 효과 적용 필요
    <Container disabled={isDetail} onPress={onPress}>
      <Text numberOfLines={isDetail ? undefined : 3}>
        {contentArr.map((word, i) =>
          word.includes('#') ? (
            <HashTag
              key={uuid.v4().toString()}
              highlight={!!searchValue?.length && word.includes(searchValue.toLowerCase())}
              isShared={isShared}
              onPress={() => {
                handlePressHash(word);
              }}
            >
              {word}
            </HashTag>
          ) : (
            <Hyperlink
              key={uuid.v4().toString()}
              linkStyle={{ color: COLOR.BLUE }}
              onPress={(url) => {
                Linking.openURL(url);
              }}
            >
              <Word
                numberOfLines={isDetail ? undefined : 3}
                key={uuid.v4().toString()}
                highlight={!!searchValue.length && word.includes(searchValue?.toLowerCase())}
                dark={theme.dark}
                style={{ fontSize: myUser?.setting?.ct_text_size as number }}
              >
                {word}
              </Word>
            </Hyperlink>
          ),
        )}
      </Text>
      {show && <More>more</More>}

      {!media && (
        <>
          <LinkPreview
            text={content}
            containerStyle={{ alignItems: 'center' }}
            renderText={(text) => <View style={{ width: Dimensions.get('window').width * 0.45, height: 150 }}></View>}
            renderLinkPreview={({ aspectRatio, containerWidth, previewData }) => {
              return (
                <LinkContainer previewData={!!previewData?.link}>
                  {previewData?.link && (
                    <>
                      <View
                        style={{
                          width: Dimensions.get('window').width * 0.89,
                          height: 181,
                          borderBottomWidth: 1,
                          backgroundColor: '#eeeeee',
                          borderColor: '#eeeeee',
                          borderTopLeftRadius: 10,
                          borderTopRightRadius: 10,
                        }}
                      >
                        {previewData?.image?.url && <Thumbnail source={{ uri: previewData?.image?.url }} />}
                      </View>
                      <View>
                        <Title numberOfLines={1}>{previewData?.title ?? previewData.link}</Title>
                        <Desc ellipsizeMode="tail" numberOfLines={1}>
                          {previewData.description ?? 'Click here to go to the link'}
                        </Desc>
                        <Space height={5} />
                        <Desc ellipsizeMode="tail" numberOfLines={1}>
                          {previewData.link}
                        </Desc>
                      </View>
                    </>
                  )}
                </LinkContainer>
              );
            }}
          />
        </>
      )}
    </Container>
  );
};

export default Content;
