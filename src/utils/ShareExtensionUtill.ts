import { t } from 'i18next';
import { RootNatigation } from 'navigations/RootNavigation';
import { useCallback, useEffect } from 'react';

import ShareMenu from 'react-native-share-menu';
import ChatDataUtil from './chats/ChatDataUtil';
import { uploadS3ByFilePath } from '../lib/uploadS3';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';

type SharedItem = {
  mimeType: string;
  data: string;
  extraData: any;
};

export const useEffectShareExtension = () => {
  const handleShare = useCallback(async (item: SharedItem | null | undefined) => {
    if (!item) {
      return;
    }

    if (item.data) {
      const { mimeType, data } = Platform.OS === 'android' ? item : item.extraData;

      let shareMessage;

      if (mimeType.startsWith('image/')) {
        try {
          const mediaRes = await uploadS3ByFilePath(data, mimeType);
          if (mediaRes) {
            shareMessage = ChatDataUtil.newMessage({
              type: 'image',
              text: `[${t('chats-main.Image')}]`,
              uploadPathList: [mediaRes.url],
              uploadSizeList: [mediaRes.size ?? 0],
            });
          }
        } catch (error) {
          console.warn(error);
        }
      } else if (mimeType.startsWith('text/')) {
        if (data.startsWith('file://')) {
          try {
            const mediaRes = await uploadS3ByFilePath(data, mimeType);
            if (mediaRes) {
              const stat = await RNFS.stat(data);
              shareMessage = ChatDataUtil.newMessage({
                type: 'file',
                text: mediaRes.name,
                uploadPathList: [mediaRes.url],
                uploadSizeList: [stat.size ?? 0],
              });
            }
          } catch (error) {
            console.warn(error);
          }
        } else {
          shareMessage = ChatDataUtil.newMessage({
            text: data,
            type: 'chat',
          });
        }
      } else if (mimeType.startsWith('application/')) {
        try {
          const mediaRes = await uploadS3ByFilePath(data, mimeType);
          if (mediaRes) {
            const dirs = RNFetchBlob.fs.dirs;
            let fileName;
            if (mimeType.includes('pdf')) {
              fileName = 'temp.pdf';
            }
            if (mimeType.includes('zip')) {
              fileName = 'temp.zip';
            }
            const filePath =
              Platform.OS === 'ios' ? dirs.DocumentDir + `/${fileName}` : dirs.DownloadDir + `/${fileName}`;

            await RNFetchBlob.config({
              fileCache: true,
              path: filePath,
              addAndroidDownloads: {
                useDownloadManager: true,
                notification: false,
                path: `${dirs.DownloadDir}/${fileName}`,
              },
            })
              .fetch('GET', encodeURI(mediaRes.url))
              .then(async (res) => {
                const stat = await RNFS.stat(res.path());
                shareMessage = ChatDataUtil.newMessage({
                  type: 'file',
                  text: mediaRes.name,
                  uploadPathList: [mediaRes.url],
                  uploadSizeList: [stat.size ?? 0],
                });
                RNFS.unlink(filePath);
              });
          }
        } catch (error) {
          console.warn(error);
        }
      }
      // else if(mimeType.startsWith('video/')) {
      //   try {
      //     const mediaRes = await uploadS3ByFilePath(data, mimeType);
      //     if(mediaRes) {
      //       const imageResponse = await createThumbnail({
      //         url: mediaRes.url,
      //         timeStamp: 10000,
      //       });
      //       const thumbnailRes = await uploadS3ByFilePath(imageResponse.path, imageResponse.mime);

      //       shareMessage = ChatDataUtil.newMessage({
      //       type: 'video',
      //       text: `[${t('chats-main.Video')}]`,
      //       uploadPathList: [mediaRes.url, thumbnailRes?.url ?? ''],
      //       uploadSizeList: [mediaRes.size ?? 0, imageResponse?.size ?? 0],
      //       })
      //     }
      //   } catch (error) {
      //     console.warn(error);
      //   }
      // }

      RootNatigation.navigate('/chats/chat-room/share-chat', {
        chatRoomType: 'chat',
        chatList: [shareMessage],
        shareEx: true,
        // room: roomState,
      });
    }
  }, []);

  useEffect(() => {
    ShareMenu.getInitialShare(handleShare);
  }, []);

  useEffect(() => {
    const listener = ShareMenu.addNewShareListener(handleShare);

    return () => {
      listener.remove();
    };
  }, []);
};
