import React, { useMemo } from 'react';
import Screen from '../../components/containers/Screen';
import { Alert, Platform, Pressable, ScrollView, Text } from 'react-native';
import tw from 'twrnc';
import BackHeader from '../../components/molecules/BackHeader';
import { useRoute } from '@react-navigation/native';
import Room from '../../types/chats/rooms/Room';
import useFetch from '../../net/useFetch';
import SwrContainer from '../../components/containers/SwrContainer';
import styled from 'styled-components/native';
import { COLOR } from 'constants/COLOR';
import LogUtil from '../../utils/LogUtil';
import { t } from 'i18next';
import RNFetchBlob from 'rn-fetch-blob';
import Toast from 'react-native-toast-message';
import FileViewer from 'react-native-file-viewer';

const FileName = styled(Text)`
  color: ${({ theme }) => (theme.dark ? COLOR.WHITE : COLOR.BLACK)};
`;

function Files() {
  const route = useRoute();
  // @ts-ignore
  const room: Room = route.params?.room;
  const { data, error } = useFetch(`/chats/rooms/${room._id}/media?type=file`);
  const files = useMemo(() => {
    if (!data) return [];
    return data.map((item) => item.content).flat();
  }, [data]);
  const dirs = RNFetchBlob.fs.dirs;

  LogUtil.info('filedata', data);
  let toastType = 'success';

  return (
    <Screen>
      <BackHeader title={t('chat-room.Files')} />
      <ScrollView style={tw`flex-1`}>
        <SwrContainer data={data} error={error}>
          {data &&
            files.map((item, index) => (
              <Pressable
                style={tw`p-4 border-b border-gray-300`}
                onPress={async () => {
                  console.log(data[index].url);
                  try {
                    await RNFetchBlob.config({
                      fileCache: true,
                      path: Platform.OS === 'ios' ? dirs.DocumentDir + `/${item}` : dirs.DownloadDir + `/${item}`,
                      addAndroidDownloads: {
                        useDownloadManager: true,
                        notification: true,
                        path: `${RNFetchBlob.fs.dirs.DownloadDir}/${item}`,
                      },
                    })
                      .fetch('GET', encodeURI(data[index].url[0]))
                      .then((res) => {
                        console.log('the file saved to ', res.path());
                        // //@ts-ignore
                        // Linking.openUrl(res.path())
                        // if (Platform.OS === 'ios') {
                        //   RNFetchBlob.ios.previewDocument(res.path());
                        // }
                        const path = FileViewer.open(res.path()) // absolute-path-to-my-local-file.
                          .then(() => {
                            // success
                            console.log('success');
                          })
                          .catch((error) => {
                            // error
                          });
                      });
                  } catch (error) {
                    toastType = 'error';
                    //@ts-ignore
                    Alert.alert('error', error.response);
                  }
                  Platform.OS === 'android' &&
                    Toast.show({
                      type: toastType,
                      text1:
                        toastType === 'success' ? t('chat-room.FileDownloaded') : t('chat-room.FileDownloadFailed'),
                    });
                }}
              >
                <FileName>{item}</FileName>
              </Pressable>
            ))}
          {/*TODO: 목록이 비었을 때에 대한 처리 필요*/}
        </SwrContainer>
      </ScrollView>
    </Screen>
  );
}

export default Files;
